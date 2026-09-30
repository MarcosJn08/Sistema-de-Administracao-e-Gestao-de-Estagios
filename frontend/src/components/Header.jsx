import { useState } from 'react';
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import Offcanvas from 'react-bootstrap/Offcanvas';
import Button from './Button.jsx';
import LogoBranca from '../assets/LogoBranca.png';

import { Code } from 'lucide-react';

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
  somenteInicio = false,
  mostrarBotaoSair,
}) {
  const [expanded, setExpanded] = useState(false);
  const closeMenu = () => setExpanded(false);

  const isDashboard = Boolean(usuario);
  const isEmpresa = usuario?.tipo === 'empresa';
  const exibirBotaoSair = mostrarBotaoSair !== undefined ? mostrarBotaoSair : !isEmpresa;

  const landingLinks = [
    [pagina01, '#inicio'],
    [pagina02, '#perfis'],
    [pagina03, '#vagas'],
    [pagina04, '#empresas'],
    [pagina05, '#contato'],
    ...(pagina06 ? [[pagina06, '#como-funciona']] : []),
  ];

  const isDiretor = usuario?.role === 'diretor';
  const isProfessor = usuario?.role === 'professor';

  const diretorLinks = [
    ['Dashboard', '/sage/diretor'],
    ['Alunos', '/sage/diretor/alunos'],
    ['Orientadores', '#'],
    ['Empresas', '#'],
    ['Documentos', '#'],
    ['Relatórios', '#'],
  ];
  const professorLinks = [['Dashboard', '#'], ['Alunos', '#'], ['Estágios', '#']];

  const dashboardAlunoLinks = [
    ['Início', '/sage'],
    ['Dashboard', '/sage/aluno'],
    ['Vagas', '/sage/vagas'],
    ...(pagina03 === 'Documentos' ? [['Documentos', '/sage/documentos']] : []),
  ];

  const cadastroLinks = [
    ['Início', '/sage'],
  ];

  const links =
    customLinks ||
    (somenteInicio
      ? cadastroLinks
      : isDiretor
      ? diretorLinks
      : isProfessor
      ? professorLinks
      : isDashboard
      ? dashboardAlunoLinks
      : landingLinks);

  const nomeExibicao = usuario?.nome ? usuario.nome.split(' ')[0] : 'Usuário';
  const letraAvatar = usuario?.nome ? usuario.nome.charAt(0).toUpperCase() : 'U';

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
                  key={label}
                  href={href}
                  onClick={(e) => {
                    closeMenu();
                    if (href === '#' || !href) {
                      e.preventDefault();
                    }
                  }}
                  className={paginaAtiva === label ? 'nav-link-active' : ''}
                >
                  {label}
                </Nav.Link>
              ))}
            </Nav>
            {!somenteInicio && (
              <div className="botao-login">
                {isDashboard ? (
                  <div className="d-flex align-items-center gap-3">
                    <div className="perfil-usuario-header">
                      <div
                        className="avatar-usuario-header"
                        style={isEmpresa ? { backgroundColor: '#0f172a', borderColor: '#38bdf8' } : {}}
                      >
                        {isEmpresa ? (
                          <Code size={18} color="#38bdf8" />
                        ) : usuario?.foto ? (
                          <img src={usuario.foto} alt={usuario.nome} />
                        ) : (
                          <span>{letraAvatar}</span>
                        )}
                      </div>
                      <span className="nome-usuario-header">
                        {isEmpresa ? usuario.nome : (nomeExibicao)}
                      </span>
                    </div>
                    {exibirBotaoSair && (
                      <Button texto="Sair" tipo="botao-texto-branco" href="/sage/login" />
                    )}
                  </div>
                ) : (
                  <>
                    <Button texto="Entrar" tipo="botao-texto-branco" href="/sage/login" />
                    <Button texto="Portal do Aluno" href="/sage/aluno" />
                  </>
                )}
              </div>
            )}
          </Offcanvas.Body>
        </Navbar.Offcanvas>
      </Container>
    </Navbar>
  );
}

export default Header;

