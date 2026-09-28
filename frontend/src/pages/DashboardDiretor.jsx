import React from "react";
import { Container, Row, Col } from "react-bootstrap";

import Header from "../components/diretor/Header.jsx";
import Footer from "../components/Footer.jsx";

import CardPequeno from "../components/CardPequeno.jsx";
import CardDocumentos from "../components/diretor/CardDocumentos.jsx";
import CardEstagiosPorStatus from "../components/diretor/CardEstagiosPorStatus.jsx";
import CardAtividadeRecente from "../components/diretor/CardAtividadeRecente.jsx";
import CardAcoesRapidas from "../components/diretor/CardAcoesRapidas.jsx";
import CardProximosVencimentos from "../components/diretor/CardProximosVencimentos.jsx";

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
        pagina04="Empresas"
        pagina05="Estágios"
        pagina06="Documentos"
        paginaAtiva="Dashboard"
        usuario={dados.diretor}
        notificacoes={dados.notificacoes}
      />

      <main className="flex-grow-1 py-4">
        <Container style={{ maxWidth: "1200px" }} className="px-3">
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

          <Row className="g-4">
            <Col xs={12} lg={8}>
              <CardDocumentos
                titulo="Pendências para análise"
                documentos={dados.pendencias}
                textoVerTodos="Ver todas as pendências"
              />

              <CardEstagiosPorStatus
                itens={dados.estagiosPorStatus.itens}
                total={dados.estagiosPorStatus.total}
              />
            </Col>

            <Col xs={12} lg={4}>
              <CardAtividadeRecente atividades={dados.atividadesRecentes} />
              <CardAcoesRapidas acoes={dados.acoesRapidas} />
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
