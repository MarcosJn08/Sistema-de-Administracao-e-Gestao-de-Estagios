import React from 'react';
import '../App.css';

function StatusBadge({ status, variante, variant }) {
  const obterClasseBadge = (textoStatus, varianteDefinida) => {
    const varEscolhida = varianteDefinida || variant;
    if (varEscolhida) {
      return `badge-status-${varEscolhida}`;
    }

    const textoNormalizado = (textoStatus || '').toLowerCase().trim();

    if (
      textoNormalizado.includes('deferido') && !textoNormalizado.includes('indeferido') ||
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

  const classeBadge = obterClasseBadge(status, variante);

  return (
    <span className={`badge-status ${classeBadge}`}>
      {status}
    </span>
  );
}

export default StatusBadge;
