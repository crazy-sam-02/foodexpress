import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Order } from '@/types';
import { useUser } from './UserContext';
import { toast } from 'sonner';

interface OrdersContextType {
  orders: Order[];
  addOrder: (order: Omit<Order, 'id'>) => Promise<Order | null>;
  updateOrderStatus: (orderId: string, status: Order['status']) => void;
  updateOrderDiscount: (orderId: string, discount: number) => void;
  getOrderById: (orderId: string) => Order | undefined;
  getTotalSales: () => number;
  getTodaysSales: () => number;
  getPendingOrdersCount: () => number;
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

export const OrdersProvider: React.FC<OrdersProviderProps> = ({ children }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const { user, token } = useUser();

  useEffect(() => {
    const fetchOrders = async () => {
      if (user && token) {
        try {
          const response = await fetch('http://localhost:5000/api/orders', {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });
          if (response.ok) {
            const data = await response.json();
            if (data.success && data.orders) {
              setOrders(data.orders.map((order: any) => ({
                id: order.id,
                userId: order.userId,
                items: order.items.map((item: any) => ({
                  id: item.product._id,
                  product: item.product,
                  quantity: item.quantity
                })),
                total: order.total,
                status: order.status,
                orderDate: order.orderDate,
                deliveryAddress: order.deliveryAddress,
                notes: order.notes,
                paymentMethod: order.paymentMethod
              })));
            }
          }
        } catch (error) {
          console.error('Error fetching orders:', error);
        }
      }
    };

    fetchOrders();
  }, [user, token]);

  const addOrder = async (orderData: Omit<Order, 'id'>) => {
    if (!token) {
      toast.error('You must be logged in to place an order');
      return null;
    }

    try {
      // Extract only product IDs from cart items
      const backendOrderData = {
        items: orderData.items.map(item => ({
          product: item.product._id || item.product.id, // Send only the ID
          quantity: item.quantity
        })),
        total: orderData.total,
        deliveryAddress: orderData.deliveryAddress,
        notes: orderData.notes || '',
        paymentMethod: orderData.paymentMethod
      };

      console.log('Sending order to backend:', backendOrderData);

      const response = await fetch('http://localhost:5000/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(backendOrderData),
      });

      const data = await response.json();
      console.log('Backend response:', data);

      if (response.ok && data.success) {
        const newOrder: Order = {
          id: data.order.id,
          userId: data.order.userId,
          items: data.order.items.map((item: any) => ({
            id: item.product._id,
            product: item.product,
            quantity: item.quantity
          })),
          total: data.order.total,
          status: data.order.status,
          orderDate: data.order.orderDate,
          deliveryAddress: data.order.deliveryAddress,
          notes: data.order.notes,
          paymentMethod: data.order.paymentMethod
        };
        
        setOrders(prev => [newOrder, ...prev]);
        return newOrder;
      } else {
        const errorMessage = data.message || 'Failed to place order';
        console.error('Order placement failed:', errorMessage);
        toast.error(errorMessage);
        return null;
      }
    } catch (error) {
      console.error('Order placement error:', error);
      toast.error('Failed to connect to server. Please check your connection.');
      return null;
    }
  };

  const updateOrderStatus = async (orderId: string, status: Order['status']) => {
    if (!token) {
      toast.error('You must be logged in to update order status');
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setOrders(prev => prev.map(order => 
          order.id === orderId ? { ...order, status } : order
        ));
        toast.success('Order status updated successfully');
      } else {
        toast.error(data.message || 'Failed to update order status');
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error('Failed to update order status');
    }
  };

  const updateOrderDiscount = (orderId: string, discount: number) => {
    // This would need a backend endpoint to be implemented
    console.warn('updateOrderDiscount is not implemented on the backend yet');
    toast.info('Discount feature coming soon');
  };

  const getOrderById = (orderId: string) => {
    return orders.find(order => order.id === orderId);
  };

  const getTotalSales = () => {
    return orders
      .filter(order => order.status !== 'cancelled')
      .reduce((total, order) => total + order.total, 0);
  };

  const getTodaysSales = () => {
    const today = new Date().toDateString();
    return orders
      .filter(order => 
        order.status !== 'cancelled' && 
        new Date(order.orderDate).toDateString() === today
      )
      .reduce((total, order) => total + order.total, 0);
  };

  const getPendingOrdersCount = () => {
    return orders.filter(order => order.status === 'pending').length;
  };

  const value: OrdersContextType = {
    orders,
    addOrder,
    updateOrderStatus,
    updateOrderDiscount,
    getOrderById,
    getTotalSales,
    getTodaysSales,
    getPendingOrdersCount,
  };

  return (
    <OrdersContext.Provider value={value}>
      {children}
    </OrdersContext.Provider>
  );
};