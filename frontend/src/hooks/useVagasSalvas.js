import { useEffect, useState } from 'react';
import { eventoVagasSalvas, listarVagasSalvas } from '../utils/vagasSalvasAluno.js';

export default function useVagasSalvas() {
  const [vagas, setVagas] = useState(listarVagasSalvas);
  useEffect(() => {
    const atualizar = () => setVagas(listarVagasSalvas());
    window.addEventListener('storage', atualizar);
    window.addEventListener(eventoVagasSalvas, atualizar);
    return () => {
      window.removeEventListener('storage', atualizar);
      window.removeEventListener(eventoVagasSalvas, atualizar);
    };
  }, []);
  return vagas;
}
