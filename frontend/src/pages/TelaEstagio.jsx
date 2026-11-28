import { ArrowLeft } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Alert, Col, Container, Row } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';
import Button from '../components/Button/Button.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import CardDadosEstagio from '../components/Estagio/CardDadosEstagio.jsx';
import CardProgresso from '../components/aluno/CardProgresso.jsx';
import DocumentosEstagio from '../components/documento/DocumentosEstagio.jsx';
import SecaoFrequenciasMensais from '../components/frequencia/SecaoFrequenciasMensais.jsx';
import useAuth from '../hooks/useAuth.js';
import api from '../services/api.js';
import './EstagiosAluno.css';

const estados = {
  RASCUNHO: 'Rascunho', EM_ANALISE: 'Em análise', EM_ANDAMENTO: 'Em andamento',
  CONCLUIDO: 'Concluído', ENCERRADO: 'Encerrado', CANCELADO_DESVIO_FUNCAO: 'Cancelado por desvio de função',
};
const estadosDocumento = {
  PENDENTE: 'Pendente', EM_ANALISE: 'Em análise', DEFERIDO: 'Deferido',
  NECESSITA_AJUSTES: 'Requer ajuste', EXPIRADO: 'Expirado',
};
const tiposDocumento = {
  TCE: 'Termo de Compromisso de Estágio', PLANO_ATIVIDADES: 'Plano de atividades',
  FICHA_MATRICULA: 'Ficha de matrícula', RELATORIO_PARCIAL: 'Relatório parcial',
  RELATORIO_FINAL: 'Relatório final', FOLHA_FREQUENCIA: 'Folha de frequência',
};
const formatarData = valor => valor
  ? new Intl.DateTimeFormat('pt-BR', { timeZone: 'UTC' }).format(new Date(valor.slice(0, 10) + 'T00:00:00Z'))
  : 'Não informado';

