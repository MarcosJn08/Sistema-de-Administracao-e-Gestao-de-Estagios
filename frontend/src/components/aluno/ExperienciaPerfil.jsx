import AnexosPerfil from './AnexosPerfil.jsx';

export default function ExperienciaPerfil({ experiencia = '', anexos = [] }) {
  return <div className="experiencia-perfil">
    <p className="experiencia-perfil-texto">{experiencia || 'Nenhuma experiência prévia informada.'}</p>
    <h4 className="experiencia-perfil-anexos-titulo">Arquivos anexados</h4>
    <AnexosPerfil anexos={anexos} />
  </div>;
}
