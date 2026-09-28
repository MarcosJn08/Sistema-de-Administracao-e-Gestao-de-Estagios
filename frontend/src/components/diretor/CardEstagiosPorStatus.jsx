import React from 'react';
import '../../App.css';
import './CardsDiretor.css';

/**
 * Barras horizontais por status.
 * `total` é a base de cálculo da largura (valor / total).
 */
function CardEstagiosPorStatus({ titulo = 'Estágios por status', itens = [], total = 100 }) {
  return (
    <div className="cartao-sage">
      <h2 className="cartao-sage-titulo">{titulo}</h2>

      <div className="estagios-status-lista">
        {itens.map((item) => {
          const percentual = total > 0 ? Math.min(Math.round((item.valor / total) * 100), 100) : 0;

          return (
            <div key={item.id}>
              <div className="estagios-status-linha">
                <span>{item.rotulo}</span>
                <span>{item.valor}</span>
              </div>

              <div className="barra-progresso-trilha">
                <div
                  className="barra-progresso-preenchimento"
                  style={{ width: `${percentual}%`, backgroundColor: item.cor }}
                  role="progressbar"
                  aria-label={item.rotulo}
                  aria-valuenow={item.valor}
                  aria-valuemin={0}
                  aria-valuemax={total}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default CardEstagiosPorStatus;
