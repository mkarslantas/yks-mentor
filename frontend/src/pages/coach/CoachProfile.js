import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { authService } from '../../services/auth.service';
import { 
  UserIcon, 
  MailIcon, 
  PhoneIcon,
  CalendarIcon,
  SaveIcon,
  ArrowLeftIcon,
  KeyIcon,
  LockIcon,
  CheckCircleIcon,
  AlertCircleIcon
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

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
        <CheckCircleIcon className="h-3 w-3" />
        {success}
      </p>
    );
  }
  return null;
};

const CoachProfile = () => {
  const { user, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: ''
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [formTouched, setFormTouched] = useState({});

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || ''
      });
    }
  }, [user]);

  // Validation rules
  const validateField = (name, value) => {
    switch (name) {
      case 'name':
        if (!value) return 'Ad soyad gerekli';
        if (value.length < 3) return 'En az 3 karakter olmalı';
        if (value.length > 50) return 'En fazla 50 karakter olmalı';
        if (!/^[a-zA-ZğüşöçıİĞÜŞÖÇ\s]+$/.test(value)) return 'Sadece harf ve boşluk kullanılabilir';
        return '';
      
      case 'email':
        if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Geçerli bir e-posta adresi girin';
        return '';
      
      case 'phone':
        if (value && !/^(0)?[5][0-9]{9}$/.test(value)) return 'Geçerli bir telefon numarası girin (05XX XXX XX XX)';
        if (value && value.length < 10) return 'Telefon numarası 10 haneli olmalı';
        if (value && value.length > 11) return 'Telefon numarası en fazla 11 haneli olmalı';
        return '';
      
      default:
        return '';
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Mark field as touched
    setFormTouched(prev => ({
      ...prev,
      [name]: true
    }));
    
    // Validate field
    const error = validateField(name, value);
    setFormErrors(prev => ({
      ...prev,
      [name]: error
    }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    
    // Validate passwords match
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Yeni şifreler eşleşmiyor');
      return;
    }
    
    try {
      setLoading(true);
      
      await authService.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      
      toast.success('Şifre başarıyla güncellendi! 🔐');
      
      // Clear password form
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      console.error('Password update error:', error);
      
      let errorMessage = 'Şifre güncellenirken hata oluştu';
      
      if (error.response?.data?.error?.message) {
        errorMessage = error.response.data.error.message;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Check for validation errors before submitting
    const hasErrors = Object.values(formErrors).some(error => error);
    if (hasErrors) {
      toast.error('Lütfen form hatalarını düzeltin.');
      return;
    }
    
    try {
      setLoading(true);
      
      // Only send fields that have been changed
      const profileData = {};
      
      if (formData.name !== user?.name) profileData.name = formData.name;
      if (formData.email !== user?.email) profileData.email = formData.email;
      if (formData.phone !== user?.phone) profileData.phone = formData.phone;
      
      // Check if there are any changes to submit
      if (Object.keys(profileData).length === 0) {
        toast.info('Değişiklik yapmadınız.');
        setLoading(false);
        return;
      }
      
      console.log('📤 Sending to backend (only changed fields):', profileData);
      
      // Call updateProfile with only the changed data
      await updateProfile(profileData);
      
      toast.success('Profil bilgileri güncellendi! ✅');
    } catch (error) {
      console.error('Profile update error:', error);
      
      // Better error handling
      let errorMessage = 'Profil güncellenirken hata oluştu';
      
      if (error.response?.data?.error?.message) {
        errorMessage = error.response.data.error.message;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/coach/dashboard')}
            className="p-2 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors duration-200"
          >
            <ArrowLeftIcon className="h-5 w-5 text-gray-600" />
          </button>
          <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center border border-blue-200">
            <UserIcon className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-1">
              Profil Bilgileri
            </h1>
            <p className="text-gray-600">
              Hesap bilgilerinizi görüntüleyin ve güncelleyin
            </p>
          </div>
        </div>
      </div>

      {/* Profile Form */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name Field */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Ad Soyad
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <UserIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className={`block w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                  formErrors.name && formTouched.name ? 'border-red-300 bg-red-50' : 
                  formTouched.name && !formErrors.name ? 'border-green-300 bg-green-50' : 
                  'border-gray-300'
                }`}
                placeholder="Adınız ve soyadınız"
                required
              />
            </div>
            <ValidationMessage 
              error={formTouched.name && formErrors.name}
              success={formTouched.name && !formErrors.name && formData.name && 'Geçerli'}
            />
          </div>

          {/* Email Field */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              E-posta Adresi
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MailIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className={`block w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                  formErrors.email && formTouched.email ? 'border-red-300 bg-red-50' : 
                  formTouched.email && !formErrors.email ? 'border-green-300 bg-green-50' : 
                  'border-gray-300'
                }`}
                placeholder="email@example.com"
              />
            </div>
            <ValidationMessage 
              error={formTouched.email && formErrors.email}
              success={formTouched.email && !formErrors.email && formData.email && 'Geçerli e-posta'}
            />
          </div>

          {/* Phone Field */}
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
              Telefon Numarası
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <PhoneIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className={`block w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                  formErrors.phone && formTouched.phone ? 'border-red-300 bg-red-50' : 
                  formTouched.phone && !formErrors.phone && formData.phone ? 'border-green-300 bg-green-50' : 
                  'border-gray-300'
                }`}
                placeholder="05XX XXX XX XX"
              />
            </div>
            <ValidationMessage 
              error={formTouched.phone && formErrors.phone}
              success={formTouched.phone && !formErrors.phone && formData.phone && 'Geçerli telefon'}
            />
          </div>

          {/* Account Info */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Hesap Bilgileri</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rol
                </label>
                <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg">
                  <span className="text-gray-900">Koç</span>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kayıt Tarihi
                </label>
                <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg flex items-center">
                  <CalendarIcon className="h-4 w-4 text-gray-400 mr-2" />
                  <span className="text-gray-900">
                    {user?.created_at 
                      ? new Date(user.created_at).toLocaleDateString('tr-TR')
                      : 'Bilinmiyor'
                    }
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end pt-6 border-t border-gray-200">
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors duration-200"
            >
              <SaveIcon className="h-4 w-4" />
              {loading ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CoachProfile;