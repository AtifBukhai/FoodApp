import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { 
  Package, 
  MapPin, 
  Clock, 
  DollarSign, 
  TrendingUp,
  CheckCircle,
  AlertCircle,
  Truck
} from 'lucide-react';

interface Delivery {
  id: string;
  orderNumber: string;
  restaurant: {
    name: string;
    address: string;
  };
  deliveryAddress: {
    street: string;
    area: string;
  };
  status: string;
  totalEarnings?: number;
  deliveredAt?: string;
}

interface Earnings {
  totalEarnings: number;
  todayEarnings: number;
  weekEarnings: number;
  totalDeliveries: number;
}

export default function RiderDashboardPage() {
  const { state } = useApp();
  const [isAvailable, setIsAvailable] = useState(false);
  const [activeDelivery, setActiveDelivery] = useState<Delivery | null>(null);
  const [availableDeliveries, setAvailableDeliveries] = useState<Delivery[]>([]);
  const [recentDeliveries, setRecentDeliveries] = useState<Delivery[]>([]);
  const [earnings, setEarnings] = useState<Earnings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock data for demo mode
    // In API mode, this would fetch from backend
    const mockActiveDelivery: Delivery = {
      id: 'delivery-1',
      orderNumber: 'KD-12345',
      restaurant: {
        name: 'Lahori Chargha',
        address: 'MM Alam Road, Gulberg III, Lahore',
      },
      deliveryAddress: {
        street: '45-B, Street 7, DHA Phase 5',
        area: 'DHA',
      },
      status: 'ACCEPTED',
    };

    const mockAvailableDeliveries: Delivery[] = [
      {
        id: 'delivery-2',
        orderNumber: 'KD-12346',
        restaurant: {
          name: 'Biryani House',
          address: 'Block D, North Nazimabad, Karachi',
        },
        deliveryAddress: {
          street: '12-A, Block 2, Clifton',
          area: 'Clifton',
        },
        status: 'READY',
      },
    ];

    const mockRecentDeliveries: Delivery[] = [
      {
        id: 'delivery-3',
        orderNumber: 'KD-12340',
        restaurant: {
          name: 'Pizza Planet',
          address: 'Main Boulevard, Gulberg, Lahore',
        },
        deliveryAddress: {
          street: '78-C, Model Town',
          area: 'Model Town',
        },
        status: 'DELIVERED',
        totalEarnings: 15000,
        deliveredAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'delivery-4',
        orderNumber: 'KD-12339',
        restaurant: {
          name: 'Burger Lab',
          address: 'DHA Phase 5, Lahore',
        },
        deliveryAddress: {
          street: '23-B, Johar Town',
          area: 'Johar Town',
        },
        status: 'DELIVERED',
        totalEarnings: 12000,
        deliveredAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
      },
    ];

    const mockEarnings: Earnings = {
      totalEarnings: 245000,
      todayEarnings: 27000,
      weekEarnings: 89000,
      totalDeliveries: 23,
    };

    setActiveDelivery(mockActiveDelivery);
    setAvailableDeliveries(mockAvailableDeliveries);
    setRecentDeliveries(mockRecentDeliveries);
    setEarnings(mockEarnings);
    setLoading(false);
  }, []);

  const handleToggleAvailability = () => {
    setIsAvailable(!isAvailable);
    // In API mode, this would call the backend
  };

  const handleAcceptDelivery = (deliveryId: string) => {
    console.log('Accepting delivery:', deliveryId);
    // In API mode, this would call the backend
  };

  const formatCurrency = (amount: number) => {
    return `PKR ${(amount / 100).toLocaleString()}`;
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);

    if (diffMins < 60) {
      return state.language === 'en' 
        ? `${diffMins} min ago` 
        : `${diffMins} منٹ پہلے`;
    } else if (diffHours < 24) {
      return state.language === 'en'
        ? `${diffHours} hours ago`
        : `${diffHours} گھنٹے پہلے`;
    } else {
      return date.toLocaleDateString();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-kh-cream flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-kh-orange mx-auto"></div>
          <p className="mt-4 text-gray-600">
            {state.language === 'en' ? 'Loading dashboard...' : 'ڈیش بورڈ لوڈ ہو رہا ہے...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-kh-cream">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              {state.language === 'en' ? 'Rider Dashboard' : 'رائیڈر ڈیش بورڈ'}
            </h1>
            <p className="text-gray-600 mt-1">
              {state.language === 'en'
                ? 'Manage your deliveries and earnings'
                : 'اپنی ڈیلیوریز اور کمائی کا انتظام کریں'}
            </p>
          </div>
          <button
            onClick={handleToggleAvailability}
            className={`px-6 py-3 rounded-xl font-semibold transition-colors ${
              isAvailable
                ? 'bg-green-500 text-white hover:bg-green-600'
                : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
            }`}
          >
            {isAvailable
              ? state.language === 'en'
                ? '🟢 Online'
                : '🟢 آن لائن'
              : state.language === 'en'
              ? '⚫ Offline'
              : '⚫ آف لائن'}
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">
                  {state.language === 'en' ? 'Today' : 'آج'}
                </p>
                <p className="text-2xl font-bold text-gray-800">
                  {formatCurrency(earnings?.todayEarnings || 0)}
                </p>
              </div>
              <div className="w-12 h-12 bg-orange-50 rounded-lg flex items-center justify-center">
                <DollarSign className="text-kh-orange" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">
                  {state.language === 'en' ? 'This Week' : 'اس ہفتے'}
                </p>
                <p className="text-2xl font-bold text-gray-800">
                  {formatCurrency(earnings?.weekEarnings || 0)}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
                <TrendingUp className="text-kh-green" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">
                  {state.language === 'en' ? 'Total' : 'کل'}
                </p>
                <p className="text-2xl font-bold text-gray-800">
                  {formatCurrency(earnings?.totalEarnings || 0)}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                <DollarSign className="text-blue-600" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">
                  {state.language === 'en' ? 'Deliveries' : 'ڈیلیوریز'}
                </p>
                <p className="text-2xl font-bold text-gray-800">
                  {earnings?.totalDeliveries || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center">
                <Truck className="text-purple-600" size={24} />
              </div>
            </div>
          </div>
        </div>

        {/* Active Delivery */}
        {activeDelivery && (
          <div className="bg-white rounded-xl shadow-sm p-6 border-2 border-kh-orange mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-800">
                {state.language === 'en' ? 'Active Delivery' : 'فعال ڈیلیوری'}
              </h2>
              <span className="px-3 py-1 bg-orange-100 text-kh-orange rounded-full text-sm font-medium">
                {activeDelivery.status}
              </span>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Package className="text-kh-orange mt-1" size={20} />
                <div>
                  <p className="font-semibold text-gray-800">
                    {state.language === 'en' ? 'Order' : 'آرڈر'} #{activeDelivery.orderNumber}
                  </p>
                  <p className="text-sm text-gray-600">{activeDelivery.restaurant.name}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="text-kh-orange mt-1" size={20} />
                <div>
                  <p className="text-sm font-medium text-gray-700">
                    {state.language === 'en' ? 'Pickup' : 'پک اپ'}
                  </p>
                  <p className="text-sm text-gray-600">{activeDelivery.restaurant.address}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="text-kh-green mt-1" size={20} />
                <div>
                  <p className="text-sm font-medium text-gray-700">
                    {state.language === 'en' ? 'Delivery' : 'ڈیلیوری'}
                  </p>
                  <p className="text-sm text-gray-600">
                    {activeDelivery.deliveryAddress.street}, {activeDelivery.deliveryAddress.area}
                  </p>
                </div>
              </div>

              <div className="flex gap-3 mt-4">
                <Link
                  to={`/rider/deliveries/${activeDelivery.id}`}
                  className="flex-1 bg-kh-orange text-white py-3 rounded-xl font-semibold hover:bg-kh-orange-dark transition-colors text-center"
                >
                  {state.language === 'en' ? 'View Details' : 'تفصیلات دیکھیں'}
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Available Deliveries */}
        {!activeDelivery && availableDeliveries.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 mb-8">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              {state.language === 'en' ? 'Available Deliveries' : 'دستیاب ڈیلیوریز'}
            </h2>
            <div className="space-y-4">
              {availableDeliveries.map((delivery) => (
                <div
                  key={delivery.id}
                  className="border border-gray-200 rounded-lg p-4 hover:border-kh-orange transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-semibold text-gray-800">
                        {state.language === 'en' ? 'Order' : 'آرڈر'} #{delivery.orderNumber}
                      </p>
                      <p className="text-sm text-gray-600">{delivery.restaurant.name}</p>
                    </div>
                    <button
                      onClick={() => handleAcceptDelivery(delivery.id)}
                      className="px-4 py-2 bg-kh-green text-white rounded-lg font-medium hover:bg-kh-green-dark transition-colors"
                    >
                      {state.language === 'en' ? 'Accept' : 'قبول کریں'}
                    </button>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-start gap-2">
                      <MapPin size={16} className="text-kh-orange mt-0.5" />
                      <div>
                        <p className="text-gray-600">{delivery.restaurant.address}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <MapPin size={16} className="text-kh-green mt-0.5" />
                      <div>
                        <p className="text-gray-600">
                          {delivery.deliveryAddress.street}, {delivery.deliveryAddress.area}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Deliveries */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-800">
              {state.language === 'en' ? 'Recent Deliveries' : 'حالیہ ڈیلیوریز'}
            </h2>
            <Link
              to="/rider/deliveries"
              className="text-kh-orange font-medium hover:underline"
            >
              {state.language === 'en' ? 'View All' : 'سب دیکھیں'}
            </Link>
          </div>

          {recentDeliveries.length === 0 ? (
            <div className="text-center py-8">
              <Package size={48} className="text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">
                {state.language === 'en'
                  ? 'No deliveries yet'
                  : 'ابھی تک کوئی ڈیلیوری نہیں'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentDeliveries.map((delivery) => (
                <div
                  key={delivery.id}
                  className="flex items-center justify-between p-4 border border-gray-100 rounded-lg hover:border-gray-200 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <CheckCircle className="text-kh-green" size={20} />
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">
                        #{delivery.orderNumber}
                      </p>
                      <p className="text-sm text-gray-600">
                        {delivery.restaurant.name} → {delivery.deliveryAddress.area}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatTime(delivery.deliveredAt!)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-kh-green">
                      {formatCurrency(delivery.totalEarnings || 0)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <Link
            to="/rider/earnings"
            className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-orange-50 rounded-lg flex items-center justify-center">
                <DollarSign className="text-kh-orange" size={24} />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">
                  {state.language === 'en' ? 'Earnings' : 'کمائی'}
                </h3>
                <p className="text-sm text-gray-600">
                  {state.language === 'en' ? 'View detailed earnings' : 'تفصیلی کمائی دیکھیں'}
                </p>
              </div>
            </div>
          </Link>

          <Link
            to="/rider/profile"
            className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                <Package className="text-blue-600" size={24} />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">
                  {state.language === 'en' ? 'Profile' : 'پروفائل'}
                </h3>
                <p className="text-sm text-gray-600">
                  {state.language === 'en' ? 'Manage your profile' : 'اپنا پروفائل منظم کریں'}
                </p>
              </div>
            </div>
          </Link>

          <Link
            to="/rider/deliveries"
            className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
                <Truck className="text-kh-green" size={24} />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">
                  {state.language === 'en' ? 'All Deliveries' : 'تمام ڈیلیوریز'}
                </h3>
                <p className="text-sm text-gray-600">
                  {state.language === 'en' ? 'View delivery history' : 'ڈیلیوری ہسٹری دیکھیں'}
                </p>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
