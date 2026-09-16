import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';
import CardDadosAluno from '../components/aluno/CardDadosAluno.jsx';
import CardProgresso from '../components/aluno/CardProgresso.jsx';
import CardEstagioAtual from '../components/aluno/CardEstagioAtual.jsx';
import CardDocumentos from '../components/aluno/CardDocumentos.jsx';
import CardMinhasInscricoes from '../components/aluno/CardMinhasInscricoes.jsx';
import dados from '../dados.jsx';
import '../App.css';

function DashboardAluno() {
  return (
    <div className="d-flex flex-column min-vh-100" style={{ backgroundColor: '#f4f6f8' }}>
      <Header
        pagina01="Dashboard"
        pagina02="Vagas"
        pagina03="Documentos"
        paginaAtiva="Dashboard"
        usuario={dados.aluno}
      />

      <main className="flex-grow-1 py-4">
        <Container style={{ maxWidth: '1200px' }} className="px-3">
          <CardDadosAluno
            nome={dados.aluno.nome}
            curso={dados.aluno.curso}
            email={dados.aluno.email}
            matricula={dados.aluno.matricula}
          />

          <Row className="g-4 mb-4">
            <Col xs={12} lg={6}>
              <CardProgresso
                horasConcluidas={dados.progresso.horasConcluidas}
                metaHoras={dados.progresso.metaHoras}
                horasEstagio={dados.progresso.horasEstagio}
                horasProjeto={dados.progresso.horasProjeto}
              />
            </Col>
            <Col xs={12} lg={6}>
              <CardEstagioAtual
                status={dados.estagioAtual.status}
                empresa={dados.estagioAtual.empresa}
                professorOrientador={dados.estagioAtual.professorOrientador}
                supervisorEstagio={dados.estagioAtual.supervisorEstagio}
                dataInicio={dados.estagioAtual.dataInicio}
                dataFim={dados.estagioAtual.dataFim}
                cargaHorariaSemanal={dados.estagioAtual.cargaHorariaSemanal}
              />
            </Col>
          </Row>

          <div className="mb-4">
            <CardDocumentos documentos={dados.documentos} />
          </div>

          <div className="mb-4">
            <CardMinhasInscricoes inscricoes={dados.minhasInscricoes} />
          </div>
        </Container>
      </main>

      <Footer />
    </div>
  );
}

export default DashboardAluno;
