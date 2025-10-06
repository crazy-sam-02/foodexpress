import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { CartItem, Product } from '@/types';
import { toast } from 'sonner';
import { useUser } from '@/contexts/UserContext';

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string | number) => void;
  updateQuantity: (productId: string | number, quantity: number) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  getCartItemCount: () => number;
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

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const { user } = useUser();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  const getCartKey = () => (user?.id ? `cart_${user.id}` : 'cart_guest');

  // Load cart for current user/guest when user changes
  useEffect(() => {
    try {
      const saved = localStorage.getItem(getCartKey());
      setCartItems(saved ? JSON.parse(saved) : []);
    } catch (e) {
      setCartItems([]);
    }
  }, [user?.id]);

  // Persist cart per user/guest whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(getCartKey(), JSON.stringify(cartItems));
    } catch (e) {
      // ignore
    }
  }, [cartItems, user?.id]);

  const getProductId = (product: Product) => {
    return product._id || product.id;
  };

  const addToCart = (product: Product, quantity = 1) => {
    setCartItems(items => {
      const productId = getProductId(product);
      const existingItem = items.find(item => getProductId(item.product) === productId);
      
      if (existingItem) {
        toast.success('Item quantity updated in cart');
        return items.map(item =>
          getProductId(item.product) === productId
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        toast.success('Item added to cart');
        return [...items, { 
          id: productId, 
          product: { 
            ...product,
            _id: product._id || product.id.toString(),
            id: product.id || parseInt(product._id || '0')
          }, 
          quantity 
        }];
      }
    });
  };

  const removeFromCart = (productId: string | number) => {
    setCartItems(items => items.filter(item => {
      const itemId = getProductId(item.product);
      return itemId !== productId && itemId.toString() !== productId.toString();
    }));
    toast.success('Item removed from cart');
  };

  const updateQuantity = (productId: string | number, quantity: number) => {
    if (quantity === 0) {
      removeFromCart(productId);
      return;
    }
    setCartItems(items =>
      items.map(item => {
        const itemId = getProductId(item.product);
        return (itemId === productId || itemId.toString() === productId.toString())
          ? { ...item, quantity }
          : item;
      })
    );
  };

  const clearCart = () => {
    setCartItems([]);
    try { 
      localStorage.removeItem(getCartKey()); 
    } catch {}
  };

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => total + (item.product.price * item.quantity), 0);
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
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};