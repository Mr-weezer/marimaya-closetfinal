
import React, { useState } from 'react';
import { Sale } from '../types';
import { ShoppingBag, ArrowDownRight, CreditCard, Receipt, TrendingUp, Users, Undo2, Check, X } from 'lucide-react';

interface SalesHistoryProps {
  sales: Sale[];
  onUndoSale: (saleId: string, quantityToUndo: number) => void;
}

const SalesHistory: React.FC<SalesHistoryProps> = ({ sales, onUndoSale }) => {
  const [undoState, setUndoState] = useState<{ id: string, quantity: number } | null>(null);

  const totalRevenue = sales.reduce((acc, s) => acc + s.totalPrice, 0);
  const totalCost = sales.reduce((acc, s) => acc + (s.buyingPrice * s.quantity), 0);
  const totalProfit = totalRevenue - totalCost;
  const totalTransactions = sales.length;
  const totalUnitsSold = sales.reduce((acc, s) => acc + s.quantity, 0);

  const metrics = [
    { label: 'Total Revenue', value: `KES ${totalRevenue.toLocaleString()}`, icon: CreditCard, color: 'text-emerald-400' },
    { label: 'Gross Profit', value: `KES ${totalProfit.toLocaleString()}`, icon: TrendingUp, color: 'text-violet-400' },
    { label: 'Orders', value: totalTransactions.toString(), icon: Receipt, color: 'text-blue-400' },
    { label: 'Units Sold', value: totalUnitsSold.toString(), icon: Users, color: 'text-orange-400' },
  ];

  const handleCommitUndo = (sale: Sale) => {
    if (!undoState || undoState.quantity <= 0) return;
    onUndoSale(sale.id, undoState.quantity);
    setUndoState(null);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header>
        <h2 className="text-3xl font-serif text-white mb-2">Sales Ledger</h2>
        <p className="text-slate-400">A chronicle of acquisitions and performance from the Marimaya Collection.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, i) => (
          <div key={i} className="glass-card p-6 rounded-2xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-400 text-xs font-medium uppercase tracking-wider">{metric.label}</span>
              <div className={`p-2 rounded-lg bg-slate-900/50 ${metric.color}`}>
                <metric.icon size={18} />
              </div>
            </div>
            <h3 className="text-xl font-bold text-white">{metric.value}</h3>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4">
        {sales.length > 0 ? (
          sales.map((sale) => (
            <div key={sale.id} className="glass-card p-4 md:p-6 rounded-2xl flex flex-col md:flex-row items-center justify-between border-l-4 border-l-violet-500 group relative gap-4">
              <div className="flex items-center space-x-4 md:space-x-6 w-full">
                <div className="w-12 h-12 md:w-14 md:h-14 bg-slate-900 rounded-2xl flex items-center justify-center text-violet-500 border border-slate-700 shadow-xl shrink-0">
                  <ShoppingBag size={24} />
                </div>
                <div className="min-w-0">
                  <h4 className="text-white font-medium text-base md:text-lg truncate">{sale.productName}</h4>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400 mt-1">
                    <span className="whitespace-nowrap">{new Date(sale.timestamp).toLocaleDateString()}</span>
                    <span>•</span>
                    <span className="text-violet-400 font-medium">Qty: {sale.quantity}</span>
                    <span>•</span>
                    <span className="text-emerald-500/80">Profit: KES {(sale.unitPrice - sale.buyingPrice) * sale.quantity}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between md:justify-end w-full md:w-auto space-x-6">
                <div className="text-right">
                  <div className="flex items-center justify-end text-emerald-400 font-bold text-lg md:text-xl whitespace-nowrap">
                    <ArrowDownRight size={16} className="mr-1" />
                    KES {sale.totalPrice.toLocaleString()}
                  </div>
                  <p className="text-slate-500 text-[10px]">Price: {sale.unitPrice.toLocaleString()}</p>
                </div>

                {undoState?.id === sale.id ? (
                  <div className="flex items-center bg-slate-900 rounded-xl border border-rose-500/50 p-1 animate-in slide-in-from-right-2 duration-200">
                    <input 
                      type="number"
                      autoFocus
                      min="1"
                      max={sale.quantity}
                      value={undoState.quantity || ''}
                      onChange={(e) => setUndoState({ ...undoState, quantity: parseInt(e.target.value) || 0 })}
                      className="w-10 bg-transparent text-white text-center focus:outline-none text-sm font-bold"
                      placeholder="Amt"
                      onKeyDown={(e) => e.key === 'Enter' && handleCommitUndo(sale)}
                    />
                    <div className="flex space-x-1">
                      <button 
                        onClick={() => handleCommitUndo(sale)}
                        className="p-1.5 bg-rose-500 hover:bg-rose-600 text-white rounded-lg transition-colors"
                        title="Confirm Partial Undo"
                      >
                        <Check size={14} />
                      </button>
                      <button 
                        onClick={() => setUndoState(null)}
                        className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded-lg transition-colors"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  </div>
                ) : (
                  <button 
                    onClick={() => setUndoState({ id: sale.id, quantity: sale.quantity })}
                    title="Undo Transaction"
                    className="p-3 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 border border-slate-700 transition-all md:opacity-0 group-hover:opacity-100 focus:opacity-100 shrink-0"
                  >
                    <Undo2 size={18} />
                  </button>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="glass-card rounded-3xl p-20 text-center">
            <div className="mx-auto w-16 h-16 bg-slate-900 rounded-full flex items-center justify-center text-slate-700 mb-6 border border-slate-800">
              <ShoppingBag size={24} />
            </div>
            <p className="text-slate-500 italic font-serif text-lg">No sales have been recorded this season.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SalesHistory;
