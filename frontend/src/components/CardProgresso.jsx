import React from 'react';
import '../App.css';

function CardProgresso({
  horasConcluidas = 0,
  metaHoras = 0,
  horasEstagio = 0,
  horasProjeto = 0,
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
            <div className="text-secondary small fw-medium">Meta</div>
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

      <div className="d-flex flex-column gap-2 mt-2">
        <div className="d-flex align-items-center gap-2">
          <span className="marcador-legenda marcador-verde" />
          <span className="fw-bold text-dark small">
            Horas de Estágio: {horasEstagio}h
          </span>
        </div>

        <div className="d-flex align-items-center gap-2">
          <span className="marcador-legenda marcador-laranja" />
          <span className="fw-bold text-dark small">
            Horas de Aproveitamento de Projeto: {horasProjeto}h
          </span>
        </div>
      </div>
    </div>
  );
}

export default CardProgresso;
