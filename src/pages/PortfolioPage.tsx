import { useState } from 'react';
import { Plus, Search, Trash2, TrendingUp, TrendingDown } from 'lucide-react';
import { usePortfolio } from '../contexts/PortfolioContext';
import { AppLayout } from '../components/Layout/AppLayout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { AssetBadge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { OperationForm } from '../components/OperationForm';
import { formatCurrency, formatPercent, formatQuantity } from '../utils/format';
import { AssetWithQuote } from '../types';

export function PortfolioPage() {
  const { assetsWithQuotes, loading, totalInvested, currentValue, totalReturn, totalReturnPercent } = usePortfolio();
  const [search, setSearch] = useState('');
  const [addOpen, setAddOpen] = useState(false);

  const filtered = assetsWithQuotes.filter(a =>
    a.ticker.toLowerCase().includes(search.toLowerCase()) ||
    a.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AppLayout>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Portfólio</h1>
          <p className="text-gray-500 text-sm mt-1">{assetsWithQuotes.length} ativos na carteira</p>
        </div>
        <Button onClick={() => setAddOpen(true)}>
          <Plus size={16} />
          Nova Operação
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <Card className="text-center">
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Investido</p>
          <p className="text-xl font-bold">{formatCurrency(totalInvested)}</p>
        </Card>
        <Card className="text-center">
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Valor Atual</p>
          <p className="text-xl font-bold">{formatCurrency(currentValue)}</p>
        </Card>
        <Card className={`text-center ${totalReturn >= 0 ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Retorno</p>
          <p className={`text-xl font-bold ${totalReturn >= 0 ? 'text-green-700' : 'text-red-700'}`}>
            {formatPercent(totalReturnPercent, true)}
          </p>
        </Card>
      </div>

      <Card>
        <div className="flex items-center gap-3 mb-4">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar ativo..."
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12 text-gray-400">Carregando...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <TrendingUp size={48} className="mx-auto mb-3 opacity-30" />
            <p className="text-lg font-medium mb-1">Nenhum ativo encontrado</p>
            <p className="text-sm">Registre sua primeira operação de compra</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b border-gray-100">
                  <th className="pb-3 font-medium">Ativo</th>
                  <th className="pb-3 font-medium">Qtd</th>
                  <th className="pb-3 font-medium">P. Médio</th>
                  <th className="pb-3 font-medium">Cotação</th>
                  <th className="pb-3 font-medium">Investido</th>
                  <th className="pb-3 font-medium">Valor Atual</th>
                  <th className="pb-3 font-medium text-right">Retorno</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((a: AssetWithQuote) => {
                  const isPos = (a.return ?? 0) >= 0;
                  return (
                    <tr key={a.id} className="hover:bg-gray-50">
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <div>
                            <p className="font-bold">{a.ticker}</p>
                            <AssetBadge type={a.type} />
                          </div>
                        </div>
                      </td>
                      <td className="py-3 text-gray-700">{formatQuantity(a.quantity)}</td>
                      <td className="py-3 text-gray-600">{formatCurrency(a.averagePrice)}</td>
                      <td className="py-3 font-medium">{formatCurrency(a.currentPrice ?? a.averagePrice)}</td>
                      <td className="py-3 text-gray-600">{formatCurrency(a.totalInvested)}</td>
                      <td className="py-3 font-medium">{formatCurrency(a.currentValue ?? a.totalInvested)}</td>
                      <td className="py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {isPos
                            ? <TrendingUp size={14} className="text-green-500" />
                            : <TrendingDown size={14} className="text-red-500" />
                          }
                          <span className={`font-medium ${isPos ? 'text-green-600' : 'text-red-600'}`}>
                            {formatPercent(a.returnPercent ?? 0, true)}
                          </span>
                        </div>
                        <p className={`text-xs mt-0.5 ${isPos ? 'text-green-500' : 'text-red-500'}`}>
                          {formatCurrency(a.return ?? 0)}
                        </p>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Nova Operação" size="lg">
        <OperationForm onClose={() => setAddOpen(false)} />
      </Modal>
    </AppLayout>
  );
}
