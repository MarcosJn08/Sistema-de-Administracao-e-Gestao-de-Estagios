import { useState, useEffect, useRef } from "react";
import Image from "react-bootstrap/Image";
import "../App.css";
import Nav from "react-bootstrap/Nav";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import Input from "../components/InputLogin/Input.jsx";
import Button from "../components/Button/Button.jsx";
import GoogleButton from "../components/GoogleButton.jsx";
import ImgLogin from "../assets/LoginHD.png";
import ModalRecuperacaoSenha from "../components/auth/ModalRecuperacaoSenha.jsx";
import useAuth, { getPostLoginPath } from "../hooks/useAuth.js";
import api from "../services/api.js";

function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, login, loginComGoogleCallback, aplicarSessaoGoogle, error: sessionError } = useAuth();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [sending, setSending] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [notice, setNotice] = useState('');
  const [recuperacaoAberta, setRecuperacaoAberta] = useState(false);
  const codeProcessadoRef = useRef(null);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const code = params.get('code');
    const token = params.get('token');
    const expiresAt = params.get('expires_at');
    const role = params.get('role');
    const googleError = params.get('error');
    const authError = params.get('auth_error');

    if (authError) {
      setError(authError);
      navigate(location.pathname, { replace: true });
      return;
    }

    if (googleError) {
      setError('Permissão negada ou cancelada pelo Google.');
      navigate(location.pathname, { replace: true });
      return;
    }

    if (token && role) {
      aplicarSessaoGoogle(token, expiresAt, role);
      navigate(getPostLoginPath(role, location.state?.from), { replace: true });
      return;
    }

    if (code && codeProcessadoRef.current !== code) {
      codeProcessadoRef.current = code;
      setGoogleLoading(true);
      setError('');
      navigate(location.pathname, { replace: true });

      loginComGoogleCallback(code)
        .then((authenticatedUser) => {
          navigate(getPostLoginPath(authenticatedUser.role, location.state?.from), { replace: true });
        })
        .catch((failure) => {
          let msg = failure.message;
          const erros = failure.response?.data?.errors;
          if (erros?.email?.[0]) {
            msg = erros.email[0];
          } else if (failure.response?.data?.message) {
            msg = failure.response.data.message;
          }
          setError(msg || 'Falha ao autenticar com o Google.');
        })
        .finally(() => {
          setGoogleLoading(false);
        });
    }
  }, [location.search, location.pathname, location.state?.from, loginComGoogleCallback, aplicarSessaoGoogle, navigate]);

  const iniciarLoginGoogle = async () => {
    if (sending || googleLoading) return;
    setGoogleLoading(true);
    setError('');
    setNotice('');
    try {
      const { data } = await api.get('/auth/google/redirect', { skipAuth: true });
      if (data?.url) {
        window.location.href = data.url;
      } else {
        throw new Error('Não foi possível obter a URL de autenticação do Google.');
      }
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Erro ao conectar ao Google.');
      setGoogleLoading(false);
    }
  };

  const lidarComLogin = async (event) => {
    event.preventDefault();
    if (sending) return;
    setSending(true);
    setError('');
    setNotice('');
    setFieldErrors({});
    try {
      const authenticatedUser = await login(identifier, password);
      setPassword('');
      navigate(getPostLoginPath(authenticatedUser.role, location.state?.from), { replace: true });
    } catch (failure) {
      setPassword('');
      setError(failure.message);
      setFieldErrors(failure.errors || {});
    } finally {
      setSending(false);
    }
  };

  if (user) return <Navigate to={getPostLoginPath(user.role, location.state?.from)} replace />;

  return (
    <div className="login-container">
      <div className="login-image">
        <Image src={ImgLogin} alt="SAGE — Tela de Login" width="1062" height="1482" />
      </div>

      <div className="login-content">
        <h1>Bem Vindo ao SAGE</h1>
        <p>Sistema de Administração e Gestão de Estágio</p>

        {(error || sessionError) && <div className="alert alert-danger" role="alert">{error || sessionError}</div>}
        {notice && <div id="login-feature-notice" className="alert alert-info" role="status">{notice}</div>}
        <form onSubmit={lidarComLogin} aria-busy={sending}>
        <Input
          id="identifier"
          name="identifier"
          titulo="E-mail, matrícula, SIAPE ou CNPJ"
          tipo="text"
          texto="Digite seu identificador"
          value={identifier}
          onChange={(event) => setIdentifier(event.target.value)}
          autoComplete="username"
          required
          maxLength={254}
          disabled={sending}
          erro={fieldErrors.identifier?.[0]}
        />

        <Input
          id="senha"
          titulo="Senha"
          tipo="password"
          texto="Digite sua senha"
          name="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          autoComplete="current-password"
          required
          maxLength={1024}
          disabled={sending}
          erro={fieldErrors.password?.[0]}
        />

        <Nav.Link as="button" type="button" onClick={() => setRecuperacaoAberta(true)} disabled={sending}
          style={{ fontSize: '14px', color: '#2e7d32', padding: 0, marginBottom: '8px' }}>
          Esqueceu a senha?
        </Nav.Link>
        <Button type="submit" texto={sending ? 'Entrando…' : 'Fazer Login'} tipo="botao-com-fundo" disabled={sending || googleLoading} className="w-100" />
        </form>
        <GoogleButton onClick={iniciarLoginGoogle} disabled={sending || googleLoading} carregando={googleLoading} />
        <p className="small">
          Alunos e servidores sem acesso devem procurar o Núcleo de Estágio.
          Empresas podem entrar com e-mail de contato ou CNPJ.
        </p>

        <p style={{ fontSize: '14.5px', color: '#647068', textAlign: 'center', marginTop: '14px' }}>
          Representa uma empresa?{' '}
          <Link className="d-inline-block" to="/sage/cadastro/empresa" style={{ color: '#2e7d32', fontWeight: '600', textDecoration: 'none' }}>
            Solicitar cadastro da empresa
          </Link>
        </p>
      </div>
      {recuperacaoAberta && <ModalRecuperacaoSenha
        emailInicial={identifier.includes('@') ? identifier : ''}
        aoFechar={() => setRecuperacaoAberta(false)}
      />}
    </div>
  );
}

export default Login;
