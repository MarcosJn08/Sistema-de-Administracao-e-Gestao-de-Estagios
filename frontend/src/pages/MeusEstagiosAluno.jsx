import { useEffect, useState } from 'react';
import api from '../services/api.js';
import { BriefcaseBusiness, CheckCircle2, Clock3, Handshake, LayoutDashboard } from 'lucide-react';
import { Alert, Col, Container, Row } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';
import Button from "../components/Button/Button.jsx";
import CardPequeno from '../components/CardPequeno.jsx';
import CardEstagio from '../components/Estagio/cardEstagios/CardEstagio.jsx';
import './EstagiosAluno.css';

const estados = { RASCUNHO: 'Rascunho', EM_ANALISE: 'Em análise', EM_ANDAMENTO: 'Em andamento', CONCLUIDO: 'Concluído', ENCERRADO: 'Encerrado', CANCELADO_DESVIO_FUNCAO: 'Cancelado por desvio de função' };
const data = (valor) => valor ? new Intl.DateTimeFormat('pt-BR', { timeZone: 'UTC' }).format(new Date(`${valor}T00:00:00Z`)) : 'Não informado';

const adaptar = c => ({
  id: c.id, empresa: c.empresa.razao_social, cargo: c.cargo || 'Estágio',
  atual: c.status === 'EM_ANDAMENTO', status: estados[c.status] || c.status,
  dataInicio: data(c.data_inicio), dataFim: data(c.data_termino),
  cargaHoraria: c.carga_horaria_semanal == null ? 'Não informada' : `${c.carga_horaria_semanal}h/semana`,
  horasConcluidas: Number(c.horas_cumpridas),
  progresso: c.meta_horas_tce ? Math.round(Number(c.horas_cumpridas) / Number(c.meta_horas_tce) * 100) : 0,
});

function MeusEstagiosAluno() {
  const navigate = useNavigate();
  const [estagios, setEstagios] = useState([]);

  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [tentativa, setTentativa] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    async function carregar() {
      try {
        const registros = [];
        let pagina = 1;
        let ultima = 1;
        do {
          const { data: resposta } = await api.get('/estagios', { params: { page: pagina, per_page: 100 }, signal: controller.signal });
          registros.push(...resposta.data);
          ultima = resposta.meta.last_page;
          pagina += 1;
        } while (pagina <= ultima);
        if (!controller.signal.aborted) setEstagios(registros.map(adaptar));
      } catch (e) {
        if (!controller.signal.aborted) setErro(e.message);
      } finally {
        if (!controller.signal.aborted) setCarregando(false);
      }
    }
    carregar();
    return () => controller.abort();
  }, [tentativa]);

  const ativos = estagios.filter((estagio) => estagio.atual).length;
  const concluidos = estagios.filter((estagio) => estagio.status === 'Concluído').length;
  const horasRegistradas = estagios.reduce((total, estagio) => total + Number(estagio.horasConcluidas || 0), 0);
  const indicadores = [
    { titulo: 'Total de estágios', valor: estagios.length, texto: 'Vínculos registrados no sistema', icone: <BriefcaseBusiness size={23} />, variante: 'azul' },
    { titulo: 'Estágio atual', valor: ativos, texto: 'Vínculo em andamento', icone: <Handshake size={23} />, variante: 'ambar' },
    { titulo: 'Concluídos', valor: concluidos, texto: 'Vínculos finalizados', icone: <CheckCircle2 size={23} />, variante: 'verde' },
    { titulo: 'Horas registradas', valor: `${horasRegistradas}h`, texto: 'Somadas em todos os estágios', icone: <Clock3 size={23} />, variante: 'verde' },
  ];

  return (
    <div className="estagios-aluno-pagina d-flex flex-column min-vh-100">
      <Header paginaAtiva="Estágios" />
      <main className="flex-grow-1 py-4">
        <Container className="px-3 estagios-aluno-container">
          <div className="estagios-aluno-cabecalho">
            <div>
              <h1>Meus estágios</h1>
              <p>Acompanhe o vínculo atual e consulte o histórico dos estágios já realizados</p>
            </div>
            <Button type="botao-acao-contorno" onClick={() => navigate('/sage/aluno')}>
              <LayoutDashboard size={16} aria-hidden="true" /> Voltar ao dashboard
            </Button>
          </div>

          {carregando && <p role="status">Carregando estágios…</p>}
          {erro && <Alert variant="danger">{erro} <button type="button" onClick={() => { setErro(''); setCarregando(true); setTentativa(t => t + 1); }}>Tentar novamente</button></Alert>}
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
            {!carregando && !erro && !estagios.length && <p>Nenhum estágio cadastrado.</p>}
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
