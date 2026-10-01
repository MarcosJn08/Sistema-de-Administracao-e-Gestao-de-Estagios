import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ChevronDown, Pencil, Eye, EyeOff, Users } from 'lucide-react';
import StatusBadge from '../StatusBadge.jsx';
import Paginacao from '../Paginacao.jsx';

function TabelaVagasEmpresa({ vagas, onAlternarStatus, onEditarVaga }) {
  const navigate = useNavigate();
  const [busca, setBusca] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('Todos');
  const [filtroArea, setFiltroArea] = useState('Todas');
  const [paginaAtual, setPaginaAtual] = useState(1);
  const itensPorPagina = 10;

  const vagasFiltradas = useMemo(() => {
    return vagas.filter((vaga) => {
      const matchBusca = vaga.titulo.toLowerCase().includes(busca.toLowerCase());
      const matchStatus = filtroStatus === 'Todos' || vaga.status === filtroStatus;
      const matchArea = filtroArea === 'Todas' || (vaga.area && vaga.area.toLowerCase() === filtroArea.toLowerCase());
      return matchBusca && matchStatus && matchArea;
    });
  }, [vagas, busca, filtroStatus, filtroArea]);

  const totalPaginas = Math.max(1, Math.ceil(vagasFiltradas.length / itensPorPagina));
  const vagasPaginadas = useMemo(() => {
    const inicio = (paginaAtual - 1) * itensPorPagina;
    return vagasFiltradas.slice(inicio, inicio + itensPorPagina);
  }, [vagasFiltradas, paginaAtual, itensPorPagina]);

  const obterBadgeStatus = (status) => {
    switch (status) {
      case 'Ativa':
        return <span className="badge-status badge-status-verde">Ativa</span>;
      case 'Rascunho':
        return <span className="badge-status badge-status-ambar">Rascunho</span>;
      case 'Encerrada':
        return <span className="badge-status badge-status-vermelho">Encerrada</span>;
      default:
        return <StatusBadge status={status} />;
    }
  };

  return (
    <div className="card-tabela-empresa">
      <div className="d-flex flex-column flex-md-row gap-3 mb-4 align-items-stretch align-items-md-center">
        <div
          className="flex-grow-1 d-flex align-items-center"
          style={{
            position: 'relative',
          }}
        >
          <Search
            size={18}
            style={{
              position: 'absolute',
              left: '14px',
              color: '#94a3b8',
              pointerEvents: 'none',
            }}
          />
          <input
            type="text"
            placeholder="Buscar por título da vaga..."
            value={busca}
            onChange={(e) => {
              setBusca(e.target.value);
              setPaginaAtual(1);
            }}
            style={{
              width: '100%',
              padding: '10px 14px 10px 42px',
              borderRadius: '8px',
              border: '1px solid #e2e8f0',
              fontSize: '0.875rem',
              color: '#1e293b',
              outline: 'none',
              backgroundColor: '#ffffff',
            }}
          />
        </div>

        <div style={{ position: 'relative', minWidth: '170px' }}>
          <select
            value={filtroStatus}
            onChange={(e) => {
              setFiltroStatus(e.target.value);
              setPaginaAtual(1);
            }}
            style={{
              width: '100%',
              padding: '10px 36px 10px 14px',
              borderRadius: '8px',
              border: '1px solid #e2e8f0',
              fontSize: '0.875rem',
              color: '#1e293b',
              appearance: 'none',
              backgroundColor: '#ffffff',
              cursor: 'pointer',
              fontWeight: 500,
            }}
          >
            <option value="Todos">Status: Todos</option>
            <option value="Ativa">Status: Ativa</option>
            <option value="Rascunho">Status: Rascunho</option>
            <option value="Encerrada">Status: Encerrada</option>
          </select>
          <ChevronDown
            size={16}
            style={{
              position: 'absolute',
              right: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#64748b',
              pointerEvents: 'none',
            }}
          />
        </div>

        <div style={{ position: 'relative', minWidth: '170px' }}>
          <select
            value={filtroArea}
            onChange={(e) => {
              setFiltroArea(e.target.value);
              setPaginaAtual(1);
            }}
            style={{
              width: '100%',
              padding: '10px 36px 10px 14px',
              borderRadius: '8px',
              border: '1px solid #e2e8f0',
              fontSize: '0.875rem',
              color: '#1e293b',
              appearance: 'none',
              backgroundColor: '#ffffff',
              cursor: 'pointer',
              fontWeight: 500,
            }}
          >
            <option value="Todas">Área: Todas</option>
            <option value="Tecnologia">Área: Tecnologia</option>
            <option value="Comunicação">Área: Comunicação</option>
            <option value="Design & UX">Área: Design & UX</option>
            <option value="Administração">Área: Administração</option>
          </select>
          <ChevronDown
            size={16}
            style={{
              position: 'absolute',
              right: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#64748b',
              pointerEvents: 'none',
            }}
          />
        </div>
      </div>

      <div className="table-responsive">
        <table className="table align-middle" style={{ borderCollapse: 'separate', borderSpacing: '0 4px' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
              <th
                style={{
                  color: '#64748b',
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  padding: '12px 16px',
                  border: 'none',
                  whiteSpace: 'nowrap',
                }}
              >
                Título da Vaga
              </th>
              <th
                style={{
                  color: '#64748b',
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  padding: '12px 16px',
                  border: 'none',
                  whiteSpace: 'nowrap',
                }}
              >
                Área
              </th>
              <th
                style={{
                  color: '#64748b',
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  padding: '12px 16px',
                  border: 'none',
                  whiteSpace: 'nowrap',
                }}
              >
                Inscritos
              </th>
              <th
                style={{
                  color: '#64748b',
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  padding: '12px 16px',
                  border: 'none',
                  whiteSpace: 'nowrap',
                }}
              >
                Status
              </th>
              <th
                style={{
                  color: '#64748b',
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  padding: '12px 16px',
                  border: 'none',
                  whiteSpace: 'nowrap',
                }}
              >
                Data de Publicação
              </th>
              <th
                style={{
                  color: '#64748b',
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  padding: '12px 16px',
                  border: 'none',
                  textAlign: 'right',
                  whiteSpace: 'nowrap',
                }}
              >
                Ações
              </th>
            </tr>
          </thead>
          <tbody>
            {vagasPaginadas.length > 0 ? (
              vagasPaginadas.map((vaga) => (
                <tr
                  key={vaga.id}
                  style={{
                    borderBottom: '1px solid #f8fafc',
                    transition: 'background-color 0.15s ease',
                  }}
                >
                  <td
                    style={{
                      padding: '14px 16px',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      color: '#0f172a',
                      border: 'none',
                    }}
                  >
                    <span
                      onClick={() => navigate(`/sage/empresa/vagas/${vaga.id}/candidatos`)}
                      style={{ cursor: 'pointer', transition: 'color 0.15s ease' }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = '#2e7d32')}
                      onMouseLeave={(e) => (e.currentTarget.style.color = '#0f172a')}
                      title="Ver candidatos desta vaga"
                    >
                      {vaga.titulo}
                    </span>
                  </td>

                  <td
                    style={{
                      padding: '14px 16px',
                      fontSize: '0.875rem',
                      color: '#64748b',
                      border: 'none',
                    }}
                  >
                    {vaga.area}
                  </td>

                  <td style={{ padding: '14px 16px', border: 'none' }}>
                    <span
                      onClick={() => navigate(`/sage/empresa/vagas/${vaga.id}/candidatos`)}
                      style={{
                        backgroundColor: '#d1f4e0',
                        color: '#0f7b44',
                        padding: '4px 12px',
                        borderRadius: '50rem',
                        fontSize: '0.8125rem',
                        fontWeight: 600,
                        display: 'inline-block',
                        cursor: 'pointer',
                        transition: 'opacity 0.15s ease',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.85')}
                      onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
                      title="Ver candidatos desta vaga"
                    >
                      {vaga.inscritos || vaga.candidatos || 0} candidatos
                    </span>
                  </td>

                  <td style={{ padding: '14px 16px', border: 'none' }}>
                    {obterBadgeStatus(vaga.status)}
                  </td>

                  <td
                    style={{
                      padding: '14px 16px',
                      fontSize: '0.875rem',
                      color: '#64748b',
                      border: 'none',
                    }}
                  >
                    {vaga.dataPublicacao}
                  </td>

                  <td
                    style={{
                      padding: '14px 16px',
                      border: 'none',
                      textAlign: 'right',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    <div className="d-inline-flex align-items-center gap-2">
                      <button
                        type="button"
                        onClick={() => navigate(`/sage/empresa/vagas/${vaga.id}/candidatos`)}
                        style={{
                          background: 'none',
                          border: 'none',
                          padding: '4px',
                          color: '#64748b',
                          cursor: 'pointer',
                          borderRadius: '4px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'color 0.15s ease',
                        }}
                        title="Gerenciar Candidatos"
                      >
                        <Users size={17} />
                      </button>

                      <button
                        type="button"
                        onClick={() => onEditarVaga && onEditarVaga(vaga)}
                        style={{
                          background: 'none',
                          border: 'none',
                          padding: '4px',
                          color: '#64748b',
                          cursor: 'pointer',
                          borderRadius: '4px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'color 0.15s ease',
                        }}
                        title="Editar Vaga"
                      >
                        <Pencil size={17} />
                      </button>

                      <button
                        type="button"
                        onClick={() => onAlternarStatus && onAlternarStatus(vaga.id)}
                        style={{
                          background: 'none',
                          border: 'none',
                          padding: '4px',
                          color: vaga.status === 'Encerrada' ? '#94a3b8' : '#64748b',
                          cursor: 'pointer',
                          borderRadius: '4px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'color 0.15s ease',
                        }}
                        title={vaga.status === 'Encerrada' ? 'Reativar vaga' : 'Encerrar vaga'}
                      >
                        {vaga.status === 'Encerrada' ? <EyeOff size={17} /> : <Eye size={17} />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="text-center py-5 text-secondary" style={{ border: 'none' }}>
                  Nenhuma vaga encontrada com os filtros selecionados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Paginacao paginaAtual={paginaAtual} totalPaginas={totalPaginas} aoMudarPagina={setPaginaAtual}
        textoResumo={`Mostrando ${vagasFiltradas.length} de ${vagas.length} vagas publicadas`} />
    </div>
  );
}

export default TabelaVagasEmpresa;
