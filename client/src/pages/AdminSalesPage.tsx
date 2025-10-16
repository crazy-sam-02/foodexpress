import { useState, useMemo } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, TrendingUp, DollarSign, ShoppingBag } from 'lucide-react';
import { useAdminOrders } from '@/contexts/AdminOrdersContext';

const AdminSalesPage = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('daily');
  const { orders } = useAdminOrders();

  const salesData = useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - 7);
    const monthStart = new Date(today);
    monthStart.setDate(today.getDate() - 30);

    const getFilteredOrders = (period: string) => {
      return orders.filter(order => {
        if (order.status === 'cancelled') return false;
        const orderDate = new Date(order.orderDate);
        
        switch (period) {
          case 'daily':
            return orderDate >= today;
          case 'weekly':
            return orderDate >= weekStart;
          case 'monthly':
            return orderDate >= monthStart;
          default:
            return false;
        }
      });
    };

    const calculatePeriodData = (period: string) => {
      const filteredOrders = getFilteredOrders(period);
      const totalSales = filteredOrders.reduce((sum, order) => sum + order.total, 0);
      const totalOrders = filteredOrders.length;
      const avgOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;

      // Calculate top products
      const productSales: Record<string, { sales: number; revenue: number }> = {};
      filteredOrders.forEach(order => {
        order.items.forEach(item => {
          if (!productSales[item.product.name]) {
            productSales[item.product.name] = { sales: 0, revenue: 0 };
          }
          productSales[item.product.name].sales += item.quantity;
          productSales[item.product.name].revenue += item.product.price * item.quantity;
        });
      });

      const topProducts = Object.entries(productSales)
        .map(([name, data]) => ({ name, ...data }))
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 3);

      return {
        totalSales,
        totalOrders,
        avgOrderValue,
        topProducts
      };
    };

    return {
      daily: calculatePeriodData('daily'),
      weekly: calculatePeriodData('weekly'),
      monthly: calculatePeriodData('monthly')
    };
  }, [orders]);

  const currentData = salesData[selectedPeriod as keyof typeof salesData];

  const recentOrders = useMemo(() => {
    return orders
      .slice(-5)
      .reverse()
      .map(order => ({
        id: `#${order.id}`,
        customer: `Customer ${order.userId}`,
        items: order.items.reduce((sum, item) => sum + item.quantity, 0),
        total: order.total,
        status: order.status,
        time: new Date(order.orderDate).toLocaleString()
      }));
  }, [orders]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'preparing': return 'bg-blue-100 text-blue-800';
      case 'confirmed': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Sales Overview</h1>
            <p className="text-gray-600 mt-2">Track your bakery's performance and revenue</p>
          </div>
          <div className="flex gap-2">
            {['daily', 'weekly', 'monthly'].map((period) => (
              <Button
                key={period}
                variant={selectedPeriod === period ? "default" : "outline"}
                onClick={() => setSelectedPeriod(period)}
                className={selectedPeriod === period ? "bg-amber-600 hover:bg-amber-700" : ""}
              >
                <Calendar className="h-4 w-4 mr-2" />
                {period.charAt(0).toUpperCase() + period.slice(1)}
              </Button>
            ))}
          </div>
        </div>

        {/* Sales Stats */}
        {orders.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <div className="flex flex-col items-center gap-4">
                <div className="p-4 bg-gray-100 rounded-full">
                  <ShoppingBag className="h-8 w-8 text-gray-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Orders Yet</h3>
                  <p className="text-gray-600">Sales data will appear here once customers start placing orders.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-100 rounded-lg">
                  <DollarSign className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Sales</p>
                  <p className="text-2xl font-bold text-gray-900">
                    ₹{currentData.totalSales.toLocaleString()}
                  </p>
                  <p className="text-sm text-green-600">
                    {selectedPeriod === 'daily' ? 'Today' : 
                     selectedPeriod === 'weekly' ? 'This week' : 'This month'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <ShoppingBag className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Orders</p>
                  <p className="text-2xl font-bold text-gray-900">{currentData.totalOrders}</p>
                  <p className="text-sm text-blue-600">Orders completed</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Avg Order Value</p>
                  <p className="text-2xl font-bold text-gray-900">
                    ₹{currentData.avgOrderValue.toFixed(2)}
                  </p>
                  <p className="text-sm text-purple-600">Per order</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Products */}
          <Card>
            <CardHeader>
              <CardTitle>Top Selling Products</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {currentData.topProducts.map((product, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center text-amber-600 font-semibold">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{product.name}</p>
                        <p className="text-sm text-gray-500">{product.sales} sold</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">₹{product.revenue.toFixed(2)}</p>
                      <p className="text-sm text-gray-500">Revenue</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Orders */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium text-gray-900">{order.id}</p>
                        <Badge className={getStatusColor(order.status)}>
                          {order.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">{order.customer}</p>
                      <p className="text-sm text-gray-500">{order.time}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">₹{order.total}</p>
                      <p className="text-sm text-gray-500">{order.items} items</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminSalesPage;