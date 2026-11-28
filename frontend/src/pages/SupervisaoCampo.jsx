import { Container } from 'react-bootstrap';
import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';
import AbaSupervisaoCampo from '../components/professor/AbaSupervisaoCampo.jsx';
import '../App.css';

export default function SupervisaoCampo() {
  return (
    <div className="d-flex flex-column min-vh-100">
      <Header paginaAtiva="Supervisão de Campo" />
      <main className="flex-grow-1 py-4">
        <Container className="px-3">
          <div className="mb-4">
            <h1 className="dashboard-professor-titulo">Supervisão de Estágio em Campo</h1>
            <p className="text-secondary mb-0">
              Lançamento diário de presenças e horas para cursos com modalidade supervisionada.
            </p>
          </div>
          <AbaSupervisaoCampo />
        </Container>
      </main>
      <Footer />
    </div>
  );
}
