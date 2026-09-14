const currency = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
const date = new Intl.DateTimeFormat('pt-BR', { timeZone: 'UTC' });

export function formatarBolsa(valor, beneficios = 'Auxílio-transporte / benefícios') {
  return typeof valor === 'number' && Number.isFinite(valor) ? currency.format(valor) : beneficios;
}

export function formatarData(valor) {
  return date.format(new Date(`${valor}T00:00:00Z`));
}
