import { motion } from 'motion/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { CheckCircle, Download, Share2, Clock, MapPin } from 'lucide-react';
import { useEffect, useRef } from 'react';

interface QRCodeDisplayProps {
  orderData: {
    orderId: string;
    customerName: string;
    roomNumber: string;
    items: Array<{ name: string; quantity: number; price: number }>;
    totalAmount: number;
    orderType: 'regular' | 'monthly';
    estimatedDelivery?: string;
    status: 'confirmed' | 'preparing' | 'ready' | 'delivered';
  };
  onClose: () => void;
}

export function QRCodeDisplay({ orderData, onClose }: QRCodeDisplayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Generate QR Code using canvas (simple implementation)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = 200;
    canvas.height = 200;

    // Create a simple QR-like pattern (in production, use a proper QR library)
    const qrData = JSON.stringify({
      orderId: orderData.orderId,
      customer: orderData.customerName,
      room: orderData.roomNumber,
      total: orderData.totalAmount,
      type: orderData.orderType
    });

    // Fill background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, 200, 200);

    // Create grid pattern to simulate QR code
    ctx.fillStyle = '#000000';
    const gridSize = 10;
    const hash = qrData.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);

    for (let x = 0; x < 20; x++) {
      for (let y = 0; y < 20; y++) {
        const seed = Math.abs(hash + x * 31 + y * 37);
        if (seed % 3 === 0) {
          ctx.fillRect(x * gridSize, y * gridSize, gridSize, gridSize);
        }
      }
    }

    // Add corner squares (typical QR code feature)
    const cornerSize = 30;
    [[0, 0], [170, 0], [0, 170]].forEach(([x, y]) => {
      ctx.fillStyle = '#000000';
      ctx.fillRect(x, y, cornerSize, cornerSize);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(x + 5, y + 5, cornerSize - 10, cornerSize - 10);
      ctx.fillStyle = '#000000';
      ctx.fillRect(x + 10, y + 10, cornerSize - 20, cornerSize - 20);
    });
  }, [orderData]);

  const downloadQR = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const link = document.createElement('a');
    link.download = `SR-GuestHouse-Order-${orderData.orderId}.png`;
    link.href = canvas.toDataURL();
    link.click();
  };

  const shareOrder = () => {
    if (navigator.share) {
      navigator.share({
        title: 'SR Guest House Order',
        text: `Order ${orderData.orderId} confirmed for ₹${orderData.totalAmount}`,
        url: window.location.href
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(`Order ${orderData.orderId} - ₹${orderData.totalAmount} - Room ${orderData.roomNumber}`);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-blue-500';
      case 'preparing': return 'bg-yellow-500';
      case 'ready': return 'bg-green-500';
      case 'delivered': return 'bg-gray-500';
      default: return 'bg-blue-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'confirmed': return 'Order Confirmed';
      case 'preparing': return 'Being Prepared';
      case 'ready': return 'Ready for Delivery';
      case 'delivered': return 'Delivered';
      default: return 'Order Confirmed';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="w-full max-w-md"
      >
        <Card className="bg-card/95 backdrop-blur-sm border-border/50">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <CheckCircle className="h-6 w-6 text-green-500" />
              <CardTitle>Order Confirmed!</CardTitle>
            </div>
            <CardDescription>
              {orderData.orderType === 'monthly' ? 'Monthly Subscription Active' : 'Show this QR code to the delivery person'}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Order Status */}
            <div className="flex items-center justify-center gap-2">
              <div className={`w-3 h-3 rounded-full ${getStatusColor(orderData.status)}`}></div>
              <Badge variant="secondary">{getStatusText(orderData.status)}</Badge>
            </div>

            {/* QR Code */}
            <div className="flex justify-center">
              <div className="p-4 bg-white rounded-lg shadow-inner">
                <canvas 
                  ref={canvasRef}
                  className="border border-gray-200 rounded"
                />
              </div>
            </div>

            {/* Order Details */}
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Order ID:</span>
                <span className="font-mono">{orderData.orderId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Customer:</span>
                <span>{orderData.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Room:</span>
                <span>{orderData.roomNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Amount:</span>
                <span className="font-bold">₹{orderData.totalAmount}</span>
              </div>
              {orderData.estimatedDelivery && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Estimated Delivery:</span>
                  <span>{orderData.estimatedDelivery}</span>
                </div>
              )}
              {orderData.orderType === 'monthly' && (
                <div className="bg-muted/50 p-3 rounded-lg">
                  <p className="text-xs text-muted-foreground">
                    Monthly subscription valid until next billing cycle. Use this QR for daily meal verification.
                  </p>
                </div>
              )}
            </div>

            {/* Order Items */}
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Order Items:</h4>
              <div className="bg-muted/30 rounded-lg p-3 space-y-1">
                {orderData.items.map((item, index) => (
                  <div key={index} className="flex justify-between text-xs">
                    <span>{item.name} x{item.quantity}</span>
                    <span>₹{item.price * item.quantity}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button variant="outline" onClick={downloadQR} className="flex-1">
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
              <Button variant="outline" onClick={shareOrder} className="flex-1">
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
            </div>

            <Button onClick={onClose} className="w-full">
              Continue Shopping
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}