import { BriefcaseBusiness, CheckCircle2, Clock3, LayoutDashboard } from 'lucide-react';
import { Col, Container, Row } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';
import Botao from '../components/Button.jsx';
import CardPequeno from '../components/CardPequeno.jsx';
import CardEstagio from '../components/Estagio/cardEstagios/CardEstagio.jsx';
import dados from '../data/aluno.js';
import './EstagiosAluno.css';

function MeusEstagiosAluno() {
  const navigate = useNavigate();
  const estagios = dados.meusEstagios || [];
  const ativos = estagios.filter((estagio) => estagio.atual).length;
  const concluidos = estagios.filter((estagio) => estagio.status === 'Concluído').length;
  const horasRegistradas = estagios.reduce((total, estagio) => total + Number(estagio.horasConcluidas || 0), 0);
  const indicadores = [
    { titulo: 'Total de estágios', valor: estagios.length, texto: 'Vínculos registrados no sistema', icone: <BriefcaseBusiness size={23} />, variante: 'azul' },
    { titulo: 'Estágio atual', valor: ativos, texto: 'Vínculo em andamento', icone: <Clock3 size={23} />, variante: 'ambar' },
    { titulo: 'Concluídos', valor: concluidos, texto: 'Vínculos finalizados', icone: <CheckCircle2 size={23} />, variante: 'verde' },
    { titulo: 'Horas registradas', valor: `${horasRegistradas}h`, texto: 'Somadas em todos os estágios', icone: <LayoutDashboard size={23} />, variante: 'verde' },
  ];

  return (
    <div className="estagios-aluno-pagina d-flex flex-column min-vh-100">
      <Header paginaAtiva="Estágios" usuario={dados.aluno} />
      <main className="flex-grow-1 py-4">
        <Container className="px-3 estagios-aluno-container">
          <div className="estagios-aluno-cabecalho">
            <div>
              <h1>Meus estágios</h1>
              <p>Acompanhe o vínculo atual e consulte o histórico dos estágios já realizados</p>
            </div>
            <Botao tipo="botao-acao-contorno" onClick={() => navigate('/sage/aluno')}>
              <LayoutDashboard size={16} aria-hidden="true" /> Voltar ao dashboard
            </Botao>
          </div>

          <Row className="g-4 mb-4">
            {indicadores.map((indicador) => <Col xs={12} sm={6} lg={3} key={indicador.titulo}>
              <CardPequeno {...indicador} />
            </Col>)}
          </Row>

          <section className="cartao-sage mb-0" aria-labelledby="historico-estagios-titulo">
            <div className="estagios-aluno-secao-cabecalho">
              <h2 id="historico-estagios-titulo" className="cartao-sage-titulo mb-1">Histórico de estágios</h2>
              <p>Selecione um vínculo para consultar seus dados, progresso e documentos.</p>
            </div>
            <div className="estagios-aluno-grid">
              {estagios.map((estagio) => <CardEstagio key={estagio.id} estagio={estagio}
                aoVerEstagio={() => navigate(`/sage/aluno/estagios/${estagio.id}`)} />)}
            </div>
          </section>
        </Container>
      </main>
      <Footer />
    </div>
  );
}

export default MeusEstagiosAluno;
