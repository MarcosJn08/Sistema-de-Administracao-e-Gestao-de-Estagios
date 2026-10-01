import { CalendarDays, Clock3, IdCard, MapPinned, ShieldCheck, UserRound } from 'lucide-react';
import LogoEmpresa from '../LogoEmpresa.jsx';
import '../../App.css';

function ItemDado({ icone: Icone, titulo, children }) {
  return (
    <div className="dados-estagio-item">
      <span className="dados-estagio-icone"><Icone size={18} aria-hidden="true" /></span>
      <div><dt>{titulo}</dt><dd>{children || 'Não informado'}</dd></div>
    </div>
  );
}

function CardDadosEstagio({
  empresa,
  cnpj,
  cargo,
  professorOrientador,
  supervisorEstagio,
  dataInicio,
  dataFim,
  cargaHorariaSemanal,
  modalidade,
  seguro,
}) {
  return (
    <section className="cartao-sage dados-estagio-card" aria-labelledby="dados-estagio-titulo">
      <h2 id="dados-estagio-titulo" className="cartao-sage-titulo">Dados do estágio</h2>

      <div className="dados-estagio-empresa">
        <span className="dados-estagio-empresa-icone"><LogoEmpresa empresa={empresa} tamanho={34} /></span>
        <div><span>Empresa concedente</span><strong>{empresa}</strong><small>{cargo}</small></div>
      </div>

      <dl className="dados-estagio-grid">
        <ItemDado icone={IdCard} titulo="CNPJ">{cnpj}</ItemDado>
        <ItemDado icone={UserRound} titulo="Professor orientador">{professorOrientador}</ItemDado>
        <ItemDado icone={UserRound} titulo="Supervisor da empresa">{supervisorEstagio}</ItemDado>
        <ItemDado icone={CalendarDays} titulo="Período do estágio">{dataInicio} a {dataFim}</ItemDado>
        <ItemDado icone={Clock3} titulo="Carga horária semanal">{cargaHorariaSemanal}</ItemDado>
        <ItemDado icone={MapPinned} titulo="Modalidade">{modalidade}</ItemDado>
        <ItemDado icone={ShieldCheck} titulo="Seguro contra acidentes">{seguro}</ItemDado>
      </dl>
    </section>
  );
}

export default CardDadosEstagio;
