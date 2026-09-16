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
  paginaAtiva,
  usuario,
  customLinks,
}) {
  const [expanded, setExpanded] = useState(false);
  const closeMenu = () => setExpanded(false);

  const isDashboard = Boolean(usuario);

  const landingLinks = [
    [pagina01, '#inicio'],
    [pagina02, '#perfis'],
    [pagina03, '#vagas'],
    [pagina04, '#empresas'],
    [pagina05, '#contato'],
    ...(pagina06 ? [[pagina06, '#como-funciona']] : []),
  ];

  const dashboardLinks = [
    ['Início', '/sage'],
    ['Dashboard', '/sage/aluno'],
    ['Vagas', '/sage/vagas'],
    ['Documentos', '/sage/documentos'],
  ];

  const links = customLinks || (isDashboard ? dashboardLinks : landingLinks);

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
        <Navbar.Brand href="/sage" onClick={closeMenu}>
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
                <Nav.Link
                  key={href}
                  href={href}
                  onClick={closeMenu}
                  className={paginaAtiva === label ? 'nav-link-active' : ''}
                >
                  {label}
                </Nav.Link>
              ))}
            </Nav>
            <div className="botao-login">
              {isDashboard ? (
                <div className="d-flex align-items-center gap-3">
                  <div className="perfil-usuario-header">
                    <div className="avatar-usuario-header">
                      <span>{usuario.nome ? usuario.nome.charAt(0).toUpperCase() : 'A'}</span>
                    </div>
                    <span className="nome-usuario-header">
                      {usuario.nome ? usuario.nome.split(' ')[0] : 'Aluno'}
                    </span>
                  </div>
                  <Button texto="Sair" tipo="botao-texto-branco" href="/sage/login" />
                </div>
              ) : (
                <>
                  <Button texto="Entrar" tipo="botao-texto-branco" href="/sage/login" />
                  <Button texto="Portal do Aluno" href="/sage/aluno" />
                </>
              )}
            </div>
          </Offcanvas.Body>
        </Navbar.Offcanvas>
      </Container>
    </Navbar>
  );
}

export default Header;
