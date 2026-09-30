import React, { useState } from "react";
import { Card } from "react-bootstrap";
import Header from "../components/Header.jsx";
import Footer from "../components/Footer.jsx";
import Button from "../components/Button.jsx";
import Status from "../components/status/status.jsx";
import Icone from "../components/Icone/Icone.jsx";
import InfoItem from "../components/Documentos/InfoItem.jsx";
import Bloco from "../components/Documentos/Bloco.jsx";
import ArquivoItem from "../components/Documentos/ArquivoItem.jsx";
import CampoMensagem from "../components/Documentos/CampoMensagem.jsx";

const tce = {
  titulo: "Termo de Compromisso de Estágio (TCE)",
  status: "Aprovado",
  dataEnvio: "01/08/2026",
  destinatario: "Diretor de Estágio",
  descricao:
    "Documento que formaliza o vínculo entre o estudante, a instituição de ensino e a empresa concedente do estágio.",
  arquivo: { nome: "TCE_Estagio_IFNMG.pdf", tamanho: "1,2 MB", url: "#" },
};

function EnviarDocumento() {
  const [mensagem, setMensagem] = useState(
    "Segue em anexo o Termo de Compromisso de Estágio (TCE) para análise e assinatura.\nQualquer dúvida, estou à disposição!"
  );

  return (
    <div className="d-flex flex-column min-vh-100 bg-light">
      <Header pagina01="Dashboard" pagina02="Vagas" paginaAtiva="Dashboard" />

      <main className="flex-grow-1 container py-4">
        <Card className="border-0 shadow-sm rounded-4">
          <Card.Body className="pb-0">
            {/* Topo */}
            <div className="d-flex align-items-center gap-3 pb-3 border-bottom">
              <Icone elemento="file-earmark-text" fundo="#d7f7e5" />
              <div>
                <h1 className="fs-5 fw-bold mb-1">{tce.titulo}</h1>
                <Status nome={tce.status} tipo="status-aprovado" />
              </div>
            </div>

            <div className="d-flex flex-wrap gap-4 gap-md-5 py-3 mb-3 border-bottom">
              <InfoItem icone="calendar3" label="Data de envio" valor={tce.dataEnvio} />
              <InfoItem icone="check-circle-fill" label="Status atual" valor={tce.status} destaque />
              <InfoItem icone="bank" label="Destinatário" valor={tce.destinatario} />
            </div>

            <Bloco icone="file-earmark-text" titulo="Descrição">
              {tce.descricao}
            </Bloco>

            <Bloco icone="paperclip" titulo="Arquivo do documento">
              <ArquivoItem {...tce.arquivo} />
            </Bloco>

            <CampoMensagem valor={mensagem} onChange={setMensagem} />
          </Card.Body>

          <Card.Footer className="bg-white d-flex justify-content-end py-3">
            <Button variant="success">
              <i className="bi bi-send-fill me-2"></i>Enviar novamente
            </Button>
          </Card.Footer>
        </Card>
      </main>

      <Footer />
    </div>
  );
}

export default EnviarDocumento;