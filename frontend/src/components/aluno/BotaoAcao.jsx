import React from 'react';
import '../../App.css';

function BotaoAcao({ tipo = 'Visualizar', aoClicar, onClick, texto, rotulo }) {
  const textoBotao = texto || rotulo || tipo;
  const textoNormalizado = (textoBotao || '').toLowerCase().trim();

  let classeVariante = 'botao-acao-azul';

  if (textoNormalizado.includes('pdf')) {
    classeVariante = 'botao-acao-ambar';
  } else if (textoNormalizado.includes('preencher')) {
    classeVariante = 'botao-acao-verde';
  } else if (textoNormalizado.includes('enviar')) {
    classeVariante = 'botao-acao-roxo';
  } else if (textoNormalizado.includes('visualizar')) {
    classeVariante = 'botao-acao-azul';
  }

  const lidarComClique = aoClicar || onClick;

  return (
    <button
      type="button"
      className={`botao-acao-pilula ${classeVariante}`}
      onClick={lidarComClique}
    >
      {textoBotao}
    </button>
  );
}

export default BotaoAcao;
