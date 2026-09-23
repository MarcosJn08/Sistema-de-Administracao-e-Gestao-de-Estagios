import React, { useState, useMemo } from 'react';
import { Search, ChevronDown } from 'lucide-react';
import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';
import VagaCard from '../components/VagaCard.jsx';
import ModalDetalhesVaga from '../components/vagas/ModalDetalhesVaga.jsx';
import LogoBranca from '../assets/LogoBranca.png';
import vagasIniciais from '../data/vagas.json';
import dados from '../dados.jsx';
import './VitrineVagas.css';

function VitrineVagas() {
  const [busca, setBusca] = useState('');
  const [cursoFiltro, setCursoFiltro] = useState('Todos');
  const [vagaSelecionada, setVagaSelecionada] = useState(null);

  const cursosDisponiveis = useMemo(() => {
    const cursosSet = new Set();
    vagasIniciais.forEach((v) => {
      if (v.curso) cursosSet.add(v.curso);
    });
    return ['Todos', ...Array.from(cursosSet)];
  }, []);

  const vagasFiltradas = useMemo(() => {
    return vagasIniciais.filter((vaga) => {
      const matchBusca =
        vaga.titulo.toLowerCase().includes(busca.toLowerCase()) ||
        vaga.empresa.toLowerCase().includes(busca.toLowerCase());
      const matchCurso = cursoFiltro === 'Todos' || vaga.curso === cursoFiltro;
      return matchBusca && matchCurso;
    });
  }, [busca, cursoFiltro]);

  return (
    <div className="vitrine-vagas-wrapper">
      <Header
        pagina01="Dashboard"
        pagina02="Vagas"
        pagina03="Documentos"
        paginaAtiva="Vagas"
        usuario={dados.aluno}
      />

      <section className="vitrine-hero">
        <div className="vitrine-hero-container">
          <div className="vitrine-hero-content">
            <h1 className="vitrine-hero-title">
              Encontre e candidate-se às vagas ofertadas pelas empresas parceiras do IFNMG - Campus Almenara.
            </h1>
            <p className="vitrine-hero-subtitle">
              Localize a oportunidade ideal para o seu curso e inicie seu processo de forma 100% digital
            </p>
          </div>
          <div className="vitrine-hero-logo d-none d-lg-flex">
            <img src={LogoBranca} alt="Logo SAGE" />
          </div>
        </div>
      </section>

      <main className="flex-grow-1">
        <div className="vitrine-main-container">
          <div className="vitrine-filtros-bar">
            <div className="vitrine-busca-input-wrapper">
              <Search size={18} className="vitrine-busca-icone" />
              <input
                type="text"
                placeholder="Buscar por título da vaga..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="vitrine-busca-input"
              />
            </div>

            <div className="vitrine-filtro-select-wrapper">
              <select
                value={cursoFiltro}
                onChange={(e) => setCursoFiltro(e.target.value)}
                className="vitrine-filtro-select"
              >
                {cursosDisponiveis.map((curso) => (
                  <option key={curso} value={curso}>
                    Curso: {curso}
                  </option>
                ))}
              </select>
              <ChevronDown size={16} className="vitrine-select-chevron" />
            </div>
          </div>

          <div className="row g-4">
            {vagasFiltradas.length > 0 ? (
              vagasFiltradas.map((vaga) => (
                <div key={vaga.id} className="col-12 col-md-6 col-lg-4">
                  <VagaCard vaga={vaga} onVerDetalhes={(v) => setVagaSelecionada(v)} />
                </div>
              ))
            ) : (
              <div className="col-12">
                <div className="vitrine-vazio">
                  <p className="mb-0">Nenhuma vaga encontrada com os filtros selecionados.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <ModalDetalhesVaga
        aberto={Boolean(vagaSelecionada)}
        vaga={vagaSelecionada}
        aoFechar={() => setVagaSelecionada(null)}
      />

      <Footer />
    </div>
  );
}

export default VitrineVagas;
