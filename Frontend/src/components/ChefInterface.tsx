import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ChefHat, Clock, Users, Package, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { ThemeToggle } from './ThemeToggle';
import { Separator } from './ui/separator';
import { ApiService } from '../services/apiService';
import type { User } from '../services/authService';

interface Order {
  id: string;
  customerName: string;
  roomNumber: string;
  phoneNumber: string;
  items: Array<{
    id: string;
    name: string;
    quantity: number;
    price: number;
  }>;
  totalAmount: number;
  orderType: 'regular' | 'monthly';
  mealTime: 'breakfast' | 'lunch' | 'dinner' | 'snacks';
  status: 'pending' | 'preparing' | 'ready' | 'delivered';
  createdAt: string;
  estimatedDelivery: string;
}

interface ChefInterfaceProps {
  user: User;
  onLogout: () => void;
}

const MEAL_TIMES = {
  breakfast: { name: 'Breakfast', time: '7:00 - 10:00 AM', cutoff: '5:00 AM' },
  lunch: { name: 'Lunch', time: '12:00 - 3:00 PM', cutoff: '10:00 AM' },
  snacks: { name: 'Snacks', time: '4:00 - 6:00 PM', cutoff: '2:00 PM' },
  dinner: { name: 'Dinner', time: '7:00 - 10:00 PM', cutoff: '5:00 PM' }
};

