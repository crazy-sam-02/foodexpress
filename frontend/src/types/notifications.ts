export type NotificationType = 'order' | 'delivery' | 'delivered' | 'promotion' | 'announcement' | 'alert';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  created_by: string | null;
  created_at: string;
}

export interface UserNotification {
  id: string;
  notification_id: string;
  user_id: string;
  is_read: boolean;
  read_at: string | null;
  created_at: string;
}

export interface NotificationWithReadStatus extends Notification {
  is_read: boolean;
  read_at: string | null;
}
