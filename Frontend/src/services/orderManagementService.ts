// Order Management Service with time-based restrictions and billing
// Microservice-ready with Spring Boot backend integration

export interface TimeSlot {
  id: string;
  name: string;
  startTime: string; // "HH:MM"
  endTime: string; // "HH:MM"
  cutoffTime: string; // "HH:MM" - 2 hours before start
  isActive: boolean;
  maxOrders?: number;
  currentOrders: number;
}

export interface DailyBill {
  date: string;
  timeSlot: string;
  orders: Array<{
    orderId: string;
    customerId: string;
    customerName: string;
    roomNumber: string;
    items: Array<{ name: string; quantity: number; price: number }>;
    totalAmount: number;
    orderType: 'regular' | 'monthly';
    status: 'confirmed' | 'preparing' | 'ready' | 'delivered';
    timestamp: string;
  }>;
  totalOrders: number;
  totalRevenue: number;
  preparationDeadline: string;
}

export interface OrderRestriction {
  canOrder: boolean;
  message: string;
  nextSlot?: TimeSlot;
  timeRemaining?: string;
}

// Mock time slots configuration
let timeSlots: TimeSlot[] = [
  {
    id: 'breakfast',
    name: 'Breakfast',
    startTime: '07:00',
    endTime: '10:00',
    cutoffTime: '05:00',
    isActive: true,
    maxOrders: 50,
    currentOrders: 0
  },
  {
    id: 'lunch',
    name: 'Lunch',
    startTime: '12:00',
    endTime: '15:00',
    cutoffTime: '10:00',
    isActive: true,
    maxOrders: 100,
    currentOrders: 0
  },
  {
    id: 'evening-snacks',
    name: 'Evening Snacks',
    startTime: '16:00',
    endTime: '18:00',
    cutoffTime: '14:00',
    isActive: true,
    maxOrders: 30,
    currentOrders: 0
  },
  {
    id: 'dinner',
    name: 'Dinner',
    startTime: '19:00',
    endTime: '22:00',
    cutoffTime: '17:00',
    isActive: true,
    maxOrders: 80,
    currentOrders: 0
  }
];

