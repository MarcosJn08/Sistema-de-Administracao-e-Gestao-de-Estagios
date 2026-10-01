import { useEffect, useState } from 'react';
import { eventoCandidaturas, listarCandidaturasAluno } from '../utils/candidaturaAluno.js';

export default function useCandidaturasAluno() {
  const [candidaturas, setCandidaturas] = useState(listarCandidaturasAluno);
  useEffect(() => {
    const atualizar = () => setCandidaturas(listarCandidaturasAluno());
    window.addEventListener('storage', atualizar);
    window.addEventListener(eventoCandidaturas, atualizar);
    return () => {
      window.removeEventListener('storage', atualizar);
      window.removeEventListener(eventoCandidaturas, atualizar);
    };
  }, []);
  return candidaturas;
}
