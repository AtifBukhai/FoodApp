import { useState, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, Star, Clock, Truck, Filter, X } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { restaurants, categories } from '../data';

export default function RestaurantsPage() {
  const { t, state } = useApp();
  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCuisine, setSelectedCuisine] = useState(searchParams.get('cuisine') || '');
  const [sortBy, setSortBy] = useState('rating');
  const [showFilters, setShowFilters] = useState(false);

  const filteredRestaurants = useMemo(() => {
    let filtered = [...restaurants];

    // Search
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(r =>
        r.name.toLowerCase().includes(q) ||
        r.nameUrdu.includes(searchQuery) ||
        r.cuisine.some(c => c.toLowerCase().includes(q)) ||
        r.description.toLowerCase().includes(q)
      );
    }

    // Cuisine filter
    if (selectedCuisine) {
      filtered = filtered.filter(r =>
        r.cuisine.some(c => c.toLowerCase().replace(/\s+/g, '-') === selectedCuisine)
      );
    }

    // Sort
    switch (sortBy) {
      case 'rating':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case 'delivery':
        filtered.sort((a, b) => parseInt(a.deliveryTime) - parseInt(b.deliveryTime));
        break;
      case 'price':
        filtered.sort((a, b) => a.deliveryFee - b.deliveryFee);
        break;
    }

    return filtered;
  }, [searchQuery, selectedCuisine, sortBy]);

  return (
    <div className="min-h-screen bg-kh-cream">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800">{t('allRestaurants')}</h1>
          <p className="text-gray-500 mt-1">{filteredRestaurants.length} restaurants available</p>
        </div>

        {/* Search & Filters */}
        <div className="mb-6 space-y-4">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder={t('searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white rounded-xl border border-gray-200 focus:border-kh-orange focus:ring-2 focus:ring-orange-100 outline-none transition-all"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-3 rounded-xl border transition-colors ${showFilters ? 'bg-kh-orange text-white border-kh-orange' : 'bg-white text-gray-600 border-gray-200 hover:border-kh-orange'}`}
            >
              <Filter size={18} />
              <span className="hidden sm:inline text-sm font-medium">{t('filterBy')}</span>
            </button>
          </div>

          {/* Filter panel */}
          {showFilters && (
            <div className="bg-white rounded-xl p-4 border border-gray-100 animate-fade-in">
              <div className="flex flex-wrap gap-4">
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2 block">{t('cuisine')}</label>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setSelectedCuisine('')}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${!selectedCuisine ? 'bg-kh-orange text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                    >
                      {t('all')}
                    </button>
                    {categories.map(cat => (
                      <button
                        key={cat.id}
                        onClick={() => setSelectedCuisine(cat.slug)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${selectedCuisine === cat.slug ? 'bg-kh-orange text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                      >
                        {cat.icon} {state.language === 'en' ? cat.name : cat.nameUrdu}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2 block">{t('sortBy')}</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-3 py-2 rounded-lg border border-gray-200 text-sm bg-white focus:border-kh-orange outline-none"
                  >
                    <option value="rating">{t('ratingHigh')}</option>
                    <option value="delivery">{t('deliveryTime')}</option>
                    <option value="price">{t('priceLow')}</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Active filters */}
        {(selectedCuisine || searchQuery) && (
          <div className="flex items-center gap-2 mb-4 flex-wrap">
            {selectedCuisine && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-orange-50 text-kh-orange rounded-full text-sm">
                {categories.find(c => c.slug === selectedCuisine)?.name || selectedCuisine}
                <button onClick={() => setSelectedCuisine('')}><X size={14} /></button>
              </span>
            )}
            {searchQuery && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-orange-50 text-kh-orange rounded-full text-sm">
                "{searchQuery}"
                <button onClick={() => setSearchQuery('')}><X size={14} /></button>
              </span>
            )}
          </div>
        )}

        {/* Restaurant Grid */}
        {filteredRestaurants.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search size={32} className="text-gray-300" />
            </div>
            <h3 className="text-lg font-semibold text-gray-700">{t('noResults')}</h3>
            <p className="text-gray-500 text-sm mt-1">Try adjusting your filters or search terms</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filteredRestaurants.map(restaurant => (
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
                    loading="lazy"
                  />
                  {restaurant.isOpen ? (
                    <span className="absolute top-3 left-3 bg-kh-green-light text-white text-xs font-medium px-2.5 py-0.5 rounded-full">
                      {t('open')}
                    </span>
                  ) : (
                    <span className="absolute top-3 left-3 bg-red-500 text-white text-xs font-medium px-2.5 py-0.5 rounded-full">
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
                  <p className="text-xs text-gray-400 mt-1 line-clamp-1">
                    {state.language === 'en' ? restaurant.description : restaurant.descriptionUrdu}
                  </p>
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-50">
                    <span className="flex items-center gap-1 text-xs text-gray-600">
                      <Clock size={12} className="text-kh-orange" />
                      {restaurant.deliveryTime}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-gray-600">
                      <Truck size={12} className="text-kh-green" />
                      {restaurant.deliveryFee === 0 ? t('free') : `PKR ${restaurant.deliveryFee}`}
                    </span>
                    <span className="text-xs text-gray-500">
                      {t('minOrder')}: PKR {restaurant.minOrder}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
