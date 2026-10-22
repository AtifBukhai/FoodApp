import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { apiClient } from '../services/api';
import { validateEmail } from '../utils/validation';

export default function ForgotPasswordPage() {
  const { state, t } = useApp();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!validateEmail(email)) {
      setError(state.language === 'en' ? 'Please enter a valid email address' : 'براہ کرم درست ای میل ایڈریس درج کریں');
      setLoading(false);
      return;
    }

    try {
      const response = await apiClient.forgotPassword(email);
      
      // Always show success message to prevent email enumeration
      // Even if the email doesn't exist, we show the same message
      if (response.success || response.error) {
        setSubmitted(true);
      }
    } catch (err) {
      // Still show success to prevent email enumeration
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-kh-cream flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle size={32} className="text-kh-green" />
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">
              {state.language === 'en' ? 'Check Your Email' : 'اپنا ای میل چیک کریں'}
            </h2>
            <p className="text-sm text-gray-600 mb-6">
              {state.language === 'en'
                ? 'If an account exists with that email, we\'ve sent password reset instructions. The link will expire in 1 hour.'
                : 'اگر اس ای میل کے ساتھ کوئی اکاؤنٹ موجود ہے تو ہم نے پاسورڈ ری سیٹ ہدایات بھیج دی ہیں۔ لنک 1 گھنٹے میں ختم ہو جائے گا۔'}
            </p>
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-100 mb-6">
              <p className="text-xs text-blue-700">
                ⚠️ {state.language === 'en'
                  ? 'Email delivery requires backend configuration. In demo mode, check the backend console for the reset token.'
                  : 'ای میل ڈیلیوری کے لیے بیک اینڈ کنفیگریشن ضروری ہے۔ ڈیمو موڈ میں ری سیٹ ٹوکن کے لیے بیک اینڈ کنسول چیک کریں۔'}
              </p>
            </div>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 text-kh-orange font-medium hover:underline"
            >
              <ArrowLeft size={16} />
              {state.language === 'en' ? 'Back to Login' : 'لاگ ان پر واپس'}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-kh-cream flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2">
            <div className="w-12 h-12 bg-orange-gradient rounded-xl flex items-center justify-center">
              <span className="text-white text-2xl font-bold">K</span>
            </div>
            <div className="text-left">
              <h1 className="text-2xl font-bold text-kh-green-dark">KhaanaDa</h1>
              <p className="text-xs text-kh-gray">{t('tagline')}</p>
            </div>
          </Link>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
          <h2 className="text-xl font-bold text-gray-800 mb-1">
            {state.language === 'en' ? 'Forgot Password?' : 'پاسورڈ بھول گئے؟'}
          </h2>
          <p className="text-sm text-gray-500 mb-6">
            {state.language === 'en'
              ? 'Enter your email and we\'ll send you reset instructions.'
              : 'اپنا ای میل درج کریں اور ہم آپ کو ری سیٹ ہدایات بھیجیں گے۔'}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">{t('email')}</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:border-kh-orange focus:ring-2 focus:ring-orange-100 outline-none transition-all"
                  placeholder={state.language === 'en' ? 'you@example.com' : 'آپ@مثال.com'}
                  required
                />
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-kh-orange text-white py-3 rounded-xl font-semibold hover:bg-kh-orange-dark transition-colors shadow-lg shadow-orange-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading
                ? (state.language === 'en' ? 'Sending...' : 'بھیجا جا رہا ہے...')
                : (state.language === 'en' ? 'Send Reset Instructions' : 'ری سیٹ ہدایات بھیجیں')}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 text-sm text-kh-orange font-medium hover:underline"
            >
              <ArrowLeft size={16} />
              {state.language === 'en' ? 'Back to Login' : 'لاگ ان پر واپس'}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
