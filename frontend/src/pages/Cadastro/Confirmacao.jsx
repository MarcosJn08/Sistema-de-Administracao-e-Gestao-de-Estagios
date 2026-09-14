import "./Confirmacao.css";
import HeaderCadastro from "../../components/HeaderCadastro/HeaderCadastro.jsx";
import Botao from "../../components/Button/Button.jsx";

function Confirmacao() {
  return (
    <div className="confirmacao-page">
      <HeaderCadastro
        passo01="passo-concluido"
        passo02="passo-concluido"
        passo03="passo-concluido"
      />

      <main className="confirmacao-content">
        {/* Card */}
        <section className="sucesso-card">
          <h2>Enviado com Sucesso!</h2>

          <p className="texto-sucesso">
            Seu convênio está em análise. Você receberá um e-mail
            quando houver atualizações sobre o status do cadastro.
          </p>

          <div className="linha"></div>

          {/* Informações */}
          <div className="informacao">
            <span>Número do pedido</span>
            <strong>#123456789</strong>
          </div>

          <div className="informacao">
            <span>Data de envio</span>
            <strong>01/01/2026</strong>
          </div>

          <div className="informacao">
            <span>Status</span>
            <strong>Em análise</strong>
          </div>

          {/* Aviso */}
          <div className="aviso">
            <i className="bi bi-info-circle-fill"></i>
            <span>
              Você receberá um e-mail quando houver atualizações.
              O processo pode levar até 5 dias úteis.
            </span>
          </div>
        </section>

        {/* Botão login — canto direito */}
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