import { useState } from 'react';
import { Link } from 'react-router-dom';
import Modal from 'react-bootstrap/Modal';
import { ArrowLeft, BriefcaseBusiness, CheckCircle2, FilePenLine, GraduationCap, Pencil, Send, Sparkles } from 'lucide-react';
import Botao from '../Button.jsx';
import LogoEmpresa from '../LogoEmpresa.jsx';
import StatusBadge from '../StatusBadge.jsx';
import HabilidadesBadges from '../aluno/HabilidadesBadges.jsx';
import ExperienciaPerfil from '../aluno/ExperienciaPerfil.jsx';
import { apresentarStatusCandidatura, carregarCandidatura, carregarPerfilAluno, carregarRascunho, enviarCandidatura, salvarRascunho } from '../../utils/candidaturaAluno.js';
import './ModalDetalhesVaga.css';
import './ModalCandidatura.css';

export default function ModalCandidatura({ vaga, aoFechar, aoVoltar, candidaturaRegistrada }) {
  const [perfil] = useState(carregarPerfilAluno);
  const [carta, setCarta] = useState(() => carregarRascunho(vaga.id));
  const [candidaturaEnviada, setCandidatura] = useState(() => carregarCandidatura(vaga.id));
  const candidatura = candidaturaRegistrada || candidaturaEnviada;
  const status = apresentarStatusCandidatura(candidatura?.status);
  const [erro, setErro] = useState('');
  const encerrada = vaga.inscricoes_abertas === false || vaga.status === 'Encerrada';
  const formacao = candidatura?.formacao || perfil.formacao;
  const habilidades = candidatura?.habilidades || perfil.habilidades;

  function editarCarta(evento) {
    const valor = evento.target.value;
    setCarta(valor);
    try {
      salvarRascunho(vaga.id, valor);
      setErro('');
    } catch {
      setErro('Não foi possível guardar o rascunho. Habilite o armazenamento do navegador antes de sair para editar o perfil.');
    }
  }

  function confirmar(evento) {
    evento.preventDefault();
    try {
      setCandidatura(enviarCandidatura(vaga, carta));
      setErro('');
    } catch (error) {
      setErro(error.name === 'QuotaExceededError' || error.name === 'SecurityError'
        ? 'Não foi possível salvar sua candidatura. Verifique o armazenamento do navegador e tente novamente.' : error.message);
    }
  }

  const editarPerfil = (secao) => `/sage/aluno/perfil?vaga=${encodeURIComponent(vaga.id)}#${secao}`;

  return (
    <Modal show onHide={aoFechar} centered scrollable dialogClassName="candidatura-dialog" aria-labelledby="candidatura-titulo">
      <Modal.Header closeButton closeLabel="Fechar candidatura">
        <div className="candidatura-identidade">
          <div className="modal-detalhes-logo"><LogoEmpresa empresa={vaga.empresa} logoEmpresa={vaga.logoEmpresa} tamanho={52} /></div>
          <div>
            <p className="candidatura-etapa">{candidaturaRegistrada ? 'Detalhes da candidatura' : candidatura ? 'Inscrição realizada' : 'Sua candidatura'}</p>
            <h2 id="candidatura-titulo">{vaga.titulo}</h2>
            <p className="modal-detalhes-empresa">{vaga.empresa}</p>
          </div>
        </div>
      </Modal.Header>
      <Modal.Body>
        {candidaturaRegistrada ? <div className="candidatura-resumo-inscricao">
          <div><span>Data da inscrição</span><strong>{new Date(candidatura.dataInscricao).toLocaleDateString('pt-BR')}</strong></div>
          <div><span>Status da candidatura</span><StatusBadge status={status.texto} variante={status.variante} /></div>
          <p>Estas são as informações enviadas na sua inscrição.</p>
        </div> : candidatura ? (
          <div className="candidatura-sucesso" role="status">
            <CheckCircle2 size={24} aria-hidden="true" />
            <div><strong>Candidatura enviada!</strong><p>Inscrição em {new Date(candidatura.dataInscricao).toLocaleDateString('pt-BR')}. Confira abaixo as informações registradas.</p></div>
          </div>
        ) : <p className="candidatura-introducao">Apresente-se à empresa e confira os dados do seu perfil antes de enviar sua candidatura.</p>}
        {encerrada && !candidatura && <div className="alert alert-warning" role="alert">As inscrições desta vaga estão encerradas.</div>}
        {erro && <div className="alert alert-danger" role="alert">{erro}</div>}
        <form id="form-candidatura" onSubmit={confirmar}>
          <section className="candidatura-card" aria-labelledby="carta-titulo">
            <h3 id="carta-titulo"><FilePenLine size={20} aria-hidden="true" /> Carta de apresentação</h3>
            {candidatura ? <p className="candidatura-carta-enviada">{candidatura.cartaApresentacao}</p> : <>
              <label htmlFor="carta-apresentacao">Conte por que você se interessa pela vaga e como pode contribuir.</label>
              <textarea id="carta-apresentacao" value={carta} onChange={editarCarta} required maxLength={2000} rows={6}
                placeholder="Olá! Tenho interesse nesta oportunidade porque…" aria-describedby="carta-ajuda" disabled={encerrada} />
              <div id="carta-ajuda" className="candidatura-ajuda"><span>Esta carta é específica para esta vaga.</span><span>{carta.length}/2.000</span></div>
            </>}
          </section>
          <div className="candidatura-perfil-grid">
            <section className="candidatura-card" aria-labelledby="formacao-titulo">
              <div className="candidatura-card-topo">
                <h3 id="formacao-titulo"><GraduationCap size={20} aria-hidden="true" /> Formação</h3>
                {!candidatura && <Link to={editarPerfil('formacao')} className="candidatura-editar" aria-label="Editar formação no perfil"><Pencil size={14} aria-hidden="true" /> Editar</Link>}
              </div>
              <p className="candidatura-dado-principal">{formacao.curso}</p>
              <p>{formacao.instituicao}</p>
              <p>{formacao.periodo || 'Período não informado'}</p>
              <small>{candidatura ? 'Formação na data da inscrição' : 'Informações do seu perfil'}</small>
            </section>
            <section className="candidatura-card" aria-labelledby="habilidades-titulo">
              <div className="candidatura-card-topo">
                <h3 id="habilidades-titulo"><Sparkles size={20} aria-hidden="true" /> Habilidades</h3>
                {!candidatura && <Link to={editarPerfil('habilidades')} className="candidatura-editar" aria-label="Editar habilidades no perfil"><Pencil size={14} aria-hidden="true" /> Editar</Link>}
              </div>
              {habilidades.length ? <HabilidadesBadges habilidades={habilidades} />
                : <p>{candidatura ? 'Nenhuma habilidade informada nesta inscrição.' : 'Você ainda não adicionou habilidades. Complete essa seção no seu perfil.'}</p>}
              <small>{candidatura ? 'Habilidades na data da inscrição' : 'Informações do seu perfil'}</small>
            </section>
          </div>
          <section className="candidatura-card mt-3" aria-labelledby="candidatura-experiencia-titulo">
            <div className="candidatura-card-topo">
              <h3 id="candidatura-experiencia-titulo"><BriefcaseBusiness size={20} aria-hidden="true" /> Experiência prévia</h3>
              {!candidatura && <Link to={editarPerfil('experiencia')} className="candidatura-editar" aria-label="Editar experiência e anexos no perfil"><Pencil size={14} aria-hidden="true" /> Editar</Link>}
            </div>
            <ExperienciaPerfil experiencia={(candidatura || perfil).experiencia} anexos={(candidatura || perfil).anexos} />
            <small>{candidatura ? 'Experiência e anexos na data da inscrição' : 'Informações do seu perfil'}</small>
          </section>
        </form>
      </Modal.Body>
      <Modal.Footer>
        {aoVoltar && <Botao tipo="botao-acao-contorno" className="gap-2" onClick={aoVoltar}><ArrowLeft size={16} aria-hidden="true" /> Voltar à vaga</Botao>}
        {candidaturaRegistrada ? <Botao tipo="botao-sage-verde" onClick={aoFechar}>Fechar</Botao>
          : candidatura ? <Link to="/sage/aluno/candidaturas" className="botao-sage-verde">Minhas candidaturas</Link>
          : <Botao tipo="botao-sage-verde" className="gap-2" form="form-candidatura" type="submit" disabled={encerrada || !carta.trim()}><Send size={16} aria-hidden="true" /> Enviar candidatura</Botao>}
      </Modal.Footer>
    </Modal>
  );
}
