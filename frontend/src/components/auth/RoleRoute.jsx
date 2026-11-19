import { Navigate, Outlet } from 'react-router-dom';
import useAuth, { getDashboardPath } from '../../hooks/useAuth.js';

export default function RoleRoute({ roles }) {
  const { role, hasRole } = useAuth();

  if (!hasRole(...roles)) return <Navigate to={getDashboardPath(role)} replace />;

  return <Outlet />;
}
