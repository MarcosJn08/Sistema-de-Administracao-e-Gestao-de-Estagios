import { ArrowRight, FilePlus2, FileUp, Search } from 'lucide-react';

const etapas = [
  {
    titulo: 'Encontre uma vaga',
    descricao: 'Explore oportunidades validadas pelo setor de estágios.',
    acao: 'Explorar vagas',
    Icone: Search,
  },
  {
    titulo: 'Cadastre seu estágio',
    descricao: 'Registre o vínculo, as atividades e a jornada.',
    acao: 'Cadastrar estágio',
    Icone: FilePlus2,
  },
  {
    titulo: 'Envie os documentos',
    descricao: 'Faça o upload dos arquivos e acompanhe as assinaturas.',
    acao: 'Enviar documentos',
    Icone: FileUp,
  },
];

export default function ComoFuncionaSection() {
  return (
    <section
      id="como-funciona"
      className="sage-section fluxo-section"
      aria-labelledby="fluxo-titulo"
    >
      <div className="container sage-container">
        <div className="fluxo-heading" data-reveal>
          <p className="section-eyebrow">Como funciona</p>
          <h2 id="fluxo-titulo">
            O SAGE organiza o processo desde a divulgação da oportunidade até o encerramento do
            estágio e o registro da carga horária.
          </h2>
          <p className="section-description">
            Divulgação, vínculo, assinatura e carga horária: cada etapa em um só lugar.
          </p>
        </div>
        <div className="row g-3 fluxo-grid">
          {etapas.map(({ titulo, descricao, acao, Icone }, index) => (
            <div
              className="col-12 col-lg-4"
              key={titulo}
              data-reveal
              style={{ '--reveal-delay': `${index * 150}ms` }}
            >
              <article className="card etapa-card h-100">
                <div className="card-body d-flex flex-column">
                  <span className="etapa-icon">
                    <Icone size={23} strokeWidth={1.5} aria-hidden="true" />
                  </span>
                  <h3>{titulo}</h3>
                  <p>{descricao}</p>
                  <button type="button" className="sage-text-link mt-auto" aria-disabled="true">
                    {acao} <ArrowRight size={15} aria-hidden="true" />
                  </button>
                </div>
              </article>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
