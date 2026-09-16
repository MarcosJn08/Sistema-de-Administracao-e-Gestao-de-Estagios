import React from 'react';

function CardCadastro({ titulo, subtitulo, children, className = '' }) {
  return (
    <section className={`card-cadastro ${className}`.trim()}>
      <div className="card-titulo">
        {titulo && <h2>{titulo}</h2>}
        {subtitulo && <p>{subtitulo}</p>}
      </div>
      <div className="form-grid">
        {children}
      </div>
    </section>
  );
}

export default CardCadastro;
