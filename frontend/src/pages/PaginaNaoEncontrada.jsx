import { Link } from 'react-router-dom';
import useAuth, { getDashboardPath } from '../hooks/useAuth.js';

export default function PaginaNaoEncontrada() {
  const { isAuthenticated, role } = useAuth();

  return (
    <main className="container min-vh-100 d-flex flex-column justify-content-center align-items-center text-center">
      <p className="display-1 fw-bold text-success mb-0" style={{fontSize: '8em'}}>404</p>
      <h1 className="mt-2">Página não encontrada</h1>
      <p className="text-muted mb-4">Confira o endereço ou volte para uma página conhecida do SAGE.</p>
      <div className="d-flex flex-wrap justify-content-center gap-3">
        <Link className="btn btn-success" to="/sage">Ir para o início</Link>
        {isAuthenticated && (
          <Link className="btn btn-outline-success" to={getDashboardPath(role)}>Ir para meu painel</Link>
        )}
      </div>
    </main>
  );
}
