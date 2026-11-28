import React, { useEffect, useState } from 'react';
import { Alert, Container, Row, Col } from 'react-bootstrap';
import { ArrowRight, Check, UserRound } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';
import Button from '../components/Button/Button.jsx';
import CardDadosAluno from '../components/aluno/CardDadosAluno.jsx';
import ListaCandidaturasAluno from '../components/aluno/ListaCandidaturasAluno.jsx';
import useCandidaturasAluno from '../hooks/useCandidaturasAluno.js';
import CardProgresso from '../components/aluno/CardProgresso.jsx';
import CardEstagioAtual from '../components/aluno/CardEstagioAtual.jsx';
import CardEstagio from '../components/Estagio/cardEstagios/CardEstagio.jsx';
import api from '../services/api.js';
import useAuth from '../hooks/useAuth.js';
import { carregarPerfilAluno } from '../utils/candidaturaAluno.js';
import '../App.css';
import './DashboardAluno.css';
import '../components/Estagio/cardEstagios/CardEstagio.css';
import VagasSection from '../components/landing/VagasSection.jsx';
import ModalDetalhesVaga from '../components/vagas/ModalDetalhesVaga.jsx';

function DashboardAluno() {
  const navigate = useNavigate();
  const [vagaSelecionada, setVagaSelecionada] = useState(null);
  const [perfil] = useState(carregarPerfilAluno);
  const candidaturas = useCandidaturasAluno();

  const { user } = useAuth();
  const [contratos, setContratos] = useState([]);
  const [resumo, setResumo] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [checklist, setChecklist] = useState(null);

  useEffect(() => {
    const controller = new AbortController();
    async function carregar() {
      try {
        const { data: conta } = await api.get('/auth/me', { signal: controller.signal });
        const { data: perfilServidor } = await api.get('/aluno/perfil', { signal: controller.signal });
        const registros = [];
        let pagina = 1;
        let ultima = 1;
        do {
          const { data } = await api.get('/estagios', {
            params: { page: pagina, per_page: 100 }, signal: controller.signal,
          });
          registros.push(...data.data);
          ultima = data.meta.last_page;
          pagina += 1;
        } while (pagina <= ultima);
        if (!controller.signal.aborted) {
          setContratos(registros);
          setResumo(conta.data);
          setChecklist(perfilServidor.data.checklist);
          setErro('');
        }
      } catch (error) {
        if (!controller.signal.aborted) setErro(error.message);
      } finally {
        if (!controller.signal.aborted) setCarregando(false);
      }
    }
    carregar();
    window.addEventListener('focus', carregar);
    return () => {
      controller.abort();
      window.removeEventListener('focus', carregar);
    };
  }, [user?.id]);

  const estados = { RASCUNHO: 'Rascunho', EM_ANALISE: 'Em análise', EM_ANDAMENTO: 'Em andamento', CONCLUIDO: 'Concluído', ENCERRADO: 'Encerrado', CANCELADO_DESVIO_FUNCAO: 'Cancelado por desvio de função' };
  const formatarData = valor => valor ? new Intl.DateTimeFormat('pt-BR', { timeZone: 'UTC' }).format(new Date(`${valor}T00:00:00Z`)) : 'Não informado';
  const atual = contratos.find(c => c.status === 'EM_ANDAMENTO');
  const referencia = atual || contratos[0];
  const estagios = contratos.map(c => ({
    id: c.id, empresa: c.empresa.razao_social, cargo: c.cargo || 'Estágio',
    atual: c.status === 'EM_ANDAMENTO', status: estados[c.status] || c.status,
    dataInicio: formatarData(c.data_inicio), dataFim: formatarData(c.data_termino),
    cargaHoraria: c.carga_horaria_semanal == null ? 'Não informada' : `${Number(c.carga_horaria_semanal)}h/semana`,
    progresso: c.meta_horas_tce ? Math.round(Number(c.horas_cumpridas) / Number(c.meta_horas_tce) * 100) : 0,
  }));

  const abrirEstagio = (estagio) => {
    navigate(`/sage/aluno/estagios/${estagio.id}`);
  };

  return (
    <div className="d-flex flex-column min-vh-100" style={{ backgroundColor: '#f4f6f8' }}>
      <Header
        pagina01="Dashboard"
        pagina02="Vagas"
        paginaAtiva="Dashboard"
        usuario={user}
      />

      <main className="flex-grow-1 py-4">
        <Container style={{ maxWidth: '1200px' }} className="px-3">
          <CardDadosAluno
            nome={user?.nome || user?.name || 'Aluno'}
            curso={resumo?.formacao?.curso || user?.formacao?.curso || referencia?.curso?.nome || 'Não informado'}
            email={user?.email}
            matricula={referencia?.aluno?.matricula || user?.matricula || 'Não informada'}
            aoEditarPerfil={() => navigate('/sage/aluno/perfil')}
          />
          {checklist && !checklist.completo && <section className="cartao-sage perfil-checklist mb-4" aria-labelledby="checklist-perfil-titulo">
            <div className="perfil-checklist-topo">
              <div className="perfil-checklist-intro">
                <span className="perfil-checklist-icone"><UserRound size={23} aria-hidden="true" /></span>
                <div><h2 id="checklist-perfil-titulo" className="cartao-sage-titulo">Complete seu perfil</h2>
                  <p>Prepare seu cadastro para as oportunidades de estágio.</p></div>
              </div>
              <div className="perfil-checklist-percentual"><strong>{checklist.percentual}%</strong><span>concluído</span></div>
            </div>
            <div className="perfil-checklist-trilha" role="progressbar" aria-label="Conclusão do perfil" aria-valuenow={checklist.percentual} aria-valuemin={0} aria-valuemax={100}>
              <div style={{ width: `${checklist.percentual}%` }} />
            </div>
            <p className="perfil-checklist-resumo">{checklist.etapas.filter((etapa) => etapa.concluida).length} de {checklist.etapas.length} etapas concluídas</p>
            <ul className="perfil-checklist-etapas">{checklist.etapas.map((etapa, indice) => {
              const titulo = ({ 'dados-complementares': 'Dados para matrícula de estágio', endereco: 'Endereço residencial', 'dados-academicos': 'Dados acadêmicos', 'ficha-matricula': 'Ficha de matrícula' })[etapa.id];
              const conteudo = <><span className="perfil-checklist-numero">{etapa.concluida ? <Check size={17} aria-hidden="true" /> : indice + 1}</span><span className="perfil-checklist-etapa-texto"><strong>{titulo}</strong><span>{etapa.concluida ? 'Concluído' : 'Preencher etapa'}</span></span>{!etapa.concluida && <ArrowRight size={17} aria-hidden="true" />}</>;
              return <li key={etapa.id} className={etapa.concluida ? 'concluida' : ''}>{etapa.concluida ? <div>{conteudo}</div> : <Link to={`/sage/aluno/perfil#${['dados-pessoais', 'dados-academicos'].includes(etapa.id) ? 'dados-complementares' : etapa.id}`}>{conteudo}</Link>}</li>;
            })}</ul>
          </section>}

          {carregando && <p role="status">Carregando estágios…</p>}
          {erro && <Alert variant="danger">{erro}</Alert>}
          {!carregando && !erro && <Row className="g-4 mb-4">
            <Col xs={12} lg={6}>
              {resumo?.progresso?.meta_horas != null ? <>
                <CardProgresso
                  horasConcluidas={Number(resumo.progresso.horas_cumpridas)}
                  metaHoras={Number(resumo.progresso.meta_horas)}
                  horasEstagio={Number(resumo.progresso.horas_cumpridas)}
                  horasProjeto={null}
                />
              </> : <div className="cartao-sage">Carga horária exigida pelo curso ainda não informada.</div>}
            </Col>

            <Col xs={12} lg={6}>
              {atual ? <CardEstagioAtual
                status={estados[atual.status]}
                empresa={atual.empresa.razao_social}
                professorOrientador={atual.orientador.nome}
                supervisorEstagio={atual.supervisor.nome}
                dataInicio={formatarData(atual.data_inicio)}
                dataFim={formatarData(atual.data_termino)}
                cargaHorariaSemanal={atual.carga_horaria_semanal == null ? 'Não informada' : `${Number(atual.carga_horaria_semanal)}h/semana`}
                aoVerHistorico={() => navigate('/sage/aluno/estagios')}
              /> : <div className="cartao-sage h-100"><h2 className="cartao-sage-titulo">Estágio Atual</h2><p>Nenhum estágio em andamento.</p></div>}
            </Col>
          </Row>}

          <section className="dashboard-estagios mb-4" aria-labelledby="titulo-meus-estagios">
            <div className="dashboard-estagios-cabecalho">
              <h2 id="titulo-meus-estagios">Meus Estágios</h2>

              <Button
                tipo="botao-acao-contorno"
                className="gap-2 text-nowrap"
                onClick={() => navigate('/sage/aluno/estagios')}
              >
                Ver todos
                <ArrowRight size={16} aria-hidden="true" />
              </Button>
            </div>

            <div className="dashboard-estagios-grid">
              {estagios.map((estagio) => (
                <CardEstagio
                  key={estagio.id}
                  estagio={estagio}
                  aoVerEstagio={abrirEstagio}
                />
              ))}
            </div>
          </section>
          <section className="cartao-sage" aria-labelledby="titulo-minhas-candidaturas">
            <div className="candidaturas-aluno-topo">
              <div><h2 id="titulo-minhas-candidaturas" className="cartao-sage-titulo mb-1">Minhas candidaturas</h2><p>Suas inscrições mais recentes</p></div>
              <Button tipo="botao-acao-contorno" className="gap-2 text-nowrap" onClick={() => navigate('/sage/aluno/candidaturas')}>
                Ver todas <ArrowRight size={16} aria-hidden="true" />
              </Button>
            </div>
            <ListaCandidaturasAluno candidaturas={candidaturas.slice(0, 3)} />
          </section>
          <VagasSection modoAluno cursoAluno={perfil.formacao.curso} onVerDetalhes={setVagaSelecionada} />
        </Container>
      </main>

      <ModalDetalhesVaga key={vagaSelecionada?.id || 'sem-vaga'} aberto={Boolean(vagaSelecionada)}
        vaga={vagaSelecionada} aoFechar={() => setVagaSelecionada(null)} />

      <Footer />
    </div>
  );
}

export default DashboardAluno;
