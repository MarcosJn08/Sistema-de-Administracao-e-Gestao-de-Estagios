import React from 'react';
import '../../App.css';
import './CardsDiretor.css';

function CardProximosVencimentos({ titulo = 'Próximos vencimentos', itens = [] }) {
  return (
    <div className="cartao-sage h-100 mb-0">
      <h2 className="cartao-sage-titulo">{titulo}</h2>

      <ul className="lista-vencimentos">
        {itens.map((item) => (
          <li key={item.id} style={{ '--cor-vencimento': item.cor }}>
            <div className="vencimento-titulo">{item.titulo}</div>
            <div className="vencimento-prazo">{item.prazo}</div>
          </li>
        ))}

        {itens.length === 0 && (
          <li className="text-secondary small">Nenhum vencimento próximo.</li>
        )}
      </ul>
    </div>
  );
}

export default CardProximosVencimentos;
