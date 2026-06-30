export type AssetType = 'acao' | 'fii' | 'renda-fixa' | 'cripto' | 'exterior';

export interface Asset {
  id: string;
  ticker: string;
  name: string;
  type: AssetType;
  quantity: number;
  averagePrice: number;
  totalInvested: number;
  createdAt: Date;
  updatedAt: Date;
}

export type OperationType = 'compra' | 'venda';

export interface Operation {
  id: string;
  ticker: string;
  assetType: AssetType;
  type: OperationType;
  quantity: number;
  price: number;
  date: Date;
  totalValue: number;
  notes?: string;
}

export interface Quote {
  ticker: string;
  price: number;
  change: number;
  changePercent: number;
  name?: string;
  logoUrl?: string;
}

export interface PortfolioSummary {
  totalInvested: number;
  currentValue: number;
  totalReturn: number;
  totalReturnPercent: number;
  assets: AssetWithQuote[];
}

export interface AssetWithQuote extends Asset {
  currentPrice?: number;
  currentValue?: number;
  return?: number;
  returnPercent?: number;
}

export const ASSET_TYPE_LABELS: Record<AssetType, string> = {
  acao: 'Ação',
  fii: 'FII',
  'renda-fixa': 'Renda Fixa',
  cripto: 'Cripto',
  exterior: 'Exterior',
};

export const ASSET_TYPE_COLORS: Record<AssetType, string> = {
  acao: '#22c55e',
  fii: '#3b82f6',
  'renda-fixa': '#f59e0b',
  cripto: '#8b5cf6',
  exterior: '#ec4899',
};
