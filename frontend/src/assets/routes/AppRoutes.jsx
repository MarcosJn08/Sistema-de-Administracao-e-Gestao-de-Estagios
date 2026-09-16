import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from '../../pages/LandingPage.jsx';
import DashboardAluno from '../../pages/DashboardAluno.jsx';
import VitrineVagas from '../../pages/VitrineVagas.jsx';
import CentralDocumentos from '../../pages/CentralDocumentos.jsx';
import Login from '../../pages/Login.jsx';
import DadosEmpresa from '../../pages/Cadastro/Dados.jsx';
import DocumentosEmpresa from '../../pages/Cadastro/Documentos.jsx';
import ConfirmacaoEmpresa from '../../pages/Cadastro/Confirmacao.jsx';

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/sage" replace />} />
        <Route path="/sage" element={<LandingPage />} />
        
        <Route path="/sage/aluno" element={<DashboardAluno />} />
        <Route path="/sage/vagas" element={<VitrineVagas />} />
        <Route path="/sage/documentos" element={<CentralDocumentos />} />
        <Route path="/sage/login" element={<Login />} />

        <Route path="/sage/cadastro/empresa" element={<DadosEmpresa />} />
        <Route path="/sage/cadastro/documento" element={<DocumentosEmpresa />} />
        <Route path="/sage/cadastro/confirmacao" element={<ConfirmacaoEmpresa />} />

        <Route path="*" element={<Navigate to="/sage" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;
