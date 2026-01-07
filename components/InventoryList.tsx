
import React, { useState } from 'react';
import { Search, Trash2, Edit3, ShoppingCart, RefreshCw, Check, X as CloseIcon } from 'lucide-react';
import { Product } from '../types';

interface InventoryListProps {
  products: Product[];
  onUpdateStock: (id: string, delta: number) => void;
  onDelete: (id: string) => void;
}

type AdjustState = {
  id: string;
  mode: 'sold' | 'restock';
  quantity: number;
} | null;

const InventoryList: React.FC<InventoryListProps> = ({ products, onUpdateStock, onDelete }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [adjustState, setAdjustState] = useState<AdjustState>(null);

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.color.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCommitAdjustment = () => {
    if (!adjustState || adjustState.quantity <= 0) return;
    const delta = adjustState.mode === 'sold' ? -adjustState.quantity : adjustState.quantity;
    onUpdateStock(adjustState.id, delta);
    setAdjustState(null);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-serif text-white mb-2">The Collection</h2>
          <p className="text-slate-400">Manage and refine the inventory of the Marimaya Boutique.</p>
        </div>
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-violet-500 transition-colors" size={18} />
          <input
            type="text"
            placeholder="Search silhouettes, colors..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full md:w-80 bg-slate-800/50 border border-slate-700/50 text-white pl-12 pr-4 py-3 rounded-2xl focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 transition-all"
          />
        </div>
      </header>

      <div className="glass-card rounded-3xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-700/50 bg-slate-800/30">
                <th className="px-6 py-5 font-serif text-slate-400 font-medium">Product Detail</th>
                <th className="px-6 py-5 font-serif text-slate-400 font-medium">Variant</th>
                <th className="px-4 py-5 font-serif text-slate-400 font-medium text-center">In Stock</th>
                <th className="px-6 py-5 font-serif text-slate-400 font-medium text-center">Update Quantity</th>
                <th className="px-6 py-5 font-serif text-slate-400 font-medium text-right whitespace-nowrap">Price</th>
                <th className="px-6 py-5 font-serif text-slate-400 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {filteredProducts.map((p) => (
                <tr key={p.id} className="hover:bg-slate-700/20 transition-colors group">
                  <td className="px-6 py-5">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 rounded-lg bg-slate-900 flex items-center justify-center border border-slate-700 font-serif text-violet-500 font-bold shrink-0">
                        {p.name.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <p className="text-white font-medium group-hover:text-violet-400 transition-colors truncate">{p.name}</p>
                        <p className="text-slate-500 text-[10px] uppercase tracking-widest">{p.category}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="text-sm">
                      <p className="text-slate-300">{p.color}</p>
                      <p className="text-slate-500 text-xs">Size: {p.size}</p>
                    </div>
                  </td>
                  <td className="px-4 py-5 text-center">
                    <span className={`text-base font-bold ${p.stock <= p.minStockThreshold ? 'text-rose-400' : 'text-white'}`}>
                      {p.stock}
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center justify-center">
                      {adjustState?.id === p.id ? (
                        <div className="flex items-center bg-slate-900/80 rounded-xl border border-violet-500/50 p-1 animate-in zoom-in-95 duration-200">
                          <input 
                            type="number"
                            autoFocus
                            min="1"
                            max={adjustState.mode === 'sold' ? p.stock : 999}
                            value={adjustState.quantity || ''}
                            onChange={(e) => setAdjustState({ ...adjustState, quantity: parseInt(e.target.value) || 0 })}
                            className="w-12 bg-transparent text-white text-center focus:outline-none text-sm font-bold"
                            placeholder="Qty"
                            onKeyDown={(e) => e.key === 'Enter' && handleCommitAdjustment()}
                          />
                          <div className="flex space-x-1">
                            <button 
                              onClick={handleCommitAdjustment}
                              className={`p-1.5 rounded-lg transition-colors ${adjustState.mode === 'sold' ? 'bg-rose-500 hover:bg-rose-600' : 'bg-emerald-500 hover:bg-emerald-600'} text-white`}
                            >
                              <Check size={14} />
                            </button>
                            <button 
                              onClick={() => setAdjustState(null)}
                              className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded-lg transition-colors"
                            >
                              <CloseIcon size={14} />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <button 
                            onClick={() => setAdjustState({ id: p.id, mode: 'sold', quantity: 1 })}
                            disabled={p.stock === 0}
                            className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-rose-500/10 text-rose-500 border border-rose-500/20 hover:bg-rose-500 hover:text-white transition-all text-[10px] font-bold disabled:opacity-30 uppercase"
                          >
                            <ShoppingCart size={12} />
                            <span>Sold</span>
                          </button>
                          <button 
                            onClick={() => setAdjustState({ id: p.id, mode: 'restock', quantity: 1 })}
                            className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 hover:bg-emerald-500 hover:text-white transition-all text-[10px] font-bold uppercase"
                          >
                            <RefreshCw size={12} />
                            <span>Restock</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-5 text-right font-medium text-white whitespace-nowrap">
                    KES {p.price.toLocaleString()}
                  </td>
                  <td className="px-6 py-5 text-right">
                    <div className="flex items-center justify-end space-x-1">
                      <button className="p-1.5 text-slate-500 hover:text-white hover:bg-slate-800 rounded-lg transition-all">
                        <Edit3 size={16} />
                      </button>
                      <button 
                        onClick={() => onDelete(p.id)}
                        className="p-1.5 text-slate-500 hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-all"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredProducts.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-20 text-center">
                    <p className="text-slate-500 font-serif italic text-lg">No garments match your inquiry.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default InventoryList;
