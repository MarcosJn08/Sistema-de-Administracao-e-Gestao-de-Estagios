import Image from "react-bootstrap/Image";
import "../App.css";
import Nav from "react-bootstrap/Nav";

import Input from "../components/Input/Input.jsx";
import GoogleButton from "../components/GoogleButton.jsx";
import Button from "../components/Button/Button.jsx";

import ImgLogin from "../assets/Login.png";

function Login() {
  return (
    <div className="login-container">
      <div className="login-image">
        <Image src={ImgLogin} />
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
          <p>
            <Nav.Link href="#mudarSenha">Esqueceu a senha?</Nav.Link>
          </p>
          <p></p>
          <Button texto="Fazer Login" tipo="botao-com-fundo" />
          <p>Or</p>
          <GoogleButton />

      </div>
    </div>
  );
}

export default Login;
