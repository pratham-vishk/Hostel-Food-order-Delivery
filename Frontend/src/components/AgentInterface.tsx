import { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { 
  Scan, Package, CheckCircle, Clock, MapPin, Phone, User as UserIcon, 
  Camera, QrCode, Truck, AlertCircle, RefreshCw, LogOut
} from 'lucide-react';
import { AuthService, User } from '../services/authService';
import { ApiService } from '../services/apiService';

interface AgentInterfaceProps {
  user: User;
  onLogout: () => void;
}

interface DeliveryOrder {
  orderId: string;
  customerName: string;
  roomNumber: string;
  phone: string;
  items: Array<{ name: string; quantity: number }>;
  totalAmount: number;
  orderType: 'regular' | 'monthly';
  status: 'confirmed' | 'preparing' | 'ready' | 'delivered';
  estimatedDelivery?: string;
  qrCode: string;
  createdAt: string;
}

export function AgentInterface({ user, onLogout }: AgentInterfaceProps) {
  const [activeTab, setActiveTab] = useState('scanner');
  const [pendingDeliveries, setPendingDeliveries] = useState<DeliveryOrder[]>([]);
  const [completedDeliveries, setCompletedDeliveries] = useState<DeliveryOrder[]>([]);
  const [qrInput, setQrInput] = useState('');
  const [scanResult, setScanResult] = useState<any>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isVerifyingOrder, setIsVerifyingOrder] = useState(false);
  const [isConfirmDeliveryOpen, setIsConfirmDeliveryOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<DeliveryOrder | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    todayDeliveries: 0,
    pendingCount: 0,
    totalEarnings: 0
  });

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    loadAgentData();
    const interval = setInterval(loadAgentData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const loadAgentData = async () => {
    setIsLoading(true);
    try {
      // Mock data for agent deliveries
      const mockPendingOrders: DeliveryOrder[] = [
        {
          orderId: 'ORD-001',
          customerName: 'John Doe',
          roomNumber: 'A-101',
          phone: '+91-9876543210',
          items: [
            { name: 'Chicken Biryani', quantity: 1 },
            { name: 'Raita', quantity: 1 }
          ],
          totalAmount: 120,
          orderType: 'regular',
          status: 'ready',
          estimatedDelivery: '12:30 PM',
          qrCode: 'QR-ORD-001-1234567890',
          createdAt: new Date().toISOString()
        },
        {
          orderId: 'ORD-002',
          customerName: 'Jane Smith',
          roomNumber: 'B-205',
          phone: '+91-9876543211',
          items: [
            { name: 'Premium Vegetarian Plan', quantity: 1 }
          ],
          totalAmount: 2400,
          orderType: 'monthly',
          status: 'ready',
          estimatedDelivery: 'Monthly Plan',
          qrCode: 'MONTHLY-QR-002-1234567891',
          createdAt: new Date().toISOString()
        }
      ];

      setPendingDeliveries(mockPendingOrders);
      
      setStats({
        todayDeliveries: 5,
        pendingCount: mockPendingOrders.length,
        totalEarnings: 450
      });

      // In production, this would fetch from backend:
      // const response = await fetch(`/api/delivery/agent/${user.id}/orders`);
      // const data = await response.json();
      // setPendingDeliveries(data.pending);
      // setCompletedDeliveries(data.completed);
      // setStats(data.stats);

    } catch (error) {
      console.error('Failed to load agent data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQRScan = async () => {
    if (!qrInput.trim()) {
      alert('Please enter a QR code');
      return;
    }

    setIsVerifyingOrder(true);
    try {
      const result = await AuthService.verifyQRCode(qrInput, user.id);
      setScanResult(result);
      
      if (result.valid) {
        // Find the order in pending deliveries
        const order = pendingDeliveries.find(o => o.qrCode === qrInput);
        if (order) {
          setSelectedOrder(order);
          setIsConfirmDeliveryOpen(true);
        }
      }
    } catch (error) {
      console.error('QR verification failed:', error);
      setScanResult({
        valid: false,
        message: 'Failed to verify QR code. Please try again.'
      });
    } finally {
      setIsVerifyingOrder(false);
    }
  };

  const startCamera = async () => {
    try {
      setIsCameraOpen(true);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' } // Use back camera on mobile
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error('Camera access failed:', error);
      alert('Camera access denied or not available');
      setIsCameraOpen(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
    }
    setIsCameraOpen(false);
  };

  const captureQRCode = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const video = videoRef.current;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0);

    // In a real implementation, you would use a QR code library here
    // For demo purposes, we'll simulate QR detection
    const mockQRCode = 'QR-ORD-001-1234567890';
    setQrInput(mockQRCode);
    stopCamera();
    
    alert('QR Code detected! Click "Verify Order" to process.');
  };

  const confirmDelivery = async () => {
    if (!selectedOrder) return;

    try {
      await AuthService.markOrderDelivered(selectedOrder.orderId, user.id);
      
      // Move order from pending to completed
      setPendingDeliveries(prev => prev.filter(o => o.orderId !== selectedOrder.orderId));
      setCompletedDeliveries(prev => [...prev, { ...selectedOrder, status: 'delivered' }]);
      
      // Update stats
      setStats(prev => ({
        ...prev,
        todayDeliveries: prev.todayDeliveries + 1,
        pendingCount: prev.pendingCount - 1,
        totalEarnings: prev.totalEarnings + (selectedOrder.orderType === 'monthly' ? 50 : 20) // Commission
      }));

      setIsConfirmDeliveryOpen(false);
      setSelectedOrder(null);
      setQrInput('');
      setScanResult(null);
      
      alert('Delivery confirmed successfully!');
    } catch (error) {
      console.error('Failed to confirm delivery:', error);
      alert('Failed to confirm delivery. Please try again.');
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading agent interface...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur"
      >
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <div className="p-1.5 bg-primary rounded-lg">
              <Truck className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-semibold">SR Guest House - Agent</h1>
              <p className="text-xs text-muted-foreground">
                {user.fullName} • {user.assignedArea}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={loadAgentData}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button variant="outline" onClick={onLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </motion.header>

      {/* Stats Cards */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today's Deliveries</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.todayDeliveries}</div>
              <p className="text-xs text-muted-foreground">Orders delivered</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pendingCount}</div>
              <p className="text-xs text-muted-foreground">Ready for delivery</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today's Earnings</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{stats.totalEarnings}</div>
              <p className="text-xs text-muted-foreground">Commission earned</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="scanner">QR Scanner</TabsTrigger>
            <TabsTrigger value="pending">Pending ({stats.pendingCount})</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
          </TabsList>

          {/* QR Scanner Tab */}
          <TabsContent value="scanner" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <QrCode className="h-5 w-5" />
                  QR Code Scanner
                </CardTitle>
                <CardDescription>
                  Scan customer QR codes to verify and deliver orders
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Manual QR Input */}
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Enter QR code manually or scan with camera"
                      value={qrInput}
                      onChange={(e) => setQrInput(e.target.value)}
                      className="flex-1"
                    />
                    <Button onClick={handleQRScan} disabled={isVerifyingOrder}>
                      {isVerifyingOrder ? (
                        <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <Scan className="h-4 w-4 mr-2" />
                      )}
                      Verify Order
                    </Button>
                  </div>
                  
                  {/* Camera Controls */}
                  <div className="flex gap-2">
                    {!isCameraOpen ? (
                      <Button variant="outline" onClick={startCamera}>
                        <Camera className="h-4 w-4 mr-2" />
                        Open Camera
                      </Button>
                    ) : (
                      <>
                        <Button variant="outline" onClick={captureQRCode}>
                          <Scan className="h-4 w-4 mr-2" />
                          Capture QR
                        </Button>
                        <Button variant="outline" onClick={stopCamera}>
                          Stop Camera
                        </Button>
                      </>
                    )}
                  </div>
                </div>

                {/* Camera View */}
                {isCameraOpen && (
                  <div className="relative">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      className="w-full max-w-md mx-auto rounded-lg border"
                    />
                    <canvas ref={canvasRef} className="hidden" />
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="w-48 h-48 border-2 border-primary border-dashed rounded-lg"></div>
                    </div>
                  </div>
                )}

                {/* Scan Result */}
                {scanResult && (
                  <Alert className={scanResult.valid ? 'border-green-500' : 'border-red-500'}>
                    {scanResult.valid ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-red-500" />
                    )}
                    <AlertDescription>
                      {scanResult.message}
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Pending Orders Tab */}
          <TabsContent value="pending" className="space-y-4">
            {pendingDeliveries.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No pending deliveries</p>
                </CardContent>
              </Card>
            ) : (
              pendingDeliveries.map((order) => (
                <motion.div
                  key={order.orderId}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-lg">{order.orderId}</CardTitle>
                          <CardDescription>
                            Order placed at {formatTime(order.createdAt)}
                          </CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={order.orderType === 'monthly' ? 'default' : 'secondary'}>
                            {order.orderType === 'monthly' ? 'Monthly' : 'Regular'}
                          </Badge>
                          <Badge variant="outline">
                            Ready
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Customer Info */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <UserIcon className="h-4 w-4 text-muted-foreground" />
                          <span>{order.customerName}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span>Room {order.roomNumber}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <span>{order.phone}</span>
                        </div>
                      </div>

                      {/* Order Items */}
                      <div>
                        <h4 className="font-medium mb-2">Order Items:</h4>
                        <div className="space-y-1">
                          {order.items.map((item, index) => (
                            <div key={index} className="flex justify-between text-sm">
                              <span>{item.name} x{item.quantity}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Total Amount */}
                      <div className="flex justify-between items-center pt-2 border-t">
                        <span className="font-medium">Total Amount:</span>
                        <span className="text-lg font-bold">₹{order.totalAmount}</span>
                      </div>

                      {/* Action Button */}
                      <Button 
                        onClick={() => {
                          setQrInput(order.qrCode);
                          setActiveTab('scanner');
                        }}
                        className="w-full"
                      >
                        <QrCode className="h-4 w-4 mr-2" />
                        Scan QR to Deliver
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))
            )}
          </TabsContent>

          {/* Completed Orders Tab */}
          <TabsContent value="completed" className="space-y-4">
            {completedDeliveries.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <CheckCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No completed deliveries today</p>
                </CardContent>
              </Card>
            ) : (
              completedDeliveries.map((order) => (
                <Card key={order.orderId}>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">{order.orderId}</h4>
                        <p className="text-sm text-muted-foreground">
                          {order.customerName} • Room {order.roomNumber}
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge variant="default">Delivered</Badge>
                        <p className="text-sm text-muted-foreground mt-1">
                          ₹{order.totalAmount}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Delivery Confirmation Dialog */}
      <Dialog open={isConfirmDeliveryOpen} onOpenChange={setIsConfirmDeliveryOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Delivery</DialogTitle>
            <DialogDescription>
              Please confirm that you have delivered this order to the customer
            </DialogDescription>
          </DialogHeader>
          
          {selectedOrder && (
            <div className="space-y-4">
              <div className="bg-muted/30 rounded-lg p-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Order ID:</span>
                  <span className="font-mono text-sm">{selectedOrder.orderId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Customer:</span>
                  <span className="text-sm">{selectedOrder.customerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Room:</span>
                  <span className="text-sm">{selectedOrder.roomNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Total:</span>
                  <span className="text-sm font-bold">₹{selectedOrder.totalAmount}</span>
                </div>
              </div>

              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  QR code verified successfully. Customer identity confirmed.
                </AlertDescription>
              </Alert>

              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  onClick={() => setIsConfirmDeliveryOpen(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button onClick={confirmDelivery} className="flex-1">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Confirm Delivery
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}