import "./Input.css";
import "../../App.css";
import Form from "react-bootstrap/Form";

function Input({ id, titulo, tipo, textoDeFundo, texto, placeholder, value, onChange }) {
  const ph = textoDeFundo ?? texto ?? placeholder;
  return (
    <Form className="w-100">
      <Form.Group className="input-container" controlId={id}>
        {titulo && <Form.Label>{titulo}</Form.Label>}
        <Form.Control
          type={tipo}
          placeholder={ph}
          value={value}
          onChange={onChange}
        />
      </Form.Group>
    </Form>
  );
}

export default Input;