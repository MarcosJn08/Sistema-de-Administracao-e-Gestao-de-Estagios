import React, { useState, useMemo } from 'react';
import { Row, Col } from 'react-bootstrap';
import {
  Users,
  FileText,
  AlertCircle,
  Briefcase,
  Search,
  ChevronDown,
  CheckCircle2,
} from 'lucide-react';
import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';
import CardMetricaEmpresa from '../components/empresa/CardMetricaEmpresa.jsx';
import ModalDetalhesEstagiario from '../components/empresa/ModalDetalhesEstagiario.jsx';
import Paginacao from '../components/Paginacao.jsx';
import dadosEmpresa, { estagiariosEmpresa } from '../dadosEmpresa.jsx';
import './MeusEstagiarios.css';

function MeusEstagiarios() {
  const [estagiarios, setEstagiarios] = useState(
    dadosEmpresa.empresa?.estagiarios || estagiariosEmpresa || []
  );
  const [busca, setBusca] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('Ativos');
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [estagiarioSelecionado, setEstagiarioSelecionado] = useState(null);
  const [modalDetalhesAberto, setModalDetalhesAberto] = useState(false);
  const [mensagemToast, setMensagemToast] = useState(null);
  const itensPorPagina = 10;

  const metricas = useMemo(() => {
    const ativos = estagiarios.filter((e) => e.status === 'Ativo').length;
    const emExperiencia = estagiarios.filter((e) => e.status === 'Em Experiência').length;
    const docsPendentes = estagiarios.reduce((acc, curr) => {
      const temPendente = curr.documentos?.some(
        (d) => d.status === 'Pendente' || d.status === 'Pendente de Envio'
      );
      return temPendente ? acc + 1 : acc;
    }, 0);
    const proximosVencer = 1;

    return {
      ativos: ativos || 5,
      emExperiencia: emExperiencia || 2,
      docsPendentes: docsPendentes || 3,
      proximosVencer,
    };
  }, [estagiarios]);

  const estagiariosFiltrados = useMemo(() => {
    return estagiarios.filter((item) => {
      const matchBusca =
        item.nome.toLowerCase().includes(busca.toLowerCase()) ||
        (item.nomeCompleto && item.nomeCompleto.toLowerCase().includes(busca.toLowerCase())) ||
        item.cargo.toLowerCase().includes(busca.toLowerCase()) ||
        item.curso.toLowerCase().includes(busca.toLowerCase());

      let matchStatus = true;
      if (filtroStatus === 'Ativos') {
        matchStatus = item.status === 'Ativo';
      } else if (filtroStatus === 'Em Experiência') {
        matchStatus = item.status === 'Em Experiência';
      } else if (filtroStatus === 'Encerrado') {
        matchStatus = item.status === 'Encerrado';
      } else if (filtroStatus === 'Todos') {
        matchStatus = true;
      }

      return matchBusca && matchStatus;
    });
  }, [estagiarios, busca, filtroStatus]);

  const totalPaginas = Math.max(1, Math.ceil(estagiariosFiltrados.length / itensPorPagina));
  const estagiariosPaginados = useMemo(() => {
    const inicio = (paginaAtual - 1) * itensPorPagina;
    return estagiariosFiltrados.slice(inicio, inicio + itensPorPagina);
  }, [estagiariosFiltrados, paginaAtual, itensPorPagina]);

  const exibirToast = (msg) => {
    setMensagemToast(msg);
    setTimeout(() => setMensagemToast(null), 3000);
  };

  const abrirDetalhes = (estagiario) => {
    setEstagiarioSelecionado(estagiario);
    setModalDetalhesAberto(true);
  };

  const lidarComSalvarAvaliacao = (estagiarioId, novaAvaliacao) => {
    setEstagiarios((prev) =>
      prev.map((item) => {
        if (item.id === estagiarioId) {
          const avaliacoesAtualizadas = [novaAvaliacao, ...(item.avaliacoes || [])];
          return { ...item, avaliacoes: avaliacoesAtualizadas };
        }
        return item;
      })
    );

    setEstagiarioSelecionado((prev) => {
      if (prev && prev.id === estagiarioId) {
        return {
          ...prev,
          avaliacoes: [novaAvaliacao, ...(prev.avaliacoes || [])],
        };
      }
      return prev;
    });

    exibirToast('Avaliação registrada com sucesso!');
  };

  const linksNavegacaoEmpresa = [
    ['Dashboard', '/sage/empresa'],
    ['Estagiários', '/sage/empresa/estagiarios'],
  ];

  const renderBadgeTabela = (status) => {
    switch (status) {
      case 'Ativo':
        return <span className="badge-tabela-ativo">Ativo</span>;
      case 'Em Experiência':
        return <span className="badge-tabela-experiencia">Em Experiência</span>;
      case 'Encerrado':
        return <span className="badge-tabela-encerrado">Encerrado</span>;
      default:
        return <span className="badge-tabela-ativo">{status}</span>;
    }
  };

  return (
    <div className="meus-estagiarios-wrapper">
      <Header
        paginaAtiva="Estagiários"
        customLinks={linksNavegacaoEmpresa}
        usuario={{
          nome: dadosEmpresa.empresa?.nome || 'Shelby LTDA',
          tipo: 'empresa',
        }}
        mostrarBotaoSair={false}
      />

      <main className="flex-grow-1">
        <div className="meus-estagiarios-container">
          {mensagemToast && (
            <div className="alerta-toast-sucesso">
              <CheckCircle2 size={18} />
              {mensagemToast}
            </div>
          )}

          <div className="meus-estagiarios-header">
            <h1 className="meus-estagiarios-title">Meus Estagiários</h1>
            <p className="meus-estagiarios-subtitle">
              Gerencie os estagiários ativos na sua empresa
            </p>
          </div>

          <Row className="g-4 mb-4">
            <Col xs={12} sm={6} lg={3}>
              <CardMetricaEmpresa
                titulo="Estagiários Ativos"
                valor={metricas.ativos}
                icone={CheckCircle2}
                corIcone="#16a34a"
                corFundoIcone="#e8f7ee"
              />
            </Col>
            <Col xs={12} sm={6} lg={3}>
              <CardMetricaEmpresa
                titulo="Em Experiência"
                valor={metricas.emExperiencia}
                icone={FileText}
                corIcone="#d97706"
                corFundoIcone="#fef3c7"
              />
            </Col>
            <Col xs={12} sm={6} lg={3}>
              <CardMetricaEmpresa
                titulo="Documentos Pendentes"
                valor={metricas.docsPendentes}
                icone={AlertCircle}
                corIcone="#ea580c"
                corFundoIcone="#fff7ed"
              />
            </Col>
            <Col xs={12} sm={6} lg={3}>
              <CardMetricaEmpresa
                titulo="Próximos a Vencer"
                valor={metricas.proximosVencer}
                icone={Briefcase}
                corIcone="#dc2626"
                corFundoIcone="#fee2e2"
              />
            </Col>
          </Row>

          <div className="card-tabela-estagiarios">
            <div className="filtro-estagiarios-container">
              <div className="campo-busca-estagiario">
                <Search size={18} className="icone-busca-estagiario" />
                <input
                  type="text"
                  placeholder="Buscar por nome do estagiário..."
                  value={busca}
                  onChange={(e) => {
                    setBusca(e.target.value);
                    setPaginaAtual(1);
                  }}
                  id="input-busca-estagiario"
                />
              </div>

              <div className="select-status-wrapper">
                <select
                  className="select-status-estagiario"
                  value={filtroStatus}
                  onChange={(e) => {
                    setFiltroStatus(e.target.value);
                    setPaginaAtual(1);
                  }}
                  id="select-status-filtro"
                >
                  <option value="Ativos">Status: Ativos</option>
                  <option value="Em Experiência">Status: Em Experiência</option>
                  <option value="Encerrado">Status: Encerrado</option>
                  <option value="Todos">Status: Todos</option>
                </select>
                <ChevronDown size={16} className="icone-select-estagiario" />
              </div>
            </div>

            <div className="tabela-estagiarios-responsiva">
              <table className="tabela-estagiarios">
                <thead>
                  <tr>
                    <th>Nome</th>
                    <th>Cargo/Vaga</th>
                    <th>Curso</th>
                    <th>Início</th>
                    <th>Término</th>
                    <th>Status</th>
                    <th className="text-center">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {estagiariosPaginados.length > 0 ? (
                    estagiariosPaginados.map((estagiario) => (
                      <tr key={estagiario.id}>
                        <td className="celula-nome-estagiario">{estagiario.nome}</td>
                        <td className="celula-cargo-estagiario">{estagiario.cargo}</td>
                        <td className="celula-curso-estagiario">{estagiario.curso}</td>
                        <td className="celula-data-estagiario">{estagiario.inicio}</td>
                        <td className="celula-data-estagiario">{estagiario.termino}</td>
                        <td>{renderBadgeTabela(estagiario.status)}</td>
                        <td>
                          <div className="d-flex align-items-center justify-content-center gap-2">
                            <button
                              type="button"
                              className="btn-acao-tabela-detalhes"
                              onClick={() => abrirDetalhes(estagiario)}
                            >
                              Detalhes
                            </button>
                            <button
                              type="button"
                              className="btn-acao-tabela-docs"
                              onClick={() => abrirDetalhes(estagiario)}
                            >
                              Docs
                            </button>
                            {estagiario.status !== 'Encerrado' && (
                              <button
                                type="button"
                                className="btn-acao-tabela-avaliar"
                                onClick={() => abrirDetalhes(estagiario)}
                              >
                                Avaliar
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="tabela-estagiarios-vazia">
                        Nenhum estagiário encontrado com os filtros aplicados.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="mt-4">
              <Paginacao
                paginaAtual={paginaAtual}
                totalPaginas={totalPaginas}
                aoMudarPagina={setPaginaAtual}
                textoResumo={`Mostrando ${estagiariosPaginados.length} de ${estagiariosFiltrados.length} estagiários cadastrados`}
              />
            </div>
          </div>
        </div>
      </main>

      <ModalDetalhesEstagiario
        aberto={modalDetalhesAberto}
        estagiario={estagiarioSelecionado}
        aoFechar={() => setModalDetalhesAberto(false)}
        aoSalvarAvaliacao={lidarComSalvarAvaliacao}
      />

      <Footer />
    </div>
  );
}

export default MeusEstagiarios;
