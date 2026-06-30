import { AssetType, ASSET_TYPE_LABELS } from '../../types';

interface BadgeProps {
  type: AssetType;
}

const colors: Record<AssetType, string> = {
  acao: 'bg-green-100 text-green-700',
  fii: 'bg-blue-100 text-blue-700',
  'renda-fixa': 'bg-amber-100 text-amber-700',
  cripto: 'bg-purple-100 text-purple-700',
  exterior: 'bg-pink-100 text-pink-700',
};

export function AssetBadge({ type }: BadgeProps) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${colors[type]}`}>
      {ASSET_TYPE_LABELS[type]}
    </span>
  );
}

interface ReturnBadgeProps {
  value: number;
  showSign?: boolean;
}

export function ReturnBadge({ value, showSign = true }: ReturnBadgeProps) {
  const isPositive = value >= 0;
  return (
    <span className={`text-sm font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
      {showSign && (isPositive ? '+' : '')}{value.toFixed(2)}%
    </span>
  );
}
