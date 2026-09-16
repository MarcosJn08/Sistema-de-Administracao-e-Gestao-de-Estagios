import "./Confirmacao.css";
import HeaderCadastro from "../../components/cadastro/HeaderCadastro.jsx";
import Botao from "../../components/Button.jsx";
import InfoLinha from "../../components/cadastro/InfoLinha.jsx";

function Confirmacao() {
  return (
    <div className="confirmacao-page">
      <HeaderCadastro
        passo01="passo-concluido"
        passo02="passo-concluido"
        passo03="passo-concluido"
      />

      <main className="confirmacao-content">
        <section className="sucesso-card">
          <h2>Enviado com Sucesso!</h2>

          <p className="texto-sucesso">
            Seu convênio está em análise. Você receberá um e-mail
            quando houver atualizações sobre o status do cadastro.
          </p>

          <div className="linha"></div>

          <InfoLinha rotulo="Número do pedido" valor="#123456789" />
          <InfoLinha rotulo="Data de envio" valor="01/01/2026" />
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
    </div>
  );
}

export default Confirmacao;