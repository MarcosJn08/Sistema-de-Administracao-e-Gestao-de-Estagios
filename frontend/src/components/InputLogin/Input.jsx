import "./Input.css";
import "../../App.css";
import Form from "react-bootstrap/Form";

function Input({ id, titulo, tipo, textoDeFundo, texto, placeholder, value, onChange, erro, ...props }) {
  const ph = textoDeFundo ?? texto ?? placeholder;
  return (
    <div className="w-100">
      <Form.Group className="input-container" controlId={id}>
        {titulo && <Form.Label>{titulo}</Form.Label>}
        <Form.Control
          type={tipo}
          placeholder={ph}
          value={value}
          onChange={onChange}
          isInvalid={Boolean(erro)}
          aria-describedby={erro ? `${id}-erro` : undefined}
          {...props}
        />
        {erro && <Form.Control.Feedback type="invalid" id={`${id}-erro`}>{erro}</Form.Control.Feedback>}
      </Form.Group>
    </div>
  );
}

export default Input;
