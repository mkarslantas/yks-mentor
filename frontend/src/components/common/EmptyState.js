import React from 'react';
import { BookOpenIcon, ClockIcon, UsersIcon, BarChart3Icon, CalendarIcon, FileTextIcon, SearchIcon, AlertCircleIcon } from 'lucide-react';

const EmptyState = ({ 
  type = 'general',
  title,
  description,
  actionText,
  onAction,
  actionButton,
  className = '',
  size = 'md'
}) => {
  const getIcon = () => {
    const iconClasses = size === 'sm' ? 'h-12 w-12' : size === 'lg' ? 'h-20 w-20' : 'h-16 w-16';
    
    switch (type) {
      case 'tasks':
        return <CalendarIcon className={`${iconClasses} text-blue-500`} />;
      case 'study':
        return <BookOpenIcon className={`${iconClasses} text-green-500`} />;
      case 'statistics':
        return <BarChart3Icon className={`${iconClasses} text-purple-500`} />;
      case 'students':
        return <UsersIcon className={`${iconClasses} text-orange-500`} />;
      case 'timer':
        return <ClockIcon className={`${iconClasses} text-red-500`} />;
      case 'search':
        return <SearchIcon className={`${iconClasses} text-gray-400`} />;
      case 'error':
        return <AlertCircleIcon className={`${iconClasses} text-red-500`} />;
      default:
        return <FileTextIcon className={`${iconClasses} text-gray-400`} />;
    }
  };

  const getDefaultContent = () => {
    switch (type) {
      case 'tasks':
        return {
          title: 'Henüz görev yok',
          description: 'Çalışma planınızı oluşturmak için ilk görevinizi ekleyin',
          actionText: 'Görev Ekle'
        };
      case 'study':
        return {
          title: 'Çalışma kaydı bulunamadı',
          description: 'Çalışma geçmişinizi takip etmek için ilk kaydınızı ekleyin',
          actionText: 'Çalışma Ekle'
        };
      case 'statistics':
        return {
          title: 'İstatistik verisi yok',
          description: 'Çalışma ve sınav kayıtlarınız olduğunda istatistikleriniz burada görünecek',
          actionText: 'Çalışma Başlat'
        };
      case 'students':
        return {
          title: 'Öğrenci bulunamadı',
          description: 'Mentorluk yapmak için öğrenci eklemeye başlayın',
          actionText: 'Öğrenci Ekle'
        };
      case 'timer':
        return {
          title: 'Zamanlayıcı durdu',
          description: 'Pomodoro tekniği ile odaklanmış çalışma seansı başlatın',
          actionText: 'Timer Başlat'
        };
      case 'search':
        return {
          title: 'Sonuç bulunamadı',
          description: 'Arama kriterlerinizi değiştirerek tekrar deneyin',
          actionText: 'Aramayı Temizle'
        };
      case 'error':
        return {
          title: 'Bir hata oluştu',
          description: 'Veriler yüklenirken beklenmeyen bir sorun yaşandı',
          actionText: 'Tekrar Dene'
        };
      default:
        return {
          title: 'İçerik bulunamadı',
          description: 'Bu bölümde henüz herhangi bir veri bulunmuyor',
          actionText: 'Yenile'
        };
    }
  };

  const defaultContent = getDefaultContent();
  const finalTitle = title || defaultContent.title;
  const finalDescription = description || defaultContent.description;
  const finalActionText = actionText || defaultContent.actionText;

  const containerClasses = {
    sm: 'py-8',
    md: 'py-12',
    lg: 'py-16'
  };

  const titleClasses = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl'
  };

  const descriptionClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  };

  return (
    <div className={`text-center ${containerClasses[size]} ${className}`}>
      {/* Icon */}
      <div className="flex justify-center mb-4">
        <div className="p-4 bg-gray-50 rounded-full">
          {getIcon()}
        </div>
      </div>

      {/* Title */}
      <h3 className={`font-semibold text-gray-900 mb-2 ${titleClasses[size]}`}>
        {finalTitle}
      </h3>

      {/* Description */}
      <p className={`text-gray-600 mb-6 max-w-md mx-auto leading-relaxed ${descriptionClasses[size]}`}>
        {finalDescription}
      </p>

      {/* Action */}
      {(onAction || actionButton) && (
        <div className="flex justify-center">
          {actionButton || (
            <button
              onClick={onAction}
              className="btn-primary"
            >
              {finalActionText}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default EmptyState;