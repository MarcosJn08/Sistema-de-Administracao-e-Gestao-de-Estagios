import { useEffect, useState } from 'react';
import { Alert, Modal } from 'react-bootstrap';
import CardDocumentos from '../aluno/CardDocumentos.jsx';
import api from '../../services/api.js';

const status = {
  EM_ANALISE: 'Enviado ao diretor · Em análise',
  DEFERIDO: 'Aprovado',
  NECESSITA_AJUSTES: 'Devolvido para correção',
  PENDENTE: 'Pronto para envio',
  EXPIRADO: 'Expirado',
};

export default function DocumentosEstagio({ estagioId, outrosDocumentos = [], aoBaixarOutro }) {
  const base = `/estagios/${estagioId}`;
  const [lista, setLista] = useState([]);
  const [erro, setErro] = useState('');
  const [ocupado, setOcupado] = useState(false);
  const [anexo, setAnexo] = useState(null);
  const [editor, setEditor] = useState(null);
  const [previa, setPrevia] = useState('');
  const [versao, setVersao] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    api.get(`${base}/catalogo-documentos`, { signal: controller.signal })
      .then(({ data }) => setLista(data.data))
      .catch((error) => { if (!controller.signal.aborted) setErro(error.message); });
    return () => controller.abort();
  }, [base, versao]);

  useEffect(() => () => { if (previa) URL.revokeObjectURL(previa); }, [previa]);

  async function executar(acao) {
    setOcupado(true);
    setErro('');
    try {
      await acao();
    } catch (error) {
      setErro(Object.values(error.errors || {}).flat().join(' ') || error.message);
    } finally {
      setOcupado(false);
    }
  }

  const modelo = (item) => `${base}/modelos-documentos/${item.tipo}`;
  const atualizar = () => setVersao((atual) => atual + 1);

  async function abrirPdf(item, acao) {
    const url = acao === 'versao'
      ? `${base}/documentos/${item.documento.id}/download`
      : `${modelo(item)}?pdf=1`;
    const { data } = await api.get(url, { responseType: 'blob' });
    const objeto = URL.createObjectURL(data);
    if (acao !== 'baixar') {
      setPrevia(objeto);
      return;
    }
    const link = document.createElement('a');
    link.href = objeto;
    link.download = `${item.tipo.toLowerCase()}.pdf`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(objeto), 1000);
  }

  async function editar(item) {
    const { data } = await api.get(modelo(item));
    setEditor({ item, campos: data.data.filter((campo) => campo.editavel), alteracoes: {} });
  }

  async function salvar(evento) {
    evento.preventDefault();
    await executar(async () => {
      if (Object.keys(editor.alteracoes).length) {
        await api.patch(modelo(editor.item), { campos: editor.alteracoes });
      }
      setEditor(null);
      atualizar();
    });
  }

  const linhas = lista.map((item) => ({
    id: item.documento?.id ?? item.tipo,
    nome: item.nome,
    descricao: item.documento?.observacoes || (!item.editavel && !item.documento && item.tipo === 'AVALIACAO_ALUNO'
      ? 'Preenchimento disponível após cumprir a carga horária obrigatória.'
      : 'Documento vinculado ao estágio.'),
    status: status[item.documento?.status] || 'Pendente de preenchimento',
    data: item.documento?.created_at && new Date(item.documento.created_at).toLocaleDateString('pt-BR'),
    acoes: ['Visualizar minuta', 'Baixar PDF',
      ...(item.documento ? ['Visualizar anexo'] : []),
      ...(item.editavel ? ['Preencher campos', 'Anexar arquivo PDF'] : []),
      ...(item.editavel && item.documento?.status === 'PENDENTE' ? ['Enviar ao diretor'] : [])],
    item,
  }));

  function acionar(linha, acao) {
    if (ocupado) return;
    const { item } = linha;
    if (!item) return aoBaixarOutro?.(linha);
    executar(async () => {
      switch (acao) {
        case 'Preencher campos': await editar(item); break;
        case 'Anexar arquivo PDF': setAnexo(item); break;
        case 'Enviar ao diretor':
          await api.post(`${base}/documentos/${item.documento.id}/encaminhar`);
          atualizar();
          break;
        case 'Visualizar anexo': await abrirPdf(item, 'versao'); break;
        case 'Baixar PDF': await abrirPdf(item, 'baixar'); break;
        default: await abrirPdf(item, 'ver');
      }
    });
  }

  return <>
    {erro && !editor && !anexo && <Alert variant="danger">{erro}</Alert>}
    <CardDocumentos titulo="Documentos do estágio" documentos={[...linhas, ...outrosDocumentos]}
      exibirData acoesSomenteIcones aoClicarAcao={acionar} />
    {anexo && <Modal show onHide={() => setAnexo(null)} centered>
      <Modal.Header closeButton><Modal.Title>Anexar PDF</Modal.Title></Modal.Header>
      <Modal.Body>
        {erro && <Alert variant="danger">{erro}</Alert>}
        <form onSubmit={(evento) => {
          evento.preventDefault();
          const dados = new FormData(evento.currentTarget);
          dados.append('tipo', anexo.tipo);
          executar(async () => {
            await api.post(`${base}/documentos/arquivo`, dados);
            setAnexo(null);
            atualizar();
          });
        }}>
          <label className="d-block mb-3">{anexo.nome}
            <input name="arquivo" className="form-control" type="file" accept="application/pdf,.pdf" required />
          </label>
          <button type="submit" className="btn btn-success" disabled={ocupado}>Salvar arquivo</button>
        </form>
      </Modal.Body>
    </Modal>}
    {editor && <Modal show onHide={() => setEditor(null)} scrollable centered>
      <Modal.Header closeButton><Modal.Title>{editor.item.nome}</Modal.Title></Modal.Header>
      <Modal.Body>
        {erro && <Alert variant="danger">{erro}</Alert>}
        <form id="campos-documento-estagio" onSubmit={salvar}>
          {!editor.campos.length && <p>Todos os campos disponíveis já estão preenchidos.</p>}
          {editor.campos.map((campo) => {
            const props = {
              value: editor.alteracoes[campo.rotulo] ?? campo.valor ?? '',
              onChange: (evento) => {
                const valor = evento.target.value;
                setEditor((atual) => ({ ...atual, alteracoes: { ...atual.alteracoes, [campo.rotulo]: valor } }));
              },
            };
            return <label className="d-block mb-3" key={campo.rotulo}>{campo.rotulo}
              {campo.opcoes.length ? <select className="form-select" {...props}>
                <option value="">Selecione</option>
                {campo.opcoes.map((opcao) => <option key={opcao}>{opcao}</option>)}
              </select> : campo.percentual ? <input className="form-control" type="number" min="0" max="100" {...props} />
                : <textarea className="form-control" rows={2} maxLength={2000} {...props} />}
            </label>;
          })}
        </form>
      </Modal.Body>
      <Modal.Footer><button className="btn btn-success" form="campos-documento-estagio" disabled={ocupado}>Salvar</button></Modal.Footer>
    </Modal>}
    <Modal show={Boolean(previa)} onHide={() => setPrevia('')} size="xl" centered>
      <Modal.Header closeButton><Modal.Title>Visualizar documento</Modal.Title></Modal.Header>
      <Modal.Body>{previa && <iframe title="Documento de estágio em PDF" className="w-100 border-0" style={{ height: '70vh' }} src={previa} />}</Modal.Body>
    </Modal>
  </>;
}
