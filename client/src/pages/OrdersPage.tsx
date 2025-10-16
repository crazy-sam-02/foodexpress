import { useOrders } from '@/contexts/OrdersContext';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const OrdersPage = () => {
  const { orders } = useOrders();

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Your Orders</h1>
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
                      <p><strong>Payment Method:</strong> {order.paymentMethod}</p>
                      <p><strong>Delivery Address:</strong> {order.deliveryAddress}</p>
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
            <p>You have no orders.</p>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default OrdersPage;
