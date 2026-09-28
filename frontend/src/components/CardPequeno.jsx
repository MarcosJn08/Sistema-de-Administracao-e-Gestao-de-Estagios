import Card from "react-bootstrap/Card";

function CardPequeno({ titulo, valor, icone, texto, cor }) {
  return (
    <Card
      className="h-100"
      style={{
        width: "100%",
        borderRadius: "20px",
        border: "1px solid #dee2e6",
      }}
    >
      <Card.Body>
        <div className="d-flex justify-content-between align-items-start">
          <div>
            <Card.Title
              style={{
                color: "#687386",
                fontSize: "18px",
                fontWeight: "500",
              }}
            >
              {titulo}
            </Card.Title>

            <Card.Text
              style={{
                color: "#182033",
                fontSize: "42px",
                fontWeight: "700",
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
              borderRadius: "8px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: cor,
              flexShrink: 0,
            }}
          >
            <i className={icone}></i>
          </div>
        </div>

        <Card.Text
          style={{
            color: "#687386",
            fontSize: "16px",
            marginTop: "25px",
          }}
        >
          {texto}
        </Card.Text>
      </Card.Body>
    </Card>
  );
}

export default CardPequeno;
