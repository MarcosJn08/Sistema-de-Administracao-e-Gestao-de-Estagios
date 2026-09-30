import { useState } from 'react';
import { Alert, Form, Modal } from 'react-bootstrap';
import { Download, ExternalLink, FileText, PenLine } from 'lucide-react';
import Botao from '../Button.jsx';
import StatusBadge from '../StatusBadge.jsx';
import DevolucaoParaAjustes from '../DevolucaoParaAjustes.jsx';
import { pendenciasDocumento } from '../../utils/devolucao.js';
import './ModalAnaliseDocumento.css';

export default function ModalAnaliseDocumento({ documento, visualizacao = false, aoFechar, aoAvaliar }) {
  const [observacoes, setObservacoes] = useState('');
  const [erro, setErro] = useState('');
  const [mostrarPdf, setMostrarPdf] = useState(visualizacao);
  const [devolvendo, setDevolvendo] = useState(false);

  const avaliar = (decisao) => {
    try {
      aoAvaliar(documento.id, decisao, observacoes);
      aoFechar();
    } catch (error) { setErro(error.message); }
  };

  return (
    <Modal show onHide={aoFechar} centered scrollable size="xl" className="modal-analise-documento" aria-labelledby="analise-documento-titulo">
      <Modal.Header closeButton closeLabel="Fechar">
        <Modal.Title as="h2" id="analise-documento-titulo">{devolvendo ? 'Devolução para ajustes' : visualizacao ? 'Visualização de documento' : 'Análise de documento'}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {devolvendo ? <DevolucaoParaAjustes
          resumo={[[ 'Aluno', documento.aluno ], [ 'Empresa', documento.empresa ], [ 'Matrícula', documento.matricula ], [ 'Documento', documento.nome ]]}
          status={documento.status} opcoes={pendenciasDocumento} email={documento.email} responsavel={documento.aluno}
          referencia={documento.nome} observacoesIniciais={observacoes} aoCancelar={() => setDevolvendo(false)}
          aoConfirmar={(dados) => { aoAvaliar(documento.id, 'corrigir', dados.observacoes, dados); aoFechar(); }}
        /> : <div className="analise-documento-grid">
          <section className="analise-documento-previa" aria-label="Prévia do documento">
            {mostrarPdf && documento.arquivoUrl ? <>
              <div className="analise-documento-arquivo-barra"><FileText size={18} aria-hidden="true" /><span>{documento.arquivoNome}</span></div>
              <iframe src={documento.arquivoUrl} title={`PDF: ${documento.nome} de ${documento.aluno}`} />
            </> : <div className="analise-documento-arquivo">
              <span className="analise-documento-arquivo-icone"><FileText size={42} strokeWidth={1.25} aria-hidden="true" /></span>
              <h3>{documento.arquivoNome}</h3>
              <p>{documento.arquivoUrl ? 'Visualização prévia do PDF integrada ao navegador' : 'O arquivo ainda não está disponível.'}</p>
              {documento.arquivoUrl && <Botao tipo="botao-acao-contorno" onClick={() => setMostrarPdf(true)}>Visualizar PDF</Botao>}
            </div>}
            {documento.arquivoUrl && <div className="analise-documento-arquivo-acoes">
              <a href={documento.arquivoUrl} target="_blank" rel="noopener noreferrer">Abrir em nova aba <ExternalLink size={14} aria-hidden="true" /></a>
              <a href={documento.arquivoUrl} download={documento.arquivoNome}>Baixar PDF <Download size={14} aria-hidden="true" /></a>
            </div>}
          </section>
          <div className="analise-documento-lateral">
            <section className="analise-documento-cartao" aria-labelledby="solicitacao-documento-titulo">
              <div className="analise-documento-cartao-topo">
                <h3 id="solicitacao-documento-titulo">Dados da solicitação</h3>
                <StatusBadge status={documento.status} variante={documento.status === 'Expirado' ? 'vermelho' : documento.status === 'Correção solicitada' ? 'ambar' : undefined} />
              </div>
              <dl>{[
                ['Aluno', documento.aluno], ['Matrícula', documento.matricula], ['Curso', documento.curso],
                ['Empresa', documento.empresa], ['Tipo', documento.nome], ['Data de envio', documento.data],
              ].map(([rotulo, valor]) => <div key={rotulo}><dt>{rotulo}:</dt><dd>{valor}</dd></div>)}</dl>
            </section>
            <section className="analise-documento-cartao" aria-labelledby="historico-documento-titulo">
              <h3 id="historico-documento-titulo">Histórico de revisões</h3>
              <ol className="analise-documento-historico">{documento.historico.map((revisao, indice) => <li key={`${revisao.data}-${indice}`}>
                <div><strong>{revisao.autor}</strong><span>{revisao.data}</span></div>
                <h4>{revisao.acao}</h4><p>{revisao.observacoes}</p>
                {revisao.assinaturaDirecao && <p className="analise-documento-registro"><PenLine size={13} aria-hidden="true" /> Assinatura registrada por {revisao.assinaturaDirecao.autor}.</p>}
                {revisao.notificacao && <details className="analise-documento-notificacao"><summary>Notificação simulada para {revisao.notificacao.destinatario}</summary>
                  <p>{revisao.notificacao.assunto}</p>
                  <ul>{revisao.notificacao.itens.map((item) => <li key={item}>{item}</li>)}</ul>
                  <p>{revisao.notificacao.observacoes}</p>
                </details>}
              </li>)}</ol>
            </section>
            {!visualizacao && <section className="analise-documento-cartao" aria-labelledby="avaliacao-documento-titulo">
              <h3 id="avaliacao-documento-titulo">Avaliação do documento</h3>
              {erro && <Alert variant="danger" role="alert">{erro}</Alert>}
              <Form.Group controlId="observacoes-documento">
                <Form.Label>Observações / motivo de rejeição</Form.Label>
                <Form.Control as="textarea" rows={4} maxLength={2000} value={observacoes} onChange={(evento) => { setObservacoes(evento.target.value); setErro(''); }}
                  placeholder="Descreva sua avaliação ou as correções necessárias..." aria-describedby="observacoes-documento-ajuda" />
                <Form.Text id="observacoes-documento-ajuda">Obrigatório para solicitar correção ou indeferir.</Form.Text>
              </Form.Group>
              <div className="analise-documento-decisoes">
                <button type="button" className="analise-documento-aprovar" title="Aprovar, homologar e registrar assinatura da Direção" onClick={() => avaliar('aprovar')} disabled={documento.status === 'Deferido'}>Aprovar / assinar</button>
                <button type="button" className="analise-documento-corrigir" onClick={() => { setErro(''); setDevolvendo(true); }}>Solicitar correção</button>
                <button type="button" className="analise-documento-rejeitar" onClick={() => avaliar('rejeitar')} disabled={documento.status === 'Indeferido'}>Rejeitar / indeferir</button>
              </div>
            </section>}
          </div>
        </div>}
      </Modal.Body>
      <Modal.Footer><Botao tipo="botao-acao-contorno" onClick={aoFechar}>Fechar</Botao></Modal.Footer>
    </Modal>
  );
}
