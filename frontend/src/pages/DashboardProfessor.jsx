import { useState } from 'react';
import { Col, Container, Row, Table } from 'react-bootstrap';
import { BriefcaseBusiness, RotateCcw, Search, TriangleAlert, Users, UserSearch } from 'lucide-react';
import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';
import CardPequeno from '../components/CardPequeno.jsx';
import Input from '../components/Input.jsx';
import Select from '../components/Select.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import Botao from '../components/Button.jsx';
import Paginacao from '../components/Paginacao.jsx';
import DetalhesAluno from '../components/aluno/DetalhesAluno.jsx';
import professor from '../data/professor.js';
import alunosIniciais from '../data/alunos.js';
import { aplicarAcaoAluno } from '../utils/gestaoAluno.js';
import '../App.css';
import './DashboardProfessor.css';

const ITENS_POR_PAGINA = 10;
const normalizar = (valor) => String(valor ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();

export default function DashboardProfessor() {
  const [alunos, setAlunos] = useState(alunosIniciais);
  const [busca, setBusca] = useState('');
  const [curso, setCurso] = useState('');
  const [periodo, setPeriodo] = useState('');
  const [pagina, setPagina] = useState(1);
  const [selecionadoId, setSelecionadoId] = useState(null);
  const alunoSelecionado = alunos.find((aluno) => aluno.id === selecionadoId);
  const cursos = [...new Set(alunos.map((aluno) => aluno.curso))].sort();
  const periodos = [...new Set(alunos.map((aluno) => aluno.semestre).filter(Boolean))].sort((a, b) => a - b);
  const termo = normalizar(busca);
  const filtrados = alunos.filter((aluno) => (!curso || aluno.curso === curso)
    && (!periodo || String(aluno.semestre) === periodo)
    && [aluno.nome, aluno.matricula].some((valor) => normalizar(valor).includes(termo)));
  const totalPaginas = Math.max(1, Math.ceil(filtrados.length / ITENS_POR_PAGINA));
  const paginaAtual = Math.min(pagina, totalPaginas);
  const inicio = (paginaAtual - 1) * ITENS_POR_PAGINA;
  const visiveis = filtrados.slice(inicio, inicio + ITENS_POR_PAGINA);
  const indicadores = [
    { titulo: 'Total de alunos', valor: alunos.length, texto: 'Alunos cadastrados no campus', icone: <Users size={23} />, variante: 'azul' },
    { titulo: 'Estágios ativos', valor: alunos.filter((aluno) => aluno.situacao === 'Em estágio ativo').length, texto: 'Vínculos regulares vigentes', icone: <BriefcaseBusiness size={23} />, variante: 'verde' },
    { titulo: 'Pendências documentais', valor: alunos.reduce((total, aluno) => total + aluno.documentos.filter((documento) => !['Aprovado', 'Deferido'].includes(documento.status)).length, 0), texto: 'Documentos aguardando análise ou ajuste', icone: <TriangleAlert size={23} />, variante: 'ambar' },
    { titulo: 'Sem vínculo', valor: alunos.filter((aluno) => !aluno.estagio).length, texto: 'Disponíveis para novas vagas', icone: <UserSearch size={23} />, variante: 'cinza' },
  ];
  const limparFiltros = () => { setBusca(''); setCurso(''); setPeriodo(''); setPagina(1); };
  const atualizarAluno = (acao) => {
    const atualizado = aplicarAcaoAluno(alunoSelecionado, acao, { perfil: professor.role });
    setAlunos((atuais) => atuais.map((aluno) => aluno.id === atualizado.id ? atualizado : aluno));
  };

  return (
    <div className="dashboard-professor d-flex flex-column min-vh-100">
      <Header usuario={professor} paginaAtiva="Dashboard" />
      <main className="flex-grow-1 py-4">
        <Container className="px-3 dashboard-professor-container">
          <div className="mb-4">
            <h1 className="dashboard-professor-titulo">Gerenciar alunos</h1>
            <p className="text-secondary mb-0">Monitore a situação dos alunos do campus de forma centralizada</p>
          </div>
          <Row className="g-4 mb-4">{indicadores.map((indicador) => (
            <Col key={indicador.titulo} xs={12} sm={6} lg={3}><CardPequeno {...indicador} /></Col>
          ))}</Row>
          <section className="cartao-sage" aria-label="Alunos do campus">
            <Row className="g-3 mb-4 align-items-end">
              <Col xs={12} lg={6}>
                <div className="dashboard-professor-busca">
                  <Search size={16} aria-hidden="true" />
                  <Input id="buscar-aluno-professor" tipo="search" aria-label="Buscar por nome ou matrícula" placeholder="Buscar por nome ou matrícula..."
                    className="mb-0" value={busca} onChange={(evento) => { setBusca(evento.target.value); setPagina(1); }} onSubmit={(evento) => evento.preventDefault()} />
                </div>
              </Col>
              <Col xs={12} sm={6} lg={3}>
                <Select id="curso-professor" aria-label="Filtrar por curso" className="mb-0" value={curso}
                  onChange={(evento) => { setCurso(evento.target.value); setPagina(1); }} opcoes={[{ valor: '', rotulo: 'Curso: todos' }, ...cursos]} />
              </Col>
              <Col xs={12} sm={6} lg={3}>
                <Select id="periodo-professor" aria-label="Filtrar por período" className="mb-0" value={periodo}
                  onChange={(evento) => { setPeriodo(evento.target.value); setPagina(1); }}
                  opcoes={[{ valor: '', rotulo: 'Período: todos' }, ...periodos.map((semestre) => ({ valor: String(semestre), rotulo: `${semestre}º semestre` }))]} />
              </Col>
            </Row>
            {(busca || curso || periodo) && <Botao tipo="botao-acao-contorno" className="gap-2 mb-3" onClick={limparFiltros}><RotateCcw size={14} aria-hidden="true" /> Limpar filtros</Botao>}
            <p className="d-lg-none small text-secondary">Deslize a tabela para ver todas as informações e ações.</p>
            <div className="tabela-sage-container" tabIndex={0} role="region" aria-label="Tabela de alunos, role horizontalmente para ver todas as colunas">
              <Table className="tabela-sage dashboard-professor-tabela">
                <caption className="visually-hidden">Alunos e situação dos estágios</caption>
                <thead><tr>{['Matrícula', 'Nome do aluno', 'Curso', 'Empresa concedente', 'Status', 'Ações'].map((titulo) => <th key={titulo} scope="col">{titulo}</th>)}</tr></thead>
                <tbody>{visiveis.map((aluno) => <tr key={aluno.id}>
                  <td className="text-nowrap">{aluno.matricula}</td>
                  <td className="fw-semibold">{aluno.nome}</td>
                  <td>{aluno.curso}</td>
                  <td>{aluno.estagio?.empresa || 'Sem vínculo'}</td>
                  <td><StatusBadge status={aluno.situacao} /></td>
                  <td><Botao tipo="botao-sage-verde" className="dashboard-professor-perfil" onClick={() => setSelecionadoId(aluno.id)} aria-label={`Ver perfil de ${aluno.nome}`}>Ver perfil</Botao></td>
                </tr>)}</tbody>
              </Table>
              {filtrados.length === 0 && <p className="text-center text-secondary py-4" role="status">Nenhum aluno encontrado para os filtros selecionados.</p>}
            </div>
            <Paginacao paginaAtual={paginaAtual} totalPaginas={totalPaginas} aoMudarPagina={setPagina}
              textoResumo={filtrados.length ? `Mostrando ${inicio + 1}–${inicio + visiveis.length} de ${filtrados.length} alunos` : 'Nenhum aluno encontrado'} />
          </section>
        </Container>
      </main>
      <Footer />
      {alunoSelecionado && <DetalhesAluno key={alunoSelecionado.id} aberto aluno={alunoSelecionado} perfil={professor.role}
        aoFechar={() => setSelecionadoId(null)} aoAtualizar={atualizarAluno} />}
    </div>
  );
}
