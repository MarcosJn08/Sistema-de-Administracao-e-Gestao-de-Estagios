import { useEffect, useState } from 'react';
import { CheckCircle2, Clock3 } from 'lucide-react';
import StatusBadge from '../StatusBadge.jsx';
import api from '../../services/api.js';
import { assinaturaPartes, exigeHomologacaoFinal, pendenciasAssinaturas, podeAvaliarDocumentoAluno } from '../../utils/gestaoAluno.js';

export default function DocumentoAluno({ documento, perfil = 'professor', aoAtualizar, abrirPrevia = false }) {
  const [devolvendo, setDevolvendo] = useState(false);
  const [visualizando, setVisualizando] = useState(false);
  const [erro, setErro] = useState('');
  const [salvando, setSalvando] = useState(false);
  const [baixando, setBaixando] = useState(false);
  const [previaAberta, setPreviaAberta] = useState(abrirPrevia);
  const [previa, setPrevia] = useState(null);
  const urlArquivo = documento.download || `/estagios/${documento.estagioId}/documentos/${documento.id}/download`;

  useEffect(() => {
    if (!previaAberta || !documento.temArquivo) return;
    const controller = new AbortController();
    let url;
    api.get(urlArquivo, { responseType: 'blob', signal: controller.signal })
      .then(({ data }) => {
        if (controller.signal.aborted) return;
        url = URL.createObjectURL(data);
        setPrevia({ url });
      })
      .catch((error) => {
        if (!controller.signal.aborted) setPrevia({ erro: error.message });
      });
    return () => {
      controller.abort();
      if (url) URL.revokeObjectURL(url);
    };
  }, [previaAberta, documento.temArquivo, urlArquivo]);

  function alternarPrevia() {
    setPrevia(null);
    setPreviaAberta((aberta) => !aberta);
  }

  const integrado = documento.integrado || documento.estagioId != null;
  const homologacaoFinal = !integrado && exigeHomologacaoFinal(documento);
  const diretor = perfil === 'diretor';
  const podeAvaliar = typeof aoAtualizar === 'function'
    && (integrado ? documento.podeAvaliar : podeAvaliarDocumentoAluno(documento, perfil));
  const pendencias = diretor && homologacaoFinal ? pendenciasAssinaturas(documento) : [];
  const aprovado = homologacaoFinal
    ? documento.aprovadoPelaDirecao || (['Aprovado', 'Deferido'].includes(documento.status) && documento.assinaturas?.direcao === 'assinado')
    : ['Aprovado', 'Deferido'].includes(documento.status);
  const parecerAprovado = documento.parecerProfessor === 'Aprovado' && documento.status === 'Em análise';
  const partes = documento.tipo === 'tce' ? ['empresa', 'aluno', 'direcao']
    : documento.tipo === 'ficha-matricula' ? ['aluno', 'direcao'] : Object.keys(documento.assinaturas || {});

  const atualizar = async (acao) => {
    if (salvando) return;
    setSalvando(true);
    try {
      await aoAtualizar({ ...acao, documentoId: documento.id });
      setErro('');
      setDevolvendo(false);
    } catch (error) {
      setErro(error.message);
    } finally {
      setSalvando(false);
    }
  };

  const baixar = async () => {
    setBaixando(true);
    setErro('');
    try {
      const { data } = await api.get(documento.download || '/estagios/' + documento.estagioId + '/documentos/' + documento.id + '/download', { responseType: 'blob' });
      const url = URL.createObjectURL(data);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'documento-' + documento.id + '.pdf';
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (error) {
      setErro(error.message);
    } finally {
      setBaixando(false);
    }
  };

  return (
    <li className="perfil-aluno-documento">
      <div className="perfil-aluno-documento-cabecalho">
        <div>
          <h4>{integrado && documento.temArquivo
            ? <button type="button" className="btn btn-link text-start p-0 fw-bold" onClick={alternarPrevia}
                aria-expanded={previaAberta}>{documento.nome}</button>
            : documento.nome}</h4>
          {documento.empresa && <p className="perfil-aluno-documento-data">{documento.empresa} · Estágio #{documento.estagioId}</p>}
          <p className="perfil-aluno-documento-data">Registro: {documento.data || 'Não informado'}</p>
        </div>
        <StatusBadge status={documento.status} />
      </div>
      {homologacaoFinal && <p className="perfil-aluno-alcada">Homologação final da Direção</p>}
      {homologacaoFinal && parecerAprovado && !aprovado && <p className="perfil-aluno-ajuda">Parecer do professor aprovado. Aguardando homologação da Direção.</p>}
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
        {integrado && documento.temArquivo ? (
          <button type="button" className="perfil-aluno-botao perfil-aluno-botao-visualizar" disabled={baixando}
            onClick={baixar}>{baixando ? 'Baixando…' : 'Baixar PDF'}</button>
        ) : documento.url ? (
          <a className="perfil-aluno-botao perfil-aluno-botao-visualizar" href={documento.url} target="_blank" rel="noopener noreferrer"
            aria-label={`Visualizar ${documento.nome}`}>Visualizar</a>
        ) : (
          <button type="button" className="perfil-aluno-botao perfil-aluno-botao-visualizar" onClick={() => setVisualizando(!visualizando)}
            aria-expanded={visualizando} aria-controls={`documento-previa-${documento.id}`} aria-label={`Visualizar ${documento.nome}`}>Visualizar</button>
        )}
        {podeAvaliar && <>
          <button type="button" className="perfil-aluno-botao perfil-aluno-botao-primario" disabled={salvando || aprovado || pendencias.length > 0 || (!diretor && parecerAprovado)}
            onClick={() => atualizar({ tipo: 'aprovar' })} aria-label={`Aprovar ${documento.nome}`}>{!diretor && homologacaoFinal ? 'Aprovar parecer' : 'Aprovar'}</button>
          <button type="button" className="perfil-aluno-botao perfil-aluno-botao-perigo" disabled={salvando} onClick={() => setDevolvendo(!devolvendo)}
            aria-expanded={devolvendo} aria-controls={`documento-devolucao-${documento.id}`} aria-label={`Devolver ${documento.nome}`}>Devolver</button>
        </>}
      </div>
      {diretor && !aprovado && pendencias.length > 0 && <p className="perfil-aluno-ajuda">A aprovação aguarda assinatura: {pendencias.map((parte) => assinaturaPartes[parte]).join(', ')}.</p>}
      {previaAberta && documento.temArquivo && <div className="perfil-aluno-previa">
        {previa?.url ? <iframe title={`PDF de ${documento.nome}`} src={previa.url} className="w-100 border-0"
          style={{ height: '60vh', minHeight: 320 }} />
          : previa?.erro ? <p role="alert">{previa.erro}</p> : <p role="status">Carregando PDF…</p>}
      </div>}
      {visualizando && !documento.url && <div id={`documento-previa-${documento.id}`} className="perfil-aluno-previa">
        <strong>{documento.nome}</strong>
        <p>{documento.descricao || 'Sem descrição cadastrada.'}</p>
        <p>O arquivo deste documento ainda não está disponível para visualização.</p>
      </div>}
      {podeAvaliar && devolvendo && <form id={`documento-devolucao-${documento.id}`} className="perfil-aluno-devolucao" onSubmit={(evento) => {
        evento.preventDefault();
        atualizar({ tipo: 'devolver', motivo: new FormData(evento.currentTarget).get('motivo') });
      }}>
        <label>Justificativa obrigatória<textarea name="motivo" rows={3} required maxLength={1000} placeholder="Descreva os ajustes necessários neste documento." /></label>
        <div className="perfil-aluno-acoes">
          <button type="submit" className="perfil-aluno-botao perfil-aluno-botao-perigo" disabled={salvando}>Confirmar devolução</button>
          <button type="button" className="perfil-aluno-botao" onClick={() => setDevolvendo(false)}>Cancelar</button>
        </div>
      </form>}
    </li>
  );
}
