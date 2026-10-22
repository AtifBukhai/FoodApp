import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { User, Truck, CheckCircle } from 'lucide-react';

export default function RiderProfilePage() {
  const { state } = useApp();
  const [profile, setProfile] = useState({
    name: 'Ali Hassan',
    email: 'ali.rider@khaanada.pk',
    phone: '+92 300 1234567',
    vehicleType: 'Motorcycle',
    vehicleNumber: 'LEB-1234',
    isApproved: true,
    totalDeliveries: 23,
    rating: 4.8,
  });

  return (
    <div className="min-h-screen bg-kh-cream">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">
          {state.language === 'en' ? 'Profile' : 'پروفائل'}
        </h1>

        {/* Profile Card */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 mb-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-kh-orange rounded-full flex items-center justify-center text-white text-2xl font-bold">
              {profile.name[0]}
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">{profile.name}</h2>
              <p className="text-gray-600">{profile.email}</p>
              {profile.isApproved && (
                <span className="inline-flex items-center gap-1 text-sm text-kh-green mt-1">
                  <CheckCircle size={14} />
                  {state.language === 'en' ? 'Approved' : 'منظور شدہ'}
                </span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-600">{state.language === 'en' ? 'Phone' : 'فون'}</label>
              <p className="font-medium text-gray-800">{profile.phone}</p>
            </div>
            <div>
              <label className="text-sm text-gray-600">{state.language === 'en' ? 'Vehicle' : 'گاڑی'}</label>
              <p className="font-medium text-gray-800">{profile.vehicleType}</p>
            </div>
            <div>
              <label className="text-sm text-gray-600">{state.language === 'en' ? 'Vehicle Number' : 'گاڑی نمبر'}</label>
              <p className="font-medium text-gray-800">{profile.vehicleNumber}</p>
            </div>
            <div>
              <label className="text-sm text-gray-600">{state.language === 'en' ? 'Total Deliveries' : 'کل ڈیلیوریز'}</label>
              <p className="font-medium text-gray-800">{profile.totalDeliveries}</p>
            </div>
            <div>
              <label className="text-sm text-gray-600">{state.language === 'en' ? 'Rating' : 'ریٹنگ'}</label>
              <p className="font-medium text-gray-800">{profile.rating} ⭐</p>
            </div>
          </div>
        </div>

        {/* Note */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <p className="text-sm text-blue-800">
            <strong>{state.language === 'en' ? 'Note:' : 'نوٹ:'}</strong>{' '}
            {state.language === 'en'
              ? 'Profile editing will be available after database integration.'
              : 'ڈیٹابیس انٹیگریشن کے بعد پروفائل ایڈیٹنگ دستیاب ہوگی۔'}
          </p>
        </div>
      </div>
    </div>
  );
}
