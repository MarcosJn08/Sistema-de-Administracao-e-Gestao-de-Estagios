import React from "react";
import Button from "../Button.jsx";

function ArquivoItem({ nome, tamanho, url }) {
  return (
    <div className="d-flex align-items-center gap-3 bg-white border rounded-3 p-3 mt-2 flex-wrap">
      <i className="bi bi-file-earmark-pdf-fill fs-1 text-danger"></i>
      <div className="flex-grow-1 lh-sm">
        <strong className="small d-block">{nome}</strong>
        <span className="small text-muted">{tamanho}</span>
      </div>
      <Button variant="outline-success" size="sm" as="a" href={url} target="_blank">
        <i className="bi bi-eye-fill me-2"></i>Visualizar
      </Button>
      <Button variant="outline-success" size="sm" as="a" href={url} download={nome}>
        <i className="bi bi-download me-2"></i>Baixar
      </Button>
    </div>
  );
}

export default ArquivoItem;