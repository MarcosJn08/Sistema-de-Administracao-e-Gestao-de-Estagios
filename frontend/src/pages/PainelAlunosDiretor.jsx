import { useState } from 'react';
import { Container, Row, Col, Table, ProgressBar } from 'react-bootstrap';
import { Users, BriefcaseBusiness, GraduationCap, UserSearch, Search, Eye, RotateCcw } from 'lucide-react';
import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';
import CardPequeno from '../components/CardPequeno.jsx';
import Input from '../components/Input.jsx';
import Select from '../components/Select.jsx';
import Botao from '../components/Button.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import Paginacao from '../components/Paginacao.jsx';
import DetalhesAluno from '../components/aluno/DetalhesAluno.jsx';
import dadosDiretor from '../dadosDiretor.jsx';
import alunosIniciais, { cursos, situacoesEstagio, orientadores } from '../data/alunos.js';
import { aplicarAcaoAluno } from '../utils/gestaoAluno.js';
import '../App.css';
import './PainelAlunosDiretor.css';

const normalizar = (valor) => String(valor ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
const ITENS_POR_PAGINA = 10;

function PainelAlunosDiretor() {
  const [alunos, setAlunos] = useState(alunosIniciais);
  const [busca, setBusca] = useState('');
  const [curso, setCurso] = useState('');
  const [situacao, setSituacao] = useState('');
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [alunoSelecionadoId, setAlunoSelecionadoId] = useState(null);
  const alunoSelecionado = alunos.find((aluno) => aluno.id === alunoSelecionadoId);
  const atualizarAluno = (acao) => {
    const atualizado = aplicarAcaoAluno(alunoSelecionado, acao, { perfil: dadosDiretor.diretor.role, orientadores, alunos });
    setAlunos((atuais) => atuais.map((aluno) => aluno.id === atualizado.id ? atualizado : aluno));
  };
  const termo = normalizar(busca);
  const digitos = termo.replace(/\D/g, '');
  const buscaNumerica = /^[\d.\s/-]+$/.test(termo) && digitos.length > 0;
  const filtrados = alunos.filter((aluno) => {
    const correspondeBusca = normalizar(aluno.nome).includes(termo)
      || [aluno.matricula, aluno.cpf].some((valor) => buscaNumerica
        ? String(valor).replace(/\D/g, '').includes(digitos)
        : normalizar(valor).includes(termo));
    return correspondeBusca && (!curso || aluno.curso === curso) && (!situacao || aluno.situacao === situacao);
  });
  const totalPaginas = Math.max(1, Math.ceil(filtrados.length / ITENS_POR_PAGINA));
  const paginaExibida = Math.min(paginaAtual, totalPaginas);
  const indiceInicial = (paginaExibida - 1) * ITENS_POR_PAGINA;
  const alunosPaginados = filtrados.slice(indiceInicial, indiceInicial + ITENS_POR_PAGINA);
  const primeiroExibido = filtrados.length === 0 ? 0 : indiceInicial + 1;
  const ultimoExibido = Math.min(indiceInicial + ITENS_POR_PAGINA, filtrados.length);
  const contar = (status) => alunos.filter((aluno) => aluno.situacao === status).length;
  const indicadores = [
    { titulo: 'Total de Alunos Cadastrados', valor: alunos.length, icone: <Users size={23} /> },
    { titulo: 'Estudantes em Estágio Ativo', valor: contar('Em estágio ativo'), icone: <BriefcaseBusiness size={23} /> },
    { titulo: 'Estágios Concluídos', valor: contar('Concluído'), icone: <GraduationCap size={23} /> },
    { titulo: 'Sem Vínculo / Em Busca de Vaga', valor: contar('Sem estágio'), icone: <UserSearch size={23} /> },
  ];
  const limparFiltros = () => { setBusca(''); setCurso(''); setSituacao(''); setPaginaAtual(1); };

  return (
    <div className="painel-alunos d-flex flex-column min-vh-100">
      <Header
        pagina01="Dashboard"
        pagina02="Alunos"
        pagina03="Orientadores"
        pagina04="Empresas"
        pagina05="Documentos"
        pagina06="Relatórios"
        paginaAtiva="Alunos"
        usuario={dadosDiretor.diretor}
      />
      <main className="flex-grow-1 py-4">
        <Container className="px-3 painel-alunos-container">
          <div className="mb-4">
            <h1 className="painel-alunos-titulo">Painel Geral de Alunos</h1>
            <p className="text-secondary mb-0">Visão consolidada de todos os discentes e seus respectivos vínculos de estágio no IFNMG Campus Almenara</p>
          </div>
          <Row className="g-4 mb-4">
            {indicadores.map((indicador) => (
              <Col xs={12} sm={6} lg={3} key={indicador.titulo}>
                <CardPequeno {...indicador} cor="#2e7d32" corFundo="#e8f5e9" />
              </Col>
            ))}
          </Row>
          <section className="cartao-sage" aria-labelledby="filtros-alunos-titulo">
            <h2 id="filtros-alunos-titulo" className="cartao-sage-titulo d-flex align-items-center gap-2">
              <Search size={20} aria-hidden="true" /> Pesquisa e filtros
            </h2>
            <Row className="g-3 align-items-end">
              <Col xs={12} lg={5}>
                <Input id="busca-alunos" titulo="Buscar estudante" tipo="search" placeholder="Nome, matrícula ou CPF"
                  value={busca} onChange={(evento) => { setBusca(evento.target.value); setPaginaAtual(1); }}
                  onSubmit={(evento) => evento.preventDefault()} className="mb-0" />
              </Col>
              <Col xs={12} md={6} lg={4}>
                <Select id="curso-alunos" titulo="Curso" value={curso} onChange={(evento) => { setCurso(evento.target.value); setPaginaAtual(1); }}
                  className="mb-0" opcoes={[{ valor: '', rotulo: 'Todos os Cursos' }, ...cursos]} />
              </Col>
              <Col xs={12} md={6} lg={3}>
                <Select id="situacao-alunos" titulo="Situação do Estágio" value={situacao}
                  onChange={(evento) => { setSituacao(evento.target.value); setPaginaAtual(1); }} className="mb-0"
                  opcoes={[{ valor: '', rotulo: 'Todos' }, ...situacoesEstagio]} />
              </Col>
            </Row>
          </section>
          <section className="cartao-sage" aria-labelledby="lista-alunos-titulo">
            <div className="d-flex align-items-center justify-content-between flex-wrap gap-3 mb-3">
              <div>
                <h2 id="lista-alunos-titulo" className="cartao-sage-titulo mb-1">Alunos do campus</h2>
                <p className="text-secondary small mb-0" role="status">{filtrados.length} de {alunos.length} alunos encontrados</p>
              </div>
              {(busca || curso || situacao) && (
                <Botao tipo="botao-sage-verde" onClick={limparFiltros} className="gap-2">
                  <RotateCcw size={15} aria-hidden="true" /> Limpar filtros
                </Botao>
              )}
            </div>
            <p className="d-lg-none text-secondary small">Deslize a tabela para ver todas as informações e ações.</p>
            <div className="tabela-sage-container" tabIndex={0} role="region" aria-label="Tabela de alunos, role horizontalmente para ver todas as colunas">
              <Table className="tabela-sage painel-alunos-tabela">
                <caption className="visually-hidden">Alunos do campus e seus vínculos de estágio</caption>
                <thead><tr>
                  <th scope="col">Estudante / Matrícula</th><th scope="col">Curso / Semestre</th>
                  <th scope="col">Empresa / Orientador</th><th scope="col">Progresso da Carga Horária</th>
                  <th scope="col">Situação</th><th scope="col">Ação</th>
                </tr></thead>
                <tbody>
                  {alunosPaginados.map((aluno) => {
                    const { horasConcluidas, metaHoras } = aluno.progresso;
                    const percentual = metaHoras > 0 ? Math.min(100, Math.max(0, Math.floor(horasConcluidas / metaHoras * 100))) : 0;
                    return (
                      <tr key={aluno.id}>
                        <td><span className="fw-bold d-block">{aluno.nome}</span><span className="small text-secondary">{aluno.matricula}</span></td>
                        <td><span className="d-block">{aluno.curso}</span><span className="small text-secondary">{aluno.semestre}º semestre</span></td>
                        <td><span className="d-block">{aluno.estagio?.empresa || 'Sem vínculo'}</span><span className="small text-secondary">{aluno.estagio?.professorOrientador || 'Sem orientador'}</span></td>
                        <td>
                          <div className="d-flex justify-content-between gap-2 small mb-2"><span>{horasConcluidas}h / {metaHoras}h</span><strong>{percentual}%</strong></div>
                          <ProgressBar now={percentual} aria-label={`Carga horária de ${aluno.nome}`} />
                        </td>
                        <td><StatusBadge status={aluno.situacao} /></td>
                        <td><Botao tipo="botao-sage-verde" className="gap-2 text-nowrap" onClick={() => setAlunoSelecionadoId(aluno.id)} aria-label={`Ver detalhes de ${aluno.nome}`}>
                          <Eye size={16} aria-hidden="true" /> Ver Detalhes
                        </Botao></td>
                      </tr>
                    );
                  })}
                  {filtrados.length === 0 && <tr><td colSpan={6} className="text-center py-5">
                    <UserSearch size={32} className="text-secondary mb-3" aria-hidden="true" />
                    <p className="fw-bold mb-1">Nenhum aluno encontrado</p>
                    <p className="text-secondary mb-0">Altere a busca ou limpe os filtros para ver outros estudantes.</p>
                  </td></tr>}
                </tbody>
              </Table>
            </div>
            <Paginacao paginaAtual={paginaExibida} totalPaginas={totalPaginas} aoMudarPagina={setPaginaAtual}
              textoResumo={`Mostrando ${primeiroExibido}–${ultimoExibido} de ${filtrados.length} alunos`} />
          </section>
        </Container>
      </main>
      <DetalhesAluno key={alunoSelecionadoId || 'fechado'} aberto={Boolean(alunoSelecionado)} aluno={alunoSelecionado}
        perfil={dadosDiretor.diretor.role} orientadores={orientadores} aoAtualizar={atualizarAluno}
        aoFechar={() => setAlunoSelecionadoId(null)} />
      <Footer />
    </div>
  );
}

export default PainelAlunosDiretor;
