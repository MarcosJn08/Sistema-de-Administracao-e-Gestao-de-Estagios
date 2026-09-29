import React from 'react';
import '../../App.css';

function CardProgresso({
  horasConcluidas = 0,
  metaHoras = 0,
  horasEstagio = 0,
}) {
  const percentual = metaHoras > 0 ? Math.round((horasConcluidas / metaHoras) * 100) : 0;

  return (
    <div className="cartao-sage h-100 d-flex flex-column justify-content-between">
      <div>
        <h2 className="cartao-sage-titulo">Progresso</h2>

        <div className="d-flex justify-content-between align-items-flex-start mb-2">
          <div>
            <div className="text-secondary small fw-medium">Horas concluídas</div>
            <div className="display-6 fw-bold text-dark lh-1 mt-1">{horasConcluidas}h</div>
          </div>

          <div className="text-end">
            <div className="text-secondary small fw-medium">Total</div>
            <div className="display-6 fw-bold text-dark lh-1 mt-1">{metaHoras}h</div>
            <div className="fw-bold small mt-1" style={{ color: '#00a859' }}>
              {percentual}%
            </div>
          </div>
        </div>

        <div className="barra-progresso-trilha my-2">
          <div
            className="barra-progresso-preenchimento"
            style={{ width: `${Math.min(percentual, 100)}%` }}
            role="progressbar"
            aria-valuenow={percentual}
            aria-valuemin={0}
            aria-valuemax={100}
          />
        </div>

        <div className="text-secondary small mb-4">
          {horasConcluidas}h de {metaHoras}h | {percentual}%
        </div>
      </div>
    </div>
  );
}

export default CardProgresso;
