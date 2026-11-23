import { Download, Eye, FilePenLine, Send, SquarePen } from 'lucide-react';
import BotaoAcaoBase from '../BotaoAcao.jsx';

function BotaoAcao({ tipo = 'Visualizar', aoClicar, onClick, texto, rotulo, somenteIcone = false, ariaLabel }) {
  const textoBotao = texto || rotulo || tipo;
  const textoNormalizado = (textoBotao || '').toLowerCase().trim();

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
    <BotaoAcaoBase
      texto={textoBotao}
      icone={Icone}
      tamanhoIcone={14}
      somenteIcone={somenteIcone}
      onClick={aoClicar || onClick}
      aria-label={ariaLabel || (somenteIcone ? textoBotao : undefined)}
      title={somenteIcone ? textoBotao : undefined}
    />
  );
}

export default BotaoAcao;
