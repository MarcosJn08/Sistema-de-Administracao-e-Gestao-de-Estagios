import './Paginacao.css';

function obterPaginasVisiveis(paginaAtual, totalPaginas) {
  const paginas = [...new Set([1, paginaAtual - 1, paginaAtual, paginaAtual + 1, totalPaginas]
    .filter((pagina) => pagina >= 1 && pagina <= totalPaginas))].sort((a, b) => a - b);

  return paginas.flatMap((pagina, indice) => {
    const anterior = paginas[indice - 1];
    return indice > 0 && pagina - anterior > 1 ? [`intervalo-${anterior}`, pagina] : [pagina];
  });
}

function Paginacao({ paginaAtual, totalPaginas, aoMudarPagina, textoResumo }) {
  const paginasVisiveis = obterPaginasVisiveis(paginaAtual, totalPaginas);

  return (
    <div className="paginacao-sage">
      <span className="paginacao-sage-resumo" role="status">{textoResumo}</span>

      <nav className="paginacao-sage-controles" aria-label="Paginação">
        <button type="button" className="paginacao-sage-botao" disabled={paginaAtual === 1}
          onClick={() => aoMudarPagina(Math.max(1, paginaAtual - 1))}>
          Anterior
        </button>

        {paginasVisiveis.map((item) => typeof item === 'string' ? (
          <span key={item} className="paginacao-sage-intervalo" aria-hidden="true">…</span>
        ) : (
          <button key={item} type="button"
            className={`paginacao-sage-numero${item === paginaAtual ? ' paginacao-sage-numero-ativo' : ''}`}
            onClick={() => aoMudarPagina(item)} aria-current={item === paginaAtual ? 'page' : undefined}
            aria-label={`Ir para a página ${item}`}>
            {item}
          </button>
        ))}

        <button type="button" className="paginacao-sage-botao" disabled={paginaAtual >= totalPaginas}
          onClick={() => aoMudarPagina(Math.min(totalPaginas, paginaAtual + 1))}>
          Próxima
        </button>
      </nav>
    </div>
  );
}

export default Paginacao;
