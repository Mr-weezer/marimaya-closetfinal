
import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { TrendingUp, AlertCircle, DollarSign, Package } from 'lucide-react';
import { Product, Sale } from '../types';

interface DashboardProps {
  products: Product[];
  sales: Sale[];
}

// Updated high-contrast luxury palette to stand out against Slate 950
const COLORS = [
  '#FBBF24', // Amber/Gold
  '#F472B6', // Pink
  '#2DD4BF', // Teal
  '#A78BFA', // Violet
  '#FB7185', // Rose
  '#38BDF8', // Sky Blue
  '#F97316', // Orange
  '#4ADE80'  // Green
];

const Dashboard: React.FC<DashboardProps> = ({ products, sales }) => {
  const totalValue = products.reduce((acc, p) => acc + (p.price * p.stock), 0);
  const totalRevenue = sales.reduce((acc, s) => acc + s.totalPrice, 0);
  const lowStockItems = products.filter(p => p.stock <= p.minStockThreshold);
  const totalItems = products.reduce((acc, p) => acc + p.stock, 0);

  const chartData = products.slice(0, 8).map(p => ({
    name: p.name,
    stock: p.stock,
    isLow: p.stock <= p.minStockThreshold
  }));

  const stats = [
    { label: 'Inventory Value', value: `KES ${totalValue.toLocaleString()}`, icon: DollarSign, color: 'text-emerald-400' },
    { label: 'Total Revenue', value: `KES ${totalRevenue.toLocaleString()}`, icon: TrendingUp, color: 'text-violet-400' },
    { label: 'Stock Units', value: totalItems.toString(), icon: Package, color: 'text-blue-400' },
    { label: 'Low Stock Alerts', value: lowStockItems.length.toString(), icon: AlertCircle, color: 'text-rose-400' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header>
        <h2 className="text-3xl font-serif text-white mb-2">Boutique Insights</h2>
        <p className="text-slate-400">An overview of Marimaya's current holdings and sales performance.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="glass-card p-6 rounded-2xl">
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-xl bg-slate-900/50 ${stat.color}`}>
                <stat.icon size={24} />
              </div>
            </div>
            <div>
              <p className="text-slate-400 text-sm font-medium uppercase tracking-wider">{stat.label}</p>
              <h3 className="text-2xl font-bold text-white mt-1">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass-card p-6 rounded-3xl">
          <h3 className="text-xl font-serif text-white mb-6">Stock Distribution</h3>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={120}
                  paddingAngle={5}
                  dataKey="stock"
                  stroke="none"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1e293b', 
                    border: '1px solid #334155', 
                    borderRadius: '12px', 
                    color: '#f8fafc',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)' 
                  }}
                  itemStyle={{ color: '#f8fafc' }}
                />
                <Legend 
                  verticalAlign="bottom" 
                  height={36} 
                  formatter={(value) => <span className="text-slate-300 text-xs">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-card p-6 rounded-3xl">
          <h3 className="text-xl font-serif text-white mb-6">Critical Inventory</h3>
          <div className="space-y-4">
            {lowStockItems.length > 0 ? (
              lowStockItems.map(p => (
                <div key={p.id} className="flex items-center justify-between p-4 bg-slate-900/40 rounded-xl border border-rose-500/20">
                  <div>
                    <p className="text-white font-medium text-sm">{p.name}</p>
                    <p className="text-slate-400 text-xs">{p.size} • {p.color}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-rose-400 font-bold text-sm">{p.stock} left</p>
                    <p className="text-slate-500 text-xs">Min: {p.minStockThreshold}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <p className="text-slate-500 italic">Inventory is healthy.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
