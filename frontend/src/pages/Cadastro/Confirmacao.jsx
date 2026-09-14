import "./Confirmacao.css";

import HeaderCadastro from "../../components/HeaderCadastro/HeaderCadastro.jsx";

import Button from "react-bootstrap/Button";

function Confirmacao() {
  return (
    <div className="confirmacao-page">

      <HeaderCadastro
        passo01="passo-concluido"
        passo02="passo-concluido"
        passo03="passo-concluido"
      />

      <main className="confirmacao-content">

        {/* Título */}
        <div className="titulo-confirmacao">

          <h1>Cadastro de Empresa</h1>

        </div>

        {/* Card */}
        <section className="sucesso-card">

          <h2>Enviado com Sucesso!</h2>

          <p className="texto-sucesso">
            Seu convênio está em análise. Você receberá um e-mail
            quando houver atualizações.
          </p>

          <div className="linha"></div>

          {/* Informações */}

          <div className="informacao">

            <span>Número do pedido</span>

            <strong>123456789</strong>

          </div>

          <div className="informacao">

            <span>Data de envio</span>

            <strong>01/01/2026</strong>

          </div>

          {/* Aviso */}

          <div className="aviso">

            <i className="bi bi-info-circle-fill"></i>

            <span>
              Você receberá um e-mail quando houver atualizações.
            </span>

          </div>

        </section>

        {/* Login */}

        <div className="area-login">

          <Button className="btn-login">
            Login
            <i className="bi bi-chevron-right"></i>
          </Button>

        </div>

      </main>

    </div>
  );
}

export default Confirmacao;