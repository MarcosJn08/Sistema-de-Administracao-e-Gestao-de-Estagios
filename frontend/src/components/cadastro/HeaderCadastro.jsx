import "./HeaderCadastro.css";
import { Container } from "react-bootstrap";

function HeaderCadastro({ passo01, passo02 }) {
  return (
    <Container fluid className="header-cadastro">
      <div className={passo01}>
        <div className="numero-passo">
          <p>1</p>
        </div>
        <span>Inserir Dados</span>
      </div>

      <hr />

      <div className={passo02}>
        <div className="numero-passo">
          <p>2</p>
        </div>
        <span>Documento</span>
      </div>

    </Container>
  );
}

export default HeaderCadastro;