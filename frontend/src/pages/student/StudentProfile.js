import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../hooks/useAuth';
import { authService } from '../../services/auth.service';
import { AlertCircleIcon, CheckCircleIcon as CheckIcon } from 'lucide-react';
import { 
  UserIcon, 
  MailIcon, 
  PhoneIcon, 
  BookOpenIcon, 
  GraduationCapIcon,
  KeyIcon,
  SaveIcon,
  ShieldIcon,
  EditIcon,
  CheckCircleIcon,
  XCircleIcon,
  MapPinIcon,
  CalendarIcon,
  StarIcon,
  AwardIcon,
  TargetIcon,
  TrendingUpIcon,
  Settings2Icon,
  BellIcon,
  EyeIcon,
  LockIcon
} from 'lucide-react';

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

const StudentProfile = () => {
  const { user, updateProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, dirtyFields }
  } = useForm({
    mode: 'onChange' // Enable real-time validation
  });

  // Reset form when user data loads
  useEffect(() => {
    if (user) {
      reset({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        target_field: user.studentProfile?.target_field || 'sayisal',
        grade_level: user.studentProfile?.grade_level || 12,
        school_name: user.studentProfile?.school_name || ''
      });
    }
  }, [user, reset]);

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    reset: resetPassword,
    watch: watchPassword,
    formState: { errors: passwordErrors, dirtyFields: passwordDirtyFields }
  } = useForm({
    mode: 'onChange'
  });

  const targetFields = [
    { value: 'sayisal', label: 'Sayısal', icon: '🔬' },
    { value: 'sozel', label: 'Sözel', icon: '📚' },
    { value: 'esit_agirlik', label: 'Eşit Ağırlık', icon: '⚖️' },
    { value: 'dil', label: 'Dil', icon: '🌐' }
  ];

  const onProfileSubmit = async (data) => {
    try {
      setLoading(true);
      
      console.log('📝 Form data:', data);
      console.log('📝 Dirty fields:', dirtyFields);
      
      // Only send fields that have been changed
      const profileData = {};
      const studentProfileData = {};
      
      // Check basic user fields
      if (dirtyFields.name) profileData.name = data.name;
      if (dirtyFields.email && data.email !== user?.email) profileData.email = data.email;
      if (dirtyFields.phone) profileData.phone = data.phone;
      
      // Check student profile fields
      if (dirtyFields.target_field) studentProfileData.target_field = data.target_field;
      if (dirtyFields.grade_level) studentProfileData.grade_level = parseInt(data.grade_level);
      if (dirtyFields.school_name) studentProfileData.school_name = data.school_name;
      
      // Only add studentProfile if there are changes
      if (Object.keys(studentProfileData).length > 0) {
        profileData.studentProfile = studentProfileData;
      }
      
      // Check if there are any changes to submit
      if (Object.keys(profileData).length === 0) {
        toast.info('Değişiklik yapmadınız.');
        setLoading(false);
        return;
      }
      
      console.log('📤 Sending to backend (only changed fields):', profileData);
      
      const result = await updateProfile(profileData);
      console.log('✅ Update result:', result);
      
      toast.success('Profil başarıyla güncellendi!');
    } catch (error) {
      console.error('❌ Profile update error:', error);
      console.error('❌ Error response:', error.response);
      
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

  const onPasswordSubmit = async (data) => {
    try {
      setLoading(true);
      
      await authService.changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword
      });
      
      toast.success('Şifre başarıyla güncellendi!');
      resetPassword();
    } catch (error) {
      console.error('Password update error:', error);
      toast.error(error.message || 'Şifre güncellenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'profile', label: 'Profil Bilgileri', icon: UserIcon, color: 'blue' },
    { id: 'security', label: 'Güvenlik & Şifre', icon: ShieldIcon, color: 'green' },
    { id: 'preferences', label: 'Tercihler', icon: Settings2Icon, color: 'purple' }
  ];

  const getTabColor = (tabId) => {
    const tab = tabs.find(t => t.id === tabId);
    return tab?.color || 'blue';
  };

  return (
    <div>
      <div className="space-y-6">
        {/* Clean Header */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex items-center gap-4">
              {/* Avatar */}
              <div className="relative">
                <div className="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center border border-gray-200">
                  <span className="text-xl font-semibold text-gray-700">
                    {user?.name?.charAt(0).toUpperCase() || 'Ö'}
                  </span>
                </div>
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-gray-600 rounded-full flex items-center justify-center">
                  <CheckCircleIcon className="h-3 w-3 text-white" />
                </div>
              </div>
              
              <div>
                <h1 className="text-2xl font-semibold text-gray-900 mb-1">
                  Profil Ayarları
                </h1>
                <p className="text-gray-600 mb-3">
                  Hesap bilgilerinizi yönetin ve güvenliğinizi sağlayın
                </p>
                
                {/* User Info Pills */}
                <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <UserIcon className="h-3 w-3" />
                    <span>{user?.name || 'Öğrenci'}</span>
                  </div>
                  <span className="text-gray-400">•</span>
                  <div className="flex items-center gap-1">
                    <GraduationCapIcon className="h-3 w-3" />
                    <span>{user?.studentProfile?.grade_level === 13 ? 'Mezun' : `${user?.studentProfile?.grade_level || 12}. Sınıf`}</span>
                  </div>
                  <span className="text-gray-400">•</span>
                  <div className="flex items-center gap-1">
                    <TargetIcon className="h-3 w-3" />
                    <span>{targetFields.find(f => f.value === user?.studentProfile?.target_field)?.label || 'Sayısal'}</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Status Cards */}
            <div className="flex gap-3">
              <div className="bg-gray-50 rounded-lg p-3 text-center border border-gray-200">
                <div className="w-6 h-6 bg-gray-200 rounded-lg flex items-center justify-center mx-auto mb-1">
                  <CheckCircleIcon className="h-4 w-4 text-gray-600" />
                </div>
                <div className="text-xs font-medium text-gray-900">Doğrulanmış</div>
                <div className="text-xs text-gray-600">Hesap</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 text-center border border-gray-200">
                <div className="w-6 h-6 bg-gray-200 rounded-lg flex items-center justify-center mx-auto mb-1">
                  <ShieldIcon className="h-4 w-4 text-gray-600" />
                </div>
                <div className="text-xs font-medium text-gray-900">Güvenli</div>
                <div className="text-xs text-gray-600">Profil</div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="border-b border-gray-200">
            <nav className="flex">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-1 flex items-center justify-center py-3 px-4 font-medium text-sm transition-colors border-b-2 ${
                      isActive
                        ? 'border-gray-900 text-gray-900 bg-gray-50'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="h-4 w-4 mr-2" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'profile' && (
              <div className="space-y-6">
                <form onSubmit={handleSubmit(onProfileSubmit)} className="space-y-6">
                  {/* Personal Information Section */}
                  <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-8 h-8 bg-gray-200 rounded-lg flex items-center justify-center">
                        <UserIcon className="h-4 w-4 text-gray-600" />
                      </div>
                      <div>
                        <h2 className="text-lg font-semibold text-gray-900">Kişisel Bilgiler</h2>
                        <p className="text-sm text-gray-600">Temel profil bilgilerinizi güncelleyin</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700">
                          <UserIcon className="h-4 w-4 inline mr-2" />
                          Ad Soyad
                        </label>
                        <input
                          type="text"
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-colors ${
                            errors.name ? 'border-red-300 bg-red-50' : 
                            dirtyFields.name && !errors.name ? 'border-green-300 bg-green-50' : 
                            'border-gray-300'
                          }`}
                          {...register('name', { 
                            required: 'Ad soyad gerekli',
                            minLength: { value: 3, message: 'En az 3 karakter olmalı' },
                            maxLength: { value: 50, message: 'En fazla 50 karakter olmalı' },
                            pattern: {
                              value: /^[a-zA-ZğüşöçıİĞÜŞÖÇ\s]+$/,
                              message: 'Sadece harf ve boşluk kullanılabilir'
                            }
                          })}
                        />
                        <ValidationMessage 
                          error={errors.name?.message}
                          success={dirtyFields.name && !errors.name && 'Geçerli'}
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700">
                          <MailIcon className="h-4 w-4 inline mr-2" />
                          E-posta Adresi
                        </label>
                        <input
                          type="email"
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-colors ${
                            errors.email ? 'border-red-300 bg-red-50' : 
                            dirtyFields.email && !errors.email ? 'border-green-300 bg-green-50' : 
                            'border-gray-300'
                          }`}
                          placeholder="ornek@email.com"
                          {...register('email', {
                            required: 'E-posta adresi gerekli',
                            pattern: {
                              value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                              message: 'Geçerli bir e-posta adresi girin'
                            },
                          })}
                        />
                        <ValidationMessage 
                          error={errors.email?.message}
                          success={dirtyFields.email && !errors.email && 'Geçerli e-posta adresi'}
                        />
                        <p className="text-xs text-gray-500">E-posta adresi değişikliği güvenlik doğrulaması gerektirir</p>
                      </div>

                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700">
                          <PhoneIcon className="h-4 w-4 inline mr-2" />
                          Telefon Numarası
                        </label>
                        <input
                          type="tel"
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-colors ${
                            errors.phone ? 'border-red-300 bg-red-50' : 
                            dirtyFields.phone && !errors.phone && watch('phone') ? 'border-green-300 bg-green-50' : 
                            'border-gray-300'
                          }`}
                          placeholder="05XX XXX XX XX"
                          {...register('phone', {
                            pattern: {
                              value: /^(0)?[5][0-9]{9}$/,
                              message: 'Geçerli bir telefon numarası girin (05XX XXX XX XX)'
                            },
                            minLength: { value: 10, message: 'Telefon numarası 10 haneli olmalı' },
                            maxLength: { value: 11, message: 'Telefon numarası en fazla 11 haneli olmalı' }
                          })}
                        />
                        <ValidationMessage 
                          error={errors.phone?.message}
                          success={dirtyFields.phone && !errors.phone && watch('phone') && 'Geçerli telefon numarası'}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Academic Information Section */}
                  <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-8 h-8 bg-gray-200 rounded-lg flex items-center justify-center">
                        <GraduationCapIcon className="h-4 w-4 text-gray-600" />
                      </div>
                      <div>
                        <h2 className="text-lg font-semibold text-gray-900">Akademik Bilgiler</h2>
                        <p className="text-sm text-gray-600">Eğitim durumunuz ve hedefleriniz</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700">
                          <TargetIcon className="h-4 w-4 inline mr-2" />
                          Hedef Alan
                        </label>
                        <select
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent appearance-none cursor-pointer ${errors.target_field ? 'border-red-300' : 'border-gray-300'}`}
                          {...register('target_field', { required: 'Hedef alan seçimi gerekli' })}
                        >
                          {targetFields.map(field => (
                            <option key={field.value} value={field.value}>
                              {field.icon} {field.label}
                            </option>
                          ))}
                        </select>
                        {errors.target_field && (
                          <p className="text-sm text-red-600 flex items-center gap-1 animate-slide-in-right">
                            <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                            {errors.target_field.message}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700">
                          <BookOpenIcon className="h-4 w-4 inline mr-2" />
                          Sınıf Seviyesi
                        </label>
                        <select
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent appearance-none cursor-pointer ${errors.grade_level ? 'border-red-300' : 'border-gray-300'}`}
                          {...register('grade_level', { 
                            required: 'Sınıf seçimi gerekli',
                            valueAsNumber: true 
                          })}
                        >
                          <option value={9}>📚 9. Sınıf</option>
                          <option value={10}>📖 10. Sınıf</option>
                          <option value={11}>📝 11. Sınıf</option>
                          <option value={12}>🎓 12. Sınıf</option>
                          <option value={13}>🎯 Mezun</option>
                        </select>
                        {errors.grade_level && (
                          <p className="text-sm text-red-600 flex items-center gap-1 animate-slide-in-right">
                            <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                            {errors.grade_level.message}
                          </p>
                        )}
                      </div>

                      <div className="lg:col-span-2 space-y-2">
                        <label className="block text-sm font-semibold text-gray-700">
                          <MapPinIcon className="h-4 w-4 inline mr-2" />
                          Okul Adı
                        </label>
                        <input
                          type="text"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                          placeholder="Örn: Atatürk Anadolu Lisesi"
                          {...register('school_name')}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="flex justify-end pt-4">
                    <button
                      type="submit"
                      disabled={loading}
                      className="bg-gray-900 hover:bg-gray-800 text-white px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {loading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>Kaydediliyor...</span>
                        </>
                      ) : (
                        <>
                          <SaveIcon className="h-4 w-4" />
                          <span>Değişiklikleri Kaydet</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="space-y-6">
                <form onSubmit={handlePasswordSubmit(onPasswordSubmit)} className="space-y-6">
                  {/* Password Change Section */}
                  <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-8 h-8 bg-gray-200 rounded-lg flex items-center justify-center">
                        <KeyIcon className="h-4 w-4 text-gray-600" />
                      </div>
                      <div>
                        <h2 className="text-lg font-semibold text-gray-900">Şifre Değiştir</h2>
                        <p className="text-sm text-gray-600">Hesabınızın güvenliği için güçlü bir şifre kullanın</p>
                      </div>
                    </div>
                    
                    <div className="max-w-lg space-y-6">
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700">
                          <LockIcon className="h-4 w-4 inline mr-2" />
                          Mevcut Şifre
                        </label>
                        <input
                          type="password"
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent ${passwordErrors.currentPassword ? 'border-red-300' : 'border-gray-300'}`}
                          placeholder="Mevcut şifrenizi girin"
                          {...registerPassword('currentPassword', { 
                            required: 'Mevcut şifre gerekli' 
                          })}
                        />
                        {passwordErrors.currentPassword && (
                          <p className="text-sm text-red-600 flex items-center gap-1 animate-slide-in-right">
                            <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                            {passwordErrors.currentPassword.message}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700">
                          <KeyIcon className="h-4 w-4 inline mr-2" />
                          Yeni Şifre
                        </label>
                        <input
                          type="password"
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-colors ${
                            passwordErrors.newPassword ? 'border-red-300 bg-red-50' : 
                            passwordDirtyFields.newPassword && !passwordErrors.newPassword ? 'border-green-300 bg-green-50' : 
                            'border-gray-300'
                          }`}
                          placeholder="Yeni şifrenizi girin"
                          {...registerPassword('newPassword', { 
                            required: 'Yeni şifre gerekli',
                            minLength: { value: 6, message: 'En az 6 karakter olmalı' },
                            maxLength: { value: 50, message: 'En fazla 50 karakter olmalı' },
                            pattern: {
                              value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{6,}$/,
                              message: 'Şifre en az bir büyük harf, bir küçük harf ve bir rakam içermelidir'
                            }
                          })}
                        />
                        <ValidationMessage 
                          error={passwordErrors.newPassword?.message}
                          success={passwordDirtyFields.newPassword && !passwordErrors.newPassword && 'Güçlü şifre'}
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700">
                          <CheckCircleIcon className="h-4 w-4 inline mr-2" />
                          Yeni Şifre (Tekrar)
                        </label>
                        <input
                          type="password"
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent ${passwordErrors.confirmPassword ? 'border-red-300' : 'border-gray-300'}`}
                          placeholder="Yeni şifrenizi tekrar girin"
                          {...registerPassword('confirmPassword', { 
                            required: 'Şifre tekrarı gerekli',
                            validate: (value) => 
                              value === watchPassword('newPassword') || 'Şifreler eşleşmiyor'
                          })}
                        />
                        <ValidationMessage 
                          error={passwordErrors.confirmPassword?.message}
                          success={passwordDirtyFields.confirmPassword && !passwordErrors.confirmPassword && watchPassword('confirmPassword') && 'Şifreler eşleşiyor'}
                        />
                      </div>

                      {/* Password Requirements */}
                      <div className="bg-white rounded-lg p-4 border border-gray-200">
                        <h4 className="text-sm font-semibold text-gray-700 mb-3">Şifre Gereksinimleri</h4>
                        <div className="space-y-2 text-xs text-gray-600">
                          <div className="flex items-center gap-2">
                            <CheckCircleIcon className="h-3 w-3 text-green-500" />
                            <span>En az 6 karakter</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <CheckCircleIcon className="h-3 w-3 text-green-500" />
                            <span>Büyük ve küçük harf</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <CheckCircleIcon className="h-3 w-3 text-green-500" />
                            <span>En az bir rakam</span>
                          </div>
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={loading}
                        className="bg-gray-900 hover:bg-gray-800 text-white px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 w-full justify-center"
                      >
                        {loading ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            <span>Güncelleniyor...</span>
                          </>
                        ) : (
                          <>
                            <ShieldIcon className="h-4 w-4" />
                            <span>Şifreyi Güncelle</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            )}

            {activeTab === 'preferences' && (
              <div className="space-y-6">
                {/* Notification Preferences */}
                <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-8 h-8 bg-gray-200 rounded-lg flex items-center justify-center">
                      <BellIcon className="h-4 w-4 text-gray-600" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900">Bildirim Tercihleri</h2>
                      <p className="text-sm text-gray-600">Hangi bildirimleri almak istediğinizi seçin</p>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <label className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 bg-gray-100 rounded-lg flex items-center justify-center">
                          <CalendarIcon className="h-3 w-3 text-gray-600" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">Çalışma Hatırlatıcıları</div>
                          <div className="text-sm text-gray-600">Günlük çalışma zamanınız geldiğinde bildirim al</div>
                        </div>
                      </div>
                      <input type="checkbox" defaultChecked className="h-4 w-4 text-gray-600 focus:ring-gray-500 border-gray-300 rounded" />
                    </label>

                    <label className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 bg-gray-100 rounded-lg flex items-center justify-center">
                          <TrendingUpIcon className="h-3 w-3 text-gray-600" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">İlerleme Raporları</div>
                          <div className="text-sm text-gray-600">Haftalık ilerleme özetleri al</div>
                        </div>
                      </div>
                      <input type="checkbox" defaultChecked className="h-4 w-4 text-gray-600 focus:ring-gray-500 border-gray-300 rounded" />
                    </label>

                    <label className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 bg-gray-100 rounded-lg flex items-center justify-center">
                          <StarIcon className="h-3 w-3 text-gray-600" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">Başarı Bildirimleri</div>
                          <div className="text-sm text-gray-600">Hedefleri tamamladığında tebrik mesajları</div>
                        </div>
                      </div>
                      <input type="checkbox" defaultChecked className="h-4 w-4 text-gray-600 focus:ring-gray-500 border-gray-300 rounded" />
                    </label>
                  </div>
                </div>

                {/* Privacy Settings */}
                <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-8 h-8 bg-gray-200 rounded-lg flex items-center justify-center">
                      <EyeIcon className="h-4 w-4 text-gray-600" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900">Gizlilik Ayarları</h2>
                      <p className="text-sm text-gray-600">Verilerinizin nasıl kullanılacağını kontrol edin</p>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <label className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors">
                      <div>
                        <div className="font-medium text-gray-900">Performans Analizi</div>
                        <div className="text-sm text-gray-600">Çalışma verilerinizin analizine izin ver</div>
                      </div>
                      <input type="checkbox" defaultChecked className="h-4 w-4 text-gray-600 focus:ring-gray-500 border-gray-300 rounded" />
                    </label>

                    <label className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors">
                      <div>
                        <div className="font-medium text-gray-900">Kişiselleştirilmiş Öneriler</div>
                        <div className="text-sm text-gray-600">Size özel çalışma önerileri al</div>
                      </div>
                      <input type="checkbox" defaultChecked className="h-4 w-4 text-gray-600 focus:ring-gray-500 border-gray-300 rounded" />
                    </label>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button className="bg-gray-900 hover:bg-gray-800 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center gap-2">
                    <Settings2Icon className="h-4 w-4" />
                    <span>Tercihleri Kaydet</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentProfile;