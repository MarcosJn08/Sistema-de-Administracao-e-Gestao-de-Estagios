import { useState, useEffect } from 'react';
import { Modal, Table } from 'react-bootstrap';
import { BookOpen, Plus, Trash2, X, CheckCircle, AlertCircle } from 'lucide-react';
import Button from '../Button/Button.jsx';
import api from '../../services/api.js';
import './ModalGerenciarCursos.css';

export default function ModalGerenciarCursos({ aberto, aoFechar, aoAtualizar }) {
  const [cursos, setCursos] = useState([]);
  const [carregando, setCarregando] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');
  const [modoCadastro, setModoCadastro] = useState(false);

  const [form, setForm] = useState({
    nome: '',
    codigo: '',
    modalidade: 'superior',
    horas_minimas_estagio: 200,
    modalidade_estagio: 'orientado',
    permite_aproveitamento_projetos: false,
  });

  const carregarCursos = async () => {
    setCarregando(true);
    setErro('');
    try {
      const res = await api.get('/cursos', { params: { per_page: 100 } });
      const lista = res?.data?.data || res?.data || [];
      setCursos(lista);
    } catch (e) {
      setErro('Erro ao carregar lista de cursos.');
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    if (aberto) {
      carregarCursos();
      setModoCadastro(false);
      setErro('');
      setSucesso('');
    }
  }, [aberto]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleCadastrar = async (e) => {
    e.preventDefault();
    setSalvando(true);
    setErro('');
    setSucesso('');

    try {
      await api.post('/cursos', {
        ...form,
        horas_minimas_estagio: Number(form.horas_minimas_estagio),
      });

      setSucesso('Curso cadastrado com sucesso!');
      setModoCadastro(false);
      setForm({
        nome: '',
        codigo: '',
        modalidade: 'superior',
        horas_minimas_estagio: 200,
        modalidade_estagio: 'orientado',
        permite_aproveitamento_projetos: false,
      });
      await carregarCursos();
      if (aoAtualizar) aoAtualizar();
    } catch (err) {
      const msg = err?.response?.data?.message || err.message || 'Erro ao cadastrar curso.';
      setErro(msg);
    } finally {
      setSalvando(false);
    }
  };

  const handleExcluir = async (id, nome) => {
    if (!window.confirm(`Tem certeza que deseja excluir o curso "${nome}"?`)) return;
    setErro('');
    setSucesso('');
    try {
      await api.delete(`/cursos/${id}`);
      setSucesso(`Curso "${nome}" excluído.`);
      await carregarCursos();
      if (aoAtualizar) aoAtualizar();
    } catch (err) {
      const msg = err?.response?.data?.message || err?.response?.data?.errors?.error || 'Não foi possível excluir o curso.';
      setErro(msg);
    }
  };

  return (
    <Modal
      show={aberto}
      onHide={aoFechar}
      centered
      scrollable
      size="lg"
      className="modal-gerenciar-cursos"
    >
      <Modal.Header closeButton closeLabel="Fechar">
        <Modal.Title as="h2">
          <BookOpen size={20} aria-hidden="true" /> Gerenciar Cursos do Campus
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {erro && (
          <div className="modal-cursos-alerta-erro d-flex align-items-center gap-2" role="alert">
            <AlertCircle size={16} />
            <span>{erro}</span>
          </div>
        )}

        {sucesso && (
          <div className="alert alert-success py-2 px-3 d-flex align-items-center gap-2 mb-3" role="status">
            <CheckCircle size={16} />
            <span>{sucesso}</span>
          </div>
        )}

        <div className="d-flex justify-content-between align-items-center mb-3">
          <span className="text-secondary small">
            {cursos.length} curso(s) cadastrado(s)
          </span>
          {!modoCadastro ? (
            <Button
              tipo="botao-sage-verde"
              className="gap-2 btn-sm"
              onClick={() => {
                setModoCadastro(true);
                setErro('');
                setSucesso('');
              }}
            >
              <Plus size={16} aria-hidden="true" /> Cadastrar novo curso
            </Button>
          ) : (
            <Button
              tipo="botao-acao-contorno"
              className="gap-2 btn-sm"
              onClick={() => setModoCadastro(false)}
            >
              <X size={15} aria-hidden="true" /> Cancelar cadastro
            </Button>
          )}
        </div>

        {modoCadastro && (
          <form onSubmit={handleCadastrar} className="modal-cursos-formulario">
            <h6 className="fw-bold mb-3 text-success">Novo Curso</h6>
            <div className="modal-cursos-grid">
              <label className="modal-cursos-campo-largo">
                Nome do Curso *
                <input
                  name="nome"
                  required
                  placeholder="Ex: Análise e Desenvolvimento de Sistemas"
                  value={form.nome}
                  onChange={handleChange}
                />
              </label>

              <label>
                Código / Sigla
                <input
                  name="codigo"
                  placeholder="Ex: ADS"
                  value={form.codigo}
                  onChange={handleChange}
                />
              </label>

              <label>
                Modalidade do Curso *
                <select
                  name="modalidade"
                  value={form.modalidade}
                  onChange={handleChange}
                >
                  <option value="tecnico">Técnico</option>
                  <option value="superior">Superior</option>
                  <option value="pos_graduacao">Pós-Graduação</option>
                </select>
              </label>

              <label>
                Carga Horária Mínima (horas) *
                <input
                  name="horas_minimas_estagio"
                  type="number"
                  min="1"
                  required
                  value={form.horas_minimas_estagio}
                  onChange={handleChange}
                />
              </label>

              <label>
                Modalidade de Estágio *
                <select
                  name="modalidade_estagio"
                  value={form.modalidade_estagio}
                  onChange={handleChange}
                >
                  <option value="orientado">Orientado</option>
                  <option value="supervisionado_campo">Supervisionado em Campo</option>
                </select>
              </label>

              <div className="modal-cursos-campo-largo">
                <label className="modal-cursos-checkbox-label">
                  <input
                    type="checkbox"
                    name="permite_aproveitamento_projetos"
                    checked={form.permite_aproveitamento_projetos}
                    onChange={handleChange}
                  />
                  <span>Permite aproveitamento de projetos de pesquisa/extensão</span>
                </label>
              </div>
            </div>

            <div className="d-flex justify-content-end gap-2 mt-3">
              <Button
                tipo="botao-acao-contorno"
                onClick={() => setModoCadastro(false)}
                disabled={salvando}
              >
                Cancelar
              </Button>
              <Button
                tipo="botao-sage-verde"
                type="submit"
                disabled={salvando}
              >
                {salvando ? 'Salvando...' : 'Salvar Curso'}
              </Button>
            </div>
          </form>
        )}

        <div className="modal-cursos-tabela-wrapper">
          <Table responsive hover className="modal-cursos-tabela mb-0">
            <thead>
              <tr>
                <th>Código</th>
                <th>Nome</th>
                <th>Modalidade</th>
                <th>Carga Mínima</th>
                <th>Estágio</th>
                <th className="text-end">Ações</th>
              </tr>
            </thead>
            <tbody>
              {carregando ? (
                <tr>
                  <td colSpan="6" className="text-center py-4 text-secondary">
                    Carregando cursos...
                  </td>
                </tr>
              ) : cursos.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-4 text-secondary">
                    Nenhum curso cadastrado no momento.
                  </td>
                </tr>
              ) : (
                cursos.map((c) => (
                  <tr key={c.id}>
                    <td className="fw-bold">{c.codigo || '—'}</td>
                    <td>{c.nome}</td>
                    <td>
                      <span className="modal-cursos-badge modal-cursos-badge-mod">
                        {c.modalidade || '—'}
                      </span>
                    </td>
                    <td>
                      <span className="modal-cursos-badge modal-cursos-badge-horas">
                        {c.horas_minimas_estagio ?? c.carga_horaria_estagio}h
                      </span>
                    </td>
                    <td className="small text-muted">
                      {c.modalidade_estagio === 'supervisionado_campo' ? 'Supervisionado' : 'Orientado'}
                    </td>
                    <td className="text-end">
                      <button
                        type="button"
                        className="btn btn-outline-danger btn-sm p-1"
                        title="Excluir curso"
                        onClick={() => handleExcluir(c.id, c.nome)}
                      >
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        </div>
      </Modal.Body>

      <Modal.Footer>
        <Button tipo="botao-acao-contorno" onClick={aoFechar}>
          Fechar
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
