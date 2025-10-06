
export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  inStock: boolean;
  rating: number;
  reviews: number;
  tags: string[];
}

export interface CartItem {
  id: number;
  product: Product;
  quantity: number;
}

export interface User {
  id: number;
  email: string;
  name: string;
  role: 'customer' | 'admin';
  address?: string;
  phone?: string;
}

export interface Order {
  id: string;
  userId: string;
  items: CartItem[];
  total: number;
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'cancelled';
  orderDate: string;
  deliveryDate?: string;
  deliveryAddress: string;
  notes?: string;
  paymentMethod?: 'cash' | 'card' | 'paypal' | 'upi';
  discount?: number;
}

export interface Category {
  id: number;
  name: string;
  description: string;
  image: string;
  productCount: number;
}
