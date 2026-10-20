import { Link } from 'react-router-dom';
import { Clock, Star, Truck, Shield, Utensils, ChevronRight, Flame } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { restaurants, categories } from '../data';

export default function HomePage() {
  const { t, state } = useApp();
  const featuredRestaurants = restaurants.filter(r => r.featured && r.isOpen);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-hero-gradient relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="animate-fade-in">
              <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-full text-sm text-kh-orange font-medium mb-4 shadow-sm">
                <Flame size={14} />
                <span>{t('devNote')}</span>
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 leading-tight">
                {t('heroTitle')}
                <br />
                <span className="text-kh-orange">{t('heroTitle2')}</span>
              </h1>
              <p className="mt-4 text-lg text-gray-600 max-w-lg">
                {t('heroSubtitle')}
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  to="/restaurants"
                  className="inline-flex items-center gap-2 bg-kh-orange text-white px-6 py-3 rounded-full font-semibold hover:bg-kh-orange-dark transition-all shadow-lg shadow-orange-200 hover:shadow-orange-300"
                >
                  {t('browseRestaurants')}
                  <ChevronRight size={18} />
                </Link>
              </div>
              {/* Stats */}
              <div className="mt-8 flex items-center gap-6 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Star size={16} className="text-yellow-500 fill-yellow-500" />
                  <span className="font-semibold text-gray-800">4.8</span>
                  <span>App Rating</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock size={16} className="text-kh-orange" />
                  <span className="font-semibold text-gray-800">30 min</span>
                  <span>Avg. Delivery</span>
                </div>
                <div className="flex items-center gap-1">
                  <Utensils size={16} className="text-kh-green" />
                  <span className="font-semibold text-gray-800">500+</span>
                  <span>Restaurants</span>
                </div>
              </div>
            </div>
            <div className="hidden md:block relative">
              <div className="relative w-full aspect-square max-w-lg mx-auto">
                <div className="absolute inset-0 bg-kh-orange/10 rounded-full animate-pulse-soft"></div>
                <img
                  src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&h=600&fit=crop"
                  alt="Delicious food"
                  className="relative rounded-3xl shadow-2xl object-cover w-full h-full"
                />
                {/* Floating card */}
                <div className="absolute -bottom-4 -left-4 bg-white rounded-2xl shadow-xl p-3 flex items-center gap-3 animate-fade-in">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <Truck size={18} className="text-kh-green" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Delivery</p>
                    <p className="text-sm font-bold text-gray-800">25-35 min</p>
                  </div>
                </div>
                {/* Floating rating */}
                <div className="absolute -top-2 -right-2 bg-white rounded-2xl shadow-xl p-3 animate-fade-in">
                  <div className="flex items-center gap-1">
                    <Star size={14} className="text-yellow-500 fill-yellow-500" />
                    <span className="text-sm font-bold">4.7</span>
                  </div>
                  <p className="text-xs text-gray-500">2.3k reviews</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">{t('categories')}</h2>
          <Link to="/restaurants" className="text-sm text-kh-orange font-medium hover:underline flex items-center gap-1">
            View All <ChevronRight size={14} />
          </Link>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
          {categories.slice(0, 12).map(cat => (
            <Link
              key={cat.id}
              to={`/restaurants?cuisine=${cat.slug}`}
              className="flex flex-col items-center gap-2 p-4 bg-white rounded-2xl shadow-sm hover:shadow-md transition-all card-hover border border-gray-50"
            >
              <span className="text-3xl">{cat.icon}</span>
              <span className="text-xs font-medium text-gray-700 text-center">
                {state.language === 'en' ? cat.name : cat.nameUrdu}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Restaurants */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">{t('featured')}</h2>
          <Link to="/restaurants" className="text-sm text-kh-orange font-medium hover:underline flex items-center gap-1">
            {t('allRestaurants')} <ChevronRight size={14} />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {featuredRestaurants.map(restaurant => (
            <Link
              key={restaurant.id}
              to={`/restaurant/${restaurant.id}`}
              className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all card-hover border border-gray-50"
            >
              <div className="relative">
                <img
                  src={restaurant.image}
                  alt={state.language === 'en' ? restaurant.name : restaurant.nameUrdu}
                  className="w-full h-44 object-cover"
                />
                {restaurant.isOpen ? (
                  <span className="absolute top-3 left-3 bg-kh-green-light text-white text-xs font-medium px-2 py-0.5 rounded-full">
                    {t('open')}
                  </span>
                ) : (
                  <span className="absolute top-3 left-3 bg-red-500 text-white text-xs font-medium px-2 py-0.5 rounded-full">
                    {t('closed')}
                  </span>
                )}
                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-full px-2 py-0.5 flex items-center gap-1">
                  <Star size={12} className="text-yellow-500 fill-yellow-500" />
                  <span className="text-xs font-bold">{restaurant.rating}</span>
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-bold text-gray-800 truncate">
                  {state.language === 'en' ? restaurant.name : restaurant.nameUrdu}
                </h3>
                <p className="text-xs text-gray-500 mt-1 truncate">
                  {restaurant.cuisine.join(' • ')}
                </p>
                <div className="flex items-center justify-between mt-3 text-xs text-gray-600">
                  <span className="flex items-center gap-1">
                    <Clock size={12} />
                    {restaurant.deliveryTime}
                  </span>
                  <span className="flex items-center gap-1">
                    <Truck size={12} />
                    {restaurant.deliveryFee === 0 ? t('free') : `PKR ${restaurant.deliveryFee}`}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Why KhaanaDa */}
      <section className="bg-white py-16 mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-800 text-center mb-10">{t('whyKhaanaDa')}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: <Truck className="text-kh-orange" size={28} />, title: t('fastDelivery'), desc: t('fastDeliveryDesc'), bg: 'bg-orange-50' },
              { icon: <Star className="text-yellow-500" size={28} />, title: t('bestRestaurants'), desc: t('bestRestaurantsDesc'), bg: 'bg-yellow-50' },
              { icon: <Utensils className="text-kh-green" size={28} />, title: t('easyOrdering'), desc: t('easyOrderingDesc'), bg: 'bg-green-50' },
              { icon: <Shield className="text-blue-500" size={28} />, title: t('securePayments'), desc: t('securePaymentsDesc'), bg: 'bg-blue-50' },
            ].map((item, i) => (
              <div key={i} className={`${item.bg} rounded-2xl p-6 text-center`}>
                <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center mx-auto mb-4 shadow-sm">
                  {item.icon}
                </div>
                <h3 className="font-bold text-gray-800 mb-2">{item.title}</h3>
                <p className="text-sm text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-orange-gradient rounded-3xl p-8 md:p-12 text-center text-white relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-10 left-10 w-32 h-32 bg-white rounded-full"></div>
            <div className="absolute bottom-10 right-10 w-48 h-48 bg-white rounded-full"></div>
          </div>
          <div className="relative">
            <h2 className="text-3xl md:text-4xl font-extrabold mb-4">
              {state.language === 'en' ? 'Hungry? We\'ve got you covered.' : 'بھوک لگی ہے؟ ہم حاضر ہیں۔'}
            </h2>
            <p className="text-orange-100 text-lg mb-8 max-w-2xl mx-auto">
              {state.language === 'en'
                ? 'Order from 500+ restaurants across Pakistan. Cash on Delivery available.'
                : 'پاکستان بھر میں 500+ ریسٹورنٹس سے آرڈر کریں۔ کیش آن ڈیلیوری دستیاب ہے۔'}
            </p>
            <Link
              to="/restaurants"
              className="inline-flex items-center gap-2 bg-white text-kh-orange px-8 py-3 rounded-full font-bold text-lg hover:bg-orange-50 transition-colors shadow-lg"
            >
              {t('browseRestaurants')}
              <ChevronRight size={20} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
