import { Toast, ToastContainer } from 'react-bootstrap';
import { CheckCircle2, AlertCircle } from 'lucide-react';

export default function ToastAlerta({ mensagem, tipo = 'sucesso', aoFechar }) {
  if (!mensagem) return null;

  const isSucesso = tipo === 'sucesso';

  return (
    <ToastContainer
      position="top-end"
      className="p-3"
      style={{ zIndex: 9999, position: 'fixed', top: '16px', right: '16px' }}
    >
      <Toast
        show={!!mensagem}
        onClose={aoFechar}
        delay={4500}
        autohide
        bg={isSucesso ? 'success' : 'danger'}
        className="shadow-lg border-0"
      >
        <Toast.Header closeButton className="border-0">
          <div className="d-flex align-items-center gap-2 me-auto">
            {isSucesso ? (
              <CheckCircle2 size={18} className="text-success" />
            ) : (
              <AlertCircle size={18} className="text-danger" />
            )}
            <strong className={isSucesso ? 'text-success' : 'text-danger'}>
              {isSucesso ? 'Confirmação' : 'Atenção'}
            </strong>
          </div>
        </Toast.Header>
        <Toast.Body className="text-white fw-medium" style={{ fontSize: '0.95rem' }}>
          {mensagem}
        </Toast.Body>
      </Toast>
    </ToastContainer>
  );
}
