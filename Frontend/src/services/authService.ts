// Enhanced Authentication Service for Admin, Agent, and Customer roles
// Microservice-ready with Spring Boot backend integration

export interface User {
  id: string;
  username: string;
  email: string;
  fullName: string;
  phone: string;
  roomNumber?: string;
  role: "admin" | "agent" | "customer";
  status: "active" | "pending" | "suspended";
  createdAt: string;
  lastLogin?: string;
  permissions?: string[];
  assignedArea?: string; // For agents - which area/floors they cover
}

export interface LoginCredentials {
  username: string;
  password: string;
  role?: "admin" | "agent" | "customer";
}

export interface SignupData {
  username: string;
  password: string;
  email: string;
  fullName: string;
  phone: string;
  roomNumber: string;
}

// Mock database
let users: User[] = [
  {
    id: "admin-1",
    username: "admin",
    email: "admin@srguesthouse.com",
    fullName: "Administrator",
    phone: "+91-9876543210",
    role: "admin",
    status: "active",
    createdAt: "2024-01-01T00:00:00Z",
    permissions: ["all"],
  },
  {
    id: "agent-1",
    username: "agent001",
    email: "agent1@srguesthouse.com",
    fullName: "Delivery Agent 1",
    phone: "+91-9876543211",
    role: "agent",
    status: "active",
    createdAt: "2024-01-01T00:00:00Z",
    assignedArea: "Floor 1-2",
    permissions: ["scan_qr", "view_orders", "update_delivery_status"],
  },
  {
    id: "customer-1",
    username: "customer1",
    email: "customer@gmail.com",
    fullName: "Customer",
    phone: "+91-9876543210",
    role: "customer",
    status: "active",
    createdAt: "2024-01-01T00:00:00Z",
    permissions: [""],
  },
];

