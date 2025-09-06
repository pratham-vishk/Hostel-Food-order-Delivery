import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { FoodMenu } from "./components/FoodMenu";
import { Cart } from "./components/Cart";
import { OrderForm } from "./components/OrderForm";
import { Login } from "./components/Login";
import { Profile } from "./components/Profile";
import { QRCodeDisplay } from "./components/QRCodeDisplay";
import { MonthlyPlans } from "./components/MonthlyPlans";
import { AdminDashboard } from "./components/AdminDashboard";
import { AgentInterface } from "./components/AgentInterface";
import { ThemeProvider } from "./components/ThemeProvider";
import { ThemeToggle } from "./components/ThemeToggle";
import {
  ShoppingCart,
  User as UserIcon,
  Utensils,
  Calendar,
  ChefHat,
  Star,
  Clock,
  MapPin,
  Truck,
} from "lucide-react";
import { Button } from "./components/ui/button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "./components/ui/tabs";
import { Badge } from "./components/ui/badge";
import { ApiService } from "./services/apiService";
import { AuthService } from "./services/authService";
import type { User as UserType } from "./services/authService";

export interface FoodItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  available: boolean;
  rating?: number;
  isPopular?: boolean;
  isVeg?: boolean;
  isSpicy?: boolean;
}

export interface CartItem extends FoodItem {
  quantity: number;
}

export interface UserDetails {
  name: string;
  roomNumber: string;
  phoneNumber: string;
}

