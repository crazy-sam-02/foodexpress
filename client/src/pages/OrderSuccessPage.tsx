import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Download, Home, Package, MapPin, Truck } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';

interface OrderData {
  orderId: string;
  items: any[];
  delivery: any;
  payment: string;
  total: number;
  subtotal: number;
  tax: number;
  shipping: number;
}

const OrderSuccessPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [orderData, setOrderData] = useState<OrderData | null>(null);

  useEffect(() => {
    const data = location.state?.orderData;
    if (!data) {
      // If no order data, redirect to home
      navigate('/', { replace: true });
      return;
    }
    setOrderData(data);
  }, [location.state, navigate]);

  if (!orderData) {
    return null;
  }

  const { orderId, items, delivery, payment, total, subtotal, tax, shipping } = orderData;

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Success Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <CheckCircle className="h-16 w-16 text-green-500" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Successful!</h1>
            <p className="text-gray-600">Thank you for your order. We'll start preparing it right away.</p>
          </div>

          {/* Order ID Card */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-2">Your Order ID</p>
                <div className="text-2xl font-mono font-bold text-primary bg-primary/10 rounded-lg py-3 px-6 inline-block">
                  #{orderId.slice(-6)}
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  Please save this order ID for tracking your order
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Order Details */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Order Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Items */}
              <div className="space-y-3">
                {items.map((item: any) => (
                  <div key={item.product._id} className="flex gap-3 pb-3 border-b last:border-b-0">
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      className="w-12 h-12 object-cover rounded"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">{item.product.name}</p>
                      <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                    </div>
                    <p className="font-medium text-sm">₹{(item.product.price * item.quantity).toFixed(2)}</p>
                  </div>
                ))}
              </div>

              {/* Pricing */}
              <div className="space-y-2 pt-4 border-t">
                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span>₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Tax</span>
                  <span>₹{tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <Truck className="h-4 w-4" />
                    Delivery
                  </span>
                  <span>
                    {shipping === 0 ? (
                      <Badge className="bg-green-100 text-green-800">Free</Badge>
                    ) : (
                      `₹${shipping.toFixed(2)}`
                    )}
                  </span>
                </div>
                <div className="flex justify-between font-semibold text-lg pt-2 border-t">
                  <span>Total</span>
                  <span>₹{total.toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Delivery Information */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Delivery Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="font-medium">{delivery.firstName} {delivery.lastName}</p>
                <p className="text-sm text-gray-600">{delivery.email}</p>
                <p className="text-sm text-gray-600">{delivery.phone}</p>
                <div className="text-sm text-gray-600">
                  <p>{delivery.address}</p>
                  <p>{delivery.city}, {delivery.state} {delivery.zipCode}</p>
                </div>
                {delivery.deliveryNotes && (
                  <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm font-medium text-gray-700">Delivery Notes:</p>
                    <p className="text-sm text-gray-600">{delivery.deliveryNotes}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Payment Method */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-lg">💵</span>
                Payment Method
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <span className="text-lg">💵</span>
                <span>Cash on Delivery</span>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Button asChild className="flex-1">
              <Link to="/">
                <Home className="h-4 w-4 mr-2" />
                Continue Shopping
              </Link>
            </Button>
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={() => window.print()}
            >
              <Download className="h-4 w-4 mr-2" />
              Print Receipt
            </Button>
          </div>

          {/* Additional Info */}
          <div className="mt-8 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-medium text-blue-900 mb-2">What's Next?</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• You will receive an email confirmation shortly</li>
              <li>• We'll start preparing your order within 30 minutes</li>
              <li>• Estimated delivery time: 45-60 minutes</li>
              <li>• You can track your order using the Order ID above</li>
            </ul>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default OrderSuccessPage;