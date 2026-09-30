import {
  Card,
  Col,
  Container,
  Row,
  Table,
} from 'react-bootstrap';

import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';
import CardPequeno from '../components/CardPequeno.jsx';
import Input from '../components/Input.jsx';
import Select from '../components/Select.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import Button from '../components/Button.jsx';

import dados from '../dadosProfessor.jsx';

import './DashboardProfessor.css';

export default function DashboardProfessor() {
  const linksProfessor = [ 
    ['Dashboard', '/sage/professor'],
    ['Alunos', '#'],
    ['Orientadores', '#'],
    ['Empresas', '#'],
    ['Estágios', '#'],
    ['Documentos', '#'],
  ];

  return (
    <>
      <Header
        usuario={dados.professor}
        customLinks={linksProfessor}
        paginaAtiva="Dashboard"
      />

      <main className="dashboard-professor">
        <Container className="py-5 dashboard-professor-container">
          <section className="mb-4">
            <h1 className="dashboard-professor-titulo">
              Gerenciar Alunos
            </h1>

            <p className="dashboard-professor-subtitulo">
              Monitore a situação dos alunos do campus de forma centralizada
            </p>
          </section>

          {/* Indicadores */}
          <Row className="g-4 mb-4">
            {dados.indicadores.map((indicador) => (
              <Col key={indicador.id} xs={12} sm={6} xl={3}>
                <CardPequeno
                  titulo={indicador.titulo}
                  valor={indicador.valor}
                  texto={indicador.texto}
                  icone={indicador.icone}
                  cor={indicador.cor}
                  corFundo={indicador.corFundo}
                />
              </Col>
            ))}
          </Row>

          {/* Card principal */}
          <Card className="dashboard-professor-card">
            <Card.Body className="p-4">
              {/* Filtros */}
              <Row className="g-3 align-items-start">
                <Col xs={12} lg={7}>
                  <div className="dashboard-professor-busca">
                    <i className="bi bi-search dashboard-professor-busca-icone" />

                    <Input
                      id="buscar-aluno"
                      tipo="text"
                      textoDeFundo="Buscar por nome ou matrícula..."
                    />
                  </div>
                </Col>

                <Col xs={12} md={6} lg={2}>
                  <Select
                    id="filtro-curso"
                    valorPadrao=""
                    opcoes={dados.filtros.cursos}
                  />
                </Col>

                <Col xs={12} md={6} lg={3}>
                  <Select
                    id="filtro-periodo"
                    valorPadrao=""
                    opcoes={dados.filtros.periodos}
                  />
                </Col>
              </Row>

              {/* Tabela */}
              <div className="table-responsive dashboard-professor-tabela">
                <Table
                  hover
                  responsive
                  className="align-middle mb-0"
                >
                  <thead>
                    <tr>
                      <th>Matrícula</th>
                      <th>Nome do Aluno</th>
                      <th>Curso</th>
                      <th>Empresa Concedente</th>
                      <th>Status</th>
                      <th className="text-end">
                        Ações
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {dados.alunos.map((aluno) => (
                      <tr key={aluno.matricula}>
                        <td className="dashboard-professor-aluno-destaque">
                          {aluno.matricula}
                        </td>

                        <td className="dashboard-professor-aluno-destaque">
                          {aluno.nome}
                        </td>

                        <td>
                          {aluno.curso}
                        </td>

                        <td>
                          {aluno.empresa}
                        </td>

                        <td>
                          <StatusBadge
                            status={aluno.status}
                          />
                        </td>

                        <td className="text-end">
                          <Button
                            texto="Ver Perfil"
                            tipo="botao-sage-verde"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>

              {/* Paginação */}
              <div
                className="
                  d-flex
                  flex-column
                  flex-sm-row
                  justify-content-between
                  align-items-sm-center
                  gap-3
                  mt-4
                "
              >
                <span className="dashboard-professor-paginacao-texto">
                  Mostrando 6 de 234 alunos
                </span>

                <div className="dashboard-professor-paginacao">
                  <button
                    type="button"
                    className="btn btn-outline-secondary btn-sm"
                  >
                    Anterior
                  </button>

                  <button
                    type="button"
                    className="btn btn-success btn-sm"
                  >
                    1
                  </button>

                  <button
                    type="button"
                    className="btn btn-outline-secondary btn-sm"
                  >
                    Próxima
                  </button>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Container>
      </main>

      <Footer />
    </>
  );
}