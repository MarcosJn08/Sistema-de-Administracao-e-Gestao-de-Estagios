import dados from '../data/aluno.js';

export const MAX_ANEXOS = 5;
export const MAX_TAMANHO_ANEXO = 5 * 1024 * 1024;
const tipos = { pdf: 'application/pdf', png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg' };

function abrirBanco() {
  return new Promise((resolve, reject) => {
    const pedido = indexedDB.open(`sage-anexos-${dados.aluno.matricula}`, 1);
    pedido.onupgradeneeded = () => pedido.result.createObjectStore('arquivos');
    pedido.onsuccess = () => resolve(pedido.result);
    pedido.onerror = () => reject(new Error('Não foi possível acessar os anexos neste navegador.'));
  });
}

export async function guardarAnexos(arquivos, existentes = []) {
  if (arquivos.length + existentes.length > MAX_ANEXOS) throw new Error('Você pode anexar até 5 arquivos.');
  for (const arquivo of arquivos) {
    const tipo = tipos[arquivo.name.split('.').pop().toLowerCase()];
    if (!tipo || (arquivo.type && arquivo.type !== tipo)) throw new Error('Use apenas arquivos PDF, PNG ou JPG.');
    if (!arquivo.size) throw new Error(`O arquivo ${arquivo.name} está vazio.`);
    if (arquivo.size > MAX_TAMANHO_ANEXO) throw new Error('Cada arquivo deve ter no máximo 5 MB.');
  }
  const registros = arquivos.map((arquivo) => ({
    id: crypto.randomUUID(), nome: arquivo.name, tamanho: arquivo.size,
    tipo: tipos[arquivo.name.split('.').pop().toLowerCase()],
  }));
  const banco = await abrirBanco();
  try {
    await new Promise((resolve, reject) => {
      const transacao = banco.transaction('arquivos', 'readwrite');
      arquivos.forEach((arquivo, indice) => transacao.objectStore('arquivos').put(arquivo, registros[indice].id));
      transacao.oncomplete = resolve;
      transacao.onerror = () => reject(new Error('Não foi possível guardar os arquivos. Verifique o espaço disponível no navegador.'));
      transacao.onabort = () => reject(new Error('O armazenamento dos anexos foi interrompido. Tente novamente.'));
    });
    return registros;
  } finally { banco.close(); }
}

export async function baixarAnexo(anexo) {
  const banco = await abrirBanco();
  try {
    const arquivo = await new Promise((resolve, reject) => {
      const pedido = banco.transaction('arquivos', 'readonly').objectStore('arquivos').get(anexo.id);
      pedido.onsuccess = () => resolve(pedido.result);
      pedido.onerror = () => reject(new Error('Não foi possível abrir este arquivo.'));
    });
    if (!(arquivo instanceof Blob)) throw new Error('Este arquivo não está disponível neste navegador.');
    const url = URL.createObjectURL(arquivo);
    const link = document.createElement('a');
    link.href = url;
    link.download = anexo.nome;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  } finally { banco.close(); }
}
