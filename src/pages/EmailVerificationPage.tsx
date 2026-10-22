import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Mail, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { apiClient } from '../services/api';

export default function EmailVerificationPage() {
  const { state, t } = useApp();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';

  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'invalid'>('loading');
  const [message, setMessage] = useState('');
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);

  useEffect(() => {
    if (token) {
      verifyEmailToken();
    } else {
      setStatus('invalid');
      setMessage(state.language === 'en' ? 'No verification token provided' : 'کوئی تصدیقی ٹوکن فراہم نہیں کیا گیا');
    }
  }, [token]);

  const verifyEmailToken = async () => {
    try {
      const response = await apiClient.verifyEmail(token);
      
      if (response.success) {
        setStatus('success');
        setMessage(response.data?.message || (state.language === 'en' ? 'Email verified successfully!' : 'ای میل کامیابی سے تصدیق ہو گئی!'));
      } else {
        setStatus('error');
        setMessage(response.error || (state.language === 'en' ? 'Verification failed' : 'تصدیق ناکام ہوگئی'));
      }
    } catch (err) {
      setStatus('error');
      setMessage(state.language === 'en' ? 'Network error. Please try again.' : 'نیٹ ورک کی خرابی۔ دوبارہ کوشش کریں۔');
    }
  };

  const handleResendVerification = async () => {
    setResending(true);
    try {
      const response = await apiClient.resendVerification();
      
      if (response.success) {
        setResent(true);
      }
    } catch (err) {
      // Still show success to prevent email enumeration
      setResent(true);
    } finally {
      setResending(false);
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-kh-cream flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 text-center">
            <RefreshCw size={32} className="text-kh-orange animate-spin mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-800 mb-2">
              {state.language === 'en' ? 'Verifying Email...' : 'ای میل کی تصدیق ہو رہی ہے...'}
            </h2>
          </div>
        </div>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="min-h-screen bg-kh-cream flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle size={32} className="text-kh-green" />
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">
              {state.language === 'en' ? 'Email Verified!' : 'ای میل تصدیق شدہ!'}
            </h2>
            <p className="text-sm text-gray-600 mb-6">{message}</p>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 bg-kh-orange text-white px-6 py-2.5 rounded-xl font-medium hover:bg-kh-orange-dark transition-colors"
            >
              {state.language === 'en' ? 'Continue to Login' : 'لاگ ان جاری رکھیں'}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (status === 'invalid' || status === 'error') {
    return (
      <div className="min-h-screen bg-kh-cream flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <XCircle size={32} className="text-red-500" />
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">
              {state.language === 'en' ? 'Verification Failed' : 'تصدیق ناکام ہوگئی'}
            </h2>
            <p className="text-sm text-gray-600 mb-6">{message}</p>
            
            {!resent ? (
              <button
                onClick={handleResendVerification}
                disabled={resending}
                className="inline-flex items-center gap-2 bg-kh-orange text-white px-6 py-2.5 rounded-xl font-medium hover:bg-kh-orange-dark transition-colors disabled:opacity-50"
              >
                {resending ? (
                  <RefreshCw size={16} className="animate-spin" />
                ) : (
                  <Mail size={16} />
                )}
                {resending
                  ? (state.language === 'en' ? 'Sending...' : 'بھیجا جا رہا ہے...')
                  : (state.language === 'en' ? 'Resend Verification Email' : 'تصدیقی ای میل دوبارہ بھیجیں')}
              </button>
            ) : (
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                <p className="text-xs text-blue-700">
                  {state.language === 'en'
                    ? 'If your email is registered, a new verification link has been sent.'
                    : 'اگر آپ کا ای میل رجسٹرڈ ہے تو نیا تصدیقی لنک بھیج دیا گیا ہے۔'}
                </p>
              </div>
            )}

            <div className="mt-6">
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

  return null;
}