export function ChefInterface({ user, onLogout }: ChefInterfaceProps) {
  const [orders, setOrders] = useState<Record<string, Order[]>>({
    breakfast: [],
    lunch: [],
    snacks: [],
    dinner: []
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('breakfast');

  const fetchOrders = async () => {
    try {
      setRefreshing(true);
      const ordersData = await ApiService.getOrdersByMealTime();
      setOrders(ordersData);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    // Refresh orders every 2 minutes
    const interval = setInterval(fetchOrders, 120000);
    return () => clearInterval(interval);
  }, []);

  const updateOrderStatus = async (orderId: string, status: Order['status']) => {
    try {
      await ApiService.updateOrderStatus(orderId, status);
      // Refresh orders after status update
      fetchOrders();
    } catch (error) {
      console.error('Failed to update order status:', error);
    }
  };

  const getCurrentMealTime = () => {
    const now = new Date();
    const currentHour = now.getHours();
    
    if (currentHour >= 5 && currentHour < 10) return 'breakfast';
    if (currentHour >= 10 && currentHour < 14) return 'lunch';
    if (currentHour >= 14 && currentHour < 17) return 'snacks';
    if (currentHour >= 17 || currentHour < 5) return 'dinner';
    
    return 'breakfast';
  };

  const getStatusIcon = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'preparing':
        return <Clock className="h-4 w-4 text-blue-500" />;
      case 'ready':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'delivered':
        return <CheckCircle className="h-4 w-4 text-gray-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'preparing':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'ready':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'delivered':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const getTotalItemsForMealTime = (mealTime: string) => {
    return orders[mealTime]?.reduce((total, order) => 
      total + order.items.reduce((itemTotal, item) => itemTotal + item.quantity, 0), 0
    ) || 0;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading orders...</p>
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
        transition={{ duration: 0.5 }}
        className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
      >
        <div className="container flex h-16 items-center justify-between px-4">
          <motion.div
            className="flex items-center gap-3"
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
          >
            <div className="p-1.5 bg-primary rounded-lg">
              <ChefHat className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-semibold">Chef Dashboard</h1>
              <p className="text-xs text-muted-foreground">SR Guest House Kitchen</p>
            </div>
          </motion.div>
          
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button
              variant="outline"
              size="sm"
              onClick={fetchOrders}
              disabled={refreshing}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button variant="outline" size="sm" onClick={onLogout}>
              Logout
            </Button>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-3xl font-bold">Kitchen Orders</h2>
              <p className="text-muted-foreground">Manage and track meal preparation</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Chef: {user.fullName || user.username}</p>
              <p className="text-xs text-muted-foreground">
                Current Time: {new Date().toLocaleTimeString()}
              </p>
            </div>
          </div>

          {/* Meal Time Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              {Object.entries(MEAL_TIMES).map(([key, meal]) => (
                <TabsTrigger key={key} value={key} className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span className="hidden sm:inline">{meal.name}</span>
                  <span className="sm:hidden">{meal.name.slice(0, 3)}</span>
                  <Badge variant="secondary" className="ml-1">
                    {orders[key]?.length || 0}
                  </Badge>
                </TabsTrigger>
              ))}
            </TabsList>

            {Object.entries(MEAL_TIMES).map(([mealTimeKey, mealTime]) => (
              <TabsContent key={mealTimeKey} value={mealTimeKey} className="mt-6">
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-semibold">{mealTime.name} Orders</h3>
                      <p className="text-sm text-muted-foreground">
                        Service Time: {mealTime.time} | Cutoff: {mealTime.cutoff}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">
                        Total Orders: {orders[mealTimeKey]?.length || 0}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Total Items: {getTotalItemsForMealTime(mealTimeKey)}
                      </p>
                    </div>
                  </div>
                  
                  {orders[mealTimeKey]?.length === 0 ? (
                    <Card>
                      <CardContent className="flex items-center justify-center py-12">
                        <div className="text-center">
                          <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                          <h4 className="font-semibold mb-2">No orders for {mealTime.name.toLowerCase()}</h4>
                          <p className="text-sm text-muted-foreground">
                            Orders will appear here after the cutoff time ({mealTime.cutoff})
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="grid gap-4">
                      {orders[mealTimeKey]?.map((order) => (
                        <motion.div
                          key={order.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          <Card>
                            <CardHeader>
                              <div className="flex items-center justify-between">
                                <div>
                                  <CardTitle className="flex items-center gap-2">
                                    <Users className="h-4 w-4" />
                                    {order.customerName}
                                    <Badge variant="outline">Room {order.roomNumber}</Badge>
                                  </CardTitle>
                                  <CardDescription>
                                    Order #{order.id.slice(-8)} • {new Date(order.createdAt).toLocaleTimeString()}
                                  </CardDescription>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Badge className={getStatusColor(order.status)}>
                                    {getStatusIcon(order.status)}
                                    <span className="ml-1 capitalize">{order.status}</span>
                                  </Badge>
                                  <Badge variant="secondary">
                                    ₹{order.totalAmount}
                                  </Badge>
                                </div>
                              </div>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-4">
                                {/* Order Items */}
                                <div>
                                  <h5 className="font-medium mb-2">Items:</h5>
                                  <div className="grid gap-2">
                                    {order.items.map((item, index) => (
                                      <div key={index} className="flex items-center justify-between p-2 bg-muted/50 rounded-lg">
                                        <span className="font-medium">{item.name}</span>
                                        <div className="flex items-center gap-2">
                                          <Badge variant="outline">Qty: {item.quantity}</Badge>
                                          <span className="text-sm text-muted-foreground">₹{item.price}</span>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>

                                <Separator />

                                {/* Action Buttons */}
                                <div className="flex items-center gap-2">
                                  {order.status === 'pending' && (
                                    <Button
                                      size="sm"
                                      onClick={() => updateOrderStatus(order.id, 'preparing')}
                                      className="flex items-center gap-2"
                                    >
                                      <Clock className="h-4 w-4" />
                                      Start Preparing
                                    </Button>
                                  )}
                                  {order.status === 'preparing' && (
                                    <Button
                                      size="sm"
                                      onClick={() => updateOrderStatus(order.id, 'ready')}
                                      className="flex items-center gap-2"
                                    >
                                      <CheckCircle className="h-4 w-4" />
                                      Mark Ready
                                    </Button>
                                  )}
                                  {order.status === 'ready' && (
                                    <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                                      <CheckCircle className="h-4 w-4" />
                                      Ready for delivery
                                    </div>
                                  )}
                                  {order.status === 'delivered' && (
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                      <CheckCircle className="h-4 w-4" />
                                      Delivered
                                    </div>
                                  )}
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </motion.div>
      </main>
    </div>
  );
}