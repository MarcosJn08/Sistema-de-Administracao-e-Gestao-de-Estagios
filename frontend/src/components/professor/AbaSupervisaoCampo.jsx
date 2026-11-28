import React, { useState, useEffect } from 'react';
import { Row, Col, Table, Badge } from 'react-bootstrap';
import { Check, X, Calendar, Clock, AlertCircle, Save, CheckCircle } from 'lucide-react';
import Button from '../Button/Button.jsx';
import api from '../../services/api.js';

export default function AbaSupervisaoCampo() {
  const [turmas, setTurmas] = useState([]);
  const [turmaSelecionada, setTurmaSelecionada] = useState(null);
  const [dataRegistro, setDataRegistro] = useState(() => new Date().toISOString().split('T')[0]);
  const [presencas, setPresencas] = useState({});
  const [carregando, setCarregando] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [mensagem, setMensagem] = useState(null);
  const [erro, setErro] = useState(null);

  const carregarTurmas = async () => {
    setCarregando(true);
    setErro(null);
    try {
      const res = await api.get('/supervisao-campo/turmas');
      const lista = res?.data?.data || [];
      setTurmas(lista);
      if (lista.length > 0 && !turmaSelecionada) {
        setTurmaSelecionada(lista[0]);
      }
    } catch (e) {
      setErro(e?.response?.data?.message || 'Erro ao carregar turmas de campo.');
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    carregarTurmas();
  }, []);

  useEffect(() => {
    if (turmaSelecionada && turmaSelecionada.estagiarios) {
      const mapa = {};
      turmaSelecionada.estagiarios.forEach((aluno) => {
        mapa[aluno.aluno_id] = {
          aluno_id: aluno.aluno_id,
          estagio_id: aluno.estagio_id,
          presente: true,
          horas_cumpridas: aluno.carga_horaria_diaria || 6,
          observacoes: '',
        };
      });
      setPresencas(mapa);
    }
  }, [turmaSelecionada, dataRegistro]);

  const alternarPresenca = (alunoId, presente) => {
    setPresencas((prev) => ({
      ...prev,
      [alunoId]: {
        ...prev[alunoId],
        presente,
        horas_cumpridas: presente ? (prev[alunoId]?.horas_cumpridas || 6) : 0,
      },
    }));
  };

  const mudarHoras = (alunoId, horas) => {
    setPresencas((prev) => ({
      ...prev,
      [alunoId]: {
        ...prev[alunoId],
        horas_cumpridas: Number(horas),
      },
    }));
  };

  const mudarObs = (alunoId, obs) => {
    setPresencas((prev) => ({
      ...prev,
      [alunoId]: {
        ...prev[alunoId],
        observacoes: obs,
      },
    }));
  };

  const salvarPresencas = async () => {
    setSalvando(true);
    setMensagem(null);
    setErro(null);

    const payload = {
      data: dataRegistro,
      registros: Object.values(presencas),
    };

    try {
      await api.post('/supervisao-campo/frequencia-diaria', payload);
      setMensagem('Presenças e horas diárias de campo lançadas com sucesso com baixa imediata no saldo!');
      await carregarTurmas();
    } catch (e) {
      const msg = e?.response?.data?.message || e?.response?.data?.errors?.horas_cumpridas?.[0] || 'Falha ao salvar registros diários.';
      setErro(msg);
    } finally {
      setSalvando(false);
    }
  };

  return (
    <div className="cartao-sage p-4 mb-4">
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-3">
        <div>
          <h2 className="cartao-sage-titulo mb-1">Supervisão de Estágio em Campo</h2>
          <p className="text-secondary small mb-0">
            Controle e lançamento diário de presenças e horas para cursos com modalidade supervisionada (ex: Técnico em Enfermagem).
          </p>
        </div>
        <div className="d-flex align-items-center gap-2">
          <Calendar size={18} className="text-success" />
          <input
            type="date"
            className="form-control form-control-sm"
            value={dataRegistro}
            max={new Date().toISOString().split('T')[0]}
            onChange={(e) => setDataRegistro(e.target.value)}
          />
        </div>
      </div>

      {mensagem && (
        <div className="alert alert-success d-flex align-items-center gap-2 py-2" role="status">
          <CheckCircle size={18} />
          <span>{mensagem}</span>
        </div>
      )}

      {erro && (
        <div className="alert alert-danger d-flex align-items-center gap-2 py-2" role="alert">
          <AlertCircle size={18} />
          <span>{erro}</span>
        </div>
      )}

      {turmas.length > 1 && (
        <div className="d-flex gap-2 mb-3 overflow-auto pb-1">
          {turmas.map((t) => (
            <button
              key={t.turma_id}
              type="button"
              className={`btn btn-sm ${turmaSelecionada?.turma_id === t.turma_id ? 'btn-success' : 'btn-outline-secondary'}`}
              onClick={() => setTurmaSelecionada(t)}
            >
              {t.turma_nome} ({t.curso})
            </button>
          ))}
        </div>
      )}

      {carregando ? (
        <p className="text-center text-secondary py-4">Carregando turmas de campo...</p>
      ) : !turmaSelecionada || !turmaSelecionada.estagiarios?.length ? (
        <p className="text-center text-secondary py-4">
          Nenhuma turma de estágio supervisionado de campo ativa sob sua responsabilidade no momento.
        </p>
      ) : (
        <>
          <div className="table-responsive">
            <Table hover className="tabela-sage align-middle mb-3">
              <thead>
                <tr>
                  <th>Estudante / Matrícula</th>
                  <th>Campo / Hospital</th>
                  <th className="text-center">Presença</th>
                  <th style={{ width: '130px' }}>Horas Hoje</th>
                  <th>Saldo Restante</th>
                  <th>Observação</th>
                </tr>
              </thead>
              <tbody>
                {turmaSelecionada.estagiarios.map((aluno) => {
                  const presencaItem = presencas[aluno.aluno_id] || {};
                  return (
                    <tr key={aluno.aluno_id}>
                      <td>
                        <span className="fw-semibold d-block">{aluno.nome}</span>
                        <span className="small text-secondary">{aluno.matricula}</span>
                      </td>
                      <td>{aluno.empresa}</td>
                      <td className="text-center">
                        <div className="btn-group btn-group-sm" role="group">
                          <button
                            type="button"
                            className={`btn ${presencaItem.presente ? 'btn-success' : 'btn-outline-secondary'}`}
                            onClick={() => alternarPresenca(aluno.aluno_id, true)}
                          >
                            <Check size={14} /> Presente
                          </button>
                          <button
                            type="button"
                            className={`btn ${!presencaItem.presente ? 'btn-danger' : 'btn-outline-secondary'}`}
                            onClick={() => alternarPresenca(aluno.aluno_id, false)}
                          >
                            <X size={14} /> Falta
                          </button>
                        </div>
                      </td>
                      <td>
                        <div className="d-flex align-items-center gap-1">
                          <input
                            type="number"
                            min="0"
                            max={aluno.carga_horaria_diaria || 12}
                            step="0.5"
                            disabled={!presencaItem.presente}
                            className="form-control form-control-sm"
                            value={presencaItem.horas_cumpridas ?? 0}
                            onChange={(e) => mudarHoras(aluno.aluno_id, e.target.value)}
                          />
                          <span className="small text-secondary">h</span>
                        </div>
                      </td>
                      <td>
                        <Badge bg="info" className="text-dark">
                          {aluno.horas_cumpridas}h / {aluno.horas_exigidas}h
                        </Badge>
                      </td>
                      <td>
                        <input
                          type="text"
                          className="form-control form-control-sm"
                          placeholder="Obs. (setor, atividade...)"
                          value={presencaItem.observacoes || ''}
                          onChange={(e) => mudarObs(aluno.aluno_id, e.target.value)}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          </div>

          <div className="d-flex justify-content-end">
            <Button
              tipo="botao-sage-verde"
              className="gap-2"
              disabled={salvando}
              onClick={salvarPresencas}
            >
              <Save size={16} />
              {salvando ? 'Salvando presenças...' : 'Lançar Frequências do Dia'}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
