import { useId } from 'react';
import { GraduationCap, LockKeyhole } from 'lucide-react';
import './FormacaoAluno.css';

export default function FormacaoAluno({ formacao, historico = false, acaoCorrecao, nivel = 2, id }) {
  const tituloId = useId();
  const Titulo = `h${nivel}`;
  const campos = [
    ['Instituição', formacao.instituicao],
    ['Matrícula', formacao.matricula],
    ['Curso', formacao.curso],
    ['Período / Turma', formacao.periodo],
    ['E-mail institucional', formacao.email],
  ];
  return <section id={id} className="candidatura-card formacao-aluno" aria-labelledby={tituloId}>
    <Titulo id={tituloId}><GraduationCap size={21} aria-hidden="true" /> Formação</Titulo>
    <p className="formacao-aluno-aviso"><LockKeyhole size={15} aria-hidden="true" /> {historico ? 'Dados registrados na inscrição · Somente leitura' : 'Dados acadêmicos oficiais · Somente leitura'}</p>
    <dl className="formacao-aluno-campos">
      {campos.map(([rotulo, valor]) => <div key={rotulo}><dt>{rotulo}</dt><dd>{valor || (historico ? 'Não informado nesta inscrição' : 'Não informado pelo registro acadêmico')}</dd></div>)}
    </dl>
    <p className="formacao-aluno-ajuda">{historico ? 'Este é o histórico enviado à empresa na data da inscrição.' : 'Esses dados são mantidos pela instituição e não podem ser alterados pelo aluno.'}</p>
    {acaoCorrecao}
  </section>;
}
