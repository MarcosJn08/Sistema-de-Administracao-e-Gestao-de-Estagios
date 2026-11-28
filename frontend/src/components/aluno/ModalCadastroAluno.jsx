import { useState } from 'react';
import { Modal } from 'react-bootstrap';
import { GraduationCap } from 'lucide-react';
import Button from '../Button/Button.jsx';
import './ModalCadastroAluno.css';

function ModalCadastroAluno({ aberto, cursos, aoCadastrar, aoFechar }) {
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);

  const cadastrar = async (evento) => {
    evento.preventDefault();
    const formulario = new FormData(evento.currentTarget);
    const dados = Object.fromEntries(formulario.entries());
    setCarregando(true);
    setErro('');

    const emailTrimmed = String(dados.email || '').toLowerCase().trim();
    if (!emailTrimmed.endsWith('@aluno.ifnmg.edu.br')) {
      setErro('O e-mail do aluno deve ser institucional (@aluno.ifnmg.edu.br).');
      setCarregando(false);
      return;
    }

    try {
      await aoCadastrar({ ...dados, semestre: Number(dados.semestre) });
      aoFechar();
    } catch (error) {
      let msg = error.message;
      if (error.errors && typeof error.errors === 'object') {
        const detalhes = Object.values(error.errors).flat().filter(Boolean);
        if (detalhes.length > 0) {
          msg = detalhes.join(' ');
        }
      }
      setErro(msg || 'Erro ao cadastrar aluno.');
    } finally {
      setCarregando(false);
    }
  };

  const fechar = () => {
    if (carregando) return;
    setErro('');
    aoFechar();
  };

  return (
    <Modal show={aberto} onHide={fechar} centered scrollable size="lg" className="modal-cadastro-aluno"
      aria-labelledby="modal-cadastro-aluno-titulo">
      <Modal.Header closeButton closeLabel="Fechar">
        <Modal.Title as="h2" id="modal-cadastro-aluno-titulo">
          <GraduationCap size={21} aria-hidden="true" /> Cadastrar aluno
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <form id="cadastro-aluno-form" onSubmit={cadastrar}>
          <p className="modal-cadastro-aluno-ajuda">O aluno será cadastrado inicialmente com a situação “Sem estágio”.</p>
          {erro && <p className="modal-cadastro-aluno-erro" role="alert">{erro}</p>}
          <div className="modal-cadastro-aluno-formulario">
            <label>Nome completo
              <input name="nome" required maxLength={120} autoFocus />
            </label>
            <label>Matrícula
              <input name="matricula" required inputMode="numeric" pattern="[0-9]+" maxLength={20} />
            </label>
            <label>CPF
              <input name="cpf" required maxLength={20} placeholder="000.000.000-00" />
            </label>
            <label>Data de nascimento
              <input name="dataNascimento" type="date" required />
            </label>
            <label>E-mail institucional
              <input name="email" type="email" required maxLength={160} placeholder="nome@aluno.ifnmg.edu.br" />
            </label>
            <label>Telefone
              <input name="telefone" type="tel" maxLength={30} placeholder="(00) 00000-0000" />
            </label>
            <label>Curso
              <select name="curso" defaultValue="" required>
                <option value="" disabled>Selecione</option>
                {cursos.map((curso) => <option key={curso} value={curso}>{curso}</option>)}
              </select>
            </label>
            <label>Semestre
              <input name="semestre" type="number" min="1" max="20" defaultValue="1" required />
            </label>
            <label>Período/ano
              <input name="periodoAno" required maxLength={30} placeholder="Ex.: 2026/2" />
            </label>
            <label>Turno
              <select name="turno" defaultValue="" required>
                <option value="" disabled>Selecione</option>
                <option value="Matutino">Matutino</option>
                <option value="Vespertino">Vespertino</option>
                <option value="Noturno">Noturno</option>
                <option value="Integral">Integral</option>
              </select>
            </label>
          </div>
        </form>
      </Modal.Body>
      <Modal.Footer>
        <Button tipo="botao-acao-contorno" onClick={fechar}>Cancelar</Button>
        <button type="submit" form="cadastro-aluno-form" className="botao-sage-verde" disabled={carregando}>
          {carregando ? 'Cadastrando...' : 'Cadastrar aluno'}
        </button>
      </Modal.Footer>
    </Modal>
  );
}

export default ModalCadastroAluno;
