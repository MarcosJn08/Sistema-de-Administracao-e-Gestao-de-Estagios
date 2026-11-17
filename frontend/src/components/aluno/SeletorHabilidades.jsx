import { useId, useState } from 'react';
import { Modal } from 'react-bootstrap';
import { Ellipsis, Search } from 'lucide-react';
import Botao from '../Button.jsx';
import HabilidadesBadges from './HabilidadesBadges.jsx';
import { normalizarHabilidade } from '../../data/habilidades.js';
import './SeletorHabilidades.css';

export default function SeletorHabilidades({ habilidades = [], selecionadas = [], aoAlternar }) {
  const [aberto, setAberto] = useState(false);
  const [busca, setBusca] = useState('');
  const id = useId();
  const filtradas = habilidades.filter((habilidade) => normalizarHabilidade(habilidade).includes(normalizarHabilidade(busca)));
  const quantidade = selecionadas.length;
  const resumo = `${quantidade} ${quantidade === 1 ? 'habilidade selecionada' : 'habilidades selecionadas'}`;

  function abrir() {
    setBusca('');
    setAberto(true);
  }

  return (
    <div className="seletor-habilidades">
      <div className="seletor-habilidades-previa">
        <HabilidadesBadges habilidades={habilidades.slice(0, 5)} selecionadas={selecionadas} aoAlternar={aoAlternar} />
        {habilidades.length > 5 && <button type="button" className="habilidade-badge seletor-habilidades-mais"
          onClick={abrir} aria-label="Ver todas as habilidades" title="Ver todas as habilidades" aria-haspopup="dialog">
          <Ellipsis size={20} aria-hidden="true" />
        </button>}
      </div>
      <p className="seletor-habilidades-resumo" aria-live="polite">{resumo}</p>

      <Modal show={aberto} onHide={() => setAberto(false)} centered scrollable
        dialogClassName="seletor-habilidades-modal" aria-labelledby={`${id}-titulo`}>
        <Modal.Header closeButton closeLabel="Fechar seleção de habilidades">
          <Modal.Title as="h2" id={`${id}-titulo`}>Selecionar habilidades</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="seletor-habilidades-instrucao">Selecione as habilidades que fazem parte do seu perfil.</p>
          <label className="visually-hidden" htmlFor={`${id}-busca`}>Buscar habilidades</label>
          <div className="seletor-habilidades-busca">
            <Search size={18} aria-hidden="true" />
            <input id={`${id}-busca`} type="search" className="form-control" placeholder="Buscar habilidades..."
              value={busca} onChange={(evento) => setBusca(evento.target.value)} autoFocus />
          </div>
          {filtradas.length ? <HabilidadesBadges habilidades={filtradas} selecionadas={selecionadas} aoAlternar={aoAlternar} />
            : <p className="perfil-complemento-vazio" role="status">Nenhuma habilidade encontrada. Você pode adicioná-la em “Outras habilidades” no perfil.</p>}
        </Modal.Body>
        <Modal.Footer>
          <span className="seletor-habilidades-resumo" aria-live="polite">{resumo}</span>
          <Botao tipo="botao-sage-verde" onClick={() => setAberto(false)}>Concluir</Botao>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
