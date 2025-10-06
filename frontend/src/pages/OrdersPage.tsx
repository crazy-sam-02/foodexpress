import { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { useOrders } from '@/contexts/OrdersContext';
import { useUser } from '@/contexts/UserContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Order } from '@/types';
import { 
  ShoppingCart, 
  Calendar, 
  MapPin, 
  Clock, 
  Package,
  Truck,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';

const OrdersPage = () => {
  const { orders } = useOrders();
  const { user, isAuthenticated } = useUser();
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Filter orders by current user
  const userOrders = orders.filter(order => 
    order.userId === user?.id
  );

  const filteredOrders = statusFilter === 'all' 
    ? userOrders 
    : userOrders.filter(order => order.status === statusFilter);

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'confirmed': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'preparing': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'ready': return 'bg-green-100 text-green-800 border-green-200';
      case 'delivered': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: Order['status']) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'confirmed': return <CheckCircle className="h-4 w-4" />;
      case 'preparing': return <Package className="h-4 w-4" />;
      case 'ready': return <AlertCircle className="h-4 w-4" />;
      case 'delivered': return <Truck className="h-4 w-4" />;
      case 'cancelled': return <XCircle className="h-4 w-4" />;
      default: return <Package className="h-4 w-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
  };

  if (!isAuthenticated) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16">
          <div className="text-center max-w-md mx-auto">
            <ShoppingCart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-4">My Orders</h1>
            <p className="text-gray-600 mb-8">Please login to view your order history</p>
            <Button asChild className="bg-amber-600 hover:bg-amber-700">
              <Link to="/login">
                Login to View Orders
              </Link>
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
              <p className="text-gray-600 mt-2">Track your orders and view order history</p>
            </div>
            <div className="flex items-center gap-4">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-48 bg-white">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent className="bg-white border shadow-lg z-50">
                  <SelectItem value="all">All Orders</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="preparing">Preparing</SelectItem>
                  <SelectItem value="ready">Ready for Pickup</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Orders List */}
        {filteredOrders.length === 0 ? (
          <div className="text-center py-16">
            <ShoppingCart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No Orders Found</h2>
            <p className="text-gray-600 mb-8">
              {statusFilter === 'all' 
                ? "You haven't placed any orders yet" 
                : `No orders with status "${statusFilter}"`}
            </p>
            <Button asChild className="bg-amber-600 hover:bg-amber-700">
              <Link to="/products">
                Start Shopping
              </Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredOrders.map((order) => {
              const { date, time } = formatDate(order.orderDate);
              return (
                <Card key={order.id} className="overflow-hidden">
                  <CardHeader className="pb-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <ShoppingCart className="h-5 w-5" />
                          Order #{order.id}
                        </CardTitle>
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            <span>{date}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            <span>{time}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge className={`${getStatusColor(order.status)} flex items-center gap-1`}>
                          {getStatusIcon(order.status)}
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </Badge>
                        <div className="text-right">
                          <div className="text-lg font-bold text-gray-900">
                            ${order.total.toFixed(2)}
                          </div>
                          <div className="text-sm text-gray-600">
                            {order.items.reduce((sum, item) => sum + item.quantity, 0)} items
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    {/* Order Items */}
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">Order Items</h4>
                      <div className="space-y-3">
                        {order.items.map((item, index) => (
                          <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                            <img
                              src={item.product.image}
                              alt={item.product.name}
                              className="w-12 h-12 object-cover rounded"
                            />
                            <div className="flex-1">
                              <p className="font-medium text-gray-900">{item.product.name}</p>
                              <p className="text-sm text-gray-600">
                                Quantity: {item.quantity} × ${item.product.price.toFixed(2)}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-medium text-gray-900">
                                ${(item.product.price * item.quantity).toFixed(2)}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Delivery Information */}
                    <div className="border-t pt-4">
                      <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        Delivery Address
                      </h4>
                      <p className="text-gray-600">{order.deliveryAddress}</p>
                      {order.notes && (
                        <div className="mt-2">
                          <p className="text-sm text-gray-600">
                            <strong>Notes:</strong> {order.notes}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Order Status Timeline */}
                    <div className="border-t pt-4">
                      <h4 className="font-medium text-gray-900 mb-3">Order Status</h4>
                      <div className="flex items-center gap-2 text-sm">
                        <div className={`p-2 rounded-full ${
                          ['pending', 'confirmed', 'preparing', 'ready', 'delivered'].includes(order.status) 
                            ? 'bg-green-100 text-green-600' 
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                          {getStatusIcon(order.status)}
                        </div>
                        <div>
                          <p className="font-medium">
                            {order.status === 'pending' && 'Order Received'}
                            {order.status === 'confirmed' && 'Order Confirmed'}
                            {order.status === 'preparing' && 'Being Prepared'}
                            {order.status === 'ready' && 'Ready for Pickup/Delivery'}
                            {order.status === 'delivered' && 'Order Delivered'}
                            {order.status === 'cancelled' && 'Order Cancelled'}
                          </p>
                          <p className="text-gray-600">
                            {order.status === 'pending' && 'We have received your order and will confirm it soon.'}
                            {order.status === 'confirmed' && 'Your order has been confirmed and is being prepared.'}
                            {order.status === 'preparing' && 'Our team is preparing your delicious order.'}
                            {order.status === 'ready' && 'Your order is ready! We will deliver it soon.'}
                            {order.status === 'delivered' && 'Your order has been successfully delivered.'}
                            {order.status === 'cancelled' && 'This order has been cancelled.'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default OrdersPage;