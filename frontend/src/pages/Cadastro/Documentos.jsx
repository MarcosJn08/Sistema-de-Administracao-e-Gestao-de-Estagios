import { useEffect, useRef, useState } from 'react';
import { Form } from 'react-bootstrap';
import { CheckCircle2, Download, Eye, FileCheck2, FileUp, RotateCcw, Upload } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import "./Documento.css";
import HeaderCadastro from "../../components/cadastro/HeaderCadastro.jsx";
import TituloCadastro from "../../components/cadastro/TituloCadastro.jsx";
import Botao from "../../components/Button.jsx";
import StatusBadge from '../../components/StatusBadge.jsx';
import Footer from "../../components/Footer.jsx";
import { formatarTamanhoArquivo, validarDocumentoCadastro } from '../../utils/cadastroEmpresa.js';

const CHAVE_DOCUMENTO = 'sage-cadastro-documento';

function Documentos() {
  const navigate = useNavigate();
  const inputArquivo = useRef(null);
  const urlArquivoAtual = useRef('');
  const [arquivo, setArquivo] = useState(null);
  const [urlArquivo, setUrlArquivo] = useState('');
  const [declaracaoAceita, setDeclaracaoAceita] = useState(false);
  const [erroArquivo, setErroArquivo] = useState('');
  const [erroDeclaracao, setErroDeclaracao] = useState('');
  const [arrastando, setArrastando] = useState(false);

  useEffect(() => () => {
    if (urlArquivoAtual.current) URL.revokeObjectURL(urlArquivoAtual.current);
  }, []);

  const selecionarArquivo = (novoArquivo) => {
    const erro = validarDocumentoCadastro(novoArquivo);
    setErroArquivo(erro);
    if (erro) {
      if (urlArquivoAtual.current) URL.revokeObjectURL(urlArquivoAtual.current);
      urlArquivoAtual.current = '';
      setUrlArquivo('');
      setArquivo(null);
      if (inputArquivo.current) inputArquivo.current.value = '';
      return;
    }
    if (urlArquivoAtual.current) URL.revokeObjectURL(urlArquivoAtual.current);
    const novaUrl = URL.createObjectURL(novoArquivo);
    urlArquivoAtual.current = novaUrl;
    setUrlArquivo(novaUrl);
    setArquivo(novoArquivo);
  };

  const concluir = () => {
    const erro = validarDocumentoCadastro(arquivo);
    setErroArquivo(erro);
    setErroDeclaracao(declaracaoAceita ? '' : 'Confirme a declaração antes de concluir.');
    if (erro || !declaracaoAceita) return;
    sessionStorage.setItem(CHAVE_DOCUMENTO, JSON.stringify({
      nome: arquivo.name,
      tamanho: arquivo.size,
      tipo: arquivo.type,
      pedido: `#${Date.now().toString().slice(-9)}`,
      enviadoEm: new Date().toISOString(),
    }));
    navigate('/sage/cadastro/confirmacao');
  };

  return (
    <div className="documento-page d-flex flex-column min-vh-100">
      <HeaderCadastro passo01="passo-concluido" passo02="passo-concluido" />
      <main className="documento-content flex-grow-1">
        <TituloCadastro icone="bi bi-file-earmark-check-fill" titulo="Cadastro de Empresa"
          subtitulo="Etapa 2 de 2 — envie o documento comprobatório" />

        <section className="documento-card" aria-labelledby="envio-documento-titulo">
          <div className="documento-card-cabecalho">
            <div className="documento-card-icone"><FileCheck2 size={24} aria-hidden="true" /></div>
            <div>
              <h2 id="envio-documento-titulo">Documento da empresa</h2>
              <p>Envie o contrato social, requerimento de empresário ou documento equivalente.</p>
            </div>
            <StatusBadge status={arquivo ? 'Pronto para envio' : 'Pendente'} variante={arquivo ? 'verde' : 'ambar'} />
          </div>

          {!arquivo ? (
            <label className={`documento-upload${arrastando ? ' documento-upload-ativo' : ''}${erroArquivo ? ' documento-upload-invalido' : ''}`}
              onDragEnter={(evento) => { evento.preventDefault(); setArrastando(true); }}
              onDragOver={(evento) => evento.preventDefault()}
              onDragLeave={(evento) => { evento.preventDefault(); setArrastando(false); }}
              onDrop={(evento) => { evento.preventDefault(); setArrastando(false); selecionarArquivo(evento.dataTransfer.files?.[0]); }}>
              <input ref={inputArquivo} type="file" accept="application/pdf,.pdf" className="visually-hidden"
                onChange={(evento) => selecionarArquivo(evento.target.files?.[0])}
                aria-describedby={`documento-upload-ajuda${erroArquivo ? ' documento-upload-erro' : ''}`} />
              <span className="documento-upload-icone"><FileUp size={30} aria-hidden="true" /></span>
              <strong>Arraste o PDF aqui ou clique para selecionar</strong>
              <span id="documento-upload-ajuda">Somente PDF, com tamanho máximo de 10 MB.</span>
              <span className="documento-upload-botao"><Upload size={16} aria-hidden="true" /> Selecionar PDF</span>
            </label>
          ) : (
            <div className="documento-selecionado">
              <div className="documento-arquivo-resumo">
                <span className="documento-arquivo-icone"><FileCheck2 size={25} aria-hidden="true" /></span>
                <div>
                  <strong>{arquivo.name}</strong>
                  <span>PDF · {formatarTamanhoArquivo(arquivo.size)}</span>
                </div>
                <CheckCircle2 className="documento-arquivo-check" size={22} aria-label="Arquivo válido" />
              </div>
              <div className="documento-preview">
                <iframe src={urlArquivo} title={`Pré-visualização de ${arquivo.name}`} />
              </div>
              <div className="documento-acoes">
                <div className="botoes-documento">
                  <Botao tipo="botao-sem-fundo-verde" href={urlArquivo} target="_blank" rel="noopener noreferrer">
                    <Eye size={17} aria-hidden="true" /> Abrir PDF
                  </Botao>
                  <Botao tipo="botao-acao-contorno" href={urlArquivo} download={arquivo.name}>
                    <Download size={17} aria-hidden="true" /> Baixar
                  </Botao>
                </div>
                <Botao tipo="botao-acao-contorno" onClick={() => inputArquivo.current?.click()}>
                  <RotateCcw size={16} aria-hidden="true" /> Substituir arquivo
                </Botao>
                <input ref={inputArquivo} type="file" accept="application/pdf,.pdf" className="visually-hidden"
                  onChange={(evento) => selecionarArquivo(evento.target.files?.[0])} />
              </div>
            </div>
          )}
          {erroArquivo && <p id="documento-upload-erro" className="documento-erro" role="alert">{erroArquivo}</p>}

          <div className={`documento-declaracao${erroDeclaracao ? ' documento-declaracao-invalida' : ''}`}>
            <Form.Check id="declaracao-documento" checked={declaracaoAceita}
              onChange={(evento) => { setDeclaracaoAceita(evento.target.checked); setErroDeclaracao(''); }}
              label="Declaro que o documento enviado é autêntico, legível e corresponde à empresa cadastrada." />
            {erroDeclaracao && <p className="documento-erro" role="alert">{erroDeclaracao}</p>}
          </div>
        </section>

        <div className="area-botao-documento">
          <Botao tipo="botao-acao-contorno" onClick={() => navigate('/sage/cadastro/empresa')}>Voltar</Botao>
          <Botao tipo="botao-com-fundo" onClick={concluir}><CheckCircle2 size={17} aria-hidden="true" /> Concluir cadastro</Botao>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default Documentos;
