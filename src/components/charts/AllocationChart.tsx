import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Asset, ASSET_TYPE_COLORS, ASSET_TYPE_LABELS, AssetType } from '../../types';
import { formatCurrency } from '../../utils/format';

interface AllocationChartProps {
  assets: Asset[];
}

export function AllocationChart({ assets }: AllocationChartProps) {
  const byType = assets.reduce<Record<string, number>>((acc, a) => {
    acc[a.type] = (acc[a.type] ?? 0) + a.totalInvested;
    return acc;
  }, {});

  const data = Object.entries(byType).map(([type, value]) => ({
    name: ASSET_TYPE_LABELS[type as AssetType],
    value,
    color: ASSET_TYPE_COLORS[type as AssetType],
  }));

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-gray-400 text-sm">
        Nenhum ativo cadastrado
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={70}
          outerRadius={110}
          paddingAngle={3}
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip
          formatter={(value) => [formatCurrency(Number(value ?? 0)), 'Valor']}
          contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
        />
        <Legend
          formatter={(value) => <span className="text-sm text-gray-600">{value}</span>}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
