import "./HeaderCadastro.css";
import { Container } from "react-bootstrap";

function Header({ passo01, passo02, passo03 }) {
  return (
    <Container fluid className="header-cadastro">

      <div className={passo01}>
        <p>1</p>
        <hr />
      </div>

      <div className={passo02}>
        <p>2</p>
        <hr />
      </div>

      <div className={passo03}>
        <p>3</p>
      </div>

    </Container>
  );
}

export default Header;