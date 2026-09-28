import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';
import CardDadosEstagio from '../components/Estagio/CardDadosEstagio.jsx';
import CardProgresso from '../components/Estagio/CardProgresso.jsx';
import CardDocumentos from '../components/aluno/CardDocumentos.jsx';
import dados from '../dados.jsx';
import '../App.css';

function DashboardEstagio() {
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
          <CardDadosEstagio
            status={dados.estagioAtual.status}
            empresa={dados.estagioAtual.empresa}
            professorOrientador={dados.estagioAtual.professorOrientador}
            supervisorEstagio={dados.estagioAtual.supervisorEstagio}
            dataInicio={dados.estagioAtual.dataInicio}
            dataFim={dados.estagioAtual.dataFim}
            cargaHorariaSemanal={dados.estagioAtual.cargaHorariaSemanal}
          />

          <CardProgresso
            horasConcluidas={dados.progressoEspecifico.horasConcluidas}
            metaHoras={dados.progressoEspecifico.metaHoras}
            horasEstagio={dados.progressoEspecifico.horasEstagio}
            horasProjeto={dados.progressoEspecifico.horasProjeto}
          />


          <div className="mb-4">
            <CardDocumentos documentos={dados.documentos} />
          </div>

        </Container>
      </main>

      <Footer />
    </div>
  );
}

export default DashboardEstagio;
