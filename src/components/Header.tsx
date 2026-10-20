import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingCart, User, Menu, X, Globe, MapPin, ChevronDown } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function Header() {
  const { state, dispatch, t, cartCount } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-orange-gradient rounded-xl flex items-center justify-center">
              <span className="text-white text-xl font-bold">K</span>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold text-kh-green-dark leading-tight">KhaanaDa</h1>
              <p className="text-[10px] text-kh-gray -mt-1">{t('tagline')}</p>
            </div>
          </Link>

          {/* Location indicator */}
          <div className="hidden md:flex items-center gap-1 text-sm text-kh-gray bg-kh-gray-light px-3 py-1.5 rounded-full">
            <MapPin size={14} className="text-kh-orange" />
            <span>DHA Phase 5, Lahore</span>
            <ChevronDown size={12} />
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6">
            <Link
              to="/"
              className={`text-sm font-medium transition-colors ${isActive('/') ? 'text-kh-orange' : 'text-gray-600 hover:text-kh-orange'}`}
            >
              {t('home')}
            </Link>
            <Link
              to="/restaurants"
              className={`text-sm font-medium transition-colors ${isActive('/restaurants') ? 'text-kh-orange' : 'text-gray-600 hover:text-kh-orange'}`}
            >
              {t('restaurants')}
            </Link>
            {state.user && (
              <Link
                to="/orders"
                className={`text-sm font-medium transition-colors ${isActive('/orders') ? 'text-kh-orange' : 'text-gray-600 hover:text-kh-orange'}`}
              >
                {t('orders')}
              </Link>
            )}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-3">
            {/* Language Toggle */}
            <button
              onClick={() => dispatch({ type: 'SET_LANGUAGE', payload: state.language === 'en' ? 'ur' : 'en' })}
              className="flex items-center gap-1 text-sm text-gray-600 hover:text-kh-orange transition-colors px-2 py-1 rounded-lg hover:bg-kh-gray-light"
              title="Toggle Language"
            >
              <Globe size={16} />
              <span className="hidden sm:inline text-xs">{state.language === 'en' ? 'اردو' : 'EN'}</span>
            </button>

            {/* Cart */}
            <button
              onClick={() => dispatch({ type: 'TOGGLE_CART', payload: true })}
              className="relative p-2 text-gray-600 hover:text-kh-orange transition-colors"
            >
              <ShoppingCart size={22} />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-kh-orange text-white text-xs font-bold rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>

            {/* User */}
            {state.user ? (
              <Link to="/profile" className="p-2 text-gray-600 hover:text-kh-orange transition-colors">
                <User size={22} />
              </Link>
            ) : (
              <Link
                to="/login"
                className="hidden sm:flex items-center gap-1 bg-kh-orange text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-kh-orange-dark transition-colors"
              >
                {t('login')}
              </Link>
            )}

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-gray-600"
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 animate-fade-in">
          <div className="px-4 py-3 space-y-2">
            <Link to="/" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-gray-700 font-medium">
              {t('home')}
            </Link>
            <Link to="/restaurants" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-gray-700 font-medium">
              {t('restaurants')}
            </Link>
            {state.user && (
              <Link to="/orders" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-gray-700 font-medium">
                {t('orders')}
              </Link>
            )}
            {!state.user && (
              <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-kh-orange font-medium">
                {t('login')}
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
