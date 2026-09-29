import React from 'react';
import '../../App.css';
import './CardsDiretor.css';

function CardAtividadeRecente({ titulo = 'Atividade recente', atividades = [] }) {
  return (
    <div className="cartao-sage h-100 mb-0">
      <h2 className="cartao-sage-titulo">{titulo}</h2>

      <ul className="lista-atividades">
        {atividades.map((item) => (
          <li key={item.id}>
            <span
              className="atividade-ponto"
              style={{ backgroundColor: item.cor }}
              aria-hidden="true"
            />
            <div>
              <div className="atividade-titulo">{item.titulo}</div>
              <div className="atividade-tempo">{item.tempo}</div>
            </div>
          </li>
        ))}

        {atividades.length === 0 && (
          <li className="text-secondary small">Nenhuma atividade recente.</li>
        )}
      </ul>
    </div>
  );
}

export default CardAtividadeRecente;
