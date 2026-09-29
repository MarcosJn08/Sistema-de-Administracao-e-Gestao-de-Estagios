import React from 'react';
import { Building2, CalendarDays, Clock3, ArrowRight } from 'lucide-react';
import './CardEstagio.css';

function CardEstagio({ estagio, aoVerEstagio }) {
  if (!estagio) return null;

  const percentual = Math.min(
    100,
    Math.max(0, Number(estagio.progresso ?? 0))
  );

  const status = estagio.status || 'Concluído';
  const atual = Boolean(estagio.atual);

  return (
    <article className={`card-estagio ${atual ? 'card-estagio-atual' : ''}`}>
      <div className="card-estagio-topo">
        <span className="card-estagio-rotulo">
          {atual ? 'Estágio atual' : 'Estágio anterior'}
        </span>

        <span
          className={`card-estagio-status ${
            atual ? 'status-andamento' : 'status-concluido'
          }`}
        >
          {status}
        </span>
      </div>

      <div className="card-estagio-empresa">
        <div className="card-estagio-icone" aria-hidden="true">
          <Building2 size={22} strokeWidth={1.8} />
        </div>

        <div className="card-estagio-identificacao">
          <h3 className="card-estagio-nome">{estagio.empresa}</h3>
          <p className="card-estagio-cargo">{estagio.cargo}</p>
        </div>
      </div>

      <div className="card-estagio-info">
        <div className="card-estagio-info-item">
          <CalendarDays size={16} strokeWidth={1.8} aria-hidden="true" />
          <span>
            {estagio.dataInicio} <strong>→</strong> {estagio.dataFim}
          </span>
        </div>

        <div className="card-estagio-info-item">
          <Clock3 size={16} strokeWidth={1.8} aria-hidden="true" />
          <span>Carga horária: {estagio.cargaHoraria}</span>
        </div>
      </div>

      <div className="card-estagio-progresso">
        <div className="card-estagio-progresso-topo">
          <span>Progresso</span>
          <strong>{percentual}%</strong>
        </div>

        <div
          className="card-estagio-barra"
          role="progressbar"
          aria-valuenow={percentual}
          aria-valuemin="0"
          aria-valuemax="100"
          aria-label={`Progresso do estágio: ${percentual}%`}
        >
          <div
            className="card-estagio-barra-preenchida"
            style={{ width: `${percentual}%` }}
          />
        </div>
      </div>

      <button
        type="button"
        className={`card-estagio-botao ${
          atual ? 'card-estagio-botao-atual' : 'card-estagio-botao-outline'
        }`}
        onClick={() => aoVerEstagio?.(estagio)}
      >
        Ver estágio
        <ArrowRight size={16} strokeWidth={2} aria-hidden="true" />
      </button>
    </article>
  );
}

export default CardEstagio;