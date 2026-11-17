import { useId, useState } from 'react';
import Modal from 'react-bootstrap/Modal';
import { Copy, Mail, TriangleAlert } from 'lucide-react';
import Botao from '../Button.jsx';
import dados from '../../data/aluno.js';

const contato = (import.meta.env.VITE_NUCLEO_ESTAGIO_EMAIL || '').trim();
const emailNucleo = /^[^\s@?&#]+@[^\s@?&#]+\.[^\s@?&#]+$/.test(contato) ? contato : '';

export default function SolicitarCorrecaoAcademica() {
  const [aberto, setAberto] = useState(false);
  const [mensagem, setMensagem] = useState('');
  const [aviso, setAviso] = useState('');
  const id = useId();
  const assunto = 'Solicitação de correção de dados acadêmicos';
  const corpo = `${assunto}\n\nAluno: ${dados.aluno.nome}\nMatrícula: ${dados.aluno.matricula}\nE-mail institucional: ${dados.aluno.email}\n\n${mensagem.trim()}`;
  const href = `mailto:${emailNucleo}?subject=${encodeURIComponent(assunto)}&body=${encodeURIComponent(corpo)}`;

  async function copiar() {
    try {
      await navigator.clipboard.writeText(corpo);
      setAviso('Mensagem copiada. Encaminhe-a ao Núcleo de Estágio pelo canal oficial da instituição. Nada foi enviado automaticamente.');
    } catch {
      setAviso('Não foi possível copiar. Selecione e copie o texto do campo para encaminhá-lo pelo canal oficial.');
    }
  }

  return <>
    <button type="button" className="formacao-aluno-correcao" onClick={() => setAberto(true)}>
      <TriangleAlert size={15} aria-hidden="true" /> Dados incorretos? Solicite correção ao Núcleo de Estágio
    </button>
    <Modal show={aberto} onHide={() => setAberto(false)} centered dialogClassName="correcao-academica-modal" aria-labelledby={`${id}-titulo`}>
      <Modal.Header closeButton closeLabel="Fechar solicitação de correção"><Modal.Title as="h2" id={`${id}-titulo`}>Solicitar correção dos dados</Modal.Title></Modal.Header>
      <Modal.Body>
        <p>Informe qual dado acadêmico está incorreto e qual seria a informação correta. A alteração depende da conferência da instituição.</p>
        <label htmlFor={`${id}-mensagem`} className="form-label">Descreva o ajuste necessário</label>
        <textarea id={`${id}-mensagem`} className="form-control" rows={5} maxLength={1500} autoFocus value={mensagem}
          onChange={(evento) => { setMensagem(evento.target.value); setAviso(''); }} placeholder="Ex.: meu período está desatualizado…" />
        <p className="mt-3 mb-0">{emailNucleo ? `A mensagem será aberta no seu aplicativo de e-mail para ${emailNucleo}. Revise e confirme o envio por lá.`
          : 'O contato do Núcleo de Estágio ainda não está configurado. Você pode copiar a mensagem e encaminhá-la pelo canal oficial da instituição.'}</p>
        {aviso && <p className="mt-3 mb-0" role="status">{aviso}</p>}
      </Modal.Body>
      <Modal.Footer>
        <Botao tipo="botao-acao-contorno" onClick={() => setAberto(false)}>Fechar</Botao>
        {emailNucleo && mensagem.trim() ? <Botao tipo="botao-sage-verde" href={href} className="gap-2"><Mail size={16} aria-hidden="true" /> Abrir e-mail</Botao>
          : <Botao tipo="botao-sage-verde" onClick={copiar} disabled={!mensagem.trim()} className="gap-2"><Copy size={16} aria-hidden="true" /> Copiar solicitação</Botao>}
      </Modal.Footer>
    </Modal>
  </>;
}
