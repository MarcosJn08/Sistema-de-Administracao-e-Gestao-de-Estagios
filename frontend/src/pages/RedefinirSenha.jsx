import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import ModalRecuperacaoSenha from '../components/auth/ModalRecuperacaoSenha.jsx';
import useAuth from '../hooks/useAuth.js';

export default function RedefinirSenha() {
  const [parametros] = useSearchParams();
  const navigate = useNavigate();
  const { clearResetAccountSession } = useAuth();
  const token = parametros.get('token');
  const email = parametros.get('email');

  if (!token || !email) {
    return (
      <main className="container py-5 text-center">
        <h1>Link de recuperação inválido</h1>
        <p>Solicite um novo link na tela de login.</p>
        <Link to="/sage/login" className="btn btn-success" replace>Voltar para o login</Link>
      </main>
    );
  }

  return <ModalRecuperacaoSenha
    key={`${token}:${email}`}
    token={token}
    emailInicial={email}
    aoFechar={() => navigate('/sage/login', { replace: true })}
    aoRedefinir={clearResetAccountSession}
  />;
}
