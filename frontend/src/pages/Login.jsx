import React from "react";
import Image from "react-bootstrap/Image";
import "../App.css";
import Nav from "react-bootstrap/Nav";
import { Link, useNavigate } from "react-router-dom";
import Input from "../components/InputLogin/Input.jsx";
import GoogleButton from "../components/GoogleButton.jsx";
import Button from "../components/Button.jsx";
import ImgLogin from "../assets/Login.png";

function Login() {
  const navigate = useNavigate();

  const lidarComLogin = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    navigate("/sage/aluno");
  };

  return (
    <div className="login-container">
      <div className="login-image">
        <Image src={ImgLogin} alt="SAGE — Tela de Login" />
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

        <Nav.Link href="#mudarSenha" style={{ fontSize: '14px', color: '#2e7d32', padding: 0, marginBottom: '8px' }}>
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
    </div>
  );
}

export default Login;
