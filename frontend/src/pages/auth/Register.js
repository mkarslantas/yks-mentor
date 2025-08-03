import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { EyeIcon, EyeOffIcon, UserIcon, Users, StarIcon, ZapIcon, ShieldCheckIcon, ArrowRightIcon, CheckCircleIcon, SparklesIcon } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

const Register = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { register: registerUser, loading, error, clearError } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm();

  const watchPassword = watch('password');
  const watchRole = watch('role');

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
      const { confirmPassword, ...registerData } = data;
      await registerUser(registerData);
      
      navigate('/dashboard');
      toast.success('Kayıt başarılı! Hoş geldiniz!');
    } catch (err) {
      // Error is handled by useEffect above
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      
      <div className="max-w-lg w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-blue-600 rounded-lg flex items-center justify-center border border-gray-200 mb-6">
            <span className="text-white font-bold text-xl">YM</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-3">
            YKS yolculuğunuza başlayın!
          </h1>
          <p className="text-base text-gray-600">
            Ücretsiz hesabınızı oluşturun ve başarıya ulaşın
          </p>
        </div>

        {/* Register Form */}
        <div className="bg-white rounded-lg border border-gray-200 p-8 shadow-sm">
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            {/* Role Selection */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">Hesap Türünüzü Seçin</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label className="relative">
                  <input
                    type="radio"
                    value="student"
                    className="sr-only"
                    {...register('role', { required: 'Hesap türü seçmelisiniz' })}
                  />
                  <div className={`p-4 border-2 rounded-lg cursor-pointer ${
                    watchRole === 'student' 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-300 hover:border-blue-300'
                  }`}>
                    <div className={`w-10 h-10 rounded-lg mx-auto mb-3 flex items-center justify-center ${
                      watchRole === 'student' ? 'bg-blue-100' : 'bg-gray-100'
                    }`}>
                      <UserIcon className={`h-5 w-5 ${
                        watchRole === 'student' ? 'text-blue-600' : 'text-gray-600'
                      }`} />
                    </div>
                    <div className="text-center">
                      <p className="font-semibold text-gray-900 mb-1">Öğrenci</p>
                      <p className="text-xs text-gray-600">YKS'ye hazırlanıyorum</p>
                    </div>
                    {watchRole === 'student' && (
                      <div className="absolute top-2 right-2">
                        <CheckCircleIcon className="h-4 w-4 text-blue-600" />
                      </div>
                    )}
                  </div>
                </label>

                <label className="relative">
                  <input
                    type="radio"
                    value="coach"
                    className="sr-only"
                    {...register('role', { required: 'Hesap türü seçmelisiniz' })}
                  />
                  <div className={`p-4 border-2 rounded-lg cursor-pointer ${
                    watchRole === 'coach' 
                      ? 'border-purple-500 bg-purple-50' 
                      : 'border-gray-300 hover:border-purple-300'
                  }`}>
                    <div className={`w-10 h-10 rounded-lg mx-auto mb-3 flex items-center justify-center ${
                      watchRole === 'coach' ? 'bg-purple-100' : 'bg-gray-100'
                    }`}>
                      <Users className={`h-5 w-5 ${
                        watchRole === 'coach' ? 'text-purple-600' : 'text-gray-600'
                      }`} />
                    </div>
                    <div className="text-center">
                      <p className="font-semibold text-gray-900 mb-1">Koç/Öğretmen</p>
                      <p className="text-xs text-gray-600">Öğrencileri yönlendiriyorum</p>
                    </div>
                    {watchRole === 'coach' && (
                      <div className="absolute top-2 right-2">
                        <CheckCircleIcon className="h-4 w-4 text-purple-600" />
                      </div>
                    )}
                  </div>
                </label>
              </div>
              {errors.role && (
                <p className="text-sm text-red-600">
                  {errors.role.message}
                </p>
              )}
            </div>

            {/* Name Field */}
            <div className="space-y-2">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Ad Soyad
              </label>
              <input
                id="name"
                type="text"
                autoComplete="name"
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.name ? 'border-red-300' : 'border-gray-300'}`}
                placeholder="Adınız ve soyadınız"
                {...register('name', {
                  required: 'Ad soyad gerekli',
                  minLength: {
                    value: 2,
                    message: 'Ad soyad en az 2 karakter olmalı'
                  }
                })}
              />
              {errors.name && (
                <p className="text-sm text-red-600">
                  {errors.name.message}
                </p>
              )}
            </div>

            {/* Email Field */}
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                E-posta Adresi
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.email ? 'border-red-300' : 'border-gray-300'}`}
                placeholder="ornek@email.com"
                {...register('email', {
                  required: 'E-posta adresi gerekli',
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: 'Geçerli bir e-posta adresi girin'
                  }
                })}
              />
              {errors.email && (
                <p className="text-sm text-red-600">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Phone Field */}
            <div className="space-y-2">
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                Telefon Numarası <span className="text-gray-500 font-normal">(Opsiyonel)</span>
              </label>
              <input
                id="phone"
                type="tel"
                autoComplete="tel"
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.phone ? 'border-red-300' : 'border-gray-300'}`}
                placeholder="05XX XXX XX XX"
                {...register('phone', {
                  pattern: {
                    value: /^(\+90|0)?[5][0-9]{9}$/,
                    message: 'Geçerli bir telefon numarası girin'
                  }
                })}
              />
              {errors.phone && (
                <p className="text-sm text-red-600">
                  {errors.phone.message}
                </p>
              )}
            </div>

            {/* Password Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Şifre
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    className={`w-full px-3 py-2 pr-10 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.password ? 'border-red-300' : 'border-gray-300'}`}
                    placeholder="Güçlü bir şifre oluşturun"
                    {...register('password', {
                      required: 'Şifre gerekli',
                      minLength: {
                        value: 8,
                        message: 'Şifre en az 8 karakter olmalı'
                      },
                      pattern: {
                        value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                        message: 'Şifre en az bir büyük harf, bir küçük harf ve bir rakam içermeli'
                      }
                    })}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOffIcon className="h-5 w-5 text-gray-400" />
                    ) : (
                      <EyeIcon className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-sm text-red-600">
                    {errors.password.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                  Şifre Tekrarı
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    className={`w-full px-3 py-2 pr-10 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.confirmPassword ? 'border-red-300' : 'border-gray-300'}`}
                    placeholder="Şifrenizi tekrar girin"
                    {...register('confirmPassword', {
                      required: 'Şifre tekrarı gerekli',
                      validate: value =>
                        value === watchPassword || 'Şifreler eşleşmiyor'
                    })}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOffIcon className="h-5 w-5 text-gray-400" />
                    ) : (
                      <EyeIcon className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-sm text-red-600">
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>
            </div>

            {/* Terms and Conditions */}
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="flex items-start gap-3">
                <input
                  id="terms"
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-1"
                  {...register('terms', {
                    required: 'Kullanım koşullarını kabul etmelisiniz'
                  })}
                />
                <label htmlFor="terms" className="block text-sm text-gray-700 cursor-pointer">
                  <Link to="/terms" className="text-blue-600 hover:text-blue-700 font-medium">
                    Kullanım koşullarını
                  </Link>{' '}
                  ve{' '}
                  <Link to="/privacy" className="text-blue-600 hover:text-blue-700 font-medium">
                    gizlilik politikasını
                  </Link>{' '}
                  okudum ve kabul ediyorum.
                  <span className="block text-xs text-gray-500 mt-1">
                    Hesabınızı oluşturmak için bu koşulları kabul etmeniz gerekmektedir.
                  </span>
                </label>
              </div>
              {errors.terms && (
                <p className="text-sm text-red-600 mt-2">
                  {errors.terms.message}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-md font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span>Hesap oluşturuluyor...</span>
                ) : (
                  <span>Ücretsiz Hesabımı Oluştur</span>
                )}
              </button>
              
              {/* Security note */}
              <div className="flex items-center justify-center gap-2 mt-3 text-xs text-gray-500">
                <ShieldCheckIcon className="h-3 w-3 text-green-500" />
                <span>Bilgileriniz SSL ile şifrelenir ve güvende tutulur</span>
              </div>
            </div>

            {/* Login Link */}
            <div className="text-center pt-2">
              <p className="text-sm text-gray-600">
                Zaten hesabınız var mı?{' '}
                <Link
                  to="/login"
                  className="font-medium text-blue-600 hover:text-blue-700"
                >
                  Giriş yapın
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;