let usuario = null;

export function definirAlunoAutenticado(user) {
  usuario = user?.role === 'aluno' ? user : null;
}

export function carregarAlunoAutenticado() {
  return usuario ? { ...usuario, nome: usuario.name || usuario.nome } : {};
}

export function chaveAlunoAutenticado() {
  return usuario ? `sage:aluno:usuario-${usuario.id}` : 'sage:aluno:visitante';
}
