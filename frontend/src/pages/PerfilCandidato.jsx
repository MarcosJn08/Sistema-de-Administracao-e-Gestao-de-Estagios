import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Row, Col } from 'react-bootstrap';
import { ArrowLeft, CheckCircle2, User } from 'lucide-react';
import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';
import dadosEmpresa, { candidatosDesenvolvedorBackend } from '../dadosEmpresa.jsx';
import './PerfilCandidato.css';

function PerfilCandidato() {
  const { vagaId, candidatoId } = useParams();
  const navigate = useNavigate();

  const idVagaNumerico = vagaId ? parseInt(vagaId, 10) : 1;
  const vagaAtual =
    dadosEmpresa.empresa?.vagas?.find((v) => v.id === idVagaNumerico) ||
    dadosEmpresa.empresa?.vagas?.[0] || {
      id: 1,
      titulo: 'Desenvolvedor Backend',
    };

  const idCandidato = candidatoId ? parseInt(candidatoId, 10) : 6;
  const candidatoInicial =
    candidatosDesenvolvedorBackend.find((c) => c.id === idCandidato) ||
    candidatosDesenvolvedorBackend.find((c) => c.nome.includes('Marcos')) ||
    candidatosDesenvolvedorBackend[0];

  const [candidato, setCandidato] = useState(candidatoInicial);
  const [mensagemFeedback, setMensagemFeedback] = useState(null);

  const exibirFeedback = (msg, cor = '#2e7d32') => {
    setMensagemFeedback({ texto: msg, cor });
    setTimeout(() => {
      setMensagemFeedback(null);
    }, 3000);
  };

  const lidarComAprovar = () => {
    setCandidato((prev) => ({ ...prev, status: 'Aprovado' }));
    exibirFeedback(`Candidato ${candidato.nome} foi aprovado com sucesso!`, '#2e7d32');
  };

  const lidarComReprovar = () => {
    setCandidato((prev) => ({ ...prev, status: 'Reprovado' }));
    exibirFeedback(`Candidato ${candidato.nome} foi reprovado.`, '#dc2626');
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
    <div className="perfil-candidato-wrapper">
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
        <div className="perfil-candidato-container">
          <nav className="perfil-candidato-breadcrumbs" aria-label="Navegação estrutural">
            <Link to="/sage/empresa" className="breadcrumb-link">
              Vagas
            </Link>
            <span className="breadcrumb-separator">&gt;</span>
            <Link
              to={`/sage/empresa/vagas/${vagaAtual.id}/candidatos`}
              className="breadcrumb-link"
            >
              {vagaAtual.titulo}
            </Link>
            <span className="breadcrumb-separator">&gt;</span>
            <span className="breadcrumb-active">Perfil do Candidato</span>
          </nav>

          <div className="perfil-candidato-header">
            <h1 className="perfil-candidato-title">Perfil do Candidato</h1>
            {renderBadgeStatus(candidato.status)}
          </div>

          <Row className="g-4 mb-4">
            <Col xs={12} lg={5}>
              <div className="d-flex flex-column gap-4">
                <div className="card-detalhe-candidato">
                  <div className="aluno-header-info">
                    <div className="aluno-avatar-circulo">
                      {candidato.foto ? (
                        <img src={candidato.foto} alt={candidato.nome} />
                      ) : (
                        <div className="aluno-avatar-fallback">
                          {candidato.nome ? candidato.nome.charAt(0) : <User size={32} />}
                        </div>
                      )}
                    </div>
                    <div>
                      <h2 className="aluno-nome-principal">{candidato.nome}</h2>
                      <p className="aluno-matricula-texto">
                        Matrícula: {candidato.matricula}
                      </p>
                    </div>
                  </div>

                  <div className="card-detalhe-divider" />

                  <div className="info-row-item">
                    <span className="info-label">Curso:</span>
                    <span className="info-value">{candidato.curso}</span>
                  </div>

                  <div className="info-row-item">
                    <span className="info-label">Email:</span>
                    <span className="info-value">{candidato.email}</span>
                  </div>

                  <div className="info-row-item">
                    <span className="info-label">Telefone:</span>
                    <span className="info-value">{candidato.telefone}</span>
                  </div>
                </div>

                <div className="card-detalhe-candidato">
                  <h3 className="card-detalhe-title">Formação e Habilidades</h3>

                  <div className="card-detalhe-divider" />

                  <div className="mb-3">
                    <span className="info-label d-block mb-1">Período Atual:</span>
                    <span className="info-value d-block" style={{ textAlign: 'left' }}>
                      {candidato.periodo}
                    </span>
                  </div>

                  <div className="mb-3">
                    <span className="info-label d-block mb-2">Habilidades:</span>
                    <div className="tags-habilidades-wrapper">
                      {candidato.habilidades && candidato.habilidades.length > 0 ? (
                        candidato.habilidades.map((hab, idx) => (
                          <span key={idx} className="tag-habilidade">
                            {hab}
                          </span>
                        ))
                      ) : (
                        <span className="text-muted">Nenhuma habilidade cadastrada</span>
                      )}
                    </div>
                  </div>

                  <div>
                    <span className="info-label d-block mb-1">Experiência Prévia:</span>
                    <p
                      className="info-value mb-0"
                      style={{
                        textAlign: 'left',
                        fontWeight: 500,
                        color: '#334155',
                        lineHeight: 1.5,
                      }}
                    >
                      {candidato.experiencia}
                    </p>
                  </div>
                </div>
              </div>
            </Col>

            <Col xs={12} lg={7}>
              <div className="d-flex flex-column gap-4">
                <div className="card-detalhe-candidato">
                  <h3 className="card-detalhe-title">Informações da Candidatura</h3>

                  <div className="card-detalhe-divider" />

                  <div className="candidatura-grid mb-4">
                    <div>
                      <div className="candidatura-campo-label">Vaga Solicitada</div>
                      <div className="candidatura-vaga-destaque">
                        {candidato.vagaSolicitada || vagaAtual.titulo}
                      </div>
                    </div>
                    <div>
                      <div className="candidatura-campo-label">Data de Inscrição</div>
                      <div className="candidatura-data-destaque">
                        {candidato.dataInscricao}
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="candidatura-campo-label mb-2">Carta de Apresentação</div>
                    <p className="carta-apresentacao-texto">
                      {candidato.cartaApresentacao}
                    </p>
                  </div>
                </div>

                <div className="barra-acoes-perfil">
                  <button
                    type="button"
                    className="btn-voltar-listagem"
                    onClick={() =>
                      navigate(`/sage/empresa/vagas/${vagaAtual.id}/candidatos`)
                    }
                  >
                    <ArrowLeft size={18} />
                    Voltar para listagem
                  </button>

                  <div className="botoes-decisao-wrapper">
                    <button
                      type="button"
                      className="btn-reprovar-perfil"
                      onClick={lidarComReprovar}
                    >
                      Reprovar Candidato
                    </button>
                    <button
                      type="button"
                      className="btn-aprovar-perfil"
                      onClick={lidarComAprovar}
                    >
                      Aprovar Candidato
                    </button>
                  </div>
                </div>
              </div>
            </Col>
          </Row>
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

      <Footer />
    </div>
  );
}

export default PerfilCandidato;
