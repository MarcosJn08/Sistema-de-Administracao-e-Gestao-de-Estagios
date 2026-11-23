import '../App.css';

function varianteDaAcao(texto) {
  if (texto.includes('pdf')) return 'ambar';
  if (texto.includes('preencher')) return 'verde';
  if (texto.includes('enviar')) return 'roxo';
  return 'azul';
}

function BotaoAcao({ texto, variante, icone: Icone, tamanhoIcone, somenteIcone = false, className = '', ...props }) {
  const cor = variante || varianteDaAcao(texto.toLowerCase().trim());
  const classeIcone = somenteIcone ? ' botao-acao-somente-icone' : '';

  return (
    <button type="button" className={`botao-acao-pilula botao-acao-${cor}${classeIcone} ${className}`.trim()} {...props}>
      {Icone && <Icone size={tamanhoIcone} aria-hidden="true" />}
      {!somenteIcone && texto}
    </button>
  );
}

export default BotaoAcao;
