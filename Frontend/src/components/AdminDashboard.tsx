import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Switch } from './ui/switch';
import { Separator } from './ui/separator';
import { ScrollArea } from './ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { 
  Users, UserPlus, UserCheck, UserX, ChefHat, Plus, Edit2, Trash2, 
  Clock, DollarSign, Package, TrendingUp, Eye, Download, Filter,
  ShoppingCart, Calendar, MapPin, Phone, Mail, Settings, BarChart3
} from 'lucide-react';
import { AuthService, User } from '../services/authService';
import { CatalogService, FoodItem, MealTimeConfig } from '../services/catalogService';
import { ApiService } from '../services/apiService';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface AdminDashboardProps {
  user: User;
  onLogout: () => void;
}

export function AdminDashboard({ user, onLogout }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [pendingRegistrations, setPendingRegistrations] = useState<User[]>([]);
  const [agents, setAgents] = useState<User[]>([]);
  const [customers, setCustomers] = useState<User[]>([]);
  const [foodItems, setFoodItems] = useState<FoodItem[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [mealTimeConfigs, setMealTimeConfigs] = useState<MealTimeConfig[]>([]);
  const [analytics, setAnalytics] = useState<any>({});
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Dialog states
  const [isAddAgentOpen, setIsAddAgentOpen] = useState(false);
  const [isAddFoodItemOpen, setIsAddFoodItemOpen] = useState(false);
  const [isEditFoodItemOpen, setIsEditFoodItemOpen] = useState(false);
  const [editingFoodItem, setEditingFoodItem] = useState<FoodItem | null>(null);
  const [isMealTimeConfigOpen, setIsMealTimeConfigOpen] = useState(false);

  // Form states
  const [agentForm, setAgentForm] = useState({
    username: '',
    email: '',
    fullName: '',
    phone: '',
    assignedArea: ''
  });

  const [foodItemForm, setFoodItemForm] = useState({
    name: '',
    description: '',
    price: 0,
    category: 'lunch' as const,
    image: '',
    available: true,
    isVeg: true,
    isSpicy: false,
    isPopular: false,
    ingredients: '',
    preparationTime: 30
  });

  useEffect(() => {
    loadDashboardData();
  }, [selectedDate]);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      const [
        pendingRegs,
        agentList,
        customerList,
        foodList,
        orderList,
        mealConfigs,
        analyticsData
      ] = await Promise.all([
        AuthService.getPendingRegistrations(),
        AuthService.getUsers('agent'),
        AuthService.getUsers('customer'),
        CatalogService.getFoodItems(),
        ApiService.getOrderAnalytics(), // This would get orders for selected date
        CatalogService.getMealTimeConfigs(),
        ApiService.getOrderAnalytics()
      ]);

      setPendingRegistrations(pendingRegs);
      setAgents(agentList);
      setCustomers(customerList);
      setFoodItems(foodList);
      setOrders([]); // Mock empty for now
      setMealTimeConfigs(mealConfigs);
      setAnalytics(analyticsData);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApproveRegistration = async (userId: string) => {
    try {
      await AuthService.approveRegistration(userId);
      await loadDashboardData();
    } catch (error) {
      console.error('Failed to approve registration:', error);
      // Show user-friendly error message instead of just logging
      alert('Failed to approve registration. Please try again.');
    }
  };

  const handleRejectRegistration = async (userId: string) => {
    try {
      await AuthService.rejectRegistration(userId);
      await loadDashboardData();
    } catch (error) {
      console.error('Failed to reject registration:', error);
      // Show user-friendly error message instead of just logging
      alert('Failed to reject registration. Please try again.');
    }
  };

  const handleCreateAgent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await AuthService.createAgent(agentForm);
      setIsAddAgentOpen(false);
      setAgentForm({
        username: '',
        email: '',
        fullName: '',
        phone: '',
        assignedArea: ''
      });
      await loadDashboardData();
    } catch (error) {
      console.error('Failed to create agent:', error);
    }
  };

  const handleCreateFoodItem = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const itemData = {
        ...foodItemForm,
        ingredients: foodItemForm.ingredients.split(',').map(s => s.trim()),
        createdBy: user.id
      };
      await CatalogService.createFoodItem(itemData);
      setIsAddFoodItemOpen(false);
      resetFoodItemForm();
      await loadDashboardData();
    } catch (error) {
      console.error('Failed to create food item:', error);
    }
  };

  const handleUpdateFoodItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingFoodItem) return;
    
    try {
      const updates = {
        ...foodItemForm,
        ingredients: foodItemForm.ingredients.split(',').map(s => s.trim())
      };
      await CatalogService.updateFoodItem(editingFoodItem.id, updates);
      setIsEditFoodItemOpen(false);
      setEditingFoodItem(null);
      resetFoodItemForm();
      await loadDashboardData();
    } catch (error) {
      console.error('Failed to update food item:', error);
    }
  };

  const handleDeleteFoodItem = async (itemId: string) => {
    if (!confirm('Are you sure you want to delete this food item?')) return;
    
    try {
      await CatalogService.deleteFoodItem(itemId);
      await loadDashboardData();
    } catch (error) {
      console.error('Failed to delete food item:', error);
    }
  };

  const handleToggleItemAvailability = async (itemId: string) => {
    try {
      await CatalogService.toggleItemAvailability(itemId);
      await loadDashboardData();
    } catch (error) {
      console.error('Failed to toggle availability:', error);
    }
  };

  const resetFoodItemForm = () => {
    setFoodItemForm({
      name: '',
      description: '',
      price: 0,
      category: 'lunch',
      image: '',
      available: true,
      isVeg: true,
      isSpicy: false,
      isPopular: false,
      ingredients: '',
      preparationTime: 30
    });
  };

  const openEditFoodItem = (item: FoodItem) => {
    setEditingFoodItem(item);
    setFoodItemForm({
      name: item.name,
      description: item.description,
      price: item.price,
      category: item.category,
      image: item.image,
      available: item.available,
      isVeg: item.isVeg || false,
      isSpicy: item.isSpicy || false,
      isPopular: item.isPopular || false,
      ingredients: item.ingredients?.join(', ') || '',
      preparationTime: item.preparationTime || 30
    });
    setIsEditFoodItemOpen(true);
  };

  const generateDailyReport = () => {
    // Generate daily billing report
    const reportData = {
      date: selectedDate,
      totalOrders: orders.length,
      totalRevenue: analytics.totalRevenue || 0,
      ordersByMealType: {
        breakfast: orders.filter(o => o.mealType === 'breakfast').length,
        lunch: orders.filter(o => o.mealType === 'lunch').length,
        dinner: orders.filter(o => o.mealType === 'dinner').length,
        snacks: orders.filter(o => o.mealType === 'snacks').length
      }
    };

    console.log('Daily Report:', reportData);
    alert(`Daily report generated for ${selectedDate}\nTotal Orders: ${reportData.totalOrders}\nTotal Revenue: ₹${reportData.totalRevenue}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading admin dashboard...</p>
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
              <Settings className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-semibold">SR Guest House - Admin</h1>
              <p className="text-xs text-muted-foreground">Welcome, {user.fullName}</p>
            </div>
          </div>
          
          <Button variant="outline" onClick={onLogout}>
            Logout
          </Button>
        </div>
      </motion.header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="customers">Customers</TabsTrigger>
            <TabsTrigger value="agents">Agents</TabsTrigger>
            <TabsTrigger value="menu">Menu</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
                  <UserCheck className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{pendingRegistrations.length}</div>
                  <p className="text-xs text-muted-foreground">New registrations</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Customers</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{customers.length}</div>
                  <p className="text-xs text-muted-foreground">Approved users</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Daily Revenue</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">₹{analytics.totalRevenue || 0}</div>
                  <p className="text-xs text-muted-foreground">Today's earnings</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                  <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analytics.totalOrders || 0}</div>
                  <p className="text-xs text-muted-foreground">All time</p>
                </CardContent>
              </Card>
            </div>

            {/* Daily Report Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Daily Report
                </CardTitle>
                <CardDescription>Generate daily billing and order reports</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="reportDate">Select Date</Label>
                    <Input
                      id="reportDate"
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="w-auto"
                    />
                  </div>
                  <Button onClick={generateDailyReport} className="mt-6">
                    <Download className="h-4 w-4 mr-2" />
                    Generate Report
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Customers Tab */}
          <TabsContent value="customers" className="space-y-6">
            {/* Pending Registrations */}
            {pendingRegistrations.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <UserCheck className="h-5 w-5" />
                    Pending Registrations ({pendingRegistrations.length})
                  </CardTitle>
                  <CardDescription>Review and approve new customer registrations</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {pendingRegistrations.map((registration) => (
                      <div key={registration.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <h4 className="font-medium">{registration.fullName}</h4>
                            <p className="text-sm text-muted-foreground">
                              @{registration.username} • {registration.email}
                            </p>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Phone className="h-3 w-3" />
                                {registration.phone}
                              </span>
                              <span className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                Room {registration.roomNumber}
                              </span>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleApproveRegistration(registration.id)}
                            >
                              <UserCheck className="h-4 w-4 mr-2" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleRejectRegistration(registration.id)}
                            >
                              <UserX className="h-4 w-4 mr-2" />
                              Reject
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Active Customers */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Active Customers ({customers.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Username</TableHead>
                        <TableHead>Room</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {customers.map((customer) => (
                        <TableRow key={customer.id}>
                          <TableCell>{customer.fullName}</TableCell>
                          <TableCell>@{customer.username}</TableCell>
                          <TableCell>{customer.roomNumber}</TableCell>
                          <TableCell>{customer.phone}</TableCell>
                          <TableCell>
                            <Badge variant={customer.status === 'active' ? 'default' : 'secondary'}>
                              {customer.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Button size="sm" variant="outline">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Agents Tab */}
          <TabsContent value="agents" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <UserPlus className="h-5 w-5" />
                      Delivery Agents ({agents.length})
                    </CardTitle>
                    <CardDescription>Manage delivery agents and their assignments</CardDescription>
                  </div>
                  <Button onClick={() => setIsAddAgentOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Agent
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {agents.map((agent) => (
                    <Card key={agent.id}>
                      <CardHeader>
                        <CardTitle className="text-base">{agent.fullName}</CardTitle>
                        <CardDescription>@{agent.username}</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div className="text-sm">
                          <span className="text-muted-foreground">Area: </span>
                          <span>{agent.assignedArea}</span>
                        </div>
                        <div className="text-sm">
                          <span className="text-muted-foreground">Phone: </span>
                          <span>{agent.phone}</span>
                        </div>
                        <div className="text-sm">
                          <span className="text-muted-foreground">Status: </span>
                          <Badge variant={agent.status === 'active' ? 'default' : 'secondary'}>
                            {agent.status}
                          </Badge>
                        </div>
                        {agent.lastLogin && (
                          <div className="text-xs text-muted-foreground">
                            Last login: {new Date(agent.lastLogin).toLocaleDateString()}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Menu Tab */}
          <TabsContent value="menu" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <ChefHat className="h-5 w-5" />
                      Menu Management ({foodItems.length} items)
                    </CardTitle>
                    <CardDescription>Add, edit, and manage food items</CardDescription>
                  </div>
                  <Button onClick={() => setIsAddFoodItemOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Food Item
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {foodItems.map((item) => (
                    <Card key={item.id}>
                      <CardHeader className="pb-2">
                        <ImageWithFallback
                          src={item.image}
                          alt={item.name}
                          className="w-full h-32 object-cover rounded-md"
                        />
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">{item.name}</h4>
                          <div className="flex gap-1">
                            {item.isVeg && <Badge variant="secondary">Veg</Badge>}
                            {item.isSpicy && <Badge variant="outline">Spicy</Badge>}
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2">{item.description}</p>
                        <div className="flex items-center justify-between">
                          <span className="font-bold">₹{item.price}</span>
                          <Badge variant={item.available ? 'default' : 'secondary'}>
                            {item.available ? 'Available' : 'Unavailable'}
                          </Badge>
                        </div>
                        <div className="flex gap-1">
                          <Button size="sm" variant="outline" onClick={() => openEditFoodItem(item)}>
                            <Edit2 className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleToggleItemAvailability(item.id)}
                          >
                            <Eye className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteFoodItem(item.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5" />
                  Order Management
                </CardTitle>
                <CardDescription>View and manage incoming orders</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  No orders for selected date. Orders will appear here as customers place them.
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Meal Time Configuration
                </CardTitle>
                <CardDescription>Configure meal times and order cutoffs</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mealTimeConfigs.map((config) => (
                    <div key={config.mealType} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium capitalize">{config.mealType}</h4>
                          <p className="text-sm text-muted-foreground">
                            {config.startTime} - {config.endTime} (Cutoff: {config.orderCutoffTime})
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Switch checked={config.isActive} />
                          <Button size="sm" variant="outline">
                            <Edit2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Add Agent Dialog */}
      <Dialog open={isAddAgentOpen} onOpenChange={setIsAddAgentOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Agent</DialogTitle>
            <DialogDescription>Create a new delivery agent account</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateAgent} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="agentUsername">Username</Label>
                <Input
                  id="agentUsername"
                  value={agentForm.username}
                  onChange={(e) => setAgentForm(prev => ({ ...prev, username: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="agentEmail">Email</Label>
                <Input
                  id="agentEmail"
                  type="email"
                  value={agentForm.email}
                  onChange={(e) => setAgentForm(prev => ({ ...prev, email: e.target.value }))}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="agentFullName">Full Name</Label>
              <Input
                id="agentFullName"
                value={agentForm.fullName}
                onChange={(e) => setAgentForm(prev => ({ ...prev, fullName: e.target.value }))}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="agentPhone">Phone</Label>
                <Input
                  id="agentPhone"
                  value={agentForm.phone}
                  onChange={(e) => setAgentForm(prev => ({ ...prev, phone: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="agentArea">Assigned Area</Label>
                <Input
                  id="agentArea"
                  placeholder="e.g., Floor 1-2, Building A"
                  value={agentForm.assignedArea}
                  onChange={(e) => setAgentForm(prev => ({ ...prev, assignedArea: e.target.value }))}
                  required
                />
              </div>
            </div>
            <div className="flex gap-3">
              <Button type="button" variant="outline" onClick={() => setIsAddAgentOpen(false)} className="flex-1">
                Cancel
              </Button>
              <Button type="submit" className="flex-1">
                Create Agent
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Add Food Item Dialog */}
      <Dialog open={isAddFoodItemOpen} onOpenChange={setIsAddFoodItemOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New Food Item</DialogTitle>
            <DialogDescription>Add a new item to the menu</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateFoodItem} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="foodName">Name</Label>
                <Input
                  id="foodName"
                  value={foodItemForm.name}
                  onChange={(e) => setFoodItemForm(prev => ({ ...prev, name: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="foodPrice">Price (₹)</Label>
                <Input
                  id="foodPrice"
                  type="number"
                  value={foodItemForm.price}
                  onChange={(e) => setFoodItemForm(prev => ({ ...prev, price: Number(e.target.value) }))}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="foodDescription">Description</Label>
              <Textarea
                id="foodDescription"
                value={foodItemForm.description}
                onChange={(e) => setFoodItemForm(prev => ({ ...prev, description: e.target.value }))}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="foodCategory">Category</Label>
                <Select value={foodItemForm.category} onValueChange={(value) => setFoodItemForm(prev => ({ ...prev, category: value as any }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="breakfast">Breakfast</SelectItem>
                    <SelectItem value="lunch">Lunch</SelectItem>
                    <SelectItem value="dinner">Dinner</SelectItem>
                    <SelectItem value="snacks">Snacks</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="foodImage">Image URL</Label>
                <Input
                  id="foodImage"
                  value={foodItemForm.image}
                  onChange={(e) => setFoodItemForm(prev => ({ ...prev, image: e.target.value }))}
                  placeholder="https://..."
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="foodIngredients">Ingredients (comma-separated)</Label>
              <Input
                id="foodIngredients"
                value={foodItemForm.ingredients}
                onChange={(e) => setFoodItemForm(prev => ({ ...prev, ingredients: e.target.value }))}
                placeholder="Rice, Chicken, Spices..."
              />
            </div>
            <div className="flex items-center gap-6">
              <div className="flex items-center space-x-2">
                <Switch
                  id="isVeg"
                  checked={foodItemForm.isVeg}
                  onCheckedChange={(checked) => setFoodItemForm(prev => ({ ...prev, isVeg: checked }))}
                />
                <Label htmlFor="isVeg">Vegetarian</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="isSpicy"
                  checked={foodItemForm.isSpicy}
                  onCheckedChange={(checked) => setFoodItemForm(prev => ({ ...prev, isSpicy: checked }))}
                />
                <Label htmlFor="isSpicy">Spicy</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="isPopular"
                  checked={foodItemForm.isPopular}
                  onCheckedChange={(checked) => setFoodItemForm(prev => ({ ...prev, isPopular: checked }))}
                />
                <Label htmlFor="isPopular">Popular</Label>
              </div>
            </div>
            <div className="flex gap-3">
              <Button type="button" variant="outline" onClick={() => setIsAddFoodItemOpen(false)} className="flex-1">
                Cancel
              </Button>
              <Button type="submit" className="flex-1">
                Add Food Item
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Food Item Dialog */}
      <Dialog open={isEditFoodItemOpen} onOpenChange={setIsEditFoodItemOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Food Item</DialogTitle>
            <DialogDescription>Update food item details</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdateFoodItem} className="space-y-4">
            {/* Same form as Add Food Item but with different submit handler */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="editFoodName">Name</Label>
                <Input
                  id="editFoodName"
                  value={foodItemForm.name}
                  onChange={(e) => setFoodItemForm(prev => ({ ...prev, name: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editFoodPrice">Price (₹)</Label>
                <Input
                  id="editFoodPrice"
                  type="number"
                  value={foodItemForm.price}
                  onChange={(e) => setFoodItemForm(prev => ({ ...prev, price: Number(e.target.value) }))}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="editFoodDescription">Description</Label>
              <Textarea
                id="editFoodDescription"
                value={foodItemForm.description}
                onChange={(e) => setFoodItemForm(prev => ({ ...prev, description: e.target.value }))}
                required
              />
            </div>
            <div className="flex gap-3">
              <Button type="button" variant="outline" onClick={() => setIsEditFoodItemOpen(false)} className="flex-1">
                Cancel
              </Button>
              <Button type="submit" className="flex-1">
                Update Food Item
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}