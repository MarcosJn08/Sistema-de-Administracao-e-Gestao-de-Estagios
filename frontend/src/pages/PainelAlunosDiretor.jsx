import { useEffect, useMemo, useState } from 'react';
import { Container, Row, Col, Table, ProgressBar } from 'react-bootstrap';
import { Users, BriefcaseBusiness, GraduationCap, UserSearch, Search, Eye, Plus, RotateCcw } from 'lucide-react';
import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';
import CardPequeno from '../components/CardPequeno.jsx';
import Input from '../components/Input/Input.jsx';
import Select from '../components/Select.jsx';
import Button from "../components/Button/Button.jsx";
import StatusBadge from '../components/StatusBadge.jsx';
import Paginacao from '../components/Paginacao.jsx';
import DetalhesAluno from '../components/aluno/DetalhesAluno.jsx';
import ModalCadastroAluno from '../components/aluno/ModalCadastroAluno.jsx';
import ModalVinculoOrientador from '../components/orientador/ModalVinculoOrientador.jsx';
import ToastAlerta from '../components/ToastAlerta.jsx';
import useConsultaApi from '../hooks/useConsultaApi.js';
import dadosDiretor from '../data/diretor.js';
import { situacoesEstagio } from '../data/alunos.js';
import { aplicarAcaoAluno } from '../utils/gestaoAluno.js';
import { listarVinculosOrientacao, vinculoPodeSerAlterado } from '../utils/vinculosOrientacao.js';
import api from '../services/api.js';
import '../App.css';
import './PainelAlunosDiretor.css';

