import { Notification } from '@/types/notifications';

export const defaultNotifications: Notification[] = [
  {
    id: '1',
    title: 'Welcome to Food Express!',
    message: 'Thank you for joining us. Enjoy your shopping experience!',
    type: 'announcement',
    created_by: 'admin',
    created_at: new Date().toISOString(),
  },
];
