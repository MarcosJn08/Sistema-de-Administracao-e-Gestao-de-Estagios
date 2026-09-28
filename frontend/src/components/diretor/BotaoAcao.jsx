import React from 'react';
import '../../App.css';

const VARIANTES = ['azul', 'ambar', 'verde', 'roxo', 'primario', 'contorno'];

function BotaoAcao({
  tipo = 'Visualizar',
  aoClicar,
  onClick,
  texto,
  rotulo,
  nomeBotao,
  variante,
}) {
  // Define qual texto será mostrado no botão
  const textoBotao = texto || rotulo || nomeBotao || tipo;

  // Normaliza o texto para definir a cor do botão
  const textoNormalizado = textoBotao.toLowerCase().trim();

  let classeVariante = 'botao-acao-azul';

  if (variante && VARIANTES.includes(variante)) {
    // Variante escolhida explicitamente tem prioridade sobre o texto
    classeVariante = `botao-acao-${variante}`;
  } else if (textoNormalizado === 'analisar') {
    classeVariante = 'botao-acao-primario';
  } else if (textoNormalizado === 'ver') {
    classeVariante = 'botao-acao-contorno';
  } else if (textoNormalizado.includes('pdf')) {
    classeVariante = 'botao-acao-ambar';
  } else if (textoNormalizado.includes('preencher')) {
    classeVariante = 'botao-acao-verde';
  } else if (textoNormalizado.includes('enviar')) {
    classeVariante = 'botao-acao-roxo';
  } else if (
    textoNormalizado.includes('visualizar') ||
    textoNormalizado.includes('ver')
  ) {
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
