import "./Input.css";
import "../../App.css"
import Form from "react-bootstrap/Form";

function Input({ id, titulo, tipo, textoDeFundo, value, onChange }) {
  return (
    <Form>
      <Form.Group className="input-container" controlId={id}>
        <Form.Label>{titulo}</Form.Label>

        <Form.Control
          type={tipo}
          placeholder={textoDeFundo}
          value={value}
          onChange={onChange}
        />
      </Form.Group>
    </Form>
  );
}

export default Input;