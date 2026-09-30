import React from "react";

function InfoItem({ icone, label, valor, destaque }) {
  return (
    <div className="d-flex align-items-center gap-3">
      <i className={`bi bi-${icone} fs-5 ${destaque ? "text-success" : ""}`}></i>
      <div className="lh-sm">
        <div className="small text-muted">{label}</div>
        <strong className={`small ${destaque ? "text-success" : ""}`}>
          {valor}
        </strong>
      </div>
    </div>
  );
}

export default InfoItem;