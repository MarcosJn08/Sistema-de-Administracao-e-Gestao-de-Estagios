import "./Documento.css";
import HeaderCadastro from "../../components/cadastro/HeaderCadastro.jsx";
import TituloCadastro from "../../components/cadastro/TituloCadastro.jsx";
import DocumentoToolbar from "../../components/cadastro/DocumentoToolbar.jsx";
import Botao from "../../components/Button.jsx";
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
        <TituloCadastro
          icone="bi bi-buildings-fill"
          titulo="Cadastro de Empresa"
          subtitulo="etapa 2 de 2 - enviar documento"
          subtituloStyle={{ alignItems: "center" }}
        />

        <section className="documento-card">
          <DocumentoToolbar />

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

        <div className="area-botao-documento">
          <Botao texto="Próximo" tipo="botao-com-fundo" href="/sage/cadastro/confirmacao">
            <i className="bi bi-chevron-right"></i>
          </Botao>
        </div>
      </main>
    </div>
  );
}

export default Documento;
