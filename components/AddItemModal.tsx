
import React, { useState } from 'react';
import { X, Sparkles, Plus, Loader2, CheckCircle, Trash2 } from 'lucide-react';
import { Product } from '../types';
import { parseBulkImport } from '../services/geminiService';

interface AddItemModalProps {
  onClose: () => void;
  onAdd: (product: Omit<Product, 'id' | 'lastUpdated'>) => void;
  onBulkAdd: (products: Omit<Product, 'id' | 'lastUpdated'>[]) => void;
}

interface Variant {
  size: string;
  color: string;
  price: number; // Selling
  buyingPrice: number; // Cost
  stock: number;
}

const AddItemModal: React.FC<AddItemModalProps> = ({ onClose, onAdd, onBulkAdd }) => {
  const [mode, setMode] = useState<'manual' | 'ai'>('manual');
  const [isLoading, setIsLoading] = useState(false);
  const [aiInput, setAiInput] = useState('');
  
  // Shared fields
  const [productName, setProductName] = useState('');
  const [category, setCategory] = useState('Tops');
  
  // Variants list
  const [variants, setVariants] = useState<Variant[]>([
    { size: 'M', color: '', price: 0, buyingPrice: 0, stock: 0 }
  ]);

  const handleAddVariant = () => {
    setVariants([...variants, { size: 'M', color: '', price: 0, buyingPrice: 0, stock: 0 }]);
  };

  const handleRemoveVariant = (index: number) => {
    if (variants.length > 1) {
      setVariants(variants.filter((_, i) => i !== index));
    }
  };

  const updateVariant = (index: number, field: keyof Variant, value: any) => {
    const newVariants = [...variants];
    newVariants[index] = { ...newVariants[index], [field]: value };
    setVariants(newVariants);
  };

  const handleSubmitManual = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newProducts: Omit<Product, 'id' | 'lastUpdated'>[] = variants.map(v => ({
      name: productName,
      category,
      size: v.size,
      color: v.color,
      price: v.price,
      buyingPrice: v.buyingPrice,
      stock: v.stock,
      minStockThreshold: 3
    }));

    onBulkAdd(newProducts);
    onClose();
  };

  const handleAIImport = async () => {
    if (!aiInput.trim()) return;
    setIsLoading(true);
    try {
      const parsed = await parseBulkImport(aiInput);
      if (parsed.length > 0) {
        onBulkAdd(parsed);
        onClose();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="glass-card w-full max-w-5xl rounded-3xl overflow-hidden shadow-2xl border border-slate-700/50 max-h-[90vh] flex flex-col">
        <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
          <h3 className="text-xl font-serif text-white">Record New Inventory</h3>
          <button onClick={onClose} className="p-2 text-slate-500 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="flex border-b border-slate-800">
          <button 
            onClick={() => setMode('manual')}
            className={`flex-1 py-4 text-sm font-medium transition-colors border-b-2 ${mode === 'manual' ? 'border-violet-500 text-white' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
          >
            Manual Entry
          </button>
          <button 
            onClick={() => setMode('ai')}
            className={`flex-1 py-4 text-sm font-medium transition-colors border-b-2 flex items-center justify-center space-x-2 ${mode === 'ai' ? 'border-violet-500 text-white' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
          >
            <Sparkles size={16} />
            <span>AI Import</span>
          </button>
        </div>

        <div className="p-4 md:p-8 overflow-y-auto flex-1">
          {mode === 'manual' ? (
            <form onSubmit={handleSubmitManual} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-6 border-b border-slate-800/50">
                <div>
                  <label className="block text-slate-400 text-xs uppercase tracking-wider mb-2 font-medium">Garment Title</label>
                  <input
                    required
                    type="text"
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    placeholder="e.g. Silk Palazzo Trousers"
                    className="w-full bg-slate-800/50 border border-slate-700 text-white px-4 py-3 rounded-xl focus:outline-none focus:ring-1 focus:ring-violet-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 text-xs uppercase tracking-wider mb-2 font-medium">Category</label>
                  <select 
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-slate-800/50 border border-slate-700 text-white px-4 py-3 rounded-xl focus:outline-none focus:ring-1 focus:ring-violet-500"
                  >
                    <option>Tops</option><option>Bottoms</option><option>Dresses</option><option>Outerwear</option><option>Accessories</option>
                  </select>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-serif text-slate-300 italic tracking-wide">Variants</h4>
                  <button 
                    type="button"
                    onClick={handleAddVariant}
                    className="text-xs font-medium text-violet-400 hover:text-violet-300 flex items-center space-x-1"
                  >
                    <Plus size={14} />
                    <span>Add Variant</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {variants.map((v, index) => (
                    <div key={index} className="grid grid-cols-12 gap-2 p-3 bg-slate-900/30 rounded-2xl border border-slate-800/50 relative group animate-in slide-in-from-left-2 duration-300">
                      <div className="col-span-12 sm:col-span-3">
                        <label className="block text-slate-500 text-[10px] uppercase mb-1">Color</label>
                        <input
                          required
                          type="text"
                          value={v.color}
                          onChange={(e) => updateVariant(index, 'color', e.target.value)}
                          placeholder="Ebony"
                          className="w-full bg-slate-800/30 border border-slate-700/50 text-white px-2 py-2 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-violet-500"
                        />
                      </div>
                      <div className="col-span-3 sm:col-span-2">
                        <label className="block text-slate-500 text-[10px] uppercase mb-1">Size</label>
                        <select 
                          value={v.size}
                          onChange={(e) => updateVariant(index, 'size', e.target.value)}
                          className="w-full bg-slate-800/30 border border-slate-700/50 text-white px-1 py-2 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-violet-500"
                        >
                          <option>XS</option><option>S</option><option>M</option><option>L</option><option>XL</option><option>OS</option>
                        </select>
                      </div>
                      <div className="col-span-3 sm:col-span-2">
                        <label className="block text-slate-500 text-[10px] uppercase mb-1">Cost (Buy)</label>
                        <input
                          required
                          type="number"
                          value={v.buyingPrice || ''}
                          onChange={(e) => updateVariant(index, 'buyingPrice', Number(e.target.value))}
                          placeholder="Cost"
                          className="w-full bg-slate-800/30 border border-slate-700/50 text-white px-2 py-2 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-violet-500"
                        />
                      </div>
                      <div className="col-span-3 sm:col-span-2">
                        <label className="block text-slate-500 text-[10px] uppercase mb-1">Price (Sell)</label>
                        <input
                          required
                          type="number"
                          value={v.price || ''}
                          onChange={(e) => updateVariant(index, 'price', Number(e.target.value))}
                          placeholder="Sell"
                          className="w-full bg-slate-800/30 border border-slate-700/50 text-white px-2 py-2 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-violet-500"
                        />
                      </div>
                      <div className="col-span-2 sm:col-span-2">
                        <label className="block text-slate-500 text-[10px] uppercase mb-1">Stock</label>
                        <input
                          required
                          type="number"
                          value={v.stock || ''}
                          onChange={(e) => updateVariant(index, 'stock', Number(e.target.value))}
                          placeholder="Qty"
                          className="w-full bg-slate-800/30 border border-slate-700/50 text-white px-2 py-2 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-violet-500"
                        />
                      </div>
                      <div className="col-span-1 flex items-end justify-center pb-2">
                        <button 
                          type="button"
                          onClick={() => handleRemoveVariant(index)}
                          disabled={variants.length === 1}
                          className="text-slate-600 hover:text-rose-500 disabled:opacity-0 transition-all"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <button 
                type="submit"
                className="w-full py-4 bg-violet-500 hover:bg-violet-600 text-white rounded-xl font-bold transition-all shadow-lg shadow-violet-500/20 flex items-center justify-center space-x-2"
              >
                <CheckCircle size={20} />
                <span>Add All to Collection</span>
              </button>
            </form>
          ) : (
            <div className="space-y-6">
              <div className="bg-slate-900/50 border border-violet-500/20 p-6 rounded-2xl">
                <div className="flex items-start space-x-4">
                  <div className="p-3 bg-violet-500/10 rounded-xl text-violet-400">
                    <Sparkles size={24} />
                  </div>
                  <div>
                    <h4 className="text-white font-medium mb-1">Intelligent Shipments</h4>
                    <p className="text-slate-400 text-sm leading-relaxed">
                      Mention both costs and selling prices in your description. AI will differentiate between the two automatically.
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 text-xs uppercase tracking-wider mb-3 font-medium">Shipment Description</label>
                <textarea
                  rows={6}
                  value={aiInput}
                  onChange={(e) => setAiInput(e.target.value)}
                  placeholder="e.g. Received 10 Silk Palazzo Trousers. Bought at 4500 each, selling for 8500..."
                  className="w-full bg-slate-800/50 border border-slate-700 text-white p-6 rounded-2xl focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 transition-all placeholder:text-slate-600 text-sm leading-relaxed"
                />
              </div>

              <button 
                onClick={handleAIImport}
                disabled={!aiInput.trim() || isLoading}
                className="w-full py-4 bg-violet-500 hover:bg-violet-600 disabled:bg-slate-800 text-white rounded-xl font-bold transition-all shadow-lg shadow-violet-500/20 flex items-center justify-center space-x-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    <span>Analyzing Financials...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle size={20} />
                    <span>Process Shipments</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddItemModal;
