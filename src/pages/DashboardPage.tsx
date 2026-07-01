import { TrendingUp, TrendingDown, DollarSign, Wallet, RefreshCw } from 'lucide-react';
import { usePortfolio } from '../contexts/PortfolioContext';
import { AppLayout } from '../components/Layout/AppLayout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { AllocationChart } from '../components/charts/AllocationChart';
import { ReturnChart } from '../components/charts/ReturnChart';
import { formatCurrency, formatPercent } from '../utils/format';

function StatCard({
  title, value, sub, icon: Icon, positive,
}: {
  title: string;
  value: string;
  sub?: string;
  icon: React.ElementType;
  positive?: boolean;
}) {
  return (
    <Card>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {sub && (
            <p className={`text-sm font-medium mt-1 ${
              positive === undefined ? 'text-gray-500' : positive ? 'text-green-600' : 'text-red-600'
            }`}>
              {sub}
            </p>
          )}
        </div>
        <div className={`p-3 rounded-xl ${
          positive === undefined ? 'bg-gray-100' : positive ? 'bg-green-100' : 'bg-red-100'
        }`}>
          <Icon size={20} className={
            positive === undefined ? 'text-gray-600' : positive ? 'text-green-600' : 'text-red-600'
          } />
        </div>
      </div>
    </Card>
  );
}

export function DashboardPage() {
  const {
    assets, assetsWithQuotes, loading,
    totalInvested, currentValue, totalReturn, totalReturnPercent,
    refresh,
  } = usePortfolio();

  const isPositive = totalReturn >= 0;

  return (
    <AppLayout>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">Visão geral da sua carteira</p>
        </div>
        <Button variant="secondary" onClick={refresh} loading={loading}>
          <RefreshCw size={16} />
          Atualizar
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="Total Investido"
          value={formatCurrency(totalInvested)}
          icon={DollarSign}
        />
        <StatCard
          title="Valor Atual"
          value={formatCurrency(currentValue)}
          icon={Wallet}
          positive={isPositive}
        />
        <StatCard
          title="Retorno Total"
          value={formatCurrency(totalReturn)}
          sub={formatPercent(totalReturnPercent, true)}
          icon={isPositive ? TrendingUp : TrendingDown}
          positive={isPositive}
        />
        <StatCard
          title="Ativos"
          value={String(assets.length)}
          sub="na carteira"
          icon={Wallet}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h2 className="text-base font-semibold text-gray-900 mb-4">Alocação por Tipo</h2>
          <AllocationChart assets={assets} />
        </Card>

        <Card>
          <h2 className="text-base font-semibold text-gray-900 mb-4">Retorno por Ativo</h2>
          <ReturnChart assets={assetsWithQuotes} />
        </Card>
      </div>

      {assetsWithQuotes.length > 0 && (
        <Card className="mt-6">
          <h2 className="text-base font-semibold text-gray-900 mb-4">Cotações</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b border-gray-100">
                  <th className="pb-3 font-medium">Ticker</th>
                  <th className="pb-3 font-medium">Preço Médio</th>
                  <th className="pb-3 font-medium">Cotação Atual</th>
                  <th className="pb-3 font-medium text-right">Var. Hoje</th>
                  <th className="pb-3 font-medium text-right">Retorno</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {assetsWithQuotes.map(a => {
                  const q = a as typeof a & { currentPrice?: number; returnPercent?: number };
                  return (
                    <tr key={a.id} className="hover:bg-gray-50">
                      <td className="py-3 font-bold">{a.ticker}</td>
                      <td className="py-3 text-gray-600">{formatCurrency(a.averagePrice)}</td>
                      <td className="py-3 font-medium">{formatCurrency(q.currentPrice ?? 0)}</td>
                      <td className="py-3 text-right">
                        {(a as any).changePercent != null && (a as any).changePercent !== 0 ? (
                          <span className={`font-medium text-sm ${(a as any).changePercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {(a as any).changePercent >= 0 ? '+' : ''}{((a as any).changePercent as number).toFixed(2)}%
                          </span>
                        ) : (
                          <span className="text-gray-400 text-xs">—</span>
                        )}
                      </td>
                      <td className="py-3 text-right">
                        <span className={`font-medium ${(q.returnPercent ?? 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {formatPercent(q.returnPercent ?? 0, true)}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </AppLayout>
  );
}
