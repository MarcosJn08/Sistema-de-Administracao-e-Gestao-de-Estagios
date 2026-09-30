import { useState } from 'react';
import { Col, Container, Row, Table } from 'react-bootstrap';
import { BookOpenCheck, Eye, Plus, RotateCcw, Search, Sparkles, UserMinus, UsersRound } from 'lucide-react';
import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';
import CardPequeno from '../components/CardPequeno.jsx';
import Input from '../components/Input.jsx';
import Select from '../components/Select.jsx';
import Botao from '../components/Button.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import Paginacao from '../components/Paginacao.jsx';
import ModalProfessor from '../components/orientador/ModalProfessor.jsx';
import dadosDiretor from '../dadosDiretor.jsx';
import orientadoresIniciais, { departamentos, statusOrientador } from '../data/orientadores.js';
import '../App.css';
import './PainelOrientadoresDiretor.css';

const ITENS_POR_PAGINA = 10;
const normalizar = (valor) => String(valor ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();

function PainelOrientadoresDiretor() {
  const [orientadores, setOrientadores] = useState(orientadoresIniciais);
  const [busca, setBusca] = useState('');
  const [departamento, setDepartamento] = useState('');
  const [status, setStatus] = useState('');
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [professorSelecionadoId, setProfessorSelecionadoId] = useState(null);
  const [cadastroAberto, setCadastroAberto] = useState(false);

  const professorSelecionado = orientadores.find((professor) => professor.id === professorSelecionadoId);
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
    { titulo: 'Total de professores', valor: orientadores.length, texto: 'Professores cadastrados no campus', icone: <UsersRound size={23} /> },
    { titulo: 'Orientadores ativos', valor: orientadores.filter((item) => item.status === 'Ativo').length, texto: 'Disponíveis no semestre atual', icone: <BookOpenCheck size={23} /> },
    { titulo: 'Sem vínculo', valor: orientadores.filter((item) => item.alunosOrientados === 0).length, texto: 'Disponíveis para novos projetos', icone: <UserMinus size={23} /> },
    { titulo: 'Novos neste semestre', valor: orientadores.filter((item) => item.novoNesteSemestre).length, texto: 'Professores recém-admitidos', icone: <Sparkles size={23} /> },
  ];

  const limparFiltros = () => {
    setBusca('');
    setDepartamento('');
    setStatus('');
    setPaginaAtual(1);
  };

  const salvarProfessor = (dados) => {
    if (!dados.nome || !dados.siape || !dados.cpf || !dados.departamento || !dados.titulacao || !dados.email
      || !dados.telefone || !dados.areaAtuacao || !dados.regimeTrabalho || !dados.maximoOrientandos) {
      throw new Error('Preencha os campos obrigatórios.');
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(dados.email)) {
      throw new Error('Informe um e-mail institucional válido.');
    }
    if (orientadores.some((item) => item.id !== dados.id && item.siape === dados.siape)) {
      throw new Error('Já existe um professor cadastrado com este SIAPE.');
    }
    if (orientadores.some((item) => item.id !== dados.id && item.cpf === dados.cpf)) {
      throw new Error('Já existe um professor cadastrado com este CPF.');
    }
    if (orientadores.some((item) => item.id !== dados.id && normalizar(item.email) === normalizar(dados.email))) {
      throw new Error('Já existe um professor cadastrado com este e-mail.');
    }
    if (dados.maximoOrientandos < dados.alunosOrientados) {
      throw new Error('O limite não pode ser menor que o número atual de alunos orientados.');
    }

    if (dados.id) {
      setOrientadores((atuais) => atuais.map((item) => item.id === dados.id ? dados : item));
    } else {
      setOrientadores((atuais) => [{ ...dados, id: `professor-${Date.now()}` }, ...atuais]);
      setPaginaAtual(1);
    }
  };

  return (
    <div className="painel-orientadores d-flex flex-column min-vh-100">
      <Header paginaAtiva="Orientadores" usuario={dadosDiretor.diretor} />

      <main className="flex-grow-1 py-4">
        <Container className="px-3 painel-orientadores-container">
          <div className="painel-orientadores-cabecalho">
            <div>
              <h1>Gerenciar professores</h1>
              <p>Gerencie os professores e orientadores de estágio do campus</p>
            </div>
            <Botao tipo="botao-sage-verde" className="gap-2" onClick={() => setCadastroAberto(true)}>
              <Plus size={17} aria-hidden="true" /> Cadastrar professor
            </Botao>
          </div>

          <Row className="g-4 mb-4">
            {indicadores.map((indicador) => <Col key={indicador.titulo} xs={12} sm={6} lg={3}>
              <CardPequeno {...indicador} cor="#2e7d32" corFundo="#e8f5e9" />
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
                  opcoes={[{ valor: '', rotulo: 'Todos' }, ...statusOrientador]} />
              </Col>
            </Row>
          </section>

          <section className="cartao-sage" aria-labelledby="lista-orientadores-titulo">
            <div className="d-flex align-items-center justify-content-between flex-wrap gap-3 mb-3">
              <div>
                <h2 id="lista-orientadores-titulo" className="cartao-sage-titulo mb-1">Professores do campus</h2>
                <p className="text-secondary small mb-0" role="status">{filtrados.length} de {orientadores.length} professores encontrados</p>
              </div>
              {(busca || departamento || status) && <Botao tipo="botao-sage-verde" className="gap-2" onClick={limparFiltros}>
                <RotateCcw size={15} aria-hidden="true" /> Limpar filtros
              </Botao>}
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
                    <td><span className="fw-bold d-block">{professor.nome}</span><span className="small text-secondary">{professor.titulacao}</span></td>
                    <td>{professor.departamento}</td>
                    <td><a href={`mailto:${professor.email}`}>{professor.email}</a></td>
                    <td className="text-center fw-bold">{professor.alunosOrientados}</td>
                    <td><StatusBadge status={professor.status} /></td>
                    <td><Botao tipo="botao-sage-verde" className="gap-2 text-nowrap"
                      onClick={() => setProfessorSelecionadoId(professor.id)} aria-label={`Ver perfil de ${professor.nome}`}>
                      <Eye size={15} aria-hidden="true" /> Ver perfil
                    </Botao></td>
                  </tr>)}
                  {filtrados.length === 0 && <tr><td colSpan={7} className="text-center py-5">
                    <UserMinus size={32} className="text-secondary mb-3" aria-hidden="true" />
                    <p className="fw-bold mb-1">Nenhum professor encontrado</p>
                    <p className="text-secondary mb-0">Altere a busca ou limpe os filtros para ver outros professores.</p>
                  </td></tr>}
                </tbody>
              </Table>
            </div>

            <Paginacao paginaAtual={paginaExibida} totalPaginas={totalPaginas} aoMudarPagina={setPaginaAtual}
              textoResumo={`Mostrando ${primeiroExibido}–${ultimoExibido} de ${filtrados.length} professores`} />
          </section>
        </Container>
      </main>

      <ModalProfessor key={cadastroAberto ? 'cadastro' : 'cadastro-fechado'} aberto={cadastroAberto}
        departamentos={departamentos} statusDisponiveis={statusOrientador} aoSalvar={salvarProfessor}
        aoFechar={() => setCadastroAberto(false)} />
      <ModalProfessor key={professorSelecionadoId || 'perfil-fechado'} aberto={Boolean(professorSelecionado)}
        professor={professorSelecionado} departamentos={departamentos} statusDisponiveis={statusOrientador}
        aoSalvar={salvarProfessor} aoFechar={() => setProfessorSelecionadoId(null)} />
      <Footer />
    </div>
  );
}

export default PainelOrientadoresDiretor;
