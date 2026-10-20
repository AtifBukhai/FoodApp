import { X, Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Link } from 'react-router-dom';

export default function CartDrawer() {
  const { state, dispatch, t, cartTotal } = useApp();

  if (!state.cartOpen) return null;

  const deliveryFee = state.cart.length > 0 ? 80 : 0;
  const tax = Math.round(cartTotal * 0.05);
  const total = cartTotal + deliveryFee + tax;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 z-50 transition-opacity"
        onClick={() => dispatch({ type: 'TOGGLE_CART', payload: false })}
      />

      {/* Drawer */}
      <div className="fixed top-0 right-0 h-full w-full max-w-md bg-white z-50 shadow-2xl flex flex-col animate-slide-right">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <ShoppingBag className="text-kh-orange" size={20} />
            <h2 className="text-lg font-bold text-gray-800">{t('cart')}</h2>
            <span className="text-sm text-gray-500">({state.cart.length} items)</span>
          </div>
          <button
            onClick={() => dispatch({ type: 'TOGGLE_CART', payload: false })}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-4">
          {state.cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-20 h-20 bg-kh-cream-dark rounded-full flex items-center justify-center mb-4">
                <ShoppingBag size={32} className="text-kh-orange-light" />
              </div>
              <h3 className="text-lg font-semibold text-gray-700 mb-1">{t('emptyCart')}</h3>
              <p className="text-sm text-gray-500">{t('startOrdering')}</p>
              <Link
                to="/restaurants"
                onClick={() => dispatch({ type: 'TOGGLE_CART', payload: false })}
                className="mt-4 px-6 py-2 bg-kh-orange text-white rounded-full text-sm font-medium hover:bg-kh-orange-dark transition-colors"
              >
                {t('browseRestaurants')}
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {state.cart.map((item, index) => (
                <div key={index} className="flex gap-3 bg-kh-cream rounded-xl p-3">
                  <img
                    src={item.menuItem.image}
                    alt={state.language === 'en' ? item.menuItem.name : item.menuItem.nameUrdu}
                    className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold text-gray-800 truncate">
                      {state.language === 'en' ? item.menuItem.name : item.menuItem.nameUrdu}
                    </h4>
                    {item.selectedModifiers.length > 0 && (
                      <p className="text-xs text-gray-500 mt-0.5">
                        {item.selectedModifiers.map(m => m.name).join(', ')}
                      </p>
                    )}
                    <p className="text-sm font-bold text-kh-orange mt-1">
                      PKR {(item.menuItem.price + item.selectedModifiers.reduce((s, m) => s + m.price, 0)) * item.quantity}
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => dispatch({ type: 'UPDATE_QUANTITY', payload: { index, quantity: item.quantity - 1 } })}
                          className="w-7 h-7 rounded-full bg-white border border-gray-200 flex items-center justify-center hover:border-kh-orange transition-colors"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="text-sm font-semibold w-5 text-center">{item.quantity}</span>
                        <button
                          onClick={() => dispatch({ type: 'UPDATE_QUANTITY', payload: { index, quantity: item.quantity + 1 } })}
                          className="w-7 h-7 rounded-full bg-white border border-gray-200 flex items-center justify-center hover:border-kh-orange transition-colors"
                        >
                          <Plus size={12} />
                        </button>
                      </div>
                      <button
                        onClick={() => dispatch({ type: 'REMOVE_FROM_CART', payload: index })}
                        className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {state.cart.length > 0 && (
          <div className="border-t border-gray-100 p-4 bg-white">
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm text-gray-600">
                <span>{t('subtotal')}</span>
                <span>PKR {cartTotal}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>{t('deliveryFee')}</span>
                <span>PKR {deliveryFee}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>{t('tax')}</span>
                <span>PKR {tax}</span>
              </div>
              <div className="flex justify-between text-base font-bold text-gray-800 pt-2 border-t border-dashed border-gray-200">
                <span>{t('total')}</span>
                <span className="text-kh-orange">PKR {total}</span>
              </div>
            </div>
            <Link
              to="/checkout"
              onClick={() => dispatch({ type: 'TOGGLE_CART', payload: false })}
              className="block w-full text-center bg-kh-orange text-white py-3 rounded-xl font-semibold hover:bg-kh-orange-dark transition-colors"
            >
              {t('checkout')} — PKR {total}
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
