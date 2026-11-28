import React, { useState, useEffect } from 'react';
import { Table, Modal, Badge } from 'react-bootstrap';
import { Calendar, FileText, Upload, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import Button from '../Button/Button.jsx';
import api from '../../services/api.js';

export default function SecaoFrequenciasMensais({ estagioId, podeAprovar = false, podeEnviar = true }) {
  const [frequencias, setFrequencias] = useState([]);
  const [carregando, setCarregando] = useState(false);
  const [modalEnvioAberto, setModalEnvioAberto] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [mensagem, setMensagem] = useState(null);
  const [erro, setErro] = useState(null);

  const [form, setForm] = useState({
    mes_competencia: new Date().getMonth() + 1,
    ano_competencia: new Date().getFullYear(),
    total_horas_mes: 80,
    arquivo: null,
  });

  const carregarFrequencias = async () => {
    if (!estagioId) return;
    setCarregando(true);
    setErro(null);
    try {
      const res = await api.get(`/estagios/${estagioId}/frequencias-mensais`);
      setFrequencias(res?.data?.data?.frequencias || []);
    } catch (e) {
      setErro('Não foi possível carregar as folhas de frequência mensal.');
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    carregarFrequencias();
  }, [estagioId]);

  const enviarFolha = async (e) => {
    e.preventDefault();
    if (!form.arquivo) {
      setErro('Selecione o arquivo comprobatório assinado da folha mensal.');
      return;
    }

    setSalvando(true);
    setErro(null);
    setMensagem(null);

    const formData = new FormData();
    formData.append('mes_competencia', form.mes_competencia);
    formData.append('ano_competencia', form.ano_competencia);
    formData.append('total_horas_mes', form.total_horas_mes);
    formData.append('arquivo', form.arquivo);

    try {
      await api.post(`/estagios/${estagioId}/frequencias-mensais`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setMensagem('Folha de frequência mensal enviada com sucesso para validação do orientador!');
      setModalEnvioAberto(false);
      setForm({
        mes_competencia: new Date().getMonth() + 1,
        ano_competencia: new Date().getFullYear(),
        total_horas_mes: 80,
        arquivo: null,
      });
      await carregarFrequencias();
    } catch (err) {
      const msg = err?.response?.data?.message || err?.response?.data?.errors?.mes_competencia?.[0] || 'Erro ao enviar folha.';
      setErro(msg);
    } finally {
      setSalvando(false);
    }
  };

  const aprovarFolha = async (frequenciaId) => {
    setSalvando(true);
    setErro(null);
    setMensagem(null);
    try {
      await api.post(`/frequencias-mensais/${frequenciaId}/aprovar`);
      setMensagem('Folha de frequência aprovada e horas computadas com sucesso!');
      await carregarFrequencias();
    } catch (err) {
      setErro(err?.response?.data?.message || 'Falha ao aprovar frequência mensal.');
    } finally {
      setSalvando(false);
    }
  };

  return (
    <div className="cartao-sage p-4 mb-4">
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
        <div>
          <h2 className="cartao-sage-titulo mb-1">Folhas de Frequência Mensal (RN10)</h2>
          <p className="text-secondary small mb-0">
            Validação periódica das folhas assinadas pelo estagiário e supervisor (máximo 6 meses retroativos).
          </p>
        </div>
        {podeEnviar && (
          <Button tipo="botao-sage-verde" className="gap-2" onClick={() => setModalEnvioAberto(true)}>
            <Upload size={16} /> Enviar Folha Mensal
          </Button>
        )}
      </div>

      {mensagem && (
        <div className="alert alert-success py-2 d-flex align-items-center gap-2 mb-3" role="status">
          <CheckCircle2 size={16} /> <span>{mensagem}</span>
        </div>
      )}

      {erro && (
        <div className="alert alert-danger py-2 d-flex align-items-center gap-2 mb-3" role="alert">
          <AlertCircle size={16} /> <span>{erro}</span>
        </div>
      )}

      {carregando ? (
        <p className="text-center text-secondary py-3">Carregando frequências mensais...</p>
      ) : frequencias.length === 0 ? (
        <p className="text-center text-secondary py-3">Nenhuma folha de frequência mensal enviada até o momento.</p>
      ) : (
        <div className="table-responsive">
          <Table hover className="tabela-sage align-middle mb-0">
            <thead>
              <tr>
                <th>Competência</th>
                <th>Horas Declaradas</th>
                <th>Status</th>
                <th>Validação</th>
                <th className="text-end">Ações</th>
              </tr>
            </thead>
            <tbody>
              {frequencias.map((f) => (
                <tr key={f.id}>
                  <td className="fw-semibold">
                    <Calendar size={15} className="me-1 text-success" />
                    {f.competencia_formatada}
                  </td>
                  <td>
                    <Badge bg="secondary" className="px-2 py-1">
                      {f.total_horas_mes}h
                    </Badge>
                  </td>
                  <td>
                    <span
                      className={`badge ${
                        f.status === 'APROVADO'
                          ? 'bg-success'
                          : f.status === 'REJEITADO'
                          ? 'bg-danger'
                          : 'bg-warning text-dark'
                      }`}
                    >
                      {f.status}
                    </span>
                  </td>
                  <td className="small text-secondary">
                    {f.status === 'APROVADO'
                      ? `Validado por ${f.validado_por || 'Orientador'}`
                      : 'Aguardando validação'}
                  </td>
                  <td className="text-end">
                    {podeAprovar && f.status !== 'APROVADO' && (
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-success gap-1"
                        disabled={salvando}
                        onClick={() => aprovarFolha(f.id)}
                      >
                        <CheckCircle2 size={14} className="me-1" />
                        Aprovar Horas
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      )}

      <Modal show={modalEnvioAberto} onHide={() => setModalEnvioAberto(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title as="h5">
            <Upload size={18} className="me-2 text-success" />
            Enviar Folha de Frequência Mensal
          </Modal.Title>
        </Modal.Header>
        <form onSubmit={enviarFolha}>
          <Modal.Body>
            <div className="mb-3">
              <label className="form-label small fw-semibold">Mês de Competência</label>
              <select
                className="form-select"
                value={form.mes_competencia}
                onChange={(e) => setForm({ ...form, mes_competencia: Number(e.target.value) })}
              >
                {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                  <option key={m} value={m}>
                    {m < 10 ? `0${m}` : m}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-3">
              <label className="form-label small fw-semibold">Ano de Competência</label>
              <input
                type="number"
                className="form-control"
                min="2020"
                max="2035"
                value={form.ano_competencia}
                onChange={(e) => setForm({ ...form, ano_competencia: Number(e.target.value) })}
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label small fw-semibold">Total de Horas do Mês</label>
              <input
                type="number"
                step="0.5"
                min="0.5"
                max="220"
                className="form-control"
                value={form.total_horas_mes}
                onChange={(e) => setForm({ ...form, total_horas_mes: Number(e.target.value) })}
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label small fw-semibold">Arquivo Comprobatório Assinado (PDF/Imagem)</label>
              <input
                type="file"
                className="form-control"
                accept=".pdf,.png,.jpg,.jpeg"
                onChange={(e) => setForm({ ...form, arquivo: e.target.files[0] })}
                required
              />
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button tipo="botao-acao-contorno" onClick={() => setModalEnvioAberto(false)} disabled={salvando}>
              Cancelar
            </Button>
            <Button tipo="botao-sage-verde" type="submit" disabled={salvando}>
              {salvando ? 'Enviando...' : 'Salvar e Enviar'}
            </Button>
          </Modal.Footer>
        </form>
      </Modal>
    </div>
  );
}
