import { useState } from 'react';
import { Col, Container, Row, Table } from 'react-bootstrap';
import { CircleAlert, Clock3, Handshake, Pencil, Plus, RefreshCw, RotateCcw, Search } from 'lucide-react';
import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';
import CardPequeno from '../components/CardPequeno.jsx';
import Input from '../components/Input.jsx';
import Select from '../components/Select.jsx';
import Botao from '../components/Button.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import Paginacao from '../components/Paginacao.jsx';
import ModalConvenio from '../components/convenio/ModalConvenio.jsx';
import ModalAnaliseConvenio from '../components/convenio/ModalAnaliseConvenio.jsx';
import dadosDiretor from '../data/diretor.js';
import conveniosIniciais, { statusConvenio, tiposConvenio } from '../data/convenios.js';
import { calcularVigenciaCincoAnos } from '../utils/convenio.js';
import '../App.css';
import './PainelConveniosDiretor.css';

const ITENS_POR_PAGINA = 10;
const normalizar = (valor) => String(valor ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
const varianteStatus = (status) => ({
  'Ativo': 'verde', 'Pendente de análise': 'azul', 'Ajustes solicitados': 'ambar',
  'Expirado': 'vermelho', 'Rejeitado': 'vermelho',
}[status] || 'cinza');
const dataComparavel = (data) => String(data || '').split('/').reverse().join('-');

function PainelConveniosDiretor() {
  const [convenios, setConvenios] = useState(conveniosIniciais);
  const [busca, setBusca] = useState('');
  const [status, setStatus] = useState('');
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [formulario, setFormulario] = useState(null);
  const [analiseId, setAnaliseId] = useState(null);

  const convenioFormulario = convenios.find((item) => item.id === formulario?.id);
  const convenioAnalise = convenios.find((item) => item.id === analiseId);
  const termo = normalizar(busca);
  const filtrados = convenios.filter((convenio) => [convenio.razaoSocial, convenio.documento, convenio.representante]
    .some((valor) => normalizar(valor).includes(termo)) && (!status || convenio.status === status));
  const totalPaginas = Math.max(1, Math.ceil(filtrados.length / ITENS_POR_PAGINA));
  const paginaExibida = Math.min(paginaAtual, totalPaginas);
  const indiceInicial = (paginaExibida - 1) * ITENS_POR_PAGINA;
  const conveniosPaginados = filtrados.slice(indiceInicial, indiceInicial + ITENS_POR_PAGINA);
  const primeiroExibido = filtrados.length === 0 ? 0 : indiceInicial + 1;
  const ultimoExibido = Math.min(indiceInicial + ITENS_POR_PAGINA, filtrados.length);

  const indicadores = [
    { titulo: 'Convênios ativos', valor: convenios.filter((item) => item.status === 'Ativo').length, texto: 'Parcerias vigentes e regulares', icone: <Handshake size={23} />, cor: '#0f7b44', corFundo: '#d1f4e0' },
    { titulo: 'Solicitações pendentes', valor: convenios.filter((item) => ['Pendente de análise', 'Ajustes solicitados'].includes(item.status)).length, texto: 'Novos cadastros aguardando homologação', icone: <Clock3 size={23} />, cor: '#b45309', corFundo: '#fef3c7' },
    { titulo: 'Convênios vencidos / expirados', valor: convenios.filter((item) => item.status === 'Expirado').length, texto: 'Atingiram o prazo limite de vigência', icone: <CircleAlert size={23} />, cor: '#b91c1c', corFundo: '#fee2e2' },
  ];

  const salvarConvenio = (dados, modo) => {
    const vigenciaRenovada = calcularVigenciaCincoAnos();
    const dadosValidados = modo === 'renovar'
      ? { ...dados, inicio: vigenciaRenovada.inicio, vencimento: vigenciaRenovada.vencimento }
      : dados;
    if (Object.values(dadosValidados).some((valor) => typeof valor === 'string' && !valor.trim())) throw new Error('Preencha todos os campos obrigatórios.');
    if (dataComparavel(dadosValidados.vencimento) <= dataComparavel(dadosValidados.inicio)) throw new Error('O vencimento deve ser posterior ao início da vigência.');
    if (convenios.some((item) => item.id !== dadosValidados.id && item.documento === dadosValidados.documento)) throw new Error('Já existe um convênio ou solicitação com este CNPJ/CPF.');

    if (dadosValidados.id) {
      setConvenios((atuais) => atuais.map((item) => item.id === dadosValidados.id
        ? { ...item, ...dadosValidados, status: modo === 'renovar' ? 'Ativo' : item.status } : item));
    } else {
      setConvenios((atuais) => [{ ...dadosValidados, id: Date.now(), status: 'Pendente de análise',
        submetidoEm: new Date().toLocaleDateString('pt-BR'), documentos: [] }, ...atuais]);
      setPaginaAtual(1);
    }
  };

  const decidirConvenio = (tipo, dados) => {
    const statusNovo = tipo === 'aprovar' ? 'Ativo' : tipo === 'reprovar' ? 'Rejeitado' : 'Ajustes solicitados';
    const vigenciaCalculada = calcularVigenciaCincoAnos();
    const vigencia = tipo === 'aprovar'
      ? { inicio: vigenciaCalculada.inicio, vencimento: vigenciaCalculada.vencimento }
      : {};
    setConvenios((atuais) => atuais.map((item) => item.id === analiseId
      ? { ...item, ...vigencia, status: statusNovo, decisao: { tipo, ...dados, registradaEm: new Date().toISOString() } } : item));
  };
  const limparFiltros = () => { setBusca(''); setStatus(''); setPaginaAtual(1); };

  return (
    <div className="painel-convenios d-flex flex-column min-vh-100">
      <Header paginaAtiva="Empresas" usuario={dadosDiretor.diretor} />
      <main className="flex-grow-1 py-4">
        <Container className="px-3 painel-convenios-container">
          <div className="painel-convenios-cabecalho">
            <div><h1>Listagem de convênios</h1><p>Visualize e controle as entidades parceiras concedentes de estágio</p></div>
            <Botao tipo="botao-sage-verde" className="gap-2" onClick={() => setFormulario({ modo: 'novo' })}>
              <Plus size={17} aria-hidden="true" /> Novo convênio
            </Botao>
          </div>

          <Row className="g-4 mb-4">{indicadores.map((indicador) => <Col key={indicador.titulo} xs={12} md={4}>
            <CardPequeno {...indicador} />
          </Col>)}</Row>

          <section className="cartao-sage" aria-labelledby="filtros-convenios-titulo">
            <h2 id="filtros-convenios-titulo" className="cartao-sage-titulo d-flex align-items-center gap-2"><Search size={20} /> Pesquisa e filtros</h2>
            <Row className="g-3 align-items-end">
              <Col xs={12} lg={8}><Input id="busca-convenios" titulo="Buscar convênio" tipo="search" placeholder="Razão social, CNPJ/CPF ou representante"
                value={busca} onChange={(evento) => { setBusca(evento.target.value); setPaginaAtual(1); }} onSubmit={(evento) => evento.preventDefault()} className="mb-0" /></Col>
              <Col xs={12} lg={4}><Select id="status-convenios" titulo="Status" value={status}
                onChange={(evento) => { setStatus(evento.target.value); setPaginaAtual(1); }} className="mb-0"
                opcoes={[{ valor: '', rotulo: 'Todos' }, ...statusConvenio]} /></Col>
            </Row>
          </section>

          <section className="cartao-sage" aria-labelledby="lista-convenios-titulo">
            <div className="d-flex align-items-center justify-content-between flex-wrap gap-3 mb-3">
              <div><h2 id="lista-convenios-titulo" className="cartao-sage-titulo mb-1">Convênios cadastrados</h2>
                <p className="text-secondary small mb-0" role="status">{filtrados.length} de {convenios.length} convênios encontrados</p></div>
              {(busca || status) && <Botao tipo="botao-sage-verde" className="gap-2" onClick={limparFiltros}><RotateCcw size={15} /> Limpar filtros</Botao>}
            </div>
            <p className="d-lg-none text-secondary small">Deslize a tabela para ver todas as informações e ações.</p>
            <div className="tabela-sage-container" tabIndex={0} role="region" aria-label="Tabela de convênios, role horizontalmente para ver todas as colunas">
              <Table className="tabela-sage painel-convenios-tabela">
                <caption className="visually-hidden">Convênios e solicitações de parceria do campus</caption>
                <thead><tr><th>CNPJ/CPF</th><th>Razão social / nome</th><th>Tipo</th><th>Início</th><th>Vencimento</th><th>Status</th><th>Ações</th></tr></thead>
                <tbody>
                  {conveniosPaginados.map((convenio) => <tr key={convenio.id}>
                    <td>{convenio.documento}</td><td className="fw-bold">{convenio.razaoSocial}</td><td>{convenio.tipo}</td>
                    <td>{convenio.inicio}</td><td>{convenio.vencimento}</td>
                    <td><StatusBadge status={convenio.status} variante={varianteStatus(convenio.status)} /></td>
                    <td><div className="painel-convenios-acoes">
                      {['Pendente de análise', 'Ajustes solicitados'].includes(convenio.status)
                        ? <button type="button" className="convenio-acao convenio-acao-principal" onClick={() => setAnaliseId(convenio.id)}>Avaliar proposta</button>
                        : <><button type="button" className="convenio-acao-icone" title="Editar convênio"
                          aria-label={`Editar convênio de ${convenio.razaoSocial}`} onClick={() => setFormulario({ modo: 'editar', id: convenio.id })}>
                          <Pencil size={18} aria-hidden="true" />
                        </button>
                          <button type="button" className="convenio-acao-icone" title="Renovar convênio"
                            aria-label={`Renovar convênio de ${convenio.razaoSocial}`} onClick={() => setFormulario({ modo: 'renovar', id: convenio.id })}>
                            <RefreshCw size={18} aria-hidden="true" />
                          </button></>}
                    </div></td>
                  </tr>)}
                  {filtrados.length === 0 && <tr><td colSpan={7} className="text-center py-5"><CircleAlert size={32} className="text-secondary mb-3" />
                    <p className="fw-bold mb-1">Nenhum convênio encontrado</p><p className="text-secondary mb-0">Altere a busca ou limpe os filtros.</p></td></tr>}
                </tbody>
              </Table>
            </div>
            <Paginacao paginaAtual={paginaExibida} totalPaginas={totalPaginas} aoMudarPagina={setPaginaAtual}
              textoResumo={`Mostrando ${primeiroExibido}–${ultimoExibido} de ${filtrados.length} convênios`} />
          </section>
        </Container>
      </main>

      <ModalConvenio key={formulario ? `${formulario.modo}-${formulario.id || 'novo'}` : 'form-fechado'} aberto={Boolean(formulario)}
        convenio={convenioFormulario} modo={formulario?.modo} tipos={tiposConvenio} aoSalvar={salvarConvenio} aoFechar={() => setFormulario(null)} />
      <ModalAnaliseConvenio key={analiseId || 'analise-fechada'} aberto={Boolean(convenioAnalise)} convenio={convenioAnalise}
        aoDecidir={decidirConvenio} aoFechar={() => setAnaliseId(null)} />
      <Footer />
    </div>
  );
}

export default PainelConveniosDiretor;
