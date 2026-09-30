import orientadores from './orientadores.js';

export const cursos = [
  'Análise e Desenvolvimento de Sistemas',
  'Técnico em Informática',
  'Agropecuária',
  'Enfermagem',
  'Agronomia',
];

export const situacoesEstagio = [
  'Em estágio ativo',
  'Pendente',
  'Sem estágio',
  'Concluído',
  'Encerrado',
];

export { orientadores };

const alunos = [
  {
    id: 1, nome: 'Maria Silva', matricula: '2024101001', cpf: '000.000.001-00',
    email: 'maria.silva@example.com', telefone: '(33) 90000-0001',
    curso: cursos[0], semestre: 5, situacao: 'Em estágio ativo',
    progresso: { horasConcluidas: 180, metaHoras: 300, horasEstagio: 160, horasProjeto: 20 },
    estagio: {
      empresa: 'Tech Soluções', professorOrientador: 'Prof. Carlos Almeida',
      supervisorEstagio: 'Fernanda Costa', dataInicio: '01/08/2026', dataFim: '18/12/2026', cargaHorariaSemanal: '20h',
    },
    documentos: [
      { id: 1, tipo: 'tce', nome: 'Termo de compromisso', descricao: 'Vínculo com Tech Soluções', status: 'Deferido', data: '28/07/2026', assinaturas: { empresa: 'assinado', aluno: 'assinado', direcao: 'assinado' } },
      { id: 2, nome: 'Relatório parcial', descricao: 'Atividades de agosto', status: 'Em análise', data: '01/09/2026' },
    ],
  },
  {
    id: 2, nome: 'João Santos', matricula: '2025102002', cpf: '000.000.002-00',
    email: 'joao.santos@example.com', telefone: '(33) 90000-0002',
    curso: cursos[1], semestre: 3, situacao: 'Pendente',
    modalidade: 'Ensino Médio Integrado',
    progresso: { horasConcluidas: 0, metaHoras: 200, horasEstagio: 0, horasProjeto: 0 },
    estagio: {
      empresa: 'Inova Digital', professorOrientador: 'Profa. Juliana Mendes',
      supervisorEstagio: 'Rafael Souza', dataInicio: '01/10/2026', dataFim: '26/02/2027', cargaHorariaSemanal: '20h',
    },
    documentos: [
      { id: 1, tipo: 'tce', nome: 'Termo de compromisso', descricao: 'Vínculo aguardando homologação', status: 'Em análise', data: '21/09/2026', assinaturas: { empresa: 'pendente', aluno: 'assinado', direcao: 'pendente' } },
      { id: 2, nome: 'Plano de atividades', descricao: 'Suporte e manutenção de sistemas', status: 'Deferido', data: '22/09/2026' },
      { id: 3, tipo: 'ficha-matricula', nome: 'Ficha de Matrícula', descricao: 'Dados cadastrais para homologação', status: 'Em análise', data: '21/09/2026', assinaturas: { aluno: 'assinado', direcao: 'pendente' } },
    ],
  },
  {
    id: 3, nome: 'Ana Oliveira', matricula: '2024103003', cpf: '000.000.003-00',
    email: 'ana.oliveira@example.com', telefone: '(33) 90000-0003',
    curso: cursos[2], semestre: 5, situacao: 'Concluído',
    modalidade: 'Ensino Médio Integrado',
    progresso: { horasConcluidas: 240, metaHoras: 240, horasEstagio: 240, horasProjeto: 0 },
    estagio: {
      empresa: 'EcoVerde LTDA', professorOrientador: 'Prof. André Ribeiro',
      supervisorEstagio: 'Mariana Dias', dataInicio: '02/03/2026', dataFim: '31/08/2026', cargaHorariaSemanal: '20h',
    },
    documentos: [
      { id: 1, tipo: 'tce', nome: 'Termo de compromisso', descricao: 'Estágio em produção agropecuária', status: 'Deferido', data: '25/02/2026', assinaturas: { empresa: 'assinado', aluno: 'assinado', direcao: 'assinado' } },
      { id: 2, nome: 'Relatório final', descricao: 'Conclusão de 240 horas de estágio', status: 'Aprovado', data: '04/09/2026' },
      { id: 3, nome: 'Ficha de avaliação', descricao: 'Avaliação do supervisor', status: 'Deferido', data: '08/09/2026' },
    ],
  },
  {
    id: 4, nome: 'Pedro Lima', matricula: '2025104004', cpf: '000.000.004-00',
    email: 'pedro.lima@example.com', telefone: '(33) 90000-0004',
    curso: cursos[3], semestre: 3, situacao: 'Sem estágio',
    progresso: { horasConcluidas: 0, metaHoras: 400, horasEstagio: 0, horasProjeto: 0 },
    estagio: null, documentos: [],
  },
  {
    id: 5, nome: 'Lucas Ferreira', matricula: '2023105005', cpf: '000.000.005-00',
    email: 'lucas.ferreira@example.com', telefone: '(33) 90000-0005',
    curso: cursos[4], semestre: 7, situacao: 'Em estágio ativo',
    progresso: { horasConcluidas: 90, metaHoras: 300, horasEstagio: 90, horasProjeto: 0 },
    estagio: {
      empresa: 'Agro Vale', professorOrientador: 'Profa. Helena Costa',
      supervisorEstagio: 'Roberto Alves', dataInicio: '03/08/2026', dataFim: '29/01/2027', cargaHorariaSemanal: '30h',
    },
    documentos: [
      { id: 1, nome: 'Plano de atividades', descricao: 'Manejo sustentável de culturas', status: 'Deferido', data: '30/07/2026' },
      { id: 2, nome: 'Relatório parcial', descricao: 'Atividades de agosto', status: 'Em revisão', data: '02/09/2026' },
    ],
  },
  {
    id: 6, nome: 'Beatriz Souza', matricula: '2026101006', cpf: '000.000.006-00',
    email: 'beatriz.souza@example.com', telefone: '(33) 90000-0006',
    curso: cursos[0], semestre: 1, situacao: 'Sem estágio',
    progresso: { horasConcluidas: 0, metaHoras: 300, horasEstagio: 0, horasProjeto: 0 },
    estagio: null, documentos: [],
  },
];

export default alunos;
