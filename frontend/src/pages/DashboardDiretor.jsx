import { useMemo, useState, useEffect } from 'react';
import { Alert, Col, Container, Row } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';
import CardPequeno from '../components/CardPequeno.jsx';
import CardDocumentos from '../components/diretor/CardDocumentos.jsx';
import CardEstagiosPorStatus from '../components/diretor/CardEstagiosPorStatus.jsx';
import CardAtividadeRecente from '../components/diretor/CardAtividadeRecente.jsx';
import CardAcoesRapidas from '../components/diretor/CardAcoesRapidas.jsx';
import CardProximosVencimentos from '../components/diretor/CardProximosVencimentos.jsx';
import ModalAnaliseDocumento from '../components/documento/ModalAnaliseDocumento.jsx';
import ModalCadastroAluno from '../components/aluno/ModalCadastroAluno.jsx';
import ModalProfessor from '../components/orientador/ModalProfessor.jsx';
import ToastAlerta from '../components/ToastAlerta.jsx';
import dados from '../data/diretor.js';
import documentosIniciais from '../data/documentos.js';
import alunosIniciais, { cursos } from '../data/alunos.js';
import orientadoresIniciais, { departamentos, statusOrientador } from '../data/orientadores.js';
import { avaliarDocumento } from '../utils/gestaoDocumento.js';
import api from '../services/api.js';
import '../App.css';

