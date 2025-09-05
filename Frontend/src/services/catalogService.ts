// Food Catalog Service for Admin food item management
// Microservice-ready with Spring Boot backend integration

export interface FoodItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: 'breakfast' | 'lunch' | 'dinner' | 'snacks';
  image: string;
  available: boolean;
  rating?: number;
  isPopular?: boolean;
  isVeg?: boolean;
  isSpicy?: boolean;
  ingredients?: string[];
  preparationTime?: number; // in minutes
  nutritionInfo?: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  mealTimes?: string[]; // ['breakfast', 'lunch', 'dinner']
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface MealTimeConfig {
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snacks';
  startTime: string; // "08:00"
  endTime: string; // "10:00"
  orderCutoffTime: string; // "06:00" (2 hours before)
  isActive: boolean;
}

// Mock data
let foodItems: FoodItem[] = [
  {
    id: '1',
    name: 'Chicken Biryani',
    description: 'Aromatic basmati rice cooked with tender chicken pieces and traditional spices',
    price: 120,
    category: 'lunch',
    image: 'https://images.unsplash.com/photo-1563379091339-03246963d321?w=300&h=200&fit=crop',
    available: true,
    isPopular: true,
    isVeg: false,
    isSpicy: true,
    rating: 4.8,
    ingredients: ['Basmati Rice', 'Chicken', 'Onions', 'Spices', 'Mint'],
    preparationTime: 45,
    nutritionInfo: { calories: 580, protein: 25, carbs: 65, fat: 18 },
    mealTimes: ['lunch', 'dinner'],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    createdBy: 'admin'
  },
  {
    id: '2',
    name: 'Paneer Butter Masala',
    description: 'Creamy tomato curry with soft paneer cubes in rich cashew gravy',
    price: 95,
    category: 'lunch',
    image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=300&h=200&fit=crop',
    available: true,
    isVeg: true,
    isSpicy: false,
    rating: 4.6,
    ingredients: ['Paneer', 'Tomatoes', 'Cashews', 'Cream', 'Spices'],
    preparationTime: 30,
    nutritionInfo: { calories: 420, protein: 18, carbs: 25, fat: 28 },
    mealTimes: ['lunch', 'dinner'],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    createdBy: 'admin'
  }
];

