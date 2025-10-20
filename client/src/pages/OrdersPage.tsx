import { useOrders } from '@/contexts/OrdersContext';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { useUser } from '@/contexts/UserContext';

const OrdersPage = () => {
  const { orders, isLoading, refreshOrders } = useOrders();
  const { user } = useUser();

  const handleRefresh = async () => {
    await refreshOrders();
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Your Orders</h1>
          {user && (
            <Button 
              variant="outline" 
              onClick={handleRefresh}
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          )}
        </div>
        
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <div className="w-8 h-8 border-4 border-amber-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">Loading your orders...</p>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {orders.length > 0 ? (
              orders.map(order => (
                <Card key={order.id}>
                  <CardHeader className="flex flex-row justify-between items-center">
                    <CardTitle>Order #{order.id}</CardTitle>
                    <Badge>{order.status}</Badge>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4">
                    <div>
                      <h3 className="font-semibold">Order Details</h3>
                      <p><strong>Order Date:</strong> {new Date(order.orderDate).toLocaleDateString()}</p>
                      <p><strong>Total:</strong> ₹{order.total.toFixed(2)}</p>
                      <p><strong>Payment Method:</strong> Cash on Delivery</p>
                      <p><strong>Delivery Address:</strong> {order.deliveryAddress}</p>
                      {order.trackingNumber && (
                        <p><strong>Tracking Number:</strong> {order.trackingNumber}</p>
                      )}
                      {order.estimatedDelivery && (
                        <p><strong>Estimated Delivery:</strong> {new Date(order.estimatedDelivery).toLocaleDateString()}</p>
                      )}
                      {order.notes && (
                        <p><strong>Notes:</strong> {order.notes}</p>
                      )}
                    </div>
                      <div>
                        <h3 className="font-semibold">Items</h3>
                        <ul className="space-y-2">
                          {order.items.map(item => (
                            <li key={item.product._id} className="flex justify-between">
                              <span>{item.product.name} (x{item.quantity})</span>
                              <span>₹{(item.product.price * item.quantity).toFixed(2)}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-600 text-lg">You have no orders yet.</p>
                <p className="text-gray-500 mt-2">Start shopping to see your orders here!</p>
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default OrdersPage;
