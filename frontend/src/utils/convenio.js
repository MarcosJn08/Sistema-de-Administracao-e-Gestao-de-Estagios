const preencher = (valor) => String(valor).padStart(2, '0');

const formatarData = (data, separador, ordem) => {
  const partes = {
    dia: preencher(data.getDate()),
    mes: preencher(data.getMonth() + 1),
    ano: data.getFullYear(),
  };
  return ordem.map((parte) => partes[parte]).join(separador);
};

export function calcularVigenciaCincoAnos(dataBase = new Date()) {
  const inicio = new Date(dataBase.getFullYear(), dataBase.getMonth(), dataBase.getDate());
  const vencimento = new Date(inicio);
  vencimento.setFullYear(vencimento.getFullYear() + 5);

  if (inicio.getMonth() === 1 && inicio.getDate() === 29 && vencimento.getMonth() !== 1) {
    vencimento.setMonth(1, 28);
  }

  return {
    inicio: formatarData(inicio, '/', ['dia', 'mes', 'ano']),
    vencimento: formatarData(vencimento, '/', ['dia', 'mes', 'ano']),
    inicioInput: formatarData(inicio, '-', ['ano', 'mes', 'dia']),
    vencimentoInput: formatarData(vencimento, '-', ['ano', 'mes', 'dia']),
  };
}
