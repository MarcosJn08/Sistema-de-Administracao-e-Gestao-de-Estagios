import React from 'react';

function CardMetricaEmpresa({
  titulo,
  valor,
  icone: Icone,
  corIcone = '#2e7d32',
  corFundoIcone = '#eaf5ea',
}) {
  return (
    <div
      className="card-metrica-empresa bg-white"
      style={{
        borderRadius: '16px',
        border: '1px solid #e2e8f0',
        padding: '20px 24px',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.02)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '100%',
      }}
    >
      <div>
        <span
          style={{
            color: '#64748b',
            fontSize: '0.875rem',
            fontWeight: 500,
            display: 'block',
            marginBottom: '6px',
          }}
        >
          {titulo}
        </span>
        <span
          style={{
            color: '#0f172a',
            fontSize: '2rem',
            fontWeight: 700,
            lineHeight: 1.1,
          }}
        >
          {valor}
        </span>
      </div>

      <div
        style={{
          width: '46px',
          height: '46px',
          borderRadius: '12px',
          backgroundColor: corFundoIcone,
          color: corIcone,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        {Icone && <Icone size={22} strokeWidth={2} />}
      </div>
    </div>
  );
}

export default CardMetricaEmpresa;
