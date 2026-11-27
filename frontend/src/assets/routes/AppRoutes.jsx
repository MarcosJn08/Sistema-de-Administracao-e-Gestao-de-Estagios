import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AuthProvider from '../../components/auth/AuthProvider.jsx';
import PrivateRoute from '../../components/auth/PrivateRoute.jsx';
import RoleRoute from '../../components/auth/RoleRoute.jsx';
import LandingPage from '../../pages/LandingPage.jsx';
import PaginaNaoEncontrada from '../../pages/PaginaNaoEncontrada.jsx';
import DashboardAluno from '../../pages/DashboardAluno.jsx';
import PerfilAluno from '../../pages/PerfilAluno.jsx';
import VagasSalvasAluno from '../../pages/VagasSalvasAluno.jsx';
import MinhasCandidaturasAluno from '../../pages/MinhasCandidaturasAluno.jsx';
import VitrineVagas from '../../pages/VitrineVagas.jsx';
import Login from '../../pages/Login.jsx';
import RedefinirSenha from '../../pages/RedefinirSenha.jsx';
import DadosEmpresa from '../../pages/Cadastro/Dados.jsx';
import DocumentosEmpresa from '../../pages/Cadastro/Documentos.jsx';
import ConfirmacaoEmpresa from '../../pages/Cadastro/Confirmacao.jsx';
import TelaEstagio from '../../pages/TelaEstagio.jsx';
import MeusEstagiosAluno from '../../pages/MeusEstagiosAluno.jsx';
import DashboardDiretor from '../../pages/DashboardDiretor.jsx';
import DashboardProfessor from '../../pages/DashboardProfessor.jsx';
import DashboardEmpresa from '../../pages/DashboardEmpresa.jsx';
import PainelAlunosDiretor from '../../pages/PainelAlunosDiretor.jsx';
import PainelOrientadoresDiretor from '../../pages/PainelOrientadoresDiretor.jsx';
import PainelConveniosDiretor from '../../pages/PainelConveniosDiretor.jsx';
import PainelDocumentosDiretor from '../../pages/PainelDocumentosDiretor.jsx';
import GestaoCandidatos from '../../pages/GestaoCandidatos.jsx';
import PerfilCandidato from '../../pages/PerfilCandidato.jsx';
import MeusEstagiarios from '../../pages/MeusEstagiarios.jsx';
import SupervisaoCampo from '../../pages/SupervisaoCampo.jsx';
import EnviarDocumento from "../../pages/EnviarDocumento.jsx";

function AppRoutes() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Navigate to="/sage" replace />} />
          <Route path="/sage" element={<LandingPage />} />

          <Route element={<PrivateRoute />}>
            <Route element={<RoleRoute roles={['aluno']} />}>
              <Route path="/sage/aluno" element={<DashboardAluno />} />
              <Route path="/sage/aluno/perfil" element={<PerfilAluno />} />
              <Route path="/sage/aluno/vagas-salvas" element={<VagasSalvasAluno />} />
              <Route path="/sage/aluno/candidaturas" element={<MinhasCandidaturasAluno />} />
              <Route path="/sage/aluno/candidaturas/:vagaId" element={<MinhasCandidaturasAluno />} />
              <Route path="/sage/aluno/estagios" element={<MeusEstagiosAluno />} />
              <Route path="/sage/aluno/estagios/:estagioId" element={<TelaEstagio />} />
              <Route path="/sage/vagas/:vagaId/candidatura" element={<VitrineVagas />} />
              <Route path="/sage/enviar-documento" element={<EnviarDocumento />} />
              <Route path="/sage/estagio" element={<Navigate to="/sage/aluno/estagios" replace />} />
            </Route>

            <Route element={<RoleRoute roles={['professor']} />}>
              <Route path="/sage/professor" element={<DashboardProfessor />} />
              <Route path="/sage/professor/alunos" element={<DashboardProfessor />} />
              <Route path="/sage/professor/supervisao-campo" element={<SupervisaoCampo />} />
            </Route>

            <Route element={<RoleRoute roles={['diretor']} />}>
              <Route path="/sage/diretor" element={<DashboardDiretor />} />
              <Route path="/sage/diretor/alunos" element={<PainelAlunosDiretor />} />
              <Route path="/sage/diretor/orientadores" element={<PainelOrientadoresDiretor />} />
              <Route path="/sage/diretor/convenios" element={<PainelConveniosDiretor />} />
              <Route path="/sage/diretor/documentos" element={<PainelDocumentosDiretor />} />
            </Route>

            <Route element={<RoleRoute roles={['empresa']} />}>
              <Route path="/sage/empresa" element={<DashboardEmpresa />} />
              <Route path="/sage/empresa/candidatos" element={<GestaoCandidatos />} />
              <Route path="/sage/empresa/vagas/:vagaId/candidatos" element={<GestaoCandidatos />} />
              <Route path="/sage/empresa/candidatos/:candidatoId" element={<PerfilCandidato />} />
              <Route path="/sage/empresa/vagas/:vagaId/candidatos/:candidatoId" element={<PerfilCandidato />} />
              <Route path="/sage/empresa/candidato/perfil" element={<PerfilCandidato />} />
              <Route path="/sage/empresa/estagiarios" element={<MeusEstagiarios />} />
              <Route path="/sage/empresa/estagiarios/:id" element={<MeusEstagiarios />} />
            </Route>
          </Route>

          <Route path="/sage/vagas" element={<VitrineVagas />} />
          <Route path="/sage/vagas/:vagaId" element={<VitrineVagas />} />
          <Route path="/sage/login" element={<Login />} />
          <Route path="/sage/redefinir-senha" element={<RedefinirSenha />} />
          <Route path="/sage/cadastro/empresa" element={<DadosEmpresa />} />
          <Route path="/sage/cadastro/documento" element={<DocumentosEmpresa />} />
          <Route path="/sage/cadastro/confirmacao" element={<ConfirmacaoEmpresa />} />
          <Route path="*" element={<PaginaNaoEncontrada />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default AppRoutes;
