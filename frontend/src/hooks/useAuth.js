import { createContext, useContext } from 'react';

export const AuthContext = createContext(null);

const dashboards = {
  aluno: '/sage/aluno',
  professor: '/sage/professor',
  diretor: '/sage/diretor',
  empresa: '/sage/empresa',
};

export function getDashboardPath(role) {
  return dashboards[role] || '/sage/login';
}

export function getPostLoginPath(role, requestedPath) {
  const dashboard = dashboards[role];
  if (!dashboard) return '/sage/login';
  if (typeof requestedPath !== 'string') return dashboard;

  const pathname = requestedPath.split(/[?#]/)[0];
  const ownArea = pathname === dashboard || pathname.startsWith(`${dashboard}/`);
  const studentAction = role === 'aluno' && (
    /^\/sage\/vagas\/[^/]+\/candidatura$/.test(pathname)
    || pathname === '/sage/enviar-documento'
    || pathname === '/sage/estagio'
  );

  return ownArea || studentAction ? requestedPath : dashboard;
}

export default function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth deve ser usado dentro de AuthProvider.');
  return context;
}
