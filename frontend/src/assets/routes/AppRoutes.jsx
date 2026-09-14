import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from '../../pages/LandingPage.jsx';
import DashboardAluno from '../../pages/DashboardAluno.jsx';
import VitrineVagas from '../../pages/VitrineVagas.jsx';
import CentralDocumentos from '../../pages/CentralDocumentos.jsx';
import Login from '../../pages/Login.jsx';

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/sage" replace />} />
        <Route path="/sage" element={<LandingPage />} />
        
        {/* Rotas com /sage */}
        <Route path="/sage/aluno" element={<DashboardAluno />} />
        <Route path="/sage/vagas" element={<VitrineVagas />} />
        <Route path="/sage/documentos" element={<CentralDocumentos />} />
        <Route path="/sage/login" element={<Login />} />

        <Route path="*" element={<Navigate to="/sage" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;
