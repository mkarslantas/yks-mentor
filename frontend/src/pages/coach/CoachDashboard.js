import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { coachService } from '../../services/coach.service';
import { 
  UsersIcon, 
  CalendarIcon,
  BarChart3Icon,
  UserIcon,
  StarIcon,
  ClockIcon,
  BookOpenIcon,
  TrophyIcon,
  PhoneIcon,
  MailIcon,
  TrashIcon,
  AlertTriangleIcon
} from 'lucide-react';
import Loading from '../../components/common/Loading';
import EmptyState from '../../components/common/EmptyState';

const CoachDashboard = () => {
  const { user } = useAuth();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, student: null });
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoading(true);
        
        // Gerçek API çağrısı
        const response = await coachService.getStudents();
        
        // Response formatını kontrol et
        if (response.success && response.data) {
          setStudents(response.data || []);
        } else {
          setStudents([]);
        }
      } catch (err) {
        console.error('Students fetch error:', err);
        setError('Öğrenci listesi yüklenirken hata oluştu');
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, []);

  const formatTime = (minutes) => {
    if (!minutes) return '0 dk';
    if (minutes < 60) return `${minutes} dk`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}s ${mins}dk` : `${hours} saat`;
  };

  const getFieldName = (field) => {
    switch(field) {
      case 'sayisal': return 'Sayısal';
      case 'sozel': return 'Sözel';
      case 'esit_agirlik': return 'Eşit Ağırlık';
      default: return field;
    }
  };

  const getLastActivityText = (lastActivity) => {
    if (!lastActivity) return 'Henüz yok';
    const now = new Date();
    const activity = new Date(lastActivity);
    const diffHours = Math.floor((now - activity) / (1000 * 60 * 60));
    
    if (diffHours < 1) return 'Az önce aktif';
    if (diffHours < 24) return `${diffHours} saat önce`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays} gün önce`;
    return activity.toLocaleDateString('tr-TR');
  };

  const openDeleteModal = (student) => {
    setDeleteModal({ isOpen: true, student });
  };

  const closeDeleteModal = () => {
    setDeleteModal({ isOpen: false, student: null });
  };

  const handleDeleteStudent = async () => {
    if (!deleteModal.student) return;
    
    try {
      setDeleteLoading(true);
      setError(null); // Önceki hataları temizle
      
      console.log('🗑️ Starting delete for student:', deleteModal.student.id);
      const response = await coachService.deleteStudent(deleteModal.student.id);
      console.log('🗑️ Delete response:', response);
      
      // Sadece başarılı response'da state güncelle
      if (response && response.success) {
        // Öğrenci listesinden çıkar
        setStudents(prev => prev.filter(s => s.id !== deleteModal.student.id));
        
        // Başarı mesajı göster
        console.log(`✅ Öğrenci "${deleteModal.student.name}" başarıyla silindi`);
        
        closeDeleteModal();
      } else {
        throw new Error('Silme işlemi başarısız oldu');
      }
    } catch (err) {
      console.error('❌ Delete student error:', err);
      
      let errorMessage = 'Öğrenci silinirken hata oluştu';
      
      // Farklı hata türlerini yakala
      if (err && typeof err === 'object') {
        if (err.message && typeof err.message === 'string') {
          errorMessage = err.message;
        } else if (err.toString && typeof err.toString === 'function') {
          errorMessage = err.toString();
        }
      } else if (typeof err === 'string') {
        errorMessage = err;
      }
      
      setError(`Öğrenci silinirken hata oluştu: ${errorMessage}`);
    } finally {
      setDeleteLoading(false);
    }
  };

  if (loading) return <Loading />;

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <p className="text-red-800">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
              {(() => {
                const hour = new Date().getHours();
                if (hour < 12) return 'Günaydın';
                if (hour < 18) return 'İyi günler';
                return 'İyi akşamlar';
              })()} {user?.name?.split(' ')[0]}!
            </h1>
            <p className="text-gray-600">
              {students.length > 0 
                ? `${students.length} öğrencinizin performansını takip ediyorsunuz`
                : 'Henüz öğrenci bulunmuyor'
              }
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
              <TrophyIcon className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Students Grid */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center">
            <UsersIcon className="h-5 w-5 mr-2 text-gray-600" />
            Öğrencilerim ({students.length})
          </h2>
        </div>
        
        <div className="p-6">
          {students.length > 0 ? (
            <div className="grid grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3 gap-6">
              {students.map((student) => (
                <div key={student.id} className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border-2 border-gray-200 p-6 hover:shadow-lg hover:border-blue-300 transition-all duration-200">
                  {/* Student Header */}
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
                        <UserIcon className="h-8 w-8 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">{student.name}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <StarIcon className="h-4 w-4 text-yellow-500" />
                          <span className="text-sm text-gray-600">
                            {student.grade_level}. Sınıf - {getFieldName(student.target_field)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Contact Info */}
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-3 text-sm text-gray-700">
                      <MailIcon className="h-4 w-4 text-gray-500" />
                      <span>{student.email}</span>
                    </div>
                    {student.phone && (
                      <div className="flex items-center gap-3 text-sm text-gray-700">
                        <PhoneIcon className="h-4 w-4 text-gray-500" />
                        <span>{student.phone}</span>
                      </div>
                    )}
                    {student.school_name && (
                      <div className="flex items-center gap-3 text-sm text-gray-700">
                        <BookOpenIcon className="h-4 w-4 text-gray-500" />
                        <span>{student.school_name}</span>
                      </div>
                    )}
                  </div>

                  {/* Performance Stats */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                      <div className="flex items-center gap-2 mb-1">
                        <ClockIcon className="h-4 w-4 text-blue-600" />
                        <span className="text-xs font-medium text-gray-600">Toplam Çalışma</span>
                      </div>
                      <p className="text-lg font-bold text-gray-900">
                        {formatTime(student.total_study_time)}
                      </p>
                    </div>
                    
                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                      <div className="flex items-center gap-2 mb-1">
                        <BookOpenIcon className="h-4 w-4 text-green-600" />
                        <span className="text-xs font-medium text-gray-600">Çözülen Soru</span>
                      </div>
                      <p className="text-lg font-bold text-gray-900">
                        {student.total_questions || 0}
                      </p>
                    </div>
                    
                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                      <div className="flex items-center gap-2 mb-1">
                        <TrophyIcon className="h-4 w-4 text-purple-600" />
                        <span className="text-xs font-medium text-gray-600">Başarı Oranı</span>
                      </div>
                      <p className="text-lg font-bold text-gray-900">
                        %{student.accuracy_rate || 0}
                      </p>
                    </div>
                    
                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                      <div className="flex items-center gap-2 mb-1">
                        <StarIcon className="h-4 w-4 text-orange-500" />
                        <span className="text-xs font-medium text-gray-600">Çalışma Serisi</span>
                      </div>
                      <p className="text-lg font-bold text-gray-900">
                        {student.current_streak || 0} gün
                      </p>
                    </div>
                  </div>

                  {/* Last Activity */}
                  <div className="mb-6 pb-4 border-b border-gray-200">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Son Aktivite:</span>
                      <span className="font-medium text-gray-900">
                        {getLastActivityText(student.lastActivity)}
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <Link
                        to={`/coach/student/${student.id}/tasks`}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg font-medium text-center flex items-center justify-center gap-2 transition-colors duration-200"
                      >
                        <CalendarIcon className="h-4 w-4" />
                        Görev Takvimi
                      </Link>
                      
                      <Link
                        to={`/coach/student/${student.id}/statistics`}
                        className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-3 rounded-lg font-medium text-center flex items-center justify-center gap-2 transition-colors duration-200"
                      >
                        <BarChart3Icon className="h-4 w-4" />
                        İstatistikler
                      </Link>
                    </div>
                    
                    <button
                      onClick={() => openDeleteModal(student)}
                      className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-3 rounded-lg font-medium text-center flex items-center justify-center gap-2 transition-colors duration-200"
                    >
                      <TrashIcon className="h-4 w-4" />
                      Öğrenciyi Sil
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              type="students"
              title="Henüz öğrenci bulunmuyor"
              description="Sistem yöneticisi tarafından size öğrenci atandığında burada görünecekler"
              size="lg"
            />
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModal.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md mx-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangleIcon className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Öğrenciyi Sil</h3>
                <p className="text-sm text-gray-600">Bu işlem geri alınamaz</p>
              </div>
            </div>
            
            <div className="mb-6">
              <p className="text-gray-700">
                <strong>{deleteModal.student?.name}</strong> adlı öğrenciyi ve tüm verilerini 
                (çalışma kayıtları, görevler, sınavlar) silmek istediğinizden emin misiniz?
              </p>
              <p className="text-sm text-red-600 mt-2">
                ⚠️ Bu işlem geri alınamaz ve tüm veriler kalıcı olarak silinir.
              </p>
            </div>
            
            <div className="flex gap-3 justify-end">
              <button
                onClick={closeDeleteModal}
                disabled={deleteLoading}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors disabled:opacity-50"
              >
                İptal
              </button>
              <button
                onClick={handleDeleteStudent}
                disabled={deleteLoading}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {deleteLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Siliniyor...
                  </>
                ) : (
                  <>
                    <TrashIcon className="h-4 w-4" />
                    Evet, Sil
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CoachDashboard;