const normalizar = (valor) => String(valor ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
const ITENS_POR_PAGINA = 10;
const SITUACAO_ESTAGIO = {
  RASCUNHO: 'Rascunho',
  EM_ANDAMENTO: 'Em estágio ativo',
  CONCLUIDO: 'Concluído',
  ENCERRADO: 'Encerrado',
  CANCELADO_DESVIO_FUNCAO: 'Cancelado',
};
const opcoesSituacao = [...new Set([...situacoesEstagio, ...Object.values(SITUACAO_ESTAGIO)])];
const dataBrasileira = (data) => data?.split('-').reverse().join('/');

function exibirEstagioDoAluno(aluno, vinculos = []) {
  const principal = vinculos.find(({ estagio }) => estagio.status === 'EM_ANDAMENTO')
    ?? vinculos.find(({ estagio }) => estagio.status === 'RASCUNHO')
    ?? vinculos[0];
  if (!principal) return aluno;

  const { discente, estagio, orientador } = principal;
  return {
    ...aluno,
    semestre: discente.semestre,
    situacao: SITUACAO_ESTAGIO[estagio.status] ?? estagio.status,
    estagioVinculado: {
      empresa: estagio.empresa,
      professorOrientador: orientador?.nome ?? 'Sem orientador',
      supervisorEstagio: estagio.supervisor,
      dataInicio: dataBrasileira(estagio.data_inicio),
      dataFim: dataBrasileira(estagio.data_termino),
    },
    progresso: {
      ...aluno.progresso,
      metaHoras: discente.carga_horaria_exigida,
      horasEstagio: estagio.horas_cumpridas,
      horasConcluidas: estagio.horas_cumpridas + aluno.progresso.horasProjeto,
    },
  };
}

function PainelAlunosDiretor() {
  const [alunos, setAlunos] = useState([]);
  const [busca, setBusca] = useState('');
  const [curso, setCurso] = useState('');
  const [situacao, setSituacao] = useState('');
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [cadastroAberto, setCadastroAberto] = useState(false);
  const [alunoSelecionadoId, setAlunoSelecionadoId] = useState(null);
  const [vinculoAberto, setVinculoAberto] = useState(false);
  const [toast, setToast] = useState({ mensagem: '', tipo: 'sucesso' });
  const [cursos, setCursos] = useState([]);
  const { dados: dadosOrientacao, carregando: carregandoVinculos, erro: erroVinculos, recarregar: recarregarVinculos } =
    useConsultaApi('/orientadores');

  const vinculosPorAluno = useMemo(() => {
    const porAluno = new Map();
    const vinculos = listarVinculosOrientacao(dadosOrientacao).sort((a, b) => b.estagio.id - a.estagio.id);
    for (const vinculo of vinculos) {
      const id = vinculo.discente.id;
      if (!porAluno.has(id)) porAluno.set(id, []);
      porAluno.get(id).push(vinculo);
    }
    return porAluno;
  }, [dadosOrientacao]);

  useEffect(() => {
    api.get('/cursos', { params: { status: 'ativo', per_page: 100 } })
      .then((res) => {
        const nomes = (res?.data?.data || res?.data || []).map((c) => c.nome);
        setCursos(nomes);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    let ativo = true;
    api.get('/usuarios', { params: { perfil: 'ALUNO', per_page: 100 } })
      .then((resposta) => {
        if (!ativo) return;
        const usuariosApi = resposta?.data?.data || [];
        const novos = usuariosApi.map((u) => ({
          id: u.id,
          alunoId: u.aluno_id,
          nome: u.nome,
          matricula: u.matricula || '---',
          cpf: u.cpf || 'Não informado',
          email: u.email,
          telefone: u.telefone || '(38) 99999-0000',
          curso: u.curso || '',
          semestre: 1,
          situacao: 'Sem estágio',
          progresso: { horasConcluidas: 0, metaHoras: 200, horasEstagio: 0, horasProjeto: 0 },
          estagio: null,
          documentos: [],
        }));
        setAlunos(novos);
      })
      .catch((err) => console.warn('Erro ao carregar alunos da API:', err));

    return () => { ativo = false; };
  }, []);
  const alunosExibidos = alunos.map((aluno) => exibirEstagioDoAluno(aluno, vinculosPorAluno.get(aluno.alunoId)));
  const alunoSelecionado = alunosExibidos.find((aluno) => aluno.id === alunoSelecionadoId);
  const estagiosDoAluno = (vinculosPorAluno.get(alunoSelecionado?.alunoId) ?? []).filter(vinculoPodeSerAlterado);
  const atualizarAluno = (acao) => {
    const aluno = alunos.find(({ id }) => id === alunoSelecionadoId);
    const atualizado = aplicarAcaoAluno(aluno, acao, { perfil: dadosDiretor.diretor.role, alunos });
    setAlunos((atuais) => atuais.map((aluno) => aluno.id === atualizado.id ? atualizado : aluno));
  };
  const vinculoSalvo = (estagio, orientador) => {
    setVinculoAberto(false);
    setToast({ mensagem: `Estágio #${estagio.id} vinculado a ${orientador.nome}.`, tipo: 'sucesso' });
    recarregarVinculos();
  };
  const termo = normalizar(busca);
  const digitos = termo.replace(/\D/g, '');
  const buscaNumerica = /^[\d.\s/-]+$/.test(termo) && digitos.length > 0;
  const filtrados = alunosExibidos.filter((aluno) => {
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
  const contar = (status) => alunosExibidos.filter((aluno) => aluno.situacao === status).length;
  const indicadores = [
    { titulo: 'Total de alunos cadastrados', valor: alunos.length, texto: 'Alunos matriculados no campus', icone: <Users size={23} />, variante: 'azul' },
    { titulo: 'Estudantes em estágio ativo', valor: contar('Em estágio ativo'), texto: 'Com vínculo vigente', icone: <BriefcaseBusiness size={23} />, variante: 'verde' },
    { titulo: 'Estágios concluídos', valor: contar('Concluído'), texto: 'Carga horária homologada', icone: <GraduationCap size={23} />, variante: 'verde' },
    { titulo: 'Sem vínculo / em busca de vaga', valor: contar('Sem estágio'), texto: 'Disponíveis para novas vagas', icone: <UserSearch size={23} />, variante: 'cinza' },
  ];
  const limparFiltros = () => { setBusca(''); setCurso(''); setSituacao(''); setPaginaAtual(1); };
  const cadastrarAluno = async (dados) => {
    if (!dados.nome || !dados.matricula || !dados.cpf || !dados.dataNascimento || !dados.email || !dados.telefone
      || !dados.curso || !dados.semestre || !dados.periodoAno || !dados.turno || !dados.cep || !dados.logradouro
      || !dados.numero || !dados.bairro || !dados.cidade || !dados.estado) {
      throw new Error('Preencha os campos obrigatórios.');
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(dados.email)) {
      throw new Error('Informe um e-mail válido.');
    }
    if (alunos.some((aluno) => aluno.matricula === dados.matricula)) {
      throw new Error('Já existe um aluno com esta matrícula.');
    }
    if (alunos.some((aluno) => aluno.cpf === dados.cpf)) {
      throw new Error('Já existe um aluno com este CPF.');
    }

    const { data: resultado } = await api.post('/usuarios', {
      nome: dados.nome,
      email: dados.email,
      password: dados.matricula + '@Sage',
      perfil: 'ALUNO',
      matricula: dados.matricula,
      cpf: dados.cpf,
      curso: dados.curso,
      telefone: dados.telefone,
    });

    const usuarioCriado = resultado?.data;

    setAlunos((atuais) => [{
      ...dados,
      id: usuarioCriado?.id ?? `aluno-${Date.now()}`,
      alunoId: usuarioCriado?.aluno_id,
      situacao: 'Sem estágio',
      progresso: { horasConcluidas: 0, metaHoras: 200, horasEstagio: 0, horasProjeto: 0 },
      estagio: null,
      documentos: [],
    }, ...atuais]);
    setToast({ mensagem: 'Aluno cadastrado com sucesso!', tipo: 'sucesso' });
    setPaginaAtual(1);
  };

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
          <div className="painel-alunos-cabecalho">
            <div>
              <h1 className="painel-alunos-titulo">Painel geral de alunos</h1>
              <p className="text-secondary mb-0">Visão consolidada de todos os discentes e seus respectivos vínculos de estágio no IFNMG Campus Almenara</p>
            </div>
            <Button tipo="botao-sage-verde" className="gap-2" onClick={() => setCadastroAberto(true)}>
              <Plus size={17} aria-hidden="true" /> Cadastrar aluno
            </Button>
          </div>
          <Row className="g-4 mb-4">
            {indicadores.map((indicador) => (
              <Col xs={12} sm={6} lg={3} key={indicador.titulo}>
                <CardPequeno {...indicador} />
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
                  opcoes={[{ valor: '', rotulo: 'Todos' }, ...opcoesSituacao]} />
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
                <Button tipo="botao-sage-verde" onClick={limparFiltros} className="gap-2">
                  <RotateCcw size={15} aria-hidden="true" /> Limpar filtros
                </Button>
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
                    const estagio = aluno.estagio ?? aluno.estagioVinculado;
                    const percentual = metaHoras > 0 ? Math.min(100, Math.max(0, Math.floor(horasConcluidas / metaHoras * 100))) : 0;
                    return (
                      <tr key={aluno.id}>
                        <td><span className="fw-bold d-block">{aluno.nome}</span><span className="small text-secondary">{aluno.matricula}</span></td>
                        <td><span className="d-block">{aluno.curso}</span><span className="small text-secondary">{aluno.semestre}º semestre</span></td>
                        <td><span className="d-block">{estagio?.empresa || 'Sem vínculo'}</span><span className="small text-secondary">{estagio?.professorOrientador || 'Sem orientador'}</span></td>
                        <td>
                          <div className="d-flex justify-content-between gap-2 small mb-2"><span>{horasConcluidas}h / {metaHoras}h</span><strong>{percentual}%</strong></div>
                          <ProgressBar now={percentual} aria-label={`Carga horária de ${aluno.nome}`} />
                        </td>
                        <td><StatusBadge status={aluno.situacao} /></td>
                        <td><Button tipo="botao-sage-verde" className="gap-2 text-nowrap" onClick={() => setAlunoSelecionadoId(aluno.id)} aria-label={`Ver detalhes de ${aluno.nome}`}>
                          <Eye size={16} aria-hidden="true" /> Ver Detalhes
                        </Button></td>
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
      {alunoSelecionado && (vinculoAberto ? (
        <ModalVinculoOrientador aluno={alunoSelecionado} vinculos={estagiosDoAluno} orientadores={dadosOrientacao?.orientadores}
          carregando={carregandoVinculos} erroConsulta={erroVinculos} aoRecarregar={recarregarVinculos}
          aoSalvar={vinculoSalvo} aoFechar={() => setVinculoAberto(false)} />
      ) : (
        <DetalhesAluno key={alunoSelecionadoId} aberto aluno={alunoSelecionado} perfil={dadosDiretor.diretor.role}
          aoAtualizar={atualizarAluno} aoVincularProfessor={() => setVinculoAberto(true)}
          aoFechar={() => setAlunoSelecionadoId(null)} />
      ))}
      <ModalCadastroAluno key={cadastroAberto ? 'cadastro-aberto' : 'cadastro-fechado'} aberto={cadastroAberto}
        cursos={cursos} aoCadastrar={cadastrarAluno} aoFechar={() => setCadastroAberto(false)} />
      <ToastAlerta mensagem={toast.mensagem} tipo={toast.tipo} aoFechar={() => setToast({ mensagem: '', tipo: 'sucesso' })} />
      <Footer />
    </div>
  );
}

export default PainelAlunosDiretor;
