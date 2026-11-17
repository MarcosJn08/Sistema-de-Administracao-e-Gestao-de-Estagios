export const habilidadesPredefinidas = [
  'Java', 'Spring Boot', 'JavaScript', 'React', 'Node.js', 'Python', 'HTML', 'CSS',
  'SQL', 'MySQL', 'PostgreSQL', 'Git', 'Docker', 'Linux', 'Figma', 'Design Gráfico',
  'Prototipagem', 'Excel', 'Informática Básica', 'Atendimento ao Público',
  'Comunicação', 'Trabalho em equipe', 'Organização', 'Proatividade', 'Resolução de problemas',
];

export const normalizarHabilidade = (valor) => valor.trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

export function consolidarHabilidades(habilidades) {
  const unicas = new Map();
  for (const habilidade of habilidades) {
    const chave = normalizarHabilidade(habilidade);
    if (!chave) continue;
    const padrao = habilidadesPredefinidas.find((item) => normalizarHabilidade(item) === chave);
    unicas.set(chave, padrao || habilidade.trim());
  }
  return [...unicas.values()];
}

export function separarHabilidades(habilidades) {
  const todas = consolidarHabilidades(habilidades);
  return {
    selecionadas: todas.filter((item) => habilidadesPredefinidas.includes(item)),
    outras: todas.filter((item) => !habilidadesPredefinidas.includes(item)).join(', '),
  };
}
