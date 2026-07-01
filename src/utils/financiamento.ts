export interface ParcelaPrice {
  numero: number;
  saldoInicial: number;
  parcela: number;
  juros: number;
  amortizacao: number;
  saldoFinal: number;
}

export interface ResultadoFinanciamento {
  vp: number;
  parcela: number;
  vf: number;
  totalJuros: number;
  tabela: ParcelaPrice[];
}

export function calcularFinanciamentoPrice(
  valorImovel: number,
  entrada: number,
  taxaMensal: number,
  prazoMeses: number
): ResultadoFinanciamento {
  const vp = valorImovel - entrada;
  const i = taxaMensal / 100;

  const fator = Math.pow(1 + i, prazoMeses);
  const parcela = vp * (i * fator) / (fator - 1);
  const vf = parcela * prazoMeses;
  const totalJuros = vf - vp;

  const tabela: ParcelaPrice[] = [];
  let saldo = vp;
  for (let k = 1; k <= prazoMeses; k++) {
    const juros = saldo * i;
    const amortizacao = parcela - juros;
    const saldoFinal = Math.max(0, saldo - amortizacao);
    tabela.push({ numero: k, saldoInicial: saldo, parcela, juros, amortizacao, saldoFinal });
    saldo = saldoFinal;
  }

  return { vp, parcela, vf, totalJuros, tabela };
}

export function taxaAnualParaMensal(taxaAnual: number): number {
  return (Math.pow(1 + taxaAnual / 100, 1 / 12) - 1) * 100;
}

export function taxaMensalParaAnual(taxaMensal: number): number {
  return (Math.pow(1 + taxaMensal / 100, 12) - 1) * 100;
}
