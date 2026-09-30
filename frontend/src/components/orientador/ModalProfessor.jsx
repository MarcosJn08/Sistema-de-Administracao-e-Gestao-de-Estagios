import { useState } from 'react';
import { Modal } from 'react-bootstrap';
import { BookOpenCheck, Pencil, UserRound } from 'lucide-react';
import StatusBadge from '../StatusBadge.jsx';
import Botao from '../Button.jsx';
import './ModalProfessor.css';

function ModalProfessor({ aberto, professor, departamentos, statusDisponiveis, aoSalvar, aoFechar }) {
  const cadastro = !professor;
  const [editando, setEditando] = useState(cadastro);
  const [erro, setErro] = useState('');

  const salvar = (evento) => {
    evento.preventDefault();
    const formulario = new FormData(evento.currentTarget);
    const dados = {
      id: professor?.id,
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

    try {
      aoSalvar(dados);
      setErro('');
      aoFechar();
    } catch (error) {
      setErro(error.message);
    }
  };

  return (
    <Modal show={aberto} onHide={aoFechar} centered scrollable size="lg" className="modal-professor"
      aria-labelledby="modal-professor-titulo">
      <Modal.Header closeButton closeLabel="Fechar">
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
                <div><dt>Titulação</dt><dd>{professor.titulacao}</dd></div>
                <div><dt>CPF</dt><dd>{professor.cpf || 'Não informado'}</dd></div>
                <div><dt>E-mail institucional</dt><dd>{professor.email}</dd></div>
                <div><dt>Telefone</dt><dd>{professor.telefone || 'Não informado'}</dd></div>
                <div><dt>Área de atuação</dt><dd>{professor.areaAtuacao || 'Não informada'}</dd></div>
                <div><dt>Regime de trabalho</dt><dd>{professor.regimeTrabalho || 'Não informado'}</dd></div>
                <div><dt>Alunos orientados</dt><dd>{professor.alunosOrientados}</dd></div>
                <div><dt>Máximo de orientandos</dt><dd>{professor.maximoOrientandos || 'Não informado'}</dd></div>
                <div><dt>Disponível para orientação</dt><dd>{professor.disponivelOrientacao ? 'Sim' : 'Não'}</dd></div>
                <div><dt>Ingresso</dt><dd>{professor.novoNesteSemestre ? 'Neste semestre' : 'Semestre anterior'}</dd></div>
              </dl>
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
                <input name="email" type="email" defaultValue={professor?.email || ''} required maxLength={160} />
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
                <input name="maximoOrientandos" type="number" min={professor?.alunosOrientados || 1} max="50"
                  defaultValue={professor?.maximoOrientandos || 5} required />
              </label>
              <label>Status
                <select name="status" defaultValue={professor?.status || 'Ativo'} required>
                  {statusDisponiveis.map((item) => <option key={item} value={item}>{item}</option>)}
                </select>
              </label>
              <label className="modal-professor-checkbox">
                <input name="disponivelOrientacao" type="checkbox" defaultChecked={professor?.disponivelOrientacao ?? true} />
                Disponível para receber novos estudantes
              </label>
              <label className="modal-professor-checkbox">
                <input name="novoNesteSemestre" type="checkbox" defaultChecked={professor?.novoNesteSemestre || false} />
                Ingressou neste semestre
              </label>
            </div>
          )}
        </Modal.Body>

        <Modal.Footer>
          {!editando && professor ? <>
            <Botao tipo="botao-sage-verde" className="gap-2" onClick={() => setEditando(true)}>
              <Pencil size={15} aria-hidden="true" /> Editar cadastro
            </Botao>
            <Botao tipo="botao-acao-contorno" onClick={aoFechar}>Fechar</Botao>
          </> : <>
            <Botao tipo="botao-acao-contorno" onClick={cadastro ? aoFechar : () => { setEditando(false); setErro(''); }}>Cancelar</Botao>
            <button type="submit" className="botao-sage-verde">{cadastro ? 'Cadastrar professor' : 'Salvar alterações'}</button>
          </>}
        </Modal.Footer>
      </form>
    </Modal>
  );
}

export default ModalProfessor;
