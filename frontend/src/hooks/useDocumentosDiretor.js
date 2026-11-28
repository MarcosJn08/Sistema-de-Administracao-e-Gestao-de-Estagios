import { useEffect, useState } from 'react';
import api from '../services/api.js';

const situacoes = {
  PENDENTE: 'Pendente', EM_ANALISE: 'Em análise', DEFERIDO: 'Deferido',
  NECESSITA_AJUSTES: 'Correção solicitada', EXPIRADO: 'Expirado',
};

export default function useDocumentosDiretor({ ativo = true, alunoId } = {}) {
  const [consulta, setConsulta] = useState(null);
  const [versao, setVersao] = useState(0);

  useEffect(() => {
    if (!ativo) return;
    const controller = new AbortController();
    api.get('/diretor/documentos-estagio', { params: { aluno_id: alunoId }, signal: controller.signal })
      .then(({ data }) => setConsulta({ alunoId, versao, dados: data.data }))
      .catch((erro) => {
        if (!controller.signal.aborted) setConsulta({ alunoId, versao, erro: erro.message });
      });
    return () => controller.abort();
  }, [ativo, alunoId, versao]);

  const atual = consulta?.alunoId === alunoId ? consulta : null;
  const documentos = (atual?.dados || []).map((doc) => {
    const base = doc.estagio_id == null
      ? `/diretor/fichas-matricula/${doc.id}`
      : `/estagios/${doc.estagio_id}/documentos/${doc.id}`;
    return {
      ...doc, integrado: true, status: situacoes[doc.status] || doc.status,
      estagioId: doc.estagio_id, podeAvaliar: doc.pode_analisar, temArquivo: doc.tem_arquivo,
      descricao: doc.observacoes, data: doc.created_at ? new Date(doc.created_at).toLocaleDateString('pt-BR') : '',
      download: doc.estagio_id == null ? `${base}/arquivo` : `${base}/download`,
      analise: doc.estagio_id == null ? base : `${base}/analise`,
    };
  });

  async function avaliar(doc, aprovar, motivo) {
    await api.patch(doc.analise, { status: aprovar ? 'DEFERIDO' : 'NECESSITA_AJUSTES', observacoes: motivo });
    setConsulta((anterior) => anterior?.dados ? {
      ...anterior,
      dados: anterior.dados.map((item) => item.id === doc.id ? {
        ...item, status: aprovar ? 'DEFERIDO' : 'NECESSITA_AJUSTES', observacoes: motivo, pode_analisar: false,
      } : item),
    } : anterior);
    setVersao((valor) => valor + 1);
  }

  return { documentos, avaliar, erro: atual?.erro, carregando: ativo && atual?.versao !== versao };
}
