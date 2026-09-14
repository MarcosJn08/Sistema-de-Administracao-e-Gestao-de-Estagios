import LogoBranca from '../assets/LogoBranca.png';

const grupos = [
  {
    titulo: 'Alunos',
    links: [['Ver vagas'], ['Meu estágio'], ['Documentos'], ['Como funciona', '#como-funciona']],
  },
  {
    titulo: 'Empresas',
    links: [
      ['Divulgar vagas'],
      ['Como funciona', '#empresas'],
      ['Como participar'],
      ['Orientações', '#como-funciona'],
    ],
  },
  {
    titulo: 'Institucional',
    links: [['Sobre o SAGE', '#perfis'], ['Núcleo de Estágio'], ['Contato']],
  },
];

export default function Footer() {
  return (
    <footer id="contato" className="sage-footer">
      <div className="container sage-container">
        <div className="row g-4">
          <div className="col-12 col-md-3 footer-brand">
            <a href="#inicio">
              <img src={LogoBranca} alt="SAGE — início" className="logo" width="84" height="64" />
            </a>
            <p>Sistema de gestão de estágios do IFNMG, Campus Almenara.</p>
          </div>
          {grupos.map(({ titulo, links }) => (
            <nav className="col-6 col-md-3 footer-column" key={titulo} aria-label={titulo}>
              <h2>{titulo}</h2>
              <ul>
                {links.map(([label, href]) => (
                  <li key={label}>
                    {href ? (
                      <a href={href}>{label}</a>
                    ) : (
                      <button type="button" className="footer-link" aria-disabled="true">
                        {label}
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
        <div className="footer-bottom">
          <p>
            © {new Date().getFullYear()} SAGE — IFNMG Campus Almenara. Todos os direitos reservados.
          </p>
          <div className="footer-legal">
            <button type="button" className="footer-link" aria-disabled="true">
              Privacidade
            </button>
            <button type="button" className="footer-link" aria-disabled="true">
              Termos de uso
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
