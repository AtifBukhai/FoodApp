import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Store, Edit, Trash2, Eye } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface Restaurant {
  id: string;
  name: string;
  nameUrdu?: string;
  address: string;
  city: string;
  cuisine: string[];
  isOpen: boolean;
  isApproved: boolean;
}

export default function PartnerRestaurantsPage() {
  const { state } = useApp();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock data - in real implementation, fetch from API
    setRestaurants([
      {
        id: 'rest-1',
        name: 'Lahori Chargha',
        nameUrdu: 'لاہوری چرغہ',
        address: 'MM Alam Road, Gulberg III',
        city: 'Lahore',
        cuisine: ['Pakistani', 'BBQ'],
        isOpen: true,
        isApproved: true,
      },
      {
        id: 'rest-2',
        name: 'Biryani House',
        nameUrdu: 'بریانی ہاؤس',
        address: 'Block D, North Nazimabad',
        city: 'Karachi',
        cuisine: ['Biryani', 'Pakistani'],
        isOpen: false,
        isApproved: true,
      },
    ]);
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-kh-cream flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-kh-orange mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading restaurants...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-kh-cream">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              {state.language === 'en' ? 'My Restaurants' : 'میرے ریسٹورنٹس'}
            </h1>
            <p className="text-gray-600 mt-1">
              {state.language === 'en'
                ? 'Manage your restaurant listings'
                : 'اپنی ریسٹورنٹ فہرستوں کا انتظام کریں'}
            </p>
          </div>
          <Link
            to="/partner/restaurants/new"
            className="flex items-center gap-2 bg-kh-orange text-white px-6 py-3 rounded-xl font-semibold hover:bg-kh-orange-dark transition-colors shadow-lg shadow-orange-200"
          >
            <Plus size={20} />
            {state.language === 'en' ? 'Add Restaurant' : 'ریسٹورنٹ شامل کریں'}
          </Link>
        </div>

        {/* Restaurants List */}
        {restaurants.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center border border-gray-100">
            <Store size={48} className="text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              {state.language === 'en' ? 'No restaurants yet' : 'ابھی تک کوئی ریسٹورنٹ نہیں'}
            </h3>
            <p className="text-gray-500 mb-6">
              {state.language === 'en'
                ? 'Add your first restaurant to start receiving orders'
                : 'آرڈرز وصول کرنا شروع کرنے کے لیے اپنا پہلا ریسٹورنٹ شامل کریں'}
            </p>
            <Link
              to="/partner/restaurants/new"
              className="inline-flex items-center gap-2 bg-kh-orange text-white px-6 py-3 rounded-xl font-semibold hover:bg-kh-orange-dark transition-colors"
            >
              <Plus size={20} />
              {state.language === 'en' ? 'Add Restaurant' : 'ریسٹورنٹ شامل کریں'}
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {restaurants.map((restaurant) => (
              <div
                key={restaurant.id}
                className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-800 mb-1">
                        {state.language === 'en' ? restaurant.name : restaurant.nameUrdu || restaurant.name}
                      </h3>
                      <p className="text-sm text-gray-500">{restaurant.address}</p>
                      <p className="text-sm text-gray-500">{restaurant.city}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {restaurant.isOpen ? (
                        <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                          {state.language === 'en' ? 'Open' : 'کھلا'}
                        </span>
                      ) : (
                        <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-full">
                          {state.language === 'en' ? 'Closed' : 'بند'}
                        </span>
                      )}
                      {!restaurant.isApproved && (
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-medium rounded-full">
                          {state.language === 'en' ? 'Pending' : 'زیر التواء'}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {restaurant.cuisine.map((c) => (
                      <span
                        key={c}
                        className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                      >
                        {c}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center gap-2">
                    <Link
                      to={`/partner/restaurants/${restaurant.id}`}
                      className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
                    >
                      <Eye size={16} />
                      {state.language === 'en' ? 'View' : 'دیکھیں'}
                    </Link>
                    <Link
                      to={`/partner/restaurants/${restaurant.id}/edit`}
                      className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-kh-orange text-white rounded-lg hover:bg-kh-orange-dark transition-colors text-sm font-medium"
                    >
                      <Edit size={16} />
                      {state.language === 'en' ? 'Edit' : 'ترمیم'}
                    </Link>
                    <button className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                      <Trash2 size={16} />
                    </button>
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
