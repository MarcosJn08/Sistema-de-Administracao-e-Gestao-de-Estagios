export function lerFotoPerfil(arquivo) {
  if (!['image/png', 'image/jpeg', 'image/webp'].includes(arquivo.type)) return Promise.reject(new Error('Escolha uma imagem PNG, JPG ou WebP.'));
  if (!arquivo.size || arquivo.size > 500 * 1024) return Promise.reject(new Error('A foto deve ter até 500 KB e não pode estar vazia.'));
  return new Promise((resolve, reject) => {
    const leitor = new FileReader();
    leitor.onerror = () => reject(new Error('Não foi possível ler a foto. Tente novamente.'));
    leitor.onload = () => {
      const imagem = new Image();
      imagem.onload = () => resolve(leitor.result);
      imagem.onerror = () => reject(new Error('O arquivo não contém uma imagem válida.'));
      imagem.src = leitor.result;
    };
    leitor.readAsDataURL(arquivo);
  });
}
