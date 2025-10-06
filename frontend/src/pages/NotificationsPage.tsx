import { useEffect, useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bell, Package, TruckIcon, CheckCircle, AlertCircle, Megaphone } from "lucide-react";
import { toast } from "sonner";
import { useUser } from "@/contexts/UserContext";
import { io } from "socket.io-client";

type Notification = {
  _id: string;
  title: string;
  message: string;
  type: string;
  created_at: string;
  is_read: boolean;
  read_at: string | null;
};

const NotificationsPage = () => {
  const { user } = useUser();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      fetchNotifications();
      setupRealtime();
    }
  }, [user?.id]);

  const fetchNotifications = async () => {
    if (!user?.id) return;
    try {
      setIsLoading(true);
      const res = await fetch(`/api/notifications/${user.id}`);
      const data = await res.json();
      setNotifications(data);
    } catch (err) {
      toast.error("Failed to load notifications");
    } finally {
      setIsLoading(false);
    }
  };

  const setupRealtime = () => {
    const socket = io("http://localhost:4000"); // change for prod
    socket.on("notification:new", (notif: Notification) => {
      toast.success("New notification received!");
      setNotifications((prev) => [notif, ...prev]);
    });
    return () => socket.disconnect();
  };

  const markAsRead = async (notifId: string) => {
    if (!user?.id) return;
    try {
      await fetch(`/api/notifications/${user.id}/read/${notifId}`, { method: "POST" });
      setNotifications((prev) =>
        prev.map((n) => (n._id === notifId ? { ...n, is_read: true, read_at: new Date().toISOString() } : n))
      );
    } catch {
      toast.error("Failed to mark as read");
    }
  };

  const markAllAsRead = async () => {
    if (!user?.id) return;
    try {
      await fetch(`/api/notifications/${user.id}/read-all`, { method: "POST" });
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true, read_at: new Date().toISOString() })));
      toast.success("All notifications marked as read");
    } catch {
      toast.error("Failed to mark all as read");
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "order": return <Package className="h-5 w-5 text-amber-600" />;
      case "delivery": return <TruckIcon className="h-5 w-5 text-blue-600" />;
      case "delivered": return <CheckCircle className="h-5 w-5 text-green-600" />;
      case "promotion": return <Bell className="h-5 w-5 text-purple-600" />;
      case "announcement": return <Megaphone className="h-5 w-5 text-orange-600" />;
      case "alert": return <AlertCircle className="h-5 w-5 text-red-600" />;
      default: return <Bell className="h-5 w-5 text-gray-600" />;
    }
  };

  const getTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diff = Math.floor((now.getTime() - date.getTime()) / 60000);
    if (diff < 1) return "Just now";
    if (diff < 60) return `${diff}m ago`;
    if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
    return `${Math.floor(diff / 1440)}d ago`;
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading notifications...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Bell className="h-8 w-8 text-amber-600" />
            <div>
              <h1 className="text-3xl font-bold">Notifications</h1>
              {unreadCount > 0 && <p className="text-sm text-gray-600">{unreadCount} unread</p>}
            </div>
          </div>
          {unreadCount > 0 && (
            <Button variant="outline" size="sm" onClick={markAllAsRead} className="text-amber-600">
              Mark all as read
            </Button>
          )}
        </div>

        <div className="space-y-4">
          {notifications.map((n) => (
            <Card
              key={n._id}
              onClick={() => !n.is_read && markAsRead(n._id)}
              className={`cursor-pointer transition-all hover:shadow-md ${
                !n.is_read ? "border-l-4 border-l-amber-500 bg-amber-50" : ""
              }`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start gap-3">
                  {getIcon(n.type)}
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-2">
                      {n.title}
                      {!n.is_read && <Badge className="bg-amber-100 text-amber-800">New</Badge>}
                    </CardTitle>
                    <p className="text-sm text-gray-500">{getTimeAgo(n.created_at)}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p>{n.message}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {notifications.length === 0 && (
          <div className="text-center py-12">
            <Bell className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold">No notifications</h3>
            <p className="text-gray-600">You're all caught up!</p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default NotificationsPage;
