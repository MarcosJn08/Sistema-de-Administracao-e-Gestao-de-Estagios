import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { carregarCandidatura } from '../../utils/candidaturaAluno.js';
import {
  X,
  MapPin,
  Briefcase,
  Clock,
  Banknote,
  FileText,
  Building2,
  Calendar,
  Users,
  Bus,
  ShieldCheck,
  Award,
  Share2,
} from 'lucide-react';
import LogoEmpresa from '../LogoEmpresa.jsx';
import BotaoSalvarVaga from './BotaoSalvarVaga.jsx';
import './ModalDetalhesVaga.css';

function ModalDetalhesVaga({ aberto, vaga, aoFechar }) {
  const navigate = useNavigate();
  const [candidatura] = useState(() => vaga ? carregarCandidatura(vaga.id) : null);
  const [copiado, setCopiado] = useState(false);
  const [erroCompartilhar, setErroCompartilhar] = useState('');

  if (!aberto || !vaga) return null;

  const localizacao = vaga.localizacao || vaga.cidade || 'Almenara - MG';
  const modalidade = vaga.modalidade || 'Presencial';
  const cargaHoraria = vaga.carga_horaria || '30h semanais';
  const bolsaAuxilio =
    vaga.bolsa_auxilio ||
    (typeof vaga.valor_bolsa === 'number'
      ? `R$ ${vaga.valor_bolsa.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
      : 'R$ 1.200,00');
  const tipoContrato = vaga.tipo || 'Estágio não obrigatório';
  const area = vaga.area || vaga.curso || 'Análise e Desenvolvimento de Sistemas';
  const periodo = vaga.periodo || '01/03/2026 a 01/09/2026';
  const vagasDisponiveis = vaga.vagas_disponiveis || 3;
  const status = vaga.status || (vaga.inscricoes_abertas ? 'Ativa' : 'Encerrada');
  const encerrada = vaga.inscricoes_abertas === false || status === 'Encerrada';

  const descricao =
    vaga.descricao ||
    'O estagiário atuará diretamente na manutenção e evolução de nossas APIs e sistemas internos. Fará parte de um time ágil, participando de dailies e processos de code review, auxiliando na arquitetura de banco de dados e escrita de código otimizado em Python.';

  const competencias =
    vaga.competencias && Array.isArray(vaga.competencias) && vaga.competencias.length > 0
      ? vaga.competencias
      : ['Python', 'Django', 'Git', 'SQL', 'Trabalho em equipe', 'Comunicação'];

  const beneficios =
    vaga.beneficios && Array.isArray(vaga.beneficios) && vaga.beneficios.length > 0
      ? vaga.beneficios
      : ['Vale-transporte', 'Seguro de vida', 'Certificado de conclusão de estágio'];

  const lidarComCompartilhar = async () => {
    try {
      await navigator.clipboard.writeText(new URL(`/sage/vagas/${encodeURIComponent(vaga.id)}`, window.location.origin).href);
      setErroCompartilhar('');
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      setCopiado(false);
      setErroCompartilhar('Não foi possível copiar o link. Tente novamente ou permita o acesso à área de transferência.');
    }
  };

  const lidarComCandidatar = () => {
    navigate(`/sage/vagas/${vaga.id}/candidatura`);
  };

  const obterIconeBeneficio = (beneficio) => {
    const b = beneficio.toLowerCase();
    if (b.includes('transporte') || b.includes('vale')) {
      return <Bus size={15} />;
    }
    if (b.includes('vida') || b.includes('seguro') || b.includes('saúde') || b.includes('médica')) {
      return <ShieldCheck size={15} />;
    }
    return <Award size={15} />;
  };

  return (
    <div className="modal-detalhes-overlay" onClick={aoFechar} role="dialog" aria-modal="true">
      <div className="modal-detalhes-container" onClick={(e) => e.stopPropagation()}>
        <div className="modal-detalhes-header">
          <div className="modal-detalhes-identidade">
            <div className="modal-detalhes-logo">
              <LogoEmpresa empresa={vaga.empresa} logoEmpresa={vaga.logoEmpresa} tamanho={52} />
            </div>
            <div>
              <div className="modal-detalhes-title-row">
                <h2 className="modal-detalhes-title">{vaga.titulo}</h2>
                <span className="badge-ativa-detalhes">{status}</span>
              </div>
              <p className="modal-detalhes-empresa">{vaga.empresa}</p>
            </div>
          </div>
          <button
            type="button"
            className="modal-detalhes-close"
            onClick={aoFechar}
            aria-label="Fechar diálogo"
          >
            <X size={18} />
          </button>
        </div>

        <div className="modal-detalhes-body">
          {erroCompartilhar && <div className="alert alert-warning" role="alert">{erroCompartilhar}</div>}
          <div className="detalhes-grid-info">
            <div className="detalhes-info-item">
              <div className="detalhes-info-icone">
                <MapPin size={18} />
              </div>
              <div>
                <span className="detalhes-info-label">Localização:</span>
                <span className="detalhes-info-valor">{localizacao}</span>
              </div>
            </div>

            <div className="detalhes-info-item">
              <div className="detalhes-info-icone">
                <FileText size={18} />
              </div>
              <div>
                <span className="detalhes-info-label">Tipo:</span>
                <span className="detalhes-info-valor">{tipoContrato}</span>
              </div>
            </div>

            <div className="detalhes-info-item">
              <div className="detalhes-info-icone">
                <Briefcase size={18} />
              </div>
              <div>
                <span className="detalhes-info-label">Modalidade:</span>
                <span className="detalhes-info-valor">{modalidade}</span>
              </div>
            </div>

            <div className="detalhes-info-item">
              <div className="detalhes-info-icone">
                <Building2 size={18} />
              </div>
              <div>
                <span className="detalhes-info-label">Área:</span>
                <span className="detalhes-info-valor">{area}</span>
              </div>
            </div>

            <div className="detalhes-info-item">
              <div className="detalhes-info-icone">
                <Clock size={18} />
              </div>
              <div>
                <span className="detalhes-info-label">Carga Horária:</span>
                <span className="detalhes-info-valor">{cargaHoraria}</span>
              </div>
            </div>

            <div className="detalhes-info-item">
              <div className="detalhes-info-icone">
                <Calendar size={18} />
              </div>
              <div>
                <span className="detalhes-info-label">Período:</span>
                <span className="detalhes-info-valor">{periodo}</span>
              </div>
            </div>

            <div className="detalhes-info-item">
              <div className="detalhes-info-icone">
                <Banknote size={18} />
              </div>
              <div>
                <span className="detalhes-info-label">Bolsa-Auxílio:</span>
                <span className="detalhes-info-valor">{bolsaAuxilio}</span>
              </div>
            </div>

            <div className="detalhes-info-item">
              <div className="detalhes-info-icone">
                <Users size={18} />
              </div>
              <div>
                <span className="detalhes-info-label">Vagas disponíveis:</span>
                <span className="detalhes-info-valor">{vagasDisponiveis}</span>
              </div>
            </div>
          </div>

          <h3 className="secao-titulo-detalhes">Descrição das Atividades</h3>
          <p className="detalhes-descricao-texto">{descricao}</p>

          <h3 className="secao-titulo-detalhes">Requisitos & Competências</h3>
          <div className="chips-competencias-container">
            {competencias.map((comp, idx) => (
              <span key={idx} className="chip-competencia-item">
                {comp}
              </span>
            ))}
          </div>

          <h3 className="secao-titulo-detalhes">Benefícios</h3>
          <div className="beneficios-detalhes-container">
            {beneficios.map((ben, idx) => (
              <div key={idx} className="beneficio-badge-item">
                <div className="beneficio-icone-quadrado">{obterIconeBeneficio(ben)}</div>
                <span>{ben}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="modal-detalhes-footer">
          <button type="button" className="btn-compartilhar-vaga" onClick={lidarComCompartilhar}>
            <Share2 size={16} />
            {copiado ? 'Link Copiado!' : 'Compartilhar'}
          </button>

          <div className="modal-detalhes-acoes-direita">
            <BotaoSalvarVaga vaga={vaga} />
            <button
              type="button"
              className="btn-candidatar-vaga"
              disabled={encerrada && !candidatura}
              onClick={lidarComCandidatar}
            >
              {candidatura ? 'Ver candidatura' : encerrada ? 'Inscrições encerradas' : 'Candidatar-se'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ModalDetalhesVaga;
