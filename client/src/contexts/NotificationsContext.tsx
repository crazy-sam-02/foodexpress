import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Notification, NotificationWithReadStatus } from '@/types/notifications';
import { defaultNotifications } from '@/data/notificationsData';
import { useUser } from './UserContext';

interface NotificationsContextType {
  notifications: NotificationWithReadStatus[];
  addNotification: (notification: Omit<Notification, 'id' | 'created_at' | 'created_by'>, targetUserId?: string) => void;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
  unreadCount: number;
}

const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined);

const STORAGE_KEY = 'food_express_notifications';
const READ_STATUS_KEY = 'food_express_notification_read_status';

export const NotificationsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useUser();
  const [notifications, setNotifications] = useState<NotificationWithReadStatus[]>([]);

  useEffect(() => {
    loadNotifications();
  }, [user?.id]);

  const loadNotifications = () => {
    // Load all notifications from localStorage
    const stored = localStorage.getItem(STORAGE_KEY);
    const allNotifications: any[] = stored ? JSON.parse(stored) : defaultNotifications;

    // Filter notifications: show global (no target_user_id) or user-specific notifications
    const userNotifications = allNotifications.filter(notif => 
      !notif.target_user_id || notif.target_user_id === user?.id
    );

    // Load read status for current user
    const readStatusKey = user?.id ? `${READ_STATUS_KEY}_${user.id}` : READ_STATUS_KEY;
    const storedReadStatus = localStorage.getItem(readStatusKey);
    const readStatus: Record<string, { is_read: boolean; read_at: string | null }> = storedReadStatus 
      ? JSON.parse(storedReadStatus) 
      : {};

    // Combine notifications with read status
    const notificationsWithStatus: NotificationWithReadStatus[] = userNotifications
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .map((notif) => ({
        ...notif,
        is_read: readStatus[notif.id]?.is_read || false,
        read_at: readStatus[notif.id]?.read_at || null,
      }));

    setNotifications(notificationsWithStatus);

    // Save default notifications if none exist
    if (!stored) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultNotifications));
    }
  };

  const addNotification = (notification: Omit<Notification, 'id' | 'created_at' | 'created_by'>, targetUserId?: string) => {
    const newNotification: any = {
      ...notification,
      id: Date.now().toString(),
      created_at: new Date().toISOString(),
      created_by: user?.id || 'admin',
      target_user_id: targetUserId || null, // null means all users
    };

    // Load existing notifications
    const stored = localStorage.getItem(STORAGE_KEY);
    const existingNotifications: any[] = stored ? JSON.parse(stored) : [];
    
    // Add new notification
    const updatedNotifications = [newNotification, ...existingNotifications];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedNotifications));

    // Update state
    loadNotifications();
  };

  const markAsRead = (notificationId: string) => {
    if (!user?.id) return;

    const readStatusKey = `${READ_STATUS_KEY}_${user.id}`;
    const storedReadStatus = localStorage.getItem(readStatusKey);
    const readStatus: Record<string, { is_read: boolean; read_at: string | null }> = storedReadStatus 
      ? JSON.parse(storedReadStatus) 
      : {};

    readStatus[notificationId] = {
      is_read: true,
      read_at: new Date().toISOString(),
    };

    localStorage.setItem(readStatusKey, JSON.stringify(readStatus));

    // Update state
    setNotifications((prev) =>
      prev.map((notif) =>
        notif.id === notificationId
          ? { ...notif, is_read: true, read_at: new Date().toISOString() }
          : notif
      )
    );
  };

  const markAllAsRead = () => {
    if (!user?.id) return;

    const readStatusKey = `${READ_STATUS_KEY}_${user.id}`;
    const storedReadStatus = localStorage.getItem(readStatusKey);
    const readStatus: Record<string, { is_read: boolean; read_at: string | null }> = storedReadStatus 
      ? JSON.parse(storedReadStatus) 
      : {};

    const now = new Date().toISOString();
    notifications.forEach((notif) => {
      readStatus[notif.id] = {
        is_read: true,
        read_at: now,
      };
    });

    localStorage.setItem(readStatusKey, JSON.stringify(readStatus));

    // Update state
    setNotifications((prev) =>
      prev.map((notif) => ({
        ...notif,
        is_read: true,
        read_at: now,
      }))
    );
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
