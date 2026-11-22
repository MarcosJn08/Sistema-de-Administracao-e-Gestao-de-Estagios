import { useState } from 'react';
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import Offcanvas from 'react-bootstrap/Offcanvas';
import Button from "./Button/Button.jsx";
import LogoBranca from '../assets/LogoBranca.png';
import MenuAluno from './aluno/MenuAluno.jsx';
import useAuth from '../hooks/useAuth.js';
import { Link, useNavigate } from 'react-router-dom';

import { Code } from 'lucide-react';

function Header({
  pagina01 = 'Início',
  pagina02 = 'Minhas funcionalidades',
  pagina03 = 'Vagas',
  pagina04 = 'Para empresas',
  pagina05 = 'Contato',
  pagina06 = '',
  paginaAtiva,
  customLinks,
  publicLinks,
  somenteInicio = false,
}) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(false);
  const [saindo, setSaindo] = useState(false);
  const [erroSaida, setErroSaida] = useState('');
  const usuario = user ? { nome: user.name, role: user.role, tipo: user.role } : null;
  const closeMenu = () => setExpanded(false);
  const sair = async () => {
    setSaindo(true);
    setErroSaida('');
    try {
      await logout();
      closeMenu();
      navigate('/sage/login', { replace: true });
    } catch (error) {
      setErroSaida(error.message);
    } finally {
      setSaindo(false);
    }
  };

  const isDashboard = Boolean(usuario);
  const isEmpresa = usuario?.tipo === 'empresa';

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
  const isAluno = isDashboard && !isEmpresa && !isDiretor && !isProfessor;

  const diretorLinks = [
    ['Dashboard', '/sage/diretor'],
    ['Alunos', '/sage/diretor/alunos'],
    ['Orientadores', '/sage/diretor/orientadores'],
    ['Empresas', '/sage/diretor/convenios'],
    ['Documentos', '/sage/diretor/documentos'],
  ];
  const professorLinks = [['Dashboard', '/sage/professor']];
  const empresaLinks = [
    ['Dashboard', '/sage/empresa'],
    ['Candidatos', '/sage/empresa/candidatos'],
    ['Estagiários', '/sage/empresa/estagiarios'],
  ];

  const dashboardAlunoLinks = [
    ['Início', '/sage'],
    ['Dashboard', '/sage/aluno'],
    ['Vagas', '/sage/vagas'],
    ['Candidaturas', '/sage/aluno/candidaturas'],
    ['Estágios', '/sage/aluno/estagios'],
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
      : isEmpresa
      ? empresaLinks
      : isDashboard
      ? dashboardAlunoLinks
      : publicLinks ?? landingLinks);

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
        <Navbar.Brand as={Link} to="/sage" onClick={closeMenu}>
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
                  key={`${label}-${href}`}
                  {...(href?.startsWith('/sage') ? { as: Link, to: href } : { href })}
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
                    {isAluno ? <MenuAluno usuario={usuario} aoNavegar={closeMenu} aoSair={sair} saindo={saindo} /> : <div className="perfil-usuario-header">
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
                    </div>}
                    {!isAluno && (
                      <Button texto={saindo ? 'Saindo…' : 'Sair'} tipo="botao-texto-branco" onClick={sair} disabled={saindo} />
                    )}
                  </div>
                ) : (
                  <>
                    <Button texto="Entrar" tipo="botao-texto-branco" href="/sage/login" />
                    <Button texto="Acessar portal" href="/sage/login" />
                  </>
                )}
              </div>
            )}
            {erroSaida && <div className="alert alert-danger mt-2" role="alert">{erroSaida}</div>}
          </Offcanvas.Body>
        </Navbar.Offcanvas>
      </Container>
    </Navbar>
  );
}

export default Header;

