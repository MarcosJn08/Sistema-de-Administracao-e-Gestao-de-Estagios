import { useRef, useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Bookmark, BriefcaseBusiness, Save, Send, Sparkles, UserRound } from 'lucide-react';
import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';
import Botao from '../components/Button.jsx';
import SeletorHabilidades from '../components/aluno/SeletorHabilidades.jsx';
import AnexosPerfil from '../components/aluno/AnexosPerfil.jsx';
import FormacaoAluno from '../components/aluno/FormacaoAluno.jsx';
import SolicitarCorrecaoAcademica from '../components/aluno/SolicitarCorrecaoAcademica.jsx';
import { lerFotoPerfil } from '../utils/fotoPerfil.js';
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
  const [carregandoFoto, setCarregandoFoto] = useState(false);
  const [erroFoto, setErroFoto] = useState('');
  const [erroAnexo, setErroAnexo] = useState('');
  const [erro, setErro] = useState('');
  const [salvo, setSalvo] = useState(false);
  const mensagemSucessoRef = useRef(null);
  const [params] = useSearchParams();
  const { hash } = useLocation();
  const navigate = useNavigate();
  const vaga = vagas.find((item) => String(item.id) === params.get('vaga'));
  const retorno = vaga ? `/sage/vagas/${vaga.id}/candidatura` : '/sage/aluno';

  function atualizarPessoal(evento) {
    const { name, value } = evento.target;
    setPerfil((atual) => ({ ...atual, [name]: value }));
    setSalvo(false);
  }

  async function alterarFoto(evento) {
    const arquivo = evento.target.files?.[0];
    evento.target.value = '';
    if (!arquivo) return;
    setCarregandoFoto(true);
    setErroFoto('');
    try {
      const foto = await lerFotoPerfil(arquivo);
      setPerfil((atual) => ({ ...atual, foto }));
      setSalvo(false);
    } catch (error) { setErroFoto(error.message); }
    finally { setCarregandoFoto(false); }
  }

  function salvar(evento) {
    evento.preventDefault();
    if (anexando || carregandoFoto) return;
    try {
      const atualizado = salvarPerfilAluno({ ...perfil, habilidades: [...selecionadas, ...habilidades.split(/[,;\n]/)] });
      setPerfil(atualizado);
      const separadas = separarHabilidades(atualizado.habilidades);
      setSelecionadas(separadas.selecionadas);
      setHabilidades(separadas.outras);
      setErro('');
      setSalvo(true);
      if (vaga) {
        navigate(retorno);
      } else {
        requestAnimationFrame(() => {
          const mensagem = mensagemSucessoRef.current;
          if (!mensagem) return;
          mensagem.focus({ preventScroll: true });
          mensagem.scrollIntoView({
            behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',
            block: 'start',
          });
        });
      }
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
        <p className="perfil-aluno-descricao">Consulte seus dados acadêmicos e atualize seus dados pessoais, habilidades e experiências.</p>
        {vaga && <div className="alert alert-info">Você está se candidatando a <strong>{vaga.titulo}</strong>. Ao salvar, você voltará à candidatura com sua carta preservada.</div>}
        <div className="perfil-aluno-identidade"><strong>{dados.aluno.nome}</strong><span>{dados.aluno.email} · Matrícula {dados.aluno.matricula}</span></div>
        {!vaga && <nav className="perfil-aluno-atalhos" aria-label="Atalhos do aluno">
          <Link to="/sage/aluno/vagas-salvas"><Bookmark size={17} aria-hidden="true" /> Vagas salvas</Link>
          <Link to="/sage/aluno/candidaturas"><Send size={17} aria-hidden="true" /> Minhas candidaturas</Link>
          <Link to="/sage/aluno/estagios"><BriefcaseBusiness size={17} aria-hidden="true" /> Meus estágios</Link>
        </nav>}
        {erro && <div className="alert alert-danger" role="alert">{erro}</div>}
        {salvo && <div ref={mensagemSucessoRef} className="alert alert-success perfil-aluno-sucesso" role="status" tabIndex={-1}>Perfil atualizado com sucesso.</div>}
        <form onSubmit={salvar}>
          <FormacaoAluno id="formacao" formacao={perfil.formacao} acaoCorrecao={<SolicitarCorrecaoAcademica />} />
          <section id="dados-pessoais" className="candidatura-card" aria-labelledby="perfil-pessoais-titulo">
            <h2 id="perfil-pessoais-titulo"><UserRound size={21} aria-hidden="true" /> Dados pessoais</h2>
            <p>Você pode editar os dados abaixo. O e-mail institucional permanece vinculado ao registro acadêmico.</p>
            <div className="perfil-aluno-foto">
              <div className="perfil-aluno-foto-previa">{perfil.foto ? <img src={perfil.foto} alt="Sua foto de perfil" /> : <UserRound size={36} aria-hidden="true" />}</div>
              <div>
                <label htmlFor="perfil-foto">Foto de perfil</label>
                <input id="perfil-foto" type="file" className="form-control" accept="image/png,image/jpeg,image/webp" onChange={alterarFoto} disabled={carregandoFoto} aria-describedby="perfil-foto-ajuda" />
                <p id="perfil-foto-ajuda">PNG, JPG ou WebP de até 500 KB. Salve o perfil para confirmar.</p>
                {perfil.foto && <button type="button" className="formacao-aluno-correcao" disabled={carregandoFoto} onClick={() => { setPerfil((atual) => ({ ...atual, foto: '' })); setSalvo(false); }}>Remover foto</button>}
              </div>
            </div>
            {carregandoFoto && <p role="status">Carregando foto…</p>}
            {erroFoto && <p className="text-danger" role="alert">{erroFoto}</p>}
            <label htmlFor="perfil-telefone">Telefone de contato / WhatsApp</label>
            <input id="perfil-telefone" name="telefone" type="tel" autoComplete="tel" className="form-control" maxLength={25} value={perfil.telefone} onChange={atualizarPessoal} placeholder="(33) 99999-9999" />
            <label htmlFor="perfil-endereco">Endereço residencial</label>
            <input id="perfil-endereco" name="endereco" autoComplete="street-address" className="form-control" maxLength={300} value={perfil.endereco} onChange={atualizarPessoal} placeholder="Rua, número, complemento, bairro, cidade e UF" />
            <label htmlFor="perfil-cep">CEP</label>
            <input id="perfil-cep" name="cep" inputMode="numeric" autoComplete="postal-code" className="form-control" maxLength={9} value={perfil.cep} onChange={atualizarPessoal} placeholder="00000-000" />
            <p className="mt-2 mb-0">O endereço e o CEP ficam no seu cadastro e não são incluídos na candidatura.</p>
          </section>
          <section id="habilidades" className="candidatura-card" aria-labelledby="perfil-habilidades-titulo">
            <h2 id="perfil-habilidades-titulo"><Sparkles size={21} aria-hidden="true" /> Habilidades</h2>
            <label htmlFor="perfil-resumo">Resumo profissional</label>
            <textarea id="perfil-resumo" name="resumo" rows={3} maxLength={1000} value={perfil.resumo} onChange={atualizarPessoal} placeholder="Conte sobre seus interesses profissionais e principais competências." />
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
            <Botao tipo="botao-sage-verde" className="gap-2" type="submit" disabled={anexando || carregandoFoto}><Save size={17} aria-hidden="true" /> {vaga ? 'Salvar e voltar à candidatura' : 'Salvar perfil'}</Botao>
          </div>
        </form>
      </main>
      <Footer />
    </div>
  );
}
