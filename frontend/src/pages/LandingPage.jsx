import { useRef } from 'react';
import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';
import Button from '../components/Button.jsx';
import PerfisSection from '../components/landing/PerfisSection.jsx';
import VagasSection from '../components/landing/VagasSection.jsx';
import ComoFuncionaSection from '../components/landing/ComoFuncionaSection.jsx';
import useScrollReveal from '../hooks/useScrollReveal.js';

export default function LandingPage() {
  const pageRef = useRef(null);
  useScrollReveal(pageRef);

  return (
    <div ref={pageRef}>
      <div className="scroll-progress" aria-hidden="true" />
      <a className="skip-link" href="#conteudo">
        Pular para o conteúdo
      </a>
      <Header />
      <main id="conteudo" tabIndex={-1}>
        <section id="inicio" className="hero-section bg-white" aria-labelledby="hero-titulo">
          <div className="container sage-container">
            <p className="hero-tag">Sistema de Gestão de Estágios IFNMG • Campus Almenara</p>
            <h1 id="hero-titulo">
              Gestão de estágios <span>inteligente e integrada</span> em um só lugar
            </h1>
            <p className="hero-description">
              Encontre vagas, organize documentos e acompanhe cada etapa do seu estágio em um só
              lugar.
            </p>
            <div className="d-flex flex-wrap gap-3">
              <Button texto="Iniciar o cadastro" className="hero-primary" href="/sage/cadastro/empresa" />
              <Button texto="Ver vagas abertas" tipo="botao-sem-fundo-verde" href="/sage/vagas" />
            </div>
          </div>
        </section>
        <PerfisSection />
        <VagasSection />
        <ComoFuncionaSection />
        <section id="portal" className="cta-section" aria-labelledby="cta-titulo">
          <div className="container sage-container text-center" data-reveal>
            <p className="section-eyebrow">Estágio integrado</p>
            <h2 id="cta-titulo">Organize seu estágio com o SAGE</h2>
            <p>
              Acompanhe etapas, documentos e carga horária em um só lugar. Conheça as ferramentas que
              simplificam seu processo de estágio.
            </p>
            <div className="d-flex flex-wrap justify-content-center gap-3">
              <Button texto="Acessar o portal" href="/sage/aluno" />
              <Button
                texto="Fale com o Núcleo de Estágio"
                tipo="botao-sem-fundo-verde"
                href="#contato"
              />
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
