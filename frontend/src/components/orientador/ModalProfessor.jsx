import { useState } from 'react';
import { Modal } from 'react-bootstrap';
import { BookOpenCheck, Pencil, UserRound } from 'lucide-react';
import StatusBadge from '../StatusBadge.jsx';
import Button from '../Button/Button.jsx';
import './ModalProfessor.css';

function ModalProfessor({ aberto, professor, departamentos, statusDisponiveis, aoSalvar, aoFechar, somenteLeitura = false, cadastroIntegrado = false }) {
  const cadastro = !professor;
  const [editando, setEditando] = useState(cadastro);
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);

  const salvar = async (evento) => {
    evento.preventDefault();
    if (carregando) return;
    const formulario = new FormData(evento.currentTarget);
    const dados = {
      id: professor?.id,
      usuarioId: professor?.usuarioId,
      nome: String(formulario.get('nome') || '').trim(),
      siape: String(formulario.get('siape') || '').trim(),
      titulacao: String(formulario.get('titulacao') || '').trim(),
      departamento: String(formulario.get('departamento') || '').trim(),
      email: String(formulario.get('email') || '').trim(),
      cpf: String(formulario.get('cpf') || '').trim(),
      telefone: String(formulario.get('telefone') || '').trim(),
      areaAtuacao: String(formulario.get('areaAtuacao') || '').trim(),
      regimeTrabalho: String(formulario.get('regimeTrabalho') || '').trim(),
      maximoOrientandos: Number(formulario.get('maximoOrientandos')),
      disponivelOrientacao: formulario.get('disponivelOrientacao') === 'on',
      status: String(formulario.get('status') || 'Ativo'),
      novoNesteSemestre: formulario.get('novoNesteSemestre') === 'on',
      alunosOrientados: professor?.alunosOrientados || 0,
    };

    setCarregando(true);
    setErro('');

    const emailTrimmed = dados.email.toLowerCase();
    if (!emailTrimmed.endsWith('@ifnmg.edu.br')) {
      setErro('O e-mail deve ser institucional do IFNMG (@ifnmg.edu.br).');
      setCarregando(false);
      return;
    }

    try {
      await aoSalvar(dados);
      aoFechar();
    } catch (error) {
      let msg = error.message;
      if (error.errors && typeof error.errors === 'object') {
        const detalhes = Object.values(error.errors).flat().filter(Boolean);
        if (detalhes.length > 0) {
          msg = detalhes.join(' ');
        }
      }
      setErro(msg || 'Erro ao salvar professor.');
    } finally {
      setCarregando(false);
    }
  };

  return (
    <Modal show={aberto} onHide={carregando ? undefined : aoFechar} centered scrollable size="lg" className="modal-professor"
      aria-labelledby="modal-professor-titulo">
      <Modal.Header closeButton={!carregando} closeLabel="Fechar">
        <Modal.Title as="h2" id="modal-professor-titulo">
          <BookOpenCheck size={21} aria-hidden="true" />
          {cadastro ? 'Cadastrar professor' : editando ? 'Editar professor' : 'Perfil do professor'}
        </Modal.Title>
      </Modal.Header>

      <form onSubmit={salvar}>
        <Modal.Body>
          {erro && <p className="modal-professor-erro" role="alert">{erro}</p>}

          {!editando && professor ? (
            <div className="modal-professor-perfil">
              <div className="modal-professor-identidade">
                <div className="modal-professor-avatar" aria-hidden="true"><UserRound size={30} /></div>
                <div>
                  <h3>{professor.nome}</h3>
                  <p>SIAPE {professor.siape}</p>
                </div>
                <StatusBadge status={professor.status} />
              </div>

              <dl className="modal-professor-dados">
                <div><dt>Departamento</dt><dd>{professor.departamento}</dd></div>
                <div><dt>E-mail institucional</dt><dd>{professor.email}</dd></div>
                {!somenteLeitura && <>
                  <div><dt>Titulação</dt><dd>{professor.titulacao}</dd></div>
                  <div><dt>CPF</dt><dd>{professor.cpf || 'Não informado'}</dd></div>
                  <div><dt>Telefone</dt><dd>{professor.telefone || 'Não informado'}</dd></div>
                  <div><dt>Área de atuação</dt><dd>{professor.areaAtuacao || 'Não informada'}</dd></div>
                  <div><dt>Regime de trabalho</dt><dd>{professor.regimeTrabalho || 'Não informado'}</dd></div>
                </>}
                <div><dt>Alunos orientados</dt><dd>{professor.alunosOrientados}</dd></div>
                <div><dt>Máximo de orientandos</dt><dd>{professor.maximoOrientandos || 'Não informado'}</dd></div>
                <div><dt>Disponível para orientação</dt><dd>{professor.disponivelOrientacao ? 'Sim' : 'Não'}</dd></div>
                {!somenteLeitura && <div><dt>Ingresso</dt><dd>{professor.novoNesteSemestre ? 'Neste semestre' : 'Semestre anterior'}</dd></div>}
                {somenteLeitura && <div><dt>Estágios em andamento</dt><dd>{professor.estagios_ativos}</dd></div>}
              </dl>
              {professor.discentes && <section aria-label="Discentes vinculados">
                <h3 className="fs-6">Discentes vinculados</h3>
                {professor.discentes.length ? <ul>
                  {professor.discentes.map((discente) => <li key={discente.id}>{discente.nome} · {discente.matricula}</li>)}
                </ul> : <p>Nenhum discente vinculado.</p>}
              </section>}
            </div>
          ) : (
            <div className="modal-professor-formulario">
              <label>Nome completo
                <input name="nome" defaultValue={professor?.nome || ''} required maxLength={120} placeholder="Ex.: Profa. Ana Souza" />
              </label>
              <label>SIAPE
                <input name="siape" defaultValue={professor?.siape || ''} required inputMode="numeric" pattern="[0-9]+" maxLength={20} />
              </label>
              <label>CPF
                <input name="cpf" defaultValue={professor?.cpf || ''} required maxLength={20} placeholder="000.000.000-00" />
              </label>
              <label>Telefone
                <input name="telefone" type="tel" defaultValue={professor?.telefone || ''} required maxLength={30} placeholder="(00) 00000-0000" />
              </label>
              <label className="modal-professor-campo-largo">E-mail institucional
                <input name="email" type="email" defaultValue={professor?.email || ''} required maxLength={160} placeholder="nome.sobrenome@ifnmg.edu.br" />
              </label>
              <label>Titulação
                <input name="titulacao" defaultValue={professor?.titulacao || ''} required maxLength={60} placeholder="Ex.: Doutora" />
              </label>
              <label>Departamento
                <select name="departamento" defaultValue={professor?.departamento || ''} required>
                  <option value="" disabled>Selecione</option>
                  {departamentos.map((item) => <option key={item} value={item}>{item}</option>)}
                </select>
              </label>
              <label>Área de atuação
                <input name="areaAtuacao" defaultValue={professor?.areaAtuacao || ''} required maxLength={120} placeholder="Ex.: Engenharia de software" />
              </label>
              <label>Regime de trabalho
                <select name="regimeTrabalho" defaultValue={professor?.regimeTrabalho || ''} required>
                  <option value="" disabled>Selecione</option>
                  <option value="20 horas">20 horas</option>
                  <option value="40 horas">40 horas</option>
                  <option value="Dedicação exclusiva">Dedicação exclusiva</option>
                </select>
              </label>
              <label>Máximo de orientandos
                <input name="maximoOrientandos" type="number" min={Math.max(1, professor?.estagios_ativos ?? professor?.alunosOrientados ?? 0)} max="100"
                  defaultValue={professor?.maximoOrientandos || 5} required />
              </label>
              <label>Status
                <select name="status" defaultValue={professor?.status || 'Ativo'} required>
                  {statusDisponiveis.map((item) => <option key={item} value={item}>{item}</option>)}
                </select>
              </label>
              {!cadastroIntegrado && <><label className="modal-professor-checkbox">
                <input name="disponivelOrientacao" type="checkbox" defaultChecked={professor?.disponivelOrientacao ?? true} />
                Disponível para receber novos estudantes
              </label>
              <label className="modal-professor-checkbox">
                <input name="novoNesteSemestre" type="checkbox" defaultChecked={professor?.novoNesteSemestre || false} />
                Ingressou neste semestre
              </label></>}
            </div>
          )}
        </Modal.Body>

        <Modal.Footer>
          {!editando && professor ? <>
            {!somenteLeitura && <Button tipo="botao-sage-verde" className="gap-2" onClick={() => setEditando(true)}>
              <Pencil size={15} aria-hidden="true" /> Editar cadastro
            </Button>}
            <Button tipo="botao-acao-contorno" onClick={aoFechar}>Fechar</Button>
          </> : <>
            <Button tipo="botao-acao-contorno" disabled={carregando} onClick={cadastro ? aoFechar : () => { setEditando(false); setErro(''); }}>Cancelar</Button>
            <button type="submit" className="botao-sage-verde" disabled={carregando}>
              {carregando ? 'Salvando…' : cadastro ? 'Cadastrar professor' : 'Salvar alterações'}
            </button>
          </>}
        </Modal.Footer>
      </form>
    </Modal>
  );
}

export default ModalProfessor;
