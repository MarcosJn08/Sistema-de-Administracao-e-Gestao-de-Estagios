export const pendenciasConvenio = [
  'Dados cadastrais incompletos', 'CNPJ inválido ou divergente',
  'CPF do representante legal ausente', 'Erro nos cursos autorizados',
  'Documentação insuficiente ou ilegível', 'Endereço incompleto', 'Outro (especificar abaixo)',
];

export const pendenciasDocumento = [
  'Dados cadastrais incompletos', 'Assinatura ausente ou ilegível',
  'Documentação insuficiente ou ilegível', 'Período ou carga horária divergente',
  'Documento vencido', 'Outro (especificar abaixo)',
];

export function prepararNotificacao({ email, responsavel, referencia, itens, observacoes }) {
  return {
    destinatario: email,
    assunto: `SAGE — ${referencia}: correções necessárias`,
    saudacao: `Olá, ${responsavel}.`,
    mensagem: `Após a análise de ${referencia}, identificamos as seguintes pendências:`,
    itens: [...itens],
    observacoes: observacoes.trim(),
    instrucoes: 'Utilize o link seguro de correção desta solicitação para atualizar os dados e reenviar os documentos para análise.',
  };
}

export function registrarDevolucao(dados, agora = new Date()) {
  if (!dados.itens?.length || !dados.observacoes?.trim()) throw new Error('Selecione ao menos uma pendência e detalhe as correções necessárias.');
  if (!dados.email) throw new Error('O destinatário precisa ter um e-mail cadastrado.');
  return { ...prepararNotificacao(dados), enviadaEm: agora.toISOString(), simulada: true };
}
