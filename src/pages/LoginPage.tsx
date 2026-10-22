import { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Mail, Lock, User, Phone, Eye, EyeOff, CheckCircle, XCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { apiClient } from '../services/api';
import { validatePasswordStrength, validateEmail, validatePhone, validateName } from '../utils/validation';

export default function LoginPage() {
  const { state, dispatch, t } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const [isRegister, setIsRegister] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });

  // Get redirect destination from location state
  const from = (location.state as any)?.from?.pathname || '/';

  const passwordStrength = validatePasswordStrength(formData.password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Client-side validation
    if (isRegister) {
      if (!validateName(formData.name)) {
        setError(state.language === 'en' ? 'Name must be at least 2 characters' : 'نام کم از کم 2 حروف کا ہونا چاہیے');
        setLoading(false);
        return;
      }
      if (!validateEmail(formData.email)) {
        setError(state.language === 'en' ? 'Please enter a valid email address' : 'براہ کرم درست ای میل ایڈریس درج کریں');
        setLoading(false);
        return;
      }
      if (!validatePhone(formData.phone)) {
        setError(state.language === 'en' ? 'Please enter a valid Pakistani phone number' : 'براہ کرم درست پاکستانی فون نمبر درج کریں');
        setLoading(false);
        return;
      }
      if (!passwordStrength.isValid) {
        setError(state.language === 'en' ? 'Password does not meet strength requirements' : 'پاسورڈ مضبوطی کی ضروریات کو پورا نہیں کرتا');
        setLoading(false);
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        setError(state.language === 'en' ? 'Passwords do not match' : 'پاسورڈز مماثل نہیں ہیں');
        setLoading(false);
        return;
      }
    } else {
      if (!validateEmail(formData.email)) {
        setError(state.language === 'en' ? 'Please enter a valid email address' : 'براہ کرم درست ای میل ایڈریس درج کریں');
        setLoading(false);
        return;
      }
      if (!formData.password) {
        setError(state.language === 'en' ? 'Please enter your password' : 'براہ کرم اپنا پاسورڈ درج کریں');
        setLoading(false);
        return;
      }
    }

    try {
      let response;
      
      if (isRegister) {
        response = await apiClient.register({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
        });
      } else {
        response = await apiClient.login({
          email: formData.email,
          password: formData.password,
        });
      }

      if (response.success && response.data) {
        // Store token
        localStorage.setItem('khaanada_token', response.data.accessToken);
        
        // Set user in context
        dispatch({ type: 'SET_USER', payload: response.data.user });
        
        dispatch({
          type: 'SET_NOTIFICATION',
          payload: { 
            message: state.language === 'en' ? 'Welcome to KhaanaDa!' : 'خانا دا میں خوش آمدید!', 
            type: 'success' 
          },
        });

        // Redirect to intended page or home
        navigate(from, { replace: true });
      } else {
        setError(response.error || (state.language === 'en' ? 'Authentication failed' : 'تصدیق ناکام ہوگئی'));
      }
    } catch (err) {
      setError(state.language === 'en' ? 'Network error. Please try again.' : 'نیٹ ورک کی خرابی۔ دوبارہ کوشش کریں۔');
    } finally {
      setLoading(false);
    }
  };

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
            {isRegister ? t('signUp') : t('welcomeBack')}
          </h2>
          <p className="text-sm text-gray-500 mb-6">
            {isRegister
              ? (state.language === 'en' ? 'Create your KhaanaDa account' : 'اپنا خانا دا اکاؤنٹ بنائیں')
              : (state.language === 'en' ? 'Sign in to your account' : 'اپنے اکاؤنٹ میں سائن ان کریں')}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">{t('name')}</label>
                <div className="relative">
                  <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:border-kh-orange focus:ring-2 focus:ring-orange-100 outline-none transition-all"
                    placeholder={state.language === 'en' ? 'Ahmed Khan' : 'احمد خان'}
                  />
                </div>
              </div>
            )}

            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">{t('email')}</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:border-kh-orange focus:ring-2 focus:ring-orange-100 outline-none transition-all"
                  placeholder={state.language === 'en' ? 'you@example.com' : 'آپ@مثال.com'}
                  required
                />
              </div>
            </div>

            {isRegister && (
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">{t('phone')}</label>
                <div className="relative">
                  <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:border-kh-orange focus:ring-2 focus:ring-orange-100 outline-none transition-all"
                    placeholder="+92 300 1234567"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">{t('password')}</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
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
              
              {/* Password Strength Indicator - only show during registration */}
              {isRegister && formData.password && (
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
                  <div className="mt-2 space-y-1">
                    {[
                      { key: 'minLength', label: state.language === 'en' ? 'At least 8 characters' : 'کم از کم 8 حروف', pass: passwordStrength.checks.minLength },
                      { key: 'hasUppercase', label: state.language === 'en' ? 'One uppercase letter' : 'ایک بڑا حرف', pass: passwordStrength.checks.hasUppercase },
                      { key: 'hasLowercase', label: state.language === 'en' ? 'One lowercase letter' : 'ایک چھوٹا حرف', pass: passwordStrength.checks.hasLowercase },
                      { key: 'hasNumber', label: state.language === 'en' ? 'One number' : 'ایک نمبر', pass: passwordStrength.checks.hasNumber },
                      { key: 'hasSpecial', label: state.language === 'en' ? 'One special character' : 'ایک خاص علامت', pass: passwordStrength.checks.hasSpecial },
                    ].map((check) => (
                      <div key={check.key} className="flex items-center gap-1.5 text-xs">
                        {check.pass ? (
                          <CheckCircle size={12} className="text-green-500" />
                        ) : (
                          <XCircle size={12} className="text-gray-300" />
                        )}
                        <span className={check.pass ? 'text-green-700' : 'text-gray-500'}>{check.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password - only during registration */}
            {isRegister && (
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  {state.language === 'en' ? 'Confirm Password' : 'پاسورڈ کی تصدیق'}
                </label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
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
                {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                  <p className="text-xs text-red-500 mt-1">
                    {state.language === 'en' ? 'Passwords do not match' : 'پاسورڈز مماثل نہیں ہیں'}
                  </p>
                )}
              </div>
            )}

            {!isRegister && (
              <div className="flex justify-end">
                <Link to="/forgot-password" className="text-sm text-kh-orange hover:underline">
                  {t('forgotPassword')}
                </Link>
              </div>
            )}

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
              {loading ? (state.language === 'en' ? 'Please wait...' : 'براہ کرم انتظار کریں...') : (isRegister ? t('signUp') : t('signIn'))}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              {isRegister ? t('alreadyHaveAccount') : t('dontHaveAccount')}{' '}
              <button
                onClick={() => setIsRegister(!isRegister)}
                className="text-kh-orange font-medium hover:underline"
              >
                {isRegister ? t('signIn') : t('signUp')}
              </button>
            </p>
          </div>

          {/* Dev notice */}
          <div className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-100">
            <p className="text-xs text-yellow-700">
              ⚠️ {state.language === 'en'
                ? 'Development demo — Authentication is simulated. In production, this connects to the secure backend API with proper credential handling.'
                : 'ڈیولپمنٹ ڈیمو — تصدیق نقلی ہے۔ پروڈکشن میں یہ محفوظ بیک اینڈ API سے جڑتا ہے۔'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
