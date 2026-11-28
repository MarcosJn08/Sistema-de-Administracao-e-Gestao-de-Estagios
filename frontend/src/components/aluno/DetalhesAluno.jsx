import { useState } from 'react';
import { Modal, ProgressBar } from 'react-bootstrap';
import { FileText, GraduationCap, UserRound } from 'lucide-react';
import StatusBadge from '../StatusBadge.jsx';
import Button from '../Button/Button.jsx';
import FormAcaoDiretor from './FormAcaoDiretor.jsx';
import DocumentoAluno from './DocumentoAluno.jsx';
import { baixarPreviaCertidao, finalizarEstagio, podeHomologarHoras, situacoesEstagio } from '../../utils/gestaoAluno.js';
import './DetalhesAluno.css';

function Campo({ titulo, children, destaque = false }) {
  return (
    <div className={`perfil-aluno-campo${destaque ? ' perfil-aluno-campo-destaque' : ''}`}>
      <dt>{titulo}</dt>
      <dd>{children || 'Não informado'}</dd>
    </div>
  );
}

function DetalhesAluno({ aberto, aluno, aoFechar, perfil = 'professor', aoAtualizar, aoVincularProfessor, aoFinalizarEstagio }) {
  const [acao, setAcao] = useState(null);
  const [mensagem, setMensagem] = useState('');
  const [salvando, setSalvando] = useState(false);
  const [estagioFinalizado, setEstagioFinalizado] = useState(null);
  if (!aluno) return null;

  const estagioAtual = aluno.estagio ?? aluno.estagioVinculado;
  const estagio = estagioFinalizado && (!estagioAtual || estagioFinalizado.id === estagioAtual.id)
    ? estagioFinalizado : estagioAtual;
  const situacao = situacoesEstagio[estagio?.status] ?? aluno.situacao;
  const diretor = perfil === 'diretor' && typeof aoAtualizar === 'function';
  const podeReprovar = ['diretor', 'professor'].includes(perfil) && Boolean(estagio?.id)
    && ['EM_ANALISE', 'EM_ANDAMENTO'].includes(estagio.status);
  const podeEncerrar = Boolean(estagio?.id) && ['RASCUNHO', 'EM_ANALISE', 'EM_ANDAMENTO'].includes(estagio.status);
  const estagioEditavel = aluno.estagio && !['Encerrado', 'Concluído', situacoesEstagio.CANCELADO_DESVIO_FUNCAO].includes(situacao);

  const abrirAcao = (tipo) => {
    setAcao(tipo);
    setMensagem('');
  };

  const salvar = (alteracao) => {
    if (!diretor) return aoAtualizar(alteracao);
    aoAtualizar(alteracao);
    if (alteracao.tipo === 'homologar') baixarPreviaCertidao(aluno);
    setAcao(null);
    setMensagem('Alteração registrada nesta sessão.');
  };

  const salvarAcao = async (alteracao) => {
    if (!['cancelar-desvio-funcao', 'encerrar'].includes(alteracao.tipo)) return salvar(alteracao);

    setSalvando(true);
    try {
      const resultado = await finalizarEstagio(estagio.id, alteracao);
      setEstagioFinalizado({ ...estagio, status: resultado.status, motivoEncerramento: resultado.motivo_encerramento });
      setAcao(null);
      setMensagem(resultado.status === 'CANCELADO_DESVIO_FUNCAO'
        ? 'Estágio cancelado por desvio de função.'
        : 'Estágio encerrado.');
      aoFinalizarEstagio?.(resultado);
    } finally {
      setSalvando(false);
    }
  };

  const { documentos = [], progresso = {} } = aluno;
  const { horasConcluidas = 0, metaHoras = 0, horasEstagio = 0, horasProjeto = 0 } = progresso;
  const percentual = metaHoras > 0 ? Math.min(100, Math.max(0, Math.floor(horasConcluidas / metaHoras * 100))) : 0;
  const saldoRestante = Math.max(0, metaHoras - horasConcluidas);

  return (
    <Modal show={aberto} onHide={salvando ? undefined : aoFechar} size="xl" centered scrollable fullscreen="sm-down"
      className="detalhes-aluno" aria-labelledby="detalhes-aluno-titulo">
      <Modal.Header closeButton={!salvando} closeLabel="Fechar detalhes do aluno">
        <Modal.Title as="h1" id="detalhes-aluno-titulo">
          <GraduationCap size={22} aria-hidden="true" /> Detalhes do Aluno
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="perfil-aluno-cabecalho">
          <div className="perfil-aluno-cabecalho-titulo">
            <h2>Perfil do Aluno</h2>
            <StatusBadge status={situacao} />
          </div>
          {(diretor || podeReprovar) && <div className="perfil-aluno-acoes perfil-aluno-acoes-globais">
            {diretor && <button type="button" className="perfil-aluno-botao" disabled={salvando}
              onClick={() => abrirAcao('cadastro')}>Editar Cadastro</button>}
            {diretor && aoVincularProfessor && (
              <button type="button" className="perfil-aluno-botao" onClick={aoVincularProfessor} disabled={salvando}>
                {estagio?.professorOrientador && estagio.professorOrientador !== 'Sem orientador'
                  ? 'Gerenciar orientador'
                  : 'Vincular orientador'}
              </button>
            )}
            {podeReprovar && <button type="button" className="perfil-aluno-botao perfil-aluno-botao-perigo" disabled={salvando}
              onClick={() => abrirAcao('cancelar-desvio-funcao')}>Reprovar por desvio de função</button>}
            {diretor && <button type="button" className="perfil-aluno-botao perfil-aluno-botao-perigo" disabled={salvando || !podeEncerrar}
              onClick={() => abrirAcao('encerrar')}>Encerrar Estágio</button>}
          </div>}
        </div>
        {mensagem && <p className="perfil-aluno-sucesso" role="status">{mensagem}</p>}
        {acao && <FormAcaoDiretor key={acao} acao={acao} aluno={aluno} estagio={estagio} salvando={salvando}
          aoSalvar={salvarAcao} aoCancelar={() => setAcao(null)} />}

        <div className="perfil-aluno-layout">
          <div className="perfil-aluno-resumo">
            <section className="perfil-aluno-cartao" aria-labelledby="perfil-aluno-nome">
              <div className="perfil-aluno-identidade">
                <div className="perfil-aluno-avatar" aria-hidden="true"><UserRound size={27} /></div>
                <div>
                  <h3 id="perfil-aluno-nome">{aluno.nome}</h3>
                  <p>Matrícula: {aluno.matricula}</p>
                </div>
              </div>
              <dl className="perfil-aluno-campos">
                <Campo titulo="Curso:">{aluno.curso}</Campo>
                <Campo titulo="E-mail:">{aluno.email}</Campo>
                <Campo titulo="Telefone:">{aluno.telefone}</Campo>
                <Campo titulo="CPF:">{aluno.cpf}</Campo>
                <Campo titulo="Semestre:">{aluno.semestre ? `${aluno.semestre}º semestre` : null}</Campo>
              </dl>
            </section>

            <section className="perfil-aluno-cartao" aria-labelledby="perfil-aluno-estagio">
              <h3 id="perfil-aluno-estagio" className="perfil-aluno-titulo">Estágio</h3>
              {estagio ? (
                <dl className="perfil-aluno-campos">
                  <Campo titulo="Empresa concedente:">{estagio.empresa}</Campo>
                  <Campo titulo="CNPJ:">{estagio.cnpj}</Campo>
                  <Campo titulo="Supervisor (empresa):">{estagio.supervisorEstagio}</Campo>
                  <Campo titulo="Orientador designado:">{estagio.professorOrientador}</Campo>
                  <Campo titulo="Vigência do TCE:">
                    {estagio.dataInicio || estagio.dataFim
                      ? `${estagio.dataInicio || 'Não informada'} a ${estagio.dataFim || 'Não informada'}` : null}
                  </Campo>
                  <Campo titulo="Carga horária semanal:">{estagio.cargaHorariaSemanal}</Campo>
                  <Campo titulo="Seguro contra acidentes:">{estagio.seguro}</Campo>
                  {estagio.motivoEncerramento && (
                    <Campo titulo={estagio.status === 'CANCELADO_DESVIO_FUNCAO' ? 'Parecer pedagógico:' : 'Motivo do encerramento:'}>
                      {estagio.motivoEncerramento}
                    </Campo>
                  )}
                </dl>
              ) : (
                <p className="perfil-aluno-vazio">O estudante ainda não possui vínculo de estágio, empresa concedente ou professor orientador.</p>
              )}
            </section>

            <section className="perfil-aluno-cartao" aria-labelledby="perfil-aluno-carga-horaria">
              <h3 id="perfil-aluno-carga-horaria" className="perfil-aluno-titulo">Painel de Carga Horária</h3>
              <ProgressBar now={percentual} aria-label="Carga horária concluída" />
              <div className="perfil-aluno-progresso-legenda">
                <span>{horasConcluidas}h de {metaHoras}h obrigatórias</span>
                <strong>{percentual}% concluído</strong>
              </div>
              <dl className="perfil-aluno-campos">
                <Campo titulo="Horas de estágio:">{horasEstagio}h</Campo>
                <Campo titulo="Aproveitamento de projetos:">
                  <span>{horasProjeto}h{aluno.modalidade === 'Ensino Médio Integrado' ? ' / 40h' : ''}</span>
                  {diretor && <button type="button" className="perfil-aluno-acao-inline"
                    disabled={salvando || aluno.modalidade !== 'Ensino Médio Integrado' || !estagioEditavel || Boolean(progresso.homologadoEm)}
                    onClick={() => setAcao('horas')}>Validar Horas</button>}
                </Campo>
                <Campo titulo="Saldo restante:" destaque={saldoRestante > 0}>{saldoRestante}h</Campo>
              </dl>
              {diretor && <div className="perfil-aluno-homologacao">
                <p className="perfil-aluno-ajuda">Créditos de pesquisa/extensão: até 40h para o Ensino Médio Integrado.</p>
                {progresso.homologadoEm ? <>
                  <p className="perfil-aluno-sucesso">Carga horária homologada nesta sessão.</p>
                  <button type="button" className="perfil-aluno-botao" onClick={() => baixarPreviaCertidao(aluno)}>Baixar prévia da certidão</button>
                </> : <>
                  <button type="button" className="perfil-aluno-botao perfil-aluno-botao-primario perfil-aluno-botao-homologar"
                    disabled={salvando || !podeHomologarHoras(aluno)} onClick={() => setAcao('homologar')}>
                    Homologar Carga Horária e Emitir Certidão
                  </button>
                  {!podeHomologarHoras(aluno) && <p className="perfil-aluno-ajuda">Disponível ao cumprir a carga horária obrigatória, em estágio não encerrado.</p>}
                </>}
              </div>}
            </section>
          </div>

          <section className="perfil-aluno-cartao perfil-aluno-documentos" aria-labelledby="perfil-aluno-documentos">
            <h3 id="perfil-aluno-documentos" className="perfil-aluno-titulo">Documentos</h3>
            <p className="perfil-aluno-subtitulo">Documentos e relatórios do aluno</p>
            {documentos.length > 0 ? (
              <ul className="perfil-aluno-documentos-lista">
                {documentos.map((documento) => (
                  <DocumentoAluno key={documento.id} documento={documento} perfil={perfil}
                    aoAtualizar={typeof aoAtualizar === 'function' ? salvar : undefined} />
                ))}
              </ul>
            ) : (
              <div className="perfil-aluno-documentos-vazio">
                <FileText size={30} strokeWidth={1.5} aria-hidden="true" />
                <p>Nenhum documento ou relatório registrado.</p>
              </div>
            )}
          </section>
        </div>
      </Modal.Body>
      <Modal.Footer><Button tipo="botao-sage-verde" onClick={aoFechar} disabled={salvando}>Fechar</Button></Modal.Footer>
    </Modal>
  );
}

export default DetalhesAluno;
