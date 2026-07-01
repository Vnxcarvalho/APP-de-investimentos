import { useState, FormEvent } from 'react';
import { usePortfolio } from '../contexts/PortfolioContext';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { AssetType, ASSET_TYPE_LABELS } from '../types';

interface OperationFormProps {
  onClose: () => void;
}

export function OperationForm({ onClose }: OperationFormProps) {
  const { addOp } = usePortfolio();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [name, setName] = useState('');
  const [assetType, setAssetType] = useState<AssetType>('acao');
  const [opType, setOpType] = useState<'compra' | 'venda'>('compra');
  const [quantity, setQuantity] = useState('');
  const [price, setPrice] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const qty = parseFloat(quantity.replace(',', '.'));
    const prc = parseFloat(price.replace(',', '.'));
    if (!name.trim() || isNaN(qty) || isNaN(prc) || qty <= 0 || prc <= 0) return;

    setError('');
    setLoading(true);
    try {
      await addOp({
        ticker: name.trim().toUpperCase(),
        assetType,
        type: opType,
        quantity: qty,
        price: prc,
        date: new Date(date + 'T12:00:00'),
        totalValue: qty * prc,
        notes: notes || undefined,
      });
      onClose();
    } catch (err: any) {
      const code: string = err?.code ?? '';
      if (code === 'permission-denied') {
        setError('Sem permissão para salvar. Verifique as regras do Firestore no Firebase Console.');
      } else if (code === 'unavailable' || code === 'network-request-failed') {
        setError('Erro de conexão. Verifique sua internet e tente novamente.');
      } else {
        setError(`Erro ao registrar operação (${code || err?.message || 'desconhecido'}).`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-sm font-medium text-gray-700 block mb-1">Tipo de Operação</label>
          <div className="grid grid-cols-2 gap-2">
            {(['compra', 'venda'] as const).map(t => (
              <button
                key={t}
                type="button"
                onClick={() => setOpType(t)}
                className={`py-2 rounded-xl text-sm font-medium border transition-all ${
                  opType === t
                    ? t === 'compra'
                      ? 'bg-green-600 text-white border-green-600'
                      : 'bg-red-600 text-white border-red-600'
                    : 'border-gray-200 text-gray-600 hover:border-gray-400'
                }`}
              >
                {t === 'compra' ? 'Compra' : 'Venda'}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 block mb-1">Classe de Ativo</label>
          <select
            value={assetType}
            onChange={e => setAssetType(e.target.value as AssetType)}
            className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            {(Object.keys(ASSET_TYPE_LABELS) as AssetType[]).map(t => (
              <option key={t} value={t}>{ASSET_TYPE_LABELS[t]}</option>
            ))}
          </select>
        </div>
      </div>

      <Input
        label="Nome do Ativo"
        value={name}
        onChange={e => setName(e.target.value)}
        placeholder="Ex: Tesouro Selic 2029, PETR4, Bitcoin"
        required
      />

      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Quantidade"
          type="number"
          value={quantity}
          onChange={e => setQuantity(e.target.value)}
          placeholder="0"
          min="0"
          step="any"
          required
        />
        <Input
          label="Preço Unitário"
          type="number"
          value={price}
          onChange={e => setPrice(e.target.value)}
          placeholder="0,00"
          min="0"
          step="any"
          prefix="R$"
          required
        />
      </div>

      {quantity && price && (
        <div className="bg-gray-50 rounded-xl px-4 py-3 text-sm">
          <span className="text-gray-500">Total: </span>
          <span className="font-bold text-gray-900">
            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
              parseFloat(quantity.replace(',', '.') || '0') * parseFloat(price.replace(',', '.') || '0')
            )}
          </span>
        </div>
      )}

      <Input
        label="Data"
        type="date"
        value={date}
        onChange={e => setDate(e.target.value)}
        required
      />

      <Input
        label="Observações (opcional)"
        value={notes}
        onChange={e => setNotes(e.target.value)}
        placeholder="Ex: reinvestimento de dividendos"
      />

      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      <div className="flex gap-3 pt-2">
        <Button type="button" variant="secondary" className="flex-1" onClick={onClose}>
          Cancelar
        </Button>
        <Button type="submit" className="flex-1" loading={loading}>
          Registrar
        </Button>
      </div>
    </form>
  );
}
