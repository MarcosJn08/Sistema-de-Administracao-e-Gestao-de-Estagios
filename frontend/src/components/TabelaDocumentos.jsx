import '../App.css';

function TabelaDocumentos({ rotulo, legenda, children }) {
  return (
    <div className="tabela-sage-container" tabIndex={0} role="region" aria-label={rotulo}>
      <table className="tabela-sage">
        <caption className="visually-hidden">{legenda}</caption>
        {children}
      </table>
    </div>
  );
}

export default TabelaDocumentos;
