import dados from '../data/aluno.js';
import catalogo from '../data/vagas.json';

const prefixo = `sage:aluno:${dados.aluno.matricula}:vaga-salva:`;
export const eventoVagasSalvas = 'sage:vagas-salvas-atualizadas';

export function listarVagasSalvas() {
  const salvas = [];
  try {
    for (let indice = 0; indice < localStorage.length; indice += 1) {
      const chave = localStorage.key(indice);
      if (!chave?.startsWith(prefixo)) continue;
      try {
        const registro = JSON.parse(localStorage.getItem(chave));
        if (!registro?.vaga || String(registro.vaga.id) !== chave.slice(prefixo.length)
          || typeof registro.vaga.titulo !== 'string' || typeof registro.vaga.empresa !== 'string'
          || !Number.isFinite(Date.parse(registro.salvaEm))) continue;
        const atual = catalogo.find((vaga) => String(vaga.id) === String(registro.vaga.id));
        // Vagas que saíram do catálogo continuam consultáveis, sem novas inscrições.
        salvas.push({ vaga: atual || { ...registro.vaga, inscricoes_abertas: false, status: 'Encerrada' }, salvaEm: registro.salvaEm });
      } catch {
        // Um registro inválido não impede a consulta das outras vagas.
      }
    }
  } catch {
    return [];
  }
  return salvas.sort((a, b) => Date.parse(b.salvaEm) - Date.parse(a.salvaEm)).map(({ vaga }) => vaga);
}

export function definirVagaSalva(vaga, salvar) {
  const chave = `${prefixo}${vaga.id}`;
  if (salvar) localStorage.setItem(chave, JSON.stringify({ vaga, salvaEm: new Date().toISOString() }));
  else localStorage.removeItem(chave);
  window.dispatchEvent(new Event(eventoVagasSalvas));
}
