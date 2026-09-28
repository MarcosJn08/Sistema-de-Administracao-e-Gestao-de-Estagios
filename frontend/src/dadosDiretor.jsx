const dados = {
  progresso: {
    horasConcluidas: 100,
    metaHoras: 200,
    horasEstagio: 100,
    horasProjeto: 0
  },

  pendencias: [
    {
      id: 1,
      nome: "Maria",
      descricao: "Termo de compromisso",
      status: "Deferido",
      acoes: ["Analisar"],
    },

    {
      id: 2,
      nome: "João",
      descricao: "Documento de estágio",
      status: "Em Analise",
      acoes: ["Analisar"]
    },

    {
      id: 3,
      nome: "Pedro",
      descricao: "Informações cadastrais",
      status: "Indeferido",
      acoes: [
        "Analisar"
      ]
    },

    {
      id: 4,
      nome: "Ana",
      descricao: "Informações cadastrais",
      status: "Pendente de envio",
      acoes: [
        "Analisar",
      ]
    }
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
      status: "Reprovado",
      acoes: ["Analisar"]
    },

    {
      id: 4,
      vaga: "Desenvolvedor Full Stack (Empresa Z)",
      status: "Aprovado",
      acoes: ["Analisar"]
    }
  ]
};

export default dados;
