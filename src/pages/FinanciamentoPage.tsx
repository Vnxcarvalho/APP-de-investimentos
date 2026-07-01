import { useState } from 'react';
import { Home, Calculator, FileText } from 'lucide-react';
import { AppLayout } from '../components/Layout/AppLayout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { calcularFinanciamentoPrice, ResultadoFinanciamento } from '../utils/financiamento';
import { formatCurrency } from '../utils/format';

const fmt = (v: number) => formatCurrency(v);
const fmtPct = (v: number) => v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 4 }) + '%';
const parseNum = (s: string) => parseFloat(s.replace(',', '.')) || 0;

// ─── Seção 1: Calculadora de Financiamento ───────────────────────────────────

function SecaoFinanciamento({
  onEntradaCalculada,
}: {
  onEntradaCalculada: (entrada: number) => void;
}) {
  const [valorImovel, setValorImovel] = useState('');
  const [entrada, setEntrada] = useState('');
  const [taxaMensal, setTaxaMensal] = useState('');
  const [prazo, setPrazo] = useState('');
  const [resultado, setResultado] = useState<ResultadoFinanciamento | null>(null);
  const [erro, setErro] = useState('');

  const calcular = () => {
    setErro('');
    const vi = parseNum(valorImovel);
    const ent = parseNum(entrada);
    const tm = parseNum(taxaMensal);
    const pr = parseInt(prazo.replace(/\D/g, ''), 10);

    if (!vi || !ent || !tm || !pr) { setErro('Preencha todos os campos.'); return; }
    if (ent >= vi) { setErro('A entrada não pode ser maior ou igual ao valor do imóvel.'); return; }
    if (pr < 1) { setErro('O prazo deve ser de pelo menos 1 mês.'); return; }

    try {
      const res = calcularFinanciamentoPrice(vi, ent, tm, pr);
      setResultado(res);
      onEntradaCalculada(ent);
    } catch {
      setErro('Erro ao calcular. Verifique os valores informados.');
    }
  };

  return (
    <Card>
      <div className="flex items-center gap-2 mb-6">
        <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
          <Calculator size={16} className="text-primary-600" />
        </div>
        <h2 className="text-lg font-bold text-gray-900">Simulação de Financiamento</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Valor do Imóvel"
          type="text"
          inputMode="decimal"
          value={valorImovel}
          onChange={e => setValorImovel(e.target.value)}
          placeholder="500000"
          prefix="R$"
        />

        <Input
          label="Entrada"
          type="text"
          inputMode="decimal"
          value={entrada}
          onChange={e => setEntrada(e.target.value)}
          placeholder="100000"
          prefix="R$"
        />

        <Input
          label="Taxa de Juros (% a.m.)"
          type="text"
          inputMode="decimal"
          value={taxaMensal}
          onChange={e => setTaxaMensal(e.target.value)}
          placeholder="0,80"
        />

        <Input
          label="Prazo (meses)"
          type="text"
          inputMode="numeric"
          value={prazo}
          onChange={e => setPrazo(e.target.value.replace(/\D/g, ''))}
          placeholder="360"
        />
      </div>

      {erro && (
        <p className="mt-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {erro}
        </p>
      )}

      <Button className="mt-4" onClick={calcular}>
        <Calculator size={16} />
        Calcular
      </Button>

      {resultado && (() => {
        const entradaNum = parseNum(entrada);
        const custoTotal = resultado.vf + entradaNum;
        const primeiraP = resultado.tabela[0];
        const pctJuros = (resultado.totalJuros / resultado.vf) * 100;
        const pctAmort = 100 - pctJuros;
        const anosCompletos = Math.floor(parseNum(prazo) / 12);
        const mesesRestantes = parseNum(prazo) % 12;

        return (
          <div className="mt-6 space-y-5">

            {/* Linha do tempo do prazo */}
            <div className="bg-gray-50 rounded-xl px-4 py-3 text-sm text-gray-600">
              Financiamento de{' '}
              <span className="font-bold text-gray-900">{fmt(resultado.vp)}</span>
              {' '}em{' '}
              <span className="font-bold text-gray-900">
                {anosCompletos > 0 && `${anosCompletos} ano${anosCompletos > 1 ? 's' : ''}`}
                {mesesRestantes > 0 && ` ${mesesRestantes} ${mesesRestantes > 1 ? 'meses' : 'mês'}`}
              </span>
              {' '}a{' '}
              <span className="font-bold text-gray-900">{parseNum(taxaMensal).toFixed(2)}% a.m.</span>
            </div>

            {/* Cards principais */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-green-50 rounded-xl p-4">
                <p className="text-xs text-green-600 mb-1">Parcela mensal</p>
                <p className="text-2xl font-bold text-green-700">{fmt(resultado.parcela)}</p>
                <p className="text-xs text-green-600 mt-1">por {parseNum(prazo)} meses</p>
              </div>
              <div className="bg-blue-50 rounded-xl p-4">
                <p className="text-xs text-blue-600 mb-1">Custo total do imóvel</p>
                <p className="text-2xl font-bold text-blue-700">{fmt(custoTotal)}</p>
                <p className="text-xs text-blue-600 mt-1">entrada + parcelas</p>
              </div>
            </div>

            {/* Detalhamento */}
            <div className="border border-gray-100 rounded-xl divide-y divide-gray-100 text-sm">
              <div className="flex justify-between px-4 py-3">
                <span className="text-gray-500">Entrada paga</span>
                <span className="font-medium">{fmt(entradaNum)}</span>
              </div>
              <div className="flex justify-between px-4 py-3">
                <span className="text-gray-500">Total de parcelas</span>
                <span className="font-medium">{fmt(resultado.vf)}</span>
              </div>
              <div className="flex justify-between px-4 py-3">
                <span className="text-gray-500">↳ Amortização (capital)</span>
                <span className="font-medium text-green-600">{fmt(resultado.vp)}</span>
              </div>
              <div className="flex justify-between px-4 py-3">
                <span className="text-gray-500">↳ Juros pagos</span>
                <span className="font-medium text-red-500">{fmt(resultado.totalJuros)}</span>
              </div>
            </div>

            {/* Barra juros vs capital */}
            <div>
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>Capital <span className="text-green-600 font-medium">{pctAmort.toFixed(1)}%</span></span>
                <span>Juros <span className="text-red-500 font-medium">{pctJuros.toFixed(1)}%</span></span>
              </div>
              <div className="h-3 rounded-full overflow-hidden flex">
                <div className="bg-green-400 h-full transition-all" style={{ width: `${pctAmort}%` }} />
                <div className="bg-red-400 h-full transition-all" style={{ width: `${pctJuros}%` }} />
              </div>
              <p className="text-xs text-gray-400 mt-1">Composição do total pago em parcelas</p>
            </div>

            {/* Primeira parcela */}
            {primeiraP && (
              <div className="bg-gray-50 rounded-xl px-4 py-3">
                <p className="text-xs text-gray-500 font-medium mb-2">Composição da 1ª parcela</p>
                <div className="flex gap-4 text-sm">
                  <div>
                    <span className="text-gray-400 text-xs">Juros</span>
                    <p className="font-bold text-red-500">{fmt(primeiraP.juros)}</p>
                  </div>
                  <div className="border-l border-gray-200 pl-4">
                    <span className="text-gray-400 text-xs">Amortização</span>
                    <p className="font-bold text-green-600">{fmt(primeiraP.amortizacao)}</p>
                  </div>
                  <div className="border-l border-gray-200 pl-4">
                    <span className="text-gray-400 text-xs">Total da parcela</span>
                    <p className="font-bold text-gray-800">{fmt(primeiraP.parcela)}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Tabela */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <FileText size={14} className="text-gray-400" />
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Tabela de amortização</p>
              </div>
              <div className="overflow-x-auto max-h-64 border border-gray-100 rounded-xl">
                <table className="w-full text-xs">
                  <thead className="sticky top-0 bg-gray-50">
                    <tr className="text-left text-gray-500 border-b border-gray-200">
                      <th className="px-3 py-2 font-medium">#</th>
                      <th className="px-3 py-2 font-medium text-red-500">Juros</th>
                      <th className="px-3 py-2 font-medium text-green-600">Amortização</th>
                      <th className="px-3 py-2 font-medium">Saldo Devedor</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {resultado.tabela.map(row => (
                      <tr key={row.numero} className="hover:bg-gray-50">
                        <td className="px-3 py-2 text-gray-400">{row.numero}º</td>
                        <td className="px-3 py-2 text-red-500">{fmt(row.juros)}</td>
                        <td className="px-3 py-2 text-green-600">{fmt(row.amortizacao)}</td>
                        <td className="px-3 py-2 font-medium">{fmt(row.saldoFinal)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        );
      })()}
    </Card>
  );
}

// ─── Seção 2: Valor por m² ───────────────────────────────────────────────────

function SecaoMetroQuadrado() {
  const [area, setArea] = useState('');
  const [precoPorM2, setPrecoPorM2] = useState('');
  const [valorTotal, setValorTotal] = useState('');
  const [modo, setModo] = useState<'calcularValor' | 'calcularPreco'>('calcularValor');

  const calcular = () => {
    if (modo === 'calcularValor') {
      const a = parseNum(area);
      const p = parseNum(precoPorM2);
      if (a > 0 && p > 0) setValorTotal((a * p).toFixed(2));
    } else {
      const v = parseNum(valorTotal);
      const a = parseNum(area);
      if (v > 0 && a > 0) setPrecoPorM2((v / a).toFixed(2));
    }
  };

  return (
    <Card>
      <div className="flex items-center gap-2 mb-6">
        <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
          <Home size={16} className="text-amber-600" />
        </div>
        <h2 className="text-lg font-bold text-gray-900">Valor por m² da Região</h2>
      </div>

      <div className="flex gap-2 mb-4">
        {(['calcularValor', 'calcularPreco'] as const).map(m => (
          <button
            key={m}
            onClick={() => setModo(m)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-all ${
              modo === m ? 'bg-amber-500 text-white border-amber-500' : 'border-gray-200 text-gray-600 hover:border-gray-400'
            }`}
          >
            {m === 'calcularValor' ? 'Calcular valor total' : 'Calcular preço/m²'}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Input
          label="Área (m²)"
          type="number"
          value={area}
          onChange={e => setArea(e.target.value)}
          placeholder="80"
          min="0"
          step="any"
        />
        <Input
          label="Preço por m²"
          type="number"
          value={precoPorM2}
          onChange={e => setPrecoPorM2(e.target.value)}
          placeholder="5000"
          min="0"
          step="any"
          prefix="R$"
          disabled={modo === 'calcularPreco'}
        />
        <Input
          label="Valor Total do Imóvel"
          type="number"
          value={valorTotal}
          onChange={e => setValorTotal(e.target.value)}
          placeholder="400000"
          min="0"
          step="any"
          prefix="R$"
          disabled={modo === 'calcularValor'}
        />
      </div>

      <Button className="mt-4" onClick={calcular} variant="secondary">
        <Calculator size={16} />
        Calcular
      </Button>

      {modo === 'calcularValor' && valorTotal && parseNum(area) > 0 && (
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
          <ResultBox label="Área" value={`${parseNum(area).toLocaleString('pt-BR')} m²`} color="amber" />
          <ResultBox label="Preço por m²" value={fmt(parseNum(precoPorM2))} color="amber" />
          <ResultBox label="Valor Estimado" value={fmt(parseNum(valorTotal))} color="green" />
        </div>
      )}

      {modo === 'calcularPreco' && precoPorM2 && parseNum(area) > 0 && (
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
          <ResultBox label="Valor Total" value={fmt(parseNum(valorTotal))} color="amber" />
          <ResultBox label="Área" value={`${parseNum(area).toLocaleString('pt-BR')} m²`} color="amber" />
          <ResultBox label="Preço por m²" value={fmt(parseNum(precoPorM2))} color="green" />
        </div>
      )}
    </Card>
  );
}

// ─── Componente auxiliar ──────────────────────────────────────────────────────

type Color = 'blue' | 'green' | 'purple' | 'red' | 'amber';

const colorMap: Record<Color, string> = {
  blue: 'bg-blue-50 text-blue-700',
  green: 'bg-green-50 text-green-700',
  purple: 'bg-purple-50 text-purple-700',
  red: 'bg-red-50 text-red-700',
  amber: 'bg-amber-50 text-amber-700',
};

function ResultBox({ label, value, color }: { label: string; value: string; color: Color }) {
  return (
    <div className={`rounded-xl px-4 py-3 ${colorMap[color]}`}>
      <p className="text-xs opacity-70 mb-0.5">{label}</p>
      <p className="font-bold text-sm">{value}</p>
    </div>
  );
}

// ─── Página principal ─────────────────────────────────────────────────────────

export function FinanciamentoPage() {
  return (
    <AppLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Financiamento Imobiliário</h1>
        <p className="text-gray-500 text-sm mt-1">Simule parcelas e estime o valor do imóvel por m²</p>
      </div>

      <div className="space-y-6">
        <SecaoFinanciamento onEntradaCalculada={() => {}} />
        <SecaoMetroQuadrado />
      </div>
    </AppLayout>
  );
}
