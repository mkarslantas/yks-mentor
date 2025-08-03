import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { EyeIcon, EyeOffIcon, StarIcon, ZapIcon, ShieldCheckIcon, AlertCircleIcon, CheckIcon } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

// Validation helper component
const ValidationMessage = ({ error, success }) => {
  if (error) {
    return (
      <p className="mt-1 text-sm text-red-600 flex items-center gap-1 animate-slide-in-right">
        <AlertCircleIcon className="h-3 w-3" />
        {error}
      </p>
    );
  }
  if (success) {
    return (
      <p className="mt-1 text-sm text-green-600 flex items-center gap-1 animate-slide-in-right">
        <CheckIcon className="h-3 w-3" />
        {success}
      </p>
    );
  }
  return null;
};

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const { login, loading, error, clearError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, dirtyFields, touchedFields }
  } = useForm({
    mode: 'onChange' // Enable real-time validation
  });

  // Clear errors when component mounts
  useEffect(() => {
    clearError();
  }, [clearError]);

  // Show error toast
  useEffect(() => {
    if (error) {
      toast.error(error);
      clearError();
    }
  }, [error, clearError]);

  const onSubmit = async (data) => {
    try {
      console.log('🔐 Login attempt with:', { email: data.email });
      
      const result = await login(data);
      console.log('✅ Login successful:', result);
      
      // Get the redirect path from location state or default dashboard
      const redirectPath = result.user.role === 'student' ? '/dashboard' : '/coach/dashboard';
      const from = location.state?.from?.pathname || redirectPath;
      
      console.log('🏠 Redirecting to:', from);
      navigate(from, { replace: true });
      
      toast.success('Giriş başarılı!');
    } catch (err) {
      console.error('❌ Login error:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            YKS Mentor'a Hoş Geldiniz
          </h1>
          <p className="text-xl text-gray-600">
            Hedeflerinize ulaşmak için doğru adrestesiniz
          </p>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white rounded-lg p-6 shadow-md">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <StarIcon className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Kişiselleştirilmiş Plan</h3>
            <p className="text-gray-600">Size özel hazırlanan çalışma programları ile hedefinize odaklanın</p>
          </div>
          
          <div className="bg-white rounded-lg p-6 shadow-md">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <ZapIcon className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Anlık Takip</h3>
            <p className="text-gray-600">İlerlemenizi gerçek zamanlı olarak takip edin ve motivasyonunuzu koruyun</p>
          </div>
          
          <div className="bg-white rounded-lg p-6 shadow-md">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <ShieldCheckIcon className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Uzman Desteği</h3>
            <p className="text-gray-600">Deneyimli koçlarımızdan bire bir destek alın</p>
          </div>
        </div>

        {/* Login Form */}
        <div className="max-w-md mx-auto">
          <div className="bg-white rounded-lg shadow-xl p-8">
            <h2 className="text-2xl font-bold text-center mb-8">Giriş Yap</h2>
            
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  E-posta Adresi
                </label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                    errors.email && touchedFields.email ? 'border-red-300 bg-red-50' : 
                    touchedFields.email && !errors.email ? 'border-green-300 bg-green-50' : 
                    'border-gray-300'
                  }`}
                  placeholder="ornek@email.com"
                  {...register('email', {
                    required: 'E-posta adresi gerekli',
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: 'Geçerli bir e-posta adresi girin'
                    }
                  })}
                />
                <ValidationMessage 
                  error={touchedFields.email && errors.email?.message}
                  success={touchedFields.email && !errors.email && watch('email') && 'Geçerli e-posta adresi'}
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Şifre
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    className={`w-full px-3 py-2 pr-10 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                      errors.password && touchedFields.password ? 'border-red-300 bg-red-50' : 
                      touchedFields.password && !errors.password ? 'border-green-300 bg-green-50' : 
                      'border-gray-300'
                    }`}
                    placeholder="Şifrenizi girin"
                    {...register('password', {
                      required: 'Şifre gerekli',
                      minLength: {
                        value: 6,
                        message: 'Şifre en az 6 karakter olmalı'
                      }
                    })}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOffIcon className="h-4 w-4 text-gray-400" />
                    ) : (
                      <EyeIcon className="h-4 w-4 text-gray-400" />
                    )}
                  </button>
                </div>
                <ValidationMessage 
                  error={touchedFields.password && errors.password?.message}
                  success={touchedFields.password && !errors.password && watch('password') && 'Şifre formatı uygun'}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="text-sm">
                  <Link
                    to="/forgot-password"
                    className="font-medium text-blue-600 hover:text-blue-500"
                  >
                    Şifrenizi mi unuttunuz?
                  </Link>
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading || Object.keys(errors).length > 0}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;