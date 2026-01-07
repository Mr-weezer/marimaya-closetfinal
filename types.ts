
export interface Product {
  id: string;
  name: string;
  category: string;
  size: string;
  color: string;
  price: number; // Selling Price
  buyingPrice: number; // Cost Price
  stock: number;
  minStockThreshold: number;
  imageUrl?: string;
  lastUpdated: string;
}

export interface Sale {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number; // Selling price at time of sale
  buyingPrice: number; // Cost price at time of sale
  totalPrice: number;
  timestamp: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export enum View {
  DASHBOARD = 'dashboard',
  INVENTORY = 'inventory',
  SALES = 'sales',
  CHAT = 'chat'
}
