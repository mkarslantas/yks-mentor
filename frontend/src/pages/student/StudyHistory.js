import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { studentService } from '../../services/student.service';
import { 
  ClockIcon, 
  BookOpenIcon, 
  TrendingUpIcon,
  CalendarIcon,
  FilterIcon,
  SearchIcon,
  EyeIcon,
  TargetIcon,
  BarChart3Icon,
  CheckCircleIcon,
  XCircleIcon,
  CircleIcon,
  ChevronRightIcon,
  StarIcon,
  ActivityIcon,
  EditIcon,
  TrashIcon
} from 'lucide-react';
import Loading from '../../components/common/Loading';

const StudyHistory = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [studyRecords, setStudyRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    subject: 'all',
    dateRange: '30' // Last 30 days
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [recordToDelete, setRecordToDelete] = useState(null);

  // Study type mappings
  const studyTypes = {
    'konu_calismasi': { label: 'Konu Çalışması', color: 'bg-green-100 text-green-800' },
    'soru_cozumu': { label: 'Soru Çözümü', color: 'bg-blue-100 text-blue-800' },
    'tekrar': { label: 'Tekrar', color: 'bg-orange-100 text-orange-800' },
    'deneme_sinavi': { label: 'Deneme Sınavı', color: 'bg-purple-100 text-purple-800' }
  };

  const getStudyTypeDisplay = (record) => {
    // Use study_type from backend, fallback to guessing for old records
    const studyType = record.study_type || (record.questions_solved > 0 ? 'soru_cozumu' : 'konu_calismasi');
    return studyTypes[studyType] || studyTypes['konu_calismasi'];
  };

  useEffect(() => {
    const fetchStudyHistory = async () => {
      try {
        const data = await studentService.getStudyRecords();
        setStudyRecords(data || []);
        
        // Check if there's a record ID in the URL
        const searchParams = new URLSearchParams(location.search);
        const recordId = searchParams.get('record');
        
        if (recordId && data) {
          // Find the record with the given ID
          const targetRecord = data.find(record => record.id === parseInt(recordId));
          if (targetRecord) {
            // Automatically open the detail modal for this record
            setSelectedRecord(targetRecord);
          }
        }
      } catch (err) {
        console.error('Study history fetch error:', err);
        setError('Çalışma geçmişi yüklenirken hata oluştu');
      } finally {
        setLoading(false);
      }
    };

    fetchStudyHistory();
  }, [location.search]);

  const fetchStudyHistory = async () => {
    try {
      setLoading(true);
      const data = await studentService.getStudyRecords();
      setStudyRecords(data || []);
    } catch (err) {
      console.error('Study history fetch error:', err);
      setError('Çalışma geçmişi yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleEditRecord = (record) => {
    // Navigate to add study record page with editing mode
    navigate(`/study/add?edit=${record.id}`, { 
      state: { editingRecord: record } 
    });
  };

  const handleDeleteRecord = (record) => {
    setRecordToDelete(record);
  };

  const confirmDelete = async () => {
    if (!recordToDelete) return;
    
    try {
      setDeletingId(recordToDelete.id);
      await studentService.deleteStudyRecord(recordToDelete.id);
      toast.success('Çalışma kaydı başarıyla silindi');
      fetchStudyHistory(); // Refresh the list
      setRecordToDelete(null); // Close modal
    } catch (error) {
      console.error('Error deleting study record:', error);
      const errorMessage = error.response?.data?.error?.message || 
                          error.response?.data?.message || 
                          'Kayıt silinirken hata oluştu';
      toast.error(errorMessage);
    } finally {
      setDeletingId(null);
    }
  };

  const cancelDelete = () => {
    setRecordToDelete(null);
    setDeletingId(null);
  };

  const subjects = [
    { value: 'matematik', label: 'Matematik' },
    { value: 'fizik', label: 'Fizik' },
    { value: 'kimya', label: 'Kimya' },
    { value: 'biyoloji', label: 'Biyoloji' },
    { value: 'turkce', label: 'Türkçe' },
    { value: 'tarih', label: 'Tarih' },
    { value: 'cografya', label: 'Coğrafya' },
    { value: 'felsefe', label: 'Felsefe' },
    { value: 'ingilizce', label: 'İngilizce' }
  ];


  const formatTime = (minutes) => {
    if (minutes < 60) return `${minutes} dk`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}s ${mins}dk` : `${hours} saat`;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const calculateStats = () => {
    const totalTime = studyRecords.reduce((acc, record) => acc + (record.duration_minutes || 0), 0);
    const totalQuestions = studyRecords.reduce((acc, record) => acc + (record.questions_solved || 0), 0);
    const correctAnswers = studyRecords.reduce((acc, record) => acc + (record.correct_answers || 0), 0);
    const accuracy = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;

    return {
      totalTime,
      totalSessions: studyRecords.length,
      totalQuestions,
      accuracy
    };
  };

  const filteredRecords = studyRecords.filter(record => {
    const matchesSearch = !searchTerm || 
      record.topic?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.subject?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSubject = filters.subject === 'all' || record.subject === filters.subject;
    // Study type filtering removed since our records don't have this field consistently
    
    return matchesSearch && matchesSubject;
  });

  const stats = calculateStats();

  if (loading) return <Loading />;

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <p className="text-red-800">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-6">
        {/* Modern Purple Gradient Header */}
        <div className="bg-gradient-to-r from-purple-600 via-purple-500 to-blue-500 rounded-2xl mb-8">
          <div className="p-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/30">
              <BarChart3Icon className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold mb-2 text-white">
                Çalışma Geçmişi
              </h1>
              <p className="text-purple-100 text-lg">
                Tüm çalışma seanslarınızı görüntüleyin ve performansınızı analiz edin
              </p>
            </div>
          </div>
          
          {/* Quick stats */}
          <div className="flex items-center gap-6 mt-6">
            <div className="flex items-center gap-2">
              <ActivityIcon className="h-5 w-5 text-white" />
              <span className="text-sm text-purple-100">
                {stats.totalSessions} toplam seans
              </span>
            </div>
            <div className="flex items-center gap-2">
              <ClockIcon className="h-5 w-5 text-white" />
              <span className="text-sm text-purple-100">
                {formatTime(stats.totalTime)} toplam süre
              </span>
            </div>
            <div className="flex items-center gap-2">
              <StarIcon className="h-5 w-5 text-white" />
              <span className="text-sm text-purple-100">
                %{stats.accuracy} başarı oranı
              </span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-6 space-y-8">

        {/* Enhanced Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total Time */}
          <div className="card-modern p-6 hover:shadow-lg hover:border-blue-200 transition-all duration-300 group animate-slide-up">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                  <ClockIcon className="h-7 w-7 text-blue-600" />
                </div>
                <div className="ml-4">
                  <h2 className="text-sm font-medium text-gray-600">Toplam Süre</h2>
                  <p className="text-3xl font-bold text-gray-900">{formatTime(stats.totalTime)}</p>
                  <p className="text-xs text-blue-600 font-medium mt-1">
                    Çalışma zamanı
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Total Sessions */}
          <div className="card-modern p-6 hover:shadow-lg hover:border-green-200 transition-all duration-300 group animate-slide-up stagger-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                  <BookOpenIcon className="h-7 w-7 text-green-600" />
                </div>
                <div className="ml-4">
                  <h2 className="text-sm font-medium text-gray-600">Toplam Seans</h2>
                  <p className="text-3xl font-bold text-gray-900">{stats.totalSessions}</p>
                  <p className="text-xs text-green-600 font-medium mt-1">
                    Çalışma oturumu
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Total Questions */}
          <div className="card-modern p-6 hover:shadow-lg hover:border-purple-200 transition-all duration-300 group animate-slide-up stagger-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                  <TargetIcon className="h-7 w-7 text-purple-600" />
                </div>
                <div className="ml-4">
                  <h2 className="text-sm font-medium text-gray-600">Toplam Soru</h2>
                  <p className="text-3xl font-bold text-gray-900">{stats.totalQuestions}</p>
                  <p className="text-xs text-purple-600 font-medium mt-1">
                    Çözülen soru
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Accuracy Rate */}
          <div className="card-modern p-6 hover:shadow-lg hover:border-orange-200 transition-all duration-300 group animate-slide-up stagger-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-14 h-14 bg-orange-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                  <TrendingUpIcon className="h-7 w-7 text-orange-600" />
                </div>
                <div className="ml-4">
                  <h2 className="text-sm font-medium text-gray-600">Doğruluk Oranı</h2>
                  <p className="text-3xl font-bold text-gray-900">{stats.accuracy}%</p>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div 
                      className="bg-orange-600 h-2 rounded-full transition-all duration-500" 
                      style={{ width: `${stats.accuracy}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Filters */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300 animate-slide-up stagger-4">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
              <FilterIcon className="h-5 w-5 text-indigo-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Filtreler ve Arama</h2>
              <p className="text-sm text-gray-600">Kayıtlarınızı filtreleyerek analiz edin</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Enhanced Search */}
            <div className="relative group">
              <SearchIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-indigo-600 transition-colors" />
              <input
                type="text"
                placeholder="Konu veya ders ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-modern pl-12 h-12 text-base focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
              />
              {searchTerm && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                  {filteredRecords.length} sonuç
                </div>
              )}
            </div>

            {/* Subject Filter */}
            <div className="relative group">
              <BookOpenIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-indigo-600 transition-colors" />
              <select
                value={filters.subject}
                onChange={(e) => setFilters({...filters, subject: e.target.value})}
                className="input-modern pl-12 h-12 text-base focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 appearance-none cursor-pointer"
              >
                <option value="all">📚 Tüm Dersler</option>
                {subjects.map(subject => (
                  <option key={subject.value} value={subject.value}>
                    {subject.label}
                  </option>
                ))}
              </select>
              <ChevronRightIcon className="absolute right-4 top-1/2 transform -translate-y-1/2 rotate-90 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>


            {/* Date Range Filter */}
            <div className="relative group">
              <CalendarIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-indigo-600 transition-colors" />
              <select
                value={filters.dateRange}
                onChange={(e) => setFilters({...filters, dateRange: e.target.value})}
                className="input-modern pl-12 h-12 text-base focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 appearance-none cursor-pointer"
              >
                <option value="7">📅 Son 7 gün</option>
                <option value="30">📅 Son 30 gün</option>
                <option value="90">📅 Son 3 ay</option>
                <option value="365">📅 Son 1 yıl</option>
                <option value="all">📅 Tümü</option>
              </select>
              <ChevronRightIcon className="absolute right-4 top-1/2 transform -translate-y-1/2 rotate-90 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Enhanced Study Records */}
        <div className="card-modern shadow-lg border-gray-100 animate-slide-up stagger-5">
          <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-indigo-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                  <BookOpenIcon className="h-5 w-5 text-indigo-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    Çalışma Kayıtları ({filteredRecords.length})
                  </h2>
                  <p className="text-sm text-gray-600">Detaylı çalışma analizi</p>
                </div>
              </div>
              {filteredRecords.length > 0 && (
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                  Güncel veriler
                </div>
              )}
            </div>
          </div>

          {filteredRecords.length === 0 ? (
            <div className="p-16 text-center">
              <div className="w-20 h-20 bg-gray-100 rounded-full mx-auto mb-6 flex items-center justify-center">
                <BookOpenIcon className="h-10 w-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                {searchTerm ? 'Kayıt bulunamadı' : 'Henüz çalışma kaydı yok'}
              </h3>
              <p className="text-gray-500 mb-6 max-w-md mx-auto">
                {searchTerm 
                  ? 'Arama kriterlerinize uygun kayıt bulunamadı. Farklı filtreler deneyin.'
                  : 'İlk çalışma kaydınızı ekleyerek performansınızı takip etmeye başlayın.'
                }
              </p>
            </div>
          ) : (
            <div className="p-6">
              <div className="space-y-4">
                {filteredRecords.map((record, index) => (
                  <div key={record.id} className={`bg-white rounded-xl border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all duration-200 p-6 group animate-slide-up stagger-${Math.min(index + 1, 6)}`}>
                    <div className="flex items-center justify-between">
                      {/* Record Info */}
                      <div className="flex items-center space-x-4 flex-1">
                        <div className="relative">
                          <div className={`h-14 w-14 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-sm ${
                            record.accuracy >= 80 ? 'bg-gradient-to-br from-green-500 to-green-600' :
                            record.accuracy >= 60 ? 'bg-gradient-to-br from-blue-500 to-blue-600' :
                            record.accuracy >= 40 ? 'bg-gradient-to-br from-yellow-500 to-yellow-600' :
                            'bg-gradient-to-br from-red-500 to-red-600'
                          }`}>
                            {record.subject.charAt(0).toUpperCase()}
                          </div>
                          {record.accuracy >= 80 && (
                            <div className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-400 rounded-full flex items-center justify-center">
                              <StarIcon className="h-3 w-3 text-yellow-800" />
                            </div>
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="flex items-center gap-3 mb-2">
                                <h3 className="text-lg font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors capitalize">
                                  {subjects.find(s => s.value === record.subject)?.label || record.subject}
                                </h3>
                                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${getStudyTypeDisplay(record).color}`}>
                                  {getStudyTypeDisplay(record).label}
                                </span>
                              </div>
                              <p className="text-gray-600 mb-3 font-medium">{record.topic || 'Konu belirtilmemiş'}</p>
                              
                              {/* Study Metrics */}
                              <div className="flex items-center gap-6 text-sm">
                                <div className="flex items-center gap-2">
                                  <CalendarIcon className="h-4 w-4 text-gray-400" />
                                  <span className="text-gray-600">{formatDate(record.date)}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <ClockIcon className="h-4 w-4 text-blue-500" />
                                  <span className="font-medium text-gray-900">{formatTime(record.duration_minutes)}</span>
                                </div>
                                {record.questions_solved > 0 && (
                                  <div className="flex items-center gap-2">
                                    <TargetIcon className="h-4 w-4 text-purple-500" />
                                    <span className="font-medium text-gray-900">
                                      {record.correct_answers}/{record.questions_solved}
                                    </span>
                                    <span className="text-xs text-gray-500">
                                      ({Math.round((record.correct_answers / record.questions_solved) * 100)}%)
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            {/* Performance Badge */}
                            {record.questions_solved > 0 && (
                              <div className="text-right">
                                {(() => {
                                  const accuracy = Math.round((record.correct_answers / record.questions_solved) * 100);
                                  return (
                                    <div className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold ${
                                      accuracy >= 80 ? 'bg-green-100 text-green-800 border border-green-200' :
                                      accuracy >= 60 ? 'bg-blue-100 text-blue-800 border border-blue-200' :
                                      accuracy >= 40 ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' :
                                      'bg-red-100 text-red-800 border border-red-200'
                                    }`}>
                                      {accuracy >= 80 ? '🏆 Mükemmel' :
                                       accuracy >= 60 ? '👍 İyi' :
                                       accuracy >= 40 ? '👌 Orta' : '📚 Geliştirilmeli'}
                                    </div>
                                  );
                                })()}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {/* Action Buttons */}
                      <div className="ml-6 flex items-center gap-2">
                        <button
                          onClick={() => setSelectedRecord(record)}
                          className="p-3 rounded-xl bg-indigo-50 text-indigo-600 hover:bg-indigo-100 hover:text-indigo-700 transition-all duration-200 hover:scale-105 group/btn"
                          title="Detayları Görüntüle"
                        >
                          <EyeIcon className="h-5 w-5 group-hover/btn:scale-110 transition-transform" />
                        </button>
                        <button
                          onClick={() => handleEditRecord(record)}
                          className="p-3 rounded-xl bg-orange-50 text-orange-600 hover:bg-orange-100 hover:text-orange-700 transition-all duration-200 hover:scale-105 group/btn"
                          title="Düzenle"
                        >
                          <EditIcon className="h-5 w-5 group-hover/btn:scale-110 transition-transform" />
                        </button>
                        <button
                          onClick={() => handleDeleteRecord(record)}
                          disabled={deletingId === record.id}
                          className="p-3 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 transition-all duration-200 hover:scale-105 group/btn disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Sil"
                        >
                          {deletingId === record.id ? (
                            <div className="h-5 w-5 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                          ) : (
                            <TrashIcon className="h-5 w-5 group-hover/btn:scale-110 transition-transform" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
        )}
      </div>

        {/* Enhanced Record Detail Modal */}
        {selectedRecord && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
            <div className="relative w-full max-w-2xl bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/20 animate-fade-in">
              <div className="p-8">
                {/* Modal Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold shadow-sm ${
                      selectedRecord.accuracy >= 80 ? 'bg-gradient-to-br from-green-500 to-green-600' :
                      selectedRecord.accuracy >= 60 ? 'bg-gradient-to-br from-blue-500 to-blue-600' :
                      selectedRecord.accuracy >= 40 ? 'bg-gradient-to-br from-yellow-500 to-yellow-600' :
                      'bg-gradient-to-br from-red-500 to-red-600'
                    }`}>
                      {selectedRecord.subject.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900">Çalışma Detayları</h3>
                      <p className="text-gray-600">Detaylı performans analizi</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedRecord(null);
                      // Remove the record parameter from URL
                      const searchParams = new URLSearchParams(location.search);
                      searchParams.delete('record');
                      const newUrl = searchParams.toString() 
                        ? `${location.pathname}?${searchParams.toString()}`
                        : location.pathname;
                      navigate(newUrl, { replace: true });
                    }}
                    className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-all duration-200 hover:scale-110"
                  >
                    <XCircleIcon className="h-6 w-6" />
                  </button>
                </div>
                
                {/* Modal Content */}
                <div className="space-y-6">
                  {/* Basic Info */}
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Temel Bilgiler</h4>
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-500">📚 Ders</label>
                        <p className="text-lg font-semibold text-gray-900 capitalize">{selectedRecord.subject}</p>
                      </div>
                      <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-500">🎯 Çalışma Türü</label>
                        <p className="text-lg font-semibold text-gray-900">
                          {getStudyTypeDisplay(selectedRecord).label}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-500">⏱️ Süre</label>
                        <p className="text-lg font-semibold text-gray-900">{formatTime(selectedRecord.duration_minutes)}</p>
                      </div>
                      <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-500">📅 Tarih</label>
                        <p className="text-lg font-semibold text-gray-900">{formatDate(selectedRecord.date)}</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Topic */}
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-100">
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">📖 Konu</h4>
                    <p className="text-lg text-gray-900 font-medium">{selectedRecord.topic}</p>
                  </div>
                  
                  {/* Performance Analysis */}
                  {selectedRecord.questions_solved > 0 && (
                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-100">
                      <h4 className="text-lg font-semibold text-gray-900 mb-4">📊 Performans Analizi</h4>
                      <div className="grid grid-cols-3 gap-6">
                        <div className="text-center p-4 bg-white rounded-lg border border-purple-200">
                          <div className="text-2xl font-bold text-gray-900">{selectedRecord.questions_solved}</div>
                          <div className="text-sm text-gray-600">Toplam Soru</div>
                        </div>
                        <div className="text-center p-4 bg-white rounded-lg border border-green-200">
                          <div className="text-2xl font-bold text-green-700">{selectedRecord.correct_answers}</div>
                          <div className="text-sm text-gray-600">Doğru Cevap</div>
                        </div>
                        <div className="text-center p-4 bg-white rounded-lg border border-blue-200">
                          <div className="text-2xl font-bold text-blue-700">
                            {Math.round((selectedRecord.correct_answers / selectedRecord.questions_solved) * 100)}%
                          </div>
                          <div className="text-sm text-gray-600">Başarı Oranı</div>
                        </div>
                      </div>
                      
                      {/* Performance Bar */}
                      <div className="mt-4">
                        <div className="flex items-center justify-between text-sm mb-2">
                          <span className="text-gray-600">Başarı Seviyesi</span>
                          <span className="font-semibold text-gray-900">
                            {Math.round((selectedRecord.correct_answers / selectedRecord.questions_solved) * 100)}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          {(() => {
                            const accuracy = Math.round((selectedRecord.correct_answers / selectedRecord.questions_solved) * 100);
                            return (
                              <div 
                                className={`h-3 rounded-full transition-all duration-500 ${
                                  accuracy >= 80 ? 'bg-gradient-to-r from-green-500 to-green-600' :
                                  accuracy >= 60 ? 'bg-gradient-to-r from-blue-500 to-blue-600' :
                                  accuracy >= 40 ? 'bg-gradient-to-r from-yellow-500 to-yellow-600' :
                                  'bg-gradient-to-r from-red-500 to-red-600'
                                }`}
                                style={{ width: `${accuracy}%` }}
                              ></div>
                            );
                          })()}
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Notes */}
                  {selectedRecord.notes && (
                    <div className="bg-gradient-to-r from-amber-50 to-yellow-50 rounded-xl p-6 border border-amber-100">
                      <h4 className="text-lg font-semibold text-gray-900 mb-3">📝 Notlar</h4>
                      <div className="bg-white p-4 rounded-lg border border-amber-200">
                        <p className="text-gray-900 leading-relaxed">{selectedRecord.notes}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Enhanced Delete Confirmation Modal */}
        {recordToDelete && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
            <div className="relative w-full max-w-md bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/20 animate-fade-in">
              <div className="p-8 text-center">
                {/* Warning Icon */}
                <div className="w-20 h-20 mx-auto mb-6 bg-red-100 rounded-full flex items-center justify-center">
                  <div className="w-16 h-16 bg-red-200 rounded-full flex items-center justify-center">
                    <TrashIcon className="h-8 w-8 text-red-600" />
                  </div>
                </div>
                
                {/* Title */}
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  Çalışma Kaydını Sil
                </h3>
                
                {/* Description */}
                <div className="mb-6">
                  <p className="text-gray-600 mb-4">
                    Bu çalışma kaydını silmek istediğinize emin misiniz?
                  </p>
                  
                  {/* Record Details */}
                  <div className="bg-gray-50 rounded-lg p-4 text-left">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                        <BookOpenIcon className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <span className="font-semibold text-gray-900">
                          {subjects.find(s => s.value === recordToDelete.subject)?.label || recordToDelete.subject}
                        </span>
                        {recordToDelete.topic && (
                          <span className="text-gray-500 ml-2">- {recordToDelete.topic}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600 mt-3">
                      <div className="flex items-center gap-1">
                        <CalendarIcon className="h-4 w-4" />
                        <span>{formatDate(recordToDelete.date)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <ClockIcon className="h-4 w-4" />
                        <span>{formatTime(recordToDelete.duration_minutes)}</span>
                      </div>
                      {recordToDelete.questions_solved > 0 && (
                        <div className="flex items-center gap-1">
                          <TargetIcon className="h-4 w-4" />
                          <span>{recordToDelete.questions_solved} soru</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <p className="text-red-600 text-sm mt-4 font-medium">
                    ⚠️ Bu işlem geri alınamaz!
                  </p>
                </div>
                
                {/* Actions */}
                <div className="flex gap-3">
                  <button
                    onClick={cancelDelete}
                    disabled={deletingId === recordToDelete.id}
                    className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-all duration-200 hover:scale-105 disabled:opacity-50"
                  >
                    İptal
                  </button>
                  <button
                    onClick={confirmDelete}
                    disabled={deletingId === recordToDelete.id}
                    className="flex-1 px-6 py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {deletingId === recordToDelete.id ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Siliniyor...</span>
                      </div>
                    ) : (
                      'Evet, Sil'
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        </div>
      </div>
    </div>
  );
};

export default StudyHistory;