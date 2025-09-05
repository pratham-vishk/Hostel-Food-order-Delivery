// Mock API service to simulate Spring Boot backend integration
// In production, replace these with actual HTTP calls to your Spring Boot backend

export interface Order {
  id: string;
  customerId: string;
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
  status: 'confirmed' | 'preparing' | 'ready' | 'delivered';
  createdAt: string;
  estimatedDelivery?: string;
  qrCode: string;
}

export interface MonthlySubscription {
  id: string;
  customerId: string;
  planId: string;
  planName: string;
  price: number;
  preferences: {
    mainCarb: string;
    mealTimes: string[];
    startDate: string;
  };
  status: 'active' | 'paused' | 'cancelled';
  subscribedAt: string;
  validUntil: string;
  qrCode: string;
}

// Simulate network delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Mock database
let orders: Order[] = [];
let subscriptions: MonthlySubscription[] = [];

export class ApiService {
  private static baseUrl = 'http://localhost:8080/api'; // Your Spring Boot backend URL

  // Order Management
  static async createOrder(orderData: {
    customerId: string;
    customerName: string;
    roomNumber: string;
    phoneNumber: string;
    items: Array<{ id: string; name: string; quantity: number; price: number }>;
    totalAmount: number;
    orderType: 'regular' | 'monthly';
  }): Promise<Order> {
    await delay(1000); // Simulate API call

    const orderId = `ORD-${Date.now()}`;
    const estimatedDelivery = new Date(Date.now() + 30 * 60 * 1000).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit'
    });

    const order: Order = {
      id: orderId,
      ...orderData,
      status: 'confirmed',
      createdAt: new Date().toISOString(),
      estimatedDelivery,
      qrCode: `QR-${orderId}-${Date.now()}`
    };

    orders.push(order);

    // In production, this would be:
    // const response = await fetch(`${this.baseUrl}/orders`, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(orderData)
    // });
    // return response.json();

    return order;
  }

  static async getOrders(customerId: string): Promise<Order[]> {
    await delay(500);
    
    const customerOrders = orders.filter(order => order.customerId === customerId);
    
    // In production:
    // const response = await fetch(`${this.baseUrl}/orders?customerId=${customerId}`);
    // return response.json();

    return customerOrders;
  }

  static async getOrderById(orderId: string): Promise<Order | null> {
    await delay(300);
    
    const order = orders.find(o => o.id === orderId);
    
    // In production:
    // const response = await fetch(`${this.baseUrl}/orders/${orderId}`);
    // return response.json();

    return order || null;
  }

  static async updateOrderStatus(orderId: string, status: Order['status']): Promise<Order> {
    await delay(500);
    
    const orderIndex = orders.findIndex(o => o.id === orderId);
    if (orderIndex === -1) {
      throw new Error('Order not found');
    }

    orders[orderIndex].status = status;
    
    // In production:
    // const response = await fetch(`${this.baseUrl}/orders/${orderId}/status`, {
    //   method: 'PATCH',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ status })
    // });
    // return response.json();

    return orders[orderIndex];
  }

  // Monthly Subscription Management
  static async createSubscription(subscriptionData: {
    customerId: string;
    planId: string;
    planName: string;
    price: number;
    preferences: {
      mainCarb: string;
      mealTimes: string[];
      startDate: string;
    };
  }): Promise<MonthlySubscription> {
    await delay(1000);

    const subscriptionId = `SUB-${Date.now()}`;
    const startDate = new Date(subscriptionData.preferences.startDate);
    const validUntil = new Date(startDate.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days

    const subscription: MonthlySubscription = {
      id: subscriptionId,
      customerId: subscriptionData.customerId,
      planId: subscriptionData.planId,
      planName: subscriptionData.planName,
      price: subscriptionData.price,
      preferences: subscriptionData.preferences,
      status: 'active',
      subscribedAt: new Date().toISOString(),
      validUntil: validUntil.toISOString(),
      qrCode: `MONTHLY-QR-${subscriptionId}-${Date.now()}`
    };

    subscriptions.push(subscription);

    // In production:
    // const response = await fetch(`${this.baseUrl}/subscriptions`, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(subscriptionData)
    // });
    // return response.json();

    return subscription;
  }

  static async getSubscriptions(customerId: string): Promise<MonthlySubscription[]> {
    await delay(500);
    
    const customerSubscriptions = subscriptions.filter(sub => sub.customerId === customerId);
    
    // In production:
    // const response = await fetch(`${this.baseUrl}/subscriptions?customerId=${customerId}`);
    // return response.json();

    return customerSubscriptions;
  }

  static async updateSubscription(
    subscriptionId: string, 
    updates: Partial<MonthlySubscription>
  ): Promise<MonthlySubscription> {
    await delay(500);
    
    const subIndex = subscriptions.findIndex(s => s.id === subscriptionId);
    if (subIndex === -1) {
      throw new Error('Subscription not found');
    }

    subscriptions[subIndex] = { ...subscriptions[subIndex], ...updates };
    
    // In production:
    // const response = await fetch(`${this.baseUrl}/subscriptions/${subscriptionId}`, {
    //   method: 'PATCH',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(updates)
    // });
    // return response.json();

    return subscriptions[subIndex];
  }

  static async cancelSubscription(subscriptionId: string): Promise<void> {
    await delay(500);
    
    const subIndex = subscriptions.findIndex(s => s.id === subscriptionId);
    if (subIndex === -1) {
      throw new Error('Subscription not found');
    }

    subscriptions[subIndex].status = 'cancelled';
    
    // In production:
    // await fetch(`${this.baseUrl}/subscriptions/${subscriptionId}/cancel`, {
    //   method: 'POST'
    // });
  }

  // QR Code Verification
  static async verifyQRCode(qrCode: string): Promise<{
    valid: boolean;
    type: 'order' | 'subscription';
    data: Order | MonthlySubscription | null;
  }> {
    await delay(300);
    
    // Check orders
    const order = orders.find(o => o.qrCode === qrCode);
    if (order) {
      return { valid: true, type: 'order', data: order };
    }

    // Check subscriptions
    const subscription = subscriptions.find(s => s.qrCode === qrCode);
    if (subscription) {
      const isValid = subscription.status === 'active' && 
                     new Date(subscription.validUntil) > new Date();
      return { valid: isValid, type: 'subscription', data: subscription };
    }

    // In production:
    // const response = await fetch(`${this.baseUrl}/qr/verify`, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ qrCode })
    // });
    // return response.json();

    return { valid: false, type: 'order', data: null };
  }

  // Analytics (for admin)
  static async getOrderAnalytics(): Promise<{
    totalOrders: number;
    totalRevenue: number;
    activeSubscriptions: number;
    monthlyRevenue: number;
  }> {
    await delay(500);
    
    const analytics = {
      totalOrders: orders.length,
      totalRevenue: orders.reduce((sum, order) => sum + order.totalAmount, 0),
      activeSubscriptions: subscriptions.filter(s => s.status === 'active').length,
      monthlyRevenue: subscriptions
        .filter(s => s.status === 'active')
        .reduce((sum, sub) => sum + sub.price, 0)
    };

    // In production:
    // const response = await fetch(`${this.baseUrl}/analytics`);
    // return response.json();

    return analytics;
  }
}