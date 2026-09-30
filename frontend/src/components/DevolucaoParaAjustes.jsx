import { useId, useState } from 'react';
import { Alert, Col, Form, Row } from 'react-bootstrap';
import { LockKeyhole, Mail, RotateCcw } from 'lucide-react';
import Botao from './Button.jsx';
import StatusBadge from './StatusBadge.jsx';
import { prepararNotificacao } from '../utils/devolucao.js';
import './DevolucaoParaAjustes.css';

export default function DevolucaoParaAjustes({ resumo, status, opcoes, email, responsavel, referencia, observacoesIniciais = '', aoConfirmar, aoCancelar }) {
  const id = useId();
  const [itens, setItens] = useState([]);
  const [observacoes, setObservacoes] = useState(observacoesIniciais);
  const [erro, setErro] = useState('');
  const previa = prepararNotificacao({ email, responsavel, referencia, itens, observacoes });
  const confirmar = (evento) => {
    evento.preventDefault();
    if (!itens.length || !observacoes.trim()) { setErro('Selecione ao menos uma pendência e detalhe as correções necessárias.'); return; }
    try { aoConfirmar({ itens, observacoes: observacoes.trim() }); } catch (error) { setErro(error.message); }
  };

  return (
    <div className="devolucao-ajustes">
      <section className="devolucao-ajustes-cartao devolucao-ajustes-resumo" aria-label="Resumo sob análise">
        <div className="devolucao-ajustes-resumo-topo"><h3>Resumo sob análise</h3><StatusBadge status={status} variante={status === 'Correção solicitada' || status === 'Ajustes solicitados' ? 'ambar' : undefined} /></div>
        <dl>{resumo.map(([rotulo, valor]) => <div key={rotulo}><dt>{rotulo}</dt><dd>{valor}</dd></div>)}</dl>
      </section>
      <Form onSubmit={confirmar}>
        <Row className="g-3">
          <Col xs={12} lg={7}>
            <section className="devolucao-ajustes-cartao h-100">
              <h3>Instruções de correção</h3>
              <p>Selecione as pendências e detalhe os ajustes necessários antes do reenvio.</p>
              {erro && <Alert variant="danger" role="alert">{erro}</Alert>}
              <fieldset><legend>Itens com erro ou pendência</legend>
                <div className="devolucao-ajustes-checklist">{opcoes.map((item, indice) => <Form.Check key={item} id={`${id}-item-${indice}`} type="checkbox" label={item} checked={itens.includes(item)}
                  onChange={() => { setItens((atuais) => atuais.includes(item) ? atuais.filter((valor) => valor !== item) : [...atuais, item]); setErro(''); }} />)}</div>
              </fieldset>
              <Form.Group controlId={`${id}-observacoes`}>
                <Form.Label>Observações detalhadas <span aria-hidden="true">*</span></Form.Label>
                <Form.Control as="textarea" rows={5} required maxLength={2000} value={observacoes} onChange={(evento) => { setObservacoes(evento.target.value); setErro(''); }} placeholder="Descreva o que precisa ser corrigido." />
              </Form.Group>
            </section>
          </Col>
          <Col xs={12} lg={5}>
            <section className="devolucao-ajustes-cartao devolucao-ajustes-email" aria-label="Prévia da notificação por e-mail">
              <h3><Mail size={17} aria-hidden="true" /> Prévia da notificação por e-mail</h3>
              <div className="devolucao-ajustes-destino"><p><strong>Para:</strong> {previa.destinatario || 'E-mail não cadastrado'}</p><p><strong>Assunto:</strong> {previa.assunto}</p></div>
              <div className="devolucao-ajustes-mensagem" aria-live="polite" aria-atomic="true">
                <p>{previa.saudacao}</p><p>{previa.mensagem}</p>
                <div className="devolucao-ajustes-pendencias">
                  {itens.length ? <ul>{previa.itens.map((item) => <li key={item}>{item}</li>)}</ul> : <p>As pendências selecionadas aparecerão aqui.</p>}
                  {previa.observacoes && <p className="devolucao-ajustes-parecer">{previa.observacoes}</p>}
                </div>
                <p>{previa.instrucoes}</p>
                <span className="devolucao-ajustes-link-previa"><LockKeyhole size={14} aria-hidden="true" /> Acessar formulário de correção</span>
              </div>
            </section>
          </Col>
        </Row>
        <div className="devolucao-ajustes-acoes">
          <Botao tipo="botao-acao-contorno" onClick={aoCancelar}>Voltar à análise</Botao>
          <button type="submit" className="botao-sage-verde gap-2"><RotateCcw size={15} aria-hidden="true" /> Confirmar devolução</button>
        </div>
      </Form>
    </div>
  );
}
