import React, { useState, useEffect } from 'react';
import { X, FileText, ArrowLeft, Plus, Check } from 'lucide-react';
import './ModalDetalhesEstagiario.css';

function ModalDetalhesEstagiario({
  aberto,
  estagiario,
  aoFechar,
  aoSalvarAvaliacao,
}) {
  const [formAvaliacaoAberto, setFormAvaliacaoAberto] = useState(false);
  const [novaNota, setNovaNota] = useState('');
  const [novasObservacoes, setNovasObservacoes] = useState('');
  const [mensagemSucesso, setMensagemSucesso] = useState(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && aberto) {
        aoFechar();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [aberto, aoFechar]);

  if (!aberto || !estagiario) return null;

  const renderBadgeStatus = (status) => {
    switch (status) {
      case 'Ativo':
        return <span className="badge-estagiario-ativo">Ativo</span>;
      case 'Em Experiência':
        return <span className="badge-estagiario-experiencia">Em Experiência</span>;
      case 'Encerrado':
        return <span className="badge-estagiario-encerrado">Encerrado</span>;
      default:
        return <span className="badge-estagiario-ativo">{status}</span>;
    }
  };

  const renderDocBadge = (status) => {
    switch (status) {
      case 'Aprovado':
        return <span className="badge-doc-aprovado">Aprovado</span>;
      case 'Pendente de Envio':
        return <span className="badge-doc-pendente-envio">Pendente de Envio</span>;
      case 'Pendente':
        return <span className="badge-doc-pendente">Pendente</span>;
      default:
        return <span className="badge-doc-pendente">{status}</span>;
    }
  };

  const lidarComSalvarAvaliacao = (e) => {
    e.preventDefault();
    if (!novaNota) return;

    const dataAtual = new Date().toLocaleDateString('pt-BR');
    const novaAvaliacao = {
      id: Date.now(),
      data: dataAtual,
      nota: parseFloat(novaNota),
      notaMax: 10,
      observacoes: novasObservacoes || 'Desempenho avaliado pelo supervisor.',
    };

    if (aoSalvarAvaliacao) {
      aoSalvarAvaliacao(estagiario.id, novaAvaliacao);
    }

    setNovaNota('');
    setNovasObservacoes('');
    setFormAvaliacaoAberto(false);
    setMensagemSucesso('Avaliação registrada com sucesso!');
    setTimeout(() => setMensagemSucesso(null), 3000);
  };

  const avaliacaoRecente = estagiario.avaliacoes?.[0] || {
    data: '15/05/2026',
    nota: 8.5,
    notaMax: 10,
    observacoes:
      'Excelente desempenho nas atividades atribuídas. Demostra proatividade e boa comunicação com os membros do time.',
  };

  return (
    <div
      className="modal-estagiario-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) aoFechar();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-estagiario-titulo"
    >
      <div className="modal-estagiario-container">
        <div className="modal-estagiario-header">
          <div className="modal-estagiario-title-group">
            <span className="modal-estagiario-breadcrumb">
              Estagiários &gt; <span className="text-dark">Detalhes do Estagiário</span>
            </span>
            <div className="d-flex align-items-center gap-2 mt-1">
              <h2 id="modal-estagiario-titulo" className="modal-estagiario-title">
                Detalhes do Estagiário
              </h2>
              {renderBadgeStatus(estagiario.status)}
            </div>
          </div>

          <button
            type="button"
            className="btn-fechar-modal-estagiario"
            onClick={aoFechar}
            aria-label="Fechar modal"
          >
            <X size={20} />
          </button>
        </div>

        {mensagemSucesso && (
          <div className="modal-estagiario-alerta-sucesso">
            <Check size={18} />
            {mensagemSucesso}
          </div>
        )}

        <div className="modal-estagiario-body">
          <div className="modal-estagiario-grid">
            <div className="d-flex flex-column gap-3">
              <div className="modal-estagiario-card">
                <div className="modal-estagiario-avatar-row">
                  <div className="modal-estagiario-avatar-circulo">
                    {estagiario.foto ? (
                      <img src={estagiario.foto} alt={estagiario.nomeCompleto || estagiario.nome} />
                    ) : (
                      <div className="modal-estagiario-avatar-fallback">
                        {(estagiario.nomeCompleto || estagiario.nome).charAt(0)}
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="modal-estagiario-nome">
                      {estagiario.nomeCompleto || estagiario.nome}
                    </h3>
                    <p className="modal-estagiario-cargo">{estagiario.cargo}</p>
                  </div>
                </div>

                <div className="modal-card-divisor" />

                <div className="modal-info-linha">
                  <span className="modal-info-rotulo">Curso:</span>
                  <span className="modal-info-valor">
                    {estagiario.cursoCompleto || estagiario.curso}
                  </span>
                </div>

                <div className="modal-info-linha">
                  <span className="modal-info-rotulo">Email:</span>
                  <span className="modal-info-valor">{estagiario.email}</span>
                </div>

                <div className="modal-info-linha">
                  <span className="modal-info-rotulo">Telefone:</span>
                  <span className="modal-info-valor">{estagiario.telefone}</span>
                </div>
              </div>

              <div className="modal-estagiario-card">
                <h4 className="modal-card-titulo">Informações do Estágio</h4>

                <div className="modal-info-linha">
                  <span className="modal-info-rotulo">Empresa Concedente:</span>
                  <span className="modal-info-valor">{estagiario.empresaConcedente || 'Shelby LTDA'}</span>
                </div>

                <div className="modal-info-linha">
                  <span className="modal-info-rotulo">Supervisor:</span>
                  <span className="modal-info-valor">{estagiario.supervisor || 'Thomas Shelby'}</span>
                </div>

                <div className="modal-info-linha">
                  <span className="modal-info-rotulo">Orientador:</span>
                  <span className="modal-info-valor">
                    {estagiario.orientador || 'Marcos Vinicius Montanari'}
                  </span>
                </div>

                <div className="modal-info-linha">
                  <span className="modal-info-rotulo">Início:</span>
                  <span className="modal-info-valor">{estagiario.inicio}</span>
                </div>

                <div className="modal-info-linha">
                  <span className="modal-info-rotulo">Término:</span>
                  <span className="modal-info-valor">{estagiario.termino}</span>
                </div>

                <div className="modal-info-linha">
                  <span className="modal-info-rotulo">Carga Horária:</span>
                  <span className="modal-info-valor text-verde-destaque">
                    {estagiario.cargaHoraria || '20h/semana'}
                  </span>
                </div>
              </div>

              <div className="modal-estagiario-card">
                <h4 className="modal-card-titulo">Progresso de Horas</h4>

                <div className="barra-progresso-container">
                  <div
                    className="barra-progresso-preenchimento"
                    style={{ width: `${estagiario.percentualConcluido || 50}%` }}
                  />
                </div>

                <div className="d-flex justify-content-between align-items-center mb-3">
                  <span className="progresso-texto-rotulo">
                    {estagiario.horasConcluidas || 100}h de {estagiario.horasObrigatorias || 200}h obrigatórias
                  </span>
                  <span className="progresso-texto-percentual">
                    {estagiario.percentualConcluido || 50}% Concluído
                  </span>
                </div>

                <div className="modal-info-linha">
                  <span className="modal-info-rotulo">Aproveitamento de Projetos:</span>
                  <span className="modal-info-valor">
                    {estagiario.aproveitamentoProjetos || '0h'}
                  </span>
                </div>

                <div className="modal-info-linha">
                  <span className="modal-info-rotulo">Saldo Restante:</span>
                  <span className="modal-info-valor text-vermelho-destaque">
                    {estagiario.saldoRestante || '100h'}
                  </span>
                </div>
              </div>
            </div>

            <div className="d-flex flex-column gap-3">
              <div className="modal-estagiario-card">
                <h4 className="modal-card-titulo">Documentos</h4>

                <div className="d-flex flex-column gap-2">
                  {estagiario.documentos?.map((doc) => (
                    <div key={doc.id} className="item-documento-box">
                      <div className="item-documento-info">
                        <FileText size={18} className="icone-documento" />
                        <span className="nome-documento">{doc.nome}</span>
                      </div>

                      <div className="d-flex align-items-center gap-2">
                        {renderDocBadge(doc.status)}
                        {doc.status === 'Aprovado' && (
                          <button
                            type="button"
                            className="btn-visualizar-doc"
                            onClick={() => window.alert(`Visualizando documento: ${doc.nome}`)}
                          >
                            Visualizar
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="modal-estagiario-card">
                <div className="d-flex align-items-center justify-content-between mb-3">
                  <h4 className="modal-card-titulo mb-0">Avaliações</h4>
                  <button
                    type="button"
                    className="btn-nova-avaliacao"
                    onClick={() => setFormAvaliacaoAberto(!formAvaliacaoAberto)}
                  >
                    <Plus size={16} />
                    Nova Avaliação
                  </button>
                </div>

                {formAvaliacaoAberto && (
                  <form onSubmit={lidarComSalvarAvaliacao} className="form-nova-avaliacao mb-3">
                    <div className="mb-2">
                      <label htmlFor="nota-input" className="form-label-pequeno">
                        Nota (0 a 10)
                      </label>
                      <input
                        id="nota-input"
                        type="number"
                        step="0.1"
                        min="0"
                        max="10"
                        className="form-control-pequeno"
                        value={novaNota}
                        onChange={(e) => setNovaNota(e.target.value)}
                        placeholder="Ex: 9.0"
                        required
                      />
                    </div>
                    <div className="mb-2">
                      <label htmlFor="obs-input" className="form-label-pequeno">
                        Observações do Supervisor
                      </label>
                      <textarea
                        id="obs-input"
                        rows="3"
                        className="form-control-pequeno"
                        value={novasObservacoes}
                        onChange={(e) => setNovasObservacoes(e.target.value)}
                        placeholder="Descreva o desempenho do estagiário..."
                        required
                      />
                    </div>
                    <div className="d-flex justify-content-end gap-2">
                      <button
                        type="button"
                        className="btn-cancelar-avaliacao"
                        onClick={() => setFormAvaliacaoAberto(false)}
                      >
                        Cancelar
                      </button>
                      <button type="submit" className="btn-salvar-avaliacao">
                        Salvar Avaliação
                      </button>
                    </div>
                  </form>
                )}

                <div className="card-avaliacao-box">
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <div>
                      <span className="rotulo-avaliacao">Última Avaliação</span>
                      <p className="data-avaliacao">{avaliacaoRecente.data}</p>
                    </div>
                    <div className="text-end">
                      <span className="rotulo-avaliacao">Nota Atribuída</span>
                      <p className="nota-avaliacao">
                        {avaliacaoRecente.nota} <span className="nota-maxima">/ {avaliacaoRecente.notaMax}</span>
                      </p>
                    </div>
                  </div>

                  <div>
                    <span className="rotulo-avaliacao d-block mb-1">Observações do Supervisor:</span>
                    <p className="texto-observacoes">"{avaliacaoRecente.observacoes}"</p>
                  </div>
                </div>
              </div>

              <div className="modal-estagiario-voltar-card">
                <button
                  type="button"
                  className="btn-voltar-listagem"
                  onClick={aoFechar}
                >
                  <ArrowLeft size={16} />
                  Voltar para listagem
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ModalDetalhesEstagiario;
