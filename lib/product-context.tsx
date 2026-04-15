'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase, PLATFORM_ID } from './supabase';

export interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  category: string | null;
  platform_id: string;
}

export interface Order {
  id: string;
  user_id: string | null;
  total_amount: number;
  status: 'pending' | 'paid' | 'cancelled';
  created_at: string;
  platform_id: string;
}

interface ProductContextType {
  products: Product[];
  orders: Order[];
  loading: boolean;
  error: string | null;
  fetchProducts: () => Promise<void>;
  fetchOrders: () => Promise<void>;
  createOrder: (orderData: Partial<Order>) => Promise<void>;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export function ProductProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error: supabaseError } = await supabase
        .from('products')
        .select('*')
        .eq('platform_id', PLATFORM_ID)
        .order('name');

      if (supabaseError) throw supabaseError;
      setProducts(data || []);
      console.log('Products fetched for platform:', PLATFORM_ID, data);
    } catch (err: any) {
      console.error('Error fetching products:', err.message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchOrders = useCallback(async () => {
    try {
      const { data, error: supabaseError } = await supabase
        .from('orders')
        .select('*')
        .eq('platform_id', PLATFORM_ID)
        .order('created_at', { ascending: false });

      if (supabaseError) throw supabaseError;
      setOrders(data || []);
    } catch (err: any) {
      console.error('Error fetching orders:', err.message);
    }
  }, []);

  const createOrder = async (orderData: Partial<Order>) => {
    try {
      const { error: supabaseError } = await supabase
        .from('orders')
        .insert([{ ...orderData, platform_id: PLATFORM_ID }]);

      if (supabaseError) throw supabaseError;
      await fetchOrders();
    } catch (err: any) {
      console.error('Error creating order:', err.message);
      throw err;
    }
  };

  useEffect(() => {
    if (PLATFORM_ID) {
      fetchProducts();
      fetchOrders();
    }
  }, [fetchProducts, fetchOrders]);

  return (
    <ProductContext.Provider value={{
      products,
      orders,
      loading,
      error,
      fetchProducts,
      fetchOrders,
      createOrder
    }}>
      {children}
    </ProductContext.Provider>
  );
}

export const useProducts = () => {
  const context = useContext(ProductContext);
  if (context === undefined) {
    throw new Error('useProducts must be used within a ProductProvider');
  }
  return context;
};
