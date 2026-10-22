import { useState, useEffect } from 'react';
import { Package, Clock, CheckCircle, XCircle, ChefHat, Truck } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface Order {
  id: string;
  orderNumber: string;
  restaurantName: string;
  customerName: string;
  customerPhone: string;
  total: number;
  status: string;
  items: Array<{
    menuItem: { name: string };
    quantity: number;
  }>;
  createdAt: string;
}

export default function PartnerOrdersPage() {
  const { state } = useApp();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    // Mock data - in real implementation, fetch from API
    setOrders([
      {
        id: 'order-1',
        orderNumber: 'KD-12345',
        restaurantName: 'Lahori Chargha',
        customerName: 'Ahmed Khan',
        customerPhone: '+923001234567',
        total: 150000,
        status: 'PENDING',
        items: [
          { menuItem: { name: 'Chicken Chargha' }, quantity: 1 },
          { menuItem: { name: 'Naan' }, quantity: 3 },
        ],
        createdAt: new Date().toISOString(),
      },
      {
        id: 'order-2',
        orderNumber: 'KD-12346',
        restaurantName: 'Lahori Chargha',
        customerName: 'Sara Ali',
        customerPhone: '+923009876543',
        total: 250000,
        status: 'CONFIRMED',
        items: [
          { menuItem: { name: 'Full Chargha' }, quantity: 1 },
          { menuItem: { name: 'Raita' }, quantity: 2 },
        ],
        createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      },
      {
        id: 'order-3',
        orderNumber: 'KD-12347',
        restaurantName: 'Lahori Chargha',
        customerName: 'Usman Raza',
        customerPhone: '+923005555555',
        total: 180000,
        status: 'PREPARING',
        items: [
          { menuItem: { name: 'Half Chargha' }, quantity: 2 },
        ],
        createdAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
      },
    ]);
    setLoading(false);
  }, []);

  const filteredOrders = filter === 'all' ? orders : orders.filter((o) => o.status === filter);

  const handleAcceptOrder = async (orderId: string) => {
    // In real implementation, call API
    console.log('Accepting order:', orderId);
    setOrders(orders.map((o) => (o.id === orderId ? { ...o, status: 'CONFIRMED' } : o)));
  };

  const handleRejectOrder = async (orderId: string) => {
    // In real implementation, call API
    console.log('Rejecting order:', orderId);
    setOrders(orders.map((o) => (o.id === orderId ? { ...o, status: 'CANCELLED' } : o)));
  };

  const handleMarkPreparing = async (orderId: string) => {
    console.log('Marking as preparing:', orderId);
    setOrders(orders.map((o) => (o.id === orderId ? { ...o, status: 'PREPARING' } : o)));
  };

  const handleMarkReady = async (orderId: string) => {
    console.log('Marking as ready:', orderId);
    setOrders(orders.map((o) => (o.id === orderId ? { ...o, status: 'READY_FOR_PICKUP' } : o)));
  };

  const formatCurrency = (amount: number) => {
    return `PKR ${(amount / 100).toLocaleString()}`;
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Clock className="text-yellow-500" size={20} />;
      case 'CONFIRMED':
        return <CheckCircle className="text-blue-500" size={20} />;
      case 'PREPARING':
        return <ChefHat className="text-orange-500" size={20} />;
      case 'READY_FOR_PICKUP':
        return <Package className="text-purple-500" size={20} />;
      case 'PICKED_UP':
        return <Truck className="text-indigo-500" size={20} />;
      case 'DELIVERED':
        return <CheckCircle className="text-green-500" size={20} />;
      case 'CANCELLED':
        return <XCircle className="text-red-500" size={20} />;
      default:
        return <Clock className="text-gray-500" size={20} />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-700';
      case 'CONFIRMED':
        return 'bg-blue-100 text-blue-700';
      case 'PREPARING':
        return 'bg-orange-100 text-orange-700';
      case 'READY_FOR_PICKUP':
        return 'bg-purple-100 text-purple-700';
      case 'PICKED_UP':
        return 'bg-indigo-100 text-indigo-700';
      case 'DELIVERED':
        return 'bg-green-100 text-green-700';
      case 'CANCELLED':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-kh-cream flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-kh-orange mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading orders...</p>
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
            {state.language === 'en' ? 'Orders' : 'آرڈرز'}
          </h1>
          <p className="text-gray-600 mt-1">
            {state.language === 'en'
              ? 'Manage incoming orders from customers'
              : 'گاہکوں سے آنے والے آرڈرز کا انتظام کریں'}
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100 mb-6">
          <div className="flex flex-wrap gap-2">
            {['all', 'PENDING', 'CONFIRMED', 'PREPARING', 'READY_FOR_PICKUP', 'DELIVERED', 'CANCELLED'].map(
              (status) => (
                <button
                  key={status}
                  onClick={() => setFilter(status)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    filter === status
                      ? 'bg-kh-orange text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {status === 'all'
                    ? state.language === 'en'
                      ? 'All'
                      : 'سب'
                    : status.replace(/_/g, ' ')}
                </button>
              ),
            )}
          </div>
        </div>

        {/* Orders List */}
        {filteredOrders.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center border border-gray-100">
            <Package size={48} className="text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              {state.language === 'en' ? 'No orders found' : 'کوئی آرڈر نہیں ملا'}
            </h3>
            <p className="text-gray-500">
              {state.language === 'en'
                ? 'Orders will appear here when customers place them'
                : 'جب گاہک آرڈر کریں گے تو آرڈرز یہاں ظاہر ہوں گے'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <div
                key={order.id}
                className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
              >
                <div className="p-6">
                  {/* Order Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold text-gray-800">#{order.orderNumber}</h3>
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 ${getStatusColor(
                            order.status,
                          )}`}
                        >
                          {getStatusIcon(order.status)}
                          {order.status.replace(/_/g, ' ')}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">{order.restaurantName}</p>
                      <p className="text-sm text-gray-500">{formatTime(order.createdAt)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-kh-orange">{formatCurrency(order.total)}</p>
                    </div>
                  </div>

                  {/* Customer Info */}
                  <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">
                          {state.language === 'en' ? 'Customer' : 'گاہک'}
                        </p>
                        <p className="font-semibold text-gray-800">{order.customerName}</p>
                        <p className="text-sm text-gray-600">{order.customerPhone}</p>
                      </div>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">
                      {state.language === 'en' ? 'Items' : 'آئٹمز'}
                    </p>
                    <div className="space-y-2">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between text-sm">
                          <span className="text-gray-700">
                            {item.quantity}x {item.menuItem.name}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    {order.status === 'PENDING' && (
                      <>
                        <button
                          onClick={() => handleAcceptOrder(order.id)}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-kh-green text-white rounded-lg hover:bg-kh-green-dark transition-colors font-medium"
                        >
                          <CheckCircle size={18} />
                          {state.language === 'en' ? 'Accept' : 'قبول کریں'}
                        </button>
                        <button
                          onClick={() => handleRejectOrder(order.id)}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium"
                        >
                          <XCircle size={18} />
                          {state.language === 'en' ? 'Reject' : 'مسترد کریں'}
                        </button>
                      </>
                    )}
                    {order.status === 'CONFIRMED' && (
                      <button
                        onClick={() => handleMarkPreparing(order.id)}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-kh-orange text-white rounded-lg hover:bg-kh-orange-dark transition-colors font-medium"
                      >
                        <ChefHat size={18} />
                        {state.language === 'en' ? 'Start Preparing' : 'تیاری شروع کریں'}
                      </button>
                    )}
                    {order.status === 'PREPARING' && (
                      <button
                        onClick={() => handleMarkReady(order.id)}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors font-medium"
                      >
                        <Package size={18} />
                        {state.language === 'en' ? 'Mark as Ready' : 'تیار نشان زد کریں'}
                      </button>
                    )}
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
