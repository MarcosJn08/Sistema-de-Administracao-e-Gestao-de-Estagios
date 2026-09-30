const dadosEmpresa = {
  empresa: {
    nome: "Shelby LTDA",
    metricas: {
      vagasAtivas: 8,
      candidatosTotais: 47,
      emTriagem: 12,
      contratados: 5,
    },
    vagas: [
      {
        id: 1,
        titulo: "Desenvolvedor Front-end React",
        curso: "Tecnologia em Análise e Desenvolvimento de Sistemas",
        modalidade: "Híbrido",
        bolsa: 1200,
        status: "Ativa",
        candidatos: 14,
        dataPublicacao: "10/08/2026",
      },
      {
        id: 2,
        titulo: "Estagiário de Suporte e Infraestrutura",
        curso: "Tecnologia em Redes de Computadores",
        modalidade: "Presencial",
        bolsa: 900,
        status: "Ativa",
        candidatos: 8,
        dataPublicacao: "12/08/2026",
      },
      {
        id: 3,
        titulo: "Assistente de Qualidade de Software (QA)",
        curso: "Engenharia de Software",
        modalidade: "Remoto",
        bolsa: 1400,
        status: "Encerrada",
        candidatos: 25,
        dataPublicacao: "01/08/2026",
      },
    ],
  },
};

export default dadosEmpresa;
