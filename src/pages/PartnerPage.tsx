import { Link } from 'react-router-dom';
import { ArrowLeft, Store, Utensils, Clock, DollarSign, Users, BarChart3, Shield, Headphones, MapPin } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function PartnerPage() {
  const { state } = useApp();

  const benefits = [
    { icon: <Store size={24} />, title: state.language === 'en' ? 'Grow Your Business' : 'اپنا کاروبار بڑھائیں', desc: state.language === 'en' ? 'Reach thousands of new customers in your area' : 'اپنے علاقے میں ہزاروں نئے گاہکوں تک پہنچیں' },
    { icon: <BarChart3 size={24} />, title: state.language === 'en' ? 'Analytics Dashboard' : 'تجزیاتی ڈیش بورڈ', desc: state.language === 'en' ? 'Track sales, orders, and customer insights in real-time' : 'ریئل ٹائم میں فروخت، آرڈرز اور گاہکوں کی بصیرت کو ٹریک کریں' },
    { icon: <DollarSign size={24} />, title: state.language === 'en' ? 'Fast Settlements' : 'تیز تصفیہ', desc: state.language === 'en' ? 'Weekly settlements directly to your bank account' : 'ہفتہ وار تصفیہ براہ راست آپ کے بینک اکاؤنٹ میں' },
    { icon: <Headphones size={24} />, title: state.language === 'en' ? 'Dedicated Support' : 'مخصوص سپورٹ', desc: state.language === 'en' ? '24/7 partner support team ready to help' : '24/7 پارٹنر سپورٹ ٹیم مدد کے لیے تیار' },
    { icon: <Shield size={24} />, title: state.language === 'en' ? 'Secure Platform' : 'محفوظ پلیٹ فارم', desc: state.language === 'en' ? 'Enterprise-grade security for your business data' : 'آپ کے کاروباری ڈیٹا کے لیے انٹرپرائز گریڈ سیکیورٹی' },
    { icon: <MapPin size={24} />, title: state.language === 'en' ? 'Delivery Managed' : 'ڈیلیوری منظم', desc: state.language === 'en' ? 'We handle delivery so you focus on cooking' : 'ہم ڈیلیوری سنبھالتے ہیں تاکہ آپ پکانے پر توجہ دیں' },
  ];

  const steps = [
    { num: '01', title: state.language === 'en' ? 'Apply Online' : 'آن لائن درخواست دیں', desc: state.language === 'en' ? 'Fill out the partner registration form with your restaurant details' : 'اپنے ریسٹورنٹ کی تفصیلات کے ساتھ پارٹنر رجسٹریشن فارم پُر کریں' },
    { num: '02', title: state.language === 'en' ? 'Document Verification' : 'دستاویز کی تصدیق', desc: state.language === 'en' ? 'Submit required documents for business verification' : 'کاروباری تصدیق کے لیے مطلوبہ دستاویزات جمع کروائیں' },
    { num: '03', title: state.language === 'en' ? 'Menu Setup' : 'مینو سیٹ اپ', desc: state.language === 'en' ? 'Add your menu items, prices, and photos through the partner portal' : 'پارٹنر پورٹل کے ذریعے اپنے مینو آئٹمز، قیمتیں اور تصاویر شامل کریں' },
    { num: '04', title: state.language === 'en' ? 'Go Live!' : 'لائیو ہو جائیں!', desc: state.language === 'en' ? 'Start receiving orders from KhaanaDa customers' : 'خانا دا گاہکوں سے آرڈرز وصول کرنا شروع کریں' },
  ];

  return (
    <div className="min-h-screen bg-kh-cream">
      {/* Hero */}
      <div className="bg-green-gradient text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link to="/" className="inline-flex items-center gap-1 text-green-200 hover:text-white mb-6 transition-colors">
            <ArrowLeft size={16} />
            {state.language === 'en' ? 'Back to home' : 'ہوم پر واپس'}
          </Link>
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-5xl font-extrabold mb-4">
              {state.language === 'en' ? 'Partner with KhaanaDa' : 'خانا دا کے ساتھ شراکت کریں'}
            </h1>
            <p className="text-lg text-green-100 mb-8">
              {state.language === 'en'
                ? 'Join Pakistan\'s fastest-growing food delivery platform. Reach more customers, increase your revenue, and let us handle delivery.'
                : 'پاکستان کے تیزی سے بڑھتے ہوئے فوڈ ڈیلیوری پلیٹ فارم میں شامل ہوں۔'}
            </p>
            <div className="flex flex-wrap gap-3">
              <button className="bg-white text-kh-green-dark px-6 py-3 rounded-full font-bold hover:bg-green-50 transition-colors shadow-lg">
                {state.language === 'en' ? 'Register as Restaurant' : 'ریسٹورنٹ کے طور پر رجسٹر کریں'}
              </button>
              <button className="bg-green-800 text-white px-6 py-3 rounded-full font-bold hover:bg-green-900 transition-colors border border-green-600">
                {state.language === 'en' ? 'Register as Rider' : 'رائیڈر کے طور پر رجسٹر کریں'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Benefits */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-2xl font-bold text-gray-800 text-center mb-10">
          {state.language === 'en' ? 'Why Partner with Us?' : 'ہمارے ساتھ شراکت کیوں؟'}
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {benefits.map((b, i) => (
            <div key={i} className="bg-white rounded-xl p-6 shadow-sm border border-gray-50 card-hover">
              <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center text-kh-orange mb-4">
                {b.icon}
              </div>
              <h3 className="font-bold text-gray-800 mb-2">{b.title}</h3>
              <p className="text-sm text-gray-500">{b.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* How it works */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-800 text-center mb-10">
            {state.language === 'en' ? 'How It Works' : 'یہ کیسے کام کرتا ہے'}
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((step, i) => (
              <div key={i} className="text-center">
                <div className="w-16 h-16 bg-orange-gradient rounded-2xl flex items-center justify-center text-white text-xl font-extrabold mx-auto mb-4 shadow-lg shadow-orange-200">
                  {step.num}
                </div>
                <h3 className="font-bold text-gray-800 mb-2">{step.title}</h3>
                <p className="text-sm text-gray-500">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-orange-gradient rounded-3xl p-8 md:p-12 text-white text-center">
          <h2 className="text-2xl font-bold mb-8">
            {state.language === 'en' ? 'KhaanaDa by the Numbers' : 'خانا دا اعداد و شمار میں'}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { value: '500+', label: state.language === 'en' ? 'Restaurants' : 'ریسٹورنٹس' },
              { value: '50K+', label: state.language === 'en' ? 'Orders/Month' : 'آرڈرز/ماہ' },
              { value: '1000+', label: state.language === 'en' ? 'Riders' : 'رائیڈرز' },
              { value: '15+', label: state.language === 'en' ? 'Cities' : 'شہر' },
            ].map((stat, i) => (
              <div key={i}>
                <p className="text-3xl md:text-4xl font-extrabold">{stat.value}</p>
                <p className="text-sm text-orange-100 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="bg-white rounded-2xl p-8 text-center shadow-sm border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-800 mb-3">
            {state.language === 'en' ? 'Ready to Get Started?' : 'شروع کرنے کے لیے تیار ہیں؟'}
          </h2>
          <p className="text-gray-500 mb-6 max-w-lg mx-auto">
            {state.language === 'en'
              ? 'Join hundreds of restaurant partners already growing their business with KhaanaDa.'
              : 'خانا دا کے ساتھ اپنا کاروبار بڑھانے والے سینکڑوں ریسٹورنٹ پارٹنرز میں شامل ہوں۔'}
          </p>
          <button className="bg-kh-orange text-white px-8 py-3 rounded-full font-bold text-lg hover:bg-kh-orange-dark transition-colors shadow-lg shadow-orange-200">
            {state.language === 'en' ? 'Apply Now — It\'s Free' : 'ابھی درخواست دیں — مفت ہے'}
          </button>
          <p className="text-xs text-gray-400 mt-3">
            ⚠️ {state.language === 'en' ? 'Partner registration is currently in development' : 'پارٹنر رجسٹریشن فی الحال ڈیولپمنٹ میں ہے'}
          </p>
        </div>
      </div>
    </div>
  );
}
