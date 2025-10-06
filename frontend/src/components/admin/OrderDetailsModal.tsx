import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Order } from '@/types';
import { Calendar, MapPin, Package, User, Phone, Mail, CreditCard } from 'lucide-react';

interface OrderDetailsModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
}

export const OrderDetailsModal = ({ order, isOpen, onClose }: OrderDetailsModalProps) => {
  if (!order) return null;

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'preparing': return 'bg-orange-100 text-orange-800';
      case 'ready': return 'bg-green-100 text-green-800';
      case 'delivered': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Order Details - #{order.id}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Order Status & Basic Info */}
          <div className="flex items-center justify-between">
            <Badge className={getStatusColor(order.status)} variant="secondary">
              {order.status.toUpperCase()}
            </Badge>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Calendar className="h-4 w-4" />
              {new Date(order.orderDate).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </div>
          </div>

          <Separator />

          {/* Customer Information */}
          <div className="space-y-3">
            <h3 className="font-semibold flex items-center gap-2">
              <User className="h-4 w-4" />
              Customer Information
            </h3>
            <div className="bg-gray-50 p-4 rounded-lg space-y-2">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-gray-500" />
                <span className="text-sm">Customer ID: {order.userId}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-gray-500" />
                <span className="text-sm">{order.deliveryAddress}</span>
              </div>
              {order.notes && (
                <div className="flex items-start gap-2">
                  <Mail className="h-4 w-4 text-gray-500 mt-0.5" />
                  <div>
                    <span className="text-sm font-medium">Notes:</span>
                    <p className="text-sm text-gray-600">{order.notes}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Order Items */}
          <div className="space-y-3">
            <h3 className="font-semibold flex items-center gap-2">
              <Package className="h-4 w-4" />
              Order Items ({order.items.length} items)
            </h3>
            <div className="space-y-3">
              {order.items.map((item, index) => (
                <div key={index} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                  <div className="w-16 h-16 bg-gray-200 rounded-lg flex-shrink-0 overflow-hidden">
                    <img 
                      src={item.product.image} 
                      alt={item.product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{item.product.name}</h4>
                    <p className="text-sm text-gray-600 line-clamp-2">{item.product.description}</p>
                    <div className="flex items-center gap-4 mt-1">
                      <span className="text-sm text-gray-500">Qty: {item.quantity}</span>
                      <span className="text-sm font-medium">${item.product.price.toFixed(2)} each</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">${(item.product.price * item.quantity).toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Order Summary */}
          <div className="space-y-3">
            <h3 className="font-semibold">Order Summary</h3>
            <div className="bg-gray-50 p-4 rounded-lg space-y-2">
              <div className="flex justify-between text-sm">
                <span>Subtotal:</span>
                <span>${order.total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Delivery Fee:</span>
                <span>$0.00</span>
              </div>
              <Separator />
              <div className="flex justify-between font-semibold">
                <span>Total:</span>
                <span>${order.total.toFixed(2)}</span>
              </div>
              {order.paymentMethod && (
                <>
                  <Separator />
                  <div className="flex justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4 text-gray-500" />
                      <span>Payment Method:</span>
                    </div>
                    <span className="capitalize font-medium">{order.paymentMethod}</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Delivery Information */}
          {order.deliveryDate && (
            <>
              <Separator />
              <div className="space-y-3">
                <h3 className="font-semibold">Delivery Information</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">
                      Expected Delivery: {new Date(order.deliveryDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Actions */}
          <div className="flex justify-end pt-4">
            <Button onClick={onClose} variant="outline">
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};