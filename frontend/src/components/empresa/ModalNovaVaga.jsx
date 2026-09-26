import React, { useState } from 'react';
import { X, Calendar, Check } from 'lucide-react';
import { Row, Col } from 'react-bootstrap';
import './ModalNovaVaga.css';

function ModalNovaVaga({ aberto, aoFechar, aoPublicar }) {
  const [titulo, setTitulo] = useState('');
  const [localizacao, setLocalizacao] = useState('');
  const [tipoContrato, setTipoContrato] = useState('Estágio não obrigatório');
  const [modalidade, setModalidade] = useState('Presencial');
  const [area, setArea] = useState('');
  const [cargaHoraria, setCargaHoraria] = useState('');
  const [bolsaAuxilio, setBolsaAuxilio] = useState('');
  const [periodoInicio, setPeriodoInicio] = useState('');
  const [periodoFim, setPeriodoFim] = useState('');
  const [vagasDisponiveis, setVagasDisponiveis] = useState('');
  const [descricao, setDescricao] = useState('');

  const [competencias, setCompetencias] = useState(['Python', 'Django', 'Git', 'SQL']);
  const [novaCompetencia, setNovaCompetencia] = useState('');

  const [beneficios, setBeneficios] = useState({
    valeTransporte: true,
    seguroVida: true,
    certificadoConclusao: true,
    recessoRemunerado: false,
    assistenciaMedica: false,
  });

  if (!aberto) return null;

  const alternarBeneficio = (chave) => {
    setBeneficios((prev) => ({ ...prev, [chave]: !prev[chave] }));
  };

  const adicionarCompetencia = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const tagLimpa = novaCompetencia.trim().replace(',', '');
      if (tagLimpa && !competencias.includes(tagLimpa)) {
        setCompetencias([...competencias, tagLimpa]);
        setNovaCompetencia('');
      }
    }
  };

  const removerCompetencia = (tag) => {
    setCompetencias(competencias.filter((c) => c !== tag));
  };

  const lidarComPublicar = (e) => {
    e.preventDefault();
    if (!titulo.trim()) {
      alert('Por favor, informe o título da vaga.');
      return;
    }

    const novaVaga = {
      id: Date.now(),
      titulo: titulo.trim(),
      area: area.trim() || 'Tecnologia',
      localizacao: localizacao.trim() || 'Almenara - MG',
      tipoContrato,
      modalidade,
      cargaHoraria: cargaHoraria.trim() || '30h semanais',
      bolsaAuxilio: bolsaAuxilio.trim() || '1.200,00',
      periodoInicio,
      periodoFim,
      vagasDisponiveis: vagasDisponiveis.trim() || '1',
      descricao,
      competencias,
      beneficios,
      inscritos: 0,
      status: 'Ativa',
      dataPublicacao: new Date().toLocaleDateString('pt-BR'),
      ativa: true,
    };

    aoPublicar(novaVaga);
    aoFechar();
  };

  return (
    <div className="modal-vaga-overlay" onClick={aoFechar} role="dialog" aria-modal="true">
      <div className="modal-vaga-container" onClick={(e) => e.stopPropagation()}>
        <div className="modal-vaga-header">
          <div>
            <h2 className="modal-vaga-title">Criar Nova Vaga</h2>
            <p className="modal-vaga-subtitle">Preencha os dados da vaga de estágio</p>
          </div>
          <button
            type="button"
            className="modal-vaga-close"
            onClick={aoFechar}
            aria-label="Fechar diálogo"
          >
            <X size={18} />
          </button>
        </div>

        <div className="modal-vaga-body">
          <form onSubmit={lidarComPublicar}>
            <h3 className="secao-titulo">Informações Básicas</h3>

            <div className="mb-3">
              <label className="form-label-custom">Título da Vaga</label>
              <input
                type="text"
                className="form-input-custom"
                placeholder="ex: Desenvolvedor Backend"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                autoFocus
              />
            </div>

            <Row className="g-3 mb-3">
              <Col xs={12} md={6}>
                <label className="form-label-custom">Localização</label>
                <input
                  type="text"
                  className="form-input-custom"
                  placeholder="ex: Almenara - MG"
                  value={localizacao}
                  onChange={(e) => setLocalizacao(e.target.value)}
                />
              </Col>
              <Col xs={12} md={6}>
                <label className="form-label-custom">Tipo de Contrato</label>
                <select
                  className="form-input-custom"
                  value={tipoContrato}
                  onChange={(e) => setTipoContrato(e.target.value)}
                >
                  <option value="Estágio não obrigatório">Estágio não obrigatório</option>
                  <option value="Estágio obrigatório">Estágio obrigatório</option>
                </select>
              </Col>
            </Row>

            <Row className="g-3 mb-3">
              <Col xs={12} md={6}>
                <label className="form-label-custom">Modalidade</label>
                <select
                  className="form-input-custom"
                  value={modalidade}
                  onChange={(e) => setModalidade(e.target.value)}
                >
                  <option value="Presencial">Presencial</option>
                  <option value="Remoto">Remoto</option>
                  <option value="Híbrido">Híbrido</option>
                </select>
              </Col>
              <Col xs={12} md={6}>
                <label className="form-label-custom">Área</label>
                <input
                  type="text"
                  className="form-input-custom"
                  placeholder="ex: Análise e Desenvolvimento de Sistemas"
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                />
              </Col>
            </Row>

            <Row className="g-3 mb-3">
              <Col xs={12} md={6}>
                <label className="form-label-custom">Carga Horária</label>
                <input
                  type="text"
                  className="form-input-custom"
                  placeholder="ex: 30h semanais"
                  value={cargaHoraria}
                  onChange={(e) => setCargaHoraria(e.target.value)}
                />
              </Col>
              <Col xs={12} md={6}>
                <label className="form-label-custom">Bolsa-Auxílio</label>
                <div className="input-com-prefixo">
                  <span className="prefixo-moeda">R$</span>
                  <input
                    type="text"
                    className="form-input-custom input-sem-borda"
                    placeholder="1.200,00"
                    value={bolsaAuxilio}
                    onChange={(e) => setBolsaAuxilio(e.target.value)}
                  />
                </div>
              </Col>
            </Row>

            <Row className="g-3 mb-3">
              <Col xs={12} md={6}>
                <label className="form-label-custom">Período Início</label>
                <div className="input-com-icone">
                  <input
                    type="text"
                    className="form-input-custom"
                    placeholder="dd/mm/aaaa"
                    value={periodoInicio}
                    onChange={(e) => setPeriodoInicio(e.target.value)}
                  />
                  <Calendar size={18} className="input-icone-direita" />
                </div>
              </Col>
              <Col xs={12} md={6}>
                <label className="form-label-custom">Período Fim</label>
                <div className="input-com-icone">
                  <input
                    type="text"
                    className="form-input-custom"
                    placeholder="dd/mm/aaaa"
                    value={periodoFim}
                    onChange={(e) => setPeriodoFim(e.target.value)}
                  />
                  <Calendar size={18} className="input-icone-direita" />
                </div>
              </Col>
            </Row>

            <div className="mb-4">
              <label className="form-label-custom">Vagas Disponíveis</label>
              <input
                type="text"
                className="form-input-custom"
                placeholder="ex: 3"
                value={vagasDisponiveis}
                onChange={(e) => setVagasDisponiveis(e.target.value)}
              />
            </div>

            <h3 className="secao-titulo">Descrição das Atividades</h3>
            <div className="mb-4">
              <textarea
                className="form-input-custom"
                rows={3}
                placeholder="Descreva as atividades que o estagiário irá realizar..."
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
              />
            </div>

            <h3 className="secao-titulo">Requisitos & Competências</h3>
            <div className="mb-4">
              <div className="tags-input-container">
                {competencias.map((tag) => (
                  <span key={tag} className="tag-badge">
                    {tag}
                    <button
                      type="button"
                      className="tag-badge-remover"
                      onClick={() => removerCompetencia(tag)}
                      aria-label={`Remover ${tag}`}
                    >
                      ×
                    </button>
                  </span>
                ))}
                <input
                  type="text"
                  className="tag-input-inline"
                  placeholder="Adicionar competência..."
                  value={novaCompetencia}
                  onChange={(e) => setNovaCompetencia(e.target.value)}
                  onKeyDown={adicionarCompetencia}
                />
              </div>
            </div>

            <h3 className="secao-titulo">Benefícios</h3>
            <div className="beneficios-grid mb-2">
              <div
                className={`checkbox-custom-item ${beneficios.valeTransporte ? 'checked' : ''}`}
                onClick={() => alternarBeneficio('valeTransporte')}
              >
                <div className="checkbox-custom-box">
                  {beneficios.valeTransporte && <Check size={13} strokeWidth={3} />}
                </div>
                <span>Vale-transporte</span>
              </div>

              <div
                className={`checkbox-custom-item ${beneficios.seguroVida ? 'checked' : ''}`}
                onClick={() => alternarBeneficio('seguroVida')}
              >
                <div className="checkbox-custom-box">
                  {beneficios.seguroVida && <Check size={13} strokeWidth={3} />}
                </div>
                <span>Seguro de vida</span>
              </div>

              <div
                className={`checkbox-custom-item ${beneficios.certificadoConclusao ? 'checked' : ''}`}
                onClick={() => alternarBeneficio('certificadoConclusao')}
              >
                <div className="checkbox-custom-box">
                  {beneficios.certificadoConclusao && <Check size={13} strokeWidth={3} />}
                </div>
                <span>Certificado de conclusão</span>
              </div>

              <div
                className={`checkbox-custom-item ${beneficios.recessoRemunerado ? 'checked' : ''}`}
                onClick={() => alternarBeneficio('recessoRemunerado')}
              >
                <div className="checkbox-custom-box">
                  {beneficios.recessoRemunerado && <Check size={13} strokeWidth={3} />}
                </div>
                <span>Recesso remunerado</span>
              </div>

              <div
                className={`checkbox-custom-item ${beneficios.assistenciaMedica ? 'checked' : ''}`}
                onClick={() => alternarBeneficio('assistenciaMedica')}
              >
                <div className="checkbox-custom-box">
                  {beneficios.assistenciaMedica && <Check size={13} strokeWidth={3} />}
                </div>
                <span>Assistência médica</span>
              </div>
            </div>
          </form>
        </div>

        <div className="modal-vaga-footer">
          <button type="button" className="btn-modal-cancelar" onClick={aoFechar}>
            Cancelar
          </button>
          <button type="button" className="btn-modal-publicar" onClick={lidarComPublicar}>
            Publicar Vaga
          </button>
        </div>
      </div>
    </div>
  );
}

export default ModalNovaVaga;
