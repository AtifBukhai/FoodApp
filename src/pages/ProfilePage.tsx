import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, MapPin, Package, LogOut, Globe, ChevronRight, Plus, Trash2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { apiClient } from '../services/api';

export default function ProfilePage() {
  const { state, dispatch, t } = useApp();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState<'profile' | 'addresses' | 'settings'>('profile');
  const [loggingOut, setLoggingOut] = useState(false);

  if (!state.user) {
    return (
      <div className="min-h-screen bg-kh-cream flex items-center justify-center">
        <div className="text-center">
          <User size={48} className="text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-800 mb-2">Please sign in</h2>
          <Link to="/login" className="text-kh-orange font-medium">Sign In →</Link>
        </div>
      </div>
    );
  }

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      // Call API logout (best effort - don't block on failure)
      await apiClient.logout();
    } catch (err) {
      // Ignore errors - we still want to log out locally
    } finally {
      // Clear local state and redirect
      dispatch({ type: 'LOGOUT' });
      navigate('/login');
      setLoggingOut(false);
    }
  };

  const handleDeleteAddress = (id: string) => {
    dispatch({ type: 'REMOVE_ADDRESS', payload: id });
  };

  return (
    <div className="min-h-screen bg-kh-cream">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile header */}
        <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-orange-gradient rounded-full flex items-center justify-center text-white text-2xl font-bold">
              {state.user.name[0]}
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800">{state.user.name}</h1>
              <p className="text-sm text-gray-500">{state.user.email}</p>
              <p className="text-sm text-gray-500">{state.user.phone}</p>
            </div>
          </div>
        </div>

        {/* Navigation tabs */}
        <div className="flex gap-1 bg-white rounded-xl p-1 shadow-sm mb-6">
          {([
            { key: 'profile', label: t('profile'), icon: User },
            { key: 'addresses', label: t('addresses'), icon: MapPin },
            { key: 'settings', label: t('language'), icon: Globe },
          ] as const).map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveSection(tab.key)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeSection === tab.key ? 'bg-kh-orange text-white shadow-sm' : 'text-gray-600 hover:text-gray-800'}`}
            >
              <tab.icon size={16} />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        {activeSection === 'profile' && (
          <div className="bg-white rounded-xl p-6 shadow-sm space-y-4">
            <h2 className="text-lg font-bold text-gray-800">{t('editProfile')}</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">{t('name')}</label>
                <input
                  type="text"
                  defaultValue={state.user.name}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-kh-orange focus:ring-2 focus:ring-orange-100 outline-none"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">{t('email')}</label>
                <input
                  type="email"
                  defaultValue={state.user.email}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-kh-orange focus:ring-2 focus:ring-orange-100 outline-none"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">{t('phone')}</label>
                <input
                  type="tel"
                  defaultValue={state.user.phone}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-kh-orange focus:ring-2 focus:ring-orange-100 outline-none"
                />
              </div>
            </div>
            <div className="flex gap-3 pt-4">
              <button className="bg-kh-orange text-white px-6 py-2.5 rounded-xl font-medium hover:bg-kh-orange-dark transition-colors">
                {state.language === 'en' ? 'Save Changes' : 'تبدیلیاں محفوظ کریں'}
              </button>
              <Link
                to="/orders"
                className="flex items-center gap-2 text-kh-orange font-medium hover:underline"
              >
                <Package size={16} />
                {t('orderHistory')}
              </Link>
            </div>
          </div>
        )}

        {activeSection === 'addresses' && (
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-800">{t('addresses')}</h2>
              <button className="flex items-center gap-1 text-sm text-kh-orange font-medium hover:underline">
                <Plus size={16} />
                {t('addAddress')}
              </button>
            </div>
            <div className="space-y-3">
              {state.addresses.map(addr => (
                <div key={addr.id} className="flex items-start justify-between p-4 border border-gray-100 rounded-xl">
                  <div className="flex items-start gap-3">
                    <MapPin size={18} className="text-kh-orange mt-0.5" />
                    <div>
                      <p className="font-medium text-gray-800">{addr.label}</p>
                      <p className="text-sm text-gray-500">{addr.street}</p>
                      <p className="text-sm text-gray-500">{addr.area}, {addr.city}</p>
                      {addr.isDefault && (
                        <span className="inline-block mt-1 text-xs bg-green-50 text-kh-green px-2 py-0.5 rounded-full font-medium">
                          Default
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteAddress(addr.id)}
                    className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeSection === 'settings' && (
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-bold text-gray-800 mb-4">{t('language')}</h2>
            <div className="space-y-3">
              <button
                onClick={() => dispatch({ type: 'SET_LANGUAGE', payload: 'en' })}
                className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-colors ${state.language === 'en' ? 'border-kh-orange bg-orange-50' : 'border-gray-100 hover:border-gray-200'}`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">🇬🇧</span>
                  <span className="font-medium text-gray-800">English</span>
                </div>
                {state.language === 'en' && <ChevronRight size={18} className="text-kh-orange" />}
              </button>
              <button
                onClick={() => dispatch({ type: 'SET_LANGUAGE', payload: 'ur' })}
                className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-colors ${state.language === 'ur' ? 'border-kh-orange bg-orange-50' : 'border-gray-100 hover:border-gray-200'}`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">🇵🇰</span>
                  <span className="font-medium text-gray-800">اردو</span>
                </div>
                {state.language === 'ur' && <ChevronRight size={18} className="text-kh-orange" />}
              </button>
            </div>
          </div>
        )}

        {/* Logout */}
        <div className="mt-6">
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="flex items-center gap-2 text-red-500 font-medium hover:text-red-700 transition-colors disabled:opacity-50"
          >
            <LogOut size={18} />
            {loggingOut 
              ? (state.language === 'en' ? 'Logging out...' : 'لاگ آؤٹ ہو رہا ہے...')
              : t('logout')}
          </button>
        </div>
      </div>
    </div>
  );
}
