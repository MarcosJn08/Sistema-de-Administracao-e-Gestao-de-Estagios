import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import Image from 'react-bootstrap/Image';
import LogoBranca from '../assets/LogoBranca.png';
import '../App.css';

function Rodape() {
  return (
    <footer className="rodape-sage">
      <Container fluid className="px-4 px-lg-5">
        <Row className="gy-4">
          <Col xs={12} md={5} lg={4} className="mb-3 mb-lg-0">
            <div className="d-flex align-items-center mb-2">
              <Image src={LogoBranca} alt="Logo SAGE" className="logo" />
            </div>
            <p className="rodape-texto-marca">
              Sistema de gestão de estágios do IFNMG – Câmpus Almenara.
            </p>
          </Col>

          <Col xs={12} md={7} lg={8}>
            <Row className="justify-content-md-end gy-3">
              <Col xs={6} sm={4} lg={3}>
                <div className="rodape-titulo-coluna">ALUNOS</div>
                <ul className="rodape-links">
                  <li><a href="#vagas">Ver vagas</a></li>
                  <li><a href="#estagio">Meu estágio</a></li>
                  <li><a href="#documentos">Documentos</a></li>
                </ul>
              </Col>

              <Col xs={6} sm={4} lg={3}>
                <div className="rodape-titulo-coluna">EMPRESA</div>
                <ul className="rodape-links">
                  <li><a href="#divulgar-vagas">Divulgar vagas</a></li>
                  <li><a href="#candidaturas">Candidaturas</a></li>
                  <li><a href="#como-participar">Como participar</a></li>
                </ul>
              </Col>

              <Col xs={6} sm={4} lg={3}>
                <div className="rodape-titulo-coluna">INSTITUCIONAL</div>
                <ul className="rodape-links">
                  <li><a href="#sobre">Sobre o SAGE</a></li>
                  <li><a href="#nucleo">Núcleo de Estágio</a></li>
                  <li><a href="#contato">Contato</a></li>
                </ul>
              </Col>
            </Row>
          </Col>
        </Row>

        <div className="rodape-divisor" />

        <div className="rodape-inferior">
          <div>
            © 2026 SAGE - IFNMG Câmpus Almenara. Todos os direitos reservados.
          </div>
          <div className="d-flex gap-4">
            <a href="#privacy">Privacy Policy</a>
            <a href="#terms">Terms of Service</a>
          </div>
        </div>
      </Container>
    </footer>
  );
}

export default Rodape;
