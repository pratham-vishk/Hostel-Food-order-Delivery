import { useState } from 'react';
import { CartItem, UserDetails } from '../App';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Separator } from './ui/separator';
import { ScrollArea } from './ui/scroll-area';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Clock, MapPin, Phone, User } from 'lucide-react';

interface OrderFormProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  totalPrice: number;
  onSubmit: (userDetails: UserDetails) => void;
  isLoading?: boolean;
}

export function OrderForm({ isOpen, onClose, cartItems, totalPrice, onSubmit, isLoading = false }: OrderFormProps) {
  const [userDetails, setUserDetails] = useState<UserDetails>({
    name: '',
    roomNumber: '',
    phoneNumber: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userDetails.name || !userDetails.roomNumber || !userDetails.phoneNumber) {
      alert('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    onSubmit(userDetails);
    setIsSubmitting(false);
    
    // Reset form
    setUserDetails({
      name: '',
      roomNumber: '',
      phoneNumber: ''
    });
  };

  const handleInputChange = (field: keyof UserDetails, value: string) => {
    setUserDetails(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const getTotalItems = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  const estimatedDeliveryTime = new Date(Date.now() + 30 * 60 * 1000).toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Confirm Your Order</DialogTitle>
          <DialogDescription>
            Please provide your details to complete the order
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-full pr-4">
            <div className="space-y-6">
              {/* User Details Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Full Name *
                    </Label>
                    <Input
                      id="name"
                      type="text"
                      placeholder="Enter your full name"
                      value={userDetails.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="roomNumber" className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      Room Number *
                    </Label>
                    <Input
                      id="roomNumber"
                      type="text"
                      placeholder="e.g., A-101, B-205"
                      value={userDetails.roomNumber}
                      onChange={(e) => handleInputChange('roomNumber', e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phoneNumber" className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    Phone Number *
                  </Label>
                  <Input
                    id="phoneNumber"
                    type="tel"
                    placeholder="Enter your phone number"
                    value={userDetails.phoneNumber}
                    onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                    required
                  />
                </div>
              </form>

              <Separator />

              {/* Delivery Information */}
              <div className="bg-muted/50 p-4 rounded-lg">
                <h3 className="font-medium mb-2 flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Delivery Information
                </h3>
                <div className="space-y-1 text-sm text-muted-foreground">
                  <p>Estimated delivery time: <span className="font-medium text-foreground">{estimatedDeliveryTime}</span></p>
                  <p>Delivery location: Your guest house room</p>
                  <p>Delivery fee: <span className="text-green-600 font-medium">Free</span></p>
                </div>
              </div>

              {/* Order Summary */}
              <div>
                <h3 className="font-medium mb-4">Order Summary ({getTotalItems()} items)</h3>
                <div className="space-y-3">
                  {cartItems.map(item => (
                    <div key={item.id} className="flex gap-3 p-3 bg-card rounded-lg border">
                      <ImageWithFallback
                        src={item.image}
                        alt={item.name}
                        className="w-12 h-12 object-cover rounded-md flex-shrink-0"
                      />
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">{item.name}</h4>
                        <div className="flex justify-between items-center mt-1">
                          <span className="text-sm text-muted-foreground">Qty: {item.quantity}</span>
                          <span className="text-sm font-medium">₹{item.price * item.quantity}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Price Breakdown */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>₹{totalPrice}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Delivery Fee</span>
                  <span className="text-green-600">Free</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Taxes & Fees</span>
                  <span>₹0</span>
                </div>
                <Separator />
                <div className="flex justify-between font-medium text-lg">
                  <span>Total Amount</span>
                  <span>₹{totalPrice}</span>
                </div>
              </div>
            </div>
          </ScrollArea>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4 border-t">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            className="flex-1"
            disabled={isSubmitting || isLoading || !userDetails.name || !userDetails.roomNumber || !userDetails.phoneNumber}
          >
            {(isSubmitting || isLoading) ? 'Placing Order...' : `Place Order (₹${totalPrice})`}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}