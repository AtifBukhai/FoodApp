import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { CartItem, Order, Address, Language, User } from '../types';
import { defaultAddresses, sampleOrders } from '../data';
import { apiClient } from '../services/api';

interface AppState {
  language: Language;
  cart: CartItem[];
  cartOpen: boolean;
  user: User | null;
  orders: Order[];
  addresses: Address[];
  notification: { message: string; type: 'success' | 'error' | 'info' } | null;
}

type Action =
  | { type: 'SET_LANGUAGE'; payload: Language }
  | { type: 'ADD_TO_CART'; payload: CartItem }
  | { type: 'REMOVE_FROM_CART'; payload: number }
  | { type: 'UPDATE_QUANTITY'; payload: { index: number; quantity: number } }
  | { type: 'CLEAR_CART' }
  | { type: 'TOGGLE_CART'; payload?: boolean }
  | { type: 'SET_USER'; payload: User | null }
  | { type: 'ADD_ORDER'; payload: Order }
  | { type: 'SET_ORDERS'; payload: Order[] }
  | { type: 'SET_ADDRESSES'; payload: Address[] }
  | { type: 'ADD_ADDRESS'; payload: Address }
  | { type: 'REMOVE_ADDRESS'; payload: string }
  | { type: 'SET_NOTIFICATION'; payload: AppState['notification'] };

const initialState: AppState = {
  language: 'en',
  cart: [],
  cartOpen: false,
  user: null,
  orders: sampleOrders,
  addresses: defaultAddresses,
  notification: null,
};

function appReducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SET_LANGUAGE':
      return { ...state, language: action.payload };
    case 'ADD_TO_CART': {
      const existingIndex = state.cart.findIndex(
        item => item.menuItem.id === action.payload.menuItem.id &&
          JSON.stringify(item.selectedModifiers) === JSON.stringify(action.payload.selectedModifiers)
      );
      if (existingIndex >= 0) {
        const newCart = [...state.cart];
        newCart[existingIndex] = {
          ...newCart[existingIndex],
          quantity: newCart[existingIndex].quantity + action.payload.quantity,
        };
        return { ...state, cart: newCart, cartOpen: true };
      }
      return { ...state, cart: [...state.cart, action.payload], cartOpen: true };
    }
    case 'REMOVE_FROM_CART':
      return { ...state, cart: state.cart.filter((_, i) => i !== action.payload) };
    case 'UPDATE_QUANTITY': {
      const newCart = [...state.cart];
      if (action.payload.quantity <= 0) {
        newCart.splice(action.payload.index, 1);
      } else {
        newCart[action.payload.index] = { ...newCart[action.payload.index], quantity: action.payload.quantity };
      }
      return { ...state, cart: newCart };
    }
    case 'CLEAR_CART':
      return { ...state, cart: [], cartOpen: false };
    case 'TOGGLE_CART':
      return { ...state, cartOpen: action.payload ?? !state.cartOpen };
    case 'SET_USER':
      return { ...state, user: action.payload };
    case 'ADD_ORDER':
      return { ...state, orders: [action.payload, ...state.orders] };
    case 'SET_ORDERS':
      return { ...state, orders: action.payload };
    case 'SET_ADDRESSES':
      return { ...state, addresses: action.payload };
    case 'ADD_ADDRESS':
      return { ...state, addresses: [...state.addresses, action.payload] };
    case 'REMOVE_ADDRESS':
      return { ...state, addresses: state.addresses.filter(a => a.id !== action.payload) };
    case 'SET_NOTIFICATION':
      return { ...state, notification: action.payload };
    default:
      return state;
  }
}

interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<Action>;
  t: (key: string) => string;
  cartTotal: number;
  cartCount: number;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Restore user session and fetch data from API on mount
  useEffect(() => {
    const useApi = import.meta.env.VITE_USE_API === 'true';
    const token = localStorage.getItem('khaanada_token');

    if (useApi && token) {
      // Fetch current user
      apiClient.getCurrentUser().then(response => {
        if (response.success && response.data) {
          dispatch({ type: 'SET_USER', payload: response.data });
          
          // Fetch user's orders
          apiClient.getOrders().then(ordersResponse => {
            if (ordersResponse.success && ordersResponse.data) {
              dispatch({ type: 'SET_ORDERS', payload: ordersResponse.data });
            }
          });
          
          // Fetch user's addresses
          apiClient.getAddresses().then(addressesResponse => {
            if (addressesResponse.success && addressesResponse.data) {
              dispatch({ type: 'SET_ADDRESSES', payload: addressesResponse.data });
            }
          });
        } else {
          // Token invalid, clear it
          localStorage.removeItem('khaanada_token');
        }
      });
    }
  }, []);

  const t = (key: string): string => {
    const keys = key.split('.');
    let value: any = (state.language === 'en'
      ? { home: 'Home', restaurants: 'Restaurants', orders: 'My Orders', profile: 'Profile', login: 'Login', logout: 'Logout', register: 'Register', searchPlaceholder: 'Search restaurants, cuisines, or dishes...', featured: 'Featured', popular: 'Popular Near You', categories: 'Categories', allRestaurants: 'All Restaurants', addToCart: 'Add to Cart', cart: 'Cart', checkout: 'Checkout', subtotal: 'Subtotal', deliveryFee: 'Delivery Fee', tax: 'Tax (5% GST)', discount: 'Discount', total: 'Total', placeOrder: 'Place Order', cashOnDelivery: 'Cash on Delivery', deliveryAddress: 'Delivery Address', orderPlaced: 'Order Placed Successfully!', orderTracking: 'Order Tracking', orderHistory: 'Order History', emptyCart: 'Your cart is empty', startOrdering: 'Start ordering your favorite food!', minOrder: 'Min. order', delivery: 'Delivery', free: 'Free', closed: 'Closed', open: 'Open', rating: 'Rating', reviews: 'reviews', menu: 'Menu', about: 'About', reviews_label: 'Reviews', vegetarian: 'Veg', spicy: 'Spicy', popular_item: 'Popular', unavailable: 'Currently unavailable', specialInstructions: 'Special instructions', remove: 'Remove', changeAddress: 'Change', selectAddress: 'Select delivery address', confirmOrder: 'Confirm Order', orderConfirmed: 'Your order has been confirmed!', estimatedTime: 'Estimated delivery', orderDetails: 'Order Details', reorder: 'Reorder', trackOrder: 'Track Order', noOrders: 'No orders yet', welcomeBack: 'Welcome back!', email: 'Email', password: 'Password', forgotPassword: 'Forgot password?', dontHaveAccount: "Don't have an account?", signUp: 'Sign Up', name: 'Full Name', phone: 'Phone Number', alreadyHaveAccount: 'Already have an account?', signIn: 'Sign In', addresses: 'Saved Addresses', addAddress: 'Add New Address', editProfile: 'Edit Profile', language: 'Language', english: 'English', urdu: 'اردو', searchResults: 'Search Results', noResults: 'No restaurants found', filterBy: 'Filter by', sortBy: 'Sort by', ratingHigh: 'Rating: High to Low', deliveryTime: 'Delivery Time', priceLow: 'Price: Low to High', cuisine: 'Cuisine', all: 'All', devNote: 'Development Demo — Seed Data', tagline: 'Cravings Delivered.', heroTitle: 'Your Favorite Food,', heroTitle2: 'Delivered Fast.', heroSubtitle: 'Order from the best restaurants in your city. Fresh, hot, and delivered to your doorstep.', browseRestaurants: 'Browse Restaurants', whyKhaanaDa: 'Why KhaanaDa?', fastDelivery: 'Fast Delivery', fastDeliveryDesc: 'Get your food delivered in 30 minutes or less', bestRestaurants: 'Best Restaurants', bestRestaurantsDesc: 'Choose from hundreds of top-rated restaurants', easyOrdering: 'Easy Ordering', easyOrderingDesc: 'Simple, intuitive ordering experience', securePayments: 'Secure Payments', securePaymentsDesc: 'Multiple safe payment options including COD', footerAbout: 'KhaanaDa is Pakistan\'s food delivery platform connecting you with the best local restaurants.', quickLinks: 'Quick Links', aboutUs: 'About Us', contactUs: 'Contact Us', termsOfService: 'Terms of Service', privacyPolicy: 'Privacy Policy', becomePartner: 'Become a Partner', becomeRider: 'Become a Rider', allRightsReserved: 'All rights reserved.' }
      : { home: 'ہوم', restaurants: 'ریسٹورنٹس', orders: 'میرے آرڈرز', profile: 'پروفائل', login: 'لاگ ان', logout: 'لاگ آؤٹ', register: 'رجسٹر', searchPlaceholder: 'ریسٹورنٹ، کھانا یا پکوان تلاش کریں...', featured: 'نمایاں', popular: 'مقبول', categories: 'اقسام', allRestaurants: 'تمام ریسٹورنٹس', addToCart: 'کارٹ میں شامل کریں', cart: 'کارٹ', checkout: 'چیک آؤٹ', subtotal: 'ذیلی کل', deliveryFee: 'ڈیلیوری فیس', tax: 'ٹیکس (5% جی ایس ٹی)', discount: 'رعایت', total: 'کل', placeOrder: 'آرڈر دیں', cashOnDelivery: 'کیش آن ڈیلیوری', deliveryAddress: 'ڈیلیوری ایڈریس', orderPlaced: 'آرڈر کامیابی سے دیا گیا!', orderTracking: 'آرڈر ٹریکنگ', orderHistory: 'آرڈر ہسٹری', emptyCart: 'آپ کا کارٹ خالی ہے', startOrdering: 'اپنا پسندیدہ کھانا آرڈر کریں!', minOrder: 'کم از کم آرڈر', delivery: 'ڈیلیوری', free: 'مفت', closed: 'بند', open: 'کھلا', rating: 'ریٹنگ', reviews: 'جائزے', menu: 'مینو', about: 'تعارف', reviews_label: 'جائزے', vegetarian: 'سبزی', spicy: 'مرچوں والا', popular_item: 'مقبول', unavailable: 'فی الحال دستیاب نہیں', specialInstructions: 'خصوصی ہدایات', remove: 'ہٹائیں', changeAddress: 'تبدیل کریں', selectAddress: 'ڈیلیوری ایڈریس منتخب کریں', confirmOrder: 'آرڈر کی تصدیق کریں', orderConfirmed: 'آپ کا آرڈر تصدیق ہو گیا ہے!', estimatedTime: 'متوقع ڈیلیوری', orderDetails: 'آرڈر کی تفصیلات', reorder: 'دوبارہ آرڈر کریں', trackOrder: 'آرڈر ٹریک کریں', noOrders: 'ابھی تک کوئی آرڈر نہیں', welcomeBack: 'خوش آمدید!', email: 'ای میل', password: 'پاسورڈ', forgotPassword: 'پاسورڈ بھول گئے؟', dontHaveAccount: 'اکاؤنٹ نہیں ہے؟', signUp: 'سائن اپ', name: 'پورا نام', phone: 'فون نمبر', alreadyHaveAccount: 'پہلے سے اکاؤنٹ ہے؟', signIn: 'سائن ان', addresses: 'محفوظ ایڈریس', addAddress: 'نیا ایڈریس شامل کریں', editProfile: 'پروفائل ترمیم', language: 'زبان', english: 'English', urdu: 'اردو', searchResults: 'تلاش کے نتائج', noResults: 'کوئی ریسٹورنٹ نہیں ملا', filterBy: 'فلٹر', sortBy: 'ترتیب', ratingHigh: 'ریٹنگ: زیادہ سے کم', deliveryTime: 'ڈیلیوری کا وقت', priceLow: 'قیمت: کم سے زیادہ', cuisine: 'پکوان', all: 'سب', devNote: 'ڈیمو — ڈیولپمنٹ ڈیٹا', tagline: 'خواہشات پہنچائی گئیں۔', heroTitle: 'آپ کا پسندیدہ کھانا،', heroTitle2: 'تیزی سے پہنچایا گیا۔', heroSubtitle: 'اپنے شہر کے بہترین ریسٹورنٹس سے آرڈر کریں۔', browseRestaurants: 'ریسٹورنٹس دیکھیں', whyKhaanaDa: 'خانا دا کیوں؟', fastDelivery: 'تیز ڈیلیوری', fastDeliveryDesc: '30 منٹ یا اس سے کم میں آپ کا کھانا پہنچایا جائے گا', bestRestaurants: 'بہترین ریسٹورنٹ', bestRestaurantsDesc: 'سینکڑوں اعلیٰ ریٹنگ والے ریسٹورنٹس میں سے منتخب کریں', easyOrdering: 'آسان آرڈرنگ', easyOrderingDesc: 'سادہ، بدیہی آرڈرنگ کا تجربہ', securePayments: 'محفوظ ادائیگیاں', securePaymentsDesc: 'COD سمیت متعدد محفوظ ادائیگی کے اختیارات', footerAbout: 'خانا دا پاکستان کا فوڈ ڈیلیوری پلیٹ فارم ہے جو آپ کو بہترین مقامی ریسٹورنٹس سے جوڑتا ہے۔', quickLinks: 'فوری لنکس', aboutUs: 'ہمارے بارے میں', contactUs: 'ہم سے رابطہ کریں', termsOfService: 'سروس کی شرائط', privacyPolicy: 'رازداری کی پالیسی', becomePartner: 'پارٹنر بنیں', becomeRider: 'رائیڈر بنیں', allRightsReserved: 'جملہ حقوق محفوظ ہیں۔' });
    return value[key] || key;
  };

  const cartTotal = state.cart.reduce((sum, item) => {
    const itemPrice = item.menuItem.price + item.selectedModifiers.reduce((s, m) => s + m.price, 0);
    return sum + itemPrice * item.quantity;
  }, 0);

  const cartCount = state.cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <AppContext.Provider value={{ state, dispatch, t, cartTotal, cartCount }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
}
