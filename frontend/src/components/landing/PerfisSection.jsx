import { Building2, UserRound, UsersRound } from 'lucide-react';

const perfis = [
  {
    id: 'estudantes',
    titulo: 'Para estudantes',
    descricao: 'Encontre vagas, envie documentos e acompanhe suas horas cumpridas.',
    Icone: UserRound,
    cor: 'verde',
  },
  {
    id: 'empresas',
    titulo: 'Para empresas',
    descricao: 'Divulgue oportunidades, indique requisitos e acompanhe os processos de estágio.',
    Icone: Building2,
    cor: 'laranja',
  },
  {
    id: 'orientadores',
    titulo: 'Para orientadores e setor',
    descricao: 'Valide documentos, acompanhe estágios e mantenha os processos organizados.',
    Icone: UsersRound,
    cor: 'azul',
  },
];

export default function PerfisSection() {
  return (
    <section id="perfis" className="sage-section perfis-section" aria-labelledby="perfis-titulo">
      <div className="container sage-section-container">
        <div data-reveal>
          <p className="section-eyebrow">Para quem é o SAGE</p>
          <h2 id="perfis-titulo">Um portal para todos os envolvidos.</h2>
          <p className="section-description">
            Cada perfil encontra as ferramentas necessárias para acompanhar o estágio com clareza.
          </p>
        </div>
        <div className="row g-4 perfis-grid">
          {perfis.map(({ id, titulo, descricao, Icone, cor }, index) => (
            <div
              className="col-12 col-lg-4"
              key={id}
              data-reveal
              style={{ '--reveal-delay': `${index * 150}ms` }}
            >
              <article id={id} className="card perfil-card h-100">
                <div className="card-body">
                  <span className={`perfil-icon perfil-icon-${cor}`}>
                    <Icone size={30} strokeWidth={1.5} aria-hidden="true" />
                  </span>
                  <h3>{titulo}</h3>
                  <p>{descricao}</p>
                </div>
              </article>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
