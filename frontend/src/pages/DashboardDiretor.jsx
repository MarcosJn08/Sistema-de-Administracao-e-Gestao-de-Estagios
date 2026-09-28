import React from "react";
import { Container, Row, Col } from "react-bootstrap";

import Header from "../components/Header.jsx";
import Footer from "../components/Footer.jsx";

import CardDocumentos from "../components/diretor/CardDocumentos.jsx";
import CardPequeno from "../components/CardPequeno.jsx";

import dados from "../dadosDiretor.jsx";

import "../App.css";

function DashboardDiretor() {
  return (
    <div
      className="d-flex flex-column min-vh-100"
      style={{ backgroundColor: "#f4f6f8" }}
    >
      <Header
        pagina01="Dashboard"
        pagina02="Alunos"
        pagina03="Orientadores"
        pagina04="Estágios"
        pagina05="Documentos"
        usuario={dados.aluno}
      />

      <main className="flex-grow-1 py-4">
        <Container
          style={{ maxWidth: "1200px" }}
          className="px-3"
        >
          <Row className="g-5 mb-3">
            <Col xs={12} md={3}>
              <CardPequeno
                titulo="Estágios Ativos"
                valor="48"
                icone="bi bi-suitcase-lg-fill fs-2 text-white"
                cor="#2E7D32"
              />
            </Col>

            <Col xs={12} md={3}>
              <CardPequeno
                titulo="Documentos Pendentes"
                valor="12"
                icone="bi bi-file-earmark-text-fill fs-2 text-white"
                cor="#F57F17"
              />
            </Col>

            <Col xs={12} md={3}>
              <CardPequeno
                titulo="Vagas Abertas"
                valor="9"
                icone="bi bi-building fs-2 text-white"
                cor="#1565C0"
              />
            </Col>

            <Col xs={12} md={3}>
              <CardPequeno
                titulo="Prazo Próximo"
                valor="5"
                icone="bi bi-exclamation-circle fs-2 text-white"
                cor="#ff0026"
              />
            </Col>
          </Row>

          <div className="mb-4">
            <CardDocumentos
              documentos={dados.pendencias}
            />
          </div>
        </Container>
      </main>

      <Footer />
    </div>
  );
}

export default DashboardDiretor;
