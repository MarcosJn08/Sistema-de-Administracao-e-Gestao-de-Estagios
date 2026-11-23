import Form from 'react-bootstrap/Form';
import './Input.css';

function Input({ id, titulo, tipo = 'text', textoDeFundo, texto, placeholder, value, onChange, onSubmit, semFormulario = false, erro, className = '', ...props }) {
  const ph = textoDeFundo ?? texto ?? placeholder;
  const Container = semFormulario ? 'div' : Form;

  return (
    <Container className="w-100" onSubmit={onSubmit}>
      <Form.Group className={`input-container ${className}`.trim()} controlId={id}>
        {titulo && <Form.Label>{titulo}</Form.Label>}
        <Form.Control
          type={tipo}
          placeholder={ph}
          value={value}
          onChange={onChange}
          className={className}
          isInvalid={Boolean(erro)}
          aria-describedby={erro ? `${id}-erro` : undefined}
          {...props}
        />
        {erro && <Form.Control.Feedback type="invalid" id={`${id}-erro`}>{erro}</Form.Control.Feedback>}
      </Form.Group>
    </Container>
  );
}

export default Input;