let mealTimeConfigs: MealTimeConfig[] = [
  {
    mealType: 'breakfast',
    startTime: '07:00',
    endTime: '10:00',
    orderCutoffTime: '05:00',
    isActive: true
  },
  {
    mealType: 'lunch',
    startTime: '12:00',
    endTime: '15:00',
    orderCutoffTime: '10:00',
    isActive: true
  },
  {
    mealType: 'dinner',
    startTime: '19:00',
    endTime: '22:00',
    orderCutoffTime: '17:00',
    isActive: true
  },
  {
    mealType: 'snacks',
    startTime: '16:00',
    endTime: '18:00',
    orderCutoffTime: '14:00',
    isActive: true
  }
];

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export class CatalogService {
  private static baseUrl = 'http://localhost:8080/api/catalog'; // Spring Boot Catalog Service

  // Food Item Management
  static async getFoodItems(category?: string, available?: boolean): Promise<FoodItem[]> {
    await delay(500);
    
    let items = [...foodItems];
    
    if (category) {
      items = items.filter(item => item.category === category);
    }
    
    if (available !== undefined) {
      items = items.filter(item => item.available === available);
    }

    // In production:
    // const params = new URLSearchParams();
    // if (category) params.append('category', category);
    // if (available !== undefined) params.append('available', available.toString());
    // const response = await fetch(`${this.baseUrl}/items?${params}`);
    // return response.json();

    return items;
  }

  static async getFoodItemById(id: string): Promise<FoodItem | null> {
    await delay(300);
    
    const item = foodItems.find(item => item.id === id);
    return item || null;

    // In production:
    // const response = await fetch(`${this.baseUrl}/items/${id}`);
    // if (response.status === 404) return null;
    // return response.json();
  }

  static async createFoodItem(itemData: Omit<FoodItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<FoodItem> {
    await delay(800);

    const newItem: FoodItem = {
      ...itemData,
      id: `item-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    foodItems.push(newItem);
    return newItem;

    // In production:
    // const response = await fetch(`${this.baseUrl}/items`, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(itemData)
    // });
    // return response.json();
  }

  static async updateFoodItem(id: string, updates: Partial<FoodItem>): Promise<FoodItem> {
    await delay(600);

    const itemIndex = foodItems.findIndex(item => item.id === id);
    if (itemIndex === -1) {
      throw new Error('Food item not found');
    }

    foodItems[itemIndex] = {
      ...foodItems[itemIndex],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    return foodItems[itemIndex];

    // In production:
    // const response = await fetch(`${this.baseUrl}/items/${id}`, {
    //   method: 'PATCH',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(updates)
    // });
    // return response.json();
  }

  static async deleteFoodItem(id: string): Promise<void> {
    await delay(400);

    const itemIndex = foodItems.findIndex(item => item.id === id);
    if (itemIndex === -1) {
      throw new Error('Food item not found');
    }

    foodItems.splice(itemIndex, 1);

    // In production:
    // await fetch(`${this.baseUrl}/items/${id}`, { method: 'DELETE' });
  }

  static async toggleItemAvailability(id: string): Promise<FoodItem> {
    await delay(300);

    const item = foodItems.find(item => item.id === id);
    if (!item) {
      throw new Error('Food item not found');
    }

    item.available = !item.available;
    item.updatedAt = new Date().toISOString();

    return item;

    // In production:
    // const response = await fetch(`${this.baseUrl}/items/${id}/toggle-availability`, {
    //   method: 'POST'
    // });
    // return response.json();
  }

  // Meal Time Configuration
  static async getMealTimeConfigs(): Promise<MealTimeConfig[]> {
    await delay(300);
    return [...mealTimeConfigs];

    // In production:
    // const response = await fetch(`${this.baseUrl}/meal-times`);
    // return response.json();
  }

  static async updateMealTimeConfig(mealType: string, config: Partial<MealTimeConfig>): Promise<MealTimeConfig> {
    await delay(400);

    const configIndex = mealTimeConfigs.findIndex(c => c.mealType === mealType);
    if (configIndex === -1) {
      throw new Error('Meal time configuration not found');
    }

    mealTimeConfigs[configIndex] = {
      ...mealTimeConfigs[configIndex],
      ...config
    };

    return mealTimeConfigs[configIndex];

    // In production:
    // const response = await fetch(`${this.baseUrl}/meal-times/${mealType}`, {
    //   method: 'PATCH',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(config)
    // });
    // return response.json();
  }

  // Order Availability Check
  static async checkOrderAvailability(mealType: string): Promise<{
    canOrder: boolean;
    message: string;
    cutoffTime?: string;
    nextAvailableTime?: string;
  }> {
    await delay(200);

    const config = mealTimeConfigs.find(c => c.mealType === mealType);
    if (!config || !config.isActive) {
      return {
        canOrder: false,
        message: `${mealType} orders are not available today.`
      };
    }

    const now = new Date();
    const currentTime = now.toTimeString().slice(0, 5); // "HH:MM"

    // Check if current time is before cutoff
    if (currentTime < config.orderCutoffTime) {
      return {
        canOrder: true,
        message: `Orders accepted until ${config.orderCutoffTime} for ${mealType} (${config.startTime}-${config.endTime})`,
        cutoffTime: config.orderCutoffTime
      };
    }

    // Check if within meal time but past cutoff
    if (currentTime >= config.startTime && currentTime <= config.endTime) {
      return {
        canOrder: false,
        message: `Order cutoff time (${config.orderCutoffTime}) has passed for ${mealType}.`,
        cutoffTime: config.orderCutoffTime
      };
    }

    // Find next meal time
    const allConfigs = mealTimeConfigs.filter(c => c.isActive);
    const nextConfig = allConfigs.find(c => c.orderCutoffTime > currentTime) || allConfigs[0];

    return {
      canOrder: false,
      message: `${mealType} is not available now. Next meal time starts at ${nextConfig.startTime}`,
      nextAvailableTime: nextConfig.startTime
    };

    // In production:
    // const response = await fetch(`${this.baseUrl}/availability/${mealType}`);
    // return response.json();
  }

  // Categories and Statistics
  static async getCategorySummary(): Promise<Array<{
    category: string;
    totalItems: number;
    availableItems: number;
    averagePrice: number;
  }>> {
    await delay(300);

    const categories = ['breakfast', 'lunch', 'dinner', 'snacks'];
    const summary = categories.map(category => {
      const categoryItems = foodItems.filter(item => item.category === category);
      const availableItems = categoryItems.filter(item => item.available);
      const averagePrice = categoryItems.length > 0 
        ? categoryItems.reduce((sum, item) => sum + item.price, 0) / categoryItems.length 
        : 0;

      return {
        category,
        totalItems: categoryItems.length,
        availableItems: availableItems.length,
        averagePrice: Math.round(averagePrice)
      };
    });

    return summary;

    // In production:
    // const response = await fetch(`${this.baseUrl}/summary`);
    // return response.json();
  }

  // Bulk Operations
  static async bulkUpdateAvailability(itemIds: string[], available: boolean): Promise<void> {
    await delay(600);

    itemIds.forEach(id => {
      const item = foodItems.find(item => item.id === id);
      if (item) {
        item.available = available;
        item.updatedAt = new Date().toISOString();
      }
    });

    // In production:
    // await fetch(`${this.baseUrl}/items/bulk-availability`, {
    //   method: 'PATCH',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ itemIds, available })
    // });
  }

  static async importFoodItems(items: Omit<FoodItem, 'id' | 'createdAt' | 'updatedAt'>[]): Promise<FoodItem[]> {
    await delay(1000);

    const newItems = items.map((itemData, index) => ({
      ...itemData,
      id: `imported-${Date.now()}-${index}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }));

    foodItems.push(...newItems);
    return newItems;

    // In production:
    // const response = await fetch(`${this.baseUrl}/items/import`, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(items)
    // });
    // return response.json();
  }
}