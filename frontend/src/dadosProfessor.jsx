const dados = {
  professor: {
    nome: 'Professor',
    foto: null,
  },

  alunos: [
    {
      matricula: '20231234',
      nome: 'Maria Silva',
      curso: 'Tecnologia em ADS',
      empresa: 'Tech Soluções Ltda',
      status: 'Em Andamento',
    },
    {
      matricula: '20231235',
      nome: 'Marcos Junio Rodrigues Sena',
      curso: 'Tecnologia em ADS',
      empresa: 'IFNMG Campus Almenara',
      status: 'Em Andamento',
    },

    {
    matricula: '20240012',
    nome: 'Bruno Oliveira Souza',
    curso: 'Técnico em Agropecuária',
    empresa: 'Fazenda Campo Verde',
    status: 'Concluído',
  },
  {
    matricula: '20240982',
    nome: 'Amanda Costa Duarte',
    curso: 'Técnico em Informática',
    empresa: 'N/A',
    status: 'Sem Vínculo',
  },
  {
    matricula: '20230554',
    nome: 'Gabriel Santos Neves',
    curso: 'Tecnologia em ADS',
    empresa: 'Inova Digital',
    status: 'Pendente',
  },
  {
    matricula: '20230221',
    nome: 'Isabela Martins Rocha',
    curso: 'Técnico em Enfermagem',
    empresa: 'Hospital Municipal',
    status: 'Concluído',
  },
  ],
  indicadores: [
  {
    id: 1,
    titulo: 'Total de Alunos',
    valor: '234',
    texto: '+12 novos este semestre',
    icone: 'bi bi-people fs-4',
    cor: '#2E7D32',
    corFundo: '#E8F5E9',
  },
  {
    id: 2,
    titulo: 'Estágios Ativos',
    valor: '48',
    texto: 'Vínculos regulares vigentes',
    icone: 'bi bi-briefcase fs-4',
    cor: '#2E7D32',
    corFundo: '#E8F5E9',
  }, 
  {
    id: 3,
    titulo: 'Pendências Documentais',
    valor: '15',
    texto: 'Necessitam de ajustes ou envio',
    icone: 'bi bi-file-earmark-text fs-4',
    cor: '#2E7D32',
    corFundo: '#E8F5E9',
  },
  {
    id: 4,
    titulo: 'Sem Vínculo',
    valor: '23',
    texto: 'Disponíveis para contratação',
    icone: 'bi bi-person-x fs-4',
    cor: '#2E7D32',
    corFundo: '#E8F5E9',
  },
],

filtros: {
  cursos: [
    { valor: '', rotulo: 'Curso: Todos' },
    { valor: 'ads', rotulo: 'Tecnologia em ADS' },
    { valor: 'informatica', rotulo: 'Técnico em Informática' },
    { valor: 'agropecuaria', rotulo: 'Técnico em Agropecuária' },
    { valor: 'enfermagem', rotulo: 'Técnico em Enfermagem' },
  ],

  periodos: [
    { valor: '', rotulo: 'Ano/Período: Todos' },
    { valor: '2026-1', rotulo: '2026/1' },
    { valor: '2026-2', rotulo: '2026/2' },
  ],
},
paginacao: {
  exibidos: 6,
  total: 234,
  paginaAtual: 1,
},
};

export default dados;

