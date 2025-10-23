import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import { Notification, NotificationWithReadStatus } from '@/types/notifications';
import { defaultNotifications } from '@/data/notificationsData';
import { useUser } from './UserContext';
import { config } from '@/lib/config';
import { toast } from 'sonner';

interface NotificationsContextType {
  notifications: NotificationWithReadStatus[];
  addNotification: (notification: Omit<Notification, 'id' | 'created_at' | 'created_by'>, clientIds?: string[]) => Promise<any>;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
  unreadCount: number;
}

const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined);

const STORAGE_KEY = 'food_express_notifications';
const READ_STATUS_KEY = 'food_express_notification_read_status';

export const NotificationsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user, token } = useUser();
  const [notifications, setNotifications] = useState<NotificationWithReadStatus[]>([]);
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    if (user && token) {
      const socketInstance = io(config.SOCKET_URL, {
        withCredentials: true,
      });

      socketInstance.on("connect", () => {
        console.log("🔔 Notifications socket connected:", socketInstance.id);
        socketInstance.emit("authenticate", {
          userId: user.id,
          token: token
        });
      });

      socketInstance.on("notification", (notification: NotificationWithReadStatus) => {
        console.log("🔔 Received real-time notification:", notification);
        
        setNotifications(prev => [notification, ...prev]);
        
        toast.success(`New notification: ${notification.title}`, {
          description: notification.message,
          duration: 5000,
        });
      });

      socketInstance.on("disconnect", () => {
        console.log("🔔 Notifications socket disconnected");
      });

      setSocket(socketInstance);

      return () => {
        socketInstance.disconnect();
      };
    }
  }, [user, token]);

  useEffect(() => {
    loadNotifications();
  }, [user?.id]);

  const loadNotifications = async () => {
    if (!user || !token) {
      const notificationsWithStatus: NotificationWithReadStatus[] = defaultNotifications.map(notif => ({
        ...notif,
        is_read: false,
        read_at: null,
      }));
      setNotifications(notificationsWithStatus);
      return;
    }

    try {
      const response = await fetch(`${config.API_URL}/notifications/user`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success && Array.isArray(result.notifications)) {
          setNotifications(result.notifications);
          return;
        }
      }
      
      const notificationsWithStatus: NotificationWithReadStatus[] = defaultNotifications.map(notif => ({
        ...notif,
        is_read: false,
        read_at: null,
      }));
      setNotifications(notificationsWithStatus);
    } catch (error) {
      console.error('Error loading notifications:', error);
      const notificationsWithStatus: NotificationWithReadStatus[] = defaultNotifications.map(notif => ({
        ...notif,
        is_read: false,
        read_at: null,
      }));
      setNotifications(notificationsWithStatus);
    }
  };

  const addNotification = async (notification: Omit<Notification, 'id' | 'created_at' | 'created_by'>, clientIds?: string[]) => {
    try {
      const response = await fetch(`${config.API_URL}/notifications/admin/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          title: notification.title,
          message: notification.message,
          type: notification.type,
          clientIds: clientIds,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to send notification');
      }

      console.log('✅ Notification sent successfully:', result);
      return result;
    } catch (error) {
      console.error('❌ Error sending notification:', error);
      throw error;
    }
  };

  const markAsRead = async (notificationId: string) => {
    if (!user?.id || !token) return;

    try {
      const response = await fetch(`${config.API_URL}/notifications/user/${notificationId}/read`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (response.ok) {
        setNotifications((prev) =>
          prev.map((notif) =>
            notif.id === notificationId
              ? { ...notif, is_read: true, read_at: new Date().toISOString() }
              : notif
          )
        );
      } else {
        console.error('Failed to mark notification as read');
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    if (!user?.id || !token) return;

    try {
      const response = await fetch(`${config.API_URL}/notifications/user/read-all`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (response.ok) {
        const now = new Date().toISOString();
        setNotifications((prev) =>
          prev.map((notif) => ({
            ...notif,
            is_read: true,
            read_at: now,
          }))
        );
      } else {
        console.error('Failed to mark all notifications as read');
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <NotificationsContext.Provider
      value={{
        notifications,
        addNotification,
        markAsRead,
        markAllAsRead,
        unreadCount,
      }}
    >
      {children}
    </NotificationsContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationsContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationsProvider');
  }
  return context;
};