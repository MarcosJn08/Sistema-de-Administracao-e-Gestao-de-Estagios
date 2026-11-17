import { useEffect, useState } from 'react';
import { carregarPerfilAluno, eventoPerfilAluno } from '../utils/candidaturaAluno.js';

export default function usePerfilAluno() {
  const [perfil, setPerfil] = useState(carregarPerfilAluno);
  useEffect(() => {
    const atualizar = () => setPerfil(carregarPerfilAluno());
    window.addEventListener('storage', atualizar);
    window.addEventListener(eventoPerfilAluno, atualizar);
    return () => {
      window.removeEventListener('storage', atualizar);
      window.removeEventListener(eventoPerfilAluno, atualizar);
    };
  }, []);
  return perfil;
}
