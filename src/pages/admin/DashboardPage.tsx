import { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Users, 
  Store, 
  Truck, 
  Package, 
  DollarSign, 
  TrendingUp,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';

interface DashboardMetrics {
  totalCustomers: number;
  activeCustomers: number;
  suspendedCustomers: number;
  
  totalRestaurants: number;
  activeRestaurants: number;
  pendingRestaurantApprovals: number;
  suspendedRestaurants: number;
  
  totalRiders: number;
  approvedRiders: number;
  pendingRiderApprovals: number;
  availableRiders: number;
  
  activeOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  
  grossOrderValue: number;
  platformRevenue: number;
  deliveryFees: number;
  riderEarnings: number;
  platformCommission: number;
  
  pendingPayments: number;
  completedPayments: number;
  failedPayments: number;
}

export default function AdminDashboardPage() {
  const { state } = useApp();
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock data for demo mode
    // In API mode, this would fetch from backend
    const mockMetrics: DashboardMetrics = {
      totalCustomers: 1250,
      activeCustomers: 1180,
      suspendedCustomers: 70,
      
      totalRestaurants: 45,
      activeRestaurants: 38,
      pendingRestaurantApprovals: 5,
      suspendedRestaurants: 2,
      
      totalRiders: 120,
      approvedRiders: 95,
      pendingRiderApprovals: 15,
      availableRiders: 42,
      
      activeOrders: 23,
      completedOrders: 3450,
      cancelledOrders: 120,
      
      grossOrderValue: 12500000,
      platformRevenue: 9800000,
      deliveryFees: 1200000,
      riderEarnings: 2400000,
      platformCommission: 6200000,
      
      pendingPayments: 15,
      completedPayments: 3420,
      failedPayments: 45,
    };

    setMetrics(mockMetrics);
    setLoading(false);
  }, []);

  const formatCurrency = (amount: number) => {
    return `PKR ${(amount / 100).toLocaleString()}`;
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">
            {state.language === 'en' ? 'Admin Dashboard' : 'ایڈمن ڈیش بورڈ'}
          </h1>
          <p className="text-gray-600 mt-1">
            {state.language === 'en'
              ? 'Platform overview and management'
              : 'پلیٹ فارم کا جائزہ اور انتظام'}
          </p>
        </div>

        {/* User Metrics */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            {state.language === 'en' ? 'Users' : 'صارفین'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">
                    {state.language === 'en' ? 'Total Customers' : 'کل گاہک'}
                  </p>
                  <p className="text-3xl font-bold text-gray-800">{metrics?.totalCustomers || 0}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {metrics?.activeCustomers || 0} {state.language === 'en' ? 'active' : 'فعال'}
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                  <Users className="text-blue-600" size={24} />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">
                    {state.language === 'en' ? 'Restaurants' : 'ریسٹورنٹس'}
                  </p>
                  <p className="text-3xl font-bold text-gray-800">{metrics?.totalRestaurants || 0}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {metrics?.pendingRestaurantApprovals || 0} {state.language === 'en' ? 'pending' : 'زیر التواء'}
                  </p>
                </div>
                <div className="w-12 h-12 bg-orange-50 rounded-lg flex items-center justify-center">
                  <Store className="text-kh-orange" size={24} />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">
                    {state.language === 'en' ? 'Riders' : 'رائیڈرز'}
                  </p>
                  <p className="text-3xl font-bold text-gray-800">{metrics?.totalRiders || 0}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {metrics?.availableRiders || 0} {state.language === 'en' ? 'available' : 'دستیاب'}
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
                  <Truck className="text-kh-green" size={24} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Order Metrics */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            {state.language === 'en' ? 'Orders' : 'آرڈرز'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">
                    {state.language === 'en' ? 'Active Orders' : 'فعال آرڈرز'}
                  </p>
                  <p className="text-3xl font-bold text-kh-orange">{metrics?.activeOrders || 0}</p>
                </div>
                <div className="w-12 h-12 bg-orange-50 rounded-lg flex items-center justify-center">
                  <Clock className="text-kh-orange" size={24} />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">
                    {state.language === 'en' ? 'Completed' : 'مکمل'}
                  </p>
                  <p className="text-3xl font-bold text-kh-green">{metrics?.completedOrders || 0}</p>
                </div>
                <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
                  <CheckCircle className="text-kh-green" size={24} />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">
                    {state.language === 'en' ? 'Cancelled' : 'منسوخ'}
                  </p>
                  <p className="text-3xl font-bold text-red-600">{metrics?.cancelledOrders || 0}</p>
                </div>
                <div className="w-12 h-12 bg-red-50 rounded-lg flex items-center justify-center">
                  <XCircle className="text-red-600" size={24} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Financial Metrics */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            {state.language === 'en' ? 'Financial Overview' : 'مالی جائزہ'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-gray-600">
                  {state.language === 'en' ? 'Gross Order Value' : 'کل آرڈر ویلیو'}
                </p>
                <DollarSign className="text-gray-400" size={20} />
              </div>
              <p className="text-2xl font-bold text-gray-800">
                {formatCurrency(metrics?.grossOrderValue || 0)}
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-gray-600">
                  {state.language === 'en' ? 'Platform Revenue' : 'پلیٹ فارم آمدنی'}
                </p>
                <TrendingUp className="text-kh-green" size={20} />
              </div>
              <p className="text-2xl font-bold text-kh-green">
                {formatCurrency(metrics?.platformRevenue || 0)}
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-gray-600">
                  {state.language === 'en' ? 'Rider Earnings' : 'رائیڈر کمائی'}
                </p>
                <DollarSign className="text-blue-600" size={20} />
              </div>
              <p className="text-2xl font-bold text-blue-600">
                {formatCurrency(metrics?.riderEarnings || 0)}
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-gray-600">
                  {state.language === 'en' ? 'Platform Commission' : 'پلیٹ فارم کمیشن'}
                </p>
                <Package className="text-kh-orange" size={20} />
              </div>
              <p className="text-2xl font-bold text-kh-orange">
                {formatCurrency(metrics?.platformCommission || 0)}
              </p>
            </div>
          </div>
        </div>

        {/* Payment Status */}
        <div>
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            {state.language === 'en' ? 'Payment Status' : 'ادائیگی کی حیثیت'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">
                    {state.language === 'en' ? 'Pending' : 'زیر التواء'}
                  </p>
                  <p className="text-3xl font-bold text-yellow-600">{metrics?.pendingPayments || 0}</p>
                </div>
                <div className="w-12 h-12 bg-yellow-50 rounded-lg flex items-center justify-center">
                  <Clock className="text-yellow-600" size={24} />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">
                    {state.language === 'en' ? 'Completed' : 'مکمل'}
                  </p>
                  <p className="text-3xl font-bold text-kh-green">{metrics?.completedPayments || 0}</p>
                </div>
                <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
                  <CheckCircle className="text-kh-green" size={24} />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">
                    {state.language === 'en' ? 'Failed' : 'ناکام'}
                  </p>
                  <p className="text-3xl font-bold text-red-600">{metrics?.failedPayments || 0}</p>
                </div>
                <div className="w-12 h-12 bg-red-50 rounded-lg flex items-center justify-center">
                  <XCircle className="text-red-600" size={24} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
