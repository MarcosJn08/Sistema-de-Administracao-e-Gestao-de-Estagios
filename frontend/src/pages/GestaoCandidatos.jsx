import React, { useState, useMemo, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Row, Col } from 'react-bootstrap';
import {
  Users,
  FileText,
  Handshake,
  CircleX,
  Search,
  ChevronDown,
  CheckCircle2,
  MoreVertical,
  Check,
  X
} from 'lucide-react';
import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';
import CardMetricaEmpresa from '../components/empresa/CardMetricaEmpresa.jsx';
import ModalDetalhesCandidato from '../components/empresa/ModalDetalhesCandidato.jsx';
import Paginacao from '../components/Paginacao.jsx';
import dadosEmpresa, { candidatosDesenvolvedorBackend } from '../data/empresa.js';
import './GestaoCandidatos.css';

function GestaoCandidatos() {
  const { vagaId } = useParams();
  const idNumerico = vagaId ? parseInt(vagaId, 10) : 1;
  const vagaAtual =
    dadosEmpresa.empresa?.vagas?.find((v) => v.id === idNumerico) ||
    dadosEmpresa.empresa?.vagas?.[0] || {
      id: 1,
      titulo: 'Desenvolvedor Backend',
      area: 'Tecnologia'
    };

  const [candidatos, setCandidatos] = useState(
    vagaAtual.candidatosLista && vagaAtual.candidatosLista.length > 0
      ? vagaAtual.candidatosLista
      : candidatosDesenvolvedorBackend
  );

  const [busca, setBusca] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('Todos');
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [mensagemFeedback, setMensagemFeedback] = useState(null);
  const [menuAbertoId, setMenuAbertoId] = useState(null);
  const [candidatoModal, setCandidatoModal] = useState(null);
  const [modalAberto, setModalAberto] = useState(false);
  const itensPorPagina = 10;

  useEffect(() => {
    const lidarComCliqueFora = (e) => {
      if (!e.target.closest('.dropdown-acoes-candidato')) {
        setMenuAbertoId(null);
      }
    };
    document.addEventListener('click', lidarComCliqueFora);
    return () => document.removeEventListener('click', lidarComCliqueFora);
  }, []);

  const metricas = useMemo(() => {
    const total = candidatos.length;
    const emAnalise = candidatos.filter((c) => c.status === 'Em Análise').length;
    const aprovados = candidatos.filter((c) => c.status === 'Aprovado').length;
    const reprovados = candidatos.filter((c) => c.status === 'Reprovado').length;

    return { total, emAnalise, aprovados, reprovados };
  }, [candidatos]);

  const candidatosFiltrados = useMemo(() => {
    return candidatos.filter((candidato) => {
      const matchBusca = candidato.nome.toLowerCase().includes(busca.toLowerCase());
      const matchStatus = filtroStatus === 'Todos' || candidato.status === filtroStatus;
      return matchBusca && matchStatus;
    });
  }, [candidatos, busca, filtroStatus]);

  const totalPaginas = Math.max(1, Math.ceil(candidatosFiltrados.length / itensPorPagina));
  const candidatosPaginados = useMemo(() => {
    const inicio = (paginaAtual - 1) * itensPorPagina;
    return candidatosFiltrados.slice(inicio, inicio + itensPorPagina);
  }, [candidatosFiltrados, paginaAtual, itensPorPagina]);

  const exibirFeedback = (msg, cor = '#2e7d32') => {
    setMensagemFeedback({ texto: msg, cor });
    setTimeout(() => {
      setMensagemFeedback(null);
    }, 3000);
  };

  const lidarComAprovar = (id, nome) => {
    setCandidatos((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: 'Aprovado' } : c))
    );
    setCandidatoModal((prev) => (prev && prev.id === id ? { ...prev, status: 'Aprovado' } : prev));
    exibirFeedback(`Candidato ${nome} foi aprovado com sucesso!`, '#2e7d32');
  };

  const lidarComReprovar = (id, nome) => {
    setCandidatos((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: 'Reprovado' } : c))
    );
    setCandidatoModal((prev) => (prev && prev.id === id ? { ...prev, status: 'Reprovado' } : prev));
    exibirFeedback(`Candidato ${nome} foi reprovado.`, '#dc2626');
  };

  const renderBadgeStatus = (status) => {
    switch (status) {
      case 'Em Análise':
        return <span className="badge-candidato-analise">Em Análise</span>;
      case 'Aprovado':
        return <span className="badge-candidato-aprovado">Aprovado</span>;
      case 'Reprovado':
        return <span className="badge-candidato-reprovado">Reprovado</span>;
      default:
        return <span>{status}</span>;
    }
  };

  const linksNavegacaoEmpresa = [
    ['Dashboard', '/sage/empresa'],
    ['Estagiários', '#estagiarios'],
  ];

  return (
    <div className="gestao-candidatos-wrapper">
      <Header
        paginaAtiva="Dashboard"
        customLinks={linksNavegacaoEmpresa}
        usuario={{
          nome: dadosEmpresa.empresa?.nome || 'Shelby LTDA',
          tipo: 'empresa',
        }}
        mostrarBotaoSair={false}
      />

      <main className="flex-grow-1">
        <div className="gestao-candidatos-container">
          <div className="gestao-candidatos-header">
            <h1 className="gestao-candidatos-title">
              Candidatos - {vagaAtual.titulo}
            </h1>
            <p className="gestao-candidatos-subtitle">
              Visualize e gerencie os candidatos inscritos nesta vaga
            </p>
          </div>

          <Row className="g-4 mb-4">
            <Col xs={12} sm={6} lg={3}>
              <CardMetricaEmpresa
                titulo="Total de Candidatos"
                valor={metricas.total}
                icone={Users}
                corIcone="#0284c7"
                corFundoIcone="#e0f2fe"
              />
            </Col>
            <Col xs={12} sm={6} lg={3}>
              <CardMetricaEmpresa
                titulo="Em Análise"
                valor={metricas.emAnalise}
                icone={FileText}
                corIcone="#d97706"
                corFundoIcone="#fef3c7"
              />
            </Col>
            <Col xs={12} sm={6} lg={3}>
              <CardMetricaEmpresa
                titulo="Aprovados"
                valor={metricas.aprovados}
                icone={Handshake}
                corIcone="#16a34a"
                corFundoIcone="#e8f7ee"
              />
            </Col>
            <Col xs={12} sm={6} lg={3}>
              <CardMetricaEmpresa
                titulo="Reprovados"
                valor={metricas.reprovados}
                icone={CircleX}
                corIcone="#dc2626"
                corFundoIcone="#fee2e2"
              />
            </Col>
          </Row>

          <div className="card-tabela-candidatos">
            <div className="filtro-candidatos-container">
              <div className="campo-busca-candidato">
                <Search size={18} className="icone-busca-candidato" />
                <input
                  type="text"
                  placeholder="Buscar por nome do candidato..."
                  value={busca}
                  onChange={(e) => {
                    setBusca(e.target.value);
                    setPaginaAtual(1);
                  }}
                  id="input-busca-candidato"
                />
              </div>

              <div className="select-status-wrapper">
                <select
                  value={filtroStatus}
                  onChange={(e) => {
                    setFiltroStatus(e.target.value);
                    setPaginaAtual(1);
                  }}
                  className="select-status-candidato"
                  id="select-filtro-status"
                >
                  <option value="Todos">Status: Todos</option>
                  <option value="Em Análise">Status: Em Análise</option>
                  <option value="Aprovado">Status: Aprovado</option>
                  <option value="Reprovado">Status: Reprovado</option>
                </select>
                <ChevronDown size={16} className="icone-select-chevron" />
              </div>
            </div>

            <div className="table-responsive">
              <table
                className="table align-middle"
                style={{ borderCollapse: 'separate', borderSpacing: '0 4px', width: '100%' }}
              >
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
                      Nome
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
                      Curso
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
                      Email
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
                      Data de Inscrição
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
                        textAlign: 'right',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {candidatosPaginados.length > 0 ? (
                    candidatosPaginados.map((candidato) => (
                      <tr
                        key={candidato.id}
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
                          {candidato.nome}
                        </td>
                        <td
                          style={{
                            padding: '14px 16px',
                            fontSize: '0.875rem',
                            color: '#64748b',
                            border: 'none',
                          }}
                        >
                          {candidato.curso}
                        </td>
                        <td
                          style={{
                            padding: '14px 16px',
                            fontSize: '0.875rem',
                            color: '#64748b',
                            border: 'none',
                          }}
                        >
                          {candidato.email}
                        </td>
                        <td
                          style={{
                            padding: '14px 16px',
                            fontSize: '0.875rem',
                            color: '#64748b',
                            border: 'none',
                          }}
                        >
                          {candidato.dataInscricao}
                        </td>
                        <td style={{ padding: '14px 16px', border: 'none' }}>
                          {renderBadgeStatus(candidato.status)}
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
                              className="btn-ver-perfil"
                              onClick={() => {
                                setCandidatoModal(candidato);
                                setModalAberto(true);
                              }}
                            >
                              Ver Perfil
                            </button>

                            <div className="dropdown-acoes-candidato">
                              <button
                                type="button"
                                className={`btn-menu-tres-pontos ${
                                  menuAbertoId === candidato.id ? 'ativo' : ''
                                }`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setMenuAbertoId(
                                    menuAbertoId === candidato.id ? null : candidato.id
                                  );
                                }}
                                title="Mais opções"
                              >
                                <MoreVertical size={16} />
                              </button>

                              {menuAbertoId === candidato.id && (
                                <div className="menu-dropdown-acoes">
                                  <button
                                    type="button"
                                    className="item-dropdown-acao item-aprovar"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      lidarComAprovar(candidato.id, candidato.nome);
                                      setMenuAbertoId(null);
                                    }}
                                  >
                                    <Check size={16} strokeWidth={2.5} color="#16a34a" />
                                    Aprovar
                                  </button>
                                  <button
                                    type="button"
                                    className="item-dropdown-acao item-reprovar"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      lidarComReprovar(candidato.id, candidato.nome);
                                      setMenuAbertoId(null);
                                    }}
                                  >
                                    <X size={16} strokeWidth={2.5} color="#dc2626" />
                                    Reprovar
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={6}
                        className="text-center py-5 text-secondary"
                        style={{ border: 'none' }}
                      >
                        Nenhum candidato encontrado com os filtros selecionados.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <Paginacao
              paginaAtual={paginaAtual}
              totalPaginas={totalPaginas}
              aoMudarPagina={setPaginaAtual}
              textoResumo={`Mostrando ${candidatosPaginados.length} de ${candidatosFiltrados.length} candidatos inscritos`}
            />
          </div>
        </div>
      </main>

      {mensagemFeedback && (
        <div
          className="toast-feedback-candidato"
          style={{ backgroundColor: mensagemFeedback.cor }}
        >
          <CheckCircle2 size={18} />
          {mensagemFeedback.texto}
        </div>
      )}

      <ModalDetalhesCandidato
        aberto={modalAberto}
        candidato={candidatoModal}
        vagaTitulo={vagaAtual.titulo}
        aoFechar={() => setModalAberto(false)}
        aoAprovar={lidarComAprovar}
        aoReprovar={lidarComReprovar}
      />

      <Footer />
    </div>
  );
}

export default GestaoCandidatos;
