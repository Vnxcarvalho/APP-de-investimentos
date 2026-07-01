import { useState, useMemo } from 'react';
import { Layers, FileText, TrendingUp, TrendingDown, CheckCircle2 } from 'lucide-react';
import { AppLayout } from '../components/Layout/AppLayout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { usePortfolio } from '../contexts/PortfolioContext';
import { formatCurrency } from '../utils/format';

const fmt = (v: number) => formatCurrency(v);
const fmtPct = (v: number) =>
  v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + '%';
const parseNum = (s: string) => parseFloat(s.replace(',', '.')) || 0;

export function ResgatePage() {
  const { assetsWithQuotes, loading, addOp } = usePortfolio();
  const [resgates, setResgates] = useState<Record<string, string>>({});
  const [selecionados, setSelecionados] = useState<Record<string, boolean>>({});
  const [metaEntrada, setMetaEntrada] = useState('');
  const [extratoOpen, setExtratoOpen] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [confirmError, setConfirmError] = useState('');
  const [confirmado, setConfirmado] = useState(false);

  const ativos = assetsWithQuotes.filter(a => a.totalInvested > 0);

  const totalResgate = useMemo(
    () =>
      Object.entries(resgates).reduce(
        (s, [id, v]) => (selecionados[id] ? s + parseNum(v) : s),
        0
      ),
    [resgates, selecionados]
  );

  const meta = parseNum(metaEntrada);
  const saldo = totalResgate - meta;

  const handleResgate = (id: string, valor: string, max: number) => {
    const val = parseNum(valor);
    if (val > max) return;
    setResgates(prev => ({ ...prev, [id]: valor }));
  };

  const toggleSelecionado = (id: string) => {
    setSelecionados(prev => {
      const next = { ...prev, [id]: !prev[id] };
      if (!next[id]) setResgates(r => ({ ...r, [id]: '' }));
      return next;
    });
  };

  const limparTudo = () => {
    setResgates({});
    setSelecionados({});
    setConfirmado(false);
    setConfirmError('');
  };

  const itensConfirmar = ativos.filter(a => selecionados[a.id] && parseNum(resgates[a.id] ?? '0') > 0);

  const handleConfirmar = async () => {
    setConfirmError('');
    setConfirming(true);
    try {
      for (const a of itensConfirmar) {
        const valor = parseNum(resgates[a.id] ?? '0');
        const precoAtual = (a.currentPrice && a.currentPrice > 0) ? a.currentPrice : a.averagePrice;
        const quantidade = Math.min(valor / precoAtual, a.quantity);
        await addOp({
          ticker: a.ticker,
          assetType: a.type,
          type: 'venda',
          quantity: quantidade,
          price: precoAtual,
          date: new Date(),
          totalValue: valor,
          notes: 'Resgate',
        });
      }
      setConfirmado(true);
      setExtratoOpen(true);
    } catch (err: any) {
      const code: string = err?.code ?? '';
      if (code === 'permission-denied') {
        setConfirmError('Sem permissão para salvar. Verifique as regras do Firestore no Firebase Console.');
      } else if (code === 'unavailable' || code === 'network-request-failed') {
        setConfirmError('Erro de conexão. Verifique sua internet e tente novamente.');
      } else {
        setConfirmError(`Erro ao confirmar resgate (${code || err?.message || 'desconhecido'}).`);
      }
    } finally {
      setConfirming(false);
    }
  };

  const handleFecharExtrato = () => {
    setExtratoOpen(false);
    if (confirmado) limparTudo();
  };

  return (
    <AppLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Resgate de Investimentos</h1>
        <p className="text-gray-500 text-sm mt-1">
          Planeje o resgate dos seus ativos com base no valor atual de mercado
        </p>
      </div>

      <div className="space-y-6">
        {/* Meta */}
        <Card>
          <h2 className="text-base font-bold text-gray-900 mb-4">Meta de resgate</h2>
          <div className="max-w-xs">
            <Input
              label="Valor desejado"
              type="number"
              value={metaEntrada}
              onChange={e => setMetaEntrada(e.target.value)}
              placeholder="0,00"
              prefix="R$"
              min="0"
              step="any"
            />
          </div>
        </Card>

        {/* Ativos */}
        <Card>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <Layers size={16} className="text-green-600" />
              </div>
              <h2 className="text-base font-bold text-gray-900">Ativos disponíveis</h2>
            </div>
            {(Object.values(selecionados).some(Boolean) || Object.keys(resgates).some(k => parseNum(resgates[k]) > 0)) && (
              <button
                onClick={limparTudo}
                className="text-xs text-gray-400 hover:text-red-500 transition-colors"
              >
                Limpar tudo
              </button>
            )}
          </div>

          {loading ? (
            <p className="text-sm text-gray-400 text-center py-8">Carregando...</p>
          ) : ativos.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">
              Nenhum ativo na carteira para resgatar.
            </p>
          ) : (
            <div className="space-y-3">
              {ativos.map(a => {
                const valorAtual = (a.currentValue && a.currentValue > 0) ? a.currentValue : a.totalInvested;
                const retorno = valorAtual - a.totalInvested;
                const temCotacao = a.currentValue !== undefined && a.currentValue > 0 && a.currentValue !== a.totalInvested;

                const selecionado = !!selecionados[a.id];

                return (
                  <div
                    key={a.id}
                    className={`flex items-center gap-4 p-4 border rounded-xl transition-colors ${
                      selecionado ? 'border-primary-200 bg-primary-50/30' : 'border-gray-100 hover:bg-gray-50'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selecionado}
                      onChange={() => toggleSelecionado(a.id)}
                      className="w-4 h-4 rounded border-gray-300 text-primary-500 focus:ring-primary-500 shrink-0"
                    />

                    <div className={`flex-1 min-w-0 ${selecionado ? '' : 'opacity-50'}`}>
                      <p className="font-bold text-sm">{a.ticker}</p>
                      <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                        <span className="text-xs text-gray-500">
                          Valor atual: <span className="font-medium text-gray-700">{fmt(valorAtual)}</span>
                        </span>
                        <span className="text-xs text-gray-400">
                          Custo: {fmt(a.totalInvested)}
                        </span>
                        {temCotacao && (
                          <span className={`text-xs flex items-center gap-0.5 font-medium ${retorno >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {retorno >= 0 ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                            {retorno >= 0 ? '+' : ''}{fmt(retorno)}
                          </span>
                        )}
                        {!temCotacao && (
                          <span className="text-xs text-amber-500">sem cotação — usando custo</span>
                        )}
                      </div>
                    </div>

                    <div className="w-44 shrink-0">
                      <Input
                        label=""
                        type="number"
                        value={resgates[a.id] ?? ''}
                        onChange={e => handleResgate(a.id, e.target.value, valorAtual)}
                        placeholder="0,00"
                        prefix="R$"
                        min="0"
                        max={String(valorAtual)}
                        step="any"
                        disabled={!selecionado}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        {/* Resumo */}
        {totalResgate > 0 && (
          <Card>
            <h2 className="text-base font-bold text-gray-900 mb-4">Resumo</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
              <ResultBox label="Total a resgatar" value={fmt(totalResgate)} color="blue" />
              {meta > 0 && (
                <>
                  <ResultBox label="Meta" value={fmt(meta)} color="purple" />
                  <ResultBox
                    label={saldo >= 0 ? 'Sobra' : 'Falta'}
                    value={fmt(Math.abs(saldo))}
                    color={saldo >= 0 ? 'green' : 'red'}
                  />
                </>
              )}
            </div>

            {meta > 0 && (
              <div className={`p-3 rounded-xl text-sm font-medium mb-4 ${saldo >= 0 ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                {saldo >= 0
                  ? `Resgate cobre a meta. Sobram ${fmt(saldo)}.`
                  : `Resgate insuficiente. Faltam ${fmt(Math.abs(saldo))} para atingir a meta de ${fmt(meta)}.`}
              </div>
            )}

            {confirmError && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2 mb-4">
                {confirmError}
              </p>
            )}

            <div className="flex flex-wrap gap-3">
              <Button
                onClick={handleConfirmar}
                loading={confirming}
                disabled={itensConfirmar.length === 0}
              >
                <CheckCircle2 size={16} />
                Confirmar resgate
              </Button>
              <Button variant="secondary" onClick={() => setExtratoOpen(true)}>
                <FileText size={16} />
                Ver extrato de resgate
              </Button>
            </div>
          </Card>
        )}
      </div>

      {/* Modal extrato */}
      <Modal open={extratoOpen} onClose={handleFecharExtrato} title="Extrato de Resgate" size="lg">
        <div className="space-y-4">
          {confirmado && (
            <div className="flex items-center gap-2 text-sm font-medium text-green-700 bg-green-50 border border-green-200 rounded-xl px-3 py-2">
              <CheckCircle2 size={16} />
              Resgate confirmado e registrado nas operações.
            </div>
          )}

          <p className="text-sm text-gray-400">
            Gerado em {new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
          </p>

          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b border-gray-100">
                <th className="pb-2 font-medium">Ativo</th>
                <th className="pb-2 font-medium">Valor Atual</th>
                <th className="pb-2 font-medium">Custo</th>
                <th className="pb-2 font-medium">A Resgatar</th>
                <th className="pb-2 font-medium">% do Ativo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {ativos
                .filter(a => parseNum(resgates[a.id] ?? '0') > 0)
                .map(a => {
                  const valorAtual = (a.currentValue && a.currentValue > 0) ? a.currentValue : a.totalInvested;
                  const valor = parseNum(resgates[a.id] ?? '0');
                  return (
                    <tr key={a.id} className="hover:bg-gray-50">
                      <td className="py-2 font-bold">{a.ticker}</td>
                      <td className="py-2">{fmt(valorAtual)}</td>
                      <td className="py-2 text-gray-500">{fmt(a.totalInvested)}</td>
                      <td className="py-2 font-medium text-green-700">{fmt(valor)}</td>
                      <td className="py-2 text-gray-600">{fmtPct((valor / valorAtual) * 100)}</td>
                    </tr>
                  );
                })}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-gray-200 font-bold">
                <td className="pt-3" colSpan={3}>Total</td>
                <td className="pt-3 text-green-700">{fmt(totalResgate)}</td>
                <td></td>
              </tr>
            </tfoot>
          </table>

          <p className="text-xs text-gray-400 mt-2">
            * O valor de resgate é baseado na cotação atual. Ativos sem cotação usam o custo de aquisição como referência.
          </p>
        </div>
      </Modal>
    </AppLayout>
  );
}

type Color = 'blue' | 'green' | 'purple' | 'red' | 'amber';
const colorMap: Record<Color, string> = {
  blue: 'bg-blue-50 text-blue-700',
  green: 'bg-green-50 text-green-700',
  purple: 'bg-purple-50 text-purple-700',
  red: 'bg-red-50 text-red-700',
  amber: 'bg-amber-50 text-amber-700',
};
function ResultBox({ label, value, color }: { label: string; value: string; color: Color }) {
  return (
    <div className={`rounded-xl px-4 py-3 ${colorMap[color]}`}>
      <p className="text-xs opacity-70 mb-0.5">{label}</p>
      <p className="font-bold text-sm">{value}</p>
    </div>
  );
}
