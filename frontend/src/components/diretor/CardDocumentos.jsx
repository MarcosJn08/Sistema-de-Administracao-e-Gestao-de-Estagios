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
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-3">
        <h2 className="cartao-sage-titulo mb-0">{titulo}</h2>
        {textoVerTodos && <BotaoAcao texto={textoVerTodos} variante="contorno" aoClicar={aoVerTodos} />}
      </div>

      <div className="tabela-sage-container" tabIndex={0} role="region" aria-label="Pendências documentais, role horizontalmente para ver todas as colunas">
        <table className="tabela-sage">
          <caption className="visually-hidden">Documentos pendentes de conferência pelo diretor</caption>
          <thead>
            <tr>
              <th scope="col" style={{ width: '18%' }}>Aluno</th>
              <th scope="col" style={{ width: '22%' }}>Pendência</th>
              <th scope="col" style={{ width: '20%' }}>Empresa</th>
              <th scope="col" style={{ width: '14%' }}>Data</th>
              <th scope="col" style={{ width: '14%' }}>Status</th>
              <th scope="col" style={{ width: '12%', textAlign: 'center' }}>Ação</th>
            </tr>
          </thead>

          <tbody>
            {documentos.map((doc) => (
              <tr key={doc.id}>
                <td className="fw-bold text-dark">{doc.nome}</td>
                <td>{doc.descricao}</td>
                <td style={{ color: '#475569' }}>{doc.empresa}</td>
                <td style={{ color: '#475569' }}>{doc.data}</td>
                <td><StatusBadge status={doc.status} /></td>
                <td className="text-center">
                  <div className="d-flex justify-content-center gap-2 align-items-center">
                    {doc.acoes?.map((acao, index) => <BotaoAcao
                      key={`${doc.id}-${acao}-${index}`}
                      tipo={acao}
                      aria-label={`${acao} ${doc.descricao} de ${doc.nome}`}
                      aoClicar={() => lidarComAcao && lidarComAcao(doc, acao)}
                    />)}
                  </div>
                </td>
              </tr>
            ))}

            {documentos.length === 0 && <tr>
              <td colSpan="6" className="text-center py-4 text-muted">Nenhuma pendência encontrada.</td>
            </tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default CardDocumentos;
