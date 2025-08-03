import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { 
  CalendarIcon, 
  ClockIcon, 
  BookOpenIcon, 
  TargetIcon, 
  CheckCircleIcon,
  XCircleIcon,
  CircleIcon,
  TrendingUpIcon,
  FileTextIcon,
  SaveIcon,
  AlertTriangleIcon,
  HistoryIcon,
  TrashIcon,
  EditIcon
} from 'lucide-react';
import { studentService } from '../../services/student.service';

const AddStudyRecord = () => {
  const [loading, setLoading] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  
  const {
    control,
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors }
  } = useForm({
    defaultValues: {
      study_date: new Date().toISOString().split('T')[0],
      subject: 'matematik',
      topic: '',
      duration_minutes: 60,
      questions_solved: '',
      correct_answers: '',
      wrong_answers: '',
      empty_answers: 0,
      study_type: 'konu_calismasi',
      notes: ''
    }
  });

  const questionsTotal = parseInt(watch('questions_solved') || 0);
  const correctAnswers = parseInt(watch('correct_answers') || 0);
  const wrongAnswers = parseInt(watch('wrong_answers') || 0);
  const emptyAnswers = parseInt(watch('empty_answers') || 0);

  // Calculate remaining answers
  const remainingAnswers = Math.max(0, questionsTotal - correctAnswers - wrongAnswers - emptyAnswers);
  
  // Check if answers exceed total questions
  const answersExceedTotal = questionsTotal > 0 && (correctAnswers + wrongAnswers + emptyAnswers) > questionsTotal;
  const answersNotEqual = questionsTotal > 0 && (correctAnswers + wrongAnswers + emptyAnswers) !== questionsTotal;

  // Check for edit mode from URL or location state
  useEffect(() => {
    const editId = searchParams.get('edit');
    const stateRecord = location.state?.editingRecord;
    
    if (stateRecord) {
      handleEditRecord(stateRecord);
    } else if (editId) {
      // Fetch record by ID if we don't have it in state
      fetchRecordForEdit(editId);
    }
  }, [searchParams, location.state]);

  const fetchRecordForEdit = async (recordId) => {
    try {
      setLoading(true);
      // We could add a getStudyRecord endpoint, but for now let's get all records and find the one
      const records = await studentService.getStudyRecords();
      const record = records.find(r => r.id === parseInt(recordId));
      if (record) {
        handleEditRecord(record);
      } else {
        toast.error('Düzenlenecek kayıt bulunamadı');
        navigate('/study/history');
      }
    } catch (error) {
      console.error('Error fetching record for edit:', error);
      toast.error('Kayıt yüklenirken hata oluştu');
      navigate('/study/history');
    } finally {
      setLoading(false);
    }
  };

  // Auto-adjust empty answers when other values change
  React.useEffect(() => {
    if (questionsTotal > 0 && correctAnswers + wrongAnswers <= questionsTotal) {
      const newEmpty = questionsTotal - correctAnswers - wrongAnswers;
      if (newEmpty >= 0 && newEmpty !== emptyAnswers) {
        setValue('empty_answers', newEmpty);
      }
    }
  }, [questionsTotal, correctAnswers, wrongAnswers, setValue, emptyAnswers]);

  const subjects = [
    { value: 'matematik', label: 'Matematik' },
    { value: 'fizik', label: 'Fizik' },
    { value: 'kimya', label: 'Kimya' },
    { value: 'biyoloji', label: 'Biyoloji' },
    { value: 'turkce', label: 'Türkçe' },
    { value: 'tarih', label: 'Tarih' },
    { value: 'cografya', label: 'Coğrafya' },
    { value: 'felsefe', label: 'Felsefe' },
    { value: 'din', label: 'Din Kültürü' },
    { value: 'dil', label: 'Yabancı Dil' }
  ];

  const studyTypes = [
    { value: 'konu_calismasi', label: 'Konu Çalışması' },
    { value: 'soru_cozumu', label: 'Soru Çözümü' },
    { value: 'tekrar', label: 'Tekrar' },
    { value: 'deneme_sinavi', label: 'Deneme Sınavı' }
  ];


  const handleEditRecord = (record) => {
    setEditingRecord(record);
    
    // Form verilerini güncelle
    reset({
      study_date: record.date,
      subject: record.subject,
      topic: record.topic || '',
      duration_minutes: record.duration_minutes,
      questions_solved: record.questions_solved || '',
      correct_answers: record.correct_answers || '',
      wrong_answers: record.wrong_answers || '',
      empty_answers: record.empty_answers || 0,
      study_type: record.study_type || 'konu_calismasi',
      notes: record.notes || ''
    });
    
    // Sayfanın üstüne scroll yap
    window.scrollTo({ top: 0, behavior: 'smooth' });
    toast('Kayıt düzenleme moduna alındı');
  };

  const handleCancelEdit = () => {
    setEditingRecord(null);
    reset({
      study_date: new Date().toISOString().split('T')[0],
      subject: 'matematik',
      topic: '',
      duration_minutes: 60,
      questions_solved: '',
      correct_answers: '',
      wrong_answers: '',
      empty_answers: 0,
      study_type: 'konu_calismasi',
      notes: ''
    });
    toast('Düzenleme iptal edildi');
    navigate('/study/history');
  };

  const onSubmit = async (data) => {
    try {
      setLoading(true);

      // Transform data to match backend expectations
      const transformedData = {
        ...data,
        date: data.study_date, // Backend expects 'date' field
      };
      
      // Remove the study_date field
      delete transformedData.study_date;
      
      console.log('📤 Sending to backend:', transformedData);
      console.log('📝 Study type being sent:', transformedData.study_type);

      if (editingRecord) {
        // Update existing record
        console.log('📝 Updating record:', { id: editingRecord.id, data: transformedData });
        await studentService.updateStudyRecord(editingRecord.id, transformedData);
        toast.success('Çalışma kaydı başarıyla güncellendi!');
        setEditingRecord(null);
      } else {
        // Create new record
        await studentService.createStudyRecord(transformedData);
        toast.success('Çalışma kaydı başarıyla eklendi!');
      }
      
      if (!editingRecord) {
        navigate('/dashboard');
      } else {
        // Navigate back to study history after edit
        navigate('/study/history');
      }
    } catch (error) {
      console.error('Study record error:', error);
      console.error('Error details:', error.response?.data);
      const action = editingRecord ? 'güncellenirken' : 'eklenirken';
      toast.error(error.response?.data?.error?.message || `Çalışma kaydı ${action} hata oluştu`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 pt-6">
        {/* Modern Purple Gradient Header */}
        <div className="bg-gradient-to-r from-purple-600 via-purple-500 to-blue-500 rounded-2xl mb-8">
          <div className="p-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/30">
                  {editingRecord ? (
                    <EditIcon className="h-8 w-8 text-white" />
                  ) : (
                    <BookOpenIcon className="h-8 w-8 text-white" />
                  )}
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white">
                    {editingRecord ? 'Çalışma Kaydını Düzenle' : 'Çalışma Kaydı Ekle'}
                  </h1>
                  <p className="text-purple-100 mt-1">
                    {editingRecord 
                      ? 'Seçili kaydın bilgilerini güncelleyin' 
                      : 'Bugünkü çalışmanızı kaydedin ve ilerlemenizi takip edin'
                    }
                  </p>
                </div>
              </div>
              {editingRecord && (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="px-6 py-3 text-sm font-medium text-white bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl hover:bg-white/30 transition-all duration-200"
                >
                  Düzenlemeyi İptal Et
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100">
            <div className="p-8">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                {/* Basic Information Section */}
                <div className="bg-gray-50/50 rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                      <CalendarIcon className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">Temel Bilgiler</h3>
                      <p className="text-sm text-gray-600">Çalışma tarihi ve süresi</p>
                    </div>
                  </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      <CalendarIcon className="h-4 w-4 inline mr-2" />
                      Çalışma Tarihi
                    </label>
                    <input
                      type="date"
                      className={`w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 ${errors.study_date ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                      {...register('study_date', { required: 'Çalışma tarihi gerekli' })}
                    />
                    {errors.study_date && (
                      <p className="text-sm text-red-600 flex items-center gap-1 animate-slide-in-right">
                        <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                        {errors.study_date.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      <ClockIcon className="h-4 w-4 inline mr-2" />
                      Süre (dakika)
                    </label>
                    <input
                      type="number"
                      min="1"
                      placeholder="60"
                      className={`w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 ${errors.duration_minutes ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                      {...register('duration_minutes', { 
                        required: 'Çalışma süresi gerekli',
                        min: { value: 1, message: 'Süre en az 1 dakika olmalı' }
                      })}
                    />
                    {errors.duration_minutes && (
                      <p className="text-sm text-red-600 flex items-center gap-1 animate-slide-in-right">
                        <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                        {errors.duration_minutes.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Subject and Content Section */}
              <div className="bg-gray-50/50 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <BookOpenIcon className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Ders ve Konu</h3>
                    <p className="text-sm text-gray-600">Çalıştığınız alan ve detaylar</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      <BookOpenIcon className="h-4 w-4 inline mr-2" />
                      Ders
                    </label>
                    <Controller
                      name="subject"
                      control={control}
                      rules={{ required: 'Ders seçimi gerekli' }}
                      render={({ field }) => (
                        <select 
                          className={`w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 appearance-none cursor-pointer transition-all duration-200 ${errors.subject ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`} 
                          {...field}
                        >
                          {subjects.map(subject => (
                            <option key={subject.value} value={subject.value}>
                              {subject.label}
                            </option>
                          ))}
                        </select>
                      )}
                    />
                    {errors.subject && (
                      <p className="text-sm text-red-600 flex items-center gap-1 animate-slide-in-right">
                        <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                        {errors.subject.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      <TargetIcon className="h-4 w-4 inline mr-2" />
                      Konu
                    </label>
                    <input
                      type="text"
                      placeholder="Örn: Türev, Limit, İntegral..."
                      className={`w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 ${errors.topic ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                      {...register('topic')}
                    />
                    {errors.topic && (
                      <p className="text-sm text-red-600 flex items-center gap-1 animate-slide-in-right">
                        <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                        {errors.topic.message}
                      </p>
                    )}
                  </div>
                </div>

                {/* Study Type */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    <TrendingUpIcon className="h-4 w-4 inline mr-2" />
                    Çalışma Türü
                  </label>
                  <Controller
                    name="study_type"
                    control={control}
                    rules={{ required: 'Çalışma türü gerekli' }}
                    render={({ field }) => (
                      <select 
                        className={`w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 appearance-none cursor-pointer transition-all duration-200 ${errors.study_type ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`} 
                        {...field}
                      >
                        {studyTypes.map(type => (
                          <option key={type.value} value={type.value}>
                            {type.label}
                          </option>
                        ))}
                      </select>
                    )}
                  />
                  {errors.study_type && (
                    <p className="text-sm text-red-600 flex items-center gap-1 animate-slide-in-right">
                      <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                      {errors.study_type.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Questions Analysis Section */}
              <div className="bg-gray-50/50 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                    <TargetIcon className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Soru Çözümü ve Performans</h3>
                    <p className="text-sm text-gray-600">Çözdüğünüz soruların analizi</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      <TargetIcon className="h-4 w-4 inline mr-2" />
                      Toplam Soru
                    </label>
                    <input
                      type="number"
                      min="0"
                      placeholder="0"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200"
                      {...register('questions_solved', { 
                        min: { value: 0, message: 'Negatif olamaz' },
                        setValueAs: (value) => value === '' ? 0 : parseInt(value)
                      })}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      <CheckCircleIcon className="h-4 w-4 inline mr-2" />
                      Doğru
                    </label>
                    <input
                      type="number"
                      min="0"
                      max={questionsTotal}
                      placeholder="0"
                      className={`w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 ${errors.correct_answers ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                      {...register('correct_answers', { 
                        min: { value: 0, message: 'Negatif olamaz' },
                        max: { value: questionsTotal, message: 'Toplam sorudan fazla olamaz' },
                        setValueAs: (value) => value === '' ? 0 : parseInt(value),
                        validate: {
                          notExceedTotal: (value) => {
                            const currentValue = parseInt(value || 0);
                            const currentWrong = parseInt(wrongAnswers || 0);
                            const currentEmpty = parseInt(emptyAnswers || 0);
                            const total = currentValue + currentWrong + currentEmpty;
                            return questionsTotal === 0 || total <= questionsTotal || 'Toplam cevap sayısı, soru sayısını aşamaz';
                          }
                        }
                      })}
                    />
                    {errors.correct_answers && (
                      <p className="text-sm text-red-600 flex items-center gap-1 animate-slide-in-right">
                        <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                        {errors.correct_answers.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      <XCircleIcon className="h-4 w-4 inline mr-2" />
                      Yanlış
                    </label>
                    <input
                      type="number"
                      min="0"
                      max={questionsTotal}
                      placeholder="0"
                      className={`w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 ${errors.wrong_answers ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                      {...register('wrong_answers', { 
                        min: { value: 0, message: 'Negatif olamaz' },
                        max: { value: questionsTotal, message: 'Toplam sorudan fazla olamaz' },
                        setValueAs: (value) => value === '' ? 0 : parseInt(value),
                        validate: {
                          notExceedTotal: (value) => {
                            const currentCorrect = parseInt(correctAnswers || 0);
                            const currentValue = parseInt(value || 0);
                            const currentEmpty = parseInt(emptyAnswers || 0);
                            const total = currentCorrect + currentValue + currentEmpty;
                            return questionsTotal === 0 || total <= questionsTotal || 'Toplam cevap sayısı, soru sayısını aşamaz';
                          }
                        }
                      })}
                    />
                    {errors.wrong_answers && (
                      <p className="text-sm text-red-600 flex items-center gap-1 animate-slide-in-right">
                        <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                        {errors.wrong_answers.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      <CircleIcon className="h-4 w-4 inline mr-2" />
                      Boş
                    </label>
                    <input
                      type="number"
                      min="0"
                      max={questionsTotal}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 cursor-not-allowed"
                      readOnly
                      {...register('empty_answers')}
                    />
                  </div>
                </div>

                {/* Performance Summary */}
                {questionsTotal > 0 && (
                  <div className={`mt-6 p-4 rounded-lg border ${answersExceedTotal ? 'bg-red-50 border-red-200' : 'bg-white border-gray-200'}`}>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-medium text-gray-700">Performans Özeti</span>
                      {answersExceedTotal && (
                        <span className="text-xs text-red-600 bg-red-100 px-2 py-1 rounded">
                          <AlertTriangleIcon className="h-4 w-4 inline mr-1" />
                          Toplam aşıldı!
                        </span>
                      )}
                      {!answersExceedTotal && answersNotEqual && (
                        <span className="text-xs text-yellow-600 bg-yellow-100 px-2 py-1 rounded">
                          <AlertTriangleIcon className="h-4 w-4 inline mr-1" />
                          Kalan: {remainingAnswers}
                        </span>
                      )}
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <div className="text-lg font-bold text-gray-700">
                          {questionsTotal > 0 ? Math.round((correctAnswers / questionsTotal) * 100) : 0}%
                        </div>
                        <div className="text-xs text-gray-600">Başarı Oranı</div>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <div className="text-lg font-bold text-gray-700">
                          {questionsTotal > 0 ? Math.round((wrongAnswers / questionsTotal) * 100) : 0}%
                        </div>
                        <div className="text-xs text-gray-600">Hata Oranı</div>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <div className="text-lg font-bold text-gray-700">
                          {questionsTotal > 0 ? Math.round((emptyAnswers / questionsTotal) * 100) : 0}%
                        </div>
                        <div className="text-xs text-gray-600">Boş Oranı</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Notes Section */}
              <div className="bg-gray-50/50 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                    <FileTextIcon className="h-6 w-6 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Notlar ve Değerlendirme</h3>
                    <p className="text-sm text-gray-600">Çalışmanız hakkında düşünceleriniz (opsiyonel)</p>
                  </div>
                </div>
                
                <textarea
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 resize-none transition-all duration-200"
                  placeholder="Bu çalışma seansı hakkında notlarınızı yazabilirsiniz. Örneğin: zorlandığınız konular, anlamadığınız noktalar, tekrar edilmesi gerekenler..."
                  {...register('notes')}
                />
              </div>

              {/* Enhanced Submit Button */}
              <div className="flex justify-center pt-6">
                <button
                  type="submit"
                  disabled={loading || answersExceedTotal || (questionsTotal > 0 && answersNotEqual)}
                  className="w-full max-w-md bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <div className="spinner-sm mr-3"></div>
                      <span>{editingRecord ? 'Güncelleniyor...' : 'Kaydediliyor...'}</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center">
                      <SaveIcon className="h-5 w-5 mr-2" />
                      <span>{editingRecord ? 'Çalışma Kaydını Güncelle' : 'Çalışma Kaydını Ekle'}</span>
                    </div>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Quick Link to Study History */}
        <div className="mt-8 bg-white rounded-2xl shadow-xl border border-gray-100">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <HistoryIcon className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Çalışma Geçmişi</h3>
                  <p className="text-sm text-gray-600">Tüm çalışma kayıtlarınızı görüntüleyin ve düzenleyin</p>
                </div>
              </div>
              <a
                href="/study/history"
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <HistoryIcon className="h-5 w-5 mr-2" />
                Tüm Çalışmaları Gör
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddStudyRecord;