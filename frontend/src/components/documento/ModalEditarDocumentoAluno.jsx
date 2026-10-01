import { useState } from 'react';
import { Alert, Form, Modal } from 'react-bootstrap';
import { FilePenLine, FileText, Upload } from 'lucide-react';
import Botao from '../Button.jsx';
import StatusBadge from '../StatusBadge.jsx';
import './ModalEditarDocumentoAluno.css';

function ModalEditarDocumentoAluno({ documento, aoFechar, aoSalvar }) {
  const [arquivo, setArquivo] = useState(null);
  const [erro, setErro] = useState('');

  const salvar = (evento) => {
    evento.preventDefault();
    if (!arquivo) return setErro('Selecione o novo arquivo PDF.');
    if (arquivo.type !== 'application/pdf' && !arquivo.name.toLowerCase().endsWith('.pdf')) return setErro('O arquivo selecionado deve estar no formato PDF.');
    if (arquivo.size > 10 * 1024 * 1024) return setErro('O arquivo deve ter no máximo 10 MB.');
    aoSalvar(documento.id, arquivo);
    aoFechar();
  };

  return (
    <Modal show onHide={aoFechar} centered className="modal-editar-documento" aria-labelledby="editar-documento-titulo">
      <Modal.Header closeButton closeLabel="Fechar">
        <Modal.Title as="h2" id="editar-documento-titulo"><FilePenLine size={20} aria-hidden="true" /> Editar PDF</Modal.Title>
      </Modal.Header>
      <form onSubmit={salvar}>
        <Modal.Body>
          <div className="editar-documento-atual">
            <span className="editar-documento-atual-icone"><FileText size={24} aria-hidden="true" /></span>
            <div className="editar-documento-atual-info"><strong>{documento.nome}</strong>
              <small title={documento.arquivoNome || 'Documento em PDF'}>{documento.arquivoNome || 'Documento em PDF'}</small>
            </div>
            <StatusBadge status={documento.status} />
          </div>

          {erro && <Alert variant="danger" role="alert">{erro}</Alert>}

          <Form.Group controlId="novo-pdf-documento">
            <Form.Label>Novo arquivo PDF</Form.Label>
            <label className="editar-documento-upload" htmlFor="novo-pdf-documento">
              <Upload size={24} aria-hidden="true" />
              <strong>{arquivo ? arquivo.name : 'Selecionar arquivo'}</strong>
              <span>Formato PDF, com tamanho máximo de 10 MB</span>
            </label>
            <Form.Control type="file" accept="application/pdf,.pdf" onChange={(evento) => {
              setArquivo(evento.target.files?.[0] || null);
              setErro('');
            }} />
          </Form.Group>
          <p className="editar-documento-aviso">Ao substituir o arquivo, o documento voltará para análise.</p>
        </Modal.Body>
        <Modal.Footer>
          <Botao tipo="botao-acao-contorno" onClick={aoFechar}>Cancelar</Botao>
          <button type="submit" className="botao-sage-verde"><Upload size={15} aria-hidden="true" /> Salvar novo PDF</button>
        </Modal.Footer>
      </form>
    </Modal>
  );
}

export default ModalEditarDocumentoAluno;
