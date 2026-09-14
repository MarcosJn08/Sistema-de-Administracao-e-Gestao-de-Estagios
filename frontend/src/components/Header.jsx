import { useState } from 'react';
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import Offcanvas from 'react-bootstrap/Offcanvas';
import Button from './Button.jsx';
import LogoBranca from '../assets/LogoBranca.png';

function Header({
  pagina01 = 'Início',
  pagina02 = 'Minhas funcionalidades',
  pagina03 = 'Vagas',
  pagina04 = 'Para empresas',
  pagina05 = 'Contato',
  pagina06 = '',
}) {
  const [expanded, setExpanded] = useState(false);
  const closeMenu = () => setExpanded(false);
  const links = [
    [pagina01, '#inicio'],
    [pagina02, '#perfis'],
    [pagina03, '#vagas'],
    [pagina04, '#empresas'],
    [pagina05, '#contato'],
    ...(pagina06 ? [[pagina06, '#como-funciona']] : []),
  ];

  return (
    <Navbar
      expand="lg"
      expanded={expanded}
      onToggle={setExpanded}
      className="dark-green header"
      data-bs-theme="dark"
      aria-label="Navegação principal"
    >
      <Container fluid className="sage-edge-container">
        <Navbar.Brand href="#inicio" onClick={closeMenu}>
          <img src={LogoBranca} className="logo" alt="SAGE — início" width="76" height="56" />
        </Navbar.Brand>
        <Navbar.Toggle
          aria-controls="offcanvasNavbar"
          aria-expanded={expanded}
          label="Abrir menu de navegação"
        />
        <Navbar.Offcanvas
          id="offcanvasNavbar"
          placement="end"
          restoreFocusOptions={{ preventScroll: true }}
          onHide={closeMenu}
          className="sage-menu"
          aria-labelledby="menu-title"
        >
          <Offcanvas.Header closeButton closeVariant="white" closeLabel="Fechar menu">
            <Offcanvas.Title id="menu-title">Menu SAGE</Offcanvas.Title>
          </Offcanvas.Header>
          <Offcanvas.Body>
            <Nav className="menu-central">
              {links.map(([label, href]) => (
                <Nav.Link key={href} href={href} onClick={closeMenu}>
                  {label}
                </Nav.Link>
              ))}
            </Nav>
            <div className="botao-login">
              <Button texto="Entrar" tipo="botao-texto-branco" aria-disabled="true" />
              <Button texto="Cadastrar" aria-disabled="true" />
            </div>
          </Offcanvas.Body>
        </Navbar.Offcanvas>
      </Container>
    </Navbar>
  );
}

export default Header;
