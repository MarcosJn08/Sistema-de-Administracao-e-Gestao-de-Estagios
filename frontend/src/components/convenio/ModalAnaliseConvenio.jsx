import { useState } from 'react';
import { Modal } from 'react-bootstrap';
import { Building2, CalendarDays, Check, CheckCircle2, FileText, Info, Mail, RotateCcw, ShieldAlert, SquarePen, X, XCircle } from 'lucide-react';
import StatusBadge from '../StatusBadge.jsx';
import Botao from '../Button.jsx';
import DevolucaoParaAjustes from '../DevolucaoParaAjustes.jsx';
import { pendenciasConvenio } from '../../utils/devolucao.js';
import { calcularVigenciaCincoAnos } from '../../utils/convenio.js';
import './ModalAnaliseConvenio.css';

function ModalAnaliseConvenio({ aberto, convenio, aoDecidir, aoFechar }) {
  const [decisao, setDecisao] = useState(null);
  const [observacoes, setObservacoes] = useState('');
  const [documentoAberto, setDocumentoAberto] = useState(null);
  const [erro, setErro] = useState('');
  if (!convenio) return null;
  const vigenciaAutomatica = calcularVigenciaCincoAnos();

  const confirmarReprovacao = () => {
    if (!observacoes.trim()) { setErro('Informe o motivo da reprovação.'); return; }
    aoDecidir('reprovar', { observacoes: observacoes.trim() });
    aoFechar();
  };

  return (
    <Modal show={aberto} onHide={aoFechar} centered scrollable size="xl" className="modal-analise-convenio"
      aria-labelledby="modal-analise-convenio-titulo">
      <Modal.Header closeButton closeLabel="Fechar">
        <div className="analise-convenio-cabecalho">
          <div className="analise-convenio-titulo">
            <Modal.Title as="h2" id="modal-analise-convenio-titulo">Análise de proposta de convênio</Modal.Title>
            <StatusBadge status={convenio.status} variante={convenio.status === 'Ajustes solicitados' ? 'ambar' : 'azul'} />
          </div>
          <p>Confira os dados e os documentos fornecidos pela concedente e selecione uma das três decisões disponíveis.</p>
        </div>
      </Modal.Header>
      <Modal.Body>
        <div className="analise-convenio-grid">
          <section className="analise-convenio-cartao" aria-labelledby="dados-proponente-titulo">
            <h3 id="dados-proponente-titulo"><Building2 size={18} aria-hidden="true" /> Dados do proponente</h3>
            <dl className="analise-convenio-dados">
              <div><dt>CNPJ/CPF</dt><dd>{convenio.documento}</dd></div>
              <div><dt>Razão social</dt><dd>{convenio.razaoSocial}</dd></div>
              <div><dt>Tipo de organização</dt><dd>{convenio.tipo}</dd></div>
              <div><dt>Representante legal</dt><dd>{convenio.representante}</dd></div>
              <div><dt>E-mail de contato</dt><dd>{convenio.email}</dd></div>
              <div><dt>Telefone</dt><dd>{convenio.telefone}</dd></div>
              <div><dt>Endereço principal</dt><dd>{convenio.endereco}</dd></div>
              <div><dt>Área de atuação</dt><dd>{convenio.area}</dd></div>
              <div><dt>Data de submissão</dt><dd>{convenio.submetidoEm || convenio.inicio}</dd></div>
            </dl>
          </section>

          <section className="analise-convenio-cartao" aria-labelledby="documentos-convenio-titulo">
            <h3 id="documentos-convenio-titulo"><FileText size={18} aria-hidden="true" /> Documentos anexados</h3>
            <ul className="analise-convenio-documentos">
              {convenio.documentos?.map((documento) => <li key={documento.id}>
                <FileText size={16} className="analise-convenio-documento-icone" aria-hidden="true" />
                <button type="button" onClick={() => setDocumentoAberto(documentoAberto === documento.id ? null : documento.id)}>
                  <strong>{documento.nome}</strong><span>{documento.detalhe}</span>
                </button>
                <CheckCircle2 size={16} className="text-success" aria-label={documento.status} />
                {documentoAberto === documento.id && <p>Arquivo recebido e disponível para conferência pela Direção.</p>}
              </li>)}
            </ul>
          </section>
        </div>

        {!decisao && <section className="analise-convenio-decisoes" aria-labelledby="decisao-diretor-titulo">
          <h3 id="decisao-diretor-titulo">Decisão do diretor</h3>
          <div className="analise-convenio-decisoes-grid">
            <div className="analise-convenio-decisao analise-convenio-aprovar">
              <div className="analise-convenio-decisao-titulo"><span className="analise-convenio-decisao-icone"><CheckCircle2 size={18} aria-hidden="true" /></span><h4>Aprovar (homologar)</h4></div>
              <p className="analise-convenio-decisao-descricao">Homologa a proposta e ativa o convênio com a concedente.</p>
              <ul className="analise-convenio-decisao-informacoes">
                <li><CalendarDays size={14} aria-hidden="true" /><p><strong>Vigência automática:</strong> De {vigenciaAutomatica.inicio} a {vigenciaAutomatica.vencimento}.</p></li>
                <li><Mail size={14} aria-hidden="true" /><p><strong>Notificação:</strong> Boas-vindas e orientações de acesso ao painel da empresa.</p></li>
              </ul>
              <button type="button" onClick={() => { aoDecidir('aprovar', {}); aoFechar(); }}><Check size={15} aria-hidden="true" /> Aprovar proposta</button>
            </div>
            <div className="analise-convenio-decisao analise-convenio-reprovar">
              <div className="analise-convenio-decisao-titulo"><span className="analise-convenio-decisao-icone"><XCircle size={18} aria-hidden="true" /></span><h4>Reprovar definitivamente</h4></div>
              <p className="analise-convenio-decisao-descricao">Para propostas que não atendem aos requisitos. Registra a recusa formal da parceria.</p>
              <ul className="analise-convenio-decisao-informacoes">
                <li><ShieldAlert size={14} aria-hidden="true" /><p><strong>Registro obrigatório:</strong> O motivo do indeferimento deve ser preenchido.</p></li>
                <li><Mail size={14} aria-hidden="true" /><p><strong>Notificação:</strong> Justificativa da recusa vinculada ao CNPJ/CPF da concedente.</p></li>
              </ul>
              <button type="button" onClick={() => { setDecisao('reprovar'); setObservacoes(''); setErro(''); }}><X size={15} aria-hidden="true" /> Reprovar proposta</button>
            </div>
            <div className="analise-convenio-decisao analise-convenio-devolver">
              <div className="analise-convenio-decisao-titulo"><span className="analise-convenio-decisao-icone"><RotateCcw size={18} aria-hidden="true" /></span><h4>Devolver para ajustes</h4></div>
              <p className="analise-convenio-decisao-descricao">Para propostas com dados incompletos ou documentação insuficiente.</p>
              <ul className="analise-convenio-decisao-informacoes">
                <li><SquarePen size={14} aria-hidden="true" /><p><strong>Observações:</strong> Campo para o diretor indicar os ajustes necessários.</p></li>
                <li><Mail size={14} aria-hidden="true" /><p><strong>Notificação:</strong> Prévia do e-mail com as pendências e instruções para correção.</p></li>
              </ul>
              <button type="button" onClick={() => { setDecisao('devolver'); setObservacoes(''); setErro(''); }}><RotateCcw size={15} aria-hidden="true" /> Devolver para ajustes</button>
            </div>
          </div>
        </section>}

        {!decisao && <p className="analise-convenio-regras"><Info size={15} aria-hidden="true" /> Regras aplicáveis: Lei Nº 11.788/2008 · RN11 (vigência temporal) · RF21 (notificação automatizada) · RF12 (homologação)</p>}

        {decisao === 'reprovar' && <section className="analise-convenio-cartao analise-convenio-form-decisao">
          <h3>Reprovação da proposta</h3>
          {erro && <p className="analise-convenio-erro" role="alert">{erro}</p>}
          <label>Motivo obrigatório<textarea rows={4} value={observacoes} onChange={(evento) => setObservacoes(evento.target.value)}
            placeholder="Descreva o motivo legal ou administrativo da reprovação." /></label>
          <div className="analise-convenio-acoes">
            <button type="button" className="analise-botao-perigo" onClick={confirmarReprovacao}>Confirmar reprovação</button>
            <button type="button" className="analise-botao-neutro" onClick={() => setDecisao(null)}>Cancelar</button>
          </div>
        </section>}

        {decisao === 'devolver' && <div className="mt-4"><DevolucaoParaAjustes
          resumo={[[ 'Razão social', convenio.razaoSocial ], [ 'CNPJ/CPF', convenio.documento ], [ 'Representante legal', convenio.representante ], [ 'Submetido em', convenio.submetidoEm || convenio.inicio ]]}
          status={convenio.status} opcoes={pendenciasConvenio} email={convenio.email} responsavel={convenio.representante}
          referencia="Proposta de convênio" aoCancelar={() => setDecisao(null)}
          aoConfirmar={(dados) => { aoDecidir('devolver', dados); aoFechar(); }}
        /></div>}
      </Modal.Body>
      <Modal.Footer><Botao tipo="botao-acao-contorno" onClick={aoFechar}>Fechar</Botao></Modal.Footer>
    </Modal>
  );
}

export default ModalAnaliseConvenio;
