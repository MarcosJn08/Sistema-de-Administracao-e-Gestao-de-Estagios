import { Modal } from 'react-bootstrap';
import { AlertTriangle } from 'lucide-react';

export default function ModalConfirmacao({
  aberto,
  titulo = 'Confirmar ação',
  mensagem = 'Tem certeza que deseja prosseguir com esta ação?',
  textoConfirmar = 'Confirmar',
  textoCancelar = 'Cancelar',
  variante = 'perigo',
  carregando = false,
  aoConfirmar,
  aoCancelar,
}) {
  return (
    <Modal show={aberto} onHide={carregando ? undefined : aoCancelar} centered backdrop="static">
      <Modal.Header closeButton={!carregando} className="px-4 py-3 border-bottom">
        <Modal.Title as="h5" className="d-flex align-items-center gap-2 mb-0 fs-5 fw-bold">
          {variante === 'perigo' && <AlertTriangle size={20} className="text-danger flex-shrink-0" />}
          <span>{titulo}</span>
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="px-4 py-3">
        <p className="mb-0 text-secondary" style={{ fontSize: '15px', lineHeight: 1.5 }}>
          {mensagem}
        </p>
      </Modal.Body>
      <Modal.Footer className="px-4 py-3 border-top d-flex justify-content-end gap-2">
        <button
          type="button"
          className="btn btn-outline-secondary px-3 py-2 fw-semibold"
          onClick={aoCancelar}
          disabled={carregando}
          style={{ minWidth: '100px', fontSize: '14px', borderRadius: '6px' }}
        >
          {textoCancelar}
        </button>
        <button
          type="button"
          className={`btn ${variante === 'perigo' ? 'btn-danger' : 'btn-success'} px-3 py-2 fw-semibold`}
          onClick={aoConfirmar}
          disabled={carregando}
          style={{ minWidth: '120px', fontSize: '14px', borderRadius: '6px' }}
        >
          {carregando ? 'Processando…' : textoConfirmar}
        </button>
      </Modal.Footer>
    </Modal>
  );
}
