import React from "react";
import { Form } from "react-bootstrap";

function CampoMensagem({ valor, onChange, limite = 300 }) {
  return (
    <div className="mb-3 px-3">
      <div className="d-flex align-items-center gap-2 mb-2">
        <i className="bi bi-chat-left-text"></i>
        <strong className="small">
          Mensagem <span className="fw-normal text-muted">(opcional)</span>
        </strong>
      </div>
      <Form.Control
        as="textarea"
        rows={3}
        value={valor}
        maxLength={limite}
        onChange={(e) => onChange(e.target.value)}
        className="bg-light small text-secondary"
        style={{ resize: "none" }}
      />
      <div className="text-end small text-muted mt-1">
        {valor.length}/{limite}
      </div>
    </div>
  );
}

export default CampoMensagem;