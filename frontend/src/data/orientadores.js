export const departamentos = [
  'Administração',
  'Agropecuária',
  'Ciências Biológicas',
  'Enfermagem',
  'Informática',
];

export const statusOrientador = ['Ativo', 'Inativo', 'Afastado'];

const orientadoresBase = [
  { id: 'carlos', siape: '1028374', nome: 'Prof. Carlos Almeida', titulacao: 'Doutor', departamento: 'Informática', email: 'carlos.almeida@ifnmg.edu.br', telefone: '(33) 3421-1001', alunosOrientados: 5, status: 'Ativo', novoNesteSemestre: false },
  { id: 'juliana', siape: '1928374', nome: 'Profa. Juliana Mendes', titulacao: 'Doutora', departamento: 'Informática', email: 'juliana.mendes@ifnmg.edu.br', telefone: '(33) 3421-1002', alunosOrientados: 4, status: 'Ativo', novoNesteSemestre: false },
  { id: 'andre', siape: '2837461', nome: 'Prof. André Ribeiro', titulacao: 'Mestre', departamento: 'Agropecuária', email: 'andre.ribeiro@ifnmg.edu.br', telefone: '(33) 3421-1003', alunosOrientados: 3, status: 'Ativo', novoNesteSemestre: false },
  { id: 'helena', siape: '3746152', nome: 'Profa. Helena Costa', titulacao: 'Especialista', departamento: 'Enfermagem', email: 'helena.costa@ifnmg.edu.br', telefone: '(33) 3421-1004', alunosOrientados: 0, status: 'Inativo', novoNesteSemestre: false },
  { id: 'joao', siape: '4615243', nome: 'Prof. João Santos', titulacao: 'Doutor', departamento: 'Ciências Biológicas', email: 'joao.santos@ifnmg.edu.br', telefone: '(33) 3421-1005', alunosOrientados: 2, status: 'Ativo', novoNesteSemestre: true },
  { id: 'sandra', siape: '5243167', nome: 'Profa. Sandra Neves', titulacao: 'Mestra', departamento: 'Administração', email: 'sandra.neves@ifnmg.edu.br', telefone: '(33) 3421-1006', alunosOrientados: 1, status: 'Afastado', novoNesteSemestre: false },
  { id: 'marina', siape: '6354278', nome: 'Profa. Marina Oliveira', titulacao: 'Mestra', departamento: 'Enfermagem', email: 'marina.oliveira@ifnmg.edu.br', telefone: '(33) 3421-1007', alunosOrientados: 3, status: 'Ativo', novoNesteSemestre: true },
  { id: 'ricardo', siape: '7465389', nome: 'Prof. Ricardo Silva', titulacao: 'Doutor', departamento: 'Informática', email: 'ricardo.silva@ifnmg.edu.br', telefone: '(33) 3421-1008', alunosOrientados: 6, status: 'Ativo', novoNesteSemestre: false },
  { id: 'ana', siape: '8576490', nome: 'Profa. Ana Souza', titulacao: 'Doutora', departamento: 'Informática', email: 'ana.souza@ifnmg.edu.br', telefone: '(33) 3421-1009', alunosOrientados: 4, status: 'Ativo', novoNesteSemestre: false },
  { id: 'eduardo', siape: '9687501', nome: 'Prof. Eduardo Lima', titulacao: 'Mestre', departamento: 'Agropecuária', email: 'eduardo.lima@ifnmg.edu.br', telefone: '(33) 3421-1010', alunosOrientados: 0, status: 'Ativo', novoNesteSemestre: true },
  { id: 'beatriz', siape: '1798612', nome: 'Profa. Beatriz Rocha', titulacao: 'Especialista', departamento: 'Administração', email: 'beatriz.rocha@ifnmg.edu.br', telefone: '(33) 3421-1011', alunosOrientados: 0, status: 'Inativo', novoNesteSemestre: false },
  { id: 'marcos', siape: '2809723', nome: 'Prof. Marcos Vieira', titulacao: 'Doutor', departamento: 'Ciências Biológicas', email: 'marcos.vieira@ifnmg.edu.br', telefone: '(33) 3421-1012', alunosOrientados: 2, status: 'Ativo', novoNesteSemestre: true },
];

const orientadores = orientadoresBase.map((orientador, indice) => ({
  cpf: `${String(indice + 1).padStart(3, '0')}.000.000-00`,
  areaAtuacao: orientador.departamento,
  regimeTrabalho: 'Dedicação exclusiva',
  maximoOrientandos: 8,
  disponivelOrientacao: orientador.status === 'Ativo' && orientador.alunosOrientados < 8,
  ...orientador,
}));

export default orientadores;
