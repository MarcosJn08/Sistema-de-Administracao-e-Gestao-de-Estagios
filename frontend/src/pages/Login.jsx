import { useState } from "react";
import Image from "react-bootstrap/Image";
import "../App.css";
import Nav from "react-bootstrap/Nav";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import Input from "../components/InputLogin/Input.jsx";
import GoogleButton from "../components/GoogleButton.jsx";
import Button from "../components/Button/Button.jsx";
import ImgLogin from "../assets/LoginHD.png";
import ModalRecuperacaoSenha from "../components/auth/ModalRecuperacaoSenha.jsx";

function Login() {
  const navigate = useNavigate();
  const [parametros, setParametros] = useSearchParams();
  const [recuperacaoAberta, setRecuperacaoAberta] = useState(false);
  const token = parametros.get('token') || '';

  const fecharRecuperacao = () => {
    setRecuperacaoAberta(false);
    const restantes = new URLSearchParams(parametros);
    restantes.delete('token');
    restantes.delete('email');
    setParametros(restantes, { replace: true });
  };

  const lidarComLogin = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    navigate("/sage/aluno");
  };

  return (
    <div className="login-container">
      <div className="login-image">
        <Image src={ImgLogin} alt="SAGE — Tela de Login" width="1062" height="1482" />
      </div>

      <div className="login-content">
        <h1>Bem Vindo ao SAGE</h1>
        <p>Sistema de Administração e Gestão de Estágio</p>

        <Input
          id="email"
          titulo="Email"
          tipo="email"
          texto="Digite seu Email"
        />

        <Input
          id="senha"
          titulo="Senha"
          tipo="password"
          texto="Digite sua senha"
        />

        <Nav.Link as="button" type="button" onClick={() => setRecuperacaoAberta(true)}
          style={{ fontSize: '14px', color: '#2e7d32', padding: 0, marginBottom: '8px' }}>
          Esqueceu a senha?
        </Nav.Link>

        <Button texto="Fazer Login" tipo="botao-com-fundo" href="/sage/aluno" onClick={lidarComLogin} />

        <GoogleButton onClick={() => navigate("/sage/aluno")} />

        <p style={{ fontSize: '14.5px', color: '#647068', textAlign: 'center', marginTop: '14px' }}>
          Não tem uma conta?{' '}
          <Link to="/sage/cadastro/empresa" style={{ color: '#2e7d32', fontWeight: '600', textDecoration: 'none' }}>
            Cadastre-se
          </Link>
        </p>
      </div>
      {(recuperacaoAberta || token) && <ModalRecuperacaoSenha key={token || 'solicitar-link'} token={token}
        emailInicial={parametros.get('email') || ''} aoFechar={fecharRecuperacao} />}
    </div>
  );
}

export default Login;
