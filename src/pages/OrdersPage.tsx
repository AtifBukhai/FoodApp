import { Link } from 'react-router-dom';
import { Package, Clock, CheckCircle, ChefHat, Truck, MapPin, RotateCcw } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { OrderStatus } from '../types';

const statusConfig: Record<OrderStatus, { icon: any; color: string; bgColor: string }> = {
  pending: { icon: Clock, color: 'text-yellow-600', bgColor: 'bg-yellow-50' },
  confirmed: { icon: CheckCircle, color: 'text-blue-600', bgColor: 'bg-blue-50' },
  preparing: { icon: ChefHat, color: 'text-orange-600', bgColor: 'bg-orange-50' },
  ready: { icon: Package, color: 'text-purple-600', bgColor: 'bg-purple-50' },
  picked_up: { icon: Truck, color: 'text-indigo-600', bgColor: 'bg-indigo-50' },
  delivered: { icon: CheckCircle, color: 'text-green-600', bgColor: 'bg-green-50' },
  cancelled: { icon: Package, color: 'text-red-600', bgColor: 'bg-red-50' },
};

export default function OrdersPage() {
  const { state, t } = useApp();

  if (!state.user) {
    return (
      <div className="min-h-screen bg-kh-cream flex items-center justify-center">
        <div className="text-center">
          <Package size={48} className="text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-800 mb-2">Please sign in to view orders</h2>
          <Link to="/login" className="text-kh-orange font-medium">Sign In →</Link>
        </div>
      </div>
    );
  }

  if (state.orders.length === 0) {
    return (
      <div className="min-h-screen bg-kh-cream flex items-center justify-center">
        <div className="text-center">
          <Package size={48} className="text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-800 mb-2">{t('noOrders')}</h2>
          <Link to="/restaurants" className="text-kh-orange font-medium">{t('browseRestaurants')} →</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-kh-cream">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">{t('orderHistory')}</h1>

        <div className="space-y-4">
          {state.orders.map(order => {
            const config = statusConfig[order.status];
            const StatusIcon = config.icon;
            const statusLabel = (t('orderStatus') as any)[order.status] || order.status;

            return (
              <div key={order.id} className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-50">
                {/* Order header */}
                <div className="p-4 border-b border-gray-50 flex items-center justify-between flex-wrap gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-gray-800">#{order.id}</span>
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${config.bgColor} ${config.color}`}>
                        <StatusIcon size={12} />
                        {statusLabel}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">{order.restaurantName}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-kh-orange">PKR {order.total}</p>
                    <p className="text-xs text-gray-400">
                      {new Date(order.createdAt).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>

                {/* Order items */}
                <div className="p-4">
                  <div className="flex flex-wrap gap-2 mb-3">
                    {order.items.map((item, i) => (
                      <span key={i} className="text-xs bg-kh-cream px-2 py-1 rounded-lg text-gray-600">
                        {item.quantity}x {state.language === 'en' ? item.menuItem.name : item.menuItem.nameUrdu}
                      </span>
                    ))}
                  </div>

                  {/* Tracking timeline for active orders */}
                  {order.status !== 'delivered' && order.status !== 'cancelled' && (
                    <div className="mt-4 pt-4 border-t border-gray-50">
                      <div className="flex items-center gap-1 overflow-x-auto pb-2">
                        {(['pending', 'confirmed', 'preparing', 'ready', 'picked_up', 'delivered'] as OrderStatus[]).map((step, i, arr) => {
                          const stepIndex = arr.indexOf(order.status);
                          const isCompleted = i <= stepIndex;
                          const isCurrent = step === order.status;
                          return (
                            <div key={step} className="flex items-center">
                              <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${isCompleted ? 'bg-kh-orange text-white' : 'bg-gray-100 text-gray-400'} ${isCurrent ? 'ring-2 ring-kh-orange/30' : ''}`}>
                                {isCompleted ? <CheckCircle size={12} /> : <span className="text-[10px] font-bold">{i + 1}</span>}
                              </div>
                              {i < arr.length - 1 && (
                                <div className={`w-8 h-0.5 ${i < stepIndex ? 'bg-kh-orange' : 'bg-gray-200'}`} />
                              )}
                            </div>
                          );
                        })}
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        {state.language === 'en' ? 'Estimated delivery: ' : 'متوقع ڈیلیوری: '}
                        {new Date(order.estimatedDelivery).toLocaleTimeString('en-PK', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-3 mt-4 pt-3 border-t border-gray-50">
                    {order.status === 'delivered' && (
                      <button className="flex items-center gap-1 text-sm text-kh-orange font-medium hover:underline">
                        <RotateCcw size={14} />
                        {t('reorder')}
                      </button>
                    )}
                    {order.status !== 'delivered' && order.status !== 'cancelled' && (
                      <button className="flex items-center gap-1 text-sm text-kh-orange font-medium hover:underline">
                        <MapPin size={14} />
                        {t('trackOrder')}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
