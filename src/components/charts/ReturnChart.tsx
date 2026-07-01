import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, ReferenceLine,
} from 'recharts';
import { AssetWithQuote } from '../../types';
import { formatCurrency } from '../../utils/format';

interface ReturnChartProps {
  assets: AssetWithQuote[];
}

export function ReturnChart({ assets }: ReturnChartProps) {
  const data = assets
    .filter(a => a.return !== undefined)
    .map(a => ({
      ticker: a.ticker,
      return: a.return ?? 0,
      returnPercent: a.returnPercent ?? 0,
    }))
    .sort((a, b) => b.return - a.return)
    .slice(0, 10);

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-gray-400 text-sm">
        Nenhum ativo com cotação disponível
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <XAxis dataKey="ticker" tick={{ fontSize: 12 }} />
        <YAxis
          tickFormatter={(v) => formatCurrency(v)}
          tick={{ fontSize: 11 }}
          width={80}
        />
        <Tooltip
          formatter={(value, _name, props) => [
            `${formatCurrency(Number(value ?? 0))} (${(props as any).payload?.returnPercent?.toFixed(2)}%)`,
            'Retorno',
          ]}
          contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
        />
        <ReferenceLine y={0} stroke="#e5e7eb" />
        <Bar dataKey="return" radius={[6, 6, 0, 0]}>
          {data.map((entry, index) => (
            <Cell key={index} fill={entry.return >= 0 ? '#22c55e' : '#ef4444'} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
