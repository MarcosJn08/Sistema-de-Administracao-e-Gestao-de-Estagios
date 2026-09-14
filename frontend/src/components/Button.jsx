import React from 'react';

// Tipos de botão suportados:
// - botao-com-fundo
// - botao-sem-fundo-verde
// - botao-sem-fundo-branco
// - botao-texto-branco
function Botao({ texto, tipo = 'botao-com-fundo', children, className = '', href, onClick, ...props }) {
  const classes = `botao ${tipo} ${className}`.trim();
  const content = children ?? texto;

  if (href) {
    return (
      <a href={href} className={classes} onClick={onClick} {...props}>
        {content}
      </a>
    );
  }

  return (
    <button type="button" className={classes} onClick={onClick} {...props}>
      {content}
    </button>
  );
}

export default Botao;
