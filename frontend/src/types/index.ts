// Product type
export interface Product {
  _id: string; // MongoDB ID
  name: string;
  description: string;
  price: number;
  image: string;
  category: string; // category name or categoryId
  inStock: boolean;
  rating: number;
  reviews: number;
  tags: string[];
  stock?: number; // optional detailed stock count
}

// Category type
export interface Category {
  _id?: string; // MongoDB ID (optional if coming from backend)
  name: string;
  description: string;
  image: string;
  productCount: number;
}

// Cart item
export interface CartItem {
  _id?: string;
  product: Product;
  quantity: number;
}

// User type
export interface User {
  _id: string;
  email: string;
  name: string;
  role: "customer" | "admin";
  address?: string;
  phone?: string;
}

// Order type
export interface Order {
  _id: string;
  items: CartItem[];
  customerInfo: {
    name: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    zipCode: string;
  };
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  status:
    | "pending"
    | "confirmed"
    | "preparing"
    | "out-for-delivery"
    | "delivered"
    | "cancelled";
  paymentMethod: "card" | "cash" | "online" | "paypal" | "upi";
  orderDate: string;
  deliveryDate?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}
