const meusEstagios = [
  {
    id: 1,
    atual: true,
    status: 'Em andamento',
    empresa: 'Tech Soluções Ltda',
    cnpj: '12.345.678/0001-90',
    cargo: 'Desenvolvedor back-end',
    professorOrientador: 'Prof. Dr. Ricardo Silva',
    supervisorEstagio: 'Carlos Eduardo Silva',
    dataInicio: '01/08/2026',
    dataFim: '30/12/2026',
    cargaHoraria: '20h/semana',
    cargaHorariaSemanal: '20h',
    modalidade: 'Presencial',
    seguro: 'Apólice nº 987654 — Brasil Seguros',
    horasConcluidas: 150,
    metaHoras: 200,
    horasEstagio: 140,
    horasProjeto: 10,
    progresso: 75,
    documentos: [
      { id: 1, nome: 'Termo de compromisso', descricao: 'Vínculo com a empresa concedente', status: 'Deferido', data: '28/07/2026' },
      { id: 2, nome: 'Plano de atividades', descricao: 'Atividades previstas para o estágio', status: 'Deferido', data: '30/07/2026' },
      { id: 3, nome: 'Relatório parcial', descricao: 'Atividades realizadas no primeiro período', status: 'Em análise', data: '15/09/2026' },
    ],
  },
  {
    id: 2,
    atual: false,
    status: 'Concluído',
    empresa: 'Inova Digital',
    cnpj: '45.678.901/0001-23',
    cargo: 'Suporte de TI',
    professorOrientador: 'Profa. Juliana Mendes',
    supervisorEstagio: 'Rafael Souza',
    dataInicio: '01/02/2026',
    dataFim: '30/06/2026',
    cargaHoraria: '20h/semana',
    cargaHorariaSemanal: '20h',
    modalidade: 'Híbrido',
    seguro: 'Apólice nº 845120 — Brasil Seguros',
    horasConcluidas: 200,
    metaHoras: 200,
    horasEstagio: 200,
    horasProjeto: 0,
    progresso: 100,
    documentos: [
      { id: 1, nome: 'Termo de compromisso', descricao: 'Vínculo com a empresa concedente', status: 'Deferido', data: '25/01/2026' },
      { id: 2, nome: 'Relatório final', descricao: 'Relatório de encerramento do estágio', status: 'Deferido', data: '05/07/2026' },
      { id: 3, nome: 'Ficha de avaliação', descricao: 'Avaliação do supervisor da empresa', status: 'Deferido', data: '05/07/2026' },
    ],
  },
  {
    id: 3,
    atual: false,
    status: 'Concluído',
    empresa: 'Norte Minas Tecnologia',
    cnpj: '56.789.012/0001-34',
    cargo: 'Desenvolvedor front-end',
    professorOrientador: 'Prof. Carlos Almeida',
    supervisorEstagio: 'Marina Oliveira',
    dataInicio: '01/08/2025',
    dataFim: '31/12/2025',
    cargaHoraria: '20h/semana',
    cargaHorariaSemanal: '20h',
    modalidade: 'Remoto',
    seguro: 'Apólice nº 763421 — Minas Seguros',
    horasConcluidas: 200,
    metaHoras: 200,
    horasEstagio: 180,
    horasProjeto: 20,
    progresso: 100,
    documentos: [
      { id: 1, nome: 'Termo de compromisso', descricao: 'Vínculo com a empresa concedente', status: 'Deferido', data: '25/07/2025' },
      { id: 2, nome: 'Relatório final', descricao: 'Relatório de encerramento do estágio', status: 'Deferido', data: '08/01/2026' },
    ],
  },
];

const aluno = {
  aluno: {
    nome: "Marcos Junio Rodrigues Sena",
    curso: "Tecnologia em Analise e Desenvolvimento de Sistemas",
    email: "mjrs@aluno.ifnmg.edu.br",
    matricula: "12345678"
  },
  progressoTotal: {
    horasConcluidas: 100,
    metaHoras: 200,
    horasEstagio: 100,
    horasProjeto: 0
  },
  progressoEspecifico: {
    horasConcluidas: 15,
    metaHoras: 30
  },
  estagioAtual: meusEstagios[0],
  meusEstagios,
  documentos: [
    {
      id: 1,
      nome: "Documento 1",
      descricao: "Informações cadastrais",
      status: "Deferido",
      acoes: ["Visualizar", "Gerar PDF"]
    },
    {
      id: 2,
      nome: "documento 2",
      descricao: "informação",
      status: "Em Analise",
      acoes: ["Visualizar", "Gerar PDF"]
    },
    {
      id: 3,
      nome: "Documento 3",
      descricao: "Informações cadastrais",
      status: "Indeferido",
      acoes: ["Visualizar", "Gerar PDF", "Preencher", "Enviar"]
    },
    {
      id: 4,
      nome: "Documento 4",
      descricao: "Informações cadastrais",
      status: "Pendente de envio",
      acoes: ["Visualizar", "Gerar PDF", "Preencher", "Enviar"]
    }
  ],
  minhasInscricoes: [
    {
      id: 1,
      vaga: "Desenvolvedor back-end (Tech-Minas)",
      status: "Em Espera",
      acoes: ["Visualizar"]
    },
    {
      id: 2,
      vaga: "cargo (empresa)",
      status: "Em Espera",
      acoes: ["Visualizar"]
    },
    {
      id: 3,
      vaga: "cargo (empresa)",
      status: "Reprovado",
      acoes: ["Visualizar"]
    },
    {
      id: 4,
      vaga: "cargo (empresa)",
      status: "Aprovado",
      acoes: ["Visualizar"]
    }
  ],
  empresa: {
    nome: "Shelby LTDA",
    cnpj: "12.345.678/0001-90",
    metricas: {
      vagasAtivas: 8,
      candidatosTotais: 47,
      emTriagem: 12,
      contratados: 5
    },
    vagas: [
      {
        id: 1,
        titulo: "Desenvolvedor Backend",
        area: "Tecnologia",
        inscritos: 18,
        status: "Ativa",
        dataPublicacao: "15/02/2026",
        ativa: true
      },
      {
        id: 2,
        titulo: "Analista de Marketing",
        area: "Comunicação",
        inscritos: 12,
        status: "Ativa",
        dataPublicacao: "10/02/2026",
        ativa: true
      },
      {
        id: 3,
        titulo: "Designer UX/UI",
        area: "Design & UX",
        inscritos: 9,
        status: "Rascunho",
        dataPublicacao: "08/02/2026",
        ativa: false
      },
      {
        id: 4,
        titulo: "Assistente Administrativo",
        area: "Administração",
        inscritos: 5,
        status: "Encerrada",
        dataPublicacao: "20/01/2026",
        ativa: false
      },
      {
        id: 5,
        titulo: "Estagiário de Dados",
        area: "Tecnologia",
        inscritos: 3,
        status: "Ativa",
        dataPublicacao: "01/02/2026",
        ativa: true
      }
    ]
  }
};

aluno.progresso = aluno.progressoTotal;

export default aluno;
