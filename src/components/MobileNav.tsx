import { Link, useLocation } from 'react-router-dom';
import { Home, Search, Package, User } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function MobileNav() {
  const { t } = useApp();
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 shadow-lg z-40 md:hidden">
      <div className="flex items-center justify-around py-2">
        <Link
          to="/"
          className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg transition-colors ${isActive('/') ? 'text-kh-orange' : 'text-gray-400'}`}
        >
          <Home size={20} />
          <span className="text-[10px] font-medium">{t('home')}</span>
        </Link>
        <Link
          to="/restaurants"
          className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg transition-colors ${isActive('/restaurants') ? 'text-kh-orange' : 'text-gray-400'}`}
        >
          <Search size={20} />
          <span className="text-[10px] font-medium">{t('restaurants')}</span>
        </Link>
        <Link
          to="/orders"
          className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg transition-colors ${isActive('/orders') ? 'text-kh-orange' : 'text-gray-400'}`}
        >
          <Package size={20} />
          <span className="text-[10px] font-medium">{t('orders')}</span>
        </Link>
        <Link
          to="/profile"
          className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg transition-colors ${isActive('/profile') ? 'text-kh-orange' : 'text-gray-400'}`}
        >
          <User size={20} />
          <span className="text-[10px] font-medium">{t('profile')}</span>
        </Link>
      </div>
    </nav>
  );
}
