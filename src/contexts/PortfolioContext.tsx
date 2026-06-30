import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { Asset, Operation, Quote, AssetWithQuote } from '../types';
import { getAssets, getOperations, addOperation, deleteOperation } from '../services/portfolioService';
import { fetchQuotes } from '../services/stockApi';
import { useAuth } from './AuthContext';

interface PortfolioContextType {
  assets: Asset[];
  operations: Operation[];
  quotes: Record<string, Quote>;
  loading: boolean;
  assetsWithQuotes: AssetWithQuote[];
  totalInvested: number;
  currentValue: number;
  totalReturn: number;
  totalReturnPercent: number;
  addOp: (op: Omit<Operation, 'id'>) => Promise<void>;
  deleteOp: (opId: string, ticker: string, assetType: import('../types').AssetType) => Promise<void>;
  refresh: () => Promise<void>;
}

const PortfolioContext = createContext<PortfolioContextType | null>(null);

export function PortfolioProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [operations, setOperations] = useState<Operation[]>([]);
  const [quotes, setQuotes] = useState<Record<string, Quote>>({});
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [a, o] = await Promise.all([getAssets(user.uid), getOperations(user.uid)]);
      setAssets(a);
      setOperations(o);

      const tickers = a.filter(x => x.type !== 'renda-fixa').map(x => x.ticker);
      if (tickers.length > 0) {
        const qs = await fetchQuotes(tickers);
        const qMap: Record<string, Quote> = {};
        qs.forEach(q => { qMap[q.ticker] = q; });
        setQuotes(qMap);
      }
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const assetsWithQuotes: AssetWithQuote[] = assets.map(a => {
    const q = quotes[a.ticker];
    const currentPrice = q?.price ?? a.averagePrice;
    const currentValue = currentPrice * a.quantity;
    const ret = currentValue - a.totalInvested;
    const retPct = a.totalInvested > 0 ? (ret / a.totalInvested) * 100 : 0;
    return { ...a, currentPrice, currentValue, return: ret, returnPercent: retPct };
  });

  const totalInvested = assets.reduce((s, a) => s + a.totalInvested, 0);
  const currentValue = assetsWithQuotes.reduce((s, a) => s + (a.currentValue ?? 0), 0);
  const totalReturn = currentValue - totalInvested;
  const totalReturnPercent = totalInvested > 0 ? (totalReturn / totalInvested) * 100 : 0;

  const addOp = async (op: Omit<Operation, 'id'>) => {
    if (!user) return;
    await addOperation(user.uid, op);
    await loadData();
  };

  const deleteOp = async (opId: string, ticker: string, assetType: import('../types').AssetType) => {
    if (!user) return;
    await deleteOperation(user.uid, opId, ticker, assetType);
    await loadData();
  };

  return (
    <PortfolioContext.Provider value={{
      assets, operations, quotes, loading,
      assetsWithQuotes, totalInvested, currentValue,
      totalReturn, totalReturnPercent,
      addOp, deleteOp, refresh: loadData,
    }}>
      {children}
    </PortfolioContext.Provider>
  );
}

export function usePortfolio() {
  const ctx = useContext(PortfolioContext);
  if (!ctx) throw new Error('usePortfolio must be used within PortfolioProvider');
  return ctx;
}
