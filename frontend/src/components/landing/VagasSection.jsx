import Button from '../Button.jsx';
import VagaCard from '../VagaCard.jsx';
import vagasLocais from '../../data/vagas.json';

const normalizar = (valor) => String(valor ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

export default function VagasSection({ vagas = vagasLocais, modoAluno = false, cursoAluno = '', onVerDetalhes }) {
  const abertas = vagas.filter((vaga) => vaga.inscricoes_abertas);
  const cursoNormalizado = normalizar(cursoAluno);
  const compativeis = abertas.filter((vaga) => {
    const cursoVaga = normalizar(vaga.curso);
    return cursoVaga === cursoNormalizado || cursoNormalizado.includes(cursoVaga) || cursoVaga.includes(cursoNormalizado);
  });
  const destaques = (modoAluno && compativeis.length ? compativeis : abertas).slice(0, 3);
  return (
    <section
      id="vagas"
      className={modoAluno ? 'dashboard-vagas-section' : 'sage-section vagas-section bg-white'}
      aria-labelledby="vagas-titulo"
    >
      <div className={modoAluno ? 'dashboard-vagas-conteudo' : 'container sage-section-container'}>
        <div className="section-heading-row" data-reveal>
          <div>
            {!modoAluno && <p className="section-eyebrow">Oportunidades</p>}
            <h2 id="vagas-titulo">{modoAluno ? 'Vagas para você!' : 'Vagas em destaque'}</h2>
            <p className="section-description">
              {modoAluno
                ? 'Confira vagas compatíveis com seu curso e encontre seu próximo estágio.'
                : 'Encontre oportunidades para começar sua experiência profissional.'}
            </p>
          </div>
          <Button texto={modoAluno ? 'Explorar todas as vagas' : 'Ver todas as vagas'} tipo="botao-sem-fundo-verde" href="/sage/vagas" />
        </div>
        <div id="lista-vagas" className="row g-4 vagas-grid">
          {destaques.map((vaga, index) => (
            <div
              className="col-12 col-md-6 col-lg-4"
              key={vaga.id}
              data-reveal
              style={{ '--reveal-delay': `${index * 80}ms` }}
            >
              <VagaCard vaga={vaga} onVerDetalhes={onVerDetalhes}
                href={onVerDetalhes ? undefined : `/sage/vagas/${vaga.id}`} />
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
