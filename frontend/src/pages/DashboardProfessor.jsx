import React, {useState} from 'react';
import { Container, Row, Col, Card, Table} from 'react-bootstrap';
import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';
import Button from '../components/Button.jsx';
import Input from '../components/Input.jsx';
import Select from '../components/Select.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import dados from '../dados.jsx';
import '../App.css';

function DashboardProfessor(){
    const [busca, setBusca] = useState('');
    const [filtroCurso, setFiltroCurso] = useState('Todos');
    const [filtroAno, setFiltroAno] = useState('Todos');
    return(
        <div className= "d-flex flex-column min-vh-100" style={{ backgroundColor: '#f4f6f8' }}>
            <Header
                pagina01="Dashboard"
                pagina02="Alunos"
                pagina03="Orientadores"
                pagina04="Empresas"
                pagina05="Estágios"
                pagina06="Documentos"
                paginaAtiva={dados.professor}
                />
            <Container className="my-4 flex-grow-1">
                <div className="mb-4">
                    <h2 className="fw-bold mb-1">Gerenciar Alunos</h2>
                    <p className="text-muted small">Monitore a situação dos alunos do campus de forma centralizada</p>
                </div>
            <Row className="g-3 mb-4">
          <Col md={3}>
            <Card className="border-0 shadow-sm p-3">
            <div className="d-flex justify-content-between align-items-center">
            <div>
                <small className="text-muted fw-semibold d-block">Total de Alunos</small>
                <span className="fs-3 fw-bold">234</span>
                <small className="text-muted d-block mt-1">+12 novos este semestre</small>
                </div>
                <div className="bg-light p-2 rounded fs-4">👥</div>
            </div>
            </Card>
          </Col>

          <Col md={3}>
            <Card className="border-0 shadow-sm p-3">
              <div className="d-flex justify-content-between align-items-center">
              <div>
                  <small className="text-muted fw-semibold d-block">Estágios Ativos</small>
                  <span className="fs-3 fw-bold">48</span>
                  <small className="text-muted d-block mt-1">Vínculos regulares vigentes</small>
               </div>
                <div className="bg-light p-2 rounded fs-4">💼</div>
              </div>
            </Card>
          </Col>

          <Col md={3}>
            <Card className="border-0 shadow-sm p-3">
              <div className="d-flex justify-content-between align-items-center">
            <div>
                <small className="text-muted fw-semibold d-block">Pendências Documentais</small>
                <span className="fs-3 fw-bold">15</span>
                <small className="text-muted d-block mt-1">Necessitam de ajustes ou envio</small>
                </div>
            <div className="bg-light p-2 rounded fs-4">⚠️</div>
              </div>
            </Card>
          </Col>

          <Col md={3}>
            <Card className="border-0 shadow-sm p-3">
            <div className="d-flex justify-content-between align-items-center">
            <div>
                <small className="text-muted fw-semibold d-block">Sem Vínculo</small>
                <span className="fs-3 fw-bold">23</span>
                <small className="text-muted d-block mt-1">Disponíveis para contratação</small>
            </div>
                <div className="bg-light p-2 rounded fs-4">👤</div>
              </div>
            </Card>
          </Col>
        </Row>

        <Card className="border-0 shadow-sm p-4 rounded-3">
            <Row className="g-3 mb-4">
                <Col md={6}>
              <Input 
                placeholder="🔍 Buscar por nome ou matrícula..." 
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
              />
            </Col>
            <Col md={3}>
              <Select 
                value={filtroCurso} 
                onChange={(e) => setFiltroCurso(e.target.value)}
              >
                <option value="Todos">Curso: Todos</option>
                <option value="Tecnologia em ADS">Tecnologia em ADS</option>
                <option value="Técnico em Agropecuária">Técnico em Agropecuária</option>
                <option value="Técnico em Informática">Técnico em Informática</option>
                <option value="Técnico em Enfermagem">Técnico em Enfermagem</option>
              </Select>
            </Col>
            <Col md={3}>
              <Select 
                value={filtroAno} 
                onChange={(e) => setFiltroAno(e.target.value)}
              >
                <option value="Todos">Ano/Período: Todos</option>
                <option value="2024.1">2024.1</option>
                <option value="2023.2">2023.2</option>
                <option value="2023.1">2023.1</option>
              </Select>
            </Col>
            </Row>
        </Card>
            </Container>
        </div>
    )
}