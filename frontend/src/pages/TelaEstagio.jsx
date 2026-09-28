import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';
import CardDadosEstagio from '../components/Estagio/CardDadosEstagio.jsx';
import CardProgresso from '../components/Estagio/CardProgresso.jsx';
import CardDocumentos from '../components/aluno/CardDocumentos.jsx';
import dados from '../dadosAluno.jsx';
import '../App.css';

function TelaEstagio() {
  const location = useLocation();
  const navigate = useNavigate();

  const estagioSelecionado = location.state?.estagio;
  const estagioAtual = dados.estagioAtual;

  const empresa = estagioSelecionado?.empresa || estagioAtual.empresa;
  const dataInicio = estagioSelecionado?.dataInicio || estagioAtual.dataInicio;
  const dataFim = estagioSelecionado?.dataFim || estagioAtual.dataFim;
  const cargaHoraria = estagioSelecionado?.cargaHoraria || estagioAtual.cargaHorariaSemanal;

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
          <button
            type="button"
            className="tela-estagio-voltar"
            onClick={() => navigate('/sage/aluno')}
          >
            <ArrowLeft size={16} strokeWidth={2} aria-hidden="true" />
            Voltar para o dashboard
          </button>

          <CardDadosEstagio
            status={estagioSelecionado?.status || estagioAtual.status}
            empresa={empresa}
            professorOrientador={estagioAtual.professorOrientador}
            supervisorEstagio={estagioAtual.supervisorEstagio}
            dataInicio={dataInicio}
            dataFim={dataFim}
            cargaHorariaSemanal={cargaHoraria}
          />

          <Row className="g-4 mb-4">
            <Col xs={12}>
              <CardProgresso
                horasConcluidas={dados.progressoEspecifico.horasConcluidas}
                metaHoras={dados.progressoEspecifico.metaHoras}
                horasEstagio={dados.progressoEspecifico.horasEstagio}
                horasProjeto={dados.progressoEspecifico.horasProjeto}
              />
            </Col>
          </Row>

          <div className="mb-4">
            <CardDocumentos documentos={dados.documentos} />
          </div>
        </Container>
      </main>

      <Footer />
    </div>
  );
}

export default TelaEstagio;