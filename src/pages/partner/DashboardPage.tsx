import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Store, Package, TrendingUp, Clock, CheckCircle, XCircle } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface Analytics {
  totalOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  ordersByStatus: Record<string, number>;
}

export default function PartnerDashboardPage() {
  const { state } = useApp();
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In a real implementation, this would fetch from the API
    // For now, we'll use mock data
    setAnalytics({
      totalOrders: 156,
      totalRevenue: 468000,
      averageOrderValue: 3000,
      ordersByStatus: {
        PENDING: 5,
        CONFIRMED: 3,
        PREPARING: 2,
        READY_FOR_PICKUP: 1,
        DELIVERED: 145,
      },
    });
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-kh-cream flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-kh-orange mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    return `PKR ${(amount / 100).toLocaleString()}`;
  };

  return (
    <div className="min-h-screen bg-kh-cream">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">
            {state.language === 'en' ? 'Partner Dashboard' : 'پارٹنر ڈیش بورڈ'}
          </h1>
          <p className="text-gray-600 mt-1">
            {state.language === 'en'
              ? 'Manage your restaurants and orders'
              : 'اپنے ریسٹورنٹس اور آرڈرز کا انتظام کریں'}
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">
                  {state.language === 'en' ? 'Total Orders' : 'کل آرڈرز'}
                </p>
                <p className="text-3xl font-bold text-gray-800">{analytics?.totalOrders || 0}</p>
              </div>
              <div className="w-12 h-12 bg-orange-50 rounded-lg flex items-center justify-center">
                <Package className="text-kh-orange" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">
                  {state.language === 'en' ? 'Total Revenue' : 'کل آمدنی'}
                </p>
                <p className="text-3xl font-bold text-gray-800">
                  {formatCurrency(analytics?.totalRevenue || 0)}
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
                  {state.language === 'en' ? 'Average Order' : 'اوسط آرڈر'}
                </p>
                <p className="text-3xl font-bold text-gray-800">
                  {formatCurrency(analytics?.averageOrderValue || 0)}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                <TrendingUp className="text-blue-600" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">
                  {state.language === 'en' ? 'Pending Orders' : 'زیر التواء آرڈرز'}
                </p>
                <p className="text-3xl font-bold text-gray-800">
                  {analytics?.ordersByStatus?.PENDING || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-yellow-50 rounded-lg flex items-center justify-center">
                <Clock className="text-yellow-600" size={24} />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Link
            to="/partner/restaurants"
            className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-orange-50 rounded-lg flex items-center justify-center">
                <Store className="text-kh-orange" size={24} />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">
                  {state.language === 'en' ? 'My Restaurants' : 'میرے ریسٹورنٹس'}
                </h3>
                <p className="text-sm text-gray-600">
                  {state.language === 'en' ? 'Manage your restaurants' : 'اپنے ریسٹورنٹس کا انتظام کریں'}
                </p>
              </div>
            </div>
          </Link>

          <Link
            to="/partner/orders"
            className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
                <Package className="text-kh-green" size={24} />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">
                  {state.language === 'en' ? 'Orders' : 'آرڈرز'}
                </h3>
                <p className="text-sm text-gray-600">
                  {state.language === 'en' ? 'View and manage orders' : 'آرڈرز دیکھیں اور منظم کریں'}
                </p>
              </div>
            </div>
          </Link>

          <Link
            to="/partner/analytics"
            className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                <TrendingUp className="text-blue-600" size={24} />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">
                  {state.language === 'en' ? 'Analytics' : 'تجزیات'}
                </h3>
                <p className="text-sm text-gray-600">
                  {state.language === 'en' ? 'View detailed analytics' : 'تفصیلی تجزیات دیکھیں'}
                </p>
              </div>
            </div>
          </Link>
        </div>

        {/* Order Status Breakdown */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            {state.language === 'en' ? 'Order Status Breakdown' : 'آرڈر کی حیثیت کی تقسیم'}
          </h2>
          <div className="space-y-3">
            {analytics?.ordersByStatus &&
              Object.entries(analytics.ordersByStatus).map(([status, count]) => (
                <div key={status} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {status === 'DELIVERED' && <CheckCircle className="text-green-500" size={20} />}
                    {status === 'CANCELLED' && <XCircle className="text-red-500" size={20} />}
                    {status === 'PENDING' && <Clock className="text-yellow-500" size={20} />}
                    {status === 'CONFIRMED' && <CheckCircle className="text-blue-500" size={20} />}
                    {status === 'PREPARING' && <Clock className="text-orange-500" size={20} />}
                    {status === 'READY_FOR_PICKUP' && <Package className="text-purple-500" size={20} />}
                    <span className="text-gray-700 capitalize">
                      {status.toLowerCase().replace(/_/g, ' ')}
                    </span>
                  </div>
                  <span className="text-gray-800 font-semibold">{count}</span>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
