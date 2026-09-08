import Container from 'react-bootstrap/Container'
import Nav from 'react-bootstrap/Nav'
import Navbar from 'react-bootstrap/Navbar'
import Image from 'react-bootstrap/Image'

import '../App.css'

import Botao from './Botao.jsx'
import LogoBranca from '../assets/LogoBranca.png'

function Header({ pagina01, pagina02, pagina03 }) {

  return (
    <Navbar expand="lg" className="primary-green header">

      <Container fluid>

        <Navbar.Brand href="#home">
          <Image
            src={LogoBranca}
            className="logo"
          />
        </Navbar.Brand>

        <Nav className="menu-central">

          <Nav.Link href="#home">
            {pagina01}
          </Nav.Link>

          <Nav.Link href="#features">
            {pagina02}
          </Nav.Link>

          <Nav.Link href="#pricing">
            {pagina03}
          </Nav.Link>

        </Nav>

        <div className="botao-login">
          <Botao
            texto="Fazer Login"
            tipo="botao-sem-fundo-branco"
          />
          <Botao
            texto="Cadastrar"
            tipo="botao-com-fundo"
          />
          
        </div>

      </Container>

    </Navbar>
  )
}

export default Header