import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Order } from '@/types';
import { toast } from 'sonner';
import axios from 'axios';

interface OrdersContextType {
  orders: Order[];
  addOrder: (orderData: any) => Promise<Order | null>;
  updateOrderStatus: (orderId: string, status: Order['status']) => Promise<void>;
  getOrderById: (orderId: string) => Order | undefined;
  getTotalSales: () => number;
  getTodaysSales: () => number;
  getPendingOrdersCount: () => number;
  isLoading: boolean;
  fetchOrders: () => Promise<void>;
  fetchOrderStats: () => Promise<void>;
  stats: {
    totalSales: number;
    todaysSales: number;
    pendingOrders: number;
  };
}

const OrdersContext = createContext<OrdersContextType | undefined>(undefined);

export const useOrders = () => {
  const context = useContext(OrdersContext);
  if (!context) {
    throw new Error('useOrders must be used within an OrdersProvider');
  }
  return context;
};

interface OrdersProviderProps {
  children: ReactNode;
}

const API_URL = 'http://localhost:5000/api';

// Create axios instance with credentials and proper headers
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

export const OrdersProvider: React.FC<OrdersProviderProps> = ({ children }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [stats, setStats] = useState({
    totalSales: 0,
    todaysSales: 0,
    pendingOrders: 0,
  });

  // Fetch orders from backend
  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/orders');
      
      if (response.data.success) {
        setOrders(response.data.orders);
      }
    } catch (error: any) {
      if (error.response?.status === 401) {
        // User not authenticated, clear orders
        setOrders([]);
      } else {
        console.error('Error fetching orders:', error);
        toast.error('Failed to load orders');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch order statistics
  const fetchOrderStats = async () => {
    try {
      const response = await api.get('/orders/stats/summary');
      
      if (response.data.success) {
        setStats(response.data.stats);
      }
    } catch (error: any) {
      console.error('Error fetching order stats:', error);
    }
  };

  useEffect(() => {
    fetchOrders();
    fetchOrderStats();
  }, []);

  const addOrder = async (orderData: any): Promise<Order | null> => {
    try {
      const response = await api.post('/orders/create', orderData);
      
      if (response.data.success) {
        const newOrder = response.data.order;
        setOrders(prev => [newOrder, ...prev]);
        await fetchOrderStats(); // Update stats after creating order
        toast.success('Order placed successfully');
        return newOrder;
      }
      return null;
    } catch (error: any) {
      console.error('Error creating order:', error);
      if (error.response?.status === 401) {
        toast.error('Please log in to place an order');
      } else if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Failed to create order');
      }
      return null;
    }
  };

  const updateOrderStatus = async (orderId: string, status: Order['status']) => {
    try {
      const response = await api.put(`/orders/${orderId}/status`, { status });
      
      if (response.data.success) {
        setOrders(prev =>
          prev.map(order =>
            order._id === orderId ? { ...order, status } : order
          )
        );
        await fetchOrderStats(); // Update stats after status change
        toast.success('Order status updated');
      }
    } catch (error: any) {
      console.error('Error updating order status:', error);
      toast.error('Failed to update order status');
    }
  };

  const getOrderById = (orderId: string) => {
    return orders.find(order => order._id === orderId);
  };

  const getTotalSales = () => {
    return stats.totalSales;
  };

  const getTodaysSales = () => {
    return stats.todaysSales;
  };

  const getPendingOrdersCount = () => {
    return stats.pendingOrders;
  };

  const value: OrdersContextType = {
    orders,
    addOrder,
    updateOrderStatus,
    getOrderById,
    getTotalSales,
    getTodaysSales,
    getPendingOrdersCount,
    isLoading,
    fetchOrders,
    fetchOrderStats,
    stats,
  };

  return (
    <OrdersContext.Provider value={value}>
      {children}
    </OrdersContext.Provider>
  );
};