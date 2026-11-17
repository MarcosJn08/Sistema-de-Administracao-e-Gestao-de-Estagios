import { Check, Plus } from 'lucide-react';
import './PerfilComplementos.css';

export default function HabilidadesBadges({ habilidades = [], selecionadas = [], aoAlternar }) {
  if (!habilidades.length) return <p className="perfil-complemento-vazio">Nenhuma habilidade informada.</p>;
  return <div className="habilidades-badges">
    {habilidades.map((habilidade) => aoAlternar ? (
      <button type="button" key={habilidade} className="habilidade-badge" aria-pressed={selecionadas.includes(habilidade)} onClick={() => aoAlternar(habilidade)}>
        {selecionadas.includes(habilidade) ? <Check size={14} aria-hidden="true" /> : <Plus size={14} aria-hidden="true" />}{habilidade}
      </button>
    ) : <span key={habilidade} className="habilidade-badge habilidade-badge-leitura">{habilidade}</span>)}
  </div>;
}
