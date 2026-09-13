import '../App.css'

//tipos de botão: botao-com-fundo e botao-sem-fundo
function Botao({texto, tipo = 'tipo'}) {
  return (
      <button className={`botao ${tipo}`}>
      {texto}
    </button>
  )
}

export default Botao