import { ArrowRight } from 'lucide-react';
import StatusBadge from './StatusBadge.jsx';
import { formatarBolsa, formatarData } from '../utils/formatters.js';

function VagaCard({ vaga }) {
  return (
    <article
      id={`oportunidade-${vaga.id}`}
      className="card vaga-card h-100"
      aria-labelledby={`vaga-${vaga.id}`}
    >
      <div className="card-body d-flex flex-column">
        <div className="vaga-status">
          <StatusBadge aberto={vaga.inscricoes_abertas} />
        </div>
        <h3 id={`vaga-${vaga.id}`}>{vaga.titulo}</h3>
        <p className="vaga-empresa">{vaga.empresa}</p>
        <p className="vaga-local">
          {vaga.modalidade} • {vaga.cidade}
        </p>
        <div className="vaga-metadata">
          <p>
            {vaga.curso} • {vaga.carga_horaria}
          </p>
          <p>Bolsa: {formatarBolsa(vaga.valor_bolsa, vaga.beneficios)}</p>
        </div>
        <p className="vaga-prazo">
          Inscrições até <time dateTime={vaga.data_limite}>{formatarData(vaga.data_limite)}</time>
        </p>
        <button
          type="button"
          className="sage-text-link mt-auto"
          aria-disabled="true"
          aria-label={`Ver vaga: ${vaga.titulo}`}
        >
          Ver vaga <ArrowRight size={14} aria-hidden="true" />
        </button>
      </div>
    </article>
  );
}

export default VagaCard;
