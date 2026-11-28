import useAuth from '../hooks/useAuth.js';
import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Bookmark, BriefcaseBusiness, Save, Send, Sparkles, UserRound } from 'lucide-react';
import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';
import Botao from "../components/Button/Button.jsx";
import SeletorHabilidades from '../components/aluno/SeletorHabilidades.jsx';
import AnexosPerfil from '../components/aluno/AnexosPerfil.jsx';
import FormacaoAluno from '../components/aluno/FormacaoAluno.jsx';
import SolicitarCorrecaoAcademica from '../components/aluno/SolicitarCorrecaoAcademica.jsx';
import { lerFotoPerfil } from '../utils/fotoPerfil.js';
import { habilidadesPredefinidas, separarHabilidades } from '../data/habilidades.js';
import { guardarAnexos } from '../utils/anexosPerfil.js';

import vagas from '../data/vagas.json';
import { carregarPerfilAluno, salvarPerfilAluno } from '../utils/candidaturaAluno.js';
import api from '../services/api.js';
import { Modal } from 'react-bootstrap';

const ufs = 'AC AL AP AM BA CE DF ES GO MA MT MS MG PA PB PR PE PI RJ RN RS RO RR SC SP SE TO'.split(' ');
const opcoesFicha = { uf: ufs, uf_naturalidade: ufs, sexo: ['Feminino', 'Masculino', 'Intersexo', 'Não informado'], estado_civil: ['Solteiro(a)', 'Casado(a)', 'Divorciado(a)', 'Viúvo(a)', 'União estável', 'Separado(a)'], turno: ['Matutino', 'Vespertino', 'Noturno', 'Integral'], integralizou: ['Sim'] };
const mascararTelefone = (valor) => valor.replace(/\D/g, '').slice(0, 11).replace(/^(\d{2})(\d)/, '($1) $2').replace(/(\d{4,5})(\d{4})$/, '$1-$2');
import '../components/vagas/ModalCandidatura.css';
import './PerfilAluno.css';

