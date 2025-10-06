import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '@/contexts/CartContext';
import { useOrders } from '@/contexts/OrdersContext';
import { useUser } from '@/contexts/UserContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, CreditCard, Truck, MapPin, Phone } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { toast } from 'sonner';

const CheckoutPage = () => {
  const { cartItems, clearCart, getCartTotal } = useCart();
  const { addOrder } = useOrders();
  const { user } = useUser();
  const navigate = useNavigate();
  const [deliveryInfo, setDeliveryInfo] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    deliveryNotes: ''
  });
  const [paymentMethod, setPaymentMethod] = useState('card');

  const subtotal = getCartTotal();
  const tax = subtotal * 0.08;
  const shipping = subtotal > 50 ? 0 : 5.99;
  const total = subtotal + tax + shipping;

  const handleInputChange = (field: string, value: string) => {
    setDeliveryInfo(prev => ({ ...prev, [field]: value }));
  };

  const generateOrderId = () => {
    // Generate a unique 4+ digit order ID using timestamp and random number
    const timestamp = Date.now().toString().slice(-6); // Last 6 digits of timestamp
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0'); // 3 random digits
    return timestamp + random; // Results in a 9-digit unique ID
  };

  const handlePlaceOrder = () => {
    // Validate required fields
    const requiredFields = ['firstName', 'lastName', 'email', 'phone', 'address', 'city', 'state', 'zipCode'];
    const missingFields = requiredFields.filter(field => !deliveryInfo[field]);

    if (missingFields.length > 0) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (cartItems.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    // Generate unique order ID
    const orderId = generateOrderId();

    // Create order object for persistence
    const orderForPersistence = {
      userId: user?.id || 'guest',
      items: cartItems,
      total,
      status: 'pending' as const,
      orderDate: new Date().toISOString(),
      deliveryAddress: `${deliveryInfo.address}, ${deliveryInfo.city}, ${deliveryInfo.state} ${deliveryInfo.zipCode}`,
      notes: deliveryInfo.deliveryNotes,
      paymentMethod: paymentMethod as 'cash' | 'card' | 'paypal' | 'upi'
    };

    // Save order to context/localStorage
    addOrder(orderForPersistence);

    // Prepare order data for success page
    const orderData = {
      orderId,
      items: cartItems,
      delivery: deliveryInfo,
      payment: paymentMethod,
      total,
      subtotal,
      tax,
      shipping
    };

    // Show success toast
    toast.success('Order placed successfully! Redirecting to order confirmation...');
    
    // Clear cart
    clearCart();
    
    // Navigate to success page with order data
    navigate('/order-success', { 
      state: { orderData },
      replace: true 
    });

    // Log for debugging
    console.log('Order Details:', orderData);
  };

  if (cartItems.length === 0) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16">
          <div className="text-center max-w-md mx-auto">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Checkout</h1>
            <p className="text-gray-600 mb-8">Your cart is empty. Add some items before checking out.</p>
            <Button asChild className="bg-amber-600 hover:bg-amber-700">
              <Link to="/products">
                Continue Shopping
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
        <div className="mb-8">
          <Button variant="ghost" asChild className="mb-4">
            <Link to="/cart">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Cart
            </Link>
          </Button>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Checkout</h1>
          <p className="text-gray-600">Complete your order information</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Delivery Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Delivery Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input
                      id="firstName"
                      value={deliveryInfo.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      placeholder="Enter your first name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input
                      id="lastName"
                      value={deliveryInfo.lastName}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
                      placeholder="Enter your last name"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={deliveryInfo.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="Enter your email"
                  />
                </div>

                <div>
                  <Label htmlFor="phone" className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    Phone Number *
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={deliveryInfo.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="Enter your phone number"
                  />
                </div>

                <div>
                  <Label htmlFor="address">Street Address *</Label>
                  <Input
                    id="address"
                    value={deliveryInfo.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    placeholder="Enter your street address"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="city">City *</Label>
                    <Input
                      id="city"
                      value={deliveryInfo.city}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                      placeholder="City"
                    />
                  </div>
                  <div>
                    <Label htmlFor="state">State *</Label>
                    <Input
                      id="state"
                      value={deliveryInfo.state}
                      onChange={(e) => handleInputChange('state', e.target.value)}
                      placeholder="State"
                    />
                  </div>
                  <div>
                    <Label htmlFor="zipCode">ZIP Code *</Label>
                    <Input
                      id="zipCode"
                      value={deliveryInfo.zipCode}
                      onChange={(e) => handleInputChange('zipCode', e.target.value)}
                      placeholder="ZIP"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="deliveryNotes">Delivery Notes (Optional)</Label>
                  <Textarea
                    id="deliveryNotes"
                    value={deliveryInfo.deliveryNotes}
                    onChange={(e) => handleInputChange('deliveryNotes', e.target.value)}
                    placeholder="Special delivery instructions..."
                    className="min-h-[80px]"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Payment Method */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Payment Method
                </CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                  <div className="flex items-center space-x-2 p-4 border rounded-lg">
                    <RadioGroupItem value="card" id="card" />
                    <Label htmlFor="card" className="flex-1 cursor-pointer">
                      <div className="flex items-center gap-2">
                        <CreditCard className="h-4 w-4" />
                        Credit/Debit Card
                      </div>
                      <p className="text-sm text-gray-600">Pay securely with your card</p>
                    </Label>
                  </div>
                  
                  <div className="flex items-center space-x-2 p-4 border rounded-lg">
                    <RadioGroupItem value="cash" id="cash" />
                    <Label htmlFor="cash" className="flex-1 cursor-pointer">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">💵</span>
                        Cash on Delivery
                      </div>
                      <p className="text-sm text-gray-600">Pay when your order arrives</p>
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2 p-4 border rounded-lg">
                    <RadioGroupItem value="paypal" id="paypal" />
                    <Label htmlFor="paypal" className="flex-1 cursor-pointer">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">🅿️</span>
                        PayPal
                      </div>
                      <p className="text-sm text-gray-600">Pay with your PayPal account</p>
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2 p-4 border rounded-lg">
                    <RadioGroupItem value="upi" id="upi" />
                    <Label htmlFor="upi" className="flex-1 cursor-pointer">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">📱</span>
                        UPI Payment
                      </div>
                      <p className="text-sm text-gray-600">Pay using UPI apps</p>
                    </Label>
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div>
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Cart Items */}
                <div className="space-y-3">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex gap-3">
                      <img
                        src={item.product.image}
                        alt={item.product.name}
                        className="w-12 h-12 object-cover rounded"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{item.product.name}</p>
                        <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                      </div>
                      <p className="font-medium text-sm">${(item.product.price * item.quantity).toFixed(2)}</p>
                    </div>
                  ))}
                </div>

                <hr />

                {/* Pricing Breakdown */}
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax</span>
                    <span>${tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="flex items-center gap-2">
                      <Truck className="h-4 w-4" />
                      Delivery
                    </span>
                    <span>
                      {shipping === 0 ? (
                        <Badge className="bg-green-100 text-green-800">Free</Badge>
                      ) : (
                        `$${shipping.toFixed(2)}`
                      )}
                    </span>
                  </div>
                  {shipping > 0 && (
                    <p className="text-sm text-gray-600">
                      Free delivery on orders over $50
                    </p>
                  )}
                </div>

                <hr />

                <div className="flex justify-between font-semibold text-lg">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>

                <Button 
                  className="w-full bg-amber-600 hover:bg-amber-700"
                  onClick={handlePlaceOrder}
                >
                  Place Order
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CheckoutPage;