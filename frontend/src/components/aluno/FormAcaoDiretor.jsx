import { useEffect, useRef, useState } from 'react';

const MINIMO_PARECER = 20;
const titulos = {
  cadastro: 'Editar cadastro', horas: 'Validar horas de projetos',
  encerrar: 'Encerrar estágio', homologar: 'Homologar carga horária e emitir certidão',
  'cancelar-desvio-funcao': 'Reprovar por desvio de função',
};
const confirmacoes = {
  'cancelar-desvio-funcao': 'Confirmar reprovação',
  encerrar: 'Confirmar encerramento',
  homologar: 'Confirmar e baixar prévia',
};

export default function FormAcaoDiretor({ acao, aluno, estagio, salvando, aoSalvar, aoCancelar }) {
  const [erro, setErro] = useState('');
  const tituloRef = useRef(null);
  const cancelando = acao === 'cancelar-desvio-funcao';
  const encerrando = acao === 'encerrar';
  useEffect(() => { tituloRef.current?.focus(); }, []);
  const salvar = async (evento) => {
    evento.preventDefault();
    if (salvando) return;

    setErro('');
    const valores = Object.fromEntries(new FormData(evento.currentTarget));
    try { await aoSalvar({ tipo: acao, ...valores }); } catch (error) { setErro(error.message); }
  };

  return (
    <form className="perfil-aluno-formulario" onSubmit={salvar} aria-labelledby="acao-diretor-titulo" aria-busy={salvando}>
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
      {acao === 'horas' && <>
        <p>Ensino Médio Integrado: até 40h de pesquisa/extensão. Informe o total validado; ele substitui o total atual de {aluno.progresso.horasProjeto}h.</p>
        <label>Total de horas de projetos<input name="horas" type="number" min="0" max="40" step="any" defaultValue={aluno.progresso.horasProjeto} required /></label>
      </>}
      {cancelando && <label>Parecer pedagógico
        <textarea name="justificativa_pedagogica" rows={4} required minLength={MINIMO_PARECER} maxLength={2000}
          disabled={salvando} aria-describedby="parecer-pedagogico-ajuda" />
        <span id="parecer-pedagogico-ajuda">Descreva o desvio ou a incompatibilidade com o PPC em pelo menos {MINIMO_PARECER} caracteres.</span>
      </label>}
      {encerrando && <p>O contrato de {aluno.nome} com {estagio.empresa} será marcado como encerrado.</p>}
      {['horas', 'encerrar'].includes(acao) && <label>{acao === 'horas' ? 'Projeto e justificativa' : 'Justificativa do encerramento'}
        <textarea name="motivo" rows={3} required maxLength={encerrando ? 2000 : 1000} disabled={salvando} />
      </label>}
      {acao === 'homologar' && <p>{aluno.nome} cumpriu {aluno.progresso.horasConcluidas}h de {aluno.progresso.metaHoras}h obrigatórias. A homologação será registrada nesta sessão e será baixada uma prévia da certidão. A emissão oficial depende da assinatura institucional.</p>}
      <div className="perfil-aluno-acoes">
        <button type="submit" disabled={salvando}
          className={`perfil-aluno-botao ${cancelando || encerrando ? 'perfil-aluno-botao-perigo' : 'perfil-aluno-botao-primario'}`}>
          {salvando ? 'Salvando…' : (confirmacoes[acao] ?? 'Salvar alterações')}
        </button>
        <button type="button" className="perfil-aluno-botao" onClick={aoCancelar} disabled={salvando}>Cancelar</button>
      </div>
    </form>
  );
}