export default function TelaEstagio() {
  const navigate = useNavigate();
  const { estagioId } = useParams();
  const { user } = useAuth();
  const role = user?.role?.toLowerCase();
  const ehOrientadorOuDiretor = ['professor', 'diretor'].includes(role);
  const ehAluno = role === 'aluno' || !role;
  const [estado, setEstado] = useState({ carregando: true });
  const [erroDownload, setErroDownload] = useState('');

  useEffect(() => {
    const controller = new AbortController();
    const carregar = () => api.get(`/estagios/${estagioId}`, { signal: controller.signal })
      .then(({ data }) => {
        if (!controller.signal.aborted) setEstado({ id: estagioId, contrato: data.data });
      })
      .catch(error => {
        if (!controller.signal.aborted) {
          setEstado({ id: estagioId, erro: error.status === 404 ? 'Contrato não encontrado.' : error.message });
        }
      });
    carregar();
    window.addEventListener('focus', carregar);
    return () => { controller.abort(); window.removeEventListener('focus', carregar); };
  }, [estagioId]);

  async function baixarDocumento(documento) {
    setErroDownload('');
    try {
      const { data } = await api.get(`/estagios/${estagioId}/documentos/${documento.id}/download`, { responseType: 'blob' });
      const url = URL.createObjectURL(data);
      const link = document.createElement('a');
      link.href = url;
      link.download = `documento-${documento.id}.pdf`;
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (error) {
      setErroDownload(error.message);
    }
  }

  const respostaAtual = String(estado.id) === String(estagioId);
  const estagio = respostaAtual ? estado.contrato : null;
  const documentos = (estagio?.documentos || []).map(documento => ({
    id: documento.id,
    tipo: documento.tipo,
    nome: tiposDocumento[documento.tipo] || documento.tipo,
    descricao: documento.observacoes || 'Documento vinculado ao contrato de estágio.',
    status: estadosDocumento[documento.status] || documento.status,
    data: formatarData(documento.created_at),
    acoes: ['Baixar PDF'],
  }));

  return (
    <div className="detalhes-estagio-pagina d-flex flex-column min-vh-100">
      <Header paginaAtiva="Estágios" />
      <main className="flex-grow-1 py-4">
        <Container className="px-3 detalhes-estagio-container">
          <div className="detalhes-estagio-cabecalho">
            <div className="detalhes-estagio-titulo">
              <div className="detalhes-estagio-titulo-linha">
                <h1>Detalhes do estágio</h1>
                {estagio && <StatusBadge status={estados[estagio.status] || estagio.status} />}
              </div>
              {estagio && <p>{estagio.cargo || 'Estágio'} na empresa {estagio.empresa.razao_social}</p>}
            </div>
            <Button tipo="botao-acao-contorno" onClick={() => navigate('/sage/aluno/estagios')}>
              <ArrowLeft size={16} aria-hidden="true" /> Voltar aos estágios
            </Button>
          </div>

          {(!respostaAtual || estado.carregando) && <p role="status">Carregando contrato…</p>}
          {respostaAtual && estado.erro && <Alert variant="danger">{estado.erro}</Alert>}
          {estagio && <>
            <CardDadosEstagio
              empresa={estagio.empresa.razao_social}
              cnpj={estagio.empresa.cnpj}
              cargo={estagio.cargo}
              professorOrientador={estagio.orientador.nome}
              supervisorEstagio={estagio.supervisor.nome}
              dataInicio={formatarData(estagio.data_inicio)}
              dataFim={formatarData(estagio.data_termino)}
              cargaHorariaSemanal={estagio.carga_horaria_semanal == null ? null : `${Number(estagio.carga_horaria_semanal)}h/semana`}
              modalidade={estagio.modalidade === 'ORIENTADO' ? 'Orientado' : 'Supervisionado em campo'}
              seguro={estagio.apolice ? `${estagio.apolice.nome_seguradora} — Apólice ${estagio.apolice.numero_apolice}` : null}
            />

            {erroDownload && <Alert variant="danger" dismissible onClose={() => setErroDownload('')}>{erroDownload}</Alert>}
            <Row className="g-4 detalhes-estagio-conteudo">
              <Col xs={12} lg={4}>
                {estagio.meta_horas_tce == null
                  ? <div className="cartao-sage"><h2 className="cartao-sage-titulo">Progresso</h2><p>Teto de horas do TCE ainda não informado.</p><p>Horas concluídas: {estagio.horas_cumpridas}h</p></div>
                  : <CardProgresso
                    horasConcluidas={Number(estagio.horas_cumpridas)}
                    metaHoras={Number(estagio.meta_horas_tce)}
                    horasEstagio={Number(estagio.horas_cumpridas)}
                    horasProjeto={null}
                  />}
              </Col>
              <Col xs={12} lg={8}>
                <DocumentosEstagio key={estagio.id} estagioId={estagio.id} aoBaixarOutro={baixarDocumento}
                  outrosDocumentos={documentos.filter((doc) => !['TCE', 'PLANO_ATIVIDADES', 'AVALIACAO_ALUNO', 'AVALIACAO_EMPRESA'].includes(doc.tipo))} />
              </Col>
            </Row>

            <section className="cartao-sage mt-4">
              <h2 className="cartao-sage-titulo">Plano de atividades</h2>
              {estagio.plano ? <dl>
                <dt>Objetivos</dt><dd>{estagio.plano.objetivos}</dd>
                <dt>Atividades previstas</dt><dd style={{ whiteSpace: 'pre-wrap' }}>{estagio.plano.atividades_previstas}</dd>
                <dt>Cronograma</dt><dd>{estagio.plano.cronograma}</dd>
              </dl> : <p className="text-secondary mb-0">Plano ainda não cadastrado.</p>}
            </section>
            {estagio.encerrado_em && <Alert variant="secondary">
              Encerrado em {new Date(estagio.encerrado_em).toLocaleString('pt-BR')}: {estagio.motivo_encerramento}
            </Alert>}

            <div className="mt-4">
              <SecaoFrequenciasMensais
                estagioId={estagio.id}
                podeAprovar={ehOrientadorOuDiretor}
                podeEnviar={ehAluno || ehOrientadorOuDiretor}
              />
            </div>
          </>}
        </Container>
      </main>
      <Footer />
    </div>
  );
}
