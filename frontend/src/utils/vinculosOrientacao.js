function listarEstagios(discentes, orientador = null) {
  return discentes.flatMap((discente) => discente.estagios.map((estagio) => ({ discente, estagio, orientador })));
}

export function listarVinculosOrientacao(dados) {
  return [
    ...listarEstagios(dados?.discentes_sem_orientador ?? []),
    ...(dados?.orientadores ?? []).flatMap((orientador) => listarEstagios(orientador.discentes, orientador)),
  ];
}

export function vinculoPodeSerAlterado({ estagio }) {
  return ['RASCUNHO', 'EM_ANDAMENTO', 'EM_ANALISE'].includes(estagio.status);
}