let pendingRegistrations: User[] = [];

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export class AuthService {
  private static baseUrl = "http://localhost:8080/api/auth"; // Spring Boot Auth Service

  // Authentication
  static async login(
    credentials: LoginCredentials
  ): Promise<{ user: User; token: string }> {
    await delay(1000);

    // Default admin credentials
    if (credentials.username === "admin" && credentials.password === "admin") {
      const adminUser = users.find(
        (u) => u.username === "admin" && u.role === "admin"
      );
      if (adminUser) {
        adminUser.lastLogin = new Date().toISOString();
        return {
          user: adminUser,
          token: `admin-token-${Date.now()}`,
        };
      }
    }

    // Agent login
    const agent = users.find(
      (u) =>
        u.username === credentials.username &&
        u.role === "agent" &&
        u.status === "active"
    );

    if (agent && credentials.password === "agent123") {
      // Demo password
      agent.lastLogin = new Date().toISOString();
      return {
        user: agent,
        token: `agent-token-${Date.now()}`,
      };
    }

    // Customer login - check if approved
    const customer = users.find(
      (u) =>
        u.username === credentials.username &&
        u.role === "customer" &&
        u.status === "active"
    );

    if (customer && credentials.password === "customer123") {
      // Demo password
      customer.lastLogin = new Date().toISOString();
      return {
        user: customer,
        token: `customer-token-${Date.now()}`,
      };
    }

    throw new Error("Invalid credentials or account not approved");
  }

  static async signup(
    signupData: SignupData
  ): Promise<{ message: string; requiresApproval: boolean }> {
    await delay(800);

    // Check if username already exists
    const existingUser = users.find((u) => u.username === signupData.username);
    const pendingUser = pendingRegistrations.find(
      (u) => u.username === signupData.username
    );

    if (existingUser || pendingUser) {
      throw new Error("Username already exists");
    }

    // Create pending registration
    const newUser: User = {
      id: `pending-${Date.now()}`,
      username: signupData.username,
      email: signupData.email,
      fullName: signupData.fullName,
      phone: signupData.phone,
      roomNumber: signupData.roomNumber,
      role: "customer",
      status: "pending",
      createdAt: new Date().toISOString(),
    };

    pendingRegistrations.push(newUser);

    // In production:
    // const response = await fetch(`${this.baseUrl}/signup`, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(signupData)
    // });

    return {
      message: "Registration submitted. Awaiting admin approval.",
      requiresApproval: true,
    };
  }

  // Admin Functions
  static async getPendingRegistrations(): Promise<User[]> {
    await delay(500);
    return pendingRegistrations;
  }

  static async approveRegistration(userId: string): Promise<void> {
    await delay(500);

    const userIndex = pendingRegistrations.findIndex((u) => u.id === userId);
    if (userIndex === -1) {
      throw new Error("Registration not found");
    }

    const user = pendingRegistrations[userIndex];
    user.status = "active";
    user.id = `user-${Date.now()}`;

    users.push(user);
    pendingRegistrations.splice(userIndex, 1);

    // In production:
    // await fetch(`${this.baseUrl}/approve/${userId}`, { method: 'POST' });
  }

  static async rejectRegistration(userId: string): Promise<void> {
    await delay(500);

    const userIndex = pendingRegistrations.findIndex((u) => u.id === userId);
    if (userIndex === -1) {
      throw new Error("Registration not found");
    }

    pendingRegistrations.splice(userIndex, 1);

    // In production:
    // await fetch(`${this.baseUrl}/reject/${userId}`, { method: 'POST' });
  }

  static async createAgent(agentData: {
    username: string;
    email: string;
    fullName: string;
    phone: string;
    assignedArea: string;
  }): Promise<User> {
    await delay(500);

    const newAgent: User = {
      id: `agent-${Date.now()}`,
      username: agentData.username,
      email: agentData.email,
      fullName: agentData.fullName,
      phone: agentData.phone,
      role: "agent",
      status: "active",
      createdAt: new Date().toISOString(),
      assignedArea: agentData.assignedArea,
      permissions: ["scan_qr", "view_orders", "update_delivery_status"],
    };

    users.push(newAgent);
    return newAgent;

    // In production:
    // const response = await fetch(`${this.baseUrl}/agents`, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(agentData)
    // });
    // return response.json();
  }

  static async getUsers(role?: string): Promise<User[]> {
    await delay(300);

    if (role) {
      return users.filter((u) => u.role === role);
    }
    return users;
  }

  static async updateUserStatus(
    userId: string,
    status: User["status"]
  ): Promise<void> {
    await delay(300);

    const user = users.find((u) => u.id === userId);
    if (!user) {
      throw new Error("User not found");
    }

    user.status = status;

    // In production:
    // await fetch(`${this.baseUrl}/users/${userId}/status`, {
    //   method: 'PATCH',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ status })
    // });
  }

  static async deleteUser(userId: string): Promise<void> {
    await delay(300);

    const userIndex = users.findIndex((u) => u.id === userId);
    if (userIndex === -1) {
      throw new Error("User not found");
    }

    users.splice(userIndex, 1);

    // In production:
    // await fetch(`${this.baseUrl}/users/${userId}`, { method: 'DELETE' });
  }

  // Agent Functions
  static async verifyQRCode(
    qrCode: string,
    agentId: string
  ): Promise<{
    valid: boolean;
    orderData?: any;
    customerData?: any;
    message: string;
  }> {
    await delay(800);

    // Simulate QR verification
    if (qrCode.startsWith("QR-ORD-") || qrCode.startsWith("MONTHLY-QR-")) {
      return {
        valid: true,
        orderData: {
          orderId: qrCode,
          customerName: "John Doe",
          roomNumber: "A-101",
          items: ["Chicken Biryani", "Raita"],
          totalAmount: 120,
          orderType: qrCode.startsWith("MONTHLY") ? "monthly" : "regular",
        },
        customerData: {
          name: "John Doe",
          room: "A-101",
          phone: "+91-9876543210",
        },
        message: "Valid order. Ready for delivery.",
      };
    }

    return {
      valid: false,
      message: "Invalid QR code or order not found.",
    };
  }

  static async markOrderDelivered(
    orderId: string,
    agentId: string
  ): Promise<void> {
    await delay(500);

    // In production, this would update the order status in the Order service
    console.log(`Order ${orderId} marked as delivered by agent ${agentId}`);

    // await fetch(`${this.baseUrl}/orders/${orderId}/deliver`, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ agentId })
    // });
  }

  // Token validation
  static async validateToken(token: string): Promise<User | null> {
    await delay(200);

    // Simple token validation for demo
    if (token.startsWith("admin-token-")) {
      return users.find((u) => u.role === "admin") || null;
    }
    if (token.startsWith("agent-token-")) {
      return users.find((u) => u.role === "agent") || null;
    }
    if (token.startsWith("customer-token-")) {
      return users.find((u) => u.role === "customer") || null;
    }

    return null;
  }
}
