import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Order } from '@/types';
import { useUser } from './UserContext';
import { toast } from 'sonner';
import { config } from '@/lib/config';

interface OrdersContextType {
  orders: Order[];
  isLoading: boolean;
  addOrder: (order: Omit<Order, 'id'>) => Promise<Order | null>;
  updateOrderStatus: (orderId: string, status: Order['status']) => void;
  updateOrderDiscount: (orderId: string, discount: number) => void;
  getOrderById: (orderId: string) => Order | undefined;
  getTotalSales: () => number;
  getTodaysSales: () => number;
  getPendingOrdersCount: () => number;
  refreshOrders: () => Promise<void>;
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
  const [isLoading, setIsLoading] = useState(false);
  const [lastFetchUserId, setLastFetchUserId] = useState<string | null>(null);
  const { user, token, logout, isLoading: userLoading } = useUser();

  // Clear orders when user changes or logs out
  useEffect(() => {
    if (!user && !userLoading) {
      console.log('User logged out, clearing orders');
      setOrders([]);
      setLastFetchUserId(null);
    } else if (user && lastFetchUserId && user.id !== lastFetchUserId) {
      console.log('User changed, clearing orders for new user');
      setOrders([]);
      setLastFetchUserId(null);
    }
  }, [user, userLoading, lastFetchUserId]);

