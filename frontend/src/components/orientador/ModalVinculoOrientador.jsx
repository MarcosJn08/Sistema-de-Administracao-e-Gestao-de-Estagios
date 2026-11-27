import { useState, useEffect } from 'react';
import { Alert, Form, Modal } from 'react-bootstrap';
import Button from '../Button/Button.jsx';
import Select from '../Select.jsx';
import api from '../../services/api.js';

export default function ModalVinculoOrientador({
  vinculos = [], orientadores = [], professor, aluno, carregando, erroConsulta, aoRecarregar, aoSalvar, aoDesvincular, aoFechar,
}) {
  const [estagioId, setEstagioId] = useState('');
  const [orientadorId, setOrientadorId] = useState('');
  const [salvando, setSalvando] = useState(false);
  const [desvinculando, setDesvinculando] = useState(false);
  const [erro, setErro] = useState('');

  useEffect(() => {
    if (!professor && vinculos.length > 0 && !estagioId) {
      setEstagioId(String(vinculos[0].estagio.id));
    }
  }, [professor, vinculos, estagioId]);

  const escolherEstagio = Boolean(professor) || vinculos.length > 1;
  const vinculo = escolherEstagio
    ? vinculos.find(({ estagio }) => String(estagio.id) === estagioId) || (aluno ? vinculos[0] : null)
    : vinculos[0];
  const disponiveis = orientadores.filter((item) => item.disponivel && item.id !== vinculo?.orientador?.id);
  const orientador = professor ?? disponiveis.find(({ id }) => String(id) === orientadorId);
  const dadosCarregados = !carregando && !erroConsulta;
  const professorIndisponivel = professor && !professor.disponivel;
  const exibirOpcoes = dadosCarregados && !professorIndisponivel && vinculos.length > 0;
  const podeSalvar = exibirOpcoes && !salvando && !desvinculando && vinculo && orientador?.disponivel && orientador.id !== vinculo.orientador?.id;

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

  async function executarDesvinculo() {
    if (!vinculo?.estagio?.id || !aoDesvincular) return;
    setDesvinculando(true);
    setErro('');
    try {
      await aoDesvincular(vinculo.estagio.id);
    } catch (error) {
      setErro(error.message || 'Não foi possível desvincular o orientador.');
      setDesvinculando(false);
    }
  }

  const tituloModal = professor ? 'Vincular estágio ao professor' : 'Vincular professor orientador';

  return (
    <Modal show onHide={(salvando || desvinculando) ? undefined : aoFechar} centered aria-labelledby="vinculo-orientador-titulo">
      <Modal.Header closeButton={!salvando && !desvinculando} closeLabel="Fechar">
        <Modal.Title as="h2" id="vinculo-orientador-titulo">{tituloModal}</Modal.Title>
      </Modal.Header>
      <Form onSubmit={salvar} aria-busy={salvando || desvinculando || carregando}>
        <Modal.Body>
          <p>{professor ? 'Professor' : 'Aluno'}: <strong>{professor?.nome ?? aluno?.nome}</strong></p>
          {erro && <Alert variant="danger" role="alert">{erro}</Alert>}
          {carregando && <p role="status">Carregando dados…</p>}
          {erroConsulta && <Alert variant="danger" role="alert">
            {erroConsulta} <Button onClick={aoRecarregar}>Tentar novamente</Button>
          </Alert>}
          {dadosCarregados && professorIndisponivel && <p role="status">Este professor está indisponível para novos vínculos.</p>}

          {dadosCarregados && !professorIndisponivel && vinculos.length === 0 && (
            aluno ? (
              <Alert variant="info" role="status" className="mb-0">
                Este discente não possui estágio cadastrado (em rascunho, análise ou andamento) para vincular a um orientador.
                É necessário cadastrar ou registrar um estágio antes de atribuir o professor orientador.
              </Alert>
            ) : (
              <p role="status">Nenhum estágio sem orientador disponível para vínculo no momento.</p>
            )
          )}

          {exibirOpcoes && <>
            {professor && (
              <Select id="vinculo-estagio" titulo="Estágio" value={estagioId} required disabled={salvando || desvinculando}
                pesquisavel placeholderBusca="Pesquisar por discente, empresa ou ID..."
                onChange={(evento) => { setEstagioId(evento.target.value); setOrientadorId(''); setErro(''); }}>
                <option value="">Selecione o estágio</option>
                {vinculos.map(({ discente, estagio }) => (
                  <option key={estagio.id} value={estagio.id}>{discente.nome} · {estagio.empresa} (#{estagio.id})</option>
                ))}
              </Select>
            )}

            {!professor && vinculos.length > 1 && (
              <Select id="vinculo-estagio" titulo="Estágio do discente" value={estagioId} required disabled={salvando || desvinculando}
                pesquisavel placeholderBusca="Pesquisar por empresa ou ID..."
                onChange={(evento) => { setEstagioId(evento.target.value); setOrientadorId(''); setErro(''); }}>
                {vinculos.map(({ estagio }) => (
                  <option key={estagio.id} value={estagio.id}>{estagio.empresa} (#{estagio.id})</option>
                ))}
              </Select>
            )}

            {!professor && vinculos.length === 1 && vinculo && (
              <p>Estágio: <strong>{vinculo.estagio.empresa} (#{vinculo.estagio.id})</strong></p>
            )}

            {vinculo?.orientador && (
              <div className="d-flex align-items-center justify-content-between p-2 mb-3 bg-light rounded border">
                <div>
                  <span className="small text-secondary d-block">Orientador atual:</span>
                  <strong>{vinculo.orientador.nome}</strong>
                </div>
                {aoDesvincular && (
                  <Button
                    tipo="botao-acao-contorno"
                    size="sm"
                    className="text-danger border-danger"
                    disabled={salvando || desvinculando}
                    onClick={executarDesvinculo}
                  >
                    {desvinculando ? 'Desvinculando…' : 'Desvincular orientador'}
                  </Button>
                )}
              </div>
            )}

            {vinculo && !vinculo.orientador && (
              <p className="text-secondary small">Orientador atual: <em>Sem orientador vinculado</em></p>
            )}

            {!professor && <>
              <Select id="vinculo-orientador" titulo="Professor orientador" value={orientadorId} required
                pesquisavel placeholderBusca="Pesquisar por nome ou departamento..."
                disabled={salvando || desvinculando || !vinculo || disponiveis.length === 0}
                onChange={(evento) => { setOrientadorId(evento.target.value); setErro(''); }}>
                <option value="">Selecione o professor orientador</option>
                {disponiveis.map((item) => (
                  <option key={item.id} value={item.id}>{item.nome} · {item.departamento}</option>
                ))}
              </Select>
              {vinculo && disponiveis.length === 0 && <p role="status">Nenhum orientador com vaga disponível no momento.</p>}
            </>}
          </>}
        </Modal.Body>
        <Modal.Footer>
          <Button tipo="botao-acao-contorno" onClick={aoFechar} disabled={salvando || desvinculando}>
            {vinculos.length === 0 ? 'Fechar' : 'Cancelar'}
          </Button>
          {vinculos.length > 0 && (
            <Button tipo="botao-sage-verde" type="submit" disabled={!podeSalvar}>
              {salvando ? 'Salvando…' : 'Salvar vínculo'}
            </Button>
          )}
        </Modal.Footer>
      </Form>
    </Modal>
  );
}
