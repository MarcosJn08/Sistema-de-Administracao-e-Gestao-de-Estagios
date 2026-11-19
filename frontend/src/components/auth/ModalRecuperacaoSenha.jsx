import { useState } from 'react';
import { Alert, Form, Modal } from 'react-bootstrap';
import api from '../../services/api.js';

export default function ModalRecuperacaoSenha({ token, emailInicial, aoFechar }) {
  const redefinindo = Boolean(token);
  const [email, setEmail] = useState(emailInicial);
  const [senha, setSenha] = useState('');
  const [confirmacao, setConfirmacao] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [sucesso, setSucesso] = useState('');
  const [erro, setErro] = useState('');
  const [errosCampos, setErrosCampos] = useState({});
  const textoAcao = redefinindo ? 'Redefinir senha' : 'Enviar link';

  const enviar = async (evento) => {
    evento.preventDefault();
    setEnviando(true);
    setErro('');
    setErrosCampos({});

    try {
      const caminho = redefinindo ? '/auth/redefinir-senha' : '/auth/esqueci-senha';
      const dados = redefinindo
        ? { email, token, password: senha, password_confirmation: confirmacao }
        : { email };
      const resposta = await api.post(caminho, dados, { timeout: 15000 });
      setSucesso(resposta.data.message);
      setSenha('');
      setConfirmacao('');
    } catch (error) {
      if (error.response?.status === 422) {
        const campos = error.response.data.errors || {};
        setErrosCampos(campos);
        setErro(campos.token?.[0] || error.response.data.message);
      } else if (error.response?.status === 429) {
        setErro('Aguarde um minuto antes de tentar novamente.');
      } else {
        setErro('Não foi possível concluir a solicitação. Tente novamente.');
      }
    } finally {
      setEnviando(false);
    }
  };

  return (
    <Modal show onHide={aoFechar} centered backdrop={enviando ? 'static' : true}
      keyboard={!enviando} aria-labelledby="recuperacao-senha-titulo">
      <Modal.Header closeButton={!enviando} closeLabel="Fechar">
        <Modal.Title as="h2" id="recuperacao-senha-titulo">
          {redefinindo ? 'Redefinir senha' : 'Recuperar senha'}
        </Modal.Title>
      </Modal.Header>
      <Form onSubmit={enviar} aria-busy={enviando}>
        <Modal.Body>
          {sucesso ? <Alert variant="success" role="status">{sucesso}</Alert> : <>
            <p>{redefinindo
              ? 'Escolha uma nova senha para sua conta.'
              : 'Informe o e-mail institucional cadastrado para receber o link de recuperação.'}</p>
            {erro && <Alert variant="danger" role="alert">{erro}</Alert>}
            <Form.Group className="mb-3" controlId="recuperacao-email">
              <Form.Label>E-mail institucional</Form.Label>
              <Form.Control type="email" autoComplete="email" required maxLength={254}
                value={email} onChange={(evento) => setEmail(evento.target.value)}
                disabled={enviando} isInvalid={Boolean(errosCampos.email)}
                placeholder="nome@aluno.ifnmg.edu.br" />
              <Form.Control.Feedback type="invalid">{errosCampos.email?.[0]}</Form.Control.Feedback>
            </Form.Group>
            {redefinindo && <>
              <Form.Group className="mb-3" controlId="recuperacao-nova-senha">
                <Form.Label>Nova senha</Form.Label>
                <Form.Control type="password" autoComplete="new-password" required minLength={8}
                  value={senha} onChange={(evento) => setSenha(evento.target.value)}
                  disabled={enviando} isInvalid={Boolean(errosCampos.password)} />
                <Form.Text>Pelo menos 8 caracteres.</Form.Text>
                <Form.Control.Feedback type="invalid">{errosCampos.password?.[0]}</Form.Control.Feedback>
              </Form.Group>
              <Form.Group className="mb-3" controlId="recuperacao-confirmacao-senha">
                <Form.Label>Confirme a nova senha</Form.Label>
                <Form.Control type="password" autoComplete="new-password" required
                  value={confirmacao} onChange={(evento) => setConfirmacao(evento.target.value)}
                  disabled={enviando} isInvalid={Boolean(errosCampos.password_confirmation)} />
                <Form.Control.Feedback type="invalid">{errosCampos.password_confirmation?.[0]}</Form.Control.Feedback>
              </Form.Group>
            </>}
          </>}
        </Modal.Body>
        <Modal.Footer>
          {sucesso ? <button type="button" className="botao-sage-verde" onClick={aoFechar}>
            Voltar para o login
          </button> : <>
            <button type="button" className="btn btn-outline-secondary" onClick={aoFechar} disabled={enviando}>
              Cancelar
            </button>
            <button type="submit" className="botao-sage-verde" disabled={enviando}>
              {enviando ? 'Aguarde...' : textoAcao}
            </button>
          </>}
        </Modal.Footer>
      </Form>
    </Modal>
  );
}
