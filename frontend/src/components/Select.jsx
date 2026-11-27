import React, { useState, useRef, useEffect, useMemo } from 'react';
import Form from 'react-bootstrap/Form';
import { ChevronDown, X, Check } from 'lucide-react';
import './Select.css';

function extrairTexto(conteudo) {
  if (conteudo == null) return '';
  if (typeof conteudo === 'string' || typeof conteudo === 'number') return String(conteudo);
  if (Array.isArray(conteudo)) return conteudo.map(extrairTexto).join('');
  if (React.isValidElement(conteudo)) return extrairTexto(conteudo.props.children);
  return String(conteudo);
}

const normalizar = (valor) =>
  String(valor ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();

function Select({
  id,
  titulo,
  valorPadrao,
  defaultValue,
  children,
  opcoes = [],
  onChange,
  value,
  className = '',
  pesquisavel = false,
  placeholderBusca = 'Pesquisar...',
  ...props
}) {
  const defaultVal = valorPadrao ?? defaultValue;
  const valorAtual = value !== undefined ? value : defaultVal;

  const [aberto, setAberto] = useState(false);
  const [busca, setBusca] = useState('');
  const [indiceFocado, setIndiceFocado] = useState(0);

  const containerRef = useRef(null);
  const inputRef = useRef(null);
  const listaRef = useRef(null);

  const itens = useMemo(() => {
    if (children) {
      return React.Children.toArray(children)
        .filter((child) => React.isValidElement(child))
        .map((child) => ({
          valor: String(child.props.value ?? ''),
          rotulo: extrairTexto(child.props.children),
          disabled: Boolean(child.props.disabled),
        }));
    }
    return opcoes.map((opcao) => {
      if (typeof opcao === 'object' && opcao !== null) {
        return {
          valor: String(opcao.valor ?? opcao.value ?? opcao.id ?? ''),
          rotulo: String(opcao.rotulo ?? opcao.label ?? opcao.nome ?? opcao.valor ?? ''),
          disabled: Boolean(opcao.disabled),
        };
      }
      return {
        valor: String(opcao),
        rotulo: String(opcao),
        disabled: false,
      };
    });
  }, [children, opcoes]);

  const itemVazio = useMemo(() => itens.find((it) => it.valor === ''), [itens]);
  const placeholderPadrao = itemVazio?.rotulo || 'Selecione uma opção';

  const opcaoSelecionada = useMemo(
    () => itens.find((it) => String(it.valor) === String(valorAtual) && it.valor !== ''),
    [itens, valorAtual]
  );

  const opcoesValidas = useMemo(() => itens.filter((it) => it.valor !== ''), [itens]);

  const opcoesFiltradas = useMemo(() => {
    const termo = normalizar(busca);
    if (!termo) {
      return itens;
    }
    return opcoesValidas.filter((it) => normalizar(it.rotulo).includes(termo));
  }, [itens, opcoesValidas, busca]);

  useEffect(() => {
    const handleClickFora = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setAberto(false);
        setBusca('');
      }
    };
    document.addEventListener('mousedown', handleClickFora);
    return () => document.removeEventListener('mousedown', handleClickFora);
  }, []);

  useEffect(() => {
    if (aberto && listaRef.current && indiceFocado >= 0) {
      const elemento = listaRef.current.children[indiceFocado];
      if (elemento) {
        elemento.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [indiceFocado, aberto]);

  const selecionarOpcao = (opcao) => {
    if (opcao.disabled) return;
    setAberto(false);
    setBusca('');
    if (typeof onChange === 'function') {
      onChange({
        target: {
          value: opcao.valor,
          id,
          name: props.name,
        },
      });
    }
  };

  const limparSelecao = (e) => {
    e.stopPropagation();
    setBusca('');
    setAberto(false);
    if (typeof onChange === 'function') {
      onChange({
        target: {
          value: '',
          id,
          name: props.name,
        },
      });
    }
    inputRef.current?.focus();
  };

  const handleKeyDown = (e) => {
    if (props.disabled) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!aberto) {
        setAberto(true);
      } else {
        setIndiceFocado((prev) => (prev < opcoesFiltradas.length - 1 ? prev + 1 : prev));
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (aberto) {
        setIndiceFocado((prev) => (prev > 0 ? prev - 1 : 0));
      }
    } else if (e.key === 'Enter') {
      if (aberto && opcoesFiltradas.length > 0 && indiceFocado >= 0 && indiceFocado < opcoesFiltradas.length) {
        e.preventDefault();
        selecionarOpcao(opcoesFiltradas[indiceFocado]);
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setAberto(false);
      setBusca('');
    } else if (e.key === 'Tab') {
      setAberto(false);
      setBusca('');
    }
  };

  if (!pesquisavel) {
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

  const textoPlaceholder = opcaoSelecionada
    ? opcaoSelecionada.rotulo
    : (aberto ? placeholderBusca : placeholderPadrao);

  return (
    <Form.Group className={`input-container ${className}`.trim()} controlId={id}>
      {titulo && <Form.Label onClick={() => inputRef.current?.focus()}>{titulo}</Form.Label>}
      <div className="select-pesquisavel-container" ref={containerRef}>
        <div
          className={`select-pesquisavel-control ${aberto ? 'aberto' : ''} ${props.disabled ? 'desabilitado' : ''}`}
          onClick={() => {
            if (!props.disabled) {
              setAberto((prev) => !prev);
              inputRef.current?.focus();
            }
          }}
        >
          <input
            ref={inputRef}
            type="text"
            id={id ? `${id}-search` : undefined}
            className="select-pesquisavel-input"
            placeholder={textoPlaceholder}
            value={aberto ? busca : (opcaoSelecionada ? opcaoSelecionada.rotulo : '')}
            onChange={(e) => {
              setBusca(e.target.value);
              if (!aberto) setAberto(true);
              setIndiceFocado(0);
            }}
            onFocus={() => {
              if (!props.disabled) {
                setAberto(true);
              }
            }}
            onKeyDown={handleKeyDown}
            disabled={props.disabled}
            autoComplete="off"
            aria-autocomplete="list"
            aria-expanded={aberto}
            aria-haspopup="listbox"
            role="combobox"
          />
          <div className="select-pesquisavel-acoes">
            {opcaoSelecionada && !props.disabled && (
              <button
                type="button"
                className="select-pesquisavel-limpar"
                onClick={limparSelecao}
                title="Limpar seleção"
                tabIndex={-1}
              >
                <X size={16} aria-hidden="true" />
              </button>
            )}
            <span className={`select-pesquisavel-seta ${aberto ? 'girada' : ''}`} aria-hidden="true">
              <ChevronDown size={18} />
            </span>
          </div>
        </div>

        <input
          type="text"
          tabIndex={-1}
          name={props.name}
          value={valorAtual ?? ''}
          required={props.required}
          aria-hidden="true"
          onChange={() => {}}
          style={{
            position: 'absolute',
            opacity: 0,
            width: 0,
            height: 0,
            pointerEvents: 'none',
            bottom: 0,
            left: '50%',
          }}
        />

        {aberto && !props.disabled && (
          <ul className="select-pesquisavel-dropdown" role="listbox" ref={listaRef} id={`${id}-listbox`}>
            {opcoesFiltradas.length > 0 ? (
              opcoesFiltradas.map((opcao, index) => {
                const estaSelecionado = String(opcao.valor) === String(valorAtual);
                const estaFocado = index === indiceFocado;
                return (
                  <li
                    key={opcao.valor || `empty-${index}`}
                    role="option"
                    aria-selected={estaSelecionado}
                    className={`select-pesquisavel-item ${estaSelecionado ? 'selecionado' : ''} ${
                      estaFocado ? 'focado' : ''
                    }`}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      selecionarOpcao(opcao);
                    }}
                    onMouseEnter={() => setIndiceFocado(index)}
                  >
                    <span className="select-pesquisavel-item-texto">{opcao.rotulo}</span>
                    {estaSelecionado && <Check size={16} className="select-pesquisavel-check" />}
                  </li>
                );
              })
            ) : (
              <li className="select-pesquisavel-sem-resultado">
                Nenhum resultado encontrado {busca ? `para "${busca}"` : ''}
              </li>
            )}
          </ul>
        )}
      </div>
    </Form.Group>
  );
}

export default Select;
