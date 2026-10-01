const logosEmpresas = {
  'Tech Minas Soluções': '/images/empresas/tech-minas.svg',
  'Tech Soluções': '/images/empresas/tech-solucoes.svg',
  'Tech Soluções Ltda': '/images/empresas/tech-solucoes.svg',
  'Inova Tech': '/images/empresas/inova-tech.svg',
  'Inova Digital': '/images/empresas/inova-digital.svg',
  'Prefeitura de Almenara': '/images/empresas/prefeitura-almenara.svg',
  'Norte Minas Soluções': '/images/empresas/norte-minas.svg',
  'Norte Minas Tecnologia': '/images/empresas/norte-minas.svg',
  'Shelby LTDA': '/images/empresas/shelby.svg',
};

export const obterLogoEmpresa = (vaga) => vaga?.logoEmpresa || logosEmpresas[vaga?.empresa] || null;

export default logosEmpresas;
