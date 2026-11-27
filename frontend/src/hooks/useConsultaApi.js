import { useEffect, useState } from 'react';
import api from '../services/api.js';

export default function useConsultaApi(endpoint) {
  const [consulta, setConsulta] = useState({ dados: null, erro: '', carregando: true });
  const [revisao, setRevisao] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    api.get(endpoint, { signal: controller.signal })
      .then(({ data }) => {
        if (!controller.signal.aborted) setConsulta({ dados: data.data, erro: '', carregando: false });
      })
      .catch((error) => {
        if (!controller.signal.aborted) {
          const erro = error.status >= 500 || !error.message
            ? 'Não foi possível carregar os dados. Tente novamente.'
            : error.message;
          setConsulta({ dados: null, erro, carregando: false });
        }
      });
    return () => controller.abort();
  }, [endpoint, revisao]);

  function recarregar() {
    setConsulta((atual) => ({ ...atual, erro: '', carregando: true }));
    setRevisao((atual) => atual + 1);
  }

  return { ...consulta, recarregar };
}
