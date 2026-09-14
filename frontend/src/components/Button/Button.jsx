import "./Button.css";

// Tipos:
// botao-com-fundo
// botao-sem-fundo-verde
// botao-sem-fundo-branco

function Botao({ texto, tipo = "botao-com-fundo", children, onClick }) {
  return (
    <button
      className={`botao ${tipo}`}
      onClick={onClick}
    >
      {children}
      {texto}
    </button>
  );
}

export default Botao;