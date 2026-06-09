'use client';

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { useAuth } from './auth-context';
import { api } from './api';

export interface CartItem {
  productId: string;
  name: string;
  sku: string;
  price: number;
  quantity: number;
  image: string | null;
  maxStock: number;
}

export interface Cart {
  userId: string;
  items: CartItem[];
  subtotal: number;
  totalItems: number;
}

interface CartContextType {
  cart: Cart | null;
  isLoading: boolean;
  error: string | null;
  addItem: (productId: string, quantity: number) => Promise<void>;
  updateItem: (productId: string, quantity: number) => Promise<void>;
  removeItem: (productId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [cart, setCart] = useState<Cart | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCart = useCallback(async () => {
    if (!isAuthenticated) {
      setCart(null);
      setError(null);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const data = await api.get<Cart>('/cart');
      setCart(data);
    } catch (err) {
      if (err instanceof Error && err.message.includes('401')) {
        setCart(null);
      } else {
        setError(err instanceof Error ? err.message : 'Error al cargar el carrito');
      }
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const addItem = useCallback(async (productId: string, quantity: number) => {
    setError(null);
    const updatedCart = await api.post<Cart>('/cart/add', { productId, quantity });
    setCart(updatedCart);
  }, []);

  const updateItem = useCallback(async (productId: string, quantity: number) => {
    setError(null);
    const updatedCart = await api.patch<Cart>('/cart/item', { productId, quantity });
    setCart(updatedCart);
  }, []);

  const removeItem = useCallback(async (productId: string) => {
    setError(null);
    const updatedCart = await api.delete<Cart>(`/cart/item/${productId}`);
    setCart(updatedCart);
  }, []);

  const clearCart = useCallback(async () => {
    setError(null);
    const updatedCart = await api.delete<Cart>('/cart');
    setCart(updatedCart);
  }, []);

  return (
    <CartContext.Provider value={{
      cart,
      isLoading,
      error,
      addItem,
      updateItem,
      removeItem,
      clearCart,
      refreshCart: fetchCart,
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