// Mock orders storage
let dailyOrders: { [date: string]: DailyBill[] } = {};

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export class OrderManagementService {
  private static baseUrl = 'http://localhost:8080/api/order-management'; // Spring Boot Order Management Service

  // Time slot management
  static async getTimeSlots(): Promise<TimeSlot[]> {
    await delay(300);
    return [...timeSlots];

    // In production:
    // const response = await fetch(`${this.baseUrl}/time-slots`);
    // return response.json();
  }

  static async updateTimeSlot(slotId: string, updates: Partial<TimeSlot>): Promise<TimeSlot> {
    await delay(400);
    
    const slotIndex = timeSlots.findIndex(slot => slot.id === slotId);
    if (slotIndex === -1) {
      throw new Error('Time slot not found');
    }

    timeSlots[slotIndex] = { ...timeSlots[slotIndex], ...updates };
    return timeSlots[slotIndex];

    // In production:
    // const response = await fetch(`${this.baseUrl}/time-slots/${slotId}`, {
    //   method: 'PATCH',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(updates)
    // });
    // return response.json();
  }

  // Order time validation
  static async checkOrderAvailability(requestedSlot?: string): Promise<OrderRestriction> {
    await delay(200);

    const now = new Date();
    const currentTime = now.toTimeString().slice(0, 5); // "HH:MM"
    const today = now.toISOString().split('T')[0];

    // If specific slot requested, check that slot
    if (requestedSlot) {
      const slot = timeSlots.find(s => s.id === requestedSlot);
      if (!slot || !slot.isActive) {
        return {
          canOrder: false,
          message: `${requestedSlot} is not available today.`
        };
      }

      if (currentTime >= slot.cutoffTime && currentTime < slot.startTime) {
        return {
          canOrder: true,
          message: `Orders accepted for ${slot.name} until ${slot.cutoffTime}`,
          timeRemaining: this.calculateTimeRemaining(slot.cutoffTime)
        };
      }

      if (currentTime >= slot.cutoffTime) {
        return {
          canOrder: false,
          message: `Order cutoff time (${slot.cutoffTime}) has passed for ${slot.name}.`
        };
      }

      // Check order limits
      if (slot.maxOrders && slot.currentOrders >= slot.maxOrders) {
        return {
          canOrder: false,
          message: `${slot.name} is fully booked. Maximum ${slot.maxOrders} orders reached.`
        };
      }

      return {
        canOrder: true,
        message: `Orders open for ${slot.name}`,
        timeRemaining: this.calculateTimeRemaining(slot.cutoffTime)
      };
    }

    // Find next available slot
    const availableSlots = timeSlots.filter(slot => 
      slot.isActive && 
      currentTime < slot.cutoffTime &&
      (!slot.maxOrders || slot.currentOrders < slot.maxOrders)
    );

    if (availableSlots.length === 0) {
      // Find next day's first slot
      const nextSlot = timeSlots.find(s => s.isActive) || timeSlots[0];
      return {
        canOrder: false,
        message: 'All meal slots are closed for today.',
        nextSlot
      };
    }

    const nextSlot = availableSlots[0];
    return {
      canOrder: true,
      message: `Orders open for ${nextSlot.name}`,
      nextSlot,
      timeRemaining: this.calculateTimeRemaining(nextSlot.cutoffTime)
    };

    // In production:
    // const response = await fetch(`${this.baseUrl}/availability?slot=${requestedSlot || ''}`);
    // return response.json();
  }

  private static calculateTimeRemaining(cutoffTime: string): string {
    const now = new Date();
    const [hours, minutes] = cutoffTime.split(':').map(Number);
    const cutoff = new Date(now);
    cutoff.setHours(hours, minutes, 0, 0);

    if (cutoff < now) {
      // Cutoff is tomorrow
      cutoff.setDate(cutoff.getDate() + 1);
    }

    const diff = cutoff.getTime() - now.getTime();
    const remainingHours = Math.floor(diff / (1000 * 60 * 60));
    const remainingMinutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    return `${remainingHours}h ${remainingMinutes}m`;
  }

  // Order placement with time validation
  static async placeTimedOrder(orderData: {
    customerId: string;
    timeSlotId: string;
    items: Array<{ id: string; name: string; quantity: number; price: number }>;
    totalAmount: number;
    customerDetails: any;
  }): Promise<{ orderId: string; preparationDeadline: string; estimatedDelivery: string }> {
    await delay(800);

    // Validate time slot availability
    const availability = await this.checkOrderAvailability(orderData.timeSlotId);
    if (!availability.canOrder) {
      throw new Error(availability.message);
    }

    const orderId = `ORD-${Date.now()}`;
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    
    const timeSlot = timeSlots.find(s => s.id === orderData.timeSlotId);
    if (!timeSlot) {
      throw new Error('Invalid time slot');
    }

    // Calculate preparation deadline (30 minutes before meal time)
    const [hours, minutes] = timeSlot.startTime.split(':').map(Number);
    const mealTime = new Date(now);
    mealTime.setHours(hours, minutes, 0, 0);
    const preparationDeadline = new Date(mealTime.getTime() - 30 * 60 * 1000);

    // Estimate delivery time (10 minutes after meal start)
    const estimatedDelivery = new Date(mealTime.getTime() + 10 * 60 * 1000);

    const order = {
      orderId,
      customerId: orderData.customerId,
      customerName: orderData.customerDetails.name,
      roomNumber: orderData.customerDetails.roomNumber,
      items: orderData.items,
      totalAmount: orderData.totalAmount,
      orderType: 'regular' as const,
      status: 'confirmed' as const,
      timestamp: now.toISOString()
    };

    // Add to daily orders
    if (!dailyOrders[today]) {
      dailyOrders[today] = [];
    }

    let dayBill = dailyOrders[today].find(bill => bill.timeSlot === orderData.timeSlotId);
    if (!dayBill) {
      dayBill = {
        date: today,
        timeSlot: orderData.timeSlotId,
        orders: [],
        totalOrders: 0,
        totalRevenue: 0,
        preparationDeadline: preparationDeadline.toISOString()
      };
      dailyOrders[today].push(dayBill);
    }

    dayBill.orders.push(order);
    dayBill.totalOrders++;
    dayBill.totalRevenue += orderData.totalAmount;

    // Update slot current orders count
    timeSlot.currentOrders++;

    return {
      orderId,
      preparationDeadline: preparationDeadline.toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit'
      }),
      estimatedDelivery: estimatedDelivery.toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit'
      })
    };

    // In production:
    // const response = await fetch(`${this.baseUrl}/orders`, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(orderData)
    // });
    // return response.json();
  }

  // Daily billing and reports
  static async getDailyBill(date: string): Promise<DailyBill[]> {
    await delay(500);
    
    return dailyOrders[date] || [];

    // In production:
    // const response = await fetch(`${this.baseUrl}/daily-bill/${date}`);
    // return response.json();
  }

  static async generatePreparationList(date: string, timeSlotId: string): Promise<{
    timeSlot: string;
    preparationDeadline: string;
    orders: Array<{
      orderId: string;
      customerName: string;
      roomNumber: string;
      items: Array<{ name: string; quantity: number }>;
      totalQuantityByItem: { [itemName: string]: number };
    }>;
    summary: {
      totalOrders: number;
      totalItems: number;
      itemBreakdown: { [itemName: string]: number };
    };
  }> {
    await delay(600);

    const dayBill = dailyOrders[date]?.find(bill => bill.timeSlot === timeSlotId);
    if (!dayBill) {
      throw new Error('No orders found for the specified date and time slot');
    }

    const itemBreakdown: { [itemName: string]: number } = {};
    let totalItems = 0;

    dayBill.orders.forEach(order => {
      order.items.forEach(item => {
        itemBreakdown[item.name] = (itemBreakdown[item.name] || 0) + item.quantity;
        totalItems += item.quantity;
      });
    });

    const ordersWithBreakdown = dayBill.orders.map(order => {
      const totalQuantityByItem: { [itemName: string]: number } = {};
      order.items.forEach(item => {
        totalQuantityByItem[item.name] = item.quantity;
      });

      return {
        orderId: order.orderId,
        customerName: order.customerName,
        roomNumber: order.roomNumber,
        items: order.items.map(item => ({ name: item.name, quantity: item.quantity })),
        totalQuantityByItem
      };
    });

    return {
      timeSlot: timeSlotId,
      preparationDeadline: dayBill.preparationDeadline,
      orders: ordersWithBreakdown,
      summary: {
        totalOrders: dayBill.totalOrders,
        totalItems,
        itemBreakdown
      }
    };

    // In production:
    // const response = await fetch(`${this.baseUrl}/preparation-list/${date}/${timeSlotId}`);
    // return response.json();
  }

  static async getOrderAnalytics(startDate: string, endDate?: string): Promise<{
    totalOrders: number;
    totalRevenue: number;
    ordersByTimeSlot: { [timeSlot: string]: number };
    revenueByTimeSlot: { [timeSlot: string]: number };
    dailyBreakdown: Array<{
      date: string;
      orders: number;
      revenue: number;
    }>;
    popularItems: Array<{
      name: string;
      quantity: number;
      orders: number;
    }>;
  }> {
    await delay(800);

    const end = endDate || startDate;
    const dates = this.getDateRange(startDate, end);
    
    let totalOrders = 0;
    let totalRevenue = 0;
    const ordersByTimeSlot: { [timeSlot: string]: number } = {};
    const revenueByTimeSlot: { [timeSlot: string]: number } = {};
    const dailyBreakdown: Array<{ date: string; orders: number; revenue: number }> = [];
    const itemCounts: { [itemName: string]: { quantity: number; orders: number } } = {};

    dates.forEach(date => {
      const dayBills = dailyOrders[date] || [];
      let dayOrders = 0;
      let dayRevenue = 0;

      dayBills.forEach(bill => {
        dayOrders += bill.totalOrders;
        dayRevenue += bill.totalRevenue;
        
        ordersByTimeSlot[bill.timeSlot] = (ordersByTimeSlot[bill.timeSlot] || 0) + bill.totalOrders;
        revenueByTimeSlot[bill.timeSlot] = (revenueByTimeSlot[bill.timeSlot] || 0) + bill.totalRevenue;

        bill.orders.forEach(order => {
          order.items.forEach(item => {
            if (!itemCounts[item.name]) {
              itemCounts[item.name] = { quantity: 0, orders: 0 };
            }
            itemCounts[item.name].quantity += item.quantity;
            itemCounts[item.name].orders++;
          });
        });
      });

      totalOrders += dayOrders;
      totalRevenue += dayRevenue;
      dailyBreakdown.push({ date, orders: dayOrders, revenue: dayRevenue });
    });

    const popularItems = Object.entries(itemCounts)
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 10);

    return {
      totalOrders,
      totalRevenue,
      ordersByTimeSlot,
      revenueByTimeSlot,
      dailyBreakdown,
      popularItems
    };

    // In production:
    // const response = await fetch(`${this.baseUrl}/analytics?start=${startDate}&end=${end}`);
    // return response.json();
  }

  private static getDateRange(startDate: string, endDate: string): string[] {
    const dates: string[] = [];
    const start = new Date(startDate);
    const end = new Date(endDate);

    while (start <= end) {
      dates.push(start.toISOString().split('T')[0]);
      start.setDate(start.getDate() + 1);
    }

    return dates;
  }

  // Reset daily counters (typically called at midnight)
  static async resetDailyCounters(): Promise<void> {
    await delay(200);
    
    timeSlots.forEach(slot => {
      slot.currentOrders = 0;
    });

    // In production:
    // await fetch(`${this.baseUrl}/reset-counters`, { method: 'POST' });
  }

  // Emergency order management
  static async emergencyOrderOverride(orderData: any, adminId: string): Promise<{ orderId: string; warning: string }> {
    await delay(500);

    const orderId = `EMERGENCY-${Date.now()}`;
    const warning = 'Emergency order placed outside normal time restrictions. Kitchen staff notified.';

    // This would bypass normal time restrictions for emergency situations
    console.log(`Emergency order ${orderId} placed by admin ${adminId}`);

    return { orderId, warning };

    // In production:
    // const response = await fetch(`${this.baseUrl}/emergency-order`, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ ...orderData, adminId })
    // });
    // return response.json();
  }
}