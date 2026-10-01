import "./Confirmacao.css";
import Botao from "../../components/Button.jsx";
import InfoLinha from "../../components/cadastro/InfoLinha.jsx";
import Footer from "../../components/Footer.jsx";
import { Navigate } from 'react-router-dom';

function obterEnvio() {
  try {
    const envio = sessionStorage.getItem('sage-cadastro-documento');
    return envio ? JSON.parse(envio) : null;
  } catch {
    return null;
  }
}

function Confirmacao() {
  const envio = obterEnvio();
  if (!envio) return <Navigate to="/sage/cadastro/documento" replace />;

  return (
    <div className="confirmacao-page">
      <main className="confirmacao-content">
        <section className="sucesso-card">
          <h2>Enviado com Sucesso!</h2>

          <p className="texto-sucesso">
            Seu convênio está em análise. Você receberá um e-mail
            quando houver atualizações sobre o status do cadastro.
          </p>

          <div className="linha"></div>

          <InfoLinha rotulo="Número do pedido" valor={envio.pedido} />
          <InfoLinha rotulo="Data de envio" valor={new Date(envio.enviadoEm).toLocaleDateString('pt-BR')} />
          <InfoLinha rotulo="Status" valor="Em análise" />

          <div className="aviso">
            <i className="bi bi-info-circle-fill"></i>
            <span>
              Você receberá um e-mail quando houver atualizações.
              O processo pode levar até 5 dias úteis.
            </span>
          </div>
        </section>

        <div className="area-login">
          <Botao texto="Fazer Login" tipo="botao-com-fundo" href="/sage/login">
            <i className="bi bi-chevron-right"></i>
          </Botao>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default Confirmacao;
