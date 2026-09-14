import "./Documento.css";

import HeaderCadastro from "../../components/HeaderCadastro/HeaderCadastro.jsx";
import Botao from "../../components/Button/Button.jsx";
import Form from "react-bootstrap/Form";

function Documento() {
  return (
    <div className="documento-page">
      <HeaderCadastro
        passo01="passo-concluido"
        passo02="passo-concluido"
        passo03="proximo-passo"
      />

      <main className="documento-content">
        {/* Título */}
        <div className="titulo-cadastro">
          <div className="icone-empresa">
            <i className="bi bi-buildings-fill"></i>
          </div>

          <div>
            <h1>Cadastro de Empresa</h1>
            <p style={{ alignItems: "center" }}>
              etapa 2 de 2 - enviar documento
            </p>
          </div>
        </div>

        {/* Área do documento */}
        <section className="documento-card">
          {/* Barra superior */}
          <div className="documento-toolbar">
            <div className="toolbar-esquerda">
              <button className="botao-ferramenta">
                <i className="bi bi-chevron-left"></i>
              </button>

              <span>1 / 1</span>

              <button className="botao-ferramenta">
                <i className="bi bi-chevron-right"></i>
              </button>

              <span className="zoom-text">100%</span>

              <button className="botao-ferramenta">
                <i className="bi bi-dash"></i>
              </button>

              <button className="botao-ferramenta">
                <i className="bi bi-plus"></i>
              </button>
            </div>

            <div className="toolbar-direita">
              <button className="botao-ferramenta">
                <i className="bi bi-download"></i>
              </button>

              <button className="botao-ferramenta">
                <i className="bi bi-printer"></i>
              </button>
            </div>
          </div>

          {/* Visualização */}
          <div className="documento-preview">
            <div className="documento-folha">
              <div className="preview-mensagem">
                <div className="preview-icone">
                  <i className="bi bi-file-earmark-text"></i>
                </div>

                <strong>Pré-visualização do documento</strong>

                <span>O documento será exibido aqui após o preenchimento.</span>
              </div>
            </div>
          </div>

          {/* Ações */}
          <div className="documento-acoes">
            <div className="botoes-documento">
              <Botao texto="Baixar PDF" tipo="botao-sem-fundo-verde">
                <i className="bi bi-download"></i>
              </Botao>

              <Botao texto="Assinar" tipo="botao-com-fundo">
                <i className="bi bi-pen"></i>
              </Botao>
            </div>

            <Form.Group controlId="formFile" className="mb-3">
              <Form.Label>Default file input example</Form.Label>
              <Form.Control type="file" />
            </Form.Group>
          </div>
        </section>

        {/* Próximo */}
        <div className="area-botao-documento">
          <Botao texto="Próximo" tipo="botao-com-fundo">
            <i className="bi bi-chevron-right"></i>
          </Botao>
        </div>
      </main>
    </div>
  );
}

export default Documento;
