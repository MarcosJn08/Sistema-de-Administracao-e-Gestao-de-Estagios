import alunos from './alunos.js';

export const statusDocumento = ['Pendente', 'Em análise', 'Deferido', 'Indeferido', 'Correção solicitada', 'Expirado'];

const recebidos = alunos.flatMap((aluno) => aluno.documentos.map((documento) => ({
  ...documento,
  alunoId: aluno.id,
  aluno: aluno.nome,
  email: aluno.email,
  matricula: aluno.matricula,
  curso: aluno.curso,
  empresa: aluno.estagio?.empresa || 'Sem vínculo',
  status: documento.status === 'Aprovado' ? 'Deferido' : documento.status === 'Em revisão' ? 'Correção solicitada' : documento.status,
})));

const exemplos = [
  { aluno: alunos[0], nome: 'Termo aditivo', status: 'Pendente', data: '25/09/2026' },
  { aluno: alunos[1], nome: 'Declaração de matrícula', status: 'Expirado', data: '15/02/2026' },
  { aluno: alunos[4], nome: 'Frequência mensal', status: 'Indeferido', data: '20/09/2026' },
].map(({ aluno, ...documento }) => ({
  ...documento, alunoId: aluno.id, aluno: aluno.nome, email: aluno.email, matricula: aluno.matricula,
  curso: aluno.curso, empresa: aluno.estagio?.empresa || 'Sem vínculo',
}));

const nomeArquivo = (valor) => valor.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '_');

const documentos = [...recebidos, ...exemplos].map((documento, indice) => {
  const historico = [{ autor: 'Sistema', acao: 'Recebido', data: documento.data, observacoes: 'Documento enviado pelo aluno.' }];
  if (documento.status === 'Correção solicitada') historico.unshift({
    autor: 'Coordenação', acao: 'Correção solicitada', data: documento.data,
    observacoes: 'Reenvie o relatório com a assinatura do supervisor legível.',
  });
  if (documento.status === 'Indeferido') historico.unshift({
    autor: 'Coordenação', acao: 'Indeferido', data: documento.data,
    observacoes: 'A frequência enviada corresponde a um período diferente do solicitado.',
  });
  if (documento.status === 'Deferido') historico.unshift({
    autor: 'Coordenação', acao: 'Deferido', data: documento.data, observacoes: 'Documento conferido e aprovado.',
  });
  return {
    ...documento, id: 101 + indice, historico,
    arquivoNome: `${nomeArquivo(documento.nome)}_${nomeArquivo(documento.aluno)}.pdf`,
    arquivoUrl: '/documentos/documento-exemplo.pdf',
  };
});

export const tiposDocumento = [...new Set(documentos.map((documento) => documento.nome))];
export default documentos;
