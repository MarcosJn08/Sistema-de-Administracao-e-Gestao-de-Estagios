import { useState } from 'react';
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import Offcanvas from 'react-bootstrap/Offcanvas';
import Dropdown from 'react-bootstrap/Dropdown';
import LogoBranca from '../../assets/LogoBranca.png';
import './Header.css';

function Header({
  pagina01 = 'Dashboard',
  pagina02 = 'Alunos',
  pagina03 = 'Orientadores',
  pagina04 = 'Empresas',
  pagina05 = 'Estágios',
  pagina06 = '',
  paginaAtiva,
  usuario,
  customLinks,
  somenteInicio = false,
  notificacoes = 0,
  aoBuscar,
}) {
  const [expanded, setExpanded] = useState(false);
  const [busca, setBusca] = useState('');
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
    [pagina01, '/sage/diretor'],
    [pagina02, '/sage/aluno'],
    [pagina03, '/sage/diretor'],
    [pagina04, '/sage/vagas'],
    [pagina05, '/sage/vagas'],
    ...(pagina06 ? [[pagina06, '/sage/documentos']] : []),
  ];

  const cadastroLinks = [
    ['Início', '/sage'],
  ];

  const links = customLinks || (somenteInicio ? cadastroLinks : isDashboard ? dashboardLinks : landingLinks);

  const lidarComBusca = (evento) => {
    evento.preventDefault();
    if (aoBuscar) aoBuscar(busca.trim());
  };

  const nomeUsuario = usuario?.nome || 'Diretor';

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
          <img src={LogoBranca} className="logo" alt="SAGE — início" width="60" height="60" />
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

            {!somenteInicio && isDashboard && (
              <div className="botao-login header-acoes">
                <form role="search" className="header-busca" onSubmit={lidarComBusca}>
                  <i className="bi bi-search" aria-hidden="true" />
                  <input
                    type="search"
                    value={busca}
                    onChange={(e) => setBusca(e.target.value)}
                    placeholder="Buscar aluno, empresa, documento..."
                    aria-label="Buscar aluno, empresa ou documento"
                  />
                </form>

                <div className="d-flex align-items-center gap-2">
                  <button
                    type="button"
                    className="header-icone-botao"
                    aria-label={
                      notificacoes > 0
                        ? `Notificações (${notificacoes} novas)`
                        : 'Notificações'
                    }
                  >
                    <i className="bi bi-bell" aria-hidden="true" />
                    {notificacoes > 0 && <span className="header-icone-badge" />}
                  </button>

                  <Dropdown align="end">
                    <Dropdown.Toggle
                      as="button"
                      bsPrefix="perfil-usuario-header"
                      aria-label={`Menu de ${nomeUsuario}`}
                    >
                      <span className="avatar-usuario-header">
                        {usuario.foto ? (
                          <img src={usuario.foto} alt="" />
                        ) : (
                          <span>{nomeUsuario.charAt(0).toUpperCase()}</span>
                        )}
                      </span>
                      <span className="nome-usuario-header d-lg-none">
                        {nomeUsuario.split(' ')[0]}
                      </span>
                    </Dropdown.Toggle>

                    <Dropdown.Menu>
                      <Dropdown.Item href="/sage/login">Sair</Dropdown.Item>
                    </Dropdown.Menu>
                  </Dropdown>
                </div>
              </div>
            )}
          </Offcanvas.Body>
        </Navbar.Offcanvas>
      </Container>
    </Navbar>
  );
}

export default Header;
