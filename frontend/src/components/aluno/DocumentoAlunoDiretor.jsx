import { useState } from 'react';
import { CheckCircle2, Clock3 } from 'lucide-react';
import StatusBadge from '../StatusBadge.jsx';
import { assinaturaPartes, exigeHomologacaoFinal, pendenciasAssinaturas } from '../../utils/gestaoAluno.js';

export default function DocumentoAlunoDiretor({ documento, diretor, aoAtualizar }) {
  const [devolvendo, setDevolvendo] = useState(false);
  const [visualizando, setVisualizando] = useState(false);
  const [erro, setErro] = useState('');
  const homologacaoFinal = exigeHomologacaoFinal(documento);
  const pendencias = homologacaoFinal ? pendenciasAssinaturas(documento) : [];
  const aprovado = homologacaoFinal
    ? documento.aprovadoPelaDirecao || (['Aprovado', 'Deferido'].includes(documento.status) && documento.assinaturas?.direcao === 'assinado')
    : ['Aprovado', 'Deferido'].includes(documento.status);
  const partes = documento.tipo === 'tce' ? ['empresa', 'aluno', 'direcao']
    : documento.tipo === 'ficha-matricula' ? ['aluno', 'direcao'] : Object.keys(documento.assinaturas || {});

  const atualizar = (acao) => {
    try {
      aoAtualizar({ ...acao, documentoId: documento.id });
      setErro('');
      setDevolvendo(false);
    } catch (error) { setErro(error.message); }
  };

  return (
    <li className="perfil-aluno-documento">
      <div className="perfil-aluno-documento-cabecalho">
        <div>
          <h4>{documento.nome}</h4>
          <p className="perfil-aluno-documento-data">Envio: {documento.data || 'Não informado'}</p>
        </div>
        <StatusBadge status={documento.status} />
      </div>
      {homologacaoFinal && <p className="perfil-aluno-alcada">Homologação final da Direção</p>}
      {documento.descricao && <p className="perfil-aluno-documento-descricao">{documento.descricao}</p>}
      {partes.length > 0 && <div className="perfil-aluno-assinaturas" aria-label="Status das assinaturas digitais">
        <span>Assinaturas digitais</span>
        <ul>{partes.map((parte) => {
          const status = documento.assinaturas?.[parte];
          const assinada = status === 'assinado';
          const Icone = assinada ? CheckCircle2 : Clock3;
          return <li key={parte} className={assinada ? 'assinatura-concluida' : 'assinatura-pendente'}>
            <Icone size={13} aria-hidden="true" />{assinaturaPartes[parte] || parte}: {assinada ? 'Assinado' : status === 'pendente' ? 'Pendente' : 'Não informado'}
          </li>;
        })}</ul>
      </div>}
      {documento.justificativa && <p className="perfil-aluno-justificativa"><strong>Motivo da devolução:</strong> {documento.justificativa}</p>}
      {erro && <p className="perfil-aluno-erro" role="alert">{erro}</p>}
      <div className="perfil-aluno-acoes">
        {documento.url ? (
          <a className="perfil-aluno-botao perfil-aluno-botao-visualizar" href={documento.url} target="_blank" rel="noopener noreferrer"
            aria-label={`Visualizar ${documento.nome}`}>Visualizar</a>
        ) : (
          <button type="button" className="perfil-aluno-botao perfil-aluno-botao-visualizar" onClick={() => setVisualizando(!visualizando)}
            aria-expanded={visualizando} aria-controls={`documento-previa-${documento.id}`} aria-label={`Visualizar ${documento.nome}`}>Visualizar</button>
        )}
        {diretor && <>
          <button type="button" className="perfil-aluno-botao perfil-aluno-botao-primario" disabled={aprovado || pendencias.length > 0}
            onClick={() => atualizar({ tipo: 'aprovar' })} aria-label={`Aprovar ${documento.nome}`}>Aprovar</button>
          <button type="button" className="perfil-aluno-botao perfil-aluno-botao-perigo" onClick={() => setDevolvendo(!devolvendo)}
            aria-expanded={devolvendo} aria-controls={`documento-devolucao-${documento.id}`} aria-label={`Devolver ${documento.nome}`}>Devolver</button>
        </>}
      </div>
      {diretor && !aprovado && pendencias.length > 0 && <p className="perfil-aluno-ajuda">A aprovação aguarda assinatura: {pendencias.map((parte) => assinaturaPartes[parte]).join(', ')}.</p>}
      {visualizando && !documento.url && <div id={`documento-previa-${documento.id}`} className="perfil-aluno-previa">
        <strong>{documento.nome}</strong>
        <p>{documento.descricao || 'Sem descrição cadastrada.'}</p>
        <p>O arquivo deste documento ainda não está disponível para visualização.</p>
      </div>}
      {devolvendo && <form id={`documento-devolucao-${documento.id}`} className="perfil-aluno-devolucao" onSubmit={(evento) => {
        evento.preventDefault();
        atualizar({ tipo: 'devolver', motivo: new FormData(evento.currentTarget).get('motivo') });
      }}>
        <label>Justificativa obrigatória<textarea name="motivo" rows={3} required maxLength={1000} placeholder="Descreva os ajustes necessários neste documento." /></label>
        <div className="perfil-aluno-acoes">
          <button type="submit" className="perfil-aluno-botao perfil-aluno-botao-perigo">Confirmar devolução</button>
          <button type="button" className="perfil-aluno-botao" onClick={() => setDevolvendo(false)}>Cancelar</button>
        </div>
      </form>}
    </li>
  );
}
