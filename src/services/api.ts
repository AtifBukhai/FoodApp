/**
 * KhaanaDa API Client
 * 
 * This module defines the API interfaces and client for backend integration.
 * Currently uses mock data for demo mode. When backend is implemented (Milestone 2),
 * replace mock implementations with actual HTTP calls.
 * 
 * Architecture:
 * - All API calls go through this client
 * - Frontend components never call fetch/axios directly
 * - Easy to swap mock → real API by changing implementation
 * - Type-safe request/response contracts
 */

import { Restaurant, MenuItem, Order, User, Address, Category, CartItem, OrderStatus } from '../types';
import { restaurants, menuItems, categories, sampleOrders, defaultAddresses } from '../data';

// ============================================================================
// API Configuration
// ============================================================================

export interface ApiConfig {
  baseUrl: string;
  timeout: number;
  headers: Record<string, string>;
}

const DEFAULT_CONFIG: ApiConfig = {
  baseUrl: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
};

// ============================================================================
// API Response Types
// ============================================================================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// ============================================================================
// Request Types
// ============================================================================

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  phone: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
}

export interface CreateOrderRequest {
  restaurantId: string;
  items: { menuItemId: string; quantity: number; notes?: string; modifiers?: { modifierId: string; optionId: string }[] }[];
  deliveryAddressId: string;
  paymentMethod: 'cod' | 'online';
}

export interface RestaurantFilters {
  cuisine?: string;
  search?: string;
  sortBy?: 'rating' | 'delivery_time' | 'price';
  page?: number;
  limit?: number;
}

export interface CreateAddressRequest {
  label: string;
  street: string;
  city: string;
  area: string;
  isDefault?: boolean;
}

// ============================================================================
// API Client Interface
// ============================================================================

export interface ApiClient {
  // Authentication
  login(request: LoginRequest): Promise<ApiResponse<AuthResponse>>;
  register(request: RegisterRequest): Promise<ApiResponse<AuthResponse>>;
  logout(): Promise<ApiResponse<void>>;
  refreshToken(): Promise<ApiResponse<{ token: string }>>;
  getCurrentUser(): Promise<ApiResponse<User>>;

  // Restaurants
  getRestaurants(filters?: RestaurantFilters): Promise<ApiResponse<PaginatedResponse<Restaurant>>>;
  getRestaurant(id: string): Promise<ApiResponse<Restaurant>>;
  getRestaurantMenu(restaurantId: string): Promise<ApiResponse<MenuItem[]>>;
  getCategories(): Promise<ApiResponse<Category[]>>;

  // Cart & Checkout
  calculateCart(items: CartItem[], restaurantId: string): Promise<ApiResponse<{
    subtotal: number;
    deliveryFee: number;
    tax: number;
    discount: number;
    total: number;
  }>>;
  validateOrder(request: CreateOrderRequest): Promise<ApiResponse<{ valid: boolean; errors?: string[] }>>;

  // Orders
  createOrder(request: CreateOrderRequest): Promise<ApiResponse<Order>>;
  getOrders(): Promise<ApiResponse<Order[]>>;
  getOrder(id: string): Promise<ApiResponse<Order>>;
  cancelOrder(id: string): Promise<ApiResponse<Order>>;

  // User Profile
  updateProfile(data: Partial<User>): Promise<ApiResponse<User>>;
  getAddresses(): Promise<ApiResponse<Address[]>>;
  createAddress(request: CreateAddressRequest): Promise<ApiResponse<Address>>;
  deleteAddress(id: string): Promise<ApiResponse<void>>;
}

// ============================================================================
// Mock API Client (Demo Mode)
// ============================================================================

/**
 * Mock implementation of the API client.
 * Used during development before backend is available.
 * 
 * TODO: Replace with real HTTP client when backend is ready.
 */
class MockApiClient implements ApiClient {
  private currentUser: User | null = null;
  private orders: Order[] = [...sampleOrders];
  private addresses: Address[] = [...defaultAddresses];

  // Simulate network delay
  private async delay(ms: number = 300): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Authentication
  async login(request: LoginRequest): Promise<ApiResponse<AuthResponse>> {
    await this.delay();
    
    // Demo: Accept any credentials
    const user: User = {
      id: 'u1',
      name: 'Demo User',
      email: request.email,
      phone: '+92 300 1234567',
      addresses: this.addresses,
    };
    
    this.currentUser = user;
    
    return {
      success: true,
      data: {
        user,
        token: 'demo-jwt-token-' + Date.now(),
        refreshToken: 'demo-refresh-token-' + Date.now(),
      },
    };
  }

