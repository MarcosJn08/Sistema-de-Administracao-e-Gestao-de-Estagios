import { assinaturaPartes, exigeHomologacaoFinal, pendenciasAssinaturas } from './gestaoAluno.js';
import { registrarDevolucao } from './devolucao.js';

export function avaliarDocumento(documento, decisao, observacoes, autor, agora = new Date(), devolucao = {}) {
  const statusPorDecisao = { aprovar: 'Deferido', corrigir: 'Correção solicitada', rejeitar: 'Indeferido' };
  const status = statusPorDecisao[decisao];
  if (!status) throw new Error('Selecione uma decisão válida.');
  const motivo = String(observacoes || '').trim();
  if (decisao !== 'aprovar' && !motivo) throw new Error('Informe o motivo do indeferimento ou os ajustes necessários.');
  if (decisao === 'aprovar' && documento.status === 'Expirado') throw new Error('Solicite o reenvio de um documento válido antes de aprovar.');
  if (decisao === 'aprovar' && exigeHomologacaoFinal(documento)) {
    const pendencias = pendenciasAssinaturas(documento);
    if (pendencias.length) throw new Error(`A aprovação aguarda assinatura: ${pendencias.map((parte) => assinaturaPartes[parte]).join(', ')}.`);
  }
  const notificacao = decisao === 'corrigir' ? registrarDevolucao({
    email: documento.email, responsavel: documento.aluno, referencia: documento.nome,
    itens: devolucao.itens, observacoes: motivo,
  }, agora) : null;
  const assinaturaDirecao = decisao === 'aprovar' ? { autor, assinadaEm: agora.toISOString(), simulada: true } : null;
  return {
    ...documento, status,
    assinaturaDirecao,
    aprovadoPelaDirecao: decisao === 'aprovar',
    assinaturas: { ...documento.assinaturas, direcao: decisao === 'aprovar' ? 'assinado' : 'pendente' },
    notificacoes: notificacao ? [notificacao, ...(documento.notificacoes || [])] : documento.notificacoes || [],
    historico: [{ autor, acao: status, data: agora.toLocaleDateString('pt-BR'), observacoes: motivo || 'Documento conferido e aprovado.',
      assinaturaDirecao, ...(notificacao ? { notificacao } : {}),
    }, ...documento.historico],
  };
}
