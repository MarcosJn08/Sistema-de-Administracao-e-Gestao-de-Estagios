import React from 'react';
import { Download, Eye, FilePenLine, Send, SquarePen } from 'lucide-react';
import '../../App.css';

function BotaoAcao({ tipo = 'Visualizar', aoClicar, onClick, texto, rotulo, somenteIcone = false, ariaLabel }) {
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
  const Icone = textoNormalizado.includes('editar')
    ? FilePenLine
    : textoNormalizado.includes('visualizar')
      ? Eye
      : textoNormalizado.includes('pdf')
        ? Download
        : textoNormalizado.includes('enviar')
          ? Send
          : textoNormalizado.includes('preencher')
            ? SquarePen
            : null;

  return (
    <button
      type="button"
      className={`botao-acao-pilula ${classeVariante}${somenteIcone ? ' botao-acao-somente-icone' : ''}`}
      onClick={lidarComClique}
      aria-label={ariaLabel || (somenteIcone ? textoBotao : undefined)}
      title={somenteIcone ? textoBotao : undefined}
    >
      {Icone && <Icone size={14} aria-hidden="true" />}
      {!somenteIcone && textoBotao}
    </button>
  );
}

export default BotaoAcao;
