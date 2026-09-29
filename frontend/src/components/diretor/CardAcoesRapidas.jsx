import React from 'react';
import '../../App.css';
import './CardsDiretor.css';
import Button from '../Button.jsx';

function CardAcoesRapidas({ titulo = 'Ações rápidas', acoes = [] }) {
  return (
    <div className="cartao-sage h-100 mb-0">
      <h2 className="cartao-sage-titulo">{titulo}</h2>

      <div className="acoes-rapidas">
        {acoes.map((acao) => (
          <Button
            key={acao.id}
            tipo="botao-sem-fundo-verde"
            href={acao.href}
            onClick={(e) => {
              if (!acao.href || acao.href === '#') {
                e.preventDefault();
              }
              if (acao.aoClicar) acao.aoClicar(e);
            }}
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
