const dados = {
  progresso: {
    horasConcluidas: 100,
    metaHoras: 200,
    horasEstagio: 100,
    horasProjeto: 0
  },

  diretor: {
    nome: "Carlos Almeida",
    foto: null
  },

  notificacoes: 1,

  indicadores: [
    {
      id: 1,
      titulo: "Estágios ativos",
      valor: "48",
      texto: "+6 iniciados este mês",
      icone: "bi bi-briefcase fs-4",
      cor: "#2E7D32",
      corFundo: "#E8F5E9"
    },
    {
      id: 2,
      titulo: "Documentos pendentes",
      valor: "12",
      texto: "Aguardando análise",
      icone: "bi bi-file-earmark-text fs-4",
      cor: "#F57F17",
      corFundo: "#FFF8E1"
    },
    {
      id: 3,
      titulo: "Vagas abertas",
      valor: "9",
      texto: "3 novas nesta semana",
      icone: "bi bi-building fs-4",
      cor: "#1565C0",
      corFundo: "#E3F2FD"
    },
    {
      id: 4,
      titulo: "Prazos próximos",
      valor: "5",
      texto: "Vencem nos próximos 7 dias",
      icone: "bi bi-exclamation-circle fs-4",
      cor: "#D32F2F",
      corFundo: "#FDECEA"
    }
  ],

  pendencias: [
    {
      id: 1,
      nome: "Maria Silva",
      descricao: "Termo de compromisso",
      empresa: "Tech Soluções",
      data: "15/08/2026",
      status: "Pendente",
      acoes: ["Analisar"]
    },
    {
      id: 2,
      nome: "João Santos",
      descricao: "Relatório parcial",
      empresa: "Inova Digital",
      data: "14/08/2026",
      status: "Em revisão",
      acoes: ["Ver"]
    },
    {
      id: 3,
      nome: "Ana Oliveira",
      descricao: "Plano de atividades",
      empresa: "EcoVerde LTDA",
      data: "13/08/2026",
      status: "Requer ajuste",
      acoes: ["Analisar"]
    },
    {
      id: 4,
      nome: "Pedro Lima",
      descricao: "Ficha de avaliação",
      empresa: "DataBrasil",
      data: "12/08/2026",
      status: "Pendente",
      acoes: ["Analisar"]
    },
    {
      id: 5,
      nome: "Lucas Ferreira",
      descricao: "Termo aditivo",
      empresa: "StartUp MG",
      data: "11/08/2026",
      status: "Em revisão",
      acoes: ["Ver"]
    }
  ],

  estagiosPorStatus: {
    total: 100,
    itens: [
      { id: 1, rotulo: "Ativos", valor: 48, cor: "#2E7D32" },
      { id: 2, rotulo: "Em andamento", valor: 32, cor: "#1E3A8A" },
      { id: 3, rotulo: "Concluídos", valor: 25, cor: "#6B7280" },
      { id: 4, rotulo: "Encerrados", valor: 8, cor: "#EF4444" }
    ]
  },

  atividadesRecentes: [
    { id: 1, titulo: "Nova vaga publicada - Tech Soluções", tempo: "2h atrás", cor: "#2E7D32" },
    { id: 2, titulo: "Documento enviado - Maria Silva", tempo: "3h atrás", cor: "#1565C0" },
    { id: 3, titulo: "Estágio aprovado - João Santos", tempo: "5h atrás", cor: "#2E7D32" },
    { id: 4, titulo: "Empresa cadastrada - EcoVerde LTDA", tempo: "1 dia atrás", cor: "#1565C0" }
  ],

  acoesRapidas: [
    { id: 1, rotulo: "Cadastrar aluno", icone: "bi bi-person-plus", href: "#" },
    { id: 2, rotulo: "Cadastrar professor", icone: "bi bi-person-workspace", href: "#" },
    { id: 3, rotulo: "Gerenciar empresas", icone: "bi bi-building", href: "#" }
  ],

  proximosVencimentos: [
    { id: 1, titulo: "Relatório - Maria Silva", prazo: "Vence em 2 dias", cor: "#F59E0B" },
    { id: 2, titulo: "Convênio - Tech Informática", prazo: "Vence em 3 dias", cor: "#F59E0B" },
    { id: 3, titulo: "Plano de atividades - Ana Oliveira", prazo: "Vence em 3 dias", cor: "#22C55E" }
  ],

  minhasInscricoes: [
    {
      id: 1,
      vaga: "Desenvolvedor Back-end (Tech-Minas)",
      status: "Em Espera",
      acoes: ["Analisar"]
    },

    {
      id: 2,
      vaga: "Desenvolvedor Front-end (Empresa X)",
      status: "Em Espera",
      acoes: ["Analisar"]
    },

    {
      id: 3,
      vaga: "Analista de Sistemas (Empresa Y)",
      status: "Em Analise",
      acoes: ["Analisar"]
    },

    {
      id: 4,
      vaga: "Desenvolvedor Full Stack (Empresa Z)",
      status: "Em espera",
      acoes: ["Analisar"]
    }
  ]
};

export default dados;
