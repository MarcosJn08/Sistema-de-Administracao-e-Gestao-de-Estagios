import { useState } from 'react';
import { Modal } from 'react-bootstrap';
import { Building2 } from 'lucide-react';
import Botao from '../Button.jsx';
import { calcularVigenciaCincoAnos } from '../../utils/convenio.js';
import './ModalConvenio.css';

const paraDataInput = (data) => {
  const partes = String(data || '').split('/');
  return partes.length === 3 ? `${partes[2]}-${partes[1]}-${partes[0]}` : data || '';
};
const paraDataBr = (data) => data ? data.split('-').reverse().join('/') : '';

function ModalConvenio({ aberto, convenio, modo = 'novo', tipos, aoSalvar, aoFechar }) {
  const [erro, setErro] = useState('');
  const titulo = modo === 'novo' ? 'Novo convênio' : modo === 'renovar' ? 'Renovar convênio' : 'Editar convênio';
  const vigenciaRenovacao = calcularVigenciaCincoAnos();

  const salvar = (evento) => {
    evento.preventDefault();
    const dados = Object.fromEntries(new FormData(evento.currentTarget).entries());
    try {
      aoSalvar({ ...dados, id: convenio?.id, inicio: paraDataBr(dados.inicio), vencimento: paraDataBr(dados.vencimento) }, modo);
      setErro('');
      aoFechar();
    } catch (error) { setErro(error.message); }
  };

  const fechar = () => { setErro(''); aoFechar(); };

  return (
    <Modal show={aberto} onHide={fechar} centered scrollable size="lg" className="modal-convenio"
      aria-labelledby="modal-convenio-titulo">
      <Modal.Header closeButton closeLabel="Fechar">
        <Modal.Title as="h2" id="modal-convenio-titulo"><Building2 size={21} aria-hidden="true" /> {titulo}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {erro && <p className="modal-convenio-erro" role="alert">{erro}</p>}
        <form id="form-convenio" className="modal-convenio-formulario" onSubmit={salvar}>
          <label>CNPJ/CPF
            <input name="documento" defaultValue={convenio?.documento || ''} required maxLength={20} />
          </label>
          <label>Razão social / nome
            <input name="razaoSocial" defaultValue={convenio?.razaoSocial || ''} required maxLength={160} />
          </label>
          <label>Tipo
            <select name="tipo" defaultValue={convenio?.tipo || ''} required>
              <option value="" disabled>Selecione</option>
              {tipos.map((tipo) => <option key={tipo} value={tipo}>{tipo}</option>)}
            </select>
          </label>
          <label>Representante legal
            <input name="representante" defaultValue={convenio?.representante || ''} required maxLength={120} />
          </label>
          <label>E-mail de contato
            <input name="email" type="email" defaultValue={convenio?.email || ''} required maxLength={160} />
          </label>
          <label>Telefone
            <input name="telefone" type="tel" defaultValue={convenio?.telefone || ''} required maxLength={30} />
          </label>
          <label className="modal-convenio-campo-largo">Endereço principal
            <input name="endereco" defaultValue={convenio?.endereco || ''} required maxLength={200} />
          </label>
          <label className="modal-convenio-campo-largo">Área de atuação principal
            <input name="area" defaultValue={convenio?.area || ''} required maxLength={120} />
          </label>
          <label>Início da vigência
            <input name="inicio" type="date" defaultValue={modo === 'renovar' ? vigenciaRenovacao.inicioInput : paraDataInput(convenio?.inicio)}
              readOnly={modo === 'renovar'} required />
          </label>
          <label>Vencimento
            <input name="vencimento" type="date" defaultValue={modo === 'renovar' ? vigenciaRenovacao.vencimentoInput : paraDataInput(convenio?.vencimento)}
              readOnly={modo === 'renovar'} required />
          </label>
        </form>
      </Modal.Body>
      <Modal.Footer>
        <Botao tipo="botao-acao-contorno" onClick={fechar}>Cancelar</Botao>
        <button type="submit" form="form-convenio" className="botao-sage-verde">
          {modo === 'novo' ? 'Cadastrar convênio' : modo === 'renovar' ? 'Confirmar renovação' : 'Salvar alterações'}
        </button>
      </Modal.Footer>
    </Modal>
  );
}

export default ModalConvenio;
