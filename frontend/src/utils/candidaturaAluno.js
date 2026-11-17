import dados from '../data/aluno.js';
import { consolidarHabilidades } from '../data/habilidades.js';

const prefixo = `sage:aluno:${dados.aluno.matricula}`;
const chavePerfil = `${prefixo}:perfil`;
const chaveCandidatura = (vagaId) => `${prefixo}:candidatura:${vagaId}`;
const chaveRascunho = (vagaId) => `${prefixo}:carta:${vagaId}`;
export const eventoCandidaturas = 'sage:candidaturas-atualizadas';
export const eventoPerfilAluno = 'sage:perfil-aluno-atualizado';

// Fonte acadêmica do protótipo. Na integração, deve vir do registro acadêmico,
// nunca dos campos editáveis do perfil nem do armazenamento do navegador.
export function carregarDadosAcademicos() {
  return {
    instituicao: 'IFNMG – Campus Almenara',
    matricula: dados.aluno.matricula,
    curso: dados.aluno.curso,
    periodo: dados.aluno.periodo || '',
    email: dados.aluno.email,
  };
}

const texto = (valor) => typeof valor === 'string' ? valor.trim() : '';
const fotoValida = (valor) => typeof valor === 'string' && valor.length <= 700000
  && /^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/.test(valor);

function dadosPessoais(perfil) {
  return {
    foto: fotoValida(perfil?.foto) ? perfil.foto : '',
    telefone: texto(perfil?.telefone),
    endereco: texto(perfil?.endereco),
    cep: texto(perfil?.cep),
    resumo: texto(perfil?.resumo),
  };
}

function lerJson(chave) {
  try {
    return JSON.parse(localStorage.getItem(chave));
  } catch {
    return null;
  }
}

export function carregarPerfilAluno() {
  const salvo = lerJson(chavePerfil);
  return {
    formacao: carregarDadosAcademicos(),
    ...dadosPessoais(salvo),
    habilidades: Array.isArray(salvo?.habilidades) ? salvo.habilidades.filter((item) => typeof item === 'string') : [],
    experiencia: typeof salvo?.experiencia === 'string' ? salvo.experiencia : '',
    anexos: Array.isArray(salvo?.anexos) ? salvo.anexos.filter((item) => item && typeof item.id === 'string' && typeof item.nome === 'string') : [],
  };
}

export function salvarPerfilAluno(perfil) {
  const formacao = carregarDadosAcademicos();
  const pessoais = dadosPessoais(perfil);
  if (pessoais.telefone && (!/^\+?[\d\s().-]{8,25}$/.test(pessoais.telefone)
    || !/^\d{10,15}$/.test(pessoais.telefone.replace(/\D/g, '')))) throw new Error('Informe um telefone válido, com DDD.');
  if (pessoais.cep && !/^\d{5}-?\d{3}$/.test(pessoais.cep)) throw new Error('Informe um CEP válido com 8 dígitos.');
  if (pessoais.endereco.length > 300 || pessoais.resumo.length > 1000) throw new Error('O endereço deve ter até 300 caracteres e o resumo até 1.000.');
  if (perfil.foto && !fotoValida(perfil.foto)) throw new Error('A foto de perfil não é válida. Escolha outra imagem.');
  const habilidades = consolidarHabilidades(perfil.habilidades);
  const atualizado = { formacao, ...pessoais, habilidades, experiencia: (perfil.experiencia || '').trim(), anexos: perfil.anexos || [] };
  localStorage.setItem(chavePerfil, JSON.stringify(atualizado));
  window.dispatchEvent(new Event(eventoPerfilAluno));
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
    aluno: { ...dados.aluno, telefone: perfil.telefone, foto: perfil.foto },
    formacao: perfil.formacao,
    habilidades: perfil.habilidades,
    resumo: perfil.resumo,
    experiencia: perfil.experiencia,
    anexos: perfil.anexos,
    cartaApresentacao: carta,
    dataInscricao: new Date().toISOString(),
    status: 'Em Análise',
  };
  localStorage.setItem(chaveCandidatura(vaga.id), JSON.stringify(candidatura));
  window.dispatchEvent(new Event(eventoCandidaturas));
  return candidatura;
}
