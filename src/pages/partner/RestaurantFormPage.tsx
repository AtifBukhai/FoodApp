import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function PartnerRestaurantFormPage() {
  const { state } = useApp();
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);

  const [formData, setFormData] = useState({
    name: '',
    nameUrdu: '',
    description: '',
    descriptionUrdu: '',
    phone: '',
    address: '',
    city: '',
    area: '',
    cuisine: [] as string[],
    deliveryTime: '',
    deliveryFee: 0,
    minOrder: 0,
    imageUrl: '',
    openingHours: [
      { day: 'Monday', open: '10:00', close: '22:00' },
      { day: 'Tuesday', open: '10:00', close: '22:00' },
      { day: 'Wednesday', open: '10:00', close: '22:00' },
      { day: 'Thursday', open: '10:00', close: '22:00' },
      { day: 'Friday', open: '10:00', close: '23:00' },
      { day: 'Saturday', open: '10:00', close: '23:00' },
      { day: 'Sunday', open: '11:00', close: '22:00' },
    ],
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isEditing) {
      // Mock data - in real implementation, fetch from API
      setFormData({
        name: 'Lahori Chargha',
        nameUrdu: 'لاہوری چرغہ',
        description: 'Authentic Lahori chargha and traditional Pakistani BBQ',
        descriptionUrdu: 'اصل لاہوری چرغہ اور روایتی پاکستانی بی بی کیو',
        phone: '+923001234567',
        address: 'MM Alam Road, Gulberg III',
        city: 'Lahore',
        area: 'Gulberg',
        cuisine: ['Pakistani', 'BBQ'],
        deliveryTime: '25-35 min',
        deliveryFee: 8000,
        minOrder: 30000,
        imageUrl: '',
        openingHours: [
          { day: 'Monday', open: '10:00', close: '22:00' },
          { day: 'Tuesday', open: '10:00', close: '22:00' },
          { day: 'Wednesday', open: '10:00', close: '22:00' },
          { day: 'Thursday', open: '10:00', close: '22:00' },
          { day: 'Friday', open: '10:00', close: '23:00' },
          { day: 'Saturday', open: '10:00', close: '23:00' },
          { day: 'Sunday', open: '11:00', close: '22:00' },
        ],
      });
    }
  }, [isEditing]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = state.language === 'en' ? 'Name is required' : 'نام ضروری ہے';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = state.language === 'en' ? 'Phone is required' : 'فون ضروری ہے';
    }

    if (!formData.address.trim()) {
      newErrors.address = state.language === 'en' ? 'Address is required' : 'پتہ ضروری ہے';
    }

    if (!formData.city.trim()) {
      newErrors.city = state.language === 'en' ? 'City is required' : 'شہر ضروری ہے';
    }

    if (formData.cuisine.length === 0) {
      newErrors.cuisine = state.language === 'en' ? 'Select at least one cuisine' : 'کم از کم ایک کھانا منتخب کریں';
    }

    if (!formData.deliveryTime.trim()) {
      newErrors.deliveryTime = state.language === 'en' ? 'Delivery time is required' : 'ڈیلیوری کا وقت ضروری ہے';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // In real implementation, call API
      // await apiClient.createRestaurant(formData) or updateRestaurant(id, formData)
      
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      navigate('/partner/restaurants');
    } catch (error) {
      console.error('Failed to save restaurant:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCuisineToggle = (cuisine: string) => {
    setFormData((prev) => ({
      ...prev,
      cuisine: prev.cuisine.includes(cuisine)
        ? prev.cuisine.filter((c) => c !== cuisine)
        : [...prev.cuisine, cuisine],
    }));
  };

  const availableCuisines = [
    'Pakistani',
    'Chinese',
    'Fast Food',
    'BBQ',
    'Biryani',
    'Pizza',
    'Burgers',
    'Continental',
    'Desi',
    'Sweet',
  ];

  return (
    <div className="min-h-screen bg-kh-cream">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/partner/restaurants')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-4"
          >
            <ArrowLeft size={20} />
            {state.language === 'en' ? 'Back to Restaurants' : 'ریسٹورنٹس پر واپس'}
          </button>
          <h1 className="text-3xl font-bold text-gray-800">
            {isEditing
              ? state.language === 'en'
                ? 'Edit Restaurant'
                : 'ریسٹورنٹ میں ترمیم کریں'
              : state.language === 'en'
              ? 'Add New Restaurant'
              : 'نیا ریسٹورنٹ شامل کریں'}
          </h1>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              {state.language === 'en' ? 'Basic Information' : 'بنیادی معلومات'}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {state.language === 'en' ? 'Restaurant Name (English)' : 'ریسٹورنٹ کا نام (انگریزی)'} *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-kh-orange focus:border-transparent"
                  placeholder="e.g., Lahori Chargha"
                />
                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {state.language === 'en' ? 'Restaurant Name (Urdu)' : 'ریسٹورنٹ کا نام (اردو)'}
                </label>
                <input
                  type="text"
                  value={formData.nameUrdu}
                  onChange={(e) => setFormData({ ...formData, nameUrdu: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-kh-orange focus:border-transparent"
                  dir="rtl"
                  placeholder="مثال: لاہوری چرغہ"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {state.language === 'en' ? 'Description (English)' : 'تفصیل (انگریزی)'}
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-kh-orange focus:border-transparent"
                  placeholder="Describe your restaurant..."
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {state.language === 'en' ? 'Description (Urdu)' : 'تفصیل (اردو)'}
                </label>
                <textarea
                  value={formData.descriptionUrdu}
                  onChange={(e) => setFormData({ ...formData, descriptionUrdu: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-kh-orange focus:border-transparent"
                  dir="rtl"
                  placeholder="اپنے ریسٹورنٹ کی وضاحت کریں..."
                />
              </div>
            </div>
          </div>

          {/* Contact & Location */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              {state.language === 'en' ? 'Contact & Location' : 'رابطہ اور مقام'}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {state.language === 'en' ? 'Phone Number' : 'فون نمبر'} *
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-kh-orange focus:border-transparent"
                  placeholder="+923001234567"
                />
                {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {state.language === 'en' ? 'City' : 'شہر'} *
                </label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-kh-orange focus:border-transparent"
                  placeholder="e.g., Lahore"
                />
                {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {state.language === 'en' ? 'Area' : 'علاقہ'}
                </label>
                <input
                  type="text"
                  value={formData.area}
                  onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-kh-orange focus:border-transparent"
                  placeholder="e.g., Gulberg"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {state.language === 'en' ? 'Full Address' : 'مکمل پتہ'} *
                </label>
                <textarea
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  rows={2}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-kh-orange focus:border-transparent"
                  placeholder="Street address, building, etc."
                />
                {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
              </div>
            </div>
          </div>

          {/* Cuisine & Delivery */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              {state.language === 'en' ? 'Cuisine & Delivery' : 'کھانا اور ڈیلیوری'}
            </h2>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {state.language === 'en' ? 'Cuisine Types' : 'کھانے کی اقسام'} *
              </label>
              <div className="flex flex-wrap gap-2">
                {availableCuisines.map((cuisine) => (
                  <button
                    key={cuisine}
                    type="button"
                    onClick={() => handleCuisineToggle(cuisine)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      formData.cuisine.includes(cuisine)
                        ? 'bg-kh-orange text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {cuisine}
                  </button>
                ))}
              </div>
              {errors.cuisine && <p className="text-red-500 text-sm mt-1">{errors.cuisine}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {state.language === 'en' ? 'Delivery Time' : 'ڈیلیوری کا وقت'} *
                </label>
                <input
                  type="text"
                  value={formData.deliveryTime}
                  onChange={(e) => setFormData({ ...formData, deliveryTime: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-kh-orange focus:border-transparent"
                  placeholder="e.g., 30-40 min"
                />
                {errors.deliveryTime && <p className="text-red-500 text-sm mt-1">{errors.deliveryTime}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {state.language === 'en' ? 'Delivery Fee (PKR)' : 'ڈیلیوری فیس (PKR)'}
                </label>
                <input
                  type="number"
                  value={formData.deliveryFee / 100}
                  onChange={(e) => setFormData({ ...formData, deliveryFee: Number(e.target.value) * 100 })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-kh-orange focus:border-transparent"
                  placeholder="0"
                  min="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {state.language === 'en' ? 'Minimum Order (PKR)' : 'کم از کم آرڈر (PKR)'}
                </label>
                <input
                  type="number"
                  value={formData.minOrder / 100}
                  onChange={(e) => setFormData({ ...formData, minOrder: Number(e.target.value) * 100 })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-kh-orange focus:border-transparent"
                  placeholder="0"
                  min="0"
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex items-center justify-end gap-4">
            <button
              type="button"
              onClick={() => navigate('/partner/restaurants')}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
            >
              {state.language === 'en' ? 'Cancel' : 'منسوخ'}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-6 py-3 bg-kh-orange text-white rounded-xl font-semibold hover:bg-kh-orange-dark transition-colors shadow-lg shadow-orange-200 disabled:opacity-50"
            >
              <Save size={20} />
              {loading
                ? state.language === 'en'
                  ? 'Saving...'
                  : 'محفوظ ہو رہا ہے...'
                : state.language === 'en'
                ? 'Save Restaurant'
                : 'ریسٹورنٹ محفوظ کریں'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
