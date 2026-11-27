import TabelaDocumentos from '../TabelaDocumentos.jsx';
import StatusBadge from '../StatusBadge.jsx';
import BotaoAcao from '../BotaoAcao.jsx';

function CardDocumentos({
  documentos = [],
  aoClicarAcao,
  onActionClick,
  titulo = 'Documentos',
  somenteLeitura = false,
  exibirData = false,
  acoesSomenteIcones = false,
}) {
  const lidarComAcao = aoClicarAcao || onActionClick;
  const totalColunas = 4 + Number(exibirData) + Number(!somenteLeitura);

  return (
    <div className="cartao-sage">
      <h2 className="cartao-sage-titulo">{titulo}</h2>

      <TabelaDocumentos rotulo="Documentos do estágio, role horizontalmente para ver todas as colunas" legenda="Documentos vinculados ao estágio selecionado">
        <thead>
          <tr>
            <th scope="col" style={{ width: '50px' }}>ID</th>
            <th scope="col" style={{ width: '20%' }}>Documento</th>
            <th scope="col" style={{ width: '28%' }}>Descrição</th>
            <th scope="col" style={{ width: '18%' }}>Status</th>
            {exibirData && <th scope="col">Data</th>}
            {!somenteLeitura && <th scope="col" className="text-center" style={{ minWidth: acoesSomenteIcones ? '100px' : '230px' }}>Ações</th>}
          </tr>
        </thead>
        <tbody>
          {documentos.length === 0 && <tr>
            <td colSpan={totalColunas} className="text-center text-secondary py-4">Nenhum documento ou relatório registrado.</td>
          </tr>}
          {documentos.map((doc) => <tr key={doc.id}>
            <td className="fw-bold text-dark">{doc.id}</td>
            <td className="fw-bold text-dark">{doc.nome}</td>
            <td className="text-secondary">{doc.descricao}</td>
            <td><StatusBadge status={doc.status} /></td>
            {exibirData && <td className="text-nowrap">{doc.data || 'Não informada'}</td>}
            {!somenteLeitura && <td>
              <div className={`d-flex flex-nowrap gap-2 align-items-center ${acoesSomenteIcones ? 'justify-content-center' : ''}`}>
                {doc.acoes?.map((acao) => <BotaoAcao key={`${doc.id}-${acao}`} tipo={acao}
                  somenteIcone={acoesSomenteIcones} ariaLabel={`${acao}: ${doc.nome}`}
                  aoClicar={() => lidarComAcao && lidarComAcao(doc, acao)} />)}
              </div>
            </td>}
          </tr>)}
        </tbody>
      </TabelaDocumentos>
    </div>
  );
}

export default CardDocumentos;
