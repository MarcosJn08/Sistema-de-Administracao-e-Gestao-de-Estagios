import { useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Bookmark, BriefcaseBusiness, GraduationCap, Save, Send, Sparkles } from 'lucide-react';
import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';
import Botao from '../components/Button.jsx';
import SeletorHabilidades from '../components/aluno/SeletorHabilidades.jsx';
import AnexosPerfil from '../components/aluno/AnexosPerfil.jsx';
import { habilidadesPredefinidas, separarHabilidades } from '../data/habilidades.js';
import { guardarAnexos } from '../utils/anexosPerfil.js';
import dados from '../data/aluno.js';
import vagas from '../data/vagas.json';
import { carregarPerfilAluno, salvarPerfilAluno } from '../utils/candidaturaAluno.js';
import '../components/vagas/ModalCandidatura.css';
import './PerfilAluno.css';

export default function PerfilAluno() {
  const [perfil, setPerfil] = useState(carregarPerfilAluno);
  const [selecionadas, setSelecionadas] = useState(() => separarHabilidades(perfil.habilidades).selecionadas);
  const [habilidades, setHabilidades] = useState(() => separarHabilidades(perfil.habilidades).outras);
  const [anexando, setAnexando] = useState(false);
  const [erroAnexo, setErroAnexo] = useState('');
  const [erro, setErro] = useState('');
  const [salvo, setSalvo] = useState(false);
  const [params] = useSearchParams();
  const { hash } = useLocation();
  const navigate = useNavigate();
  const vaga = vagas.find((item) => String(item.id) === params.get('vaga'));
  const retorno = vaga ? `/sage/vagas/${vaga.id}/candidatura` : '/sage/aluno';

  function atualizarFormacao(evento) {
    setPerfil({ ...perfil, formacao: { ...perfil.formacao, [evento.target.name]: evento.target.value } });
    setSalvo(false);
  }

  function salvar(evento) {
    evento.preventDefault();
    if (anexando) return;
    try {
      const atualizado = salvarPerfilAluno({ ...perfil, habilidades: [...selecionadas, ...habilidades.split(/[,;\n]/)] });
      setPerfil(atualizado);
      const separadas = separarHabilidades(atualizado.habilidades);
      setSelecionadas(separadas.selecionadas);
      setHabilidades(separadas.outras);
      setErro('');
      setSalvo(true);
      if (vaga) navigate(retorno);
    } catch (error) {
      setErro(error.name === 'QuotaExceededError' || error.name === 'SecurityError'
        ? 'Não foi possível salvar o perfil. Verifique o armazenamento do navegador e tente novamente.' : error.message);
    }
  }

  async function anexar(evento) {
    const arquivos = Array.from(evento.target.files || []);
    evento.target.value = '';
    if (!arquivos.length) return;
    setAnexando(true);
    setErroAnexo('');
    try {
      const adicionados = await guardarAnexos(arquivos, perfil.anexos);
      setPerfil((atual) => ({ ...atual, anexos: [...atual.anexos, ...adicionados] }));
      setSalvo(false);
    } catch (error) { setErroAnexo(error.message); }
    finally { setAnexando(false); }
  }

  return (
    <div className="perfil-aluno-pagina d-flex flex-column min-vh-100">
      <Header usuario={dados.aluno} />
      <main className="perfil-aluno-edicao flex-grow-1">
        <Link to={retorno} className="perfil-aluno-voltar"><ArrowLeft size={16} aria-hidden="true" /> {vaga ? 'Voltar à candidatura' : 'Voltar ao dashboard'}</Link>
        <h1>Meu perfil</h1>
        <p className="perfil-aluno-descricao">Atualize sua formação, habilidades e experiências para apresentar às empresas.</p>
        {vaga && <div className="alert alert-info">Você está se candidatando a <strong>{vaga.titulo}</strong>. Ao salvar, você voltará à candidatura com sua carta preservada.</div>}
        <div className="perfil-aluno-identidade"><strong>{dados.aluno.nome}</strong><span>{dados.aluno.email} · Matrícula {dados.aluno.matricula}</span></div>
        {!vaga && <nav className="perfil-aluno-atalhos" aria-label="Atalhos do aluno">
          <Link to="/sage/aluno/vagas-salvas"><Bookmark size={17} aria-hidden="true" /> Vagas salvas</Link>
          <Link to="/sage/aluno/candidaturas"><Send size={17} aria-hidden="true" /> Minhas candidaturas</Link>
          <Link to="/sage/aluno/estagios"><BriefcaseBusiness size={17} aria-hidden="true" /> Meus estágios</Link>
        </nav>}
        {erro && <div className="alert alert-danger" role="alert">{erro}</div>}
        {salvo && <div className="alert alert-success" role="status">Perfil atualizado com sucesso.</div>}
        <form onSubmit={salvar}>
          <section id="formacao" className="candidatura-card" aria-labelledby="perfil-formacao-titulo">
            <h2 id="perfil-formacao-titulo"><GraduationCap size={21} aria-hidden="true" /> Formação</h2>
            <label htmlFor="perfil-curso">Curso</label>
            <input id="perfil-curso" name="curso" className="form-control" required maxLength={150} value={perfil.formacao.curso} onChange={atualizarFormacao} autoFocus={hash === '#formacao'} />
            <label htmlFor="perfil-instituicao">Instituição</label>
            <input id="perfil-instituicao" name="instituicao" className="form-control" required maxLength={150} value={perfil.formacao.instituicao} onChange={atualizarFormacao} />
            <label htmlFor="perfil-periodo">Período / situação acadêmica</label>
            <input id="perfil-periodo" name="periodo" className="form-control" maxLength={100} value={perfil.formacao.periodo} onChange={atualizarFormacao} placeholder="Ex.: 4º período — cursando" />
          </section>
          <section id="habilidades" className="candidatura-card" aria-labelledby="perfil-habilidades-titulo">
            <h2 id="perfil-habilidades-titulo"><Sparkles size={21} aria-hidden="true" /> Habilidades</h2>
            <p>Selecione suas habilidades:</p>
            <SeletorHabilidades habilidades={habilidadesPredefinidas} selecionadas={selecionadas} aoAlternar={(habilidade) => {
              setSelecionadas((atuais) => atuais.includes(habilidade) ? atuais.filter((item) => item !== habilidade) : [...atuais, habilidade]);
              setSalvo(false);
            }} />
            <label htmlFor="perfil-habilidades">Outras habilidades</label>
            <textarea id="perfil-habilidades" rows={4} maxLength={1000} value={habilidades} autoFocus={hash === '#habilidades'}
              onChange={(evento) => { setHabilidades(evento.target.value); setSalvo(false); }}
              placeholder="Adicione habilidades que não aparecem nas opções acima" aria-describedby="perfil-habilidades-ajuda" />
            <p id="perfil-habilidades-ajuda" className="mt-2 mb-0">Separe por vírgula ou por linha. As opções selecionadas e as adicionais serão incluídas nas próximas candidaturas.</p>
          </section>
          <section id="experiencia" className="candidatura-card" aria-labelledby="perfil-experiencia-titulo">
            <h2 id="perfil-experiencia-titulo"><BriefcaseBusiness size={21} aria-hidden="true" /> Experiência prévia</h2>
            <label htmlFor="perfil-experiencia">Conte sobre suas experiências</label>
            <textarea id="perfil-experiencia" rows={5} maxLength={3000} value={perfil.experiencia} autoFocus={hash === '#experiencia'}
              onChange={(evento) => { setPerfil({ ...perfil, experiencia: evento.target.value }); setSalvo(false); }}
              placeholder="Inclua estágios, projetos acadêmicos, monitorias, trabalhos voluntários ou outras experiências. Este campo é opcional." />
            <label htmlFor="perfil-anexos">Arquivos anexados</label>
            <input id="perfil-anexos" className="form-control" type="file" multiple accept=".pdf,.png,.jpg,.jpeg" onChange={anexar} disabled={anexando} aria-describedby="perfil-anexos-ajuda" />
            <p id="perfil-anexos-ajuda" className="mt-2">Anexe certificados e comprovantes. Até 5 arquivos PDF, PNG ou JPG de 5 MB cada. Salve o perfil para confirmar as alterações.</p>
            {anexando && <p role="status">Preparando anexos…</p>}
            {erroAnexo && <p className="text-danger" role="alert">{erroAnexo}</p>}
            <AnexosPerfil anexos={perfil.anexos} desabilitado={anexando} aoRemover={(id) => {
              setPerfil((atual) => ({ ...atual, anexos: atual.anexos.filter((anexo) => anexo.id !== id) }));
              setSalvo(false);
            }} />
          </section>
          <div className="perfil-aluno-acoes">
            <Link to={retorno} className="perfil-aluno-voltar">Cancelar</Link>
            <Botao tipo="botao-sage-verde" className="gap-2" type="submit" disabled={anexando}><Save size={17} aria-hidden="true" /> {vaga ? 'Salvar e voltar à candidatura' : 'Salvar perfil'}</Botao>
          </div>
        </form>
      </main>
      <Footer />
    </div>
  );
}
