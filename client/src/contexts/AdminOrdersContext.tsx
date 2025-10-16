import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import config from '@/lib/config';
import { toast } from 'sonner';
import { Order, Product } from '@/types';

interface AdminOrdersContextType {
  orders: Order[];
  refresh: () => Promise<void>;
  updateOrder: (orderId: string, updates: { status?: Order['status']; orderAction?: string; discount?: number }) => Promise<void>;
  getTotalSales: () => number;
  getTodaysSales: () => number;
  getPendingOrdersCount: () => number;
  isLoading: boolean;
}

const AdminOrdersContext = createContext<AdminOrdersContextType | undefined>(undefined);

export const useAdminOrders = () => {
  const ctx = useContext(AdminOrdersContext);
  if (!ctx) throw new Error('useAdminOrders must be used within AdminOrdersProvider');
  return ctx;
};

export const AdminOrdersProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const mapBackendOrders = (data: any[]): Order[] => {
    return (data || []).map((order: any) => ({
      id: order.id || order._id,
      userId: order.userId || order.userName || 'Unknown User',
      items: (order.items || []).map((it: any) => ({
        id: it.product?._id || it.product?.id,
        product: it.product as Product,
        quantity: it.quantity,
      })),
      total: order.total,
      status: order.status,
      orderDate: order.orderDate,
      deliveryAddress: order.deliveryAddress,
      notes: order.notes,
      paymentMethod: order.paymentMethod,
      orderAction: order.orderAction,
      discount: order.discount,
    }));
  };

  const refresh = async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`${config.API_URL}/orders/admin/all`, {
        credentials: 'include',
      });
      const json = await res.json();
      if (res.ok && json?.success && Array.isArray(json.orders)) {
        setOrders(mapBackendOrders(json.orders));
      } else if (res.status === 401) {
        setOrders([]);
        // AdminRoute will redirect if admin session not present
      } else {
        toast.error(json?.message || 'Failed to fetch admin orders');
      }
    } catch (err) {
      console.error('Admin orders fetch error:', err);
      toast.error('Error fetching admin orders');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Load on mount
    refresh();
  }, []);

  const updateOrderStatus = async (orderId: string, newStatus: Order['status']) => {
    try {
      console.log('[AdminOrdersContext] Updating order status:', { orderId, newStatus });

      const response = await fetch(`${config.API_URL}/orders/admin/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('[AdminOrdersContext] Status update failed:', {
          status: response.status,
          errorData,
        });
        throw new Error(errorData.message || 'Failed to update order status');
      }

      console.log('[AdminOrdersContext] Order status updated successfully');
      refresh();
    } catch (error) {
      console.error('[AdminOrdersContext] Error updating order status:', error);
    }
  };

  const updateOrder = async (
    orderId: string,
    updates: { status?: Order['status']; orderAction?: string; discount?: number }
  ) => {
    try {
      console.log('[AdminOrdersContext] Updating order:', { orderId, updates });

      const response = await fetch(`${config.API_URL}/orders/admin/${orderId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('[AdminOrdersContext] Order update failed:', {
          status: response.status,
          errorData,
        });
        throw new Error(errorData.message || 'Failed to update order');
      }

      console.log('[AdminOrdersContext] Order updated successfully');
      refresh();
    } catch (error) {
      console.error('[AdminOrdersContext] Error updating order:', error);
    }
  };

  const getTotalSales = () => orders.reduce((sum, o) => sum + (o.total || 0), 0);
  const getTodaysSales = () => {
    const today = new Date().toDateString();
    return orders
      .filter(o => new Date(o.orderDate).toDateString() === today)
      .reduce((sum, o) => sum + (o.total || 0), 0);
  };
  const getPendingOrdersCount = () => orders.filter(o => o.status === 'pending').length;

  const value = useMemo(() => ({
    orders,
    refresh,
    updateOrder,
    getTotalSales,
    getTodaysSales,
    getPendingOrdersCount,
    isLoading,
  }), [orders, isLoading]);

  return (
    <AdminOrdersContext.Provider value={value}>
      {children}
    </AdminOrdersContext.Provider>
  );
};
