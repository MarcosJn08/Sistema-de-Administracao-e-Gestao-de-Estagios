export const assinaturaPartes = { empresa: 'Empresa', aluno: 'Aluno', direcao: 'Direção' };

export function exigeHomologacaoFinal(documento) {
  return ['tce', 'ficha-matricula'].includes(documento.tipo);
}

export function podeHomologarHoras(aluno) {
  return Boolean(aluno.estagio && aluno.situacao !== 'Encerrado' && !aluno.progresso.homologadoEm
    && aluno.progresso.metaHoras > 0 && aluno.progresso.horasConcluidas >= aluno.progresso.metaHoras);
}

export function pendenciasAssinaturas(documento) {
  const partes = documento.tipo === 'tce' ? ['empresa', 'aluno'] : ['aluno'];
  return partes.filter((parte) => documento.assinaturas?.[parte] !== 'assinado');
}

// Regras do protótipo. A API deverá aplicar as mesmas permissões e validações.
export function aplicarAcaoAluno(aluno, acao, { perfil, orientadores = [], alunos = [] } = {}) {
  if (perfil !== 'diretor') throw new Error('Esta ação é exclusiva da Direção.');
  const agora = new Date().toISOString();
  const motivo = String(acao.motivo || '').trim();
  const estagioEditavel = aluno.estagio && !['Encerrado', 'Concluído'].includes(aluno.situacao);

  switch (acao.tipo) {
    case 'cadastro': {
      const campos = Object.fromEntries(['nome', 'matricula', 'email', 'cpf', 'telefone'].map((campo) => [campo, String(acao[campo] || '').trim()]));
      if (!campos.nome || !campos.matricula || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(campos.email)) {
        throw new Error('Preencha nome, matrícula e um e-mail válido.');
      }
      if (alunos.some((outro) => outro.id !== aluno.id && outro.matricula === campos.matricula)) {
        throw new Error('Esta matrícula já pertence a outro aluno.');
      }
      return { ...aluno, ...campos };
    }
    case 'orientador': {
      if (!estagioEditavel) throw new Error('O estágio não está disponível para alteração.');
      const orientador = orientadores.find((item) => item.id === acao.orientadorId);
      if (!orientador) throw new Error('Selecione um orientador cadastrado.');
      return { ...aluno, estagio: { ...aluno.estagio, orientadorId: orientador.id, professorOrientador: orientador.nome } };
    }
    case 'encerrar':
      if (!estagioEditavel) throw new Error('O estágio não está disponível para encerramento.');
      if (!motivo) throw new Error('Informe a justificativa do encerramento.');
      return { ...aluno, situacao: 'Encerrado', estagio: { ...aluno.estagio, encerradoEm: agora, motivoEncerramento: motivo } };
    case 'horas': {
      if (aluno.modalidade !== 'Ensino Médio Integrado') throw new Error('Esta validação está disponível para o Ensino Médio Integrado.');
      if (!estagioEditavel || aluno.progresso.homologadoEm) throw new Error('A carga horária não está disponível para alteração.');
      const horas = Number(acao.horas);
      if (String(acao.horas).trim() === '' || !Number.isFinite(horas) || horas < 0 || horas > 40) throw new Error('O total de projetos deve estar entre 0 e 40 horas.');
      if (!motivo) throw new Error('Informe o projeto e a justificativa da validação.');
      return { ...aluno, progresso: { ...aluno.progresso, horasProjeto: horas,
        horasConcluidas: aluno.progresso.horasEstagio + horas, justificativaProjetos: motivo, projetosValidadosEm: agora } };
    }
    case 'homologar':
      if (!podeHomologarHoras(aluno)) throw new Error('É necessário atingir a carga horária obrigatória para homologar.');
      return { ...aluno, situacao: 'Concluído', progresso: { ...aluno.progresso, homologadoEm: agora } };
    case 'aprovar':
    case 'devolver': {
      const documento = aluno.documentos.find((item) => item.id === acao.documentoId);
      if (!documento) throw new Error('Documento não encontrado.');
      if (acao.tipo === 'devolver' && !motivo) throw new Error('Informe a justificativa da devolução.');
      if (acao.tipo === 'aprovar' && exigeHomologacaoFinal(documento) && pendenciasAssinaturas(documento).length) {
        throw new Error('Aguarde as assinaturas do aluno e, no TCE, da empresa para aprovar.');
      }
      return { ...aluno, documentos: aluno.documentos.map((item) => item.id === documento.id
        ? { ...item, status: acao.tipo === 'aprovar' ? 'Aprovado' : 'Requer ajuste',
          aprovadoPelaDirecao: acao.tipo === 'aprovar', justificativa: acao.tipo === 'devolver' ? motivo : '', analisadoEm: agora }
        : item) };
    }
    default: throw new Error('Ação inválida.');
  }
}

export function baixarPreviaCertidao(aluno) {
  const texto = `SAGE — PRÉVIA DA CERTIDÃO DE CARGA HORÁRIA\nSem validade oficial ou assinatura digital.\n\nAluno: ${aluno.nome}\nMatrícula: ${aluno.matricula}\nCurso: ${aluno.curso}\nEmpresa: ${aluno.estagio?.empresa || 'Não informada'}\n\nCarga horária cumprida: ${aluno.progresso.horasConcluidas}h\nHoras de estágio: ${aluno.progresso.horasEstagio}h\nAproveitamento de projetos: ${aluno.progresso.horasProjeto}h\nCarga horária obrigatória: ${aluno.progresso.metaHoras}h\n\nPrévia gerada em: ${new Date().toLocaleDateString('pt-BR')}\nA emissão oficial depende da homologação e assinatura no sistema institucional.`;
  const url = URL.createObjectURL(new Blob([texto], { type: 'text/plain;charset=utf-8' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = `previa-certidao-aluno-${aluno.id}.txt`;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
