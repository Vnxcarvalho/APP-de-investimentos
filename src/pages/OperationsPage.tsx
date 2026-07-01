import { useState } from 'react';
import { Plus, Trash2, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';
import { usePortfolio } from '../contexts/PortfolioContext';
import { AppLayout } from '../components/Layout/AppLayout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { AssetBadge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { OperationForm } from '../components/OperationForm';
import { formatCurrency, formatDate, formatQuantity } from '../utils/format';
import { Operation } from '../types';

export function OperationsPage() {
  const { operations, loading, deleteOp } = usePortfolio();
  const [addOpen, setAddOpen] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  const handleDelete = async (op: Operation) => {
    if (!confirm(`Excluir operação de ${op.type} de ${op.ticker}?`)) return;
    setDeleting(op.id);
    try {
      await deleteOp(op.id, op.ticker, op.assetType);
    } finally {
      setDeleting(null);
    }
  };

  return (
    <AppLayout>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Operações</h1>
          <p className="text-gray-500 text-sm mt-1">{operations.length} operações registradas</p>
        </div>
        <Button onClick={() => setAddOpen(true)}>
          <Plus size={16} />
          Nova Operação
        </Button>
      </div>

      <Card>
        {loading ? (
          <div className="text-center py-12 text-gray-400">Carregando...</div>
        ) : operations.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <ArrowUpCircle size={48} className="mx-auto mb-3 opacity-30" />
            <p className="text-lg font-medium mb-1">Nenhuma operação ainda</p>
            <p className="text-sm">Registre suas compras e vendas de ativos</p>
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
                  <th className="pb-3 font-medium">Obs.</th>
                  <th className="pb-3 font-medium"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {operations.map((op) => (
                  <tr key={op.id} className="hover:bg-gray-50">
                    <td className="py-3">
                      <div className="flex items-center gap-1.5">
                        {op.type === 'compra' ? (
                          <ArrowUpCircle size={16} className="text-green-500" />
                        ) : (
                          <ArrowDownCircle size={16} className="text-red-500" />
                        )}
                        <span className={`font-medium capitalize ${
                          op.type === 'compra' ? 'text-green-700' : 'text-red-700'
                        }`}>
                          {op.type}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 font-bold">{op.ticker}</td>
                    <td className="py-3"><AssetBadge type={op.assetType} /></td>
                    <td className="py-3 text-gray-600">{formatDate(op.date)}</td>
                    <td className="py-3 text-gray-700">{formatQuantity(op.quantity)}</td>
                    <td className="py-3">{formatCurrency(op.price)}</td>
                    <td className="py-3 font-medium">{formatCurrency(op.totalValue)}</td>
                    <td className="py-3 text-gray-500 max-w-[120px] truncate">{op.notes || '—'}</td>
                    <td className="py-3">
                      <button
                        onClick={() => handleDelete(op)}
                        disabled={deleting === op.id}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                      >
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                ))}
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
