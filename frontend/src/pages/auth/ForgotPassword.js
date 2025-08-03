import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { ArrowLeftIcon, MailIcon } from 'lucide-react';

const ForgotPassword = () => {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues
  } = useForm();

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      // TODO: Implement forgot password API call
      // await authService.forgotPassword(data.email);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setIsSubmitted(true);
      toast.success('Şifre sıfırlama bağlantısı e-posta adresinize gönderildi');
    } catch (error) {
      toast.error('Bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 bg-success-600 rounded-xl flex items-center justify-center">
              <MailIcon className="h-6 w-6 text-white" />
            </div>
            <h2 className="mt-6 text-3xl font-bold text-gray-900">
              E-posta gönderildi
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              <strong>{getValues('email')}</strong> adresine şifre sıfırlama bağlantısı gönderdik.
            </p>
          </div>

          <div className="card p-8 text-center space-y-4">
            <p className="text-gray-600">
              E-postanızı kontrol edin ve şifre sıfırlama bağlantısına tıklayın.
            </p>
            
            <div className="text-sm text-gray-500">
              <p>E-posta gelmedi mi?</p>
              <p>Spam/gereksiz klasörünüzü kontrol edin veya birkaç dakika bekleyin.</p>
            </div>

            <div className="pt-4">
              <button
                onClick={() => setIsSubmitted(false)}
                className="btn-secondary w-full"
              >
                Farklı e-posta adresi dene
              </button>
            </div>

            <div className="pt-2">
              <Link
                to="/login"
                className="inline-flex items-center text-sm text-primary-600 hover:text-primary-500"
              >
                <ArrowLeftIcon className="h-4 w-4 mr-1" />
                Giriş sayfasına dön
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-primary-600 rounded-xl flex items-center justify-center">
            <span className="text-white font-bold text-xl">YM</span>
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Şifremi unuttum
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            E-posta adresinizi girin, size şifre sıfırlama bağlantısı gönderelim
          </p>
        </div>

        {/* Forgot Password Form */}
        <div className="card p-8">
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="label">
                E-posta
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                className={`input ${errors.email ? 'input-error' : ''}`}
                placeholder="Kayıtlı e-posta adresiniz"
                {...register('email', {
                  required: 'E-posta adresi gerekli',
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: 'Geçerli bir e-posta adresi girin'
                  }
                })}
              />
              {errors.email && (
                <p className="error-text">{errors.email.message}</p>
              )}
            </div>

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full relative"
              >
                {loading ? (
                  <>
                    <div className="spinner h-4 w-4 mr-2"></div>
                    Gönderiliyor...
                  </>
                ) : (
                  'Şifre sıfırlama bağlantısı gönder'
                )}
              </button>
            </div>

            {/* Back to Login */}
            <div className="text-center">
              <Link
                to="/login"
                className="inline-flex items-center text-sm text-primary-600 hover:text-primary-500"
              >
                <ArrowLeftIcon className="h-4 w-4 mr-1" />
                Giriş sayfasına dön
              </Link>
            </div>
          </form>
        </div>

        {/* Additional Help */}
        <div className="card p-6 bg-gray-50">
          <h3 className="text-sm font-medium text-gray-900 mb-2">Yardım mı gerekiyor?</h3>
          <p className="text-xs text-gray-600">
            Eğer hesabınızla ilgili sorun yaşıyorsanız, 
            <a href="mailto:destek@yksmentor.com" className="text-primary-600 hover:text-primary-500 ml-1">
              destek ekibimize
            </a> ulaşabilirsiniz.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;