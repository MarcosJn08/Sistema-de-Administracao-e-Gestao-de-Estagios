import React from 'react';

function TituloCadastro({
  icone = 'bi bi-buildings-fill',
  titulo = 'Cadastro de Empresa',
  subtitulo,
  subtituloStyle,
}) {
  return (
    <div className="titulo-cadastro">
      <div className="icone-empresa">
        <i className={icone}></i>
      </div>
      <div>
        <h1>{titulo}</h1>
        {subtitulo && <p style={subtituloStyle}>{subtitulo}</p>}
      </div>
    </div>
  );
}

export default TituloCadastro;
