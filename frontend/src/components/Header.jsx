import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import Offcanvas from "react-bootstrap/Offcanvas";
import Image from "react-bootstrap/Image";

import "../App.css";
import Button from "./Button/Button.jsx";
import LogoBranca from "../assets/LogoBranca.png";

function Header({
  pagina01,
  pagina02,
  pagina03,
  pagina04,
  pagina05,
  pagina06,
}) {
  return (
    <Navbar expand="md" className="dark-green header">
      <Container fluid>
        <Navbar.Brand href="#">
          <Image src={LogoBranca} className="logo" />
        </Navbar.Brand>

        <Navbar.Toggle
          aria-controls="offcanvasNavbar"
          className="primary-green"
        />

        <Navbar.Offcanvas id="offcanvasNavbar" placement="end">
          <Offcanvas.Header closeButton className="dark-green">
            <Offcanvas.Title>Menu</Offcanvas.Title>
          </Offcanvas.Header>

          <Offcanvas.Body className="dark-green">
            <Nav className="menu-central">
              <Nav.Link href="#home">{pagina01}</Nav.Link>

              <Nav.Link href="#pagina02">{pagina02}</Nav.Link>

              <Nav.Link href="#pagina03">{pagina03}</Nav.Link>

              <Nav.Link href="#pagina04">{pagina04}</Nav.Link>

              <Nav.Link href="#pagina05">{pagina05}</Nav.Link>

              <Nav.Link href="#pagina06">{pagina06}</Nav.Link>
            </Nav>

            <div className="botao-login">
              <Button texto="Login" tipo="botao-sem-fundo-branco" />

              <Button texto="Cadastrar" tipo="botao-com-fundo" />
            </div>
          </Offcanvas.Body>
        </Navbar.Offcanvas>
      </Container>
    </Navbar>
  );
}

export default Header;
