import React from "react";
import "./status.css";

function Status({ nome, tipo }) {
  return <span className={`card-estagio-status ${tipo}`}>{nome}</span>;
}

export default Status;