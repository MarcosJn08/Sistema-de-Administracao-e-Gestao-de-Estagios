import DocumentosEstagio from '../components/documento/DocumentosEstagio.jsx';
import { useEffect, useState, useMemo } from 'react';
import { Alert, Modal, Row, Col } from 'react-bootstrap';
import {
  AlertCircle,
  CalendarClock,
  Search,
  ChevronDown,
  CheckCircle2,
  Eye,
  Hourglass,
} from 'lucide-react';
import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';
import Botao from "../components/Button/Button.jsx";
import CardMetricaEmpresa from '../components/empresa/CardMetricaEmpresa.jsx';
import SecaoFrequenciasMensais from '../components/frequencia/SecaoFrequenciasMensais.jsx';
import useAuth from '../hooks/useAuth.js';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../services/api.js';
import Paginacao from '../components/Paginacao.jsx';
import './MeusEstagiarios.css';

const estados = { RASCUNHO: 'Rascunho', EM_ANALISE: 'Em análise', EM_ANDAMENTO: 'Em andamento', CONCLUIDO: 'Concluído', ENCERRADO: 'Encerrado', CANCELADO_DESVIO_FUNCAO: 'Cancelado por desvio de função' };
const data = (valor) => valor ? new Intl.DateTimeFormat('pt-BR', { timeZone: 'UTC' }).format(new Date(`${valor}T00:00:00Z`)) : 'Não informado';

const adaptar = c => ({
  id: c.id, nome: c.aluno.nome || 'Não informado', cargo: c.cargo || 'Estágio', curso: c.curso?.nome || 'Não informado',
  status: c.status === 'EM_ANDAMENTO' ? 'Ativo' : ['RASCUNHO', 'EM_ANALISE'].includes(c.status) ? 'Em Integração' : estados[c.status],
  inicio: data(c.data_inicio), termino: data(c.data_termino), dataTermino: c.data_termino,
  documentos: c.documentos,
});

