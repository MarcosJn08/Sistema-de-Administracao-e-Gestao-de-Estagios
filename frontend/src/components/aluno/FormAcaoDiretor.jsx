import { useEffect, useRef, useState } from 'react';

const titulos = {
  cadastro: 'Editar cadastro', orientador: 'Alterar orientador', horas: 'Validar horas de projetos',
  encerrar: 'Encerrar estágio', homologar: 'Homologar carga horária e emitir certidão',
};

export default function FormAcaoDiretor({ acao, aluno, orientadores, aoSalvar, aoCancelar }) {
  const [erro, setErro] = useState('');
  const tituloRef = useRef(null);
  useEffect(() => { tituloRef.current?.focus(); }, []);
  const salvar = (evento) => {
    evento.preventDefault();
    const valores = Object.fromEntries(new FormData(evento.currentTarget));
    try { aoSalvar({ tipo: acao, ...valores }); } catch (error) { setErro(error.message); }
  };

  return (
    <form className="perfil-aluno-formulario" onSubmit={salvar} aria-labelledby="acao-diretor-titulo">
      <h3 id="acao-diretor-titulo" ref={tituloRef} tabIndex={-1}>{titulos[acao]}</h3>
      {erro && <p className="perfil-aluno-erro" role="alert">{erro}</p>}
      {acao === 'cadastro' && <div className="perfil-aluno-form-grid">
        {[
          ['nome', 'Nome completo', 'text', true], ['matricula', 'Matrícula', 'text', true],
          ['email', 'E-mail', 'email', true], ['cpf', 'CPF', 'text', false], ['telefone', 'Telefone', 'tel', false],
        ].map(([campo, rotulo, tipo, obrigatorio]) => (
          <label key={campo}>{rotulo}<input name={campo} type={tipo} defaultValue={aluno[campo] || ''} required={obrigatorio} /></label>
        ))}
      </div>}
      {acao === 'orientador' && <label>Orientador designado
        <select name="orientadorId" defaultValue={aluno.estagio.orientadorId || orientadores.find((item) => item.nome === aluno.estagio.professorOrientador)?.id || ''} required>
          <option value="" disabled>Selecione um professor</option>
          {orientadores.map((orientador) => <option key={orientador.id} value={orientador.id}>{orientador.nome}</option>)}
        </select>
      </label>}
      {acao === 'horas' && <>
        <p>Ensino Médio Integrado: até 40h de pesquisa/extensão. Informe o total validado; ele substitui o total atual de {aluno.progresso.horasProjeto}h.</p>
        <label>Total de horas de projetos<input name="horas" type="number" min="0" max="40" step="any" defaultValue={aluno.progresso.horasProjeto} required /></label>
      </>}
      {acao === 'encerrar' && <p>O contrato de {aluno.nome} com {aluno.estagio.empresa} será marcado como encerrado. O histórico será preservado.</p>}
      {['horas', 'encerrar'].includes(acao) && <label>{acao === 'horas' ? 'Projeto e justificativa' : 'Justificativa do encerramento'}
        <textarea name="motivo" rows={3} required maxLength={1000} />
      </label>}
      {acao === 'homologar' && <p>{aluno.nome} cumpriu {aluno.progresso.horasConcluidas}h de {aluno.progresso.metaHoras}h obrigatórias. A homologação será registrada nesta sessão e será baixada uma prévia da certidão. A emissão oficial depende da assinatura institucional.</p>}
      <div className="perfil-aluno-acoes">
        <button type="submit" className={`perfil-aluno-botao ${acao === 'encerrar' ? 'perfil-aluno-botao-perigo' : 'perfil-aluno-botao-primario'}`}>
          {acao === 'encerrar' ? 'Confirmar encerramento' : acao === 'homologar' ? 'Confirmar e baixar prévia' : 'Salvar alterações'}
        </button>
        <button type="button" className="perfil-aluno-botao" onClick={aoCancelar}>Cancelar</button>
      </div>
    </form>
  );
}
