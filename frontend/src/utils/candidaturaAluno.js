import dados from '../data/aluno.js';
import { consolidarHabilidades } from '../data/habilidades.js';

const prefixo = `sage:aluno:${dados.aluno.matricula}`;
const chavePerfil = `${prefixo}:perfil`;
const chaveCandidatura = (vagaId) => `${prefixo}:candidatura:${vagaId}`;
const chaveRascunho = (vagaId) => `${prefixo}:carta:${vagaId}`;
export const eventoCandidaturas = 'sage:candidaturas-atualizadas';

function lerJson(chave) {
  try {
    return JSON.parse(localStorage.getItem(chave));
  } catch {
    return null;
  }
}

export function carregarPerfilAluno() {
  const salvo = lerJson(chavePerfil);
  const formacao = salvo?.formacao || {};
  return {
    formacao: {
      curso: typeof formacao.curso === 'string' ? formacao.curso : dados.aluno.curso,
      instituicao: typeof formacao.instituicao === 'string' ? formacao.instituicao : 'IFNMG — Campus Almenara',
      periodo: typeof formacao.periodo === 'string' ? formacao.periodo : '',
    },
    habilidades: Array.isArray(salvo?.habilidades) ? salvo.habilidades.filter((item) => typeof item === 'string') : [],
    experiencia: typeof salvo?.experiencia === 'string' ? salvo.experiencia : '',
    anexos: Array.isArray(salvo?.anexos) ? salvo.anexos.filter((item) => item && typeof item.id === 'string' && typeof item.nome === 'string') : [],
  };
}

export function salvarPerfilAluno(perfil) {
  const formacao = Object.fromEntries(Object.entries(perfil.formacao).map(([chave, valor]) => [chave, valor.trim()]));
  if (!formacao.curso || !formacao.instituicao) throw new Error('Preencha o curso e a instituição.');
  const habilidades = consolidarHabilidades(perfil.habilidades);
  const atualizado = { formacao, habilidades, experiencia: (perfil.experiencia || '').trim(), anexos: perfil.anexos || [] };
  localStorage.setItem(chavePerfil, JSON.stringify(atualizado));
  return atualizado;
}

export function carregarRascunho(vagaId) {
  try {
    return sessionStorage.getItem(chaveRascunho(vagaId)) || '';
  } catch {
    return '';
  }
}

export function salvarRascunho(vagaId, carta) {
  sessionStorage.setItem(chaveRascunho(vagaId), carta);
}

export function carregarCandidatura(vagaId) {
  const candidatura = lerJson(chaveCandidatura(vagaId));
  return candidatura?.vagaId === String(vagaId) && typeof candidatura.cartaApresentacao === 'string' ? candidatura : null;
}

export function listarCandidaturasAluno() {
  try {
    const inicioChave = `${prefixo}:candidatura:`;
    const candidaturas = [];
    for (let indice = 0; indice < localStorage.length; indice += 1) {
      const chave = localStorage.key(indice);
      if (!chave?.startsWith(inicioChave)) continue;
      const candidatura = carregarCandidatura(chave.slice(inicioChave.length));
      if (candidatura && typeof candidatura.vaga === 'string' && typeof candidatura.empresa === 'string'
        && Number.isFinite(Date.parse(candidatura.dataInscricao))) candidaturas.push(candidatura);
    }
    return candidaturas.sort((a, b) => Date.parse(b.dataInscricao) - Date.parse(a.dataInscricao)
      || a.vagaId.localeCompare(b.vagaId));
  } catch {
    return [];
  }
}

export function apresentarStatusCandidatura(status) {
  const normalizado = String(status || '').toLowerCase().trim();
  if (['aprovado', 'aprovada'].includes(normalizado)) return { texto: 'Aprovada', variante: 'verde' };
  if (['reprovado', 'reprovada'].includes(normalizado)) return { texto: 'Reprovada', variante: 'vermelho' };
  if (['em análise', 'em analise'].includes(normalizado)) return { texto: 'Em análise', variante: 'ambar' };
  return { texto: status || 'Enviada', variante: 'cinza' };
}

export function enviarCandidatura(vaga, cartaApresentacao) {
  if (vaga.inscricoes_abertas === false || vaga.status === 'Encerrada') throw new Error('As inscrições desta vaga estão encerradas.');
  const carta = cartaApresentacao.trim();
  if (!carta) throw new Error('Escreva sua carta de apresentação antes de enviar.');
  if (carta.length > 2000) throw new Error('A carta deve ter no máximo 2.000 caracteres.');
  const existente = carregarCandidatura(vaga.id);
  if (existente) return existente;
  const perfil = carregarPerfilAluno();
  const candidatura = {
    vagaId: String(vaga.id),
    vaga: vaga.titulo,
    empresa: vaga.empresa,
    aluno: { ...dados.aluno, curso: perfil.formacao.curso },
    ...perfil,
    cartaApresentacao: carta,
    dataInscricao: new Date().toISOString(),
    status: 'Em Análise',
  };
  localStorage.setItem(chaveCandidatura(vaga.id), JSON.stringify(candidatura));
  window.dispatchEvent(new Event(eventoCandidaturas));
  return candidatura;
}