function MeusEstagiarios() {
  const { user } = useAuth();
  const role = user?.role?.toLowerCase();
  const ehOrientadorOuDiretor = ['professor', 'diretor'].includes(role);
  const [estagiarios, setEstagiarios] = useState([]);
  const [agora] = useState(() => Date.now());

  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [tentativa, setTentativa] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    async function carregar() {
      try {
        const registros = [];
        let pagina = 1;
        let ultima = 1;
        do {
          const { data: resposta } = await api.get('/estagios', { params: { page: pagina, per_page: 100 }, signal: controller.signal });
          registros.push(...resposta.data);
          ultima = resposta.meta.last_page;
          pagina += 1;
        } while (pagina <= ultima);
        if (!controller.signal.aborted) setEstagiarios(registros.map(adaptar));
      } catch (e) {
        if (!controller.signal.aborted) setErro(e.message);
      } finally {
        if (!controller.signal.aborted) setCarregando(false);
      }
    }
    carregar();
    return () => controller.abort();
  }, [tentativa]);
  const [busca, setBusca] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('Ativos');
  const [paginaAtual, setPaginaAtual] = useState(1);
  const navigate = useNavigate();
  const { id: idRota } = useParams();
  const [selecionado, setSelecionado] = useState(null);
  const id = selecionado || idRota;
  const [estado, setEstado] = useState({ carregando: true });
  const [erroDownload, setErroDownload] = useState('');
  useEffect(() => {
    if (!id) return;
    const controller = new AbortController();
    api.get(`/estagios/${id}`, { signal: controller.signal })
      .then(({ data }) => { if (!controller.signal.aborted) setEstado({ id, contrato: data.data }); })
      .catch((e) => { if (!controller.signal.aborted) setEstado({ id, erro: e.status === 404 ? 'Contrato não encontrado.' : e.message }); });
    return () => controller.abort();
  }, [id]);
  async function baixar(documento) {
    setErroDownload('');
    try {
      const { data } = await api.get(`/estagios/${id}/documentos/${documento.id}/download`, { responseType: 'blob' });
      const url = URL.createObjectURL(data);
      const link = document.createElement('a'); link.href = url; link.download = `documento-${documento.id}.pdf`; link.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (e) { setErroDownload(e.message); }
  }

  const itensPorPagina = 10;

  const metricas = useMemo(() => {
    const ativos = estagiarios.filter((e) => e.status === 'Ativo').length;
    const emIntegracao = estagiarios.filter((e) => e.status === 'Em Integração').length;
    const docsPendentes = estagiarios.reduce((acc, curr) => {
      const temPendente = curr.documentos?.some(
        (d) => ['PENDENTE', 'EM_ANALISE', 'NECESSITA_AJUSTES'].includes(d.status)
      );
      return temPendente ? acc + 1 : acc;
    }, 0);
    const proximosVencer = estagiarios.filter(e => e.status === 'Ativo' && new Date(`${e.dataTermino}T23:59:59`) >= new Date(agora) && new Date(`${e.dataTermino}T23:59:59`) <= new Date(agora + 30 * 86400000)).length;

    return {
      ativos,
      emIntegracao,
      docsPendentes,
      proximosVencer,
    };
  }, [estagiarios, agora]);

  const estagiariosFiltrados = useMemo(() => {
    return estagiarios.filter((item) => {
      const matchBusca =
        item.nome.toLowerCase().includes(busca.toLowerCase()) ||
        (item.nomeCompleto && item.nomeCompleto.toLowerCase().includes(busca.toLowerCase())) ||
        item.cargo.toLowerCase().includes(busca.toLowerCase()) ||
        item.curso.toLowerCase().includes(busca.toLowerCase());

      let matchStatus = true;
      if (filtroStatus === 'Ativos') {
        matchStatus = item.status === 'Ativo';
      } else if (filtroStatus === 'Em Integração') {
        matchStatus = item.status === 'Em Integração';
      } else if (filtroStatus === 'Encerrado') {
        matchStatus = item.status === 'Encerrado';
      } else if (filtroStatus === 'Todos') {
        matchStatus = true;
      }

      return matchBusca && matchStatus;
    });
  }, [estagiarios, busca, filtroStatus]);

  const totalPaginas = Math.max(1, Math.ceil(estagiariosFiltrados.length / itensPorPagina));
  const estagiariosPaginados = useMemo(() => {
    const inicio = (paginaAtual - 1) * itensPorPagina;
    return estagiariosFiltrados.slice(inicio, inicio + itensPorPagina);
  }, [estagiariosFiltrados, paginaAtual, itensPorPagina]);

  const abrirDetalhes = (estagiario) => { setEstado({ carregando: true }); setErroDownload(''); setSelecionado(estagiario.id); };
  const respostaAtual = String(estado.id) === String(id);
  const c = respostaAtual ? estado.contrato : null;
  const percentual = c?.meta_horas_tce ? Math.min(100, Number(c.horas_cumpridas) / Number(c.meta_horas_tce) * 100) : 0;

  const linksNavegacaoEmpresa = [
    ['Dashboard', '/sage/empresa'],
    ['Estagiários', '/sage/empresa/estagiarios'],
  ];

  const renderBadgeTabela = (status) => {
    switch (status) {
      case 'Ativo':
        return <span className="badge-tabela-ativo">Ativo</span>;
      case 'Em Integração':
        return <span className="badge-tabela-integracao">Em Integração</span>;
      case 'Encerrado':
        return <span className="badge-tabela-encerrado">Encerrado</span>;
      default:
        return <span className="badge-tabela-ativo">{status}</span>;
    }
  };

  return (
    <div className="meus-estagiarios-wrapper">
      <Header
        paginaAtiva="Estagiários"
        customLinks={linksNavegacaoEmpresa}
      />

      <main className="flex-grow-1">
        <div className="meus-estagiarios-container">
{carregando && <p role="status">Carregando estágios…</p>}
          {erro && <Alert variant="danger">{erro} <button type="button" onClick={() => { setErro(''); setCarregando(true); setTentativa(t => t + 1); }}>Tentar novamente</button></Alert>}
          <div className="meus-estagiarios-header">
            <h1 className="meus-estagiarios-title">Meus Estagiários</h1>
            <p className="meus-estagiarios-subtitle">
              Gerencie os estagiários ativos na sua empresa
            </p>
          </div>

          <Row className="g-4 mb-4">
            <Col xs={12} sm={6} lg={3}>
              <CardMetricaEmpresa
                titulo="Estagiários Ativos"
                valor={metricas.ativos}
                icone={CheckCircle2}
                corIcone="#16a34a"
                corFundoIcone="#e8f7ee"
              />
            </Col>
            <Col xs={12} sm={6} lg={3}>
              <CardMetricaEmpresa
                titulo="Em Integração"
                valor={metricas.emIntegracao}
                icone={Hourglass}
                corIcone="#d97706"
                corFundoIcone="#fef3c7"
              />
            </Col>
            <Col xs={12} sm={6} lg={3}>
              <CardMetricaEmpresa
                titulo="Documentos Pendentes"
                valor={metricas.docsPendentes}
                icone={AlertCircle}
                corIcone="#ea580c"
                corFundoIcone="#fff7ed"
              />
            </Col>
            <Col xs={12} sm={6} lg={3}>
              <CardMetricaEmpresa
                titulo="Próximos a Vencer"
                valor={metricas.proximosVencer}
                icone={CalendarClock}
                corIcone="#dc2626"
                corFundoIcone="#fee2e2"
              />
            </Col>
          </Row>

          <div className="card-tabela-estagiarios">
            <div className="filtro-estagiarios-container">
              <div className="campo-busca-estagiario">
                <Search size={18} className="icone-busca-estagiario" />
                <input
                  type="text"
                  placeholder="Buscar por nome do estagiário..."
                  value={busca}
                  onChange={(e) => {
                    setBusca(e.target.value);
                    setPaginaAtual(1);
                  }}
                  id="input-busca-estagiario"
                />
              </div>

              <div className="select-status-wrapper">
                <select
                  className="select-status-estagiario"
                  value={filtroStatus}
                  onChange={(e) => {
                    setFiltroStatus(e.target.value);
                    setPaginaAtual(1);
                  }}
                  id="select-status-filtro"
                >
                  <option value="Ativos">Status: Ativos</option>
                  <option value="Em Integração">Status: Em Integração</option>
                  <option value="Encerrado">Status: Encerrado</option>
                  <option value="Todos">Status: Todos</option>
                </select>
                <ChevronDown size={16} className="icone-select-estagiario" />
              </div>
            </div>

            <div className="tabela-estagiarios-responsiva">
              <table className="tabela-estagiarios">
                <thead>
                  <tr>
                    <th>Nome</th>
                    <th>Cargo/Vaga</th>
                    <th>Curso</th>
                    <th>Início</th>
                    <th>Término</th>
                    <th>Status</th>
                    <th className="text-center">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {estagiariosPaginados.length > 0 ? (
                    estagiariosPaginados.map((estagiario) => (
                      <tr key={estagiario.id}>
                        <td className="celula-nome-estagiario">{estagiario.nome}</td>
                        <td className="celula-cargo-estagiario">{estagiario.cargo}</td>
                        <td className="celula-curso-estagiario">{estagiario.curso}</td>
                        <td className="celula-data-estagiario">{estagiario.inicio}</td>
                        <td className="celula-data-estagiario">{estagiario.termino}</td>
                        <td>{renderBadgeTabela(estagiario.status)}</td>
                        <td>
                          <div className="d-flex justify-content-center">
                            <Botao
                              tipo="botao-sage-verde"
                              className="gap-2 text-nowrap"
                              onClick={() => abrirDetalhes(estagiario)}
                              aria-label={`Ver detalhes de ${estagiario.nome}`}
                            >
                              <Eye size={16} aria-hidden="true" /> Ver Detalhes
                            </Botao>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="tabela-estagiarios-vazia">
                        {carregando ? 'Carregando…' : erro ? 'Não foi possível carregar os contratos.' : 'Nenhum estagiário encontrado com os filtros aplicados.'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="mt-4">
              <Paginacao
                paginaAtual={paginaAtual}
                totalPaginas={totalPaginas}
                aoMudarPagina={setPaginaAtual}
                textoResumo={`Mostrando ${estagiariosPaginados.length} de ${estagiariosFiltrados.length} estagiários cadastrados`}
              />
            </div>
          </div>
        </div>
      </main>

      <Modal show={Boolean(id)} size="lg" onHide={() => { setSelecionado(null); if (idRota) navigate('/sage/empresa/estagiarios'); }}>
        <Modal.Header closeButton><Modal.Title>Contrato do estagiário</Modal.Title></Modal.Header>
        <Modal.Body>
          {(!respostaAtual || estado.carregando) && <p role="status">Carregando contrato…</p>}
          {respostaAtual && estado.erro && <Alert variant="danger">{estado.erro}</Alert>}
          {c && <>
    <h2>{c.cargo || 'Contrato de estágio'}</h2><p>{estados[c.status] || c.status}</p>
    <dl className="row">
      {Object.entries({ Aluno: c.aluno.nome, Matrícula: c.aluno.matricula, Curso: c.curso?.nome,
        Empresa: c.empresa.razao_social, CNPJ: c.empresa.cnpj, Supervisor: c.supervisor.nome,
        Orientador: c.orientador.nome, Início: data(c.data_inicio), Término: data(c.data_termino),
        Modalidade: c.modalidade, 'Horas por semana': c.carga_horaria_semanal,
        'Teto de horas do TCE': c.meta_horas_tce, 'Horas assinadas': c.horas_cumpridas,
        'Horas restantes do TCE': c.horas_restantes_tce, 'Apólice de seguro': c.apolice?.numero_apolice,
        Seguradora: c.apolice?.nome_seguradora,
      }).map(([nome, valor]) => <div className="col-md-6 mb-3" key={nome}><dt>{nome}</dt><dd>{valor ?? 'Não informado'}</dd></div>)}
    </dl>
    {c.meta_horas_tce && <><label htmlFor={`progresso-${id}`}>Progresso do TCE: {percentual.toFixed(1)}%</label><progress className="w-100" id={`progresso-${id}`} max="100" value={percentual} /></>}
    <h3 className="mt-4">Plano de atividades</h3>
    {c.plano ? <><p>{c.plano.objetivos}</p><p style={{ whiteSpace: 'pre-wrap' }}>{c.plano.atividades_previstas}</p><p>{c.plano.cronograma}</p></> : <p>Plano ainda não cadastrado.</p>}
    {c.encerrado_em && <p>Encerrado em {new Date(c.encerrado_em).toLocaleString('pt-BR')}: {c.motivo_encerramento}</p>}
    <h3>Documentos</h3>{erroDownload && <Alert variant="danger">{erroDownload}</Alert>}
    <DocumentosEstagio key={c.id} estagioId={c.id} />
    {c.documentos.length ? <ul>{c.documentos.map((d) => <li key={d.id}>{d.tipo} — {d.status} <button type="button" className="btn btn-link" onClick={() => baixar(d)}>Baixar PDF</button></li>)}</ul> : <p>Nenhum documento cadastrado.</p>}

    <div className="mt-4">
      <SecaoFrequenciasMensais estagioId={c.id} podeAprovar={ehOrientadorOuDiretor} podeEnviar={true} />
    </div>
  </>}
        </Modal.Body>
      </Modal>

      <Footer />
    </div>
  );
}

export default MeusEstagiarios;
