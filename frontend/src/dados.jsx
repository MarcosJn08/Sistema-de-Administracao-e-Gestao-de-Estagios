const dados = {
  aluno: {
    nome: "Marcos Junio Rodrigues Sena",
    curso: "Tecnologia em Analise e Desenvolvimento de Sistemas",
    email: "mjrs@aluno.ifnmg.edu.br",
    matricula: "12345678"
  },
  progresso: {
    horasConcluidas: 100,
    metaHoras: 200,
    horasEstagio: 100,
    horasProjeto: 0
  },
  estagioAtual: {
    status: "Em Andamento",
    empresa: "nome da empresa",
    professorOrientador: "nome do professor",
    supervisorEstagio: "nome do supervisor",
    dataInicio: "01/01/2026",
    dataFim: "01/12/2026",
    cargaHorariaSemanal: "30h"
  },
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
  ]
};

export default dados;
