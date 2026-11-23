import { ArrowRight, Eye, FileSearch } from 'lucide-react';
import BotaoAcaoBase from '../BotaoAcao.jsx';

const VARIANTES = ['azul', 'ambar', 'verde', 'roxo', 'primario', 'contorno'];

function BotaoAcao({
  tipo = 'Visualizar',
  aoClicar,
  onClick,
  texto,
  rotulo,
  nomeBotao,
  variante,
  icone: Icone,
  className = '',
  ...props
}) {
  const textoBotao = texto || rotulo || nomeBotao || tipo;

  const textoNormalizado = textoBotao.toLowerCase().trim();

  let varianteBotao;

  if (variante && VARIANTES.includes(variante)) {
    varianteBotao = variante;
  } else if (textoNormalizado === 'analisar') {
    varianteBotao = 'primario';
  } else if (textoNormalizado === 'ver') {
    varianteBotao = 'contorno';
  }

  const IconeBotao = Icone || (textoNormalizado === 'analisar'
    ? FileSearch
    : textoNormalizado === 'ver'
      ? Eye
      : textoNormalizado.includes('ver todas')
        ? ArrowRight
        : null);

  return (
    <BotaoAcaoBase
      texto={textoBotao}
      variante={varianteBotao}
      icone={IconeBotao}
      tamanhoIcone={15}
      className={className}
      onClick={aoClicar || onClick}
      {...props}
    />
  );
}

export default BotaoAcao;
