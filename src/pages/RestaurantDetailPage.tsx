import { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Star, Clock, Truck, MapPin, Plus, Minus, Leaf, Flame, Award } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { restaurants, menuItems } from '../data';

export default function RestaurantDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { state, dispatch, t } = useApp();
  const [activeTab, setActiveTab] = useState<'menu' | 'about' | 'reviews'>('menu');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const restaurant = restaurants.find(r => r.id === id);
  const items = useMemo(() => menuItems.filter(m => m.restaurantId === id), [id]);
  const menuCategories = useMemo(() => [...new Set(items.map(i => i.category))], [items]);

  const filteredItems = useMemo(() => {
    if (selectedCategory === 'all') return items;
    return items.filter(i => i.category === selectedCategory);
  }, [items, selectedCategory]);

  const cartItemQuantity = (itemId: string) => {
    const cartItem = state.cart.find(ci => ci.menuItem.id === itemId);
    return cartItem ? cartItem.quantity : 0;
  };

  if (!restaurant) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800">Restaurant not found</h2>
          <Link to="/restaurants" className="text-kh-orange mt-4 inline-block">← Back to restaurants</Link>
        </div>
      </div>
    );
  }

  const handleAddToCart = (item: typeof menuItems[0]) => {
    dispatch({
      type: 'ADD_TO_CART',
      payload: {
        menuItem: item,
        quantity: 1,
        selectedModifiers: [],
        notes: '',
      },
    });
  };

  return (
    <div className="min-h-screen bg-kh-cream">
      {/* Hero Banner */}
      <div className="relative h-64 md:h-80">
        <img
          src={restaurant.image}
          alt={state.language === 'en' ? restaurant.name : restaurant.nameUrdu}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        <Link
          to="/restaurants"
          className="absolute top-4 left-4 flex items-center gap-1 bg-white/90 backdrop-blur-sm text-gray-800 px-3 py-1.5 rounded-full text-sm font-medium hover:bg-white transition-colors"
        >
          <ArrowLeft size={16} />
          Back
        </Link>
        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-3xl md:text-4xl font-extrabold">
              {state.language === 'en' ? restaurant.name : restaurant.nameUrdu}
            </h1>
            <p className="text-white/80 text-sm mt-1">{restaurant.cuisine.join(' • ')}</p>
            <div className="flex items-center gap-4 mt-3 text-sm">
              <span className="flex items-center gap-1 bg-white/20 backdrop-blur-sm px-2 py-0.5 rounded-full">
                <Star size={14} className="text-yellow-400 fill-yellow-400" />
                {restaurant.rating} ({restaurant.reviewCount.toLocaleString()} {t('reviews')})
              </span>
              <span className="flex items-center gap-1">
                <Clock size={14} />
                {restaurant.deliveryTime}
              </span>
              <span className="flex items-center gap-1">
                <Truck size={14} />
                PKR {restaurant.deliveryFee}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Tabs */}
        <div className="flex gap-1 bg-white rounded-xl p-1 shadow-sm mb-6">
          {(['menu', 'about', 'reviews'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeTab === tab ? 'bg-kh-orange text-white shadow-sm' : 'text-gray-600 hover:text-gray-800'}`}
            >
              {tab === 'menu' ? t('menu') : tab === 'about' ? t('about') : t('reviews_label')}
            </button>
          ))}
        </div>

        {activeTab === 'menu' && (
          <div className="grid lg:grid-cols-4 gap-6">
            {/* Category sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl p-3 shadow-sm sticky top-20">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 mb-2">Categories</h3>
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${selectedCategory === 'all' ? 'bg-orange-50 text-kh-orange' : 'text-gray-600 hover:bg-gray-50'}`}
                >
                  All Items ({items.length})
                </button>
                {menuCategories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${selectedCategory === cat ? 'bg-orange-50 text-kh-orange' : 'text-gray-600 hover:bg-gray-50'}`}
                  >
                    {cat} ({items.filter(i => i.category === cat).length})
                  </button>
                ))}
              </div>
            </div>

            {/* Menu items */}
            <div className="lg:col-span-3 space-y-3">
              {filteredItems.map(item => {
                const qty = cartItemQuantity(item.id);
                return (
                  <div
                    key={item.id}
                    className={`bg-white rounded-xl p-4 shadow-sm border border-gray-50 flex gap-4 ${!item.isAvailable ? 'opacity-50' : ''}`}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-bold text-gray-800">
                          {state.language === 'en' ? item.name : item.nameUrdu}
                        </h3>
                        {item.popular && (
                          <span className="inline-flex items-center gap-0.5 text-xs bg-orange-50 text-kh-orange px-1.5 py-0.5 rounded-full font-medium">
                            <Award size={10} /> {t('popular_item')}
                          </span>
                        )}
                        {item.isVegetarian && (
                          <span className="inline-flex items-center gap-0.5 text-xs bg-green-50 text-kh-green px-1.5 py-0.5 rounded-full font-medium">
                            <Leaf size={10} /> {t('vegetarian')}
                          </span>
                        )}
                        {item.isSpicy && (
                          <span className="inline-flex items-center gap-0.5 text-xs bg-red-50 text-red-600 px-1.5 py-0.5 rounded-full font-medium">
                            <Flame size={10} /> {t('spicy')}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                        {state.language === 'en' ? item.description : item.descriptionUrdu}
                      </p>
                      <div className="flex items-center justify-between mt-3">
                        <span className="text-lg font-bold text-kh-orange">PKR {item.price}</span>
                        {!item.isAvailable && (
                          <span className="text-xs text-red-500 font-medium">{t('unavailable')}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-24 h-24 rounded-xl object-cover"
                        loading="lazy"
                      />
                      {item.isAvailable && (
                        qty > 0 ? (
                          <div className="flex items-center gap-1 bg-kh-orange rounded-full">
                            <button
                              onClick={() => dispatch({ type: 'UPDATE_QUANTITY', payload: { index: state.cart.findIndex(ci => ci.menuItem.id === item.id), quantity: qty - 1 } })}
                              className="w-8 h-8 flex items-center justify-center text-white"
                            >
                              <Minus size={14} />
                            </button>
                            <span className="text-white font-bold text-sm w-5 text-center">{qty}</span>
                            <button
                              onClick={() => dispatch({ type: 'UPDATE_QUANTITY', payload: { index: state.cart.findIndex(ci => ci.menuItem.id === item.id), quantity: qty + 1 } })}
                              className="w-8 h-8 flex items-center justify-center text-white"
                            >
                              <Plus size={14} />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleAddToCart(item)}
                            className="flex items-center gap-1 bg-white border-2 border-kh-orange text-kh-orange px-3 py-1.5 rounded-full text-xs font-bold hover:bg-kh-orange hover:text-white transition-colors"
                          >
                            <Plus size={14} />
                            {t('addToCart')}
                          </button>
                        )
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === 'about' && (
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              {state.language === 'en' ? restaurant.name : restaurant.nameUrdu}
            </h2>
            <p className="text-gray-600 leading-relaxed">
              {state.language === 'en' ? restaurant.description : restaurant.descriptionUrdu}
            </p>
            <div className="mt-6 grid sm:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <MapPin size={18} className="text-kh-orange mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-800">Address</p>
                  <p className="text-sm text-gray-500">{restaurant.address}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Clock size={18} className="text-kh-orange mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-800">Opening Hours</p>
                  {restaurant.openingHours.map((h, i) => (
                    <p key={i} className="text-sm text-gray-500">{h.day}: {h.open} - {h.close}</p>
                  ))}
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Truck size={18} className="text-kh-orange mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-800">Delivery Info</p>
                  <p className="text-sm text-gray-500">{restaurant.deliveryTime} • PKR {restaurant.deliveryFee}</p>
                  <p className="text-sm text-gray-500">{t('minOrder')}: PKR {restaurant.minOrder}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Star size={18} className="text-kh-orange mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-800">Rating</p>
                  <p className="text-sm text-gray-500">{restaurant.rating}/5 ({restaurant.reviewCount.toLocaleString()} reviews)</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'reviews' && (
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-4 mb-6">
              <div className="text-center">
                <p className="text-4xl font-extrabold text-gray-800">{restaurant.rating}</p>
                <div className="flex items-center gap-0.5 mt-1">
                  {[1, 2, 3, 4, 5].map(s => (
                    <Star key={s} size={16} className={s <= Math.round(restaurant.rating) ? 'text-yellow-500 fill-yellow-500' : 'text-gray-200'} />
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-1">{restaurant.reviewCount.toLocaleString()} reviews</p>
              </div>
            </div>
            {/* Sample reviews */}
            <div className="space-y-4">
              {[
                { name: 'Ahmed K.', rating: 5, text: 'Amazing food! The chargha was perfectly crispy and flavorful. Delivery was quick too.', time: '2 days ago' },
                { name: 'Sara M.', rating: 4, text: 'Really good food. Portion sizes are generous. Would order again!', time: '1 week ago' },
                { name: 'Usman R.', rating: 5, text: 'Best biryani in town. Authentic taste and great packaging.', time: '2 weeks ago' },
              ].map((review, i) => (
                <div key={i} className="border-b border-gray-50 pb-4 last:border-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-kh-cream-dark rounded-full flex items-center justify-center text-sm font-bold text-kh-orange">
                        {review.name[0]}
                      </div>
                      <span className="text-sm font-medium text-gray-800">{review.name}</span>
                    </div>
                    <span className="text-xs text-gray-400">{review.time}</span>
                  </div>
                  <div className="flex items-center gap-0.5 mt-2">
                    {[1, 2, 3, 4, 5].map(s => (
                      <Star key={s} size={12} className={s <= review.rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-200'} />
                    ))}
                  </div>
                  <p className="text-sm text-gray-600 mt-2">{review.text}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
