import React from 'react';
import SkeletonLoader from './SkeletonLoader';

const Loading = ({ 
  size = 'md', 
  text = 'Yükleniyor...', 
  fullScreen = false, 
  type = 'spinner',
  skeleton = 'text',
  context = null 
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16'
  };

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl'
  };

  // Context-aware loading messages
  const getContextMessage = () => {
    if (text !== 'Yükleniyor...') return text;
    
    switch (context) {
      case 'dashboard':
        return 'Dashboard yükleniyor...';
      case 'statistics':
        return 'İstatistikler hesaplanıyor...';
      case 'tasks':
        return 'Görevler getiriliyor...';
      case 'profile':
        return 'Profil bilgileri yükleniyor...';
      case 'study':
        return 'Çalışma verileri hazırlanıyor...';
      case 'timer':
        return 'Zamanlayıcı başlatılıyor...';
      default:
        return text;
    }
  };

  // Skeleton loading
  if (type === 'skeleton') {
    return <SkeletonLoader type={skeleton} className="p-4" />;
  }

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white bg-opacity-80 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="flex flex-col items-center space-y-4">
          <div className={`spinner ${sizeClasses[size]}`}></div>
          <p className={`text-gray-600 ${textSizeClasses[size]}`}>{getContextMessage()}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center p-8">
      <div className={`spinner ${sizeClasses[size]}`}></div>
      <p className={`text-gray-600 mt-3 ${textSizeClasses[size]}`}>{getContextMessage()}</p>
    </div>
  );
};

export default Loading;