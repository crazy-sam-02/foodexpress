import { useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Bell, Send, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { NotificationType } from '@/types/notifications';
import { useNotifications } from '@/contexts/NotificationsContext';

const AdminNotificationsPage = () => {
  const { addNotification } = useNotifications();
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [type, setType] = useState<NotificationType>('announcement');
  const [isLoading, setIsLoading] = useState(false);
  const [sendTo, setSendTo] = useState<'all' | 'specific'>('all');
  const [targetOrderId, setTargetOrderId] = useState('');

  const notificationTypes: { value: NotificationType; label: string; description: string }[] = [
    { value: 'announcement', label: 'Announcement', description: 'General announcements' },
    { value: 'promotion', label: 'Promotion', description: 'Special offers and deals' },
    { value: 'alert', label: 'Alert', description: 'Important alerts' },
    { value: 'order', label: 'Order Update', description: 'Order-related notifications' },
    { value: 'delivery', label: 'Delivery', description: 'Delivery updates' },
    { value: 'delivered', label: 'Delivered', description: 'Delivery completion' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !message.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    if (sendTo === 'specific' && !targetOrderId.trim()) {
      toast.error('Please provide an Order ID');
      return;
    }

    setIsLoading(true);

    try {
      let userId: string | undefined = undefined;
      
      // If Order ID is provided, get userId from that order
      if (sendTo === 'specific' && targetOrderId.trim()) {
        const orders = JSON.parse(localStorage.getItem('orders') || '[]');
        const order = orders.find((o: any) => o.id === targetOrderId.trim());
        
        if (!order) {
          toast.error('Order not found. Please check the Order ID.');
          setIsLoading(false);
          return;
        }
        userId = order.userId;
      }

      addNotification({
        title: title.trim(),
        message: message.trim(),
        type,
      }, userId);

      toast.success(
        sendTo === 'all' 
          ? 'Notification sent successfully to all users!' 
          : `Notification sent successfully to user with Order #${targetOrderId}!`
      );
      
      // Reset form
      setTitle('');
      setMessage('');
      setType('announcement');
      setTargetOrderId('');
    } catch (error) {
      console.error('Error sending notification:', error);
      toast.error('Failed to send notification. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Bell className="h-8 w-8 text-amber-600" />
            Send Notifications
          </h1>
          <p className="text-gray-600 mt-2">
            Send notifications to all users. They will receive it instantly on their notification page.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Create Notification</CardTitle>
                <CardDescription>
                  Fill in the details below to send a notification to all users
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="title">Notification Title</Label>
                    <Input
                      id="title"
                      placeholder="e.g., Special Weekend Offer!"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      required
                      maxLength={100}
                    />
                    <p className="text-sm text-gray-500">{title.length}/100 characters</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Message</Label>
                    <Textarea
                      id="message"
                      placeholder="Enter your notification message here..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      required
                      rows={5}
                      maxLength={500}
                      className="resize-none"
                    />
                    <p className="text-sm text-gray-500">{message.length}/500 characters</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="type">Notification Type</Label>
                    <Select value={type} onValueChange={(value) => setType(value as NotificationType)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select notification type" />
                      </SelectTrigger>
                      <SelectContent>
                        {notificationTypes.map((notifType) => (
                          <SelectItem key={notifType.value} value={notifType.value}>
                            <div>
                              <div className="font-medium">{notifType.label}</div>
                              <div className="text-xs text-gray-500">{notifType.description}</div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="sendTo">Send To</Label>
                    <Select value={sendTo} onValueChange={(value) => setSendTo(value as 'all' | 'specific')}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select recipients" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Users</SelectItem>
                        <SelectItem value="specific">Specific User</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {sendTo === 'specific' && (
                    <div className="space-y-2 p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <Label htmlFor="orderId">Order ID</Label>
                      <Input
                        id="orderId"
                        placeholder="Enter order ID (e.g., 1733364728432136)"
                        value={targetOrderId}
                        onChange={(e) => setTargetOrderId(e.target.value)}
                        required
                      />
                      <p className="text-xs text-gray-600">
                        Enter the Order ID to send notification to the customer who placed that order
                      </p>
                    </div>
                  )}

                  <Button
                    type="submit"
                    className="w-full bg-amber-600 hover:bg-amber-700"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        {sendTo === 'all' ? 'Send Notification to All Users' : 'Send Notification to User'}
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-1">
            <Card className="bg-blue-50 border-blue-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-900">
                  <AlertCircle className="h-5 w-5" />
                  Important Notes
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm text-blue-800">
                <div>
                  <h4 className="font-semibold mb-1">Real-time Delivery</h4>
                  <p>Notifications are delivered instantly to all users in real-time.</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Notification Types</h4>
                  <p>Choose the appropriate type to help users identify the notification quickly.</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Best Practices</h4>
                  <ul className="list-disc list-inside space-y-1 mt-1">
                    <li>Keep titles short and clear</li>
                    <li>Be specific in messages</li>
                    <li>Use appropriate notification types</li>
                    <li>Avoid sending too many notifications</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminNotificationsPage;