  async register(request: RegisterRequest): Promise<ApiResponse<AuthResponse>> {
    await this.delay();
    
    const user: User = {
      id: 'u-' + Date.now(),
      name: request.name,
      email: request.email,
      phone: request.phone,
      addresses: [],
    };
    
    this.currentUser = user;
    
    return {
      success: true,
      data: {
        user,
        token: 'demo-jwt-token-' + Date.now(),
        refreshToken: 'demo-refresh-token-' + Date.now(),
      },
    };
  }

  async logout(): Promise<ApiResponse<void>> {
    await this.delay();
    this.currentUser = null;
    return { success: true };
  }

  async refreshToken(): Promise<ApiResponse<{ token: string }>> {
    await this.delay();
    return {
      success: true,
      data: { token: 'demo-refreshed-token-' + Date.now() },
    };
  }

  async getCurrentUser(): Promise<ApiResponse<User>> {
    await this.delay();
    if (!this.currentUser) {
      return { success: false, error: 'Not authenticated' };
    }
    return { success: true, data: this.currentUser };
  }

  // Restaurants
  async getRestaurants(filters?: RestaurantFilters): Promise<ApiResponse<PaginatedResponse<Restaurant>>> {
    await this.delay();
    
    let filtered = [...restaurants];
    
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      filtered = filtered.filter(r =>
        r.name.toLowerCase().includes(q) ||
        r.cuisine.some(c => c.toLowerCase().includes(q))
      );
    }
    
    if (filters?.cuisine) {
      filtered = filtered.filter(r =>
        r.cuisine.some(c => c.toLowerCase().replace(/\s+/g, '-') === filters.cuisine)
      );
    }
    
    if (filters?.sortBy === 'rating') {
      filtered.sort((a, b) => b.rating - a.rating);
    }
    
