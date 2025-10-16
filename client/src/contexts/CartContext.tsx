import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { CartItem, Product } from '@/types';
import { toast } from 'sonner';
import { useUser } from '@/contexts/UserContext';
import api from '@/lib/api';

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
  const { user, isAuthenticated, logout } = useUser();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  // Normalize backend cart items into client CartItem shape
  const normalizeItems = (itemsFromBackend: any[]): CartItem[] => {
    if (!Array.isArray(itemsFromBackend)) return [];
    return itemsFromBackend.map((it) => {
      const id = (it._id || it.id || '').toString();
      const product = it.product || {};
      const productNormalized = {
        _id: product._id || product.id || '',
        name: product.name || '',
        description: product.description || '',
        price: product.price ?? (it.price ?? 0),
        image: product.image || '',
        category: product.category || '',
        inStock: product.inStock ?? true,
        rating: product.rating ?? 0,
        reviews: product.reviews ?? 0,
        tags: product.tags || [],
        createdAt: product.createdAt,
        updatedAt: product.updatedAt,
      };

      return {
        id,
        product: productNormalized,
        quantity: it.quantity ?? 1,
        // Keep price at time of add (fallback to product price)
        price: it.price ?? productNormalized.price,
      } as unknown as CartItem;
    });
  };

  useEffect(() => {
    const fetchCart = async () => {
      if (user && isAuthenticated) {
        try {
          const response = await api.get('/cart');
          setCartItems(normalizeItems(response.data.cart.items));
        } catch (error) {
          console.error('Error fetching cart:', error);
          // if unauthorized, logout to clear session
          if (error?.response?.status === 401) {
            try {
              await logout();
            } catch (e) {
              // ignore
            }
          }
        }
      } else {
        setCartItems([]);
      }
    };
    fetchCart();
  }, [user, isAuthenticated]);

  const addToCart = async (product: Product, quantity = 1) => {
    if (!user) {
      toast.error('Please log in to add items to your cart.');
      return;
    }
    try {
      const response = await api.post('/cart/add', { productId: product._id, quantity });
      setCartItems(normalizeItems(response.data.cart.items));
      toast.success('Item added to cart');
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('Error adding item to cart');
    }
  };

  const removeFromCart = async (itemId: string | number) => {
    if (!user) return;
    try {
      const response = await api.delete(`/cart/remove/${itemId}`);
      setCartItems(normalizeItems(response.data.cart.items));
      toast.success('Item removed from cart');
    } catch (error) {
      console.error('Error removing from cart:', error);
      toast.error('Error removing item from cart');
    }
  };

  const updateQuantity = async (itemId: string | number, quantity: number) => {
    if (!user) return;
    // clamp quantity to >= 0
    if (quantity <= 0) {
      // remove item
      await removeFromCart(itemId);
      return;
    }
    try {
      const response = await api.put(`/cart/update/${itemId}`, { quantity });
      setCartItems(normalizeItems(response.data.cart.items));
      toast.success('Item quantity updated');
    } catch (error) {
      console.error('Error updating quantity:', error);
      toast.error('Error updating item quantity');
    }
  };

  const clearCart = async () => {
    if (!user) return;
    try {
      await api.delete('/cart/clear');
      setCartItems([]);
      toast.success('Cart cleared');
    } catch (error) {
      console.error('Error clearing cart:', error);
      toast.error('Error clearing cart');
    }
  };

  const getCartTotal = () => {
    // Use the price stored on the cart item (price at time of adding)
    // Fallback to product.price if item.price missing
    return cartItems.reduce((total: number, item: any) => total + ((item.price ?? item.product.price ?? 0) * item.quantity), 0);
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