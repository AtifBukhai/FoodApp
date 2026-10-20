export interface Restaurant {
  id: string;
  name: string;
  nameUrdu: string;
  description: string;
  descriptionUrdu: string;
  cuisine: string[];
  rating: number;
  reviewCount: number;
  deliveryTime: string;
  deliveryFee: number;
  minOrder: number;
  image: string;
  featured: boolean;
  isOpen: boolean;
  address: string;
  openingHours: { day: string; open: string; close: string }[];
}

export interface MenuItem {
  id: string;
  restaurantId: string;
  name: string;
  nameUrdu: string;
  description: string;
  descriptionUrdu: string;
  price: number;
  image: string;
  category: string;
  isVegetarian: boolean;
  isVegan: boolean;
  isSpicy: boolean;
  isAvailable: boolean;
  popular: boolean;
  modifiers?: Modifier[];
}

export interface Modifier {
  id: string;
  name: string;
  nameUrdu: string;
  price: number;
  required: boolean;
  options: ModifierOption[];
}

export interface ModifierOption {
  id: string;
  name: string;
  nameUrdu: string;
  price: number;
}

export interface CartItem {
  menuItem: MenuItem;
  quantity: number;
  selectedModifiers: { modifierId: string; optionId: string; name: string; price: number }[];
  notes: string;
}

export interface Order {
  id: string;
  restaurantId: string;
  restaurantName: string;
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  tax: number;
  discount: number;
  total: number;
  status: OrderStatus;
  paymentMethod: 'cod' | 'online';
  deliveryAddress: Address;
  createdAt: string;
  estimatedDelivery: string;
  trackingEvents: TrackingEvent[];
}

export type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'ready' | 'picked_up' | 'delivered' | 'cancelled';

export interface TrackingEvent {
  status: OrderStatus;
  timestamp: string;
  message: string;
}

export interface Address {
  id: string;
  label: string;
  street: string;
  city: string;
  area: string;
  isDefault: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  addresses: Address[];
}

export interface Category {
  id: string;
  name: string;
  nameUrdu: string;
  icon: string;
  slug: string;
}

export type Language = 'en' | 'ur';