    return {
      success: true,
      data: {
        items: filtered,
        total: filtered.length,
        page: 1,
        limit: 50,
        hasMore: false,
      },
    };
  }

  async getRestaurant(id: string): Promise<ApiResponse<Restaurant>> {
    await this.delay();
    const restaurant = restaurants.find(r => r.id === id);
    if (!restaurant) {
      return { success: false, error: 'Restaurant not found' };
    }
    return { success: true, data: restaurant };
  }

  async getRestaurantMenu(restaurantId: string): Promise<ApiResponse<MenuItem[]>> {
    await this.delay();
    const items = menuItems.filter(m => m.restaurantId === restaurantId);
    return { success: true, data: items };
  }

  async getCategories(): Promise<ApiResponse<Category[]>> {
    await this.delay();
    return { success: true, data: categories };
  }

  // Cart & Checkout
  async calculateCart(items: CartItem[], _restaurantId: string): Promise<ApiResponse<{
    subtotal: number;
    deliveryFee: number;
    tax: number;
    discount: number;
    total: number;
  }>> {
    await this.delay();
    
    const subtotal = items.reduce((sum, item) => {
      const itemPrice = item.menuItem.price + item.selectedModifiers.reduce((s, m) => s + m.price, 0);
      return sum + itemPrice * item.quantity;
    }, 0);
    
    const deliveryFee = 80;
    const tax = Math.round(subtotal * 0.05);
    const discount = 0;
    const total = subtotal + deliveryFee + tax - discount;
    
    return {
      success: true,
      data: { subtotal, deliveryFee, tax, discount, total },
    };
  }

  async validateOrder(request: CreateOrderRequest): Promise<ApiResponse<{ valid: boolean; errors?: string[] }>> {
    await this.delay();
    
    const errors: string[] = [];
    
    if (!request.items.length) {
      errors.push('Order must have at least one item');
    }
    
    if (!request.deliveryAddressId) {
      errors.push('Delivery address is required');
    }
    
    return {
      success: true,
      data: { valid: errors.length === 0, errors: errors.length ? errors : undefined },
    };
  }

  // Orders
  async createOrder(request: CreateOrderRequest): Promise<ApiResponse<Order>> {
    await this.delay();
    
    const restaurant = restaurants.find(r => r.id === request.restaurantId);
    const address = this.addresses.find(a => a.id === request.deliveryAddressId);
    
    if (!restaurant || !address) {
      return { success: false, error: 'Invalid restaurant or address' };
    }
    
    // Map request items to cart items
    const cartItems: CartItem[] = request.items.map(item => {
      const menuItem = menuItems.find(m => m.id === item.menuItemId);
      if (!menuItem) throw new Error(`Menu item ${item.menuItemId} not found`);
      return {
        menuItem,
        quantity: item.quantity,
        selectedModifiers: [],
        notes: item.notes || '',
      };
    });
    
    const subtotal = cartItems.reduce((sum, item) => sum + item.menuItem.price * item.quantity, 0);
    const deliveryFee = 80;
    const tax = Math.round(subtotal * 0.05);
    
    const order: Order = {
      id: 'KD-' + Date.now().toString(36).toUpperCase(),
      restaurantId: request.restaurantId,
      restaurantName: restaurant.name,
      items: cartItems,
      subtotal,
      deliveryFee,
      tax,
      discount: 0,
      total: subtotal + deliveryFee + tax,
      status: 'pending',
      paymentMethod: request.paymentMethod,
      deliveryAddress: address,
      createdAt: new Date().toISOString(),
      estimatedDelivery: new Date(Date.now() + 35 * 60000).toISOString(),
      trackingEvents: [
        { status: 'pending', timestamp: new Date().toISOString(), message: 'Order placed' },
      ],
    };
    
    this.orders.unshift(order);
    
    return { success: true, data: order };
  }

  async getOrders(): Promise<ApiResponse<Order[]>> {
    await this.delay();
    return { success: true, data: this.orders };
  }

  async getOrder(id: string): Promise<ApiResponse<Order>> {
    await this.delay();
    const order = this.orders.find(o => o.id === id);
    if (!order) {
      return { success: false, error: 'Order not found' };
    }
    return { success: true, data: order };
  }

  async cancelOrder(id: string): Promise<ApiResponse<Order>> {
    await this.delay();
    const order = this.orders.find(o => o.id === id);
    if (!order) {
      return { success: false, error: 'Order not found' };
    }
    if (order.status !== 'pending' && order.status !== 'confirmed') {
      return { success: false, error: 'Order cannot be cancelled at this stage' };
    }
    order.status = 'cancelled';
    order.trackingEvents.push({
      status: 'cancelled',
      timestamp: new Date().toISOString(),
      message: 'Order cancelled',
    });
    return { success: true, data: order };
  }

  // User Profile
  async updateProfile(data: Partial<User>): Promise<ApiResponse<User>> {
    await this.delay();
    if (!this.currentUser) {
      return { success: false, error: 'Not authenticated' };
    }
    this.currentUser = { ...this.currentUser, ...data };
    return { success: true, data: this.currentUser };
  }

  async getAddresses(): Promise<ApiResponse<Address[]>> {
    await this.delay();
    return { success: true, data: this.addresses };
  }

  async createAddress(request: CreateAddressRequest): Promise<ApiResponse<Address>> {
    await this.delay();
    const address: Address = {
      id: 'a-' + Date.now(),
      ...request,
      isDefault: request.isDefault || false,
    };
    this.addresses.push(address);
    return { success: true, data: address };
  }

  async deleteAddress(id: string): Promise<ApiResponse<void>> {
    await this.delay();
    this.addresses = this.addresses.filter(a => a.id !== id);
    return { success: true };
  }
}

// ============================================================================
// API Client Factory
// ============================================================================

/**
 * Creates the appropriate API client based on environment.
 * 
 * Uses VITE_USE_API environment variable to switch between:
 * - 'true': Use real backend API (HttpApiClient)
 * - 'false' or undefined: Use mock data (MockApiClient)
 */
export function createApiClient(): ApiClient {
  const useApi = import.meta.env.VITE_USE_API === 'true';
  
  if (useApi && import.meta.env.VITE_API_URL) {
    console.log('🌐 Using backend API:', import.meta.env.VITE_API_URL);
    return new HttpApiClient(DEFAULT_CONFIG);
  }
  
  console.log('📦 Using demo mode with mock data');
  return new MockApiClient();
}

// Singleton instance
export const apiClient = createApiClient();

// ============================================================================
// HTTP API Client (For Backend Integration)
// ============================================================================

/**
 * HTTP-based API client for real backend integration.
 * Connects to the NestJS backend API.
 */
class HttpApiClient implements ApiClient {
  private config: ApiConfig;
  
  constructor(config: ApiConfig) {
    this.config = config;
  }
  