  useEffect(() => {
    const fetchOrders = async () => {
      // Don't fetch if user is still loading or if no authentication
      if (userLoading || !user || !token) {
        return;
      }

      // Don't refetch if we already have orders for this user
      if (lastFetchUserId === user.id && orders.length > 0) {
        return;
      }

      setIsLoading(true);
      try {
        console.log('Fetching orders for user:', user.email);
        const response = await fetch(`${config.API_URL}/orders`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.success && Array.isArray(data.orders)) {
            const fetchedOrders = data.orders
              .filter((order: any) => order && order.items && Array.isArray(order.items))
              .map((order: any) => ({
                id: order.id,
                userId: order.userId,
                items: order.items
                  .filter((item: any) => item && item.product && item.product._id)
                  .map((item: any) => ({
                    id: item.product._id,
                    product: {
                      _id: item.product._id,
                      id: item.product.id || item.product._id,
                      name: item.product.name || 'Unknown Product',
                      description: item.product.description || '',
                      price: item.product.price || 0,
                      image: item.product.image || '/placeholder-image.jpg',
                      category: item.product.category || 'uncategorized',
                      stock: item.product.stock || 0
                    },
                    quantity: item.quantity || 1
                  })),
                total: order.total || 0,
                status: order.status || 'pending',
                orderDate: order.orderDate,
                deliveryAddress: order.deliveryAddress || '',
                notes: order.notes || '',
                paymentMethod: order.paymentMethod || 'cash',
                // Include tracking fields
                trackingNumber: order.trackingNumber || undefined,
                estimatedDelivery: order.estimatedDelivery || undefined,
                actualDelivery: order.actualDelivery || undefined,
                statusHistory: order.statusHistory || []
              }))
              .filter(order => order.items.length > 0); // Only include orders with valid items
            
            console.log('Successfully fetched orders:', fetchedOrders.length);
            setOrders(fetchedOrders);
            setLastFetchUserId(user.id);
          } else {
            console.warn('Invalid orders response format:', data);
            setOrders([]);
          }
        } else if (response.status === 401) {
          // Token may be invalid/expired; clear client auth to stop repeated 401s
          console.warn('Orders fetch unauthorized, clearing user session');
          setOrders([]);
          setLastFetchUserId(null);
          await logout();
          toast.error('Session expired. Please login again.');
        } else {
          console.error('Failed to fetch orders:', response.status, response.statusText);
          const errorData = await response.json().catch(() => ({}));
          toast.error(errorData.message || 'Failed to load your orders.');
        }
      } catch (error) {
        console.error('Error fetching orders:', error);
        toast.error('Failed to connect to server. Please check your connection.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, [user, token, userLoading, logout, lastFetchUserId, orders.length]);

  const addOrder = async (orderData: Omit<Order, 'id'>) => {
    if (!user || !token) {
      toast.error('You must be logged in to place an order');
      return null;
    }

    try {
      // Extract only product IDs from cart items and ensure they're valid
      const backendOrderData = {
        items: orderData.items.map(item => ({
          product: item.product._id, // Use MongoDB ObjectId
          quantity: item.quantity
        })).filter(item => item.product), // Filter out any items with invalid IDs
        total: orderData.total,
        deliveryAddress: orderData.deliveryAddress,
        notes: orderData.notes || '',
        paymentMethod: orderData.paymentMethod
      };

      // Validate order data before sending
      if (!backendOrderData.items.length) {
        toast.error('No valid items in the order');
        return null;
      }

      console.log('Sending order to backend:', backendOrderData);

      const response = await fetch(`${config.API_URL}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(backendOrderData),
      });

      const data = await response.json();
      console.log('Backend response:', data);

      if (!response.ok) {
        const errorMessage = data.message || 'Failed to place order. Please try again.';
        console.error('Order placement failed:', errorMessage);
        
        if (response.status === 401) {
          toast.error('Session expired. Please login again.');
          // Optional: Trigger a logout or session refresh here
        } else if (response.status === 400) {
          toast.error(errorMessage);
        } else {
          toast.error('An error occurred while placing your order. Please try again.');
        }
        return null;
      }

      if (!data.success || !data.order) {
        console.error('Invalid response format:', data);
        toast.error('Something went wrong. Please try again.');
        return null;
      }

      try {
        const newOrder: Order = {
          id: data.order._id || data.order.id,
          userId: data.order.userId,
          items: data.order.items.map((item: any) => ({
            id: item.product._id || item.product.id,
            product: {
              _id: item.product._id,
              id: item.product.id || item.product._id,
              name: item.product.name,
              description: item.product.description,
              price: item.product.price,
              image: item.product.image,
              category: item.product.category,
              stock: item.product.stock
            },
            quantity: item.quantity
          })),
          total: data.order.total,
          status: data.order.status,
          orderDate: data.order.orderDate,
          deliveryAddress: data.order.deliveryAddress,
          notes: data.order.notes || '',
          paymentMethod: data.order.paymentMethod,
          trackingNumber: data.order.trackingNumber,
          estimatedDelivery: data.order.estimatedDelivery,
          actualDelivery: data.order.actualDelivery,
          statusHistory: data.order.statusHistory || []
        };
        
        // Add the new order to the beginning of the list
        setOrders(prev => [newOrder, ...prev]);
        toast.success('Order placed successfully!');
        return newOrder;
      } catch (error) {
        console.error('Error processing order response:', error);
        toast.error('Error processing order response');
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
      const response = await fetch(`${config.API_URL}/orders/${orderId}/status`, {
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

  const refreshOrders = async () => {
    if (!user || !token) {
      toast.error('Please login to refresh orders');
      return;
    }

    setLastFetchUserId(null); // Force refetch
    
    setIsLoading(true);
    try {
      console.log('Refreshing orders for user:', user.email);
      const response = await fetch(`${config.API_URL}/orders`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && Array.isArray(data.orders)) {
          const fetchedOrders = data.orders
            .filter((order: any) => order && order.items && Array.isArray(order.items))
            .map((order: any) => ({
              id: order.id,
              userId: order.userId,
              items: order.items
                .filter((item: any) => item && item.product && item.product._id)
                .map((item: any) => ({
                  id: item.product._id,
                  product: {
                    _id: item.product._id,
                    id: item.product.id || item.product._id,
                    name: item.product.name || 'Unknown Product',
                    description: item.product.description || '',
                    price: item.product.price || 0,
                    image: item.product.image || '/placeholder-image.jpg',
                    category: item.product.category || 'uncategorized',
                    stock: item.product.stock || 0
                  },
                  quantity: item.quantity || 1
                })),
              total: order.total || 0,
              status: order.status || 'pending',
              orderDate: order.orderDate,
              deliveryAddress: order.deliveryAddress || '',
              notes: order.notes || '',
              paymentMethod: order.paymentMethod || 'cash',
              trackingNumber: order.trackingNumber || undefined,
              estimatedDelivery: order.estimatedDelivery || undefined,
              actualDelivery: order.actualDelivery || undefined,
              statusHistory: order.statusHistory || []
            }))
            .filter(order => order.items.length > 0); // Only include orders with valid items
          
          setOrders(fetchedOrders);
          setLastFetchUserId(user.id);
          toast.success('Orders refreshed successfully');
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        toast.error(errorData.message || 'Failed to refresh orders');
      }
    } catch (error) {
      console.error('Error refreshing orders:', error);
      toast.error('Failed to refresh orders');
    } finally {
      setIsLoading(false);
    }
  };

  const value: OrdersContextType = {
    orders,
    isLoading,
    addOrder,
    updateOrderStatus,
    updateOrderDiscount,
    getOrderById,
    getTotalSales,
    getTodaysSales,
    getPendingOrdersCount,
    refreshOrders,
  };

  return (
    <OrdersContext.Provider value={value}>
      {children}
    </OrdersContext.Provider>
  );
};