import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Bell, Package, TruckIcon, CheckCircle, AlertCircle, Megaphone } from 'lucide-react';
import { toast } from 'sonner';
import { useNotifications } from '@/contexts/NotificationsContext';

const NotificationsPage = () => {
  const { notifications, markAsRead, markAllAsRead, unreadCount, loadMore, hasMore, loading } = useNotifications();

  const getIcon = (type: string) => {
    switch (type) {
      case 'order':
        return <Package className="h-5 w-5 text-amber-600" />;
      case 'delivery':
        return <TruckIcon className="h-5 w-5 text-blue-600" />;
      case 'delivered':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'promotion':
        return <Bell className="h-5 w-5 text-purple-600" />;
      case 'announcement':
        return <Megaphone className="h-5 w-5 text-orange-600" />;
      case 'alert':
        return <AlertCircle className="h-5 w-5 text-red-600" />;
      default:
        return <Bell className="h-5 w-5 text-gray-600" />;
    }
  };

  const getTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };


  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <Bell className="h-8 w-8 text-amber-600" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
                {unreadCount > 0 && (
                  <p className="text-sm text-gray-600 mt-1">
                    {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
                  </p>
                )}
              </div>
            </div>
            {unreadCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={markAllAsRead}
                className="text-amber-600 hover:text-amber-700"
              >
                Mark all as read
              </Button>
            )}
          </div>

          <div className="space-y-4">
            {notifications.map((notification) => (
              <Card 
                key={notification.id} 
                className={`transition-all hover:shadow-md cursor-pointer ${
                  !notification.is_read ? 'border-l-4 border-l-amber-500 bg-amber-50' : ''
                }`}
                onClick={() => !notification.is_read && markAsRead(notification.id)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      {getIcon(notification.type)}
                      <div className="flex-1">
                        <CardTitle className="text-lg flex items-center gap-2 flex-wrap">
                          {notification.title}
                          {!notification.is_read && (
                            <Badge variant="secondary" className="bg-amber-100 text-amber-800">
                              New
                            </Badge>
                          )}
                        </CardTitle>
                        <p className="text-sm text-gray-500 mt-1">
                          {getTimeAgo(notification.created_at)}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-gray-700">{notification.message}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {hasMore && notifications.length > 0 && (
            <div className="flex justify-center mt-6">
              <Button
                variant="outline"
                onClick={() => void loadMore()}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900 mr-2"></div>
                    Loading...
                  </>
                ) : (
                  'Load more'
                )}
              </Button>
            </div>
          )}

          {notifications.length === 0 && (
            <div className="text-center py-12">
              <Bell className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No notifications</h3>
              <p className="text-gray-600">You're all caught up! We'll notify you when something new happens.</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default NotificationsPage;