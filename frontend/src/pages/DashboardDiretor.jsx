import React from "react";
import { Container, Row, Col } from "react-bootstrap";

import Header from "../components/Header.jsx";
import Footer from "../components/Footer.jsx";

import CardPequeno from "../components/CardPequeno.jsx";
import CardDocumentos from "../components/diretor/CardDocumentos.jsx";
import CardEstagiosPorStatus from "../components/diretor/CardEstagiosPorStatus.jsx";
import CardAtividadeRecente from "../components/diretor/CardAtividadeRecente.jsx";
import CardAcoesRapidas from "../components/diretor/CardAcoesRapidas.jsx";
import CardProximosVencimentos from "../components/diretor/CardProximosVencimentos.jsx";

import dados from '../data/diretor.js';

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
        pagina04="Empresas"
        pagina05="Documentos"
        pagina06="Relatórios"
        paginaAtiva="Dashboard"
        usuario={dados.diretor}
      />

      <main className="flex-grow-1 py-4">
        <Container style={{ maxWidth: "1200px" }} className="px-3">
          {/* Indicadores do topo */}
          <Row className="g-4 mb-4">
            {dados.indicadores.map((indicador) => (
              <Col key={indicador.id} xs={12} sm={6} lg={3}>
                <CardPequeno
                  titulo={indicador.titulo}
                  valor={indicador.valor}
                  texto={indicador.texto}
                  icone={indicador.icone}
                  cor={indicador.cor}
                  corFundo={indicador.corFundo}
                />
              </Col>
            ))}
          </Row>

          {/* Card maior preenchendo tudo */}
          <Row className="g-4 mb-4">
            <Col xs={12}>
              <CardDocumentos
                titulo="Pendências para análise"
                documentos={dados.pendencias}
                textoVerTodos="Ver todas as pendências"
              />
            </Col>
          </Row>

          {/* Cards menores abaixo (2 por linha) */}
          <Row className="g-4">
            <Col xs={12} md={6}>
              <CardEstagiosPorStatus
                itens={dados.estagiosPorStatus.itens}
                total={dados.estagiosPorStatus.total}
              />
            </Col>

            <Col xs={12} md={6}>
              <CardAtividadeRecente atividades={dados.atividadesRecentes} />
            </Col>

            <Col xs={12} md={6}>
              <CardAcoesRapidas acoes={dados.acoesRapidas} />
            </Col>

            <Col xs={12} md={6}>
              <CardProximosVencimentos itens={dados.proximosVencimentos} />
            </Col>
          </Row>
        </Container>
      </main>

      <Footer />
    </div>
  );
}

export default DashboardDiretor;
