import React from 'react';
import '../App.css';
import StatusBadge from './StatusBadge.jsx';
import BotaoAcao from './BotaoAcao.jsx';

function CardMinhasInscricoes({
  inscricoes = [],
  aoClicarAcao,
  onActionClick,
}) {
  const lidarComAcao = aoClicarAcao || onActionClick;

  return (
    <div className="cartao-sage">
      <h2 className="cartao-sage-titulo">Minhas Inscrições</h2>

      <div className="tabela-sage-container">
        <table className="tabela-sage">
          <thead>
            <tr>
              <th style={{ width: '50px' }}>ID</th>
              <th style={{ width: '54%' }}>Vaga</th>
              <th style={{ width: '22%' }}>Status</th>
              <th>Ação</th>
            </tr>
          </thead>
          <tbody>
            {inscricoes.map((item) => (
              <tr key={item.id}>
                <td className="fw-bold text-dark">{item.id}</td>
                <td className="fw-bold text-dark">{item.vaga}</td>
                <td>
                  <StatusBadge status={item.status} />
                </td>
                <td>
                  <div className="d-flex flex-wrap gap-2 align-items-center">
                    {item.acoes?.map((acao, index) => (
                      <BotaoAcao
                        key={index}
                        tipo={acao}
                        aoClicar={() => lidarComAcao && lidarComAcao(item, acao)}
                      />
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default CardMinhasInscricoes;
