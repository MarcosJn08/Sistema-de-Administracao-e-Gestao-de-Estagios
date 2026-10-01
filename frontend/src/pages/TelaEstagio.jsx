import { ArrowLeft } from 'lucide-react';
import { useState } from 'react';
import { Alert, Col, Container, Row } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';
import Botao from '../components/Button.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import CardDadosEstagio from '../components/Estagio/CardDadosEstagio.jsx';
import CardProgresso from '../components/aluno/CardProgresso.jsx';
import CardDocumentos from '../components/aluno/CardDocumentos.jsx';
import ModalAnaliseDocumento from '../components/documento/ModalAnaliseDocumento.jsx';
import ModalEditarDocumentoAluno from '../components/documento/ModalEditarDocumentoAluno.jsx';
import dados from '../data/aluno.js';
import './EstagiosAluno.css';

const nomeArquivo = (valor) => String(valor).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '_');

const prepararDocumentos = (estagio) => (estagio.documentos || dados.documentos).map((documento) => ({
  ...documento,
  aluno: dados.aluno.nome,
  email: dados.aluno.email,
  matricula: dados.aluno.matricula,
  curso: dados.aluno.curso,
  empresa: estagio.empresa,
  arquivoNome: documento.arquivoNome || `${nomeArquivo(documento.nome)}_${nomeArquivo(dados.aluno.nome)}.pdf`,
  arquivoUrl: documento.arquivoUrl || '/documentos/documento-exemplo.pdf',
  historico: documento.historico || [{
    autor: 'Sistema',
    acao: 'Recebido',
    data: documento.data || 'Não informada',
    observacoes: 'Documento enviado pelo aluno.',
  }],
  acoes: ['Visualizar', 'Editar PDF'],
}));

function TelaEstagio() {
  const navigate = useNavigate();
  const { estagioId } = useParams();
  const estagio = dados.meusEstagios.find((item) => String(item.id) === String(estagioId)) || dados.estagioAtual;
  const [documentos, setDocumentos] = useState(() => prepararDocumentos(estagio));
  const [documentoVisualizadoId, setDocumentoVisualizadoId] = useState(null);
  const [documentoEditadoId, setDocumentoEditadoId] = useState(null);
  const [mensagem, setMensagem] = useState('');
  const documentoVisualizado = documentos.find((documento) => documento.id === documentoVisualizadoId);
  const documentoEditado = documentos.find((documento) => documento.id === documentoEditadoId);

  const lidarComAcaoDocumento = (documento, acao) => {
    if (acao === 'Visualizar') setDocumentoVisualizadoId(documento.id);
    if (acao === 'Editar PDF') setDocumentoEditadoId(documento.id);
  };

  const salvarNovoPdf = (id, arquivo) => {
    const data = new Date().toLocaleDateString('pt-BR');
    setDocumentos((atuais) => atuais.map((documento) => documento.id === id ? {
      ...documento,
      arquivoNome: arquivo.name,
      arquivoUrl: URL.createObjectURL(arquivo),
      data,
      status: 'Em análise',
      historico: [{ autor: dados.aluno.nome, acao: 'Arquivo substituído', data, observacoes: 'Novo PDF enviado para análise.' }, ...documento.historico],
    } : documento));
    setMensagem('PDF substituído com sucesso. O documento foi enviado novamente para análise.');
  };

  return (
    <div className="detalhes-estagio-pagina d-flex flex-column min-vh-100">
      <Header paginaAtiva="Estágios" usuario={dados.aluno} />

      <main className="flex-grow-1 py-4">
        <Container className="px-3 detalhes-estagio-container">
          <div className="detalhes-estagio-cabecalho">
            <div className="detalhes-estagio-titulo">
              <div className="detalhes-estagio-titulo-linha">
                <h1>Detalhes do estágio</h1>
                <StatusBadge status={estagio.status} />
              </div>
              <p>{estagio.cargo} na empresa {estagio.empresa}</p>
            </div>
            <Botao tipo="botao-acao-contorno" onClick={() => navigate('/sage/aluno/estagios')}>
              <ArrowLeft size={16} aria-hidden="true" /> Voltar aos estágios
            </Botao>
          </div>

          <CardDadosEstagio
            empresa={estagio.empresa}
            cnpj={estagio.cnpj}
            cargo={estagio.cargo}
            professorOrientador={estagio.professorOrientador}
            supervisorEstagio={estagio.supervisorEstagio}
            dataInicio={estagio.dataInicio}
            dataFim={estagio.dataFim}
            cargaHorariaSemanal={estagio.cargaHorariaSemanal || estagio.cargaHoraria}
            modalidade={estagio.modalidade}
            seguro={estagio.seguro}
          />

          {mensagem && <Alert variant="success" dismissible onClose={() => setMensagem('')} role="status">{mensagem}</Alert>}

          <Row className="g-4 detalhes-estagio-conteudo">
            <Col xs={12} lg={4}>
              <CardProgresso
                horasConcluidas={estagio.horasConcluidas}
                metaHoras={estagio.metaHoras}
                horasEstagio={estagio.horasEstagio}
                horasProjeto={estagio.horasProjeto}
              />
            </Col>
            <Col xs={12} lg={8}>
              <CardDocumentos titulo="Documentos do estágio" documentos={documentos} exibirData acoesSomenteIcones
                aoClicarAcao={lidarComAcaoDocumento} />
            </Col>
          </Row>
        </Container>
      </main>

      {documentoVisualizado && <ModalAnaliseDocumento key={`visualizar-${documentoVisualizado.id}`} documento={documentoVisualizado}
        visualizacao aoFechar={() => setDocumentoVisualizadoId(null)} aoAvaliar={() => {}} />}
      {documentoEditado && <ModalEditarDocumentoAluno key={`editar-${documentoEditado.id}`} documento={documentoEditado}
        aoFechar={() => setDocumentoEditadoId(null)} aoSalvar={salvarNovoPdf} />}

      <Footer />
    </div>
  );
}

export default TelaEstagio;
