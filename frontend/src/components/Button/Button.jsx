import "./Button.css";

//tipos de botão: botao-com-fundo , botao-sem-fundo-verde e botao-sem-fundo-branco
function Botao({ texto, tipo = "tipo" }) {
  return <button className={`botao ${tipo}`}>{texto}</button>;
}

export default Botao;
