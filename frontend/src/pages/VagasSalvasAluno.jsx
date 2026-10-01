import { useState } from 'react';
import { Bookmark, Search } from 'lucide-react';
import { Container } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';
import Botao from '../components/Button.jsx';
import VagaCard from '../components/VagaCard.jsx';
import BotaoSalvarVaga from '../components/vagas/BotaoSalvarVaga.jsx';
import ModalDetalhesVaga from '../components/vagas/ModalDetalhesVaga.jsx';
import useVagasSalvas from '../hooks/useVagasSalvas.js';
import dados from '../data/aluno.js';
import './VagasSalvasAluno.css';

const normalizar = (valor) => String(valor || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

export default function VagasSalvasAluno() {
  const salvas = useVagasSalvas();
  const [busca, setBusca] = useState('');
  const [vagaSelecionada, setVagaSelecionada] = useState(null);
  const navigate = useNavigate();
  const filtradas = salvas.filter((vaga) => normalizar(`${vaga.titulo} ${vaga.empresa}`).includes(normalizar(busca.trim())));

  return (
    <div className="vagas-salvas-pagina d-flex flex-column min-vh-100">
      <Header usuario={dados.aluno} />
      <main className="flex-grow-1 py-4">
        <Container className="vagas-salvas-container">
          <div className="vagas-salvas-cabecalho">
            <div><h1>Vagas salvas</h1><p>Guarde oportunidades para consultar e se candidatar depois.</p></div>
            <Botao tipo="botao-sage-verde" onClick={() => navigate('/sage/vagas')}>Explorar vagas</Botao>
          </div>
          {salvas.length > 0 && <>
            <div className="vagas-salvas-busca">
              <label className="visually-hidden" htmlFor="buscar-vagas-salvas">Buscar vagas salvas por título ou empresa</label>
              <Search size={18} aria-hidden="true" />
              <input id="buscar-vagas-salvas" type="search" className="form-control" placeholder="Buscar por título ou empresa…" value={busca} onChange={(evento) => setBusca(evento.target.value)} />
            </div>
            <p className="vagas-salvas-resumo" role="status">{filtradas.length} de {salvas.length} vagas salvas · Mais recentes primeiro</p>
          </>}
          {!salvas.length ? <section className="cartao-sage vagas-salvas-vazio">
            <Bookmark size={32} aria-hidden="true" /><h2>Nenhuma vaga salva ainda</h2>
            <p>Ao encontrar uma oportunidade interessante, clique em “Salvar vaga”. Ela aparecerá aqui para você consultar depois.</p>
            <Botao tipo="botao-sage-verde" onClick={() => navigate('/sage/vagas')}>Encontrar oportunidades</Botao>
          </section> : !filtradas.length ? <div className="cartao-sage vagas-salvas-vazio" role="status">
            <h2>Nenhuma vaga encontrada</h2><p>Tente buscar por outro título ou empresa.</p>
            <Botao tipo="botao-acao-contorno" onClick={() => setBusca('')}>Limpar busca</Botao>
          </div> : <section className="vagas-salvas-grid" aria-label="Oportunidades salvas">
            {filtradas.map((vaga) => <VagaCard key={vaga.id} vaga={vaga} onVerDetalhes={setVagaSelecionada}
              acaoExtra={<BotaoSalvarVaga vaga={vaga} mostrarRemover />} />)}
          </section>}
        </Container>
      </main>
      <ModalDetalhesVaga key={vagaSelecionada?.id || 'fechado'} aberto={Boolean(vagaSelecionada)} vaga={vagaSelecionada} aoFechar={() => setVagaSelecionada(null)} />
      <Footer />
    </div>
  );
}
