import React from "react";

function Bloco({ icone, titulo, children }) {
  return (
    <div className="bg-light border rounded-3 p-3 mb-3">
      <div className="d-flex align-items-center gap-2">
        <i className={`bi bi-${icone}`}></i>
        <strong className="small">{titulo}</strong>
      </div>
      {children && <div className="small text-secondary mt-2">{children}</div>}
    </div>
  );
}

export default Bloco;