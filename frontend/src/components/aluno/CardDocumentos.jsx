import React from 'react';
import '../../App.css';
import StatusBadge from '../StatusBadge.jsx';
import BotaoAcao from './BotaoAcao.jsx';

function CardDocumentos({
  documentos = [],
  aoClicarAcao,
  onActionClick,
  titulo = 'Documentos',
  somenteLeitura = false,
}) {
  const lidarComAcao = aoClicarAcao || onActionClick;

  return (
    <div className="cartao-sage">
      <h2 className="cartao-sage-titulo">{titulo}</h2>

      <div className="tabela-sage-container">
        <table className="tabela-sage">
          <thead>
            <tr>
              <th style={{ width: '50px' }}>ID</th>
              <th style={{ width: '20%' }}>Documento</th>
              <th style={{ width: '28%' }}>Descrição</th>
              <th style={{ width: '18%' }}>Status</th>
              {somenteLeitura ? <th>Data</th> : <th style={{ minWidth: '310px' }}>Ação</th>}
            </tr>
          </thead>
          <tbody>
            {documentos.length === 0 && (
              <tr><td colSpan={5} className="text-center text-secondary py-4">Nenhum documento ou relatório registrado.</td></tr>
            )}
            {documentos.map((doc) => (
              <tr key={doc.id}>
                <td className="fw-bold text-dark">{doc.id}</td>
                <td className="fw-bold text-dark">{doc.nome}</td>
                <td className="text-secondary">{doc.descricao}</td>
                <td>
                  <StatusBadge status={doc.status} />
                </td>
                {somenteLeitura ? <td className="text-nowrap">{doc.data || 'Não informada'}</td> : <td>
                  <div className="d-flex flex-nowrap gap-2 align-items-center">
                    {doc.acoes?.map((acao, index) => (
                      <BotaoAcao
                        key={index}
                        tipo={acao}
                        aoClicar={() => lidarComAcao && lidarComAcao(doc, acao)}
                      />
                    ))}
                  </div>
                </td>}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default CardDocumentos;
