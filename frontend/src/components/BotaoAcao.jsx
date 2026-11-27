<<<<<<< HEAD
import '../App.css';

function varianteDaAcao(texto) {
=======
import { ArrowRight, Download, Eye, FilePenLine, FileSearch, Send, SquarePen } from 'lucide-react';
import '../App.css';

const ICONES = {
  analisar: FileSearch,
  ver: Eye,
  editar: FilePenLine,
  visualizar: Eye,
  'ver todas': ArrowRight,
  pdf: Download,
  enviar: Send,
  preencher: SquarePen,
};

const TRECHOS_COM_ICONE = ['editar', 'visualizar', 'ver todas', 'pdf', 'enviar', 'preencher'];

function varianteDaAcao(texto) {
  if (texto === 'analisar') return 'primario';
  if (texto === 'ver') return 'contorno';
>>>>>>> origin/main
  if (texto.includes('pdf')) return 'ambar';
  if (texto.includes('preencher')) return 'verde';
  if (texto.includes('enviar')) return 'roxo';
  return 'azul';
}

<<<<<<< HEAD
function BotaoAcao({ texto, variante, icone: Icone, tamanhoIcone, somenteIcone = false, className = '', ...props }) {
  const cor = variante || varianteDaAcao(texto.toLowerCase().trim());
  const classeIcone = somenteIcone ? ' botao-acao-somente-icone' : '';

  return (
    <button type="button" className={`botao-acao-pilula botao-acao-${cor}${classeIcone} ${className}`.trim()} {...props}>
=======
function chaveDoIcone(texto) {
  if (texto === 'analisar' || texto === 'ver') return texto;
  return TRECHOS_COM_ICONE.find((trecho) => texto.includes(trecho));
}

function BotaoAcao({ texto = 'Visualizar', variante, icone, tamanhoIcone = 14, somenteIcone = false, className = '', ...props }) {
  const acao = texto.toLowerCase().trim();
  const cor = variante || varianteDaAcao(acao);
  const Icone = icone ?? ICONES[chaveDoIcone(acao)];
  const classeIcone = somenteIcone ? ' botao-acao-somente-icone' : '';
  const rotuloIcone = somenteIcone ? texto : undefined;

  return (
    <button
      type="button"
      className={`botao-acao-pilula botao-acao-${cor}${classeIcone} ${className}`.trim()}
      aria-label={rotuloIcone}
      title={rotuloIcone}
      {...props}
    >
>>>>>>> origin/main
      {Icone && <Icone size={tamanhoIcone} aria-hidden="true" />}
      {!somenteIcone && texto}
    </button>
  );
}

export default BotaoAcao;
