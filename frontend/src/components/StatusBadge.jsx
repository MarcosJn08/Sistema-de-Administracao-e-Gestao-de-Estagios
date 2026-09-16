import React from 'react';
import '../App.css';

function StatusBadge({ status, aberto, variante, variant, children }) {
  if (aberto !== undefined) {
    if (!aberto) return null;
    return <span className="sage-status">{children ?? 'Inscrições abertas'}</span>;
  }

  const obterClasseBadge = (textoStatus, varianteDefinida) => {
    const varEscolhida = varianteDefinida || variant;
    if (varEscolhida) {
      return `badge-status-${varEscolhida}`;
    }

    const textoNormalizado = (textoStatus || '').toLowerCase().trim();

    if (
      (textoNormalizado.includes('deferido') && !textoNormalizado.includes('indeferido')) ||
      textoNormalizado.includes('aprovado') ||
      textoNormalizado.includes('andamento') ||
      textoNormalizado === 'concluído'
    ) {
      return 'badge-status-verde';
    }

    if (
      textoNormalizado.includes('analise') ||
      textoNormalizado.includes('análise') ||
      textoNormalizado.includes('pendente de aprovação')
    ) {
      return 'badge-status-ambar';
    }

    if (
      textoNormalizado.includes('indeferido') ||
      textoNormalizado.includes('reprovado') ||
      textoNormalizado.includes('cancelado')
    ) {
      return 'badge-status-vermelho';
    }

    return 'badge-status-cinza';
  };

  const textoFinal = children ?? status;
  const classeBadge = obterClasseBadge(typeof textoFinal === 'string' ? textoFinal : status, variante);

  return (
    <span className={`badge-status ${classeBadge}`}>
      {textoFinal}
    </span>
  );
}

export default StatusBadge;
