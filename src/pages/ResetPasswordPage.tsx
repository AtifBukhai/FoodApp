import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Lock, Eye, EyeOff, CheckCircle, XCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { apiClient } from '../services/api';
import { validatePasswordStrength } from '../utils/validation';

export default function ResetPasswordPage() {
  const { state, t } = useApp();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const passwordStrength = validatePasswordStrength(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!token) {
      setError(state.language === 'en' ? 'Invalid reset link' : 'غلط ری سیٹ لنک');
      setLoading(false);
      return;
    }

    if (!passwordStrength.isValid) {
      setError(state.language === 'en' ? 'Password does not meet strength requirements' : 'پاسورڈ مضبوطی کی ضروریات کو پورا نہیں کرتا');
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError(state.language === 'en' ? 'Passwords do not match' : 'پاسورڈز مماثل نہیں ہیں');
      setLoading(false);
      return;
    }

    try {
      const response = await apiClient.resetPassword(token, password);
      
      if (response.success) {
        setSuccess(true);
        setTimeout(() => navigate('/login'), 3000);
      } else {
        setError(response.error || (state.language === 'en' ? 'Failed to reset password' : 'پاسورڈ ری سیٹ کرنے میں ناکامی'));
      }
    } catch (err) {
      setError(state.language === 'en' ? 'Network error. Please try again.' : 'نیٹ ورک کی خرابی۔ دوبارہ کوشش کریں۔');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-kh-cream flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle size={32} className="text-kh-green" />
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">
              {state.language === 'en' ? 'Password Reset Successfully!' : 'پاسورڈ کامیابی سے ری سیٹ ہو گیا!'}
            </h2>
            <p className="text-sm text-gray-600 mb-6">
              {state.language === 'en'
                ? 'Your password has been reset. Redirecting to login...'
                : 'آپ کا پاسورڈ ری سیٹ ہو گیا ہے۔ لاگ ان پر ری ڈائریکٹ ہو رہا ہے...'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="min-h-screen bg-kh-cream flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <XCircle size={32} className="text-red-500" />
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">
              {state.language === 'en' ? 'Invalid Reset Link' : 'غلط ری سیٹ لنک'}
            </h2>
            <p className="text-sm text-gray-600 mb-6">
              {state.language === 'en'
                ? 'This password reset link is invalid or has expired. Please request a new one.'
                : 'یہ پاسورڈ ری سیٹ لنک غلط ہے یا ختم ہو گیا ہے۔ براہ کرم نیا درخواست کریں۔'}
            </p>
            <Link
              to="/forgot-password"
              className="inline-flex items-center gap-2 bg-kh-orange text-white px-6 py-2.5 rounded-xl font-medium hover:bg-kh-orange-dark transition-colors"
            >
              {state.language === 'en' ? 'Request New Link' : 'نیا لنک درخواست کریں'}
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
            {state.language === 'en' ? 'Reset Password' : 'پاسورڈ ری سیٹ کریں'}
          </h2>
          <p className="text-sm text-gray-500 mb-6">
            {state.language === 'en'
              ? 'Enter your new password below.'
              : 'نیچے اپنا نیا پاسورڈ درج کریں۔'}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                {state.language === 'en' ? 'New Password' : 'نیا پاسورڈ'}
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-gray-200 focus:border-kh-orange focus:ring-2 focus:ring-orange-100 outline-none transition-all"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              {/* Password Strength Indicator */}
              {password && (
                <div className="mt-2">
                  <div className="flex gap-1 mb-1">
                    {[0, 1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded-full transition-colors ${
                          i <= passwordStrength.score
                            ? passwordStrength.score === 0
                              ? 'bg-red-400'
                              : passwordStrength.score === 1
                              ? 'bg-yellow-400'
                              : passwordStrength.score === 2
                              ? 'bg-blue-400'
                              : 'bg-green-500'
                            : 'bg-gray-200'
                        }`}
                      />
                    ))}
                  </div>
                  <p className={`text-xs ${
                    passwordStrength.score === 0 ? 'text-red-600' :
                    passwordStrength.score === 1 ? 'text-yellow-600' :
                    passwordStrength.score === 2 ? 'text-blue-600' :
                    'text-green-600'
                  }`}>
                    {state.language === 'en' ? passwordStrength.label : passwordStrength.labelUrdu}
                  </p>
                </div>
              )}
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                {state.language === 'en' ? 'Confirm New Password' : 'نیا پاسورڈ کی تصدیق'}
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-gray-200 focus:border-kh-orange focus:ring-2 focus:ring-orange-100 outline-none transition-all"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {confirmPassword && password !== confirmPassword && (
                <p className="text-xs text-red-500 mt-1">
                  {state.language === 'en' ? 'Passwords do not match' : 'پاسورڈز مماثل نہیں ہیں'}
                </p>
              )}
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
                ? (state.language === 'en' ? 'Resetting...' : 'ری سیٹ ہو رہا ہے...')
                : (state.language === 'en' ? 'Reset Password' : 'پاسورڈ ری سیٹ کریں')}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link
              to="/login"
              className="text-sm text-kh-orange font-medium hover:underline"
            >
              {state.language === 'en' ? 'Back to Login' : 'لاگ ان پر واپس'}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
