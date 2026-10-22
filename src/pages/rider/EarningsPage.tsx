import { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { DollarSign, TrendingUp, Calendar, Truck } from 'lucide-react';

interface EarningsData {
  totalEarnings: number;
  todayEarnings: number;
  weekEarnings: number;
  totalDeliveries: number;
}

interface EarningsHistory {
  id: string;
  orderNumber: string;
  restaurant: { name: string };
  deliveryAddress: { area: string };
  totalEarnings: number;
  deliveredAt: string;
}

export default function RiderEarningsPage() {
  const { state } = useApp();
  const [earnings, setEarnings] = useState<EarningsData | null>(null);
  const [history, setHistory] = useState<EarningsHistory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock data
    setEarnings({
      totalEarnings: 245000,
      todayEarnings: 27000,
      weekEarnings: 89000,
      totalDeliveries: 23,
    });

    setHistory([
      {
        id: '1',
        orderNumber: 'KD-12340',
        restaurant: { name: 'Pizza Planet' },
        deliveryAddress: { area: 'Model Town' },
        totalEarnings: 15000,
        deliveredAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: '2',
        orderNumber: 'KD-12339',
        restaurant: { name: 'Burger Lab' },
        deliveryAddress: { area: 'Johar Town' },
        totalEarnings: 12000,
        deliveredAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
      },
    ]);

    setLoading(false);
  }, []);

  const formatCurrency = (amount: number) => `PKR ${(amount / 100).toLocaleString()}`;

  if (loading) {
    return (
      <div className="min-h-screen bg-kh-cream flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-kh-orange"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-kh-cream">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">
          {state.language === 'en' ? 'Earnings' : 'کمائی'}
        </h1>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-orange-50 rounded-lg flex items-center justify-center">
                <DollarSign className="text-kh-orange" size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-600">{state.language === 'en' ? 'Today' : 'آج'}</p>
                <p className="text-2xl font-bold text-gray-800">{formatCurrency(earnings?.todayEarnings || 0)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
                <TrendingUp className="text-kh-green" size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-600">{state.language === 'en' ? 'This Week' : 'اس ہفتے'}</p>
                <p className="text-2xl font-bold text-gray-800">{formatCurrency(earnings?.weekEarnings || 0)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                <Truck className="text-blue-600" size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-600">{state.language === 'en' ? 'Total' : 'کل'}</p>
                <p className="text-2xl font-bold text-gray-800">{formatCurrency(earnings?.totalEarnings || 0)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* History */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            {state.language === 'en' ? 'Earnings History' : 'کمائی کی ہسٹری'}
          </h2>
          <div className="space-y-3">
            {history.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-4 border border-gray-100 rounded-lg">
                <div>
                  <p className="font-medium text-gray-800">#{item.orderNumber}</p>
                  <p className="text-sm text-gray-600">{item.restaurant.name} → {item.deliveryAddress.area}</p>
                  <p className="text-xs text-gray-500">{new Date(item.deliveredAt).toLocaleString()}</p>
                </div>
                <p className="font-bold text-kh-green">{formatCurrency(item.totalEarnings)}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