function AppContent() {
  const [user, setUser] = useState<UserType | null>(null);
  const [currentView, setCurrentView] = useState<
    "menu" | "profile"
  >("menu");
  const [currentTab, setCurrentTab] = useState<
    "orders" | "monthly"
  >("orders");
  const [selectedCategory, setSelectedCategory] = useState('breakfast');
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isOrderFormOpen, setIsOrderFormOpen] = useState(false);
  const [orderConfirmation, setOrderConfirmation] =
    useState<any>(null);
  const [
    subscriptionConfirmation,
    setSubscriptionConfirmation,
  ] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // Food categories
  const foodCategories = [
    { id: 'breakfast', name: 'Breakfast', emoji: '🌅', time: '7-10 AM' },
    { id: 'lunch', name: 'Lunch', emoji: '🍽️', time: '12-3 PM' },
    { id: 'dinner', name: 'Dinner', emoji: '🌙', time: '7-10 PM' },
    { id: 'snacks', name: 'Snacks', emoji: '🍿', time: '4-6 PM' }
  ];

  // Load user from localStorage on app start and validate token
  useEffect(() => {
    const checkAuth = async () => {
      const savedUser = localStorage.getItem(
        "sr-guesthouse-user",
      );
      const savedToken = localStorage.getItem(
        "sr-guesthouse-token",
      );

      if (savedUser && savedToken) {
        try {
          // Validate token with backend
          const validatedUser =
            await AuthService.validateToken(savedToken);
          if (validatedUser) {
            setUser(validatedUser);
          } else {
            // Token invalid, clear storage
            localStorage.removeItem("sr-guesthouse-user");
            localStorage.removeItem("sr-guesthouse-token");
          }
        } catch (error) {
          console.error("Token validation failed:", error);
          localStorage.removeItem("sr-guesthouse-user");
          localStorage.removeItem("sr-guesthouse-token");
        }
      }
      setIsCheckingAuth(false);
    };

    checkAuth();
  }, []);

  const handleLogin = (userData: {
    user: UserType;
    token: string;
  }) => {
    setUser(userData.user);
    localStorage.setItem(
      "sr-guesthouse-user",
      JSON.stringify(userData.user),
    );
    localStorage.setItem("sr-guesthouse-token", userData.token);
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentView("menu");
    setCartItems([]);
    localStorage.removeItem("sr-guesthouse-user");
    localStorage.removeItem("sr-guesthouse-token");
  };

  const handleUpdateProfile = (updates: any) => {
    const updatedUser = { ...user, ...updates };
    setUser(updatedUser);
    localStorage.setItem(
      "sr-guesthouse-user",
      JSON.stringify(updatedUser),
    );
  };

  const addToCart = (item: FoodItem) => {
    setCartItems((prev) => {
      const existingItem = prev.find(
        (cartItem) => cartItem.id === item.id,
      );
      if (existingItem) {
        return prev.map((cartItem) =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem,
        );
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const removeFromCart = (itemId: string) => {
    setCartItems((prev) =>
      prev.filter((item) => item.id !== itemId),
    );
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity === 0) {
      removeFromCart(itemId);
      return;
    }
    setCartItems((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, quantity } : item,
      ),
    );
  };

  const getTotalPrice = () => {
    return cartItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0,
    );
  };

  const getTotalItems = () => {
    return cartItems.reduce(
      (total, item) => total + item.quantity,
      0,
    );
  };

  const handleOrderSubmit = async (
    userDetails: UserDetails,
  ) => {
    setIsLoading(true);
    try {
      const orderData = {
        customerId: user.username,
        customerName: userDetails.name,
        roomNumber: userDetails.roomNumber,
        phoneNumber: userDetails.phoneNumber,
        items: cartItems.map((item) => ({
          id: item.id,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
        })),
        totalAmount: getTotalPrice(),
        orderType: "regular" as const,
      };

      const order = await ApiService.createOrder(orderData);

      setOrderConfirmation({
        orderId: order.id,
        customerName: order.customerName,
        roomNumber: order.roomNumber,
        items: order.items,
        totalAmount: order.totalAmount,
        orderType: order.orderType,
        estimatedDelivery: order.estimatedDelivery,
        status: order.status,
      });

      setCartItems([]);
      setIsOrderFormOpen(false);
      setIsCartOpen(false);
    } catch (error) {
      console.error("Order submission failed:", error);
      alert("Failed to place order. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleMonthlySubscription = async (
    subscriptionData: any,
  ) => {
    setIsLoading(true);
    try {
      const subscription = await ApiService.createSubscription({
        customerId: user.username,
        planId: subscriptionData.id,
        planName: subscriptionData.name,
        price: subscriptionData.price,
        preferences: subscriptionData.preferences,
      });

      setSubscriptionConfirmation({
        orderId: subscription.qrCode,
        customerName: user.fullName || user.username,
        roomNumber: user.roomNumber || "Not specified",
        items: [
          {
            name: subscription.planName,
            quantity: 1,
            price: subscription.price,
          },
        ],
        totalAmount: subscription.price,
        orderType: "monthly",
        estimatedDelivery:
          "Starts from " +
          new Date(
            subscription.preferences.startDate,
          ).toLocaleDateString(),
        status: "confirmed",
      });
    } catch (error) {
      console.error("Subscription failed:", error);
      alert("Failed to create subscription. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading spinner while checking authentication
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 dark:from-gray-900 dark:via-gray-800 dark:to-orange-900 flex items-center justify-center">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            className="relative mx-auto mb-6"
            animate={{ rotate: 360 }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "linear",
            }}
          >
            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-orange-400 to-red-400 p-1">
              <div className="w-full h-full rounded-full bg-background flex items-center justify-center">
                <ChefHat className="h-6 w-6 text-primary" />
              </div>
            </div>
          </motion.div>
          <motion.h2
            className="text-2xl font-bold text-primary mb-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            SR Guest House
          </motion.h2>
          <motion.p
            className="text-muted-foreground"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            Preparing your culinary experience...
          </motion.p>
        </motion.div>
      </div>
    );
  }

  // Show login if no user
  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  // Route based on user role
  if (user.role === "admin") {
    return (
      <AdminDashboard user={user} onLogout={handleLogout} />
    );
  }

  if (user.role === "agent") {
    return (
      <AgentInterface user={user} onLogout={handleLogout} />
    );
  }

  // Customer interface (existing app)
  // Show profile view
  if (currentView === "profile") {
    return (
      <Profile
        user={user}
        onLogout={handleLogout}
        onUpdateProfile={handleUpdateProfile}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50/50 via-white to-red-50/50 dark:from-gray-900 dark:via-gray-800 dark:to-orange-900/20">
      {/* Header */}
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
        className="sticky top-0 z-50 w-full glass-effect border-b border-white/20 dark:border-white/10"
      >
        <div className="container flex h-20 items-center justify-between px-4">
          <motion.div
            className="flex items-center gap-4"
            whileHover={{ scale: 1.02 }}
            transition={{
              type: "spring",
              stiffness: 400,
              damping: 25,
            }}
          >
            <motion.div
              className="relative p-3 bg-gradient-to-r from-orange-400 to-red-400 rounded-2xl shadow-lg"
              whileHover={{ rotate: 5 }}
            >
              <ChefHat className="h-6 w-6 text-white" />
              <motion.div
                className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </motion.div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                SR Guest House
              </h1>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Star className="h-3 w-3 text-yellow-500 fill-current" />
                <span className="hidden sm:inline">
                  Premium Food Experience
                </span>
                <Badge
                  variant="secondary"
                  className="text-xs hidden md:flex"
                >
                  <Clock className="h-3 w-3 mr-1" />
                  24/7 Service
                </Badge>
              </div>
            </div>
          </motion.div>

          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-1 text-sm text-muted-foreground bg-background/50 rounded-full px-3 py-1.5">
              <MapPin className="h-3 w-3 text-primary" />
              <span>Room Service</span>
            </div>
            <ThemeToggle />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCurrentView("profile")}
              className="flex items-center gap-2 rounded-full hover:bg-primary/10"
            >
              <UserIcon className="h-4 w-4" />
              <span className="hidden sm:inline">Profile</span>
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={() => setIsCartOpen(true)}
              className="flex items-center gap-2 relative bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 rounded-full shadow-lg"
            >
              <ShoppingCart className="h-4 w-4" />
              <span className="hidden sm:inline">Cart</span>
              <span className="sm:hidden">
                ({getTotalItems()})
              </span>
              {getTotalItems() > 0 && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-2 -right-2 h-6 w-6 bg-yellow-400 text-yellow-900 rounded-full flex items-center justify-center text-xs font-bold shadow-lg"
                >
                  {getTotalItems()}
                </motion.div>
              )}
            </Button>
          </div>
        </div>
      </motion.header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-orange-400/20 to-red-400/20 dark:from-orange-600/10 dark:to-red-600/10" />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative container mx-auto px-4 py-16 text-center"
        >
          <motion.div
            className="mb-6"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-100 to-red-100 dark:from-orange-900/30 dark:to-red-900/30 rounded-full px-4 py-2 mb-4">
              <Star className="h-4 w-4 text-yellow-500 fill-current" />
              <span className="text-sm font-medium">
                Premium Food Experience
              </span>
              <Star className="h-4 w-4 text-yellow-500 fill-current" />
            </div>
            <h2 className="text-4xl md:text-6xl font-bold mb-4">
              <span className="bg-gradient-to-r from-orange-600 via-red-500 to-pink-500 bg-clip-text text-transparent">
                Craving Something
              </span>
              <br />
              <span className="text-foreground">
                Delicious?
              </span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              From authentic Indian cuisine to international
              flavors, we deliver restaurant-quality meals
              directly to your room with lightning-fast service.
            </p>
          </motion.div>

          {user.fullName && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="inline-flex items-center gap-2 bg-primary/10 rounded-full px-4 py-2 mb-8"
            >
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-primary font-medium">
                Welcome back, {user.fullName}!
              </span>
            </motion.div>
          )}

          {/* Stats Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto mb-12"
          >
            {[
              {
                icon: ChefHat,
                label: "Expert Chefs",
                value: "15+",
              },
              {
                icon: Clock,
                label: "Avg Delivery",
                value: "20 min",
              },
              { icon: Star, label: "Rating", value: "4.9/5" },
              {
                icon: Truck,
                label: "Orders Today",
                value: "150+",
              },
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{
                  duration: 0.4,
                  delay: 0.8 + index * 0.1,
                }}
                className="modern-shadow bg-card/50 backdrop-blur-sm rounded-2xl p-4 hover:scale-105 transition-transform"
              >
                <stat.icon className="h-6 w-6 text-primary mx-auto mb-2" />
                <div className="text-xl font-bold text-foreground">
                  {stat.value}
                </div>
                <div className="text-xs text-muted-foreground">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* Food Categories Navigation */}
      <section className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center gap-2 mb-4">
            <ChefHat className="h-6 w-6 text-primary" />
            <h3 className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
              Choose Your Meal Category
            </h3>
            <ChefHat className="h-6 w-6 text-primary" />
          </div>
          <p className="text-muted-foreground">
            Browse our carefully crafted menu by meal time
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="flex justify-center"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl w-full">
            {foodCategories.map((category, index) => (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.6 + index * 0.1 }}
                whileHover={{ y: -4 }}
                whileTap={{ scale: 0.98 }}
              >
                <button
                  onClick={() => setSelectedCategory(category.id)}
                  className={`group relative overflow-hidden rounded-2xl p-6 transition-all duration-300 transform hover:scale-105 modern-shadow w-full ${
                    selectedCategory === category.id
                      ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white scale-105'
                      : 'bg-card/50 backdrop-blur-sm hover:bg-card/80'
                  }`}
                >
                <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-red-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                <motion.div
                  className="relative z-10 flex flex-col items-center gap-3"
                  animate={{ scale: selectedCategory === category.id ? 1.1 : 1 }}
                  transition={{ duration: 0.2 }}
                >
                  <motion.span
                    className="text-4xl"
                    animate={{ 
                      rotate: selectedCategory === category.id ? [0, -10, 10, 0] : 0 
                    }}
                    transition={{ duration: 0.5 }}
                  >
                    {category.emoji}
                  </motion.span>
                  
                  <div className="text-center">
                    <div className="font-bold text-lg mb-1">{category.name}</div>
                    <div className={`text-sm ${
                      selectedCategory === category.id 
                        ? 'text-white/80' 
                        : 'text-muted-foreground'
                    }`}>
                      {category.time}
                    </div>
                  </div>
                </motion.div>

                {selectedCategory === category.id && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute top-2 right-2 w-6 h-6 bg-white/20 rounded-full flex items-center justify-center"
                  >
                    <div className="w-2 h-2 bg-white rounded-full" />
                  </motion.div>
                )}
                </button>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Main Content */}
      <main className="container mx-auto px-4 pb-8">
        <Tabs
          value={currentTab}
          onValueChange={(value) =>
            setCurrentTab(value as "orders" | "monthly")
          }
          className="w-full"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex justify-center mb-12"
          >
            <TabsList className="grid w-full max-w-md grid-cols-2 bg-card/50 backdrop-blur-sm p-1 rounded-2xl modern-shadow">
              <TabsTrigger
                value="orders"
                className="flex items-center gap-2 rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-red-500 data-[state=active]:text-white transition-all duration-300"
              >
                <Utensils className="h-4 w-4" />
                Order Now
              </TabsTrigger>
              <TabsTrigger
                value="monthly"
                className="flex items-center gap-2 rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-red-500 data-[state=active]:text-white transition-all duration-300"
              >
                <Calendar className="h-4 w-4" />
                Monthly Plans
              </TabsTrigger>
            </TabsList>
          </motion.div>

          <TabsContent value="orders" className="mt-0">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <FoodMenu 
                onAddToCart={addToCart} 
                cartItems={cartItems}
                onUpdateQuantity={updateQuantity}
                selectedCategory={selectedCategory}
              />
            </motion.div>
          </TabsContent>

          <TabsContent value="monthly" className="mt-0">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <MonthlyPlans
                onSubscribe={handleMonthlySubscription}
              />
            </motion.div>
          </TabsContent>
        </Tabs>
      </main>

      {/* Cart Sidebar */}
      <Cart
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onRemoveItem={removeFromCart}
        onUpdateQuantity={updateQuantity}
        totalPrice={getTotalPrice()}
        onCheckout={() => {
          setIsCartOpen(false);
          setIsOrderFormOpen(true);
        }}
      />

      {/* Order Form Dialog */}
      <OrderForm
        isOpen={isOrderFormOpen}
        onClose={() => setIsOrderFormOpen(false)}
        cartItems={cartItems}
        totalPrice={getTotalPrice()}
        onSubmit={handleOrderSubmit}
        isLoading={isLoading}
      />

      {/* Order Confirmation with QR Code */}
      {orderConfirmation && (
        <QRCodeDisplay
          orderData={orderConfirmation}
          onClose={() => setOrderConfirmation(null)}
        />
      )}

      {/* Monthly Subscription Confirmation with QR Code */}
      {subscriptionConfirmation && (
        <QRCodeDisplay
          orderData={subscriptionConfirmation}
          onClose={() => setSubscriptionConfirmation(null)}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider
      defaultTheme="light"
      storageKey="sr-guesthouse-theme"
    >
      <AppContent />
    </ThemeProvider>
  );
}