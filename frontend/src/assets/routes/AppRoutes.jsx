import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import DashboardAluno from '../../pages/DashboardAluno.jsx';
import VitrineVagas from '../../pages/VitrineVagas.jsx';
import CentralDocumentos from '../../pages/CentralDocumentos.jsx';
import Login from '../../pages/Login.jsx';

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/aluno" element={<DashboardAluno />} />
        <Route path="/vagas" element={<VitrineVagas />} />
        <Route path="/documentos" element={<CentralDocumentos />} />
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;
