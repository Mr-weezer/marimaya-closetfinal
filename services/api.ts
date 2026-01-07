
import { supabase } from '../lib/supabase';
import { Product, Sale } from '../types';

class BoutiqueAPI {
  async fetchCollection(): Promise<Product[]> {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('lastUpdated', { ascending: false });
    
    if (error) throw error;
    return data || [];
  }

  async fetchLedger(): Promise<Sale[]> {
    const { data, error } = await supabase
      .from('sales')
      .select('*')
      .order('timestamp', { ascending: false });
    
    if (error) throw error;
    return data || [];
  }

  async addProduct(product: Product): Promise<void> {
    const { error } = await supabase
      .from('products')
      .insert(product);
    
    if (error) throw error;
  }

  async bulkInsertProducts(products: Product[]): Promise<void> {
    const { error } = await supabase
      .from('products')
      .insert(products);
    
    if (error) throw error;
  }

  async deleteProduct(productId: string): Promise<void> {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', productId);
    
    if (error) throw error;
  }

  async updateProduct(product: Product): Promise<void> {
    const { error } = await supabase
      .from('products')
      .update(product)
      .eq('id', product.id);
    
    if (error) throw error;
  }

  /**
   * Complex operation: Decrement stock and log sale
   */
  async processSale(productId: string, sale: Sale, newStock: number): Promise<void> {
    // Ideally use a RPC function in Supabase for atomicity
    // But for this implementation, we'll chain them
    const { error: stockError } = await supabase
      .from('products')
      .update({ stock: newStock, lastUpdated: new Date().toISOString() })
      .eq('id', productId);
    
    if (stockError) throw stockError;

    const { error: saleError } = await supabase
      .from('sales')
      .insert(sale);
    
    if (saleError) throw saleError;
  }

  async undoSaleEntry(saleId: string, productId: string, newQty: number, addedStock: number): Promise<void> {
    // 1. Update product stock
    const { data: pData } = await supabase.from('products').select('stock').eq('id', productId).single();
    const currentStock = pData?.stock || 0;

    await supabase.from('products').update({ stock: currentStock + addedStock }).eq('id', productId);

    // 2. Update or delete sale record
    if (newQty <= 0) {
      await supabase.from('sales').delete().eq('id', saleId);
    } else {
      await supabase.from('sales').update({ quantity: newQty }).eq('id', saleId);
    }
  }
}

export const api = new BoutiqueAPI();
