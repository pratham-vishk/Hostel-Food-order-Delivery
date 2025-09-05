import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Separator } from './ui/separator';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { QRCodeDisplay } from './QRCodeDisplay';
import { User, Mail, Phone, MapPin, ShoppingBag, Clock, Edit2, Settings, LogOut, QrCode, Calendar, Crown } from 'lucide-react';
import { ApiService } from '../services/apiService';

interface ProfileProps {
  user: any;
  onLogout: () => void;
  onUpdateProfile: (updates: any) => void;
}

export function Profile({ user, onLogout, onUpdateProfile }: ProfileProps) {
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    fullName: user.fullName || '',
    email: user.email || '',
    phone: user.phone || '',
    roomNumber: user.roomNumber || ''
  });
  const [orders, setOrders] = useState<any[]>([]);
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [selectedQROrder, setSelectedQROrder] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('orders');

  useEffect(() => {
    loadUserData();
  }, [user]);

  const loadUserData = async () => {
    setIsLoading(true);
    try {
      const [userOrders, userSubscriptions] = await Promise.all([
        ApiService.getOrders(user.username),
        ApiService.getSubscriptions(user.username)
      ]);
      setOrders(userOrders);
      setSubscriptions(userSubscriptions);
    } catch (error) {
      console.error('Failed to load user data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateProfile = () => {
    onUpdateProfile(profileForm);
    setIsEditingProfile(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'default';
      case 'preparing': return 'secondary';
      case 'ready': return 'outline';
      case 'confirmed': return 'default';
      default: return 'default';
    }
  };

  const showOrderQR = (order: any) => {
    setSelectedQROrder({
      orderId: order.id,
      customerName: order.customerName,
      roomNumber: order.roomNumber,
      items: order.items,
      totalAmount: order.totalAmount,
      orderType: order.orderType,
      estimatedDelivery: order.estimatedDelivery,
      status: order.status
    });
  };

  const showSubscriptionQR = (subscription: any) => {
    setSelectedQROrder({
      orderId: subscription.qrCode,
      customerName: user.fullName || user.username,
      roomNumber: user.roomNumber || 'Not specified',
      items: [{ name: subscription.planName, quantity: 1, price: subscription.price }],
      totalAmount: subscription.price,
      orderType: 'monthly',
      estimatedDelivery: `Valid until ${new Date(subscription.validUntil).toLocaleDateString()}`,
      status: subscription.status === 'active' ? 'confirmed' : subscription.status
    });
  };

  const totalOrders = orders.length;
  const totalSpent = orders.reduce((sum, order) => sum + order.totalAmount, 0);
  const activeSubscriptions = subscriptions.filter(s => s.status === 'active').length;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">My Profile</h1>
              <p className="text-muted-foreground">Manage your account and view order history</p>
            </div>
            <Button variant="outline" onClick={onLogout} className="flex items-center gap-2">
              <LogOut className="h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Information */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 bg-primary rounded-full flex items-center justify-center">
                        <User className="h-6 w-6 text-primary-foreground" />
                      </div>
                      <div>
                        <CardTitle>{user.fullName || user.username}</CardTitle>
                        <CardDescription>
                          {user.role === 'admin' ? 'Administrator' : 'Guest'}
                        </CardDescription>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsEditingProfile(true)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-sm">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span>{user.email || 'Not provided'}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{user.phone || 'Not provided'}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>Room {user.roomNumber || 'Not specified'}</span>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-xl font-bold text-primary">{totalOrders}</div>
                      <div className="text-xs text-muted-foreground">Orders</div>
                    </div>
                    <div>
                      <div className="text-xl font-bold text-primary">{activeSubscriptions}</div>
                      <div className="text-xs text-muted-foreground">Active Plans</div>
                    </div>
                    <div>
                      <div className="text-xl font-bold text-primary">₹{totalSpent}</div>
                      <div className="text-xs text-muted-foreground">Total Spent</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Orders and Subscriptions */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ShoppingBag className="h-5 w-5" />
                    Your Orders & Subscriptions
                  </CardTitle>
                  <CardDescription>
                    View your order history and manage subscriptions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="orders">Orders</TabsTrigger>
                      <TabsTrigger value="subscriptions">Monthly Plans</TabsTrigger>
                    </TabsList>

                    <TabsContent value="orders" className="space-y-4 mt-4">
                      {isLoading ? (
                        <div className="text-center py-8 text-muted-foreground">Loading orders...</div>
                      ) : orders.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">No orders yet</div>
                      ) : (
                        orders.map((order, index) => (
                          <motion.div
                            key={order.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: index * 0.1 }}
                            className="border rounded-lg p-4 space-y-3"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <h4 className="font-medium">{order.id}</h4>
                                <Badge variant={getStatusColor(order.status)}>
                                  {order.status}
                                </Badge>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="text-lg font-bold">₹{order.totalAmount}</div>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => showOrderQR(order)}
                                  className="flex items-center gap-1"
                                >
                                  <QrCode className="h-3 w-3" />
                                  QR
                                </Button>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString()}
                              </div>
                            </div>
                            
                            <div className="flex flex-wrap gap-2">
                              {order.items.map((item: any, idx: number) => (
                                <Badge key={idx} variant="outline" className="text-xs">
                                  {item.name} x{item.quantity}
                                </Badge>
                              ))}
                            </div>
                          </motion.div>
                        ))
                      )}
                    </TabsContent>

                    <TabsContent value="subscriptions" className="space-y-4 mt-4">
                      {isLoading ? (
                        <div className="text-center py-8 text-muted-foreground">Loading subscriptions...</div>
                      ) : subscriptions.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">No active subscriptions</div>
                      ) : (
                        subscriptions.map((subscription, index) => (
                          <motion.div
                            key={subscription.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: index * 0.1 }}
                            className="border rounded-lg p-4 space-y-3"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <Crown className="h-4 w-4 text-yellow-500" />
                                <h4 className="font-medium">{subscription.planName}</h4>
                                <Badge variant={subscription.status === 'active' ? 'default' : 'secondary'}>
                                  {subscription.status}
                                </Badge>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="text-lg font-bold">₹{subscription.price}</div>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => showSubscriptionQR(subscription)}
                                  className="flex items-center gap-1"
                                  disabled={subscription.status !== 'active'}
                                >
                                  <QrCode className="h-3 w-3" />
                                  QR
                                </Button>
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="text-muted-foreground">Preferred: </span>
                                <span className="capitalize">{subscription.preferences.mainCarb}</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Valid until: </span>
                                <span>{new Date(subscription.validUntil).toLocaleDateString()}</span>
                              </div>
                            </div>
                            
                            <div className="text-xs text-muted-foreground">
                              Subscribed on {new Date(subscription.subscribedAt).toLocaleDateString()}
                            </div>
                          </motion.div>
                        ))
                      )}
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Edit Profile Dialog */}
      <Dialog open={isEditingProfile} onOpenChange={setIsEditingProfile}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
            <DialogDescription>
              Update your profile information
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="editFullName">Full Name</Label>
              <Input
                id="editFullName"
                value={profileForm.fullName}
                onChange={(e) => setProfileForm(prev => ({ ...prev, fullName: e.target.value }))}
                placeholder="Enter your full name"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="editEmail">Email</Label>
              <Input
                id="editEmail"
                type="email"
                value={profileForm.email}
                onChange={(e) => setProfileForm(prev => ({ ...prev, email: e.target.value }))}
                placeholder="Enter your email"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="editPhone">Phone</Label>
                <Input
                  id="editPhone"
                  value={profileForm.phone}
                  onChange={(e) => setProfileForm(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="Phone number"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editRoom">Room Number</Label>
                <Input
                  id="editRoom"
                  value={profileForm.roomNumber}
                  onChange={(e) => setProfileForm(prev => ({ ...prev, roomNumber: e.target.value }))}
                  placeholder="Room number"
                />
              </div>
            </div>
          </div>
          
          <div className="flex gap-3 pt-4">
            <Button variant="outline" onClick={() => setIsEditingProfile(false)} className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleUpdateProfile} className="flex-1">
              Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* QR Code Display */}
      {selectedQROrder && (
        <QRCodeDisplay
          orderData={selectedQROrder}
          onClose={() => setSelectedQROrder(null)}
        />
      )}
    </div>
  );
}