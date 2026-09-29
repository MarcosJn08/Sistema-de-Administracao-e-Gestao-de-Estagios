import Card from "react-bootstrap/Card";

/**
 * Card de indicador (número + legenda).
 *
 * - Sem `corFundo`: comportamento antigo (quadrado sólido com `cor` e ícone branco).
 * - Com `corFundo`: quadrado suave com `corFundo` e ícone colorido com `cor`.
 */
function CardPequeno({ titulo, valor, icone, texto, cor, corFundo }) {
  const suave = Boolean(corFundo);

  return (
    <Card
      className="h-100"
      style={{
        width: "100%",
        borderRadius: "18px",
        border: "1px solid rgba(0, 0, 0, 0.05)",
        boxShadow: "0 1px 4px rgba(0, 0, 0, 0.03)",
      }}
    >
      <Card.Body>
        <div className="d-flex justify-content-between align-items-start">
          <div>
            <Card.Title
              style={{
                color: "#687386",
                fontSize: "15px",
                fontWeight: "500",
              }}
            >
              {titulo}
            </Card.Title>

            <Card.Text
              style={{
                color: "#182033",
                fontSize: "38px",
                fontWeight: "700",
                lineHeight: 1.1,
                margin: 0,
              }}
            >
              {valor}
            </Card.Text>
          </div>

          <div
            style={{
              width: "45px",
              height: "45px",
              borderRadius: "10px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: suave ? corFundo : cor,
              flexShrink: 0,
            }}
          >
            <i
              className={icone}
              style={suave ? { color: cor } : undefined}
              aria-hidden="true"
            ></i>
          </div>
        </div>

        {texto && (
          <Card.Text
            style={{
              color: "#687386",
              fontSize: "14px",
              marginTop: "16px",
              marginBottom: 0,
            }}
          >
            {texto}
          </Card.Text>
        )}
      </Card.Body>
    </Card>
  );
}

export default CardPequeno;