const normalizar = (valor) => String(valor ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();

function DashboardDiretor() {
  const navigate = useNavigate();
  const [documentos, setDocumentos] = useState(documentosIniciais);
  const [alunos, setAlunos] = useState([]);
  const [orientadores, setOrientadores] = useState([]);
  const [documentoSelecionado, setDocumentoSelecionado] = useState(null);
  const [cadastroAlunoAberto, setCadastroAlunoAberto] = useState(false);
  const [cadastroProfessorAberto, setCadastroProfessorAberto] = useState(false);
  const [mensagem, setMensagem] = useState('');

  useEffect(() => {
    let ativo = true;
    api.get('/usuarios', { params: { perfil: 'ALUNO', per_page: 100 } })
      .then((res) => {
        if (!ativo) return;
        const usuariosApi = res?.data?.data || [];
        const novos = usuariosApi.map((u) => ({
          id: u.id,
          nome: u.nome,
          matricula: u.matricula || '---',
          cpf: u.cpf || 'Não informado',
          email: u.email,
          telefone: u.telefone || '(38) 99999-0000',
          curso: u.curso || cursos[0],
          semestre: 1,
          situacao: 'Sem estágio',
          progresso: { horasConcluidas: 0, metaHoras: 200, horasEstagio: 0, horasProjeto: 0 },
          estagio: null,
          documentos: [],
        }));
        setAlunos(novos);
      })
      .catch((err) => console.warn('Erro ao carregar alunos:', err));

    api.get('/usuarios', { params: { perfil: 'PROFESSOR', per_page: 100 } })
      .then((res) => {
        if (!ativo) return;
        const usuariosApi = res?.data?.data || [];
        const novos = usuariosApi.map((u) => ({
          id: u.id,
          nome: u.nome,
          siape: u.siape || '---',
          cpf: u.cpf || 'Não informado',
          email: u.email,
          telefone: u.telefone || '(38) 99999-0000',
          titulacao: u.titulacao || 'Não informada',
          departamento: u.departamento || 'Informática',
          areaAtuacao: u.area_atuacao || u.departamento || 'Geral',
          regimeTrabalho: u.regime_trabalho || 'Dedicação exclusiva',
          maximoOrientandos: u.max_orientados || 5,
          alunosOrientados: 0,
          disponivelOrientacao: u.status === 'ativo',
          status: u.status === 'inativo' ? 'Inativo' : 'Ativo',
          novoNesteSemestre: true,
        }));
        setOrientadores(novos);
      })
      .catch((err) => console.warn('Erro ao carregar professores:', err));

    return () => { ativo = false; };
  }, []);

  const pendencias = useMemo(() => documentos
    .filter((documento) => documento.status !== 'Deferido')
    .slice(0, 5)
    .map((documento) => ({
      id: documento.id,
      nome: documento.aluno,
      descricao: documento.nome,
      empresa: documento.empresa,
      data: documento.data,
      status: documento.status,
      acoes: [['Pendente', 'Em análise'].includes(documento.status) ? 'Analisar' : 'Ver'],
    })), [documentos]);

  const documentoAberto = documentos.find((documento) => documento.id === documentoSelecionado?.id);

  const salvarAvaliacao = (id, decisao, observacoes, devolucao = {}) => {
    const documento = documentos.find((item) => item.id === id);
    const atualizado = avaliarDocumento(documento, decisao, observacoes, dados.diretor.nome, new Date(), devolucao);
    setDocumentos((atuais) => atuais.map((item) => item.id === id ? atualizado : item));
    setMensagem(`${documento.nome} de ${documento.aluno}: ${atualizado.status.toLowerCase()}.`);
  };

  const cadastrarAluno = async (novoAluno) => {
    if (!novoAluno.nome || !novoAluno.matricula || !novoAluno.email) {
      throw new Error('Preencha os campos obrigatórios.');
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(novoAluno.email)) throw new Error('Informe um e-mail válido.');

    const { data: resultado } = await api.post('/usuarios', {
      nome: novoAluno.nome,
      email: novoAluno.email,
      password: novoAluno.matricula + '@Sage',
      perfil: 'ALUNO',
      matricula: novoAluno.matricula,
      cpf: novoAluno.cpf,
      curso: novoAluno.curso,
      telefone: novoAluno.telefone,
    });

    const usuarioCriado = resultado?.data;

    setAlunos((atuais) => [{
      ...novoAluno,
      id: usuarioCriado?.id ?? `aluno-${Date.now()}`,
      situacao: 'Sem estágio',
      progresso: { horasConcluidas: 0, metaHoras: 200, horasEstagio: 0, horasProjeto: 0 },
      estagio: null,
      documentos: [],
    }, ...atuais]);
    setMensagem('Aluno cadastrado com sucesso.');
  };

  const salvarProfessor = async (professor) => {
    if (!professor.nome || !professor.siape || !professor.email) {
      throw new Error('Preencha os campos obrigatórios.');
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(professor.email)) throw new Error('Informe um e-mail institucional válido.');

    if (professor.id && !String(professor.id).startsWith('professor-')) {
      await api.put(`/usuarios/${professor.id}`, {
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
      });
    } else {
      await api.post('/usuarios', {
        nome: professor.nome,
        email: professor.email,
        password: professor.siape + '@Sage',
        perfil: 'PROFESSOR',
        siape: professor.siape,
        cpf: professor.cpf,
        titulacao: professor.titulacao,
        departamento: professor.departamento,
        areaAtuacao: professor.areaAtuacao,
        regimeTrabalho: professor.regimeTrabalho,
        telefone: professor.telefone,
        maximoOrientandos: professor.maximoOrientandos,
      });
    }

    setOrientadores((atuais) => [{ ...professor, id: professor.id ?? `professor-${Date.now()}` }, ...atuais.filter((p) => p.id !== professor.id)]);
    setMensagem(professor.id ? 'Orientador atualizado com sucesso.' : 'Orientador cadastrado com sucesso.');
  };

  const acoesRapidas = dados.acoesRapidas.map((acao) => {
    if (acao.id === 1) return { ...acao, href: undefined, aoClicar: () => setCadastroAlunoAberto(true) };
    if (acao.id === 2) return { ...acao, href: undefined, aoClicar: () => setCadastroProfessorAberto(true) };
    return { ...acao, href: undefined, aoClicar: () => navigate('/sage/diretor/convenios') };
  });

  return (
    <div className="d-flex flex-column min-vh-100" style={{ backgroundColor: '#f4f6f8' }}>
      <Header
        pagina01="Dashboard"
        pagina02="Alunos"
        pagina03="Orientadores"
        pagina04="Empresas"
        pagina05="Documentos"
        pagina06="Relatórios"
        paginaAtiva="Dashboard"
        usuario={dados.diretor}
      />

      <main className="flex-grow-1 py-4">
        <Container style={{ maxWidth: '1200px' }} className="px-3">
          <Row className="g-4 mb-4">
            {dados.indicadores.map((indicador) => <Col key={indicador.id} xs={12} sm={6} lg={3}>
              <CardPequeno
                titulo={indicador.titulo}
                valor={indicador.valor}
                texto={indicador.texto}
                icone={indicador.icone}
                cor={indicador.cor}
                corFundo={indicador.corFundo}
              />
            </Col>)}
          </Row>

          {mensagem && <Alert variant="success" dismissible onClose={() => setMensagem('')} role="status">{mensagem}</Alert>}

          <Row className="g-4 mb-4">
            <Col xs={12}>
              <CardDocumentos
                titulo="Pendências para análise"
                documentos={pendencias}
                textoVerTodos="Ver todas as pendências"
                aoVerTodos={() => navigate('/sage/diretor/documentos')}
                aoClicarAcao={(documento, acao) => setDocumentoSelecionado({ id: documento.id, visualizacao: acao === 'Ver' })}
              />
            </Col>
          </Row>

          <Row className="g-4">
            <Col xs={12} md={6}>
              <CardEstagiosPorStatus itens={dados.estagiosPorStatus.itens} total={dados.estagiosPorStatus.total} />
            </Col>
            <Col xs={12} md={6}>
              <CardAtividadeRecente atividades={dados.atividadesRecentes} />
            </Col>
            <Col xs={12} md={6}>
              <CardAcoesRapidas acoes={acoesRapidas} />
            </Col>
            <Col xs={12} md={6}>
              <CardProximosVencimentos itens={dados.proximosVencimentos} />
            </Col>
          </Row>
        </Container>
      </main>

      {documentoAberto && <ModalAnaliseDocumento key={`${documentoAberto.id}-${documentoSelecionado.visualizacao}`} documento={documentoAberto}
        visualizacao={documentoSelecionado.visualizacao} aoFechar={() => setDocumentoSelecionado(null)} aoAvaliar={salvarAvaliacao} />}
      <ModalCadastroAluno key={cadastroAlunoAberto ? 'cadastro-aluno-aberto' : 'cadastro-aluno-fechado'} aberto={cadastroAlunoAberto}
        cursos={cursos} aoCadastrar={cadastrarAluno} aoFechar={() => setCadastroAlunoAberto(false)} />
      <ModalProfessor key={cadastroProfessorAberto ? 'cadastro-professor-aberto' : 'cadastro-professor-fechado'} aberto={cadastroProfessorAberto}
        departamentos={departamentos} statusDisponiveis={statusOrientador} aoSalvar={salvarProfessor}
        aoFechar={() => setCadastroProfessorAberto(false)} />
      <ToastAlerta mensagem={mensagem} aoFechar={() => setMensagem('')} />
      <Footer />
    </div>
  );
}

export default DashboardDiretor;
