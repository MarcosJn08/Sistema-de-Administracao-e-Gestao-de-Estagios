import { beforeEach, test } from 'node:test';
import assert from 'node:assert/strict';
import dados from '../src/data/aluno.js';
import { carregarDadosAcademicos, carregarPerfilAluno, salvarPerfilAluno, enviarCandidatura, carregarCandidatura } from '../src/utils/candidaturaAluno.js';

const registros = new Map();
globalThis.localStorage = {
  getItem: (chave) => registros.get(chave) ?? null,
  setItem: (chave, valor) => registros.set(chave, valor),
};
globalThis.window = new EventTarget();
const chavePerfil = `sage:aluno:${dados.aluno.matricula}:perfil`;
const vaga = { id: 'teste', titulo: 'Vaga de teste', empresa: 'Empresa de teste', inscricoes_abertas: true };
beforeEach(() => registros.clear());

test('ignora dados acadêmicos editados anteriormente, preservando habilidades e experiência', () => {
  registros.set(chavePerfil, JSON.stringify({ formacao: { curso: 'Curso alterado', instituicao: 'Outra instituição', periodo: '99', email: 'outro@exemplo.com', matricula: '000' }, habilidades: ['Git'], experiencia: 'Projeto acadêmico' }));
  const perfil = carregarPerfilAluno();
  assert.deepEqual(perfil.formacao, carregarDadosAcademicos());
  assert.equal(perfil.formacao.instituicao, 'IFNMG – Campus Almenara');
  assert.deepEqual(perfil.habilidades, ['Git']);
  assert.equal(perfil.experiencia, 'Projeto acadêmico');
});

test('salva dados pessoais e rejeita substituição dos dados oficiais', () => {
  const perfil = salvarPerfilAluno({ ...carregarPerfilAluno(), formacao: { curso: 'Curso falso' }, telefone: '(33) 99999-9999', endereco: 'Rua de teste, 1', cep: '39900-000', resumo: 'Interesse em desenvolvimento', habilidades: ['Git', 'git'] });
  assert.deepEqual(perfil.formacao, carregarDadosAcademicos());
  assert.equal(carregarPerfilAluno().telefone, '(33) 99999-9999');
  assert.equal(carregarPerfilAluno().endereco, 'Rua de teste, 1');
  assert.equal(carregarPerfilAluno().resumo, 'Interesse em desenvolvimento');
  assert.deepEqual(perfil.habilidades, ['Git']);
});

test('valida CEP, telefone e foto antes de persistir', () => {
  assert.throws(() => salvarPerfilAluno({ ...carregarPerfilAluno(), cep: '123' }), /CEP válido/);
  assert.throws(() => salvarPerfilAluno({ ...carregarPerfilAluno(), telefone: 'telefone inválido' }), /telefone válido/);
  assert.throws(() => salvarPerfilAluno({ ...carregarPerfilAluno(), telefone: '(..) ----' }), /telefone válido/);
  assert.throws(() => salvarPerfilAluno({ ...carregarPerfilAluno(), foto: 'javascript:alert(1)' }), /foto de perfil/);
  assert.equal(registros.has(chavePerfil), false);
});

test('novas candidaturas usam formação oficial e não incluem endereço e CEP', () => {
  salvarPerfilAluno({ ...carregarPerfilAluno(), endereco: 'Endereço privado', cep: '39900-000', telefone: '(33) 99999-9999', resumo: 'Resumo de teste' });
  const candidatura = enviarCandidatura(vaga, 'Carta de apresentação');
  assert.deepEqual(candidatura.formacao, carregarDadosAcademicos());
  assert.equal(candidatura.aluno.email, dados.aluno.email);
  assert.equal(candidatura.aluno.telefone, '(33) 99999-9999');
  assert.equal(candidatura.resumo, 'Resumo de teste');
  assert.equal('endereco' in candidatura, false);
  assert.equal('cep' in candidatura, false);
});

test('edições no perfil não modificam inscrições enviadas', () => {
  const enviada = enviarCandidatura(vaga, 'Carta original');
  salvarPerfilAluno({ ...carregarPerfilAluno(), resumo: 'Novo resumo', habilidades: ['Python'] });
  assert.deepEqual(carregarCandidatura(vaga.id), enviada);
});
