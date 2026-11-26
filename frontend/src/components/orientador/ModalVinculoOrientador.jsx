import { useState } from 'react';
import { Alert, Form, Modal } from 'react-bootstrap';
import Button from '../Button/Button.jsx';
import Select from '../Select.jsx';
import api from '../../services/api.js';

export default function ModalVinculoOrientador({ vinculos, orientadores, aoSalvar, aoFechar }) {
  const [estagioId, setEstagioId] = useState('');
  const [orientadorId, setOrientadorId] = useState('');
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState('');
  const vinculo = vinculos.find(({ estagio }) => String(estagio.id) === estagioId);
  const disponiveis = orientadores.filter((item) => item.disponivel && item.id !== vinculo?.orientador?.id);

  async function salvar(evento) {
    evento.preventDefault();
    if (salvando || !vinculo || !disponiveis.some(({ id }) => String(id) === orientadorId)) return;
    setSalvando(true);
    setErro('');
    try {
      await api.patch('/estagios/' + estagioId + '/orientador', { professor_orientador_id: Number(orientadorId) });
      aoSalvar();
    } catch (error) {
      setErro(error.errors?.professor_orientador_id?.[0] || error.errors?.estagio?.[0] || error.message);
    } finally {
      setSalvando(false);
    }
  }

  return (
    <Modal show onHide={salvando ? undefined : aoFechar} centered aria-labelledby="vinculo-orientador-titulo">
      <Modal.Header closeButton={!salvando}>
        <Modal.Title as="h2" id="vinculo-orientador-titulo">Vincular ou trocar orientador</Modal.Title>
      </Modal.Header>
      <Form onSubmit={salvar} aria-busy={salvando}>
        <Modal.Body>
          {erro && <Alert variant="danger" role="alert">{erro}</Alert>}
          <Select id="vinculo-estagio" titulo="Estágio" value={estagioId} required disabled={salvando}
            onChange={(evento) => { setEstagioId(evento.target.value); setOrientadorId(''); setErro(''); }}>
            <option value="">Selecione o estágio</option>
            {vinculos.map(({ discente, estagio }) => (
              <option key={estagio.id} value={estagio.id}>{discente.nome} · {estagio.empresa} (#{estagio.id})</option>
            ))}
          </Select>
          {vinculo && <p>Orientador atual: {vinculo.orientador?.nome || 'Sem orientador'}</p>}
          <Select id="vinculo-orientador" titulo="Novo orientador" value={orientadorId} required disabled={salvando || !vinculo}
            onChange={(evento) => { setOrientadorId(evento.target.value); setErro(''); }}>
            <option value="">Selecione o orientador</option>
            {disponiveis.map((item) => (
              <option key={item.id} value={item.id}>{item.nome} · {item.departamento}</option>
            ))}
          </Select>
          {vinculo && disponiveis.length === 0 && <p role="status">Nenhum orientador disponível para este estágio.</p>}
        </Modal.Body>
        <Modal.Footer>
          <Button tipo="botao-acao-contorno" onClick={aoFechar} disabled={salvando}>Cancelar</Button>
          <Button tipo="botao-sage-verde" type="submit" disabled={salvando || !vinculo || !orientadorId}>
            {salvando ? 'Salvando…' : 'Salvar vínculo'}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}
