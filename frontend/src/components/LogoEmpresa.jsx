import { useState } from 'react';
import { Building2 } from 'lucide-react';
import { obterLogoEmpresa } from '../utils/logosEmpresas.js';

function LogoEmpresa({ empresa, logoEmpresa, tamanho = 40, className = '' }) {
  const [falhou, setFalhou] = useState(false);
  const origem = obterLogoEmpresa({ empresa, logoEmpresa });

  if (!origem || falhou) {
    return <Building2 className={className} size={tamanho} aria-label={`Empresa ${empresa}`} />;
  }

  return <img className={className} src={origem} alt={`Logo da empresa ${empresa}`} width={tamanho} height={tamanho}
    onError={() => setFalhou(true)} />;
}

export default LogoEmpresa;
