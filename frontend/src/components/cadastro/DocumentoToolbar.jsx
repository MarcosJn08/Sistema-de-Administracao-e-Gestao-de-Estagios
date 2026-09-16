import React from 'react';

function DocumentoToolbar({
  paginaAtual = 1,
  totalPaginas = 1,
  zoom = '100%',
  onPaginaAnterior,
  onProximaPagina,
  onDiminuirZoom,
  onAumentarZoom,
  onDownload,
  onImprimir,
}) {
  return (
    <div className="documento-toolbar">
      <div className="toolbar-esquerda">
        <button type="button" className="botao-ferramenta" onClick={onPaginaAnterior}>
          <i className="bi bi-chevron-left"></i>
        </button>

        <span>{paginaAtual} / {totalPaginas}</span>

        <button type="button" className="botao-ferramenta" onClick={onProximaPagina}>
          <i className="bi bi-chevron-right"></i>
        </button>

        <span className="zoom-text">{zoom}</span>

        <button type="button" className="botao-ferramenta" onClick={onDiminuirZoom}>
          <i className="bi bi-dash"></i>
        </button>

        <button type="button" className="botao-ferramenta" onClick={onAumentarZoom}>
          <i className="bi bi-plus"></i>
        </button>
      </div>

      <div className="toolbar-direita">
        <button type="button" className="botao-ferramenta" onClick={onDownload}>
          <i className="bi bi-download"></i>
        </button>

        <button type="button" className="botao-ferramenta" onClick={onImprimir}>
          <i className="bi bi-printer"></i>
        </button>
      </div>
    </div>
  );
}

export default DocumentoToolbar;
