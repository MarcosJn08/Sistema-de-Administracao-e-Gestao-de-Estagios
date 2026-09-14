import Button from '../Button.jsx';
import VagaCard from '../VagaCard.jsx';
import vagasLocais from '../../data/vagas.json';

export default function VagasSection({ vagas = vagasLocais }) {
  const destaques = vagas.filter((vaga) => vaga.inscricoes_abertas).slice(0, 3);
  return (
    <section
      id="vagas"
      className="sage-section vagas-section bg-white"
      aria-labelledby="vagas-titulo"
    >
      <div className="container sage-section-container">
        <div className="section-heading-row" data-reveal>
          <div>
            <p className="section-eyebrow">Oportunidades</p>
            <h2 id="vagas-titulo">Vagas em destaque</h2>
            <p className="section-description">
              Encontre oportunidades para começar sua experiência profissional.
            </p>
          </div>
          <Button texto="Ver todas as vagas" tipo="botao-sem-fundo-verde" aria-disabled="true" />
        </div>
        <div id="lista-vagas" className="row g-4 vagas-grid">
          {destaques.map((vaga, index) => (
            <div
              className="col-12 col-md-6 col-lg-4"
              key={vaga.id}
              data-reveal
              style={{ '--reveal-delay': `${index * 150}ms` }}
            >
              <VagaCard vaga={vaga} />
            </div>
          ))}
          {destaques.length === 0 && (
            <p className="section-description">Novas oportunidades serão divulgadas em breve.</p>
          )}
        </div>
      </div>
    </section>
  );
}
