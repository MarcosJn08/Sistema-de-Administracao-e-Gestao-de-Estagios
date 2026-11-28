import { useState } from 'react';
import { Alert, Col, Container, Modal, Row, Table } from 'react-bootstrap';
import { AlarmClock, CheckCircle2, Eye, FilePenLine, FileSearch, RotateCcw, Search, TriangleAlert } from 'lucide-react';
import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';
import CardPequeno from '../components/CardPequeno.jsx';
import Input from '../components/Input/Input.jsx';
import Select from '../components/Select.jsx';
import Button from "../components/Button/Button.jsx";
import StatusBadge from '../components/StatusBadge.jsx';
import Paginacao from '../components/Paginacao.jsx';
import DocumentoAluno from '../components/aluno/DocumentoAluno.jsx';
import useDocumentosDiretor from '../hooks/useDocumentosDiretor.js';
import dadosDiretor from '../data/diretor.js';
import '../App.css';
import './PainelDocumentosDiretor.css';

const ITENS_POR_PAGINA = 10;
const normalizar = (valor) => String(valor ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();

export default function PainelDocumentosDiretor() {
  const { documentos, avaliar, erro, carregando } = useDocumentosDiretor();
  const opcoes = (valores) => [...new Set(valores)].sort().map((valor) => ({ valor, rotulo: valor }));
  const [busca, setBusca] = useState('');
  const [status, setStatus] = useState('');
  const [tipo, setTipo] = useState('');
  const [pagina, setPagina] = useState(1);
  const [selecionado, setSelecionado] = useState(null);
  const documentoSelecionado = documentos.find((documento) => documento.id === selecionado);
  const termo = normalizar(busca);
  const filtrados = documentos.filter((documento) => (!status || documento.status === status)
    && (!tipo || documento.nome === tipo)
    && [documento.aluno, documento.nome, documento.matricula, documento.id].some((valor) => normalizar(valor).includes(termo)));
  const totalPaginas = Math.max(1, Math.ceil(filtrados.length / ITENS_POR_PAGINA));
  const paginaAtual = Math.min(pagina, totalPaginas);
  const inicio = (paginaAtual - 1) * ITENS_POR_PAGINA;
  const indicadores = [
    { titulo: 'Documentos totais', valor: documentos.length, texto: 'Enviados no sistema', icone: <FilePenLine size={23} />, variante: 'azul' },
    { titulo: 'Pendentes de análise', valor: documentos.filter((item) => ['Pendente', 'Em análise'].includes(item.status)).length, texto: 'Aguardando validação', icone: <AlarmClock size={23} />, variante: 'ambar' },
    { titulo: 'Aprovados', valor: documentos.filter((item) => item.status === 'Deferido').length, texto: 'Prontos ou vigentes', icone: <CheckCircle2 size={23} />, variante: 'verde' },
    { titulo: 'Vencidos / requerem ajuste', valor: documentos.filter((item) => ['Expirado', 'Correção solicitada'].includes(item.status)).length, texto: 'Exigem correção ou reenvio', icone: <TriangleAlert size={23} />, variante: 'vermelho' },
  ];
  const limparFiltros = () => { setBusca(''); setStatus(''); setTipo(''); setPagina(1); };
  return (
    <div className="painel-documentos d-flex flex-column min-vh-100">
      <Header paginaAtiva="Documentos" usuario={dadosDiretor.diretor} />
      <main className="flex-grow-1 py-4">
        <Container className="px-3 painel-documentos-container">
          <div className="painel-documentos-cabecalho">
            <h1>Gestão de documentos</h1>
            <p>Monitore, analise e aprove a documentação de estágio do IFNMG Campus Almenara</p>
          </div>
          <Row className="g-4 mb-4">{indicadores.map((indicador) => <Col xs={12} sm={6} lg={3} key={indicador.titulo}>
            <CardPequeno {...indicador} />
          </Col>)}</Row>
          {erro && <Alert variant="danger">{erro}</Alert>}
          {carregando && <p role="status">Carregando documentos…</p>}
          <section className="cartao-sage" aria-label="Documentos enviados">
            <Row className="g-3 mb-4 align-items-end">
              <Col xs={12} lg={6}>
                <div className="painel-documentos-busca"><Search size={16} aria-hidden="true" />
                  <Input id="buscar-documentos" tipo="search" aria-label="Buscar por aluno, documento ou matrícula" placeholder="Buscar por aluno ou documento..." className="mb-0"
                    value={busca} onChange={(evento) => { setBusca(evento.target.value); setPagina(1); }} onSubmit={(evento) => evento.preventDefault()} />
                </div>
              </Col>
              <Col xs={12} sm={6} lg={3}><Select id="status-documentos" aria-label="Filtrar por status" className="mb-0" value={status}
                onChange={(evento) => { setStatus(evento.target.value); setPagina(1); }} opcoes={[{ valor: '', rotulo: 'Status: todos' }, ...opcoes(documentos.map((doc) => doc.status))]} /></Col>
              <Col xs={12} sm={6} lg={3}><Select id="tipo-documentos" aria-label="Filtrar por tipo de documento" className="mb-0" value={tipo}
                onChange={(evento) => { setTipo(evento.target.value); setPagina(1); }} opcoes={[{ valor: '', rotulo: 'Tipo: todos' }, ...opcoes(documentos.map((doc) => doc.nome))]} /></Col>
            </Row>
            {(busca || status || tipo) && <div className="mb-3"><Button tipo="botao-acao-contorno" className="gap-2" onClick={limparFiltros}><RotateCcw size={14} aria-hidden="true" /> Limpar filtros</Button></div>}
            <p className="d-lg-none small text-secondary">Deslize a tabela para ver todas as informações e ações.</p>
            <div className="tabela-sage-container" tabIndex={0} role="region" aria-label="Tabela de documentos, role horizontalmente para ver todas as colunas">
              <Table className="tabela-sage painel-documentos-tabela">
                <caption className="visually-hidden">Documentos de estágio enviados pelos alunos do campus</caption>
                <thead><tr>{['ID', 'Aluno', 'Tipo de documento', 'Empresa', 'Data de envio', 'Status', 'Ações'].map((coluna) => <th scope="col" key={coluna}>{coluna}</th>)}</tr></thead>
                <tbody>{filtrados.slice(inicio, inicio + ITENS_POR_PAGINA).map((documento) => <tr key={documento.id}>
                  <td>{documento.id}</td><td className="fw-semibold">{documento.aluno}</td><td><button type="button" className="btn btn-link p-0 text-start" onClick={() => setSelecionado(documento.id)}>
                    {documento.nome}
                  </button></td>
                  <td>{documento.empresa || '—'}</td><td className="text-nowrap">{documento.data}</td>
                  <td><StatusBadge status={documento.status} variante={documento.status === 'Expirado' ? 'vermelho' : documento.status === 'Correção solicitada' ? 'ambar' : undefined} /></td>
                  <td><div className="painel-documentos-acoes">
                    <Button tipo="botao-acao-contorno" onClick={() => setSelecionado(documento.id)}>
                      <Eye size={16} aria-hidden="true" /> {documento.podeAvaliar ? 'Analisar' : 'Ver detalhes'}
                    </Button>
                  </div></td>
                </tr>)}
                  {!carregando && !erro && filtrados.length === 0 && <tr><td colSpan={7} className="text-center py-5"><FileSearch size={32} className="text-secondary mb-3" aria-hidden="true" />
                    <p className="fw-bold mb-1">Nenhum documento encontrado</p><p className="text-secondary mb-0">Altere a busca ou limpe os filtros.</p>
                  </td></tr>}
                </tbody>
              </Table>
            </div>
            <Paginacao paginaAtual={paginaAtual} totalPaginas={totalPaginas} aoMudarPagina={setPagina}
              textoResumo={`Mostrando ${filtrados.length ? inicio + 1 : 0}–${Math.min(inicio + ITENS_POR_PAGINA, filtrados.length)} de ${filtrados.length} documentos`} />
          </section>
        </Container>
      </main>
      {documentoSelecionado && <Modal show centered scrollable size="xl" onHide={() => setSelecionado(null)}>
        <Modal.Header closeButton><Modal.Title>Documento de {documentoSelecionado.aluno}</Modal.Title></Modal.Header>
        <Modal.Body>
          <ul className="perfil-aluno-documentos-lista">
            <DocumentoAluno key={documentoSelecionado.id} documento={documentoSelecionado} perfil="diretor" abrirPrevia
              aoAtualizar={(acao) => avaliar(documentoSelecionado, acao.tipo === 'aprovar', acao.motivo)} />
          </ul>
        </Modal.Body>
      </Modal>}
      <Footer />
    </div>
  );
}
