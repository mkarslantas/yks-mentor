import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { LogOutIcon, UserIcon, HomeIcon, BarChart3Icon, UsersIcon, CalendarIcon, BookOpenIcon, ClockIcon, FileTextIcon, MenuIcon, XIcon, TrophyIcon, ChevronDownIcon, PlayIcon, PlusIcon, TimerIcon } from 'lucide-react';

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState({
    study: false,
    exam: false
  });
  const dropdownRef = useRef(null);

  // Türkçe iyelik eki kuralları
  const getIyelikEki = (isim) => {
    if (!isim) return '';
    
    const sonHarf = isim.slice(-1).toLowerCase();
    const sonIkiHarf = isim.slice(-2).toLowerCase();
    
    // Ünsüz harfle bitenler
    const unsuzler = ['b', 'c', 'ç', 'd', 'f', 'g', 'ğ', 'h', 'j', 'k', 'l', 'm', 'n', 'p', 'r', 's', 'ş', 't', 'v', 'y', 'z'];
    
    // Özel durumlar (k ile bitenler)
    if (sonHarf === 'k') {
      // Çok heceli ve ince ünlülü kelimeler (örn: Ayşegül'ün)
      const inceUnluler = ['e', 'i', 'ö', 'ü'];
      const kelime = isim.toLowerCase();
      for (let unlu of inceUnluler) {
        if (kelime.includes(unlu)) {
          return 'ün';
        }
      }
      return 'ın'; // Kalın ünlülü (örn: Faruk'un)
    }
    
    // Ünlü harfle bitenler
    if (['a', 'ı'].includes(sonHarf)) return 'nın';
    if (['e', 'i'].includes(sonHarf)) return 'nin';
    if (['o', 'u'].includes(sonHarf)) return 'nun';
    if (['ö', 'ü'].includes(sonHarf)) return 'nün';
    
    // Ünsüz harfle bitenler - son hecedeki ünlüye bakılır
    if (unsuzler.includes(sonHarf)) {
      const kelime = isim.toLowerCase();
      // Son hecedeki ünlüyü bul
      for (let i = kelime.length - 2; i >= 0; i--) {
        const harf = kelime[i];
        if (['a', 'ı'].includes(harf)) return 'ın';
        if (['e', 'i'].includes(harf)) return 'in';
        if (['o', 'u'].includes(harf)) return 'un';
        if (['ö', 'ü'].includes(harf)) return 'ün';
      }
    }
    
    // Varsayılan
    return 'ın';
  };

  const toggleDropdown = (key) => {
    setDropdownOpen(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const closeAllDropdowns = () => {
    setDropdownOpen({
      study: false,
      exam: false
    });
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        closeAllDropdowns();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Professional Navigation Bar */}
      <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Personalized Logo/Brand */}
            <div className="flex items-center">
              <Link to={user?.role === 'student' ? '/dashboard' : '/coach/dashboard'} className="flex items-center group">
                <h1 className="text-2xl font-bold text-gray-900 hover:text-blue-600 transition-colors duration-200">
                  {user?.name ? `${user.name.split(' ')[0]}'${getIyelikEki(user.name.split(' ')[0])} Ajandası` : 'Ajandam'}
                </h1>
              </Link>
            </div>

            {/* Professional Navigation Links - Desktop */}
            <div className="hidden lg:flex items-center space-x-6" ref={dropdownRef}>
              {user?.role === 'student' ? (
                <>
                  <Link to="/dashboard" className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors duration-200">
                    Dashboard
                  </Link>
                  <Link to="/statistics" className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors duration-200">
                    İstatistikler
                  </Link>
                  
                  {/* Çalışma Dropdown */}
                  <div className="relative">
                    <button
                      onClick={() => toggleDropdown('study')}
                      className="flex items-center text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors duration-200"
                    >
                      Çalışma
                      <ChevronDownIcon className={`ml-1 h-4 w-4 transition-transform duration-200 ${dropdownOpen.study ? 'rotate-180' : ''}`} />
                    </button>
                    {dropdownOpen.study && (
                      <div className="absolute top-full left-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                        <Link 
                          to="/study/add" 
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors duration-200"
                          onClick={closeAllDropdowns}
                        >
                          <PlusIcon className="h-4 w-4 mr-3" />
                          Çalışma Ekle
                        </Link>
                        <Link 
                          to="/study/timer" 
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors duration-200"
                          onClick={closeAllDropdowns}
                        >
                          <TimerIcon className="h-4 w-4 mr-3" />
                          Zamanlayıcı
                        </Link>
                        <Link 
                          to="/study/history" 
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors duration-200"
                          onClick={closeAllDropdowns}
                        >
                          <FileTextIcon className="h-4 w-4 mr-3" />
                          Tüm Çalışmalar
                        </Link>
                      </div>
                    )}
                  </div>

                  {/* Sınav Dropdown */}
                  <div className="relative">
                    <button
                      onClick={() => toggleDropdown('exam')}
                      className="flex items-center text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors duration-200"
                    >
                      Sınavlar
                      <ChevronDownIcon className={`ml-1 h-4 w-4 transition-transform duration-200 ${dropdownOpen.exam ? 'rotate-180' : ''}`} />
                    </button>
                    {dropdownOpen.exam && (
                      <div className="absolute top-full left-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                        <Link 
                          to="/exam/add" 
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors duration-200"
                          onClick={closeAllDropdowns}
                        >
                          <PlusIcon className="h-4 w-4 mr-3" />
                          Sınav Ekle
                        </Link>
                        <Link 
                          to="/mock-exams" 
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors duration-200"
                          onClick={closeAllDropdowns}
                        >
                          <TrophyIcon className="h-4 w-4 mr-3" />
                          Denemelerim
                        </Link>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <Link to="/coach/dashboard" className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors duration-200">
                    Dashboard
                  </Link>
                </>
              )}
            </div>

            {/* Tablet Navigation Links - Medium screens */}
            <div className="hidden md:flex lg:hidden items-center space-x-4">
              {user?.role === 'student' ? (
                <>
                  <Link to="/dashboard" className="text-gray-700 hover:text-blue-600 px-2 py-1 text-sm font-medium transition-colors duration-200">
                    Dashboard
                  </Link>
                  <Link to="/statistics" className="text-gray-700 hover:text-blue-600 px-2 py-1 text-sm font-medium transition-colors duration-200">
                    İstatistikler
                  </Link>
                  <Link to="/study/add" className="text-gray-700 hover:text-blue-600 px-2 py-1 text-sm font-medium transition-colors duration-200">
                    Çalışma+
                  </Link>
                  <Link to="/study/history" className="text-gray-700 hover:text-blue-600 px-2 py-1 text-sm font-medium transition-colors duration-200">
                    Çalışmalar
                  </Link>
                  <Link to="/mock-exams" className="text-gray-700 hover:text-blue-600 px-2 py-1 text-sm font-medium transition-colors duration-200">
                    Denemeler
                  </Link>
                </>
              ) : (
                <>
                  <Link to="/coach/dashboard" className="text-gray-700 hover:text-blue-600 px-2 py-1 text-sm font-medium transition-colors duration-200">
                    Dashboard
                  </Link>
                </>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors duration-200"
                aria-label="Ana menü"
              >
                {mobileMenuOpen ? (
                  <XIcon className="h-6 w-6" />
                ) : (
                  <MenuIcon className="h-6 w-6" />
                )}
              </button>
            </div>

            {/* Professional User Menu */}
            <div className="hidden md:flex items-center space-x-4">
              {/* User Info */}
              <div className="hidden lg:flex items-center gap-3">
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900">{user?.name}</div>
                  <div className="text-xs text-gray-500">
                    {user?.role === 'student' ? 'Öğrenci' : 'Koç'}
                  </div>
                </div>
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-medium text-sm">
                    {user?.name?.charAt(0).toUpperCase() || 'U'}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Link 
                  to={user?.role === 'student' ? '/profile' : '/coach/profile'} 
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                  title="Profil"
                >
                  <UserIcon className="h-5 w-5" />
                </Link>
                
                
                <button
                  onClick={handleLogout}
                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                  title="Çıkış Yap"
                >
                  <LogOutIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 bg-white">
            <div className="px-4 pt-2 pb-3 space-y-1">
              {/* User Profile Section */}
              <div className="flex items-center px-3 py-3 border-b border-gray-200 mb-3">
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center mr-3">
                  <span className="text-white font-medium text-sm">
                    {user?.name?.charAt(0).toUpperCase() || 'U'}
                  </span>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-900">{user?.name?.split(' ')[0]}</div>
                  <div className="text-xs text-gray-500">
                    {user?.role === 'student' ? 'Öğrenci' : 'Koç'}
                  </div>
                </div>
              </div>

              {/* Navigation Links */}
              {user?.role === 'student' ? (
                <>
                  <Link 
                    to="/dashboard" 
                    className="flex items-center px-3 py-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <HomeIcon className="h-5 w-5 mr-3" />
                    Dashboard
                  </Link>
                  <Link 
                    to="/statistics" 
                    className="flex items-center px-3 py-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <BarChart3Icon className="h-5 w-5 mr-3" />
                    İstatistikler
                  </Link>
                  
                  {/* Çalışma Kategorisi */}
                  <div className="px-3 py-1">
                    <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Çalışma</div>
                  </div>
                  <Link 
                    to="/study/add" 
                    className="flex items-center px-6 py-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <PlusIcon className="h-4 w-4 mr-3" />
                    Çalışma Ekle
                  </Link>
                  <Link 
                    to="/study/timer" 
                    className="flex items-center px-6 py-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <TimerIcon className="h-4 w-4 mr-3" />
                    Zamanlayıcı
                  </Link>
                  <Link 
                    to="/study/history" 
                    className="flex items-center px-6 py-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <FileTextIcon className="h-4 w-4 mr-3" />
                    Tüm Çalışmalar
                  </Link>
                  
                  {/* Sınav Kategorisi */}
                  <div className="px-3 py-1 mt-2">
                    <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Sınavlar</div>
                  </div>
                  <Link 
                    to="/exam/add" 
                    className="flex items-center px-6 py-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <PlusIcon className="h-4 w-4 mr-3" />
                    Sınav Ekle
                  </Link>
                  <Link 
                    to="/mock-exams" 
                    className="flex items-center px-6 py-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <TrophyIcon className="h-4 w-4 mr-3" />
                    Denemelerim
                  </Link>
                </>
              ) : (
                <>
                  <Link 
                    to="/coach/dashboard" 
                    className="flex items-center px-3 py-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <HomeIcon className="h-5 w-5 mr-3" />
                    Dashboard
                  </Link>
                </>
              )}

              {/* Action Buttons */}
              <div className="pt-3 border-t border-gray-200 space-y-2">
                <Link 
                  to={user?.role === 'student' ? '/profile' : '/coach/profile'} 
                  className="flex items-center px-3 py-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <UserIcon className="h-5 w-5 mr-3" />
                  Profil
                </Link>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="flex items-center w-full px-3 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors duration-200"
                >
                  <LogOutIcon className="h-5 w-5 mr-3" />
                  Çıkış Yap
                </button>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-8">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Layout;