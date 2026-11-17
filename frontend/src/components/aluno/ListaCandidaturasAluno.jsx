import { CalendarDays, Eye, Send } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Botao from '../Button.jsx';
import LogoEmpresa from '../LogoEmpresa.jsx';
import StatusBadge from '../StatusBadge.jsx';
import { apresentarStatusCandidatura } from '../../utils/candidaturaAluno.js';
import './ListaCandidaturasAluno.css';

export default function ListaCandidaturasAluno({ candidaturas }) {
  const navigate = useNavigate();
  if (!candidaturas.length) return (
    <div className="candidaturas-aluno-vazio">
      <Send size={30} aria-hidden="true" />
      <h3>Você ainda não enviou candidaturas</h3>
      <p>Explore as vagas e envie sua carta de apresentação. Suas inscrições aparecerão aqui.</p>
      <Botao tipo="botao-sage-verde" onClick={() => navigate('/sage/vagas')}>Explorar vagas</Botao>
    </div>
  );

  return (
    <ul className="candidaturas-aluno-lista">
      {candidaturas.map((candidatura) => {
        const status = apresentarStatusCandidatura(candidatura.status);
        return (
          <li key={candidatura.vagaId} className="candidaturas-aluno-item">
            <div className="candidaturas-aluno-identidade">
              <div className="candidaturas-aluno-logo"><LogoEmpresa empresa={candidatura.empresa} tamanho={40} /></div>
              <div>
                <h3>{candidatura.vaga}</h3>
                <p>{candidatura.empresa}</p>
                <span className="candidaturas-aluno-data"><CalendarDays size={14} aria-hidden="true" /> Inscrição em <time dateTime={candidatura.dataInscricao}>{new Date(candidatura.dataInscricao).toLocaleDateString('pt-BR')}</time></span>
              </div>
            </div>
            <div className="candidaturas-aluno-item-acoes">
              <StatusBadge status={status.texto} variante={status.variante} />
              <Botao tipo="botao-sage-verde" className="gap-2 text-nowrap"
                aria-label={`Ver detalhes da candidatura para ${candidatura.vaga} na ${candidatura.empresa}`}
                onClick={() => navigate(`/sage/aluno/candidaturas/${encodeURIComponent(candidatura.vagaId)}`)}>
                <Eye size={16} aria-hidden="true" /> Ver Detalhes
              </Botao>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
