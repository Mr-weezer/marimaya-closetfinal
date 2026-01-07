
import React from 'react';
import { LayoutDashboard, ShoppingBag, History, MessageSquare, PlusCircle, X, CloudCheck, CloudUpload } from 'lucide-react';
import { View } from '../types';

interface SidebarProps {
  activeView: View;
  onViewChange: (view: View) => void;
  onAddClick: () => void;
  isOpen: boolean;
  onClose: () => void;
  isSyncing?: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ activeView, onViewChange, onAddClick, isOpen, onClose, isSyncing = false }) => {
  const navItems = [
    { id: View.DASHBOARD, label: 'Boutique Stats', icon: LayoutDashboard },
    { id: View.INVENTORY, label: 'Collection', icon: ShoppingBag },
    { id: View.SALES, label: 'Sales Ledger', icon: History },
    { id: View.CHAT, label: 'AI Assistant', icon: MessageSquare },
  ];

  const handleNavClick = (view: View) => {
    onViewChange(view);
    onClose();
  };

  return (
    <aside className={`
      w-64 bg-slate-950/95 border-r border-slate-800 flex flex-col h-screen fixed top-0 z-50 
      transition-transform duration-300 ease-in-out lg:translate-x-0
      ${isOpen ? 'translate-x-0' : '-translate-x-full'}
    `}>
      <div className="p-8 flex items-center justify-between">
        <h1 className="font-serif text-2xl font-bold tracking-tight text-white italic">
          Marimaya<span className="block text-violet-500 not-italic text-sm tracking-[0.2em] uppercase font-sans mt-1">Closet</span>
        </h1>
        <button 
          onClick={onClose}
          className="lg:hidden p-2 text-slate-400 hover:text-white transition-colors"
        >
          <X size={20} />
        </button>
      </div>

      <nav className="flex-1 px-4 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                isActive 
                  ? 'bg-violet-500/10 text-violet-500 border border-violet-500/20' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <Icon size={20} />
              <span className="font-medium text-sm">{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-800 space-y-4">
        <div className="flex items-center justify-between px-2 text-[10px] uppercase tracking-widest font-bold">
          <span className="text-slate-500">Records Status</span>
          {isSyncing ? (
            <span className="flex items-center space-x-1 text-violet-400 animate-pulse">
              <CloudUpload size={12} />
              <span>Syncing</span>
            </span>
          ) : (
            <span className="flex items-center space-x-1 text-emerald-500">
              <CloudCheck size={12} />
              <span>Secured</span>
            </span>
          )}
        </div>
        
        <button
          onClick={() => {
            onAddClick();
            onClose();
          }}
          className="w-full flex items-center justify-center space-x-2 bg-violet-500 hover:bg-violet-600 text-white py-3 rounded-xl font-medium transition-colors shadow-lg shadow-violet-500/20"
        >
          <PlusCircle size={18} />
          <span>New Arrival</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
