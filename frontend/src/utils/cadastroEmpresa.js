const somenteDigitos = (valor) => String(valor ?? '').replace(/\D/g, '');

export function mascararCnpj(valor) {
  return somenteDigitos(valor).slice(0, 14)
    .replace(/^(\d{2})(\d)/, '$1.$2')
    .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1/$2')
    .replace(/(\d{4})(\d)/, '$1-$2');
}

export function mascararCep(valor) {
  return somenteDigitos(valor).slice(0, 8).replace(/^(\d{5})(\d)/, '$1-$2');
}

export function mascararTelefone(valor) {
  const digitos = somenteDigitos(valor).slice(0, 11);
  if (digitos.length <= 2) return digitos.replace(/^(\d{1,2})/, '($1');
  if (digitos.length <= 6) return digitos.replace(/^(\d{2})(\d+)/, '($1) $2');
  if (digitos.length <= 10) return digitos.replace(/^(\d{2})(\d{4})(\d+)/, '($1) $2-$3');
  return digitos.replace(/^(\d{2})(\d{5})(\d+)/, '($1) $2-$3');
}

export function cnpjValido(valor) {
  const cnpj = somenteDigitos(valor);
  if (cnpj.length !== 14 || /^(\d)\1{13}$/.test(cnpj)) return false;

  const calcularDigito = (base, pesos) => {
    const soma = base.split('').reduce((total, digito, indice) => total + Number(digito) * pesos[indice], 0);
    const resto = soma % 11;
    return resto < 2 ? 0 : 11 - resto;
  };
  const primeiro = calcularDigito(cnpj.slice(0, 12), [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]);
  const segundo = calcularDigito(`${cnpj.slice(0, 12)}${primeiro}`, [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]);
  return cnpj.endsWith(`${primeiro}${segundo}`);
}

export function validarCadastroEmpresa(dados) {
  const erros = {};
  const texto = (campo) => String(dados[campo] ?? '').trim();
  const emailValido = (valor) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor);

  if (texto('razaoSocial').length < 3) erros.razaoSocial = 'Informe a razão social.';
  if (texto('nomeEmpresa').length < 2) erros.nomeEmpresa = 'Informe o nome da empresa.';
  if (!cnpjValido(dados.cnpj)) erros.cnpj = 'Informe um CNPJ válido.';
  if (texto('ramoAtividade').length < 3) erros.ramoAtividade = 'Informe o ramo de atividade.';
  if (!emailValido(texto('emailEmpresa'))) erros.emailEmpresa = 'Informe um e-mail válido.';
  if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(texto('senha'))) {
    erros.senha = 'Use ao menos 8 caracteres, com maiúscula, minúscula e número.';
  }
  if (somenteDigitos(dados.cep).length !== 8) erros.cep = 'Informe um CEP com 8 números.';
  if (texto('cidade').length < 2) erros.cidade = 'Informe a cidade.';
  if (!texto('uf')) erros.uf = 'Selecione a UF.';
  if (![10, 11].includes(somenteDigitos(dados.telefone).length)) erros.telefone = 'Informe um telefone com DDD.';
  if (!texto('dataInicio')) erros.dataInicio = 'Informe a data de início.';
  if (!texto('dataFim')) erros.dataFim = 'Informe a data de término.';
  if (texto('dataInicio') && texto('dataFim') && dados.dataFim <= dados.dataInicio) {
    erros.dataFim = 'A data de término deve ser posterior à data de início.';
  }
  if (texto('nomeSupervisor').length < 3) erros.nomeSupervisor = 'Informe o nome completo do supervisor.';
  if (texto('cargoSupervisor').length < 2) erros.cargoSupervisor = 'Informe o cargo do supervisor.';
  if (!emailValido(texto('emailSupervisor'))) erros.emailSupervisor = 'Informe um e-mail válido.';

  return erros;
}

export const cadastroEmpresaVazio = {
  razaoSocial: '', nomeEmpresa: '', cnpj: '', ramoAtividade: '', emailEmpresa: '', senha: '',
  cep: '', cidade: '', uf: '', telefone: '', dataInicio: '', dataFim: '',
  nomeSupervisor: '', cargoSupervisor: '', emailSupervisor: '',
};

export function validarDocumentoCadastro(arquivo) {
  if (!arquivo) return 'Selecione o documento da empresa em PDF.';
  const nomePdf = String(arquivo.name ?? '').toLowerCase().endsWith('.pdf');
  if (arquivo.type !== 'application/pdf' && !nomePdf) return 'O documento deve estar no formato PDF.';
  if (arquivo.size <= 0) return 'O arquivo selecionado está vazio.';
  if (arquivo.size > 10 * 1024 * 1024) return 'O PDF deve ter no máximo 10 MB.';
  return '';
}

export function formatarTamanhoArquivo(bytes) {
  const tamanho = Number(bytes) || 0;
  if (tamanho < 1024) return `${tamanho} B`;
  if (tamanho < 1024 * 1024) return `${(tamanho / 1024).toFixed(1)} KB`;
  return `${(tamanho / 1024 / 1024).toFixed(1)} MB`;
}
