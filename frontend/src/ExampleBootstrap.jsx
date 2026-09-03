import React, { useState } from 'react';
import { Container, Card, Button, Alert } from 'react-bootstrap';
import { CheckCircle, Award } from 'lucide-react';

function App() {
  const [testado, setTestado] = useState(false);

  return (
    <Container className="d-flex justify-content-center align-items-center min-vh-100 bg-light">
      <Card style={{ width: '30rem' }} className="shadow-lg border-0 rounded-4">
        <Card.Body className="p-4 text-center">
          
          {/* Cabeçalho do Card */}
          <div className="mb-3 d-flex justify-content-center align-items-center text-success gap-2">
            <Award size={36} />
            <span className="fs-3 fw-bold">SAGE - IFNMG</span>
          </div>
          
          <Card.Title className="h5 fw-bold mb-3">
            Teste de Configuração do Front-end
          </Card.Title>
          
          <Card.Text className="text-muted">
            Se este card estiver centralizado na tela, com bordas arredondadas, uma sombra suave e o botão verde abaixo, o <strong>Bootstrap está rodando perfeitamente!</strong>
          </Card.Text>

          {/* Botão de Interação */}
          <div className="d-grid gap-2 mt-4">
            <Button 
              variant="success" 
              size="lg" 
              className="fw-bold"
              onClick={() => setTestado(true)}
            >
              Testar Componentes React
            </Button>
          </div>

          {/* Elemento que aparece após o clique para testar o estado do React */}
          {testado && (
            <Alert variant="success" className="mt-3 d-flex align-items-center justify-content-center gap-2 border-0 rounded-3">
              <CheckCircle size={20} />
              <span><strong>Sucesso!</strong> Bootstrap CSS, componentes e estados funcionando!</span>
            </Alert>
          )}

        </Card.Body>
      </Card>
    </Container>
  );
}

export default App;