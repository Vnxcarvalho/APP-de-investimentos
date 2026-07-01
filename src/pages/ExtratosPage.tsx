import { ArrowUpCircle, ArrowDownCircle, Banknote } from 'lucide-react';
import { usePortfolio } from '../contexts/PortfolioContext';
import { AppLayout } from '../components/Layout/AppLayout';
import { Card } from '../components/ui/Card';
import { AssetBadge } from '../components/ui/Badge';
import { formatCurrency, formatDate, formatQuantity } from '../utils/format';
import { Operation } from '../types';

type ExtratoTipo = 'compra' | 'venda' | 'resgate';

function tipoDaOperacao(op: Operation): ExtratoTipo {
  if (op.type === 'venda' && op.notes === 'Resgate') return 'resgate';
  return op.type;
}

const tipoConfig: Record<ExtratoTipo, { label: string; icon: typeof ArrowUpCircle; className: string }> = {
  compra: { label: 'Compra', icon: ArrowUpCircle, className: 'text-green-700' },
  venda: { label: 'Venda', icon: ArrowDownCircle, className: 'text-red-700' },
  resgate: { label: 'Resgate', icon: Banknote, className: 'text-blue-700' },
};

export function ExtratosPage() {
  const { operations, loading } = usePortfolio();

  return (
    <AppLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Extratos</h1>
        <p className="text-gray-500 text-sm mt-1">
          Histórico de compras, vendas e resgates da sua carteira
        </p>
      </div>

      <Card>
        {loading ? (
          <div className="text-center py-12 text-gray-400">Carregando...</div>
        ) : operations.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <Banknote size={48} className="mx-auto mb-3 opacity-30" />
            <p className="text-lg font-medium mb-1">Nenhuma movimentação ainda</p>
            <p className="text-sm">Compras, vendas e resgates aparecerão aqui</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b border-gray-100">
                  <th className="pb-3 font-medium">Tipo</th>
                  <th className="pb-3 font-medium">Ativo</th>
                  <th className="pb-3 font-medium">Classe</th>
                  <th className="pb-3 font-medium">Data</th>
                  <th className="pb-3 font-medium">Qtd</th>
                  <th className="pb-3 font-medium">Preço</th>
                  <th className="pb-3 font-medium">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {operations.map(op => {
                  const tipo = tipoDaOperacao(op);
                  const { label, icon: Icon, className } = tipoConfig[tipo];
                  return (
                    <tr key={op.id} className="hover:bg-gray-50">
                      <td className="py-3">
                        <div className="flex items-center gap-1.5">
                          <Icon size={16} className={className} />
                          <span className={`font-medium ${className}`}>{label}</span>
                        </div>
                      </td>
                      <td className="py-3 font-bold">{op.ticker}</td>
                      <td className="py-3"><AssetBadge type={op.assetType} /></td>
                      <td className="py-3 text-gray-600">{formatDate(op.date)}</td>
                      <td className="py-3 text-gray-700">{formatQuantity(op.quantity)}</td>
                      <td className="py-3">{formatCurrency(op.price)}</td>
                      <td className="py-3 font-medium">{formatCurrency(op.totalValue)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </AppLayout>
  );
}
