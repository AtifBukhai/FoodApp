import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { MapPin, CreditCard, Banknote, Check, ChevronRight, ArrowLeft } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Order } from '../types';
import { restaurants } from '../data';
import { apiClient } from '../services/api';

export default function CheckoutPage() {
  const { state, dispatch, t, cartTotal } = useApp();
  const navigate = useNavigate();
  const [selectedAddress, setSelectedAddress] = useState(state.addresses.find(a => a.isDefault)?.id || state.addresses[0]?.id || '');
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'online'>('cod');
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [newOrderId, setNewOrderId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (state.cart.length === 0 && !orderPlaced) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-kh-cream">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">{t('emptyCart')}</h2>
          <Link to="/restaurants" className="text-kh-orange font-medium">← {t('browseRestaurants')}</Link>
        </div>
      </div>
    );
  }

  const deliveryFee = 80;
  const tax = Math.round(cartTotal * 0.05);
  const total = cartTotal + deliveryFee + tax;

  const restaurantId = state.cart[0]?.menuItem.restaurantId;
  const restaurant = restaurants.find(r => r.id === restaurantId);

  const handlePlaceOrder = async () => {
    setLoading(true);
    setError('');

    const useApi = import.meta.env.VITE_USE_API === 'true';

    if (useApi && state.user) {
      // Use real backend API
      try {
        const response = await apiClient.createOrder({
          restaurantId: restaurantId || '',
          items: state.cart.map(item => ({
            menuItemId: item.menuItem.id,
            quantity: item.quantity,
            notes: item.notes,
          })),
          deliveryAddressId: selectedAddress,
          paymentMethod,
        });

        if (response.success && response.data) {
          dispatch({ type: 'ADD_ORDER', payload: response.data });
          dispatch({ type: 'CLEAR_CART' });
          setNewOrderId(response.data.id);
          setOrderPlaced(true);
        } else {
          setError(response.error || (state.language === 'en' ? 'Failed to place order' : 'آرڈر دینے میں ناکامی'));
        }
      } catch (err) {
        setError(state.language === 'en' ? 'Network error. Please try again.' : 'نیٹ ورک کی خرابی۔ دوبارہ کوشش کریں۔');
      } finally {
        setLoading(false);
      }
    } else {
      // Demo mode: create mock order
      const orderId = `KD-${Date.now().toString(36).toUpperCase()}`;
      const newOrder: Order = {
        id: orderId,
        restaurantId: restaurantId || '',
        restaurantName: restaurant?.name || 'Restaurant',
        items: [...state.cart],
        subtotal: cartTotal,
        deliveryFee,
        tax,
        discount: 0,
        total,
        status: 'pending',
        paymentMethod,
        deliveryAddress: state.addresses.find(a => a.id === selectedAddress) || state.addresses[0],
        createdAt: new Date().toISOString(),
        estimatedDelivery: new Date(Date.now() + 35 * 60000).toISOString(),
        trackingEvents: [
          { status: 'pending', timestamp: new Date().toISOString(), message: 'Order placed' },
        ],
      };

      dispatch({ type: 'ADD_ORDER', payload: newOrder });
      dispatch({ type: 'CLEAR_CART' });
      setNewOrderId(orderId);
      setOrderPlaced(true);
      setLoading(false);
    }
  };

  if (orderPlaced) {
    return (
      <div className="min-h-screen bg-kh-cream flex items-center justify-center px-4">
        <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center shadow-lg animate-fade-in">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check size={40} className="text-kh-green" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">{t('orderConfirmed')}</h2>
          <p className="text-gray-500 mb-2">Order #{newOrderId}</p>
          <p className="text-sm text-gray-400 mb-6">
            {state.language === 'en'
              ? 'Your order has been placed and is being processed. You\'ll receive updates as it progresses.'
              : 'آپ کا آرڈر دیا جا چکا ہے اور پروسیس ہو رہا ہے۔'}
          </p>
          <div className="bg-kh-cream rounded-xl p-4 mb-6 text-left">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-gray-600">{t('total')}</span>
              <span className="font-bold text-kh-orange">PKR {total}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">{t('cashOnDelivery')}</span>
              <span className="font-medium text-gray-800">{paymentMethod === 'cod' ? '💵 COD' : '💳 Online'}</span>
            </div>
          </div>
          <div className="flex gap-3">
            <Link
              to="/orders"
              className="flex-1 bg-kh-orange text-white py-3 rounded-xl font-semibold hover:bg-kh-orange-dark transition-colors"
            >
              {t('trackOrder')}
            </Link>
            <Link
              to="/"
              className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
            >
              {t('home')}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-kh-cream">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1 text-gray-600 hover:text-kh-orange mb-6 transition-colors"
        >
          <ArrowLeft size={18} />
          <span className="text-sm font-medium">Back</span>
        </button>

        <h1 className="text-2xl font-bold text-gray-800 mb-6">{t('checkout')}</h1>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Delivery Address */}
            <div className="bg-white rounded-xl p-5 shadow-sm">
              <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <MapPin size={20} className="text-kh-orange" />
                {t('deliveryAddress')}
              </h2>
              <div className="space-y-3">
                {state.addresses.map(addr => (
                  <label
                    key={addr.id}
                    className={`flex items-start gap-3 p-3 rounded-xl border-2 cursor-pointer transition-colors ${selectedAddress === addr.id ? 'border-kh-orange bg-orange-50' : 'border-gray-100 hover:border-gray-200'}`}
                  >
                    <input
                      type="radio"
                      name="address"
                      value={addr.id}
                      checked={selectedAddress === addr.id}
                      onChange={() => setSelectedAddress(addr.id)}
                      className="mt-1 accent-kh-orange"
                    />
                    <div>
                      <p className="font-medium text-gray-800">{addr.label}</p>
                      <p className="text-sm text-gray-500">{addr.street}, {addr.area}, {addr.city}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-xl p-5 shadow-sm">
              <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <CreditCard size={20} className="text-kh-orange" />
                {state.language === 'en' ? 'Payment Method' : 'ادائیگی کا طریقہ'}
              </h2>
              <div className="space-y-3">
                <label
                  className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-colors ${paymentMethod === 'cod' ? 'border-kh-orange bg-orange-50' : 'border-gray-100 hover:border-gray-200'}`}
                >
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === 'cod'}
                    onChange={() => setPaymentMethod('cod')}
                    className="accent-kh-orange"
                  />
                  <Banknote size={20} className="text-kh-green" />
                  <div>
                    <p className="font-medium text-gray-800">{t('cashOnDelivery')}</p>
                    <p className="text-xs text-gray-500">{state.language === 'en' ? 'Pay when your order arrives' : 'آرڈر پہنچنے پر ادائیگی کریں'}</p>
                  </div>
                </label>
                <label
                  className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-colors ${paymentMethod === 'online' ? 'border-kh-orange bg-orange-50' : 'border-gray-100 hover:border-gray-200'}`}
                >
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === 'online'}
                    onChange={() => setPaymentMethod('online')}
                    className="accent-kh-orange"
                  />
                  <CreditCard size={20} className="text-blue-500" />
                  <div>
                    <p className="font-medium text-gray-800">
                      {state.language === 'en' ? 'Online Payment' : 'آن لائن ادائیگی'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {state.language === 'en'
                        ? 'JazzCash, easypaisa, bank cards (sandbox — not yet configured)'
                        : 'جیز کیش، ایزی پیسہ، بینک کارڈز ( سینڈ باکس — ابھی تک ترتیب نہیں دیا گیا)'}
                    </p>
                  </div>
                </label>
              </div>
            </div>

            {/* Order Summary */}
            <div className="bg-white rounded-xl p-5 shadow-sm">
              <h2 className="text-lg font-bold text-gray-800 mb-4">{t('orderDetails')}</h2>
              <div className="space-y-3">
                {state.cart.map((item, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 bg-kh-cream-dark rounded-full flex items-center justify-center text-xs font-bold text-kh-orange">
                        {item.quantity}x
                      </span>
                      <span className="text-sm text-gray-700">
                        {state.language === 'en' ? item.menuItem.name : item.menuItem.nameUrdu}
                      </span>
                    </div>
                    <span className="text-sm font-medium text-gray-800">
                      PKR {(item.menuItem.price + item.selectedModifiers.reduce((s, m) => s + m.price, 0)) * item.quantity}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar - Price breakdown */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl p-5 shadow-sm sticky top-20">
              <h2 className="text-lg font-bold text-gray-800 mb-4">{state.language === 'en' ? 'Price Summary' : 'قیمت کا خلاصہ'}</h2>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">{t('subtotal')}</span>
                  <span className="font-medium">PKR {cartTotal}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">{t('deliveryFee')}</span>
                  <span className="font-medium">PKR {deliveryFee}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">{t('tax')}</span>
                  <span className="font-medium">PKR {tax}</span>
                </div>
                <div className="border-t border-dashed border-gray-200 pt-3 flex justify-between">
                  <span className="font-bold text-gray-800">{t('total')}</span>
                  <span className="font-bold text-lg text-kh-orange">PKR {total}</span>
                </div>
              </div>
              {error && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                  {error}
                </div>
              )}
              <button
                onClick={handlePlaceOrder}
                disabled={loading}
                className="w-full mt-6 bg-kh-orange text-white py-3.5 rounded-xl font-bold text-lg hover:bg-kh-orange-dark transition-colors flex items-center justify-center gap-2 shadow-lg shadow-orange-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (state.language === 'en' ? 'Placing Order...' : 'آرڈر دیا جا رہا ہے...') : t('placeOrder')}
                {!loading && <ChevronRight size={20} />}
              </button>
              <p className="text-xs text-gray-400 text-center mt-3">
                {state.language === 'en'
                  ? 'By placing this order, you agree to our Terms of Service'
                  : 'آرڈر دے کر آپ ہماری سروس کی شرائط سے اتفاق کرتے ہیں'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
