import './Button.css';
import { Link } from 'react-router-dom';

function Button({ texto, tipo = 'botao-com-fundo', children, className = '', href, onClick, ...props }) {
  const baseClass = tipo === 'botao-sage-verde' ? 'botao-sage-verde' : `botao ${tipo}`;
  const classes = `${baseClass} ${className}`.trim();
  const content = children ?? texto;

  if (href?.startsWith('/sage') && !props.target && !props.download) {
    return <Link to={href} className={classes} onClick={onClick} {...props}>{content}</Link>;
  }

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

export default Button;
