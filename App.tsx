
import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import InventoryList from './components/InventoryList';
import SalesHistory from './components/SalesHistory';
import AIChatAssistant from './components/AIChatAssistant';
import AddItemModal from './components/AddItemModal';
import { View } from './types';
import { useInventory } from './hooks/useInventory';
import { Menu, AlertTriangle } from 'lucide-react';

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<View>(View.DASHBOARD);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { 
    products, 
    sales, 
    addProduct, 
    bulkAddProducts, 
    updateStock, 
    undoSale, 
    deleteProduct, 
    isLoaded, 
    isSyncing, 
    error 
  } = useInventory();

  if (!isLoaded) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-slate-950 text-white">
        <div className="w-16 h-16 border-4 border-violet-500/20 border-t-violet-500 rounded-full animate-spin mb-6 shadow-[0_0_20px_rgba(139,92,246,0.3)]"></div>
        <p className="font-serif italic text-xl animate-pulse tracking-wide">Syncing Atelier Archives...</p>
      </div>
    );
  }

  const renderView = () => {
    switch (activeView) {
      case View.DASHBOARD:
        return <Dashboard products={products} sales={sales} />;
      case View.INVENTORY:
        return <InventoryList products={products} onUpdateStock={updateStock} onDelete={deleteProduct} />;
      case View.SALES:
        return <SalesHistory sales={sales} onUndoSale={undoSale} />;
      case View.CHAT:
        return <AIChatAssistant inventory={products} />;
      default:
        return <Dashboard products={products} sales={sales} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-violet-500/30">
      {/* Mobile Top Bar */}
      <header className="lg:hidden flex items-center justify-between p-4 bg-slate-950/80 backdrop-blur-md border-b border-slate-800 sticky top-0 z-40">
        <button 
          onClick={() => setIsSidebarOpen(true)}
          className="p-2 text-slate-400 hover:text-white transition-colors"
        >
          <Menu size={24} />
        </button>
        <h1 className="font-serif text-lg font-bold tracking-tight text-white italic">
          Marimaya<span className="text-violet-500 ml-1">Closet</span>
        </h1>
        <div className="w-10"></div>
      </header>

      {/* Global Error Toast */}
      {error && (
        <div className="fixed top-6 right-6 z-[60] flex items-center space-x-3 bg-rose-500 text-white px-6 py-4 rounded-2xl shadow-2xl animate-in slide-in-from-top-4">
          <AlertTriangle size={20} />
          <span className="font-medium">{error}</span>
        </div>
      )}

      {/* Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <Sidebar 
        activeView={activeView} 
        onViewChange={setActiveView} 
        onAddClick={() => setIsModalOpen(true)} 
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        isSyncing={isSyncing}
      />

      <main className="lg:pl-64 min-h-screen transition-all">
        <div className="max-w-7xl mx-auto p-4 md:p-8 lg:p-12">
          {renderView()}
        </div>
      </main>

      {isModalOpen && (
        <AddItemModal 
          onClose={() => setIsModalOpen(false)}
          onAdd={addProduct}
          onBulkAdd={bulkAddProducts}
        />
      )}
      
      {/* Decorative gradients */}
      <div className="fixed top-0 right-0 w-[500px] h-[500px] bg-violet-600/5 blur-[120px] rounded-full -z-10 pointer-events-none"></div>
      <div className="fixed bottom-0 left-64 w-[300px] h-[300px] bg-blue-600/5 blur-[100px] rounded-full -z-10 pointer-events-none"></div>
    </div>
  );
};

export default App;
