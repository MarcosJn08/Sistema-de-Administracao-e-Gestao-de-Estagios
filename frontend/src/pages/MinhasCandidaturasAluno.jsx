import { useState } from 'react';
import { Container } from 'react-bootstrap';
import { Search } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';
import Botao from '../components/Button.jsx';
import Paginacao from '../components/Paginacao.jsx';
import ListaCandidaturasAluno from '../components/aluno/ListaCandidaturasAluno.jsx';
import ModalCandidatura from '../components/vagas/ModalCandidatura.jsx';
import useCandidaturasAluno from '../hooks/useCandidaturasAluno.js';
import { apresentarStatusCandidatura } from '../utils/candidaturaAluno.js';
import dados from '../data/aluno.js';
import vagas from '../data/vagas.json';
import './MinhasCandidaturasAluno.css';

const normalizar = (texto) => texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
const ITENS_POR_PAGINA = 8;

export default function MinhasCandidaturasAluno() {
  const candidaturas = useCandidaturasAluno();
  const [busca, setBusca] = useState('');
  const [status, setStatus] = useState('Todos');
  const [pagina, setPagina] = useState(1);
  const { vagaId } = useParams();
  const navigate = useNavigate();
  const selecionada = candidaturas.find((item) => item.vagaId === vagaId);
  const vagaOriginal = vagas.find((item) => String(item.id) === vagaId);
  const filtradas = candidaturas.filter((item) => normalizar(`${item.vaga} ${item.empresa}`).includes(normalizar(busca.trim()))
    && (status === 'Todos' || apresentarStatusCandidatura(item.status).texto === status));
  const totalPaginas = Math.max(1, Math.ceil(filtradas.length / ITENS_POR_PAGINA));
  const paginaAtual = Math.min(pagina, totalPaginas);
  const inicio = (paginaAtual - 1) * ITENS_POR_PAGINA;
  const visiveis = filtradas.slice(inicio, inicio + ITENS_POR_PAGINA);
  const statusDisponiveis = [...new Set(['Em análise', 'Aprovada', 'Reprovada', ...candidaturas.map((item) => apresentarStatusCandidatura(item.status).texto)])];

  return (
    <div className="minhas-candidaturas-pagina d-flex flex-column min-vh-100">
      <Header usuario={dados.aluno} paginaAtiva="Candidaturas" />
      <main className="flex-grow-1 py-4">
        <Container className="minhas-candidaturas-container">
          <div className="minhas-candidaturas-cabecalho">
            <div><h1>Minhas candidaturas</h1><p>Acompanhe suas inscrições e consulte as informações enviadas às empresas.</p></div>
            <Botao tipo="botao-sage-verde" onClick={() => navigate('/sage/vagas')}>Explorar vagas</Botao>
          </div>
          {vagaId && !selecionada && <div className="alert alert-warning" role="alert">Candidatura não encontrada. Selecione uma das suas inscrições abaixo.</div>}
          <section className="cartao-sage" aria-label="Candidaturas enviadas">
            {candidaturas.length > 0 && <>
              <div className="minhas-candidaturas-filtros">
                <div className="minhas-candidaturas-busca">
                  <label htmlFor="busca-candidaturas" className="visually-hidden">Buscar por vaga ou empresa</label>
                  <Search size={18} aria-hidden="true" />
                  <input id="busca-candidaturas" type="search" className="form-control" placeholder="Buscar por vaga ou empresa…" value={busca}
                    onChange={(evento) => { setBusca(evento.target.value); setPagina(1); }} />
                </div>
                <div>
                  <label htmlFor="status-candidaturas" className="visually-hidden">Status da candidatura</label>
                  <select id="status-candidaturas" className="form-select" value={status} onChange={(evento) => { setStatus(evento.target.value); setPagina(1); }}>
                    <option value="Todos">Todos os status</option>
                    {statusDisponiveis.map((item) => <option key={item}>{item}</option>)}
                  </select>
                </div>
              </div>
              <p className="minhas-candidaturas-ordem">Mais recentes primeiro</p>
            </>}
            {candidaturas.length > 0 && !filtradas.length ? <div className="candidaturas-aluno-vazio" role="status">
              <h3>Nenhuma candidatura encontrada</h3><p>Tente outro nome de vaga, empresa ou status.</p>
              <Botao tipo="botao-acao-contorno" onClick={() => { setBusca(''); setStatus('Todos'); setPagina(1); }}>Limpar filtros</Botao>
            </div> : <ListaCandidaturasAluno candidaturas={visiveis} />}
            {filtradas.length > 0 && <Paginacao paginaAtual={paginaAtual} totalPaginas={totalPaginas} aoMudarPagina={setPagina}
              textoResumo={`Mostrando ${inicio + 1}–${inicio + visiveis.length} de ${filtradas.length} candidaturas`} />}
          </section>
        </Container>
      </main>
      {selecionada && <ModalCandidatura key={selecionada.vagaId} candidaturaRegistrada={selecionada}
        vaga={{ ...vagaOriginal, id: selecionada.vagaId, titulo: selecionada.vaga, empresa: selecionada.empresa }}
        aoFechar={() => navigate('/sage/aluno/candidaturas')}
        aoVoltar={vagaOriginal ? () => navigate(`/sage/vagas/${selecionada.vagaId}`) : undefined} />}
      <Footer />
    </div>
  );
}
