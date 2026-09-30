import React from "react";
import "./Icone.css";

function Icone({ elemento, fundo, texto = "black" }) {
  const corTexto = texto === "white" ? "text-white" : "text-black";

  return (
    <div className="icone-fundo" style={{ backgroundColor: fundo }}>
      <i className={`bi bi-${elemento} ${corTexto}`}></i>
    </div>
  );
}

export default Icone;