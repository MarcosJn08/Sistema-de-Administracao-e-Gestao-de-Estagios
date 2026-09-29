import React from 'react';
import '../../App.css';
import StatusBadge from '../StatusBadge.jsx';
import BotaoAcao from './BotaoAcao.jsx';

function CardDocumentos({
  titulo = 'Pendências para análise',
  documentos = [],
  textoVerTodos = 'Ver todas as pendências',
  aoVerTodos,
  aoClicarAcao,
  onActionClick,
}) {
  const lidarComAcao = aoClicarAcao || onActionClick;

  return (
    <div className="cartao-sage mb-0">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2 className="cartao-sage-titulo mb-0">{titulo}</h2>
        {textoVerTodos && (
          <button
            type="button"
            className="btn btn-sm"
            style={{
              border: '1px solid #d1d5db',
              backgroundColor: '#ffffff',
              color: '#475569',
              borderRadius: '8px',
              padding: '6px 14px',
              fontSize: '13px',
              fontWeight: 500,
              boxShadow: '0 1px 2px rgba(0, 0, 0, 0.04)',
            }}
            onClick={aoVerTodos}
          >
            {textoVerTodos}
          </button>
        )}
      </div>

      <div className="tabela-sage-container">
        <table className="tabela-sage">
          <thead>
            <tr>
              <th style={{ width: '18%' }}>Aluno</th>
              <th style={{ width: '22%' }}>Pendência</th>
              <th style={{ width: '20%' }}>Empresa</th>
              <th style={{ width: '14%' }}>Data</th>
              <th style={{ width: '14%' }}>Status</th>
              <th style={{ width: '12%', textAlign: 'center' }}>Ação</th>
            </tr>
          </thead>

          <tbody>
            {documentos.map((doc) => (
              <tr key={doc.id}>
                <td className="fw-bold text-dark">{doc.nome}</td>
                <td>{doc.descricao}</td>
                <td style={{ color: '#475569' }}>{doc.empresa}</td>
                <td style={{ color: '#475569' }}>{doc.data}</td>
                <td>
                  <StatusBadge status={doc.status} />
                </td>
                <td className="text-center">
                  <div className="d-flex justify-content-center gap-2 align-items-center">
                    {doc.acoes?.map((acao, index) => (
                      <BotaoAcao
                        key={index}
                        tipo={acao}
                        aoClicar={() =>
                          lidarComAcao && lidarComAcao(doc, acao)
                        }
                      />
                    ))}
                  </div>
                </td>
              </tr>
            ))}

            {documentos.length === 0 && (
              <tr>
                <td colSpan="6" className="text-center py-4 text-muted">
                  Nenhuma pendência encontrada.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default CardDocumentos;

