import { useState } from 'react';
import { Alert, Col, Container, Row, Table } from 'react-bootstrap';
import { BookOpenCheck, Eye, Plus, RotateCcw, Search, UserCheck, UserMinus, UsersRound } from 'lucide-react';
import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';
import CardPequeno from '../components/CardPequeno.jsx';
import Input from '../components/Input/Input.jsx';
import Select from '../components/Select.jsx';
import Button from "../components/Button/Button.jsx";
import StatusBadge from '../components/StatusBadge.jsx';
import Paginacao from '../components/Paginacao.jsx';
import ModalProfessor from '../components/orientador/ModalProfessor.jsx';
import ModalVinculoOrientador from '../components/orientador/ModalVinculoOrientador.jsx';
import useConsultaApi from '../hooks/useConsultaApi.js';
import { departamentos as departamentosCadastro } from '../data/orientadores.js';
import api from '../services/api.js';
import { listarVinculosOrientacao, vinculoPodeSerAlterado } from '../utils/vinculosOrientacao.js';
import '../App.css';
import './PainelOrientadoresDiretor.css';

const ITENS_POR_PAGINA = 10;
const normalizar = (valor) => String(valor ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();

function PainelOrientadoresDiretor() {
  const { dados, erro, carregando, recarregar } = useConsultaApi('/orientadores');
  const [busca, setBusca] = useState('');
  const [departamento, setDepartamento] = useState('');
  const [status, setStatus] = useState('');
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [professorSelecionadoId, setProfessorSelecionadoId] = useState(null);
  const [vinculoAberto, setVinculoAberto] = useState(false);
  const [cadastroAberto, setCadastroAberto] = useState(false);
  const [mensagem, setMensagem] = useState('');

  const orientadores = (dados?.orientadores ?? []).map((item) => ({
    ...item,
    status: item.ativo ? 'Ativo' : 'Inativo',
    alunosOrientados: item.discentes.length,
    maximoOrientandos: item.max_orientados,
    disponivelOrientacao: item.disponivel,
    usuarioId: item.usuario_id,
    areaAtuacao: item.area_atuacao,
    regimeTrabalho: item.regime_trabalho,
  }));
  const departamentos = [...new Set(orientadores.map((item) => item.departamento))].sort();
  const opcoesCadastro = [...new Set([...departamentosCadastro, ...departamentos])].sort();
  const professorSelecionado = orientadores.find((professor) => professor.id === professorSelecionadoId);
  const estagiosDisponiveis = vinculoAberto
    ? listarVinculosOrientacao(dados).filter(vinculoPodeSerAlterado)
      .filter(({ orientador }) => !orientador || !orientador.id)
    : [];
  const termo = normalizar(busca);
  const filtrados = orientadores.filter((professor) => {
    const correspondeBusca = [professor.nome, professor.siape, professor.email]
      .some((valor) => normalizar(valor).includes(termo));
    return correspondeBusca && (!departamento || professor.departamento === departamento)
      && (!status || professor.status === status);
  });
  const totalPaginas = Math.max(1, Math.ceil(filtrados.length / ITENS_POR_PAGINA));
  const paginaExibida = Math.min(paginaAtual, totalPaginas);
  const indiceInicial = (paginaExibida - 1) * ITENS_POR_PAGINA;
  const professoresPaginados = filtrados.slice(indiceInicial, indiceInicial + ITENS_POR_PAGINA);
  const primeiroExibido = filtrados.length === 0 ? 0 : indiceInicial + 1;
  const ultimoExibido = Math.min(indiceInicial + ITENS_POR_PAGINA, filtrados.length);

  const indicadores = [
    { titulo: 'Total de professores', valor: orientadores.length, texto: 'Professores cadastrados no campus', icone: <UsersRound size={23} />, variante: 'azul' },
    { titulo: 'Orientadores ativos', valor: orientadores.filter((item) => item.ativo).length, texto: 'Professores com conta ativa', icone: <BookOpenCheck size={23} />, variante: 'verde' },
    { titulo: 'Sem vínculo', valor: orientadores.filter((item) => item.alunosOrientados === 0).length, texto: 'Professores sem discentes vinculados', icone: <UserMinus size={23} />, variante: 'cinza' },
    { titulo: 'Disponíveis', valor: orientadores.filter((item) => item.disponivel).length, texto: 'Com capacidade para orientar', icone: <UserCheck size={23} />, variante: 'azul' },
  ];

  const limparFiltros = () => {
    setBusca('');
    setDepartamento('');
    setStatus('');
    setPaginaAtual(1);
  };

  const abrirPerfil = (id) => {
    setMensagem('');
    setProfessorSelecionadoId(id);
  };

  const vinculoSalvo = () => {
    setVinculoAberto(false);
    setMensagem('Vínculo de orientação salvo com sucesso.');
    recarregar();
  };

  const desvincularEstagio = async (estagioId) => {
    try {
      await api.delete('/estagios/' + estagioId + '/orientador');
      setVinculoAberto(false);
      setMensagem('Orientador desvinculado com sucesso.');
      recarregar();
    } catch (error) {
      setMensagem(error.message || 'Não foi possível desvincular o orientador.');
    }
  };

  const salvarProfessor = async (professor) => {
    const payload = {
      nome: professor.nome,
      email: professor.email,
      siape: professor.siape,
      cpf: professor.cpf,
      titulacao: professor.titulacao,
      departamento: professor.departamento,
      areaAtuacao: professor.areaAtuacao,
      regimeTrabalho: professor.regimeTrabalho,
      telefone: professor.telefone,
      maximoOrientandos: professor.maximoOrientandos,
      status: professor.status === 'Inativo' ? 'inativo' : 'ativo',
    };

    if (professor.usuarioId != null) {
      await api.put('/usuarios/' + professor.usuarioId, payload);
      setMensagem('Cadastro do professor atualizado.');
    } else {
      await api.post('/usuarios', { ...payload, perfil: 'PROFESSOR', password: professor.siape + '@Sage' });
      setPaginaAtual(1);
      setMensagem('Professor cadastrado com sucesso.');
    }
    recarregar();
  };

  return (
    <div className="painel-orientadores d-flex flex-column min-vh-100">
      <Header paginaAtiva="Orientadores" />

      <main className="flex-grow-1 py-4">
        <Container className="px-3 painel-orientadores-container">
          <div className="painel-orientadores-cabecalho">
            <div>
              <h1>Gerenciar professores</h1>
              <p>Gerencie os professores e orientadores de estágio do campus</p>
            </div>
            <Button tipo="botao-sage-verde" className="gap-2" onClick={() => { setMensagem(''); setCadastroAberto(true); }}>
              <Plus size={17} aria-hidden="true" /> Cadastrar professor
            </Button>
          </div>

          {!professorSelecionado && mensagem && <Alert variant="success" role="status">{mensagem}</Alert>}
          {carregando && <p role="status">Carregando orientadores…</p>}
          {erro && <Alert variant="danger" role="alert">{erro} <Button onClick={recarregar}>Tentar novamente</Button></Alert>}
          {dados && <>
          <Row className="g-4 mb-4">
            {indicadores.map((indicador) => <Col key={indicador.titulo} xs={12} sm={6} lg={3}>
              <CardPequeno {...indicador} />
            </Col>)}
          </Row>

          <section className="cartao-sage" aria-labelledby="filtros-orientadores-titulo">
            <h2 id="filtros-orientadores-titulo" className="cartao-sage-titulo d-flex align-items-center gap-2">
              <Search size={20} aria-hidden="true" /> Pesquisa e filtros
            </h2>
            <Row className="g-3 align-items-end">
              <Col xs={12} lg={5}>
                <Input id="busca-orientadores" titulo="Buscar professor" tipo="search" placeholder="Nome, SIAPE ou e-mail"
                  value={busca} onChange={(evento) => { setBusca(evento.target.value); setPaginaAtual(1); }}
                  onSubmit={(evento) => evento.preventDefault()} className="mb-0" />
              </Col>
              <Col xs={12} md={6} lg={4}>
                <Select id="departamento-orientadores" titulo="Departamento" value={departamento}
                  onChange={(evento) => { setDepartamento(evento.target.value); setPaginaAtual(1); }} className="mb-0"
                  opcoes={[{ valor: '', rotulo: 'Todos os departamentos' }, ...departamentos]} />
              </Col>
              <Col xs={12} md={6} lg={3}>
                <Select id="status-orientadores" titulo="Status" value={status}
                  onChange={(evento) => { setStatus(evento.target.value); setPaginaAtual(1); }} className="mb-0"
                  opcoes={[{ valor: '', rotulo: 'Todos' }, 'Ativo', 'Inativo']} />
              </Col>
            </Row>
          </section>

          <section className="cartao-sage" aria-labelledby="lista-orientadores-titulo">
            <div className="d-flex align-items-center justify-content-between flex-wrap gap-3 mb-3">
              <div>
                <h2 id="lista-orientadores-titulo" className="cartao-sage-titulo mb-1">Professores do campus</h2>
                <p className="text-secondary small mb-0" role="status">{filtrados.length} de {orientadores.length} professores encontrados</p>
              </div>
              {(busca || departamento || status) && <Button tipo="botao-sage-verde" className="gap-2" onClick={limparFiltros}>
                <RotateCcw size={15} aria-hidden="true" /> Limpar filtros
              </Button>}
            </div>

            <p className="d-lg-none text-secondary small">Deslize a tabela para ver todas as informações e ações.</p>
            <div className="tabela-sage-container" tabIndex={0} role="region"
              aria-label="Tabela de professores, role horizontalmente para ver todas as colunas">
              <Table className="tabela-sage painel-orientadores-tabela">
                <caption className="visually-hidden">Professores e orientadores de estágio do campus</caption>
                <thead><tr>
                  <th scope="col">SIAPE</th><th scope="col">Nome do professor</th><th scope="col">Departamento</th>
                  <th scope="col">E-mail</th><th scope="col">Alunos orientados</th><th scope="col">Status</th><th scope="col">Ações</th>
                </tr></thead>
                <tbody>
                  {professoresPaginados.map((professor) => <tr key={professor.id}>
                    <td className="fw-bold">{professor.siape}</td>
                    <td><span className="fw-bold d-block">{professor.nome}</span><span className="small text-secondary">{professor.disponivel ? 'Disponível' : 'Indisponível'}</span></td>
                    <td>{professor.departamento}</td>
                    <td><a href={`mailto:${professor.email}`}>{professor.email}</a></td>
                    <td className="text-center fw-bold">{professor.alunosOrientados}</td>
                    <td><StatusBadge status={professor.status} /></td>
                    <td><Button tipo="botao-sage-verde" className="gap-2 text-nowrap"
                      onClick={() => abrirPerfil(professor.id)} aria-label={`Ver perfil de ${professor.nome}`}>
                      <Eye size={15} aria-hidden="true" /> Ver perfil
                    </Button></td>
                  </tr>)}
                  {filtrados.length === 0 && <tr><td colSpan={7} className="text-center py-5">
                    <UserMinus size={32} className="text-secondary mb-3" aria-hidden="true" />
                    <p className="fw-bold mb-1">{orientadores.length ? 'Nenhum professor encontrado' : 'Nenhum orientador cadastrado'}</p>
                    {orientadores.length > 0 && <p className="text-secondary mb-0">Altere a busca ou limpe os filtros para ver outros professores.</p>}
                  </td></tr>}
                </tbody>
              </Table>
            </div>

            <Paginacao paginaAtual={paginaExibida} totalPaginas={totalPaginas} aoMudarPagina={setPaginaAtual}
              textoResumo={`Mostrando ${primeiroExibido}–${ultimoExibido} de ${filtrados.length} professores`} />
          </section>
          </>}
        </Container>
      </main>

      {cadastroAberto && <ModalProfessor aberto cadastroIntegrado departamentos={opcoesCadastro} statusDisponiveis={['Ativo', 'Inativo']}
        aoSalvar={salvarProfessor} aoFechar={() => setCadastroAberto(false)} />}
      {professorSelecionado && (vinculoAberto ? (
        <ModalVinculoOrientador vinculos={estagiosDisponiveis} professor={professorSelecionado}
          carregando={carregando} erroConsulta={erro} aoRecarregar={recarregar}
          aoSalvar={vinculoSalvo} aoDesvincular={desvincularEstagio} aoFechar={() => setVinculoAberto(false)} />
      ) : (
        <ModalProfessor key={professorSelecionadoId} aberto cadastroIntegrado professor={professorSelecionado}
          somenteLeitura={!professorSelecionado.cadastro_editavel} departamentos={opcoesCadastro} statusDisponiveis={['Ativo', 'Inativo']}
          aoSalvar={salvarProfessor} aoDesvincular={desvincularEstagio} aoFechar={() => setProfessorSelecionadoId(null)} mensagem={mensagem}
          aoVincularEstagio={() => { setMensagem(''); setVinculoAberto(true); }} />
      ))}
      <Footer />
    </div>
  );
}

export default PainelOrientadoresDiretor;
