import { useState } from 'react';
import { Alert, Form, Modal } from 'react-bootstrap';
import Button from '../Button/Button.jsx';
import Select from '../Select.jsx';
import api from '../../services/api.js';

export default function ModalVinculoOrientador({
  vinculos, orientadores = [], professor, aluno, carregando, erroConsulta, aoRecarregar, aoSalvar, aoFechar,
}) {
  const [estagioId, setEstagioId] = useState('');
  const [orientadorId, setOrientadorId] = useState('');
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState('');
  const escolherEstagio = Boolean(professor) || vinculos.length > 1;
  const vinculo = escolherEstagio
    ? vinculos.find(({ estagio }) => String(estagio.id) === estagioId)
    : vinculos[0];
  const disponiveis = orientadores.filter((item) => item.disponivel && item.id !== vinculo?.orientador?.id);
  const orientador = professor ?? disponiveis.find(({ id }) => String(id) === orientadorId);
  const dadosCarregados = !carregando && !erroConsulta;
  const professorIndisponivel = professor && !professor.disponivel;
  const exibirOpcoes = dadosCarregados && !professorIndisponivel && vinculos.length > 0;
  const podeSalvar = exibirOpcoes && !salvando && vinculo && orientador?.disponivel && orientador.id !== vinculo.orientador?.id;

  async function salvar(evento) {
    evento.preventDefault();
    if (!podeSalvar) return;

    setSalvando(true);
    setErro('');
    try {
      await api.patch('/estagios/' + vinculo.estagio.id + '/orientador', { professor_orientador_id: orientador.id });
      aoSalvar(vinculo.estagio, orientador);
    } catch (error) {
      setErro(error.errors?.professor_orientador_id?.[0] || error.errors?.estagio?.[0] || error.message || 'Não foi possível salvar o vínculo.');
    } finally {
      setSalvando(false);
    }
  }

  return (
    <Modal show onHide={salvando ? undefined : aoFechar} centered aria-labelledby="vinculo-orientador-titulo">
      <Modal.Header closeButton={!salvando} closeLabel="Fechar">
        <Modal.Title as="h2" id="vinculo-orientador-titulo">{professor ? 'Vincular estágio' : 'Vincular a professor'}</Modal.Title>
      </Modal.Header>
      <Form onSubmit={salvar} aria-busy={salvando || carregando}>
        <Modal.Body>
          <p>{professor ? 'Professor' : 'Aluno'}: <strong>{professor?.nome ?? aluno?.nome}</strong></p>
          {erro && <Alert variant="danger" role="alert">{erro}</Alert>}
          {carregando && <p role="status">Carregando estágios e orientadores…</p>}
          {erroConsulta && <Alert variant="danger" role="alert">
            {erroConsulta} <Button onClick={aoRecarregar}>Tentar novamente</Button>
          </Alert>}
          {dadosCarregados && professorIndisponivel && <p role="status">Este professor está indisponível para novos vínculos.</p>}
          {dadosCarregados && !professorIndisponivel && vinculos.length === 0 && (
            <p role="status">Nenhum estágio disponível para este vínculo.</p>
          )}
          {exibirOpcoes && <>
            {escolherEstagio ? (
              <Select id="vinculo-estagio" titulo="Estágio" value={estagioId} required disabled={salvando}
                onChange={(evento) => { setEstagioId(evento.target.value); setOrientadorId(''); setErro(''); }}>
                <option value="">Selecione o estágio</option>
                {vinculos.map(({ discente, estagio }) => (
                  <option key={estagio.id} value={estagio.id}>{professor && discente.nome + ' · '}{estagio.empresa} (#{estagio.id})</option>
                ))}
              </Select>
            ) : <p>Estágio: {vinculo.estagio.empresa} (#{vinculo.estagio.id})</p>}
            {vinculo && <p>Orientador atual: {vinculo.orientador?.nome || 'Sem orientador'}</p>}
            {!professor && <>
              <Select id="vinculo-orientador" titulo="Professor orientador" value={orientadorId} required
                disabled={salvando || !vinculo || disponiveis.length === 0}
                onChange={(evento) => { setOrientadorId(evento.target.value); setErro(''); }}>
                <option value="">Selecione o professor</option>
                {disponiveis.map((item) => (
                  <option key={item.id} value={item.id}>{item.nome} · {item.departamento}</option>
                ))}
              </Select>
              {vinculo && disponiveis.length === 0 && <p role="status">Nenhum orientador disponível para este estágio.</p>}
            </>}
          </>}
        </Modal.Body>
        <Modal.Footer>
          <Button tipo="botao-acao-contorno" onClick={aoFechar} disabled={salvando}>Cancelar</Button>
          <Button tipo="botao-sage-verde" type="submit" disabled={!podeSalvar}>
            {salvando ? 'Salvando…' : 'Salvar vínculo'}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}
