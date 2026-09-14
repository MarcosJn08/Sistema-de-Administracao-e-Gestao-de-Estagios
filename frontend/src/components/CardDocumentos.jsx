import React from 'react';
import '../App.css';
import StatusBadge from './StatusBadge.jsx';
import BotaoAcao from './BotaoAcao.jsx';

function CardDocumentos({
  documentos = [],
  aoClicarAcao,
  onActionClick,
}) {
  const lidarComAcao = aoClicarAcao || onActionClick;

  return (
    <div className="cartao-sage">
      <h2 className="cartao-sage-titulo">Documentos</h2>

      <div className="tabela-sage-container">
        <table className="tabela-sage">
          <thead>
            <tr>
              <th style={{ width: '50px' }}>ID</th>
              <th style={{ width: '20%' }}>Documento</th>
              <th style={{ width: '28%' }}>Descrição</th>
              <th style={{ width: '18%' }}>Status</th>
              <th style={{ minWidth: '310px' }}>Ação</th>
            </tr>
          </thead>
          <tbody>
            {documentos.map((doc) => (
              <tr key={doc.id}>
                <td className="fw-bold text-dark">{doc.id}</td>
                <td className="fw-bold text-dark">{doc.nome}</td>
                <td className="text-secondary">{doc.descricao}</td>
                <td>
                  <StatusBadge status={doc.status} />
                </td>
                <td>
                  <div className="d-flex flex-nowrap gap-2 align-items-center">
                    {doc.acoes?.map((acao, index) => (
                      <BotaoAcao
                        key={index}
                        tipo={acao}
                        aoClicar={() => lidarComAcao && lidarComAcao(doc, acao)}
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

export default CardDocumentos;
