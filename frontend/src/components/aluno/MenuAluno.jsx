import Dropdown from 'react-bootstrap/Dropdown';
import { Link, useLocation } from 'react-router-dom';
import { Bookmark, BriefcaseBusiness, ChevronDown, LayoutDashboard, LogOut, Send, UserRound } from 'lucide-react';
import './MenuAluno.css';

const atalhos = [
  { texto: 'Meu perfil', caminho: '/sage/aluno/perfil', Icone: UserRound },
  { texto: 'Vagas salvas', caminho: '/sage/aluno/vagas-salvas', Icone: Bookmark },
  { texto: 'Minhas candidaturas', caminho: '/sage/aluno/candidaturas', Icone: Send },
  { texto: 'Meus estágios', caminho: '/sage/aluno/estagios', Icone: BriefcaseBusiness },
  { texto: 'Dashboard', caminho: '/sage/aluno', Icone: LayoutDashboard },
];

export default function MenuAluno({ usuario, aoNavegar }) {
  const { pathname } = useLocation();
  return (
    <Dropdown className="menu-perfil-aluno" align="end" onSelect={aoNavegar}>
      <Dropdown.Toggle id="menu-perfil-aluno" variant="link" className="perfil-usuario-header menu-perfil-aluno-gatilho" aria-label="Abrir menu do aluno">
        <span className="avatar-usuario-header">{usuario.foto ? <img src={usuario.foto} alt="" /> : usuario.nome?.charAt(0).toUpperCase() || 'A'}</span>
        <span className="nome-usuario-header">{usuario.nome?.split(' ')[0] || 'Aluno'}</span>
        <ChevronDown size={16} aria-hidden="true" />
      </Dropdown.Toggle>
      <Dropdown.Menu role="menu" data-bs-theme="light">
        <Dropdown.Header><strong>{usuario.nome}</strong><span>Portal do aluno</span></Dropdown.Header>
        <Dropdown.Divider />
        {atalhos.map(({ texto, caminho, Icone }) => {
          const ativo = pathname === caminho || (caminho !== '/sage/aluno' && pathname.startsWith(`${caminho}/`));
          return <Dropdown.Item as={Link} to={caminho} key={caminho} eventKey={caminho} role="menuitem" active={ativo} aria-current={ativo ? 'page' : undefined}>
            <Icone size={17} aria-hidden="true" /> {texto}
          </Dropdown.Item>;
        })}
        <Dropdown.Divider />
        <Dropdown.Item as={Link} to="/sage/login" eventKey="sair" role="menuitem"><LogOut size={17} aria-hidden="true" /> Sair</Dropdown.Item>
      </Dropdown.Menu>
    </Dropdown>
  );
}
