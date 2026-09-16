import React from 'react';

function InfoLinha({ rotulo, valor, children, className = '' }) {
  return (
    <div className={`informacao ${className}`.trim()}>
      <span>{rotulo}</span>
      <strong>{children ?? valor}</strong>
    </div>
  );
}

export default InfoLinha;