export default function PerfilAluno() {
  const { user } = useAuth();
  const [perfil, setPerfil] = useState(carregarPerfilAluno);
  const [selecionadas, setSelecionadas] = useState(() => separarHabilidades(perfil.habilidades).selecionadas);
  const [habilidades, setHabilidades] = useState(() => separarHabilidades(perfil.habilidades).outras);
  const [anexando, setAnexando] = useState(false);
  const [carregandoFoto, setCarregandoFoto] = useState(false);
  const [erroFoto, setErroFoto] = useState('');
  const [erroAnexo, setErroAnexo] = useState('');
  const [erro, setErro] = useState('');
  const [secaoStatus, setSecaoStatus] = useState({});
  const [salvandoSecao, setSalvandoSecao] = useState('');
  const [salvo, setSalvo] = useState(false);
  const [previa, setPrevia] = useState('');
  const [gerandoPrevia, setGerandoPrevia] = useState(false);
  useEffect(() => () => { if (previa) URL.revokeObjectURL(previa); }, [previa]);
  const [dadosFicha, setDadosFicha] = useState({});
  const [ficha, setFicha] = useState(null);
  const [institucional, setInstitucional] = useState(null);
  const [statusFicha, setStatusFicha] = useState('');
  const mensagemSucessoRef = useRef(null);
  const [params] = useSearchParams();
  const { hash } = useLocation();
  const vaga = vagas.find((item) => String(item.id) === params.get('vaga'));
  const retorno = vaga ? `/sage/vagas/${vaga.id}/candidatura` : '/sage/aluno';

  useEffect(() => {
    let ativo = true;
    api.get('/aluno/perfil').then(({ data }) => {
      if (!ativo) return;
      setDadosFicha(data.data.perfil || {});
      setPerfil((atual) => ({ ...atual, telefone: data.data.perfil?.telefone || atual.telefone }));
      setInstitucional(data.data.institucional);
      setFicha(data.data.ficha);
    }).catch((error) => { if (ativo) setErro(error.message); });
    return () => { ativo = false; };
  }, []);

  function atualizarFicha(evento) {
    const { name, value } = evento.target;
    const filtrado = name === 'cep' ? value.replace(/\D/g, '').slice(0, 8).replace(/^(\d{5})(\d)/, '$1-$2') : name === 'telefone_fixo' ? mascararTelefone(value) : name === 'identidade' ? value.replace(/[^0-9xX.\-]/g, '').toUpperCase().slice(0, 20) : name === 'numero' ? value.replace(/[^0-9a-zA-Z/ -]/g, '').slice(0, 15) : name === 'orgao_expedidor' ? value.replace(/[^a-zA-Z/ -]/g, '').toUpperCase().slice(0, 20) : value;
    setDadosFicha((atual) => ({ ...atual, [name]: filtrado, ...(name === 'tipo_curso' ? { serie_modulo_periodo: '' } : {}) }));
    setSalvo(false);
  }

  async function visualizarFicha() {
    setGerandoPrevia(true);
    try {
      const { data } = await api.post('/aluno/ficha-matricula/previa', { ...dadosFicha, telefone: perfil.telefone }, { responseType: 'blob' });
      setPrevia(URL.createObjectURL(data));
    } catch (error) { setErro(error.message); }
    finally { setGerandoPrevia(false); }
  }

  function campoFicha(campo, rotulo, prefixo) {
    const id = `${prefixo}-${campo}`;
    const opcoes = campo === 'tipo_curso' ? ['Técnico', 'Superior'] : campo === 'serie_modulo_periodo' ? Array.from({ length: dadosFicha.tipo_curso === 'Técnico' ? 4 : 12 }, (_, i) => String(i + 1)) : opcoesFicha[campo];
    return <div key={campo}><label htmlFor={id}>{rotulo}</label>{opcoes ? <select id={id} name={campo} disabled={campo === 'serie_modulo_periodo' && !dadosFicha.tipo_curso} className="form-select" value={dadosFicha[campo] || ''} onChange={atualizarFicha}><option value="">{campo === 'integralizou' ? 'Não' : 'Selecione'}</option>{opcoes.map((opcao) => <option key={opcao} value={opcao}>{opcao}</option>)}</select> : <input id={id} name={campo} type={campo === 'data_nascimento' ? 'date' : 'text'} max={campo === 'data_nascimento' ? new Date().toISOString().slice(0, 10) : undefined} inputMode={['cep', 'telefone_fixo'].includes(campo) ? 'numeric' : undefined} className="form-control" maxLength={campo === 'cep' ? 9 : 255} value={dadosFicha[campo] || ''} onChange={atualizarFicha} />}</div>;
  }

  async function salvarArea(area) {
    setSalvandoSecao(area);
    setSecaoStatus((atual) => ({ ...atual, [area]: '' }));
    try {
      const endereco = ['logradouro', 'numero', 'complemento', 'bairro', 'cidade', 'uf', 'cep'];
      if (['dados-pessoais', 'dados-complementares', 'endereco'].includes(area)) {
        const dados = area === 'dados-pessoais' ? { telefone: perfil.telefone } : Object.fromEntries(Object.entries(dadosFicha).filter(([campo]) => area === 'endereco' ? endereco.includes(campo) : !endereco.includes(campo) && campo !== 'telefone'));
        await api.patch('/aluno/perfil', dados);
      }
      if (['dados-pessoais', 'habilidades', 'experiencia'].includes(area)) {
        const campos = area === 'dados-pessoais' ? { foto: perfil.foto, telefone: perfil.telefone } : area === 'habilidades' ? { resumo: perfil.resumo, habilidades: [...selecionadas, ...habilidades.split(/[,;\n]/)] } : { experiencia: perfil.experiencia, anexos: perfil.anexos };
        salvarPerfilAluno({ ...carregarPerfilAluno(), ...campos });
      }
      setSecaoStatus((atual) => ({ ...atual, [area]: 'Alterações salvas.' }));
    } catch (error) { setSecaoStatus((atual) => ({ ...atual, [area]: Object.values(error.errors || {}).flat().join(' ') || error.message })); }
    finally { setSalvandoSecao(''); }
  }

  function botaoSalvarArea(area) {
    return <div className="mt-3"><Botao tipo="botao-sage-verde" type="button" disabled={Boolean(salvandoSecao) || anexando || carregandoFoto} onClick={() => salvarArea(area)}><Save size={16} aria-hidden="true" /> {salvandoSecao === area ? 'Salvando…' : 'Salvar alterações'}</Botao>{secaoStatus[area] && <p className="mt-2" role="status">{secaoStatus[area]}</p>}</div>;
  }

  async function baixarFicha(gerada = true) {
    try {
      const { data } = await api.get(gerada ? '/aluno/ficha-matricula/pdf' : '/aluno/ficha-matricula/arquivo', { responseType: 'blob' });
      const url = URL.createObjectURL(data);
      const link = document.createElement('a');
      link.href = url; link.download = gerada ? 'ficha-matricula-estagio.pdf' : 'ficha-matricula-enviada.pdf';
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (error) { setErro(error.message); }
  }

  async function enviarFicha(evento) {
    const arquivo = evento.target.files?.[0];
    evento.target.value = '';
    if (!arquivo) return;
    setStatusFicha('Enviando ficha…');
    try {
      const formulario = new FormData(); formulario.append('arquivo', arquivo);
      const { data } = await api.post('/aluno/ficha-matricula', formulario);
      setFicha(data.data); setStatusFicha('Ficha anexada. Encaminhe para análise.');
    } catch (error) { setStatusFicha(error.message); }
  }

  async function encaminharFicha() {
    try {
      const { data } = await api.post('/aluno/ficha-matricula/enviar');
      setFicha(data.data); setStatusFicha('Ficha enviada para análise.');
    } catch (error) { setStatusFicha(error.message); }
  }

  function atualizarPessoal(evento) {
    const { name, value } = evento.target;
    setPerfil((atual) => ({ ...atual, [name]: name === 'telefone' ? mascararTelefone(value) : value }));
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
      <Header />
      <main className="perfil-aluno-edicao flex-grow-1">
        <Link to={retorno} className="perfil-aluno-voltar"><ArrowLeft size={16} aria-hidden="true" /> {vaga ? 'Voltar à candidatura' : 'Voltar ao dashboard'}</Link>
        <h1>Meu perfil</h1>
        <p className="perfil-aluno-descricao">Complete os dados pessoais e acadêmicos da ficha. Habilidades, foto e experiências ficam salvas neste navegador.</p>
        {vaga && <div className="alert alert-info">Você está se candidatando a <strong>{vaga.titulo}</strong>. Ao salvar, você voltará à candidatura com sua carta preservada.</div>}
        <div className="perfil-aluno-identidade"><strong>{institucional?.nome || user?.name}</strong><span>{institucional?.email || user?.email} · Matrícula {institucional?.matricula || user?.matricula} · CPF {institucional?.cpf || 'não informado'}</span></div>
        {!vaga && <nav className="perfil-aluno-atalhos" aria-label="Atalhos do aluno">
          <Link to="/sage/aluno/vagas-salvas"><Bookmark size={17} aria-hidden="true" /> Vagas salvas</Link>
          <Link to="/sage/aluno/candidaturas"><Send size={17} aria-hidden="true" /> Minhas candidaturas</Link>
          <Link to="/sage/aluno/estagios"><BriefcaseBusiness size={17} aria-hidden="true" /> Meus estágios</Link>
        </nav>}
        {erro && <div className="alert alert-danger" role="alert">{erro}</div>}
        {salvo && <div ref={mensagemSucessoRef} className="alert alert-success perfil-aluno-sucesso" role="status" tabIndex={-1}>Perfil salvo.</div>}
        <form onSubmit={(evento) => evento.preventDefault()}>
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
            {botaoSalvarArea("dados-pessoais") }
          </section>

          <FormacaoAluno id="formacao" formacao={perfil.formacao} acaoCorrecao={<SolicitarCorrecaoAcademica />} />
          <section id="dados-complementares" className="candidatura-card">
            <h2>Dados para matrícula de estágio</h2>
            <p>Seus dados institucionais são apresentados acima. Preencha as informações pessoais que faltam.</p>
            {[
              ['naturalidade', 'Naturalidade'], ['uf_naturalidade', 'UF de nascimento'], ['data_nascimento', 'Data de nascimento'],
              ['filiacao', 'Filiação'], ['estado_civil', 'Estado civil'], ['sexo', 'Sexo'], ['identidade', 'Identidade nº'],
              ['orgao_expedidor', 'Órgão expedidor'], ['telefone_fixo', 'Telefone fixo'],
              ['tipo_curso', 'Tipo de curso (para preenchimento da ficha)'], ['serie_modulo_periodo', dadosFicha.tipo_curso === 'Técnico' ? 'Ano do curso' : 'Semestre do curso'], ['turno', 'Turno'],
              ['integralizou', 'Integralizou a carga horária do curso?'], ['semestre_integralizacao', 'Semestre/ano de integralização'],
            ].map(([campo, rotulo]) => campoFicha(campo, rotulo, "ficha"))}
            {botaoSalvarArea("dados-complementares") }
          </section>
          <section id="endereco" className="candidatura-card">
            <h2>Endereço residencial</h2>
            {[
              ['logradouro', 'Rua / avenida'], ['numero', 'Número'], ['complemento', 'Complemento'],
              ['bairro', 'Bairro'], ['cidade', 'Cidade'], ['uf', 'UF'], ['cep', 'CEP'],
            ].map(([campo, rotulo]) => campoFicha(campo, rotulo, "ficha"))}
            {botaoSalvarArea("endereco") }
          </section>
          <section id="ficha-matricula" className="candidatura-card">
            <h2>Ficha de matrícula de estágio</h2>
            <p>Situação: {({ PENDENTE: 'Pendente', EM_ANALISE: 'Em análise', DEFERIDO: 'Aprovada', NECESSITA_AJUSTES: 'Necessita de correções' })[ficha?.status] || 'Não enviada'}</p>
            {ficha?.observacoes && <p>Observações: {ficha.observacoes}</p>}
            <button type="button" className="botao-acao-contorno me-2" disabled={gerandoPrevia} onClick={visualizarFicha}>{gerandoPrevia ? 'Gerando prévia…' : 'Visualizar documento'}</button>
            <button type="button" className="botao-sage-verde" onClick={() => baixarFicha()}>Baixar ficha gerada em PDF</button>{' '}
            {ficha && <button type="button" className="botao-acao-contorno" onClick={() => baixarFicha(false)}>Baixar arquivo enviado</button>}
            <label htmlFor="ficha-arquivo">Enviar ficha preenchida ou assinada (PDF, até 10 MB)</label>
            <input id="ficha-arquivo" type="file" accept="application/pdf" className="form-control" onChange={enviarFicha} disabled={['EM_ANALISE', 'DEFERIDO'].includes(ficha?.status)} />
            {ficha?.status === 'PENDENTE' && <button type="button" className="botao-sage-verde mt-2" onClick={encaminharFicha}>Encaminhar ao diretor</button>}
            {statusFicha && <p role="status">{statusFicha}</p>}
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
            {botaoSalvarArea("habilidades") }
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
            {botaoSalvarArea("experiencia") }
          </section>
          <div className="perfil-aluno-acoes">
            <Link to={retorno} className="perfil-aluno-voltar">Cancelar</Link>

          </div>
        </form>
      </main>
      <Modal show={Boolean(previa)} onHide={() => setPrevia('')} size="xl" centered aria-labelledby="previa-ficha-titulo">
        <Modal.Header closeButton><Modal.Title id="previa-ficha-titulo">Prévia da ficha de matrícula</Modal.Title></Modal.Header>
        <Modal.Body><p>A prévia usa os dados atuais do formulário. Salve o perfil para confirmar as alterações.</p>{previa && <iframe title="Ficha de matrícula em PDF" src={previa} style={{ width: '100%', height: '70vh', border: 0 }} />}</Modal.Body>
      </Modal>
      <Footer />
    </div>
  );
}
