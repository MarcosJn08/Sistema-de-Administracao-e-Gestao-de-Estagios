import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';
import CardDadosAluno from '../components/aluno/CardDadosAluno.jsx';
import CardProgresso from '../components/aluno/CardProgresso.jsx';
import CardEstagioAtual from '../components/aluno/CardEstagioAtual.jsx';
import CardMinhasInscricoes from '../components/aluno/CardMinhasInscricoes.jsx';
import CardEstagio from '../components/Estagio/cardEstagios/CardEstagio.jsx';
import dados from '../dados.jsx';
import '../App.css';
import '../components/Estagio/cardEstagios/CardEstagio.css';

function DashboardAluno() {
  const navigate = useNavigate();

  const estagios = dados.meusEstagios || [];

  const abrirEstagio = (estagio) => {
    navigate('/sage/estagio', { state: { estagio } });
  };

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
                horasConcluidas={dados.progressoTotal.horasConcluidas}
                metaHoras={dados.progressoTotal.metaHoras}
                horasEstagio={dados.progressoTotal.horasEstagio}
                horasProjeto={dados.progressoTotal.horasProjeto}
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

          <section className="dashboard-estagios mb-4" aria-labelledby="titulo-meus-estagios">
            <div className="dashboard-estagios-cabecalho">
              <h2 id="titulo-meus-estagios">Meus Estágios</h2>

              <button
                type="button"
                className="dashboard-estagios-ver-todos"
                onClick={() => navigate('/sage/estagio')}
              >
                Ver todos
                <ArrowRight size={16} aria-hidden="true" />
              </button>
            </div>

            <div className="dashboard-estagios-grid">
              {estagios.map((estagio) => (
                <CardEstagio
                  key={estagio.id}
                  estagio={estagio}
                  aoVerEstagio={abrirEstagio}
                />
              ))}
            </div>
          </section>

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