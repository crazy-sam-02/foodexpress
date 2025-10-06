import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { OrderDetailsModal } from '@/components/admin/OrderDetailsModal';
import { Package, ShoppingCart, TrendingUp, Users } from 'lucide-react';
import { useProducts } from '@/contexts/ProductsContext';
import { useOrders } from '@/contexts/OrdersContext';
import { Order } from '@/types';

const AdminDashboard = () => {
  const { products, categories } = useProducts();
  const { orders, getTotalSales, getTodaysSales, getPendingOrdersCount } = useOrders();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const totalProducts = products.length;
  const inStockProducts = products.filter(p => p.inStock).length;
  const totalCategories = categories.length;
  
  // Real data from orders
  const totalSales = getTotalSales();
  const todaysSales = getTodaysSales();
  const totalOrders = orders.length;
  const pendingOrdersCount = getPendingOrdersCount();

  const stats = [
    {
      title: 'Total Products',
      value: totalProducts,
      subtitle: `${inStockProducts} in stock`,
      icon: Package,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      title: 'Total Sales',
      value: `$${totalSales.toLocaleString()}`,
      subtitle: `$${todaysSales} today`,
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      title: 'Total Orders',
      value: totalOrders,
      subtitle: `${pendingOrdersCount} pending`,
      icon: ShoppingCart,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
    {
      title: 'Categories',
      value: totalCategories,
      subtitle: 'All active',
      icon: Users,
      color: 'text-amber-600',
      bgColor: 'bg-amber-100'
    },
  ];

  // Get recent orders (last 5 orders)
  const recentOrders = orders
    .sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime())
    .slice(0, 5);

  const handleOrderClick = (order: Order) => {
    setSelectedOrder(order);
    setIsOrderModalOpen(true);
  };

  const getTimeAgo = (dateString: string) => {
    const now = new Date();
    const orderDate = new Date(dateString);
    const diffInMinutes = Math.floor((now.getTime() - orderDate.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes} minutes ago`;
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)} hours ago`;
    } else {
      return `${Math.floor(diffInMinutes / 1440)} days ago`;
    }
  };

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500';
      case 'confirmed': return 'bg-blue-500';
      case 'preparing': return 'bg-orange-500';
      case 'ready': return 'bg-green-500';
      case 'delivered': return 'bg-gray-500';
      case 'cancelled': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2">Welcome back! Here's what's happening with your bakery.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.title}>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                      <Icon className={`h-6 w-6 ${stat.color}`} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                      <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                      <p className="text-sm text-gray-500">{stat.subtitle}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Recent Orders */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentOrders.length === 0 ? (
                  <div className="text-center py-8">
                    <ShoppingCart className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">No recent orders</p>
                  </div>
                ) : (
                  recentOrders.map((order) => (
                    <div 
                      key={order.id} 
                      className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
                      onClick={() => handleOrderClick(order)}
                    >
                      <div className={`w-2 h-2 rounded-full ${getStatusColor(order.status)}`}></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          Order #{order.id} - ${order.total.toFixed(2)}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(order.orderDate).toLocaleString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                      <div className="text-xs text-gray-500 capitalize">
                        {order.status}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                  <h4 className="font-medium text-amber-900 mb-1">Inventory Alert</h4>
                  <p className="text-sm text-amber-700">3 products are running low on stock</p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <h4 className="font-medium text-green-900 mb-1">Sales Update</h4>
                  <p className="text-sm text-green-700">Today's sales are 15% higher than yesterday</p>
                </div>
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h4 className="font-medium text-blue-900 mb-1">New Orders</h4>
                  <p className="text-sm text-blue-700">12 orders are pending confirmation</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Order Details Modal */}
        <OrderDetailsModal 
          order={selectedOrder}
          isOpen={isOrderModalOpen}
          onClose={() => setIsOrderModalOpen(false)}
        />
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;