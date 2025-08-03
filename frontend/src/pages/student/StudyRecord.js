import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  BookOpenIcon,
  ClockIcon,
  TargetIcon,
  TrendingUpIcon,
  CalendarIcon,
  PlusIcon,
  FilterIcon,
  SearchIcon,
  BarChart3Icon,
  ArrowRightIcon,
  CheckCircleIcon,
  XCircleIcon,
  StarIcon,
  TimerIcon,
  EyeIcon,
  DownloadIcon,
  RefreshCwIcon
} from 'lucide-react';
import { studentService } from '../../services/student.service';
import Loading from '../../components/common/Loading';

const StudyRecord = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ subject: 'all', timeRange: '30' });
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  // Mock data - gerçek uygulamada API'den gelecek
  const mockRecords = [
    {
      id: 1,
      date: '2024-01-15',
      subject: 'matematik',
      topic: 'Türev ve Uygulamaları',
      duration: 90,
      questions_solved: 25,
      correct_answers: 20,
      wrong_answers: 4,
      empty_answers: 1,
      study_type: 'soru_cozumu',
      notes: 'Zincir kuralı konusunda zorlandım, tekrar çalışmam gerekiyor.',
      accuracy: 80
    },
    {
      id: 2,
      date: '2024-01-14',
      subject: 'fizik',
      topic: 'Elektrik ve Manyetizma',
      duration: 75,
      questions_solved: 18,
      correct_answers: 15,
      wrong_answers: 2,
      empty_answers: 1,
      study_type: 'konu_calismasi',
      notes: 'Elektrik alan hesapları çok iyi geçti.',
      accuracy: 83
    },
    {
      id: 3,
      date: '2024-01-13',
      subject: 'kimya',
      topic: 'Organik Kimya',
      duration: 60,
      questions_solved: 20,
      correct_answers: 12,
      wrong_answers: 6,
      empty_answers: 2,
      study_type: 'tekrar',
      notes: 'İsimlendirme kurallarını tekrar etmem gerek.',
      accuracy: 60
    },
    {
      id: 4,
      date: '2024-01-12',
      subject: 'biyoloji',
      topic: 'Genetik',
      duration: 45,
      questions_solved: 15,
      correct_answers: 13,
      wrong_answers: 2,
      empty_answers: 0,
      study_type: 'deneme_sinavi',
      notes: 'Genetik problemleri çok iyi gitti.',
      accuracy: 87
    }
  ];

  useEffect(() => {
    const fetchRecords = async () => {
      try {
        // const data = await studentService.getStudyRecords(filter);
        // setRecords(data);
        setRecords(mockRecords);
      } catch (error) {
        console.error('Study records fetch error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecords();
  }, [filter]);

  const formatTime = (minutes) => {
    if (minutes < 60) return `${minutes} dk`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}s ${mins}dk` : `${hours} saat`;
  };

  const getSubjectName = (subject) => {
    const subjects = {
      matematik: 'Matematik',
      fizik: 'Fizik',
      kimya: 'Kimya',
      biyoloji: 'Biyoloji',
      turkce: 'Türkçe',
      tarih: 'Tarih',
      cografya: 'Coğrafya'
    };
    return subjects[subject] || subject;
  };

  const getStudyTypeName = (type) => {
    const types = {
      konu_calismasi: 'Konu Çalışması',
      soru_cozumu: 'Soru Çözümü',
      tekrar: 'Tekrar',
      deneme_sinavi: 'Deneme Sınavı'
    };
    return types[type] || type;
  };

  const getAccuracyColor = (accuracy) => {
    if (accuracy >= 80) return 'text-green-600 bg-green-50 border-green-200';
    if (accuracy >= 65) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const filteredRecords = records.filter(record => {
    const matchesSubject = filter.subject === 'all' || record.subject === filter.subject;
    const matchesSearch = record.topic.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         getSubjectName(record.subject).toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSubject && matchesSearch;
  });

  const totalStudyTime = filteredRecords.reduce((sum, record) => sum + record.duration, 0);
  const totalQuestions = filteredRecords.reduce((sum, record) => sum + record.questions_solved, 0);
  const averageAccuracy = filteredRecords.length > 0 
    ? Math.round(filteredRecords.reduce((sum, record) => sum + record.accuracy, 0) / filteredRecords.length)
    : 0;

  if (loading) return <Loading />;

  return (
    <div>
      <div className="space-y-8 p-6">
        {/* Enhanced Header */}
        <div className="bg-blue-600 rounded-xl shadow-lg p-8 text-white">
          <div>
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center">
                    <BookOpenIcon className="h-8 w-8 text-blue-200" />
                  </div>
                  <div>
                    <h1 className="text-3xl lg:text-4xl font-bold mb-2">
                      Çalışma Kayıtları 📚
                    </h1>
                    <p className="text-blue-100 text-lg">
                      Çalışma geçmişinizi inceleyin ve analiz edin
                    </p>
                  </div>
                </div>
                
                {/* Quick Stats */}
                <div className="flex items-center gap-6 mt-6">
                  <div className="flex items-center gap-2">
                    <ClockIcon className="h-5 w-5 text-blue-200" />
                    <span className="text-sm text-blue-100">
                      {formatTime(totalStudyTime)} toplam
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <TargetIcon className="h-5 w-5 text-green-200" />
                    <span className="text-sm text-blue-100">
                      {totalQuestions} soru çözüldü
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <TrendingUpIcon className="h-5 w-5 text-yellow-200" />
                    <span className="text-sm text-blue-100">
                      %{averageAccuracy} ortalama başarı
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Action Button */}
              <div className="lg:ml-8">
                <Link
                  to="/study/add"
                  className="inline-flex items-center gap-3 bg-white/20 hover:bg-white/30 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200 border border-white/30"
                >
                  <PlusIcon className="h-5 w-5" />
                  Yeni Kayıt Ekle
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Konu veya ders ara..."
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            {/* Subject Filter */}
            <div className="lg:w-48">
              <select
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none cursor-pointer"
                value={filter.subject}
                onChange={(e) => setFilter({...filter, subject: e.target.value})}
              >
                <option value="all">Tüm Dersler</option>
                <option value="matematik">Matematik</option>
                <option value="fizik">Fizik</option>
                <option value="kimya">Kimya</option>
                <option value="biyoloji">Biyoloji</option>
                <option value="turkce">Türkçe</option>
              </select>
            </div>
            
            {/* Time Range Filter */}
            <div className="lg:w-40">
              <select
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none cursor-pointer"
                value={filter.timeRange}
                onChange={(e) => setFilter({...filter, timeRange: e.target.value})}
              >
                <option value="7">Son 7 gün</option>
                <option value="30">Son 30 gün</option>
                <option value="90">Son 3 ay</option>
              </select>
            </div>
          </div>
        </div>

        {/* Records List */}
        <div className="space-y-4">
          {filteredRecords.length === 0 ? (
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-12 text-center">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <BookOpenIcon className="h-12 w-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Henüz kayıt yok</h3>
              <p className="text-gray-600 mb-6">
                İlk çalışma kaydınızı ekleyerek başlayın
              </p>
              <Link
                to="/study/add"
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200"
              >
                <PlusIcon className="h-5 w-5" />
                Kayıt Ekle
              </Link>
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredRecords.map((record, index) => (
                <div
                  key={record.id}
                  className="bg-white rounded-xl shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300 group"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                      {/* Left Section - Basic Info */}
                      <div className="flex-1">
                        <div className="flex items-start gap-4 mb-4">
                          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                            <BookOpenIcon className="h-6 w-6 text-blue-600" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-lg font-bold text-gray-900">{record.topic}</h3>
                              <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                                {getSubjectName(record.subject)}
                              </span>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                              <div className="flex items-center gap-1">
                                <CalendarIcon className="h-4 w-4" />
                                {new Date(record.date).toLocaleDateString('tr-TR')}
                              </div>
                              <div className="flex items-center gap-1">
                                <ClockIcon className="h-4 w-4" />
                                {formatTime(record.duration)}
                              </div>
                              <div className="flex items-center gap-1">
                                <TargetIcon className="h-4 w-4" />
                                {getStudyTypeName(record.study_type)}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Notes */}
                        {record.notes && (
                          <div className="bg-gray-50 rounded-lg p-3 mt-4">
                            <p className="text-sm text-gray-700 italic">"{record.notes}"</p>
                          </div>
                        )}
                      </div>

                      {/* Right Section - Performance */}
                      <div className="lg:w-80">
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                          {/* Accuracy */}
                          <div className={`p-3 rounded-lg border text-center ${getAccuracyColor(record.accuracy)}`}>
                            <div className="text-lg font-bold">{record.accuracy}%</div>
                            <div className="text-xs">Başarı</div>
                          </div>

                          {/* Questions */}
                          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-center">
                            <div className="text-lg font-bold text-blue-700">{record.questions_solved}</div>
                            <div className="text-xs text-blue-600">Soru</div>
                          </div>

                          {/* Correct */}
                          <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-center">
                            <div className="text-lg font-bold text-green-700">{record.correct_answers}</div>
                            <div className="text-xs text-green-600">Doğru</div>
                          </div>

                          {/* Wrong */}
                          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-center">
                            <div className="text-lg font-bold text-red-700">{record.wrong_answers}</div>
                            <div className="text-xs text-red-600">Yanlış</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link
            to="/study/add"
            className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-lg transition-all duration-300 group text-center"
          >
            <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-200">
              <PlusIcon className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Yeni Kayıt</h3>
            <p className="text-gray-600 text-sm">Bugünkü çalışmanızı kaydedin</p>
          </Link>

          <Link
            to="/statistics"
            className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-lg transition-all duration-300 group text-center"
          >
            <div className="w-16 h-16 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-200">
              <BarChart3Icon className="h-8 w-8 text-purple-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">İstatistikler</h3>
            <p className="text-gray-600 text-sm">Detaylı analiz görüntüleyin</p>
          </Link>

          <Link
            to="/study/timer"
            className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-lg transition-all duration-300 group text-center"
          >
            <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-200">
              <TimerIcon className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Zamanlayıcı</h3>
            <p className="text-gray-600 text-sm">Pomodoro ile çalışın</p>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default StudyRecord;