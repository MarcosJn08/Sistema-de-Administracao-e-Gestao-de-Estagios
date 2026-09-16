import React from 'react';
import '../../App.css';
import Botao from '../Button.jsx';

function CardDadosAluno({ nome, curso, email, matricula, aoEditarPerfil, onEditProfile }) {
  const lidarComEdicao = aoEditarPerfil || onEditProfile;

  return (
    <div className="cartao-sage">
      <h2 className="cartao-sage-titulo mb-3">Dados Aluno</h2>

      <div className="d-flex align-items-start gap-3">
        <div className="avatar-aluno mt-1">
          <svg width="34" height="34" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
          </svg>
        </div>

        <div className="d-flex flex-column gap-2 flex-grow-1" style={{ fontSize: '0.9375rem' }}>
          <div>
            <span className="fw-bold text-dark">Nome: </span>
            <span className="fw-bold text-dark">{nome}</span>
          </div>
          <div>
            <span className="fw-bold text-dark">Curso: </span>
            <span className="text-secondary">{curso}</span>
          </div>
          <div>
            <span className="fw-bold text-dark">Email: </span>
            <span className="text-secondary">{email}</span>
          </div>

          <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
            <div>
              <span className="fw-bold text-dark">Numero de Matrícula: </span>
              <span className="text-secondary">{matricula}</span>
            </div>
            <Botao tipo="botao-sage-verde" onClick={lidarComEdicao}>
              Editar Perfil
            </Botao>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CardDadosAluno;
