import { useState } from 'react';
import { Download, FileText, Trash2 } from 'lucide-react';
import { baixarAnexo } from '../../utils/anexosPerfil.js';
import './PerfilComplementos.css';

export default function AnexosPerfil({ anexos = [], aoRemover, desabilitado = false }) {
  const [erro, setErro] = useState('');
  async function baixar(anexo) {
    try { await baixarAnexo(anexo); setErro(''); }
    catch (error) { setErro(error.message); }
  }
  return <div className="anexos-perfil">
    {!anexos.length ? <p className="perfil-complemento-vazio">Nenhum arquivo anexado.</p> : <ul>
      {anexos.map((anexo) => <li key={anexo.id}>
        <FileText size={19} aria-hidden="true" />
        <div className="anexo-perfil-nome"><strong>{anexo.nome}</strong><span>{anexo.tamanho < 1024 * 1024
          ? `${Math.max(1, Math.ceil(anexo.tamanho / 1024))} KB`
          : `${(anexo.tamanho / 1024 / 1024).toLocaleString('pt-BR', { maximumFractionDigits: 2 })} MB`}</span></div>
        <button type="button" onClick={() => baixar(anexo)} aria-label={`Baixar ${anexo.nome}`}><Download size={17} aria-hidden="true" /></button>
        {aoRemover && <button type="button" disabled={desabilitado} onClick={() => aoRemover(anexo.id)} aria-label={`Remover ${anexo.nome}`}><Trash2 size={17} aria-hidden="true" /></button>}
      </li>)}
    </ul>}
    {erro && <p className="text-danger" role="alert">{erro}</p>}
  </div>;
}
