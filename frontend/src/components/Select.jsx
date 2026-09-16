import React from 'react';
import Form from 'react-bootstrap/Form';

function Select({ id, titulo, valorPadrao, defaultValue, children, opcoes = [], onChange, value, className = '', ...props }) {
  const defaultVal = valorPadrao ?? defaultValue;
  return (
    <Form.Group className={`input-container ${className}`.trim()} controlId={id}>
      {titulo && <Form.Label>{titulo}</Form.Label>}
      <Form.Select defaultValue={defaultVal} value={value} onChange={onChange} {...props}>
        {children ? children : (
          opcoes.map((opcao) => (
            <option key={opcao.valor ?? opcao} value={opcao.valor ?? opcao}>
              {opcao.rotulo ?? opcao.label ?? opcao}
            </option>
          ))
        )}
      </Form.Select>
    </Form.Group>
  );
}

export default Select;
