import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import Header from './components/Header';
import Footer from './components/Footer';
import CartDrawer from './components/CartDrawer';
import HomePage from './pages/HomePage';
import RestaurantsPage from './pages/RestaurantsPage';
import RestaurantDetailPage from './pages/RestaurantDetailPage';
import CheckoutPage from './pages/CheckoutPage';
import OrdersPage from './pages/OrdersPage';
import LoginPage from './pages/LoginPage';
import ProfilePage from './pages/ProfilePage';
import NotFoundPage from './pages/NotFoundPage';
import PartnerPage from './pages/PartnerPage';
import ScrollToTop from './components/ScrollToTop';
import MobileNav from './components/MobileNav';
import { useEffect } from 'react';

function Notification() {
  const { state, dispatch } = useApp();

  useEffect(() => {
    if (state.notification) {
      const timer = setTimeout(() => {
        dispatch({ type: 'SET_NOTIFICATION', payload: null });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [state.notification, dispatch]);

  if (!state.notification) return null;

  const colors = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    info: 'bg-blue-500',
  };

  return (
    <div className={`fixed top-20 right-4 z-[60] ${colors[state.notification.type]} text-white px-4 py-3 rounded-xl shadow-lg animate-fade-in max-w-sm`}>
      <p className="text-sm font-medium">{state.notification.message}</p>
    </div>
  );
}

function AppContent() {
  const { state } = useApp();
  const dir = state.language === 'ur' ? 'rtl' : 'ltr';

  return (
    <div dir={dir} className="min-h-screen flex flex-col">
      <ScrollToTop />
      <Header />
      <main className="flex-1 pb-16 md:pb-0">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/restaurants" element={<RestaurantsPage />} />
          <Route path="/restaurant/:id" element={<RestaurantDetailPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/orders" element={<OrdersPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/partner" element={<PartnerPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
      <Footer />
      <CartDrawer />
      <MobileNav />
      <Notification />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </BrowserRouter>
  );
}
