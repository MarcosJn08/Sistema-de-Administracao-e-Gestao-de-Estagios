import { useState } from 'react';
import { Bookmark } from 'lucide-react';
import useVagasSalvas from '../../hooks/useVagasSalvas.js';
import { definirVagaSalva } from '../../utils/vagasSalvasAluno.js';
import './BotaoSalvarVaga.css';

export default function BotaoSalvarVaga({ vaga, mostrarRemover = false }) {
  const vagas = useVagasSalvas();
  const salvo = vagas.some((item) => String(item.id) === String(vaga.id));
  const [erro, setErro] = useState('');
  function alternar(evento) {
    evento.stopPropagation();
    try {
      definirVagaSalva(vaga, !salvo);
      setErro('');
    } catch {
      setErro('Não foi possível atualizar as vagas salvas. Verifique o armazenamento do navegador e tente novamente.');
    }
  }
  return (
    <div className="salvar-vaga-controle">
      <button type="button" className={`btn-salvar-vaga${salvo ? ' salvo' : ''}`} onClick={alternar}
        aria-pressed={salvo} aria-label={salvo ? `Remover dos salvos: ${vaga.titulo}` : `Salvar vaga: ${vaga.titulo}`}>
        <Bookmark size={16} fill={salvo ? 'currentColor' : 'none'} aria-hidden="true" />
        {salvo ? mostrarRemover ? 'Remover dos salvos' : 'Vaga salva' : 'Salvar vaga'}
      </button>
      {erro && <p className="salvar-vaga-erro" role="alert">{erro}</p>}
    </div>
  );
}
