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

const alunos = [
  {
    matricula: '20231234',
    nome: 'Maria Silva',
    curso: 'Tecnologia em ADS',
    empresa: 'Tech Soluções Ltda',
    status: 'Em Andamento',
  },
  {
    matricula: '20231235',
    nome: 'Marcos Junio Rodrigues Sena',
    curso: 'Tecnologia em ADS',
    empresa: 'IFNMG Campus Almenara',
    status: 'Em Andamento',
  },
  {
    matricula: '20240012',
    nome: 'Bruno Oliveira Souza',
    curso: 'Técnico em Agropecuária',
    empresa: 'Fazenda Campo Verde',
    status: 'Concluído',
  },
  {
    matricula: '20240982',
    nome: 'Amanda Costa Duarte',
    curso: 'Técnico em Informática',
    empresa: 'N/A',
    status: 'Sem Vínculo',
  },
  {
    matricula: '20230554',
    nome: 'Gabriel Santos Neves',
    curso: 'Tecnologia em ADS',
    empresa: 'Inova Digital',
    status: 'Pendente',
  },
  {
    matricula: '20230221',
    nome: 'Isabela Martins Rocha',
    curso: 'Técnico em Enfermagem',
    empresa: 'Hospital Municipal',
    status: 'Concluído',
  },
];

export default function DashboardProfessor() {
  const usuario = {
    nome: 'Professor',
  };

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
        usuario={usuario}
        customLinks={linksProfessor}
        paginaAtiva="Dashboard"
      />

      <main
        style={{
          backgroundColor: '#f5f7f6',
          minHeight: '100vh',
        }}
      >
        <Container
          className="py-5"
          style={{
            maxWidth: '1280px',
          }}
        >
          <section className="mb-4">
            <h1
              style={{
                color: '#182033',
                fontSize: '32px',
                fontWeight: '700',
                marginBottom: '6px',
              }}
            >
              Gerenciar Alunos
            </h1>

            <p
              style={{
                color: '#687386',
                fontSize: '15px',
                marginBottom: 0,
              }}
            >
              Monitore a situação dos alunos do campus de forma centralizada
            </p>
          </section>

          <Row className="g-3 mb-4">
            <Col xs={12} sm={6} xl={3}>
              <CardPequeno
                titulo="Total de Alunos"
                valor="234"
                texto="+12 novos este semestre"
                icone="bi bi-people"
                cor="#246b3c"
                corFundo="#e4f4e8"
              />
            </Col>

            <Col xs={12} sm={6} xl={3}>
              <CardPequeno
                titulo="Estágios Ativos"
                valor="48"
                texto="Vínculos regulares vigentes"
                icone="bi bi-file-earmark-text"
                cor="#3977a8"
                corFundo="#e5f1fa"
              />
            </Col>

            <Col xs={12} sm={6} xl={3}>
              <CardPequeno
                titulo="Pendências Documentais"
                valor="15"
                texto="Necessitam de ajustes ou envio"
                icone="bi bi-exclamation-triangle"
                cor="#9a7312"
                corFundo="#fff6d8"
              />
            </Col>

            <Col xs={12} sm={6} xl={3}>
              <CardPequeno
                titulo="Sem Vínculo"
                valor="23"
                texto="Disponíveis para contratação"
                icone="bi bi-person-plus"
                cor="#8e4550"
                corFundo="#f9e7e9"
              />
            </Col>
          </Row>

          <Card
            style={{
              borderRadius: '18px',
              border: '1px solid rgba(0, 0, 0, 0.05)',
              boxShadow: '0 3px 12px rgba(0, 0, 0, 0.05)',
            }}
          >
            <Card.Body className="p-4">
              {/* Filtros */}
              <Row className="g-3 align-items-start">
                <Col xs={12} lg={7}>
                  <div className="position-relative">
                    <i
                      className="bi bi-search position-absolute"
                      style={{
                        left: '16px',
                        top: '16px',
                        color: '#7b8495',
                        zIndex: 3,
                      }}
                    />

                    <Input
                      id="buscar-aluno"
                      tipo="text"
                      textoDeFundo="Buscar por nome ou matrícula..."
                      style={{
                        paddingLeft: '45px',
                      }}
                    />
                  </div>
                </Col>

                <Col xs={12} md={6} lg={2}>
                  <Select id="filtro-curso" valorPadrao="">
                    <option value="">Curso: Todos</option>
                    <option value="ads">
                      Tecnologia em ADS
                    </option>
                    <option value="informatica">
                      Técnico em Informática
                    </option>
                    <option value="agropecuaria">
                      Técnico em Agropecuária
                    </option>
                    <option value="enfermagem">
                      Técnico em Enfermagem
                    </option>
                  </Select>
                </Col>

                <Col xs={12} md={6} lg={3}>
                  <Select id="filtro-periodo" valorPadrao="">
                    <option value="">
                      Ano/Período: Todos
                    </option>
                    <option value="2026-1">
                      2026/1
                    </option>
                    <option value="2026-2">
                      2026/2
                    </option>
                  </Select>
                </Col>
              </Row>

              <div
                className="table-responsive"
                style={{
                  border: '1px solid #edf0ee',
                  borderRadius: '12px',
                  overflow: 'hidden',
                }}
              >
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
                    {alunos.map((aluno) => (
                      <tr key={aluno.matricula}>
                        <td
                          style={{
                            fontWeight: '600',
                            color: '#182033',
                          }}
                        >
                          {aluno.matricula}
                        </td>

                        <td
                          style={{
                            fontWeight: '600',
                            color: '#182033',
                          }}
                        >
                          {aluno.nome}
                        </td>

                        <td
                          style={{
                            color: '#687386',
                          }}
                        >
                          {aluno.curso}
                        </td>

                        <td
                          style={{
                            color: '#687386',
                          }}
                        >
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
                <span
                  style={{
                    color: '#687386',
                    fontSize: '13px',
                  }}
                >
                  Mostrando 6 de 234 alunos
                </span>

                <div className="d-flex align-items-center gap-2">
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