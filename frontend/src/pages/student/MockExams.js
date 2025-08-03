import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { 
  TrophyIcon, 
  CalendarIcon, 
  PlusIcon, 
  TrashIcon, 
  EditIcon,
  BarChart3Icon 
} from 'lucide-react';
import { studentService } from '../../services/student.service';
import Loading from '../../components/common/Loading';

const MockExams = () => {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);

  useEffect(() => {
    fetchExams();
  }, []);

  const fetchExams = async () => {
    try {
      setLoading(true);
      const data = await studentService.getMockExams();
      setExams(data || []);
    } catch (error) {
      console.error('Mock exams fetch error:', error);
      toast.error('Deneme sınavları yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (examId) => {
    if (!window.confirm('Bu deneme sınavını silmek istediğinize emin misiniz?')) {
      return;
    }

    try {
      setDeleting(examId);
      await studentService.deleteMockExam(examId);
      toast.success('Deneme sınavı başarıyla silindi');
      fetchExams(); // Listeyi yenile
    } catch (error) {
      console.error('Mock exam delete error:', error);
      console.error('Error response:', error.response);
      const errorMessage = error.response?.data?.error?.message || 
                          error.response?.data?.message || 
                          'Deneme sınavı silinirken hata oluştu';
      toast.error(errorMessage);
    } finally {
      setDeleting(null);
    }
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const calculateTotalNet = (exam) => {
    if (exam.exam_type === 'TYT') {
      return (
        (exam.turkce_net || 0) +
        (exam.matematik_net || 0) +
        (exam.sosyal_net || 0) +
        (exam.fen_net || 0)
      ).toFixed(2);
    } else {
      return (
        (exam.matematik_ayt_net || 0) +
        (exam.fizik_net || 0) +
        (exam.kimya_net || 0) +
        (exam.biyoloji_net || 0) +
        (exam.edebiyat_net || 0) +
        (exam.tarih_net || 0) +
        (exam.cografya_net || 0) +
        (exam.dil_net || 0)
      ).toFixed(2);
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 pt-6">
        <div className="space-y-6">
      {/* Modern Purple Gradient Header */}
      <div className="bg-gradient-to-r from-purple-600 via-purple-500 to-blue-500 rounded-2xl mb-8">
        <div className="p-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/30">
                <TrophyIcon className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">
                  Deneme Sınavlarım
                </h1>
                <p className="text-purple-100 text-base">
                  Tüm deneme sınav sonuçlarınızı görüntüleyin ve performansınızı analiz edin
                </p>
              </div>
            </div>
            <Link
              to="/exam/add"
              className="bg-white/20 backdrop-blur-sm border border-white/30 hover:bg-white/30 text-white px-6 py-3 rounded-xl transition-all duration-200 flex items-center gap-2"
            >
              <PlusIcon className="h-5 w-5" />
              Yeni Deneme Ekle
            </Link>
          </div>
        </div>
      </div>

      {/* Exams List */}
      {exams.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12">
          <div className="text-center">
            <TrophyIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Henüz deneme sınavı eklemediniz
            </h3>
            <p className="text-gray-500 mb-6">
              İlk deneme sınavınızı ekleyerek performansınızı takip etmeye başlayın.
            </p>
            <Link
              to="/exam/add"
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <PlusIcon className="h-5 w-5" />
              İlk Denemeyi Ekle
            </Link>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tarih
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sınav Tipi
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Toplam Net
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Detaylar
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  İşlemler
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {exams.map((exam) => (
                <tr key={exam.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <CalendarIcon className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-900">
                        {formatDate(exam.exam_date)}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      exam.exam_type === 'TYT' 
                        ? 'bg-blue-100 text-blue-800' 
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {exam.exam_type}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 font-medium">
                      {calculateTotalNet(exam)} net
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-500">
                      {exam.exam_type === 'TYT' ? (
                        <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                          <span>Türkçe: {exam.turkce_net || 0}</span>
                          <span>Matematik: {exam.matematik_net || 0}</span>
                          <span>Sosyal: {exam.sosyal_net || 0}</span>
                          <span>Fen: {exam.fen_net || 0}</span>
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                          <span>Mat: {exam.matematik_ayt_net || 0}</span>
                          <span>Fiz: {exam.fizik_net || 0}</span>
                          <span>Kim: {exam.kimya_net || 0}</span>
                          <span>Bio: {exam.biyoloji_net || 0}</span>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        to="/statistics"
                        className="text-blue-600 hover:text-blue-900"
                        title="İstatistikleri Gör"
                      >
                        <BarChart3Icon className="h-5 w-5" />
                      </Link>
                      <Link
                        to={`/exam/edit/${exam.id}`}
                        className="text-orange-600 hover:text-orange-900"
                        title="Düzenle"
                      >
                        <EditIcon className="h-5 w-5" />
                      </Link>
                      <button
                        onClick={() => handleDelete(exam.id)}
                        disabled={deleting === exam.id}
                        className="text-red-600 hover:text-red-900 disabled:opacity-50"
                        title="Sil"
                      >
                        {deleting === exam.id ? (
                          <div className="spinner h-5 w-5"></div>
                        ) : (
                          <TrashIcon className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
        </div>
      </div>
    </div>
  );
};

export default MockExams;