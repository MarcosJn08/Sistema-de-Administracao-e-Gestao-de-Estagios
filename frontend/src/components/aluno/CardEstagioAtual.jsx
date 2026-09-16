import React from 'react';
import '../../App.css';
import StatusBadge from '../StatusBadge.jsx';
import Botao from '../Button.jsx';

function CardEstagioAtual({
  status,
  empresa,
  professorOrientador,
  supervisorEstagio,
  dataInicio,
  dataFim,
  cargaHorariaSemanal,
  aoVerHistorico,
  onVerHistorico,
}) {
  const lidarComVerHistorico = aoVerHistorico || onVerHistorico;

  return (
    <div className="cartao-sage h-100 d-flex flex-column justify-content-between">
      <div>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h2 className="cartao-sage-titulo mb-0">Estágio Atual</h2>
          {status && <StatusBadge status={status} />}
        </div>

        <div className="d-flex flex-column gap-2" style={{ fontSize: '0.8125rem' }}>
          <div className="d-flex justify-content-between align-items-center">
            <span className="fw-bold text-dark">Empresa:</span>
            <span className="text-secondary">{empresa}</span>
          </div>

          <div className="d-flex justify-content-between align-items-center">
            <span className="fw-bold text-dark">Professor Orientador:</span>
            <span className="text-secondary">{professorOrientador}</span>
          </div>

          <div className="d-flex justify-content-between align-items-center">
            <span className="fw-bold text-dark">Supervisor de Estágio (Empresa):</span>
            <span className="text-secondary">{supervisorEstagio}</span>
          </div>

          <div className="d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center">
              <span className="fw-bold text-dark me-2">Início:</span>
              <span className="text-secondary">{dataInicio}</span>
            </div>
            <div className="d-flex align-items-center">
              <span className="fw-bold text-dark me-2">Fim:</span>
              <span className="text-secondary">{dataFim}</span>
            </div>
          </div>

          <div className="d-flex justify-content-between align-items-center">
            <span className="fw-bold text-dark">Carga Horária Semanal:</span>
            <span className="text-secondary">{cargaHorariaSemanal}</span>
          </div>
        </div>
      </div>

      <div className="d-flex justify-content-end mt-4">
        <Botao
          tipo="botao-sage-verde"
          onClick={lidarComVerHistorico}
        >
          Ver Historico
        </Botao>
      </div>
    </div>
  );
}

export default CardEstagioAtual;
