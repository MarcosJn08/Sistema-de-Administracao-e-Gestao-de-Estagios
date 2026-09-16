import React from 'react';
import Form from 'react-bootstrap/Form';
import './Input/Input.css';

function Input({ id, titulo, tipo = 'text', textoDeFundo, texto, placeholder, value, onChange, className = '', ...props }) {
  const ph = textoDeFundo ?? texto ?? placeholder;
  return (
    <Form className="w-100">
      <Form.Group className={`input-container ${className}`.trim()} controlId={id}>
        {titulo && <Form.Label>{titulo}</Form.Label>}
        <Form.Control
          type={tipo}
          placeholder={ph}
          value={value}
          onChange={onChange}
          className={className}
          {...props}
        />
      </Form.Group>
    </Form>
  );
}

export default Input;
