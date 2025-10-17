
export interface Product {
  _id: string; // MongoDB ObjectId as string
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  inStock: boolean;
  rating: number;
  reviews: number;
  tags: string[];
  // Medicine-specific fields
  requiresPrescription?: boolean;
  manufacturer?: string;
  productType?: 'food' | 'medicine';
  createdAt?: string;
  updatedAt?: string;
}

export interface CartItem {
  id: string; // Use string ID for consistency
  product: Product;
  quantity: number;
  // price stored on cart item (price at time of add). Optional for backwards compatibility
  price?: number;
}

export interface User {
  id: string; // MongoDB ObjectId as string
  email: string;
  name: string;
  isAdmin?: boolean;
  address?: string;
  phone?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface OrderStatusHistory {
  status: string;
  timestamp: string;
  updatedBy: string;
  notes?: string;
}

export interface Order {
  id: string; // MongoDB ObjectId as string
  userId: string;
  items: CartItem[];
  total: number;
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'cancelled' | 'processing' | 'shipped';
  orderDate: string;
  deliveryDate?: string;
  deliveryAddress: string;
  notes?: string;
  paymentMethod?: 'cash' | 'card' | 'paypal' | 'upi';
  discount?: number;
  orderAction?: string;
  // Enhanced tracking fields
  trackingNumber?: string;
  estimatedDelivery?: string;
  actualDelivery?: string;
  adminNotes?: string;
  statusHistory?: OrderStatusHistory[];
  createdAt?: string;
  updatedAt?: string;
}

export interface Category {
  _id: string; // MongoDB ObjectId as string
  name: string;
  description: string;
  image: string;
  productCount: number;
  createdAt?: string;
  updatedAt?: string;
}
