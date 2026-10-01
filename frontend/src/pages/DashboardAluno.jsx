import React, { useState } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';
import Botao from '../components/Button.jsx';
import CardDadosAluno from '../components/aluno/CardDadosAluno.jsx';
import ListaCandidaturasAluno from '../components/aluno/ListaCandidaturasAluno.jsx';
import useCandidaturasAluno from '../hooks/useCandidaturasAluno.js';
import CardProgresso from '../components/aluno/CardProgresso.jsx';
import CardEstagioAtual from '../components/aluno/CardEstagioAtual.jsx';
import CardEstagio from '../components/Estagio/cardEstagios/CardEstagio.jsx';
import dados from '../data/aluno.js';
import { carregarPerfilAluno } from '../utils/candidaturaAluno.js';
import '../App.css';
import '../components/Estagio/cardEstagios/CardEstagio.css';
import VagasSection from '../components/landing/VagasSection.jsx';
import ModalDetalhesVaga from '../components/vagas/ModalDetalhesVaga.jsx';

function DashboardAluno() {
  const navigate = useNavigate();
  const [vagaSelecionada, setVagaSelecionada] = useState(null);
  const [perfil] = useState(carregarPerfilAluno);
  const candidaturas = useCandidaturasAluno();

  const estagios = dados.meusEstagios || [];

  const abrirEstagio = (estagio) => {
    navigate(`/sage/aluno/estagios/${estagio.id}`);
  };

  return (
    <div className="d-flex flex-column min-vh-100" style={{ backgroundColor: '#f4f6f8' }}>
      <Header
        pagina01="Dashboard"
        pagina02="Vagas"
        paginaAtiva="Dashboard"
        usuario={dados.aluno}
      />

      <main className="flex-grow-1 py-4">
        <Container style={{ maxWidth: '1200px' }} className="px-3">
          <CardDadosAluno
            nome={dados.aluno.nome}
            curso={perfil.formacao.curso}
            email={dados.aluno.email}
            matricula={dados.aluno.matricula}
            aoEditarPerfil={() => navigate('/sage/aluno/perfil')}
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
                aoVerHistorico={() => navigate('/sage/aluno/estagios')}
              />
            </Col>
          </Row>

          <section className="dashboard-estagios mb-4" aria-labelledby="titulo-meus-estagios">
            <div className="dashboard-estagios-cabecalho">
              <h2 id="titulo-meus-estagios">Meus Estágios</h2>

              <Botao
                tipo="botao-acao-contorno"
                className="gap-2 text-nowrap"
                onClick={() => navigate('/sage/aluno/estagios')}
              >
                Ver todos
                <ArrowRight size={16} aria-hidden="true" />
              </Botao>
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
          <section className="cartao-sage" aria-labelledby="titulo-minhas-candidaturas">
            <div className="candidaturas-aluno-topo">
              <div><h2 id="titulo-minhas-candidaturas" className="cartao-sage-titulo mb-1">Minhas candidaturas</h2><p>Suas inscrições mais recentes</p></div>
              <Botao tipo="botao-acao-contorno" className="gap-2 text-nowrap" onClick={() => navigate('/sage/aluno/candidaturas')}>
                Ver todas <ArrowRight size={16} aria-hidden="true" />
              </Botao>
            </div>
            <ListaCandidaturasAluno candidaturas={candidaturas.slice(0, 3)} />
          </section>
          <VagasSection modoAluno cursoAluno={perfil.formacao.curso} onVerDetalhes={setVagaSelecionada} />
        </Container>
      </main>

      <ModalDetalhesVaga key={vagaSelecionada?.id || 'sem-vaga'} aberto={Boolean(vagaSelecionada)}
        vaga={vagaSelecionada} aoFechar={() => setVagaSelecionada(null)} />

      <Footer />
    </div>
  );
}

export default DashboardAluno;
