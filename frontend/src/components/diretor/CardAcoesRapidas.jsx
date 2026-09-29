import React from 'react';
import '../../App.css';
import './CardsDiretor.css';
import Button from '../Button.jsx';

function CardAcoesRapidas({ titulo = 'Ações rápidas', acoes = [] }) {
  return (
    <div className="cartao-sage">
      <h2 className="cartao-sage-titulo">{titulo}</h2>

      <div className="acoes-rapidas">
        {acoes.map((acao) => (
          <Button
            key={acao.id}
            tipo="botao-sem-fundo-verde"
            href={acao.href}
            onClick={acao.aoClicar}
          >
            <i className={acao.icone} aria-hidden="true" />
            {acao.rotulo}
          </Button>
        ))}
      </div>
    </div>
  );
}

export default CardAcoesRapidas;
