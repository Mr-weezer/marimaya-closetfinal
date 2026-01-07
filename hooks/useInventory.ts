
import { useState, useEffect, useCallback } from 'react';
import { Product, Sale } from '../types';
import { api } from '../services/api';

export const useInventory = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [p, s] = await Promise.all([api.fetchCollection(), api.fetchLedger()]);
        setProducts(p);
        setSales(s);
        setIsLoaded(true);
      } catch (err) {
        setError('Connection to Marimaya database failed.');
        console.error(err);
      }
    };
    loadData();
  }, []);

  const addProduct = useCallback(async (newProduct: Omit<Product, 'id' | 'lastUpdated'>) => {
    const p: Product = { ...newProduct, id: crypto.randomUUID(), lastUpdated: new Date().toISOString() };
    setProducts(prev => [...prev, p]);
    setIsSyncing(true);
    try {
      await api.addProduct(p);
    } catch (err) {
      setError('Sync failed. Refresh to reconcile.');
    } finally {
      setIsSyncing(false);
    }
  }, []);

  const bulkAddProducts = useCallback(async (newProducts: Omit<Product, 'id' | 'lastUpdated'>[]) => {
    const pWithMeta = newProducts.map(p => ({
      ...p,
      id: crypto.randomUUID(),
      lastUpdated: new Date().toISOString()
    }));
    setProducts(prev => [...prev, ...pWithMeta]);
    setIsSyncing(true);
    try {
      await api.bulkInsertProducts(pWithMeta);
    } catch (err) {
      setError('Bulk sync failed.');
    } finally {
      setIsSyncing(false);
    }
  }, []);

  const updateStock = useCallback(async (productId: string, delta: number) => {
    const target = products.find(p => p.id === productId);
    if (!target) return;

    const newStock = Math.max(0, target.stock + delta);
    setIsSyncing(true);

    try {
      if (delta < 0) {
        // Handle Sale
        const qty = Math.abs(delta);
        const sale: Sale = {
          id: crypto.randomUUID(),
          productId: target.id,
          productName: target.name,
          quantity: qty,
          unitPrice: target.price,
          buyingPrice: target.buyingPrice,
          totalPrice: qty * target.price,
          timestamp: new Date().toISOString()
        };
        await api.processSale(productId, sale, newStock);
        setSales(prev => [sale, ...prev]);
      } else {
        // Handle Restock
        await api.updateProduct({ ...target, stock: newStock, lastUpdated: new Date().toISOString() });
      }
      
      setProducts(prev => prev.map(p => p.id === productId ? { ...p, stock: newStock } : p));
    } catch (err) {
      setError('Update failed to sync.');
    } finally {
      setIsSyncing(false);
    }
  }, [products]);

  const undoSale = useCallback(async (saleId: string, quantityToUndo: number) => {
    const sale = sales.find(s => s.id === saleId);
    if (!sale) return;

    setIsSyncing(true);
    try {
      const newQty = sale.quantity - quantityToUndo;
      await api.undoSaleEntry(saleId, sale.productId, newQty, quantityToUndo);
      
      // Re-fetch to ensure accuracy after complex undo
      const [p, s] = await Promise.all([api.fetchCollection(), api.fetchLedger()]);
      setProducts(p);
      setSales(s);
    } catch (err) {
      setError('Undo failed.');
    } finally {
      setIsSyncing(false);
    }
  }, [sales]);

  const deleteProduct = useCallback(async (productId: string) => {
    setProducts(prev => prev.filter(p => p.id !== productId));
    setIsSyncing(true);
    try {
      await api.deleteProduct(productId);
    } catch (err) {
      setError('Deletion failed to sync.');
    } finally {
      setIsSyncing(false);
    }
  }, []);

  return { products, sales, addProduct, bulkAddProducts, updateStock, undoSale, deleteProduct, isLoaded, isSyncing, error };
};
