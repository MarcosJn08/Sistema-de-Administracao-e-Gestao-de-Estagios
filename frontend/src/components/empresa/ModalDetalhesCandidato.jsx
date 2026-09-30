import React, { useEffect } from 'react';
import { X, User, Check, XCircle } from 'lucide-react';
import './ModalDetalhesCandidato.css';

function ModalDetalhesCandidato({
  aberto,
  candidato,
  vagaTitulo = 'Desenvolvedor Backend',
  aoFechar,
  aoAprovar,
  aoReprovar,
}) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && aberto) {
        aoFechar();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [aberto, aoFechar]);

  if (!aberto || !candidato) return null;

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

  return (
    <div
      className="modal-candidato-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) aoFechar();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-candidato-titulo"
    >
      <div className="modal-candidato-container">
        {/* Cabeçalho do Modal */}
        <div className="modal-candidato-header">
          <div className="modal-candidato-title-group">
            <h2 id="modal-candidato-titulo" className="modal-candidato-title">
              Perfil do Candidato
            </h2>
            {renderBadgeStatus(candidato.status)}
          </div>

          <button
            type="button"
            className="btn-fechar-modal-candidato"
            onClick={aoFechar}
            aria-label="Fechar modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Corpo do Modal */}
        <div className="modal-candidato-body">
          <div className="modal-candidato-grid">
            {/* Coluna Esquerda: Dados do Aluno e Formação */}
            <div className="d-flex flex-column gap-3">
              {/* Card Identificação */}
              <div className="modal-candidato-card">
                <div className="modal-aluno-avatar-row">
                  <div className="modal-avatar-circulo">
                    {candidato.foto ? (
                      <img src={candidato.foto} alt={candidato.nome} />
                    ) : (
                      <div className="modal-avatar-fallback">
                        {candidato.nome ? candidato.nome.charAt(0) : <User size={28} />}
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="modal-aluno-nome">{candidato.nome}</h3>
                    <p className="modal-aluno-matricula">
                      Matrícula: {candidato.matricula}
                    </p>
                  </div>
                </div>

                <div className="modal-card-divisor" />

                <div className="modal-info-linha">
                  <span className="modal-info-rotulo">Curso:</span>
                  <span className="modal-info-valor">{candidato.curso}</span>
                </div>

                <div className="modal-info-linha">
                  <span className="modal-info-rotulo">Email:</span>
                  <span className="modal-info-valor">{candidato.email}</span>
                </div>

                <div className="modal-info-linha">
                  <span className="modal-info-rotulo">Telefone:</span>
                  <span className="modal-info-valor">{candidato.telefone}</span>
                </div>
              </div>

              {/* Card Formação e Habilidades */}
              <div className="modal-candidato-card">
                <h4 className="modal-card-titulo">Formação e Habilidades</h4>
                <div className="modal-card-divisor" />

                <div className="mb-2">
                  <span className="modal-info-rotulo d-block mb-1">Período Atual:</span>
                  <span className="modal-info-valor d-block" style={{ textAlign: 'left' }}>
                    {candidato.periodo}
                  </span>
                </div>

                <div className="mb-2">
                  <span className="modal-info-rotulo d-block mb-1">Habilidades:</span>
                  <div className="modal-tags-habilidades">
                    {candidato.habilidades && candidato.habilidades.length > 0 ? (
                      candidato.habilidades.map((hab, idx) => (
                        <span key={idx} className="modal-tag-hab">
                          {hab}
                        </span>
                      ))
                    ) : (
                      <span className="text-muted small">Nenhuma habilidade cadastrada</span>
                    )}
                  </div>
                </div>

                <div>
                  <span className="modal-info-rotulo d-block mb-1">Experiência Prévia:</span>
                  <p
                    className="modal-info-valor mb-0"
                    style={{
                      textAlign: 'left',
                      fontWeight: 500,
                      color: '#334155',
                      lineHeight: 1.45,
                      fontSize: '0.84rem',
                    }}
                  >
                    {candidato.experiencia}
                  </p>
                </div>
              </div>
            </div>

            {/* Coluna Direita: Informações da Candidatura */}
            <div className="d-flex flex-column gap-3">
              <div className="modal-candidato-card" style={{ height: '100%' }}>
                <h4 className="modal-card-titulo">Informações da Candidatura</h4>
                <div className="modal-card-divisor" />

                <div className="modal-candidatura-meta">
                  <div>
                    <div className="modal-meta-campo-rotulo">Vaga Solicitada</div>
                    <div className="modal-meta-vaga-destaque">
                      {candidato.vagaSolicitada || vagaTitulo}
                    </div>
                  </div>
                  <div>
                    <div className="modal-meta-campo-rotulo">Data de Inscrição</div>
                    <div className="modal-meta-data-destaque">
                      {candidato.dataInscricao}
                    </div>
                  </div>
                </div>

                <div>
                  <div className="modal-meta-campo-rotulo mb-2">Carta de Apresentação</div>
                  <p className="modal-carta-texto">
                    {candidato.cartaApresentacao}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Rodapé do Modal com Ações */}
        <div className="modal-candidato-footer">
          <button
            type="button"
            className="btn-fechar-secundario"
            onClick={aoFechar}
          >
            Fechar
          </button>

          <div className="modal-acoes-principais">
            <button
              type="button"
              className="btn-modal-reprovar"
              onClick={() => {
                aoReprovar(candidato.id, candidato.nome);
              }}
            >
              Reprovar Candidato
            </button>
            <button
              type="button"
              className="btn-modal-aprovar"
              onClick={() => {
                aoAprovar(candidato.id, candidato.nome);
              }}
            >
              Aprovar Candidato
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ModalDetalhesCandidato;