  private async request<T>(method: string, path: string, body?: any): Promise<ApiResponse<T>> {
    try {
      const token = this.getToken();
      const headers: Record<string, string> = {
        ...this.config.headers,
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetch(`${this.config.baseUrl}${path}`, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        return { success: false, error: data.message || 'Request failed' };
      }
      
      return { success: true, data };
    } catch (error) {
      console.error('API request failed:', error);
      return { success: false, error: 'Network error' };
    }
  }
  
  private getToken(): string {
    return localStorage.getItem('khaanada_token') || '';
  }
  
  private setToken(token: string): void {
    localStorage.setItem('khaanada_token', token);
  }
  
  // Authentication
  async login(request: LoginRequest): Promise<ApiResponse<AuthResponse>> {
    const response = await this.request<AuthResponse>('POST', '/auth/login', request);
    if (response.success && response.data) {
      this.setToken(response.data.token);
    }
    return response;
  }
  
  async register(request: RegisterRequest): Promise<ApiResponse<AuthResponse>> {
    const response = await this.request<AuthResponse>('POST', '/auth/register', request);
    if (response.success && response.data) {
      this.setToken(response.data.token);
    }
    return response;
  }
  
  async logout(): Promise<ApiResponse<void>> {
    localStorage.removeItem('khaanada_token');
    return this.request<void>('POST', '/auth/logout');
  }
  
  async refreshToken(): Promise<ApiResponse<{ token: string }>> {
    return this.request<{ token: string }>('POST', '/auth/refresh');
  }
  
  async getCurrentUser(): Promise<ApiResponse<User>> {
    return this.request<User>('GET', '/users/me');
  }
  
  // Restaurants
  async getRestaurants(filters?: RestaurantFilters): Promise<ApiResponse<PaginatedResponse<Restaurant>>> {
    const params = new URLSearchParams();
    if (filters?.cuisine) params.append('cuisine', filters.cuisine);
    if (filters?.search) params.append('search', filters.search);
    if (filters?.sortBy) params.append('sortBy', filters.sortBy);
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());
    
    const queryString = params.toString();
    return this.request<PaginatedResponse<Restaurant>>('GET', `/restaurants${queryString ? '?' + queryString : ''}`);
  }
  
  async getRestaurant(id: string): Promise<ApiResponse<Restaurant>> {
    return this.request<Restaurant>('GET', `/restaurants/${id}`);
  }
  
  async getRestaurantMenu(restaurantId: string): Promise<ApiResponse<MenuItem[]>> {
    return this.request<MenuItem[]>('GET', `/restaurants/${restaurantId}/menu`);
  }
  
  async getCategories(): Promise<ApiResponse<Category[]>> {
    return this.request<Category[]>('GET', '/restaurants/categories');
  }
  
  // Cart & Checkout
  async calculateCart(items: CartItem[], restaurantId: string): Promise<ApiResponse<{
    subtotal: number;
    deliveryFee: number;
    tax: number;
    discount: number;
    total: number;
  }>> {
    return this.request('POST', '/cart/calculate', { items, restaurantId });
  }
  
  async validateOrder(request: CreateOrderRequest): Promise<ApiResponse<{ valid: boolean; errors?: string[] }>> {
    return this.request('POST', '/checkout/validate', request);
  }
  
  // Orders
  async createOrder(request: CreateOrderRequest): Promise<ApiResponse<Order>> {
    return this.request<Order>('POST', '/orders', request);
  }
  
  async getOrders(): Promise<ApiResponse<Order[]>> {
    return this.request<Order[]>('GET', '/orders');
  }
  
  async getOrder(id: string): Promise<ApiResponse<Order>> {
    return this.request<Order>('GET', `/orders/${id}`);
  }
  
  async cancelOrder(id: string): Promise<ApiResponse<Order>> {
    return this.request<Order>('PATCH', `/orders/${id}/cancel`);
  }
  
  // User Profile
  async updateProfile(data: Partial<User>): Promise<ApiResponse<User>> {
    return this.request<User>('PATCH', '/users/me', data);
  }
  
  async getAddresses(): Promise<ApiResponse<Address[]>> {
    return this.request<Address[]>('GET', '/users/me/addresses');
  }
  
  async createAddress(request: CreateAddressRequest): Promise<ApiResponse<Address>> {
    return this.request<Address>('POST', '/users/me/addresses', request);
  }
  
  async deleteAddress(id: string): Promise<ApiResponse<void>> {
    return this.request<void>('DELETE', `/users/me/addresses/${id}`);
  }
}
