import { Link } from 'react-router-dom';
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Minus, Plus, X, ShoppingCart } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';

const CartPage = () => {
  const { cartItems, updateQuantity, removeFromCart } = useCart();

  const handleUpdateQuantity = (itemId: string | number, newQuantity: number) => {
    updateQuantity(itemId, newQuantity);
  };

  const handleRemoveItem = (itemId: string | number) => {
    removeFromCart(itemId);
  };

  const subtotal = cartItems.reduce((sum, item) => sum + ((item.price ?? item.product.price) * item.quantity), 0);
  const tax = subtotal * 0.08; // 8% tax
  const shipping = subtotal > 500 ? 0 : 50; // Free shipping over ₹500
  const total = subtotal + tax + shipping;

  if (cartItems.length === 0) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16">
          <div className="text-center max-w-md mx-auto">
            <ShoppingCart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Your Cart is Empty</h1>
            <p className="text-gray-600 mb-8">
              Looks like you haven't added any items to your cart yet.
            </p>
            <Button asChild className="bg-amber-600 hover:bg-amber-700">
              <Link to="/products">
                Start Shopping
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
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Shopping Cart</h1>
          <p className="text-gray-600">Review your items and proceed to checkout</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Cart Items ({cartItems.length})</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {cartItems.map((item) => (
                  <div key={item.id ?? item.product._id} className="flex items-center gap-4 p-4 border rounded-lg">
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      className="w-20 h-20 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{item.product.name}</h3>
                      <p className="text-sm text-gray-600">{item.product.description}</p>
                      <Badge className="mt-1 bg-amber-100 text-amber-800">
                        {item.product.category}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={() => handleUpdateQuantity(item.id, Math.max(0, item.quantity - 1))}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="w-8 text-center">{item.quantity}</span>
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-lg">₹{((item.price ?? item.product.price) * item.quantity).toFixed(2)}</p>
                      <p className="text-sm text-gray-600">₹{(item.price ?? item.product.price).toFixed(2)} each</p>
                    </div>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleRemoveItem(item.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax</span>
                  <span>₹{tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>
                    {shipping === 0 ? (
                      <Badge className="bg-green-100 text-green-800">Free</Badge>
                    ) : (
                      `₹${shipping.toFixed(2)}`
                    )}
                  </span>
                </div>
                {shipping > 0 && (
                  <p className="text-sm text-gray-600">
                    Free shipping on orders over ₹500
                  </p>
                )}
                <hr />
                <div className="flex justify-between font-semibold text-lg">
                  <span>Total</span>
                  <span>₹{total.toFixed(2)}</span>
                </div>
                <Button className="w-full bg-amber-600 hover:bg-amber-700" asChild>
                  <Link to="/checkout">
                    Proceed to Checkout
                  </Link>
                </Button>
                <Button variant="outline" className="w-full" asChild>
                  <Link to="/products">
                    Continue Shopping
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CartPage;
