import React from "react";
import "../../App.css";
import Botao from "../Button.jsx";

function CardDadosEstagio({
  status,
  empresa,
  professorOrientador,
  supervisorEstagio,
  dataInicio,
  dataFim,
  cargaHorariaSemanal,
  aoEditarPerfil,
  onEditProfile,
}) {
  const lidarComEdicao = aoEditarPerfil || onEditProfile;

  return (
    <div className="cartao-sage">
      <h2 className="cartao-sage-titulo mb-3">Dados Estágio</h2>

      <div className="d-flex align-items-start gap-3">
        <div className="flex-grow-1" style={{ fontSize: "0.9375rem" }}>
          <div className="mb-3">
            <span className="fw-bold text-dark">Empresa:</span>
            <span className="text-secondary ms-1">{empresa}</span>
          </div>

          <div className="row g-3">
            <div className="col-md-3">
              <div className="fw-bold text-dark">{professorOrientador}</div>
              <div className="text-secondary small">Professor Orientador</div>
            </div>

            <div className="col-md-3">
              <div className="fw-bold text-dark">
                {dataInicio} a {dataFim}
              </div>
              <div className="text-secondary small">Período de Estágio</div>
            </div>

            <div className="col-md-3">
              <div className="fw-bold text-dark">{cargaHorariaSemanal}</div>
              <div className="text-secondary small">Carga Horária Semanal</div>
            </div>

            <div className="col-md-3">
              <div className="fw-bold text-dark">{supervisorEstagio}</div>
              <div className="text-secondary small">Supervisor (Empresa)</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CardDadosEstagio;
