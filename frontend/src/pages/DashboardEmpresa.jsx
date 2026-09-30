import React, { useState } from 'react';
import { Row, Col } from 'react-bootstrap';
import { Plus, Briefcase, Users, Filter, Handshake } from 'lucide-react';
import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';
import CardMetricaEmpresa from '../components/empresa/CardMetricaEmpresa.jsx';
import TabelaVagasEmpresa from '../components/empresa/TabelaVagasEmpresa.jsx';
import ModalNovaVaga from '../components/empresa/ModalNovaVaga.jsx';
import dados from '../dadosEmpresa.jsx';
import './DashboardEmpresa.css';

function DashboardEmpresa() {
  const [vagas, setVagas] = useState(dados.empresa?.vagas || []);
  const [metricas, setMetricas] = useState(
    dados.empresa?.metricas || {
      vagasAtivas: 8,
      candidatosTotais: 47,
      emTriagem: 12,
      contratados: 5,
    }
  );
  const [modalAberto, setModalAberto] = useState(false);

  const lidarComNovaVaga = (novaVaga) => {
    setVagas([novaVaga, ...vagas]);
    setMetricas((prev) => ({
      ...prev,
      vagasAtivas: prev.vagasAtivas + 1,
    }));
  };

  const lidarComAlternarStatus = (vagaId) => {
    setVagas((prevVagas) =>
      prevVagas.map((vaga) => {
        if (vaga.id === vagaId) {
          const novoStatus = vaga.status === 'Ativa' ? 'Encerrada' : 'Ativa';
          return { ...vaga, status: novoStatus, ativa: novoStatus === 'Ativa' };
        }
        return vaga;
      })
    );

    setVagas((currentVagas) => {
      const ativas = currentVagas.filter((v) => v.status === 'Ativa').length;
      setMetricas((prev) => ({
        ...prev,
        vagasAtivas: ativas,
      }));
      return currentVagas;
    });
  };

  const linksNavegacaoEmpresa = [
    ['Dashboard', '/sage/empresa'],
    ['Estagiários', '/sage/empresa/estagiarios'],
  ];

  return (
    <div className="dashboard-empresa-wrapper">
      <Header
        paginaAtiva="Dashboard"
        customLinks={linksNavegacaoEmpresa}
        usuario={{
          nome: dados.empresa?.nome || 'Shelby LTDA',
          tipo: 'empresa',
        }}
        mostrarBotaoSair={false}
      />

      <main className="flex-grow-1">
        <div className="dashboard-empresa-container">
          <div className="dashboard-empresa-header">
            <div>
              <h1 className="dashboard-empresa-title">Gestão de Vagas</h1>
              <p className="dashboard-empresa-subtitle">
                Gerencie suas vagas publicadas e acompanhe candidatos
              </p>
            </div>

            <button
              type="button"
              className="btn-nova-vaga"
              onClick={() => setModalAberto(true)}
              id="btn-nova-vaga"
            >
              <Plus size={18} strokeWidth={2.5} />
              Nova Vaga
            </button>
          </div>

          <Row className="g-4 mb-4">
            <Col xs={12} sm={6} lg={3}>
              <CardMetricaEmpresa
                titulo="Vagas Ativas"
                valor={metricas.vagasAtivas}
                icone={Briefcase}
              />
            </Col>
            <Col xs={12} sm={6} lg={3}>
              <CardMetricaEmpresa
                titulo="Candidatos Totais"
                valor={metricas.candidatosTotais}
                icone={Users}
              />
            </Col>
            <Col xs={12} sm={6} lg={3}>
              <CardMetricaEmpresa
                titulo="Em Triagem"
                valor={metricas.emTriagem}
                icone={Filter}
              />
            </Col>
            <Col xs={12} sm={6} lg={3}>
              <CardMetricaEmpresa
                titulo="Contratados"
                valor={metricas.contratados}
                icone={Handshake}
              />
            </Col>
          </Row>

          <TabelaVagasEmpresa
            vagas={vagas}
            onAlternarStatus={lidarComAlternarStatus}
            onEditarVaga={() => {
              setModalAberto(true);
            }}
          />
        </div>
      </main>

      <ModalNovaVaga
        aberto={modalAberto}
        aoFechar={() => setModalAberto(false)}
        aoPublicar={lidarComNovaVaga}
      />

      <Footer />
    </div>
  );
}

export default DashboardEmpresa;
