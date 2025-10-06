import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Product } from '@/types';
import { toast } from 'sonner';
import axios from 'axios';

export interface CartItem {
  cartItemId: string;   // Cart entry ID (from MongoDB)
  product: Product;     // Populated product info
  quantity: number;     // Quantity
  price: number;        // Price snapshot at time of adding to cart
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (product: Product) => Promise<void>;
  removeFromCart: (cartItemId: string) => Promise<void>;
  updateQuantity: (cartItemId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  getCartTotal: () => number;
  getCartItemCount: () => number;
  isLoading: boolean;
  fetchCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

interface CartProviderProps {
  children: ReactNode;
}

const API_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch cart from backend
  const fetchCart = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/cart');

      if (response.data.success && response.data.cart.items) {
        const transformedItems: CartItem[] = response.data.cart.items.map((item: any) => ({
          cartItemId: item._id,
          product: item.product,
          quantity: item.quantity,
          price: item.price,
        }));
        setCartItems(transformedItems);
      }
    } catch (error: any) {
      if (error.response?.status === 401) {
        setCartItems([]);
      } else {
        console.error('Error fetching cart:', error);
        toast.error('Failed to load cart');
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const addToCart = async (product: Product) => {
    try {
      const response = await api.post('/cart/add', {
        productId: product._id,
        quantity: 1,
      });

      if (response.data.success) {
        const transformedItems: CartItem[] = response.data.cart.items.map((item: any) => ({
          cartItemId: item._id,
          product: item.product,
          quantity: item.quantity,
          price: item.price,
        }));
        setCartItems(transformedItems);

        const exists = cartItems.find(item => item.product._id === product._id);
        toast.success(exists ? 'Item quantity updated in cart' : 'Item added to cart');
      }
    } catch (error: any) {
      console.error('Error adding to cart:', error);
      if (error.response?.status === 401) {
        toast.error('Please log in to add items to cart');
      } else {
        toast.error('Failed to add item to cart');
      }
    }
  };

  const removeFromCart = async (cartItemId: string) => {
    try {
      const response = await api.delete(`/cart/remove/${cartItemId}`);

      if (response.data.success) {
        const transformedItems: CartItem[] = response.data.cart.items.map((item: any) => ({
          cartItemId: item._id,
          product: item.product,
          quantity: item.quantity,
          price: item.price,
        }));
        setCartItems(transformedItems);
        toast.success('Item removed from cart');
      }
    } catch (error: any) {
      console.error('Error removing from cart:', error);
      toast.error('Failed to remove item from cart');
    }
  };

  const updateQuantity = async (cartItemId: string, quantity: number) => {
    if (quantity === 0) {
      await removeFromCart(cartItemId);
      return;
    }

    try {
      const response = await api.put(`/cart/update/${cartItemId}`, { quantity });

      if (response.data.success) {
        const transformedItems: CartItem[] = response.data.cart.items.map((item: any) => ({
          cartItemId: item._id,
          product: item.product,
          quantity: item.quantity,
          price: item.price,
        }));
        setCartItems(transformedItems);
      }
    } catch (error: any) {
      console.error('Error updating quantity:', error);
      toast.error('Failed to update quantity');
    }
  };

  const clearCart = async () => {
    try {
      const response = await api.delete('/cart/clear');
      if (response.data.success) {
        setCartItems([]);
        toast.success('Cart cleared');
      }
    } catch (error: any) {
      console.error('Error clearing cart:', error);
      toast.error('Failed to clear cart');
    }
  };

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getCartItemCount = () => {
    return cartItems.reduce((count, item) => count + item.quantity, 0);
  };

  const value: CartContextType = {
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartTotal,
    getCartItemCount,
    isLoading,
    fetchCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
