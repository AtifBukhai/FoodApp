import { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Package, CheckCircle, Clock, MapPin } from 'lucide-react';

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
  pickedUpAt?: string;
  acceptedAt?: string;
}

export default function RiderDeliveriesPage() {
  const { state } = useApp();
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock data for demo mode
    const mockDeliveries: Delivery[] = [
      {
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
        acceptedAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
      },
      {
        id: 'delivery-2',
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
        id: 'delivery-3',
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

    setDeliveries(mockDeliveries);
    setLoading(false);
  }, []);

  const filteredDeliveries = deliveries.filter((d) => {
    if (filter === 'active') {
      return ['ASSIGNED', 'ACCEPTED', 'PICKED_UP'].includes(d.status);
    } else if (filter === 'completed') {
      return d.status === 'DELIVERED';
    }
    return true;
  });

  const formatCurrency = (amount: number) => {
    return `PKR ${(amount / 100).toLocaleString()}`;
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      ASSIGNED: { color: 'bg-blue-100 text-blue-700', icon: Clock },
      ACCEPTED: { color: 'bg-orange-100 text-kh-orange', icon: Clock },
      PICKED_UP: { color: 'bg-purple-100 text-purple-700', icon: Package },
      DELIVERED: { color: 'bg-green-100 text-kh-green', icon: CheckCircle },
    };

    const badge = badges[status as keyof typeof badges] || badges.ASSIGNED;
    const Icon = badge.icon;

    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 ${badge.color}`}>
        <Icon size={14} />
        {status}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-kh-cream flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-kh-orange mx-auto"></div>
          <p className="mt-4 text-gray-600">
            {state.language === 'en' ? 'Loading deliveries...' : 'ڈیلیوریز لوڈ ہو رہی ہیں...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-kh-cream">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">
            {state.language === 'en' ? 'My Deliveries' : 'میری ڈیلیوریز'}
          </h1>
          <p className="text-gray-600 mt-1">
            {state.language === 'en'
              ? 'View all your delivery history'
              : 'اپنی تمام ڈیلیوری ہسٹری دیکھیں'}
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100 mb-6">
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'all'
                  ? 'bg-kh-orange text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {state.language === 'en' ? 'All' : 'سب'}
            </button>
            <button
              onClick={() => setFilter('active')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'active'
                  ? 'bg-kh-orange text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {state.language === 'en' ? 'Active' : 'فعال'}
            </button>
            <button
              onClick={() => setFilter('completed')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'completed'
                  ? 'bg-kh-orange text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {state.language === 'en' ? 'Completed' : 'مکمل'}
            </button>
          </div>
        </div>

        {/* Deliveries List */}
        {filteredDeliveries.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center border border-gray-100">
            <Package size={48} className="text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              {state.language === 'en' ? 'No deliveries found' : 'کوئی ڈیلیوری نہیں ملی'}
            </h3>
            <p className="text-gray-500">
              {state.language === 'en'
                ? 'No deliveries match your filter'
                : 'آپ کے فلٹر سے کوئی ڈیلیوری مطابقت نہیں رکھتی'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredDeliveries.map((delivery) => (
              <div
                key={delivery.id}
                className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold text-gray-800">
                        #{delivery.orderNumber}
                      </h3>
                      {getStatusBadge(delivery.status)}
                    </div>
                    <p className="text-sm text-gray-600">{delivery.restaurant.name}</p>
                  </div>
                  {delivery.totalEarnings && (
                    <div className="text-right">
                      <p className="text-sm text-gray-600">
                        {state.language === 'en' ? 'Earned' : 'کمائی'}
                      </p>
                      <p className="text-xl font-bold text-kh-green">
                        {formatCurrency(delivery.totalEarnings)}
                      </p>
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <MapPin className="text-kh-orange mt-1" size={20} />
                    <div>
                      <p className="text-sm font-medium text-gray-700">
                        {state.language === 'en' ? 'Pickup' : 'پک اپ'}
                      </p>
                      <p className="text-sm text-gray-600">{delivery.restaurant.address}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <MapPin className="text-kh-green mt-1" size={20} />
                    <div>
                      <p className="text-sm font-medium text-gray-700">
                        {state.language === 'en' ? 'Delivery' : 'ڈیلیوری'}
                      </p>
                      <p className="text-sm text-gray-600">
                        {delivery.deliveryAddress.street}, {delivery.deliveryAddress.area}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
