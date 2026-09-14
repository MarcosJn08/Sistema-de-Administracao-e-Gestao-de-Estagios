//tipos de botão: botao-com-fundo e botao-sem-fundo
function Botao({ texto, tipo = 'botao-com-fundo', children, className = '', href, ...props }) {
  const classes = `botao ${tipo} ${className}`.trim();
  const content = children ?? texto;

  if (href)
    return (
      <a href={href} className={classes} {...props}>
        {content}
      </a>
    );
  return (
    <button type="button" className={classes} {...props}>
      {content}
    </button>
  );
}

export default Botao;
