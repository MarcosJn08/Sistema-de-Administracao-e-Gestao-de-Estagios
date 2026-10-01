import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import StatusBadge from './StatusBadge.jsx';
import LogoEmpresa from './LogoEmpresa.jsx';
import { formatarBolsa, formatarData } from '../utils/formatters.js';

function VagaCard({ vaga, onVerDetalhes, href }) {
  const navigate = useNavigate();
  const textoBeneficios = Array.isArray(vaga.beneficios)
    ? vaga.beneficios.join(', ')
    : vaga.beneficios;

  const lidarComClique = () => {
    if (onVerDetalhes) {
      onVerDetalhes(vaga);
    } else if (href) {
      navigate(href);
    }
  };

  return (
    <article
      id={`oportunidade-${vaga.id}`}
      className="card vaga-card h-100"
      aria-labelledby={`vaga-${vaga.id}`}
      onClick={lidarComClique}
      style={{ cursor: onVerDetalhes || href ? 'pointer' : 'default' }}
    >
      <div className="card-body d-flex flex-column">
        <div className="vaga-card-topo">
          <div className="vaga-status">
            <StatusBadge aberto={vaga.inscricoes_abertas} />
          </div>
          <div className="vaga-empresa-logo">
            <LogoEmpresa empresa={vaga.empresa} logoEmpresa={vaga.logoEmpresa} tamanho={40} />
          </div>
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
          <p>Bolsa: {formatarBolsa(vaga.valor_bolsa, textoBeneficios)}</p>
        </div>
        <p className="vaga-prazo">
          Inscrições até <time dateTime={vaga.data_limite}>{formatarData(vaga.data_limite)}</time>
        </p>
        <button
          type="button"
          className="sage-text-link mt-auto"
          aria-label={`Ver vaga: ${vaga.titulo}`}
          onClick={(e) => {
            e.stopPropagation();
            lidarComClique();
          }}
        >
          Ver vaga <ArrowRight size={14} aria-hidden="true" />
        </button>
      </div>
    </article>
  );
}

export default VagaCard;
