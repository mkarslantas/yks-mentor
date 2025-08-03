import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { CalendarIcon, ClockIcon, BookOpenIcon, TargetIcon, TrophyIcon, AlertTriangleIcon, EditIcon } from 'lucide-react';
import { studentService } from '../../services/student.service';

const AddMockExam = () => {
  const [loading, setLoading] = useState(false);
  const [fetchingExam, setFetchingExam] = useState(false);
  const [editingExam, setEditingExam] = useState(null);
  const navigate = useNavigate();
  const { id } = useParams(); // Get exam ID from URL if editing
  
  const {
    control,
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors }
  } = useForm({
    defaultValues: {
      exam_date: new Date().toISOString().split('T')[0],
      exam_type: 'TYT',
      duration_minutes: 165, // TYT default duration
      notes: ''
    }
  });

  const examType = watch('exam_type');

  // Load exam data if editing
  useEffect(() => {
    if (id) {
      fetchExamData();
    }
  }, [id]);

  const fetchExamData = async () => {
    try {
      setFetchingExam(true);
      const examData = await studentService.getMockExam(id);
      setEditingExam(examData);
      populateFormWithExamData(examData);
    } catch (error) {
      console.error('Error fetching exam data:', error);
      toast.error('Deneme sınav verileri yüklenirken hata oluştu');
      navigate('/exams'); // Redirect back if error
    } finally {
      setFetchingExam(false);
    }
  };

  const populateFormWithExamData = (exam) => {
    // Set basic fields
    setValue('exam_date', exam.exam_date);
    setValue('exam_type', exam.exam_type);
    setValue('duration_minutes', exam.duration_minutes);
    setValue('notes', exam.notes || '');

    // Set TYT fields if TYT exam
    if (exam.exam_type === 'TYT') {
      setValue('tyt_turkce_correct', exam.turkce_correct || 0);
      setValue('tyt_turkce_wrong', exam.turkce_wrong || 0);
      setValue('tyt_sosyal_correct', exam.sosyal_correct || 0);
      setValue('tyt_sosyal_wrong', exam.sosyal_wrong || 0);
      setValue('tyt_matematik_correct', exam.matematik_correct || 0);
      setValue('tyt_matematik_wrong', exam.matematik_wrong || 0);
      setValue('tyt_fen_correct', exam.fen_correct || 0);
      setValue('tyt_fen_wrong', exam.fen_wrong || 0);
    }

    // Set AYT fields if AYT exam
    if (exam.exam_type === 'AYT') {
      setValue('ayt_matematik_correct', exam.matematik_ayt_correct || 0);
      setValue('ayt_matematik_wrong', exam.matematik_ayt_wrong || 0);
      setValue('ayt_fizik_correct', exam.fizik_correct || 0);
      setValue('ayt_fizik_wrong', exam.fizik_wrong || 0);
      setValue('ayt_kimya_correct', exam.kimya_correct || 0);
      setValue('ayt_kimya_wrong', exam.kimya_wrong || 0);
      setValue('ayt_biyoloji_correct', exam.biyoloji_correct || 0);
      setValue('ayt_biyoloji_wrong', exam.biyoloji_wrong || 0);
      setValue('ayt_edebiyat_correct', exam.edebiyat_correct || 0);
      setValue('ayt_edebiyat_wrong', exam.edebiyat_wrong || 0);
      setValue('ayt_tarih_correct', exam.tarih_correct || 0);
      setValue('ayt_tarih_wrong', exam.tarih_wrong || 0);
      setValue('ayt_cografya_correct', exam.cografya_correct || 0);
      setValue('ayt_cografya_wrong', exam.cografya_wrong || 0);
      setValue('ayt_dil_correct', exam.dil_correct || 0);
      setValue('ayt_dil_wrong', exam.dil_wrong || 0);
    }
  };

  const tytSections = [
    { 
      key: 'turkce', 
      label: 'Türkçe', 
      totalQuestions: 40,
      correctField: 'tyt_turkce_correct',
      wrongField: 'tyt_turkce_wrong'
    },
    { 
      key: 'sosyal', 
      label: 'Sosyal Bilimler', 
      totalQuestions: 20,
      correctField: 'tyt_sosyal_correct',
      wrongField: 'tyt_sosyal_wrong'
    },
    { 
      key: 'matematik', 
      label: 'Matematik', 
      totalQuestions: 40,
      correctField: 'tyt_matematik_correct',
      wrongField: 'tyt_matematik_wrong'
    },
    { 
      key: 'fen', 
      label: 'Fen Bilimleri', 
      totalQuestions: 20,
      correctField: 'tyt_fen_correct',
      wrongField: 'tyt_fen_wrong'
    }
  ];

  const aytSections = [
    { 
      key: 'matematik', 
      label: 'Matematik', 
      totalQuestions: 40,
      correctField: 'ayt_matematik_correct',
      wrongField: 'ayt_matematik_wrong'
    },
    { 
      key: 'fizik', 
      label: 'Fizik', 
      totalQuestions: 14,
      correctField: 'ayt_fizik_correct',
      wrongField: 'ayt_fizik_wrong'
    },
    { 
      key: 'kimya', 
      label: 'Kimya', 
      totalQuestions: 13,
      correctField: 'ayt_kimya_correct',
      wrongField: 'ayt_kimya_wrong'
    },
    { 
      key: 'biyoloji', 
      label: 'Biyoloji', 
      totalQuestions: 13,
      correctField: 'ayt_biyoloji_correct',
      wrongField: 'ayt_biyoloji_wrong'
    },
    { 
      key: 'edebiyat', 
      label: 'Edebiyat', 
      totalQuestions: 24,
      correctField: 'ayt_edebiyat_correct',
      wrongField: 'ayt_edebiyat_wrong'
    },
    { 
      key: 'tarih', 
      label: 'Tarih', 
      totalQuestions: 10,
      correctField: 'ayt_tarih_correct',
      wrongField: 'ayt_tarih_wrong'
    },
    { 
      key: 'cografya', 
      label: 'Coğrafya', 
      totalQuestions: 6,
      correctField: 'ayt_cografya_correct',
      wrongField: 'ayt_cografya_wrong'
    },
    { 
      key: 'dil', 
      label: 'Yabancı Dil', 
      totalQuestions: 80,
      correctField: 'ayt_dil_correct',
      wrongField: 'ayt_dil_wrong'
    }
  ];

  // Check if any section has validation errors
  const hasValidationErrors = React.useMemo(() => {
    const sectionsToCheck = examType === 'TYT' ? tytSections : aytSections;
    
    return sectionsToCheck.some(section => {
      const correctValue = watch(section.correctField);
      const wrongValue = watch(section.wrongField);
      
      const correct = Number(correctValue) || 0;
      const wrong = Number(wrongValue) || 0;
      
      // Ensure non-negative values
      const validCorrect = Math.max(0, correct);
      const validWrong = Math.max(0, wrong);
      
      return validCorrect + validWrong > section.totalQuestions;
    });
  }, [examType, watch, tytSections, aytSections]);

  // Update duration when exam type changes
  React.useEffect(() => {
    if (examType === 'TYT') {
      setValue('duration_minutes', 165); // 2 saat 45 dakika
    } else if (examType === 'AYT') {
      setValue('duration_minutes', 180); // 3 saat
    }
  }, [examType, setValue]);

  const calculateNet = (correct, wrong) => {
    return Math.max(0, correct - (wrong / 4));
  };

  const onSubmit = async (data) => {
    try {
      setLoading(true);

      // Validate section answers
      const sectionsToValidate = examType === 'TYT' ? tytSections : aytSections;

      for (const section of sectionsToValidate) {
        const correct = Number(data[section.correctField]) || 0;
        const wrong = Number(data[section.wrongField]) || 0;
        
        // Ensure non-negative values
        const validCorrect = Math.max(0, correct);
        const validWrong = Math.max(0, wrong);
        
        if (validCorrect + validWrong > section.totalQuestions) {
          toast.error(`${section.label} bölümünde toplam cevap sayısı ${section.totalQuestions}'u geçemez`);
          return;
        }
      }

      // Transform data to backend format (calculate nets)
      const examData = {
        exam_date: data.exam_date,
        exam_type: data.exam_type, // Already uppercase from select options
        duration_minutes: data.duration_minutes,
        notes: data.notes
      };

      // Calculate nets for TYT sections
      if (examType === 'TYT') {
        const turkceCorrect = Number(data.tyt_turkce_correct) || 0;
        const turkceWrong = Number(data.tyt_turkce_wrong) || 0;
        examData.turkce_correct = turkceCorrect;
        examData.turkce_wrong = turkceWrong;
        examData.turkce_net = calculateNet(turkceCorrect, turkceWrong);

        const sosyalCorrect = Number(data.tyt_sosyal_correct) || 0;
        const sosyalWrong = Number(data.tyt_sosyal_wrong) || 0;
        examData.sosyal_correct = sosyalCorrect;
        examData.sosyal_wrong = sosyalWrong;
        examData.sosyal_net = calculateNet(sosyalCorrect, sosyalWrong);

        const matematikCorrect = Number(data.tyt_matematik_correct) || 0;
        const matematikWrong = Number(data.tyt_matematik_wrong) || 0;
        examData.matematik_correct = matematikCorrect;
        examData.matematik_wrong = matematikWrong;
        examData.matematik_net = calculateNet(matematikCorrect, matematikWrong);

        const fenCorrect = Number(data.tyt_fen_correct) || 0;
        const fenWrong = Number(data.tyt_fen_wrong) || 0;
        examData.fen_correct = fenCorrect;
        examData.fen_wrong = fenWrong;
        examData.fen_net = calculateNet(fenCorrect, fenWrong);
      }

      // Calculate nets for AYT sections
      if (examType === 'AYT') {
        const aytMatematikCorrect = Number(data.ayt_matematik_correct) || 0;
        const aytMatematikWrong = Number(data.ayt_matematik_wrong) || 0;
        examData.matematik_ayt_correct = aytMatematikCorrect;
        examData.matematik_ayt_wrong = aytMatematikWrong;
        examData.matematik_ayt_net = calculateNet(aytMatematikCorrect, aytMatematikWrong);

        const fizikCorrect = Number(data.ayt_fizik_correct) || 0;
        const fizikWrong = Number(data.ayt_fizik_wrong) || 0;
        examData.fizik_correct = fizikCorrect;
        examData.fizik_wrong = fizikWrong;
        examData.fizik_net = calculateNet(fizikCorrect, fizikWrong);

        const kimyaCorrect = Number(data.ayt_kimya_correct) || 0;
        const kimyaWrong = Number(data.ayt_kimya_wrong) || 0;
        examData.kimya_correct = kimyaCorrect;
        examData.kimya_wrong = kimyaWrong;
        examData.kimya_net = calculateNet(kimyaCorrect, kimyaWrong);

        const biyolojiCorrect = Number(data.ayt_biyoloji_correct) || 0;
        const biyolojiWrong = Number(data.ayt_biyoloji_wrong) || 0;
        examData.biyoloji_correct = biyolojiCorrect;
        examData.biyoloji_wrong = biyolojiWrong;
        examData.biyoloji_net = calculateNet(biyolojiCorrect, biyolojiWrong);

        const edebiyatCorrect = Number(data.ayt_edebiyat_correct) || 0;
        const edebiyatWrong = Number(data.ayt_edebiyat_wrong) || 0;
        examData.edebiyat_correct = edebiyatCorrect;
        examData.edebiyat_wrong = edebiyatWrong;
        examData.edebiyat_net = calculateNet(edebiyatCorrect, edebiyatWrong);

        const tarihCorrect = Number(data.ayt_tarih_correct) || 0;
        const tarihWrong = Number(data.ayt_tarih_wrong) || 0;
        examData.tarih_correct = tarihCorrect;
        examData.tarih_wrong = tarihWrong;
        examData.tarih_net = calculateNet(tarihCorrect, tarihWrong);

        const cografyaCorrect = Number(data.ayt_cografya_correct) || 0;
        const cografyaWrong = Number(data.ayt_cografya_wrong) || 0;
        examData.cografya_correct = cografyaCorrect;
        examData.cografya_wrong = cografyaWrong;
        examData.cografya_net = calculateNet(cografyaCorrect, cografyaWrong);

        const dilCorrect = Number(data.ayt_dil_correct) || 0;
        const dilWrong = Number(data.ayt_dil_wrong) || 0;
        examData.dil_correct = dilCorrect;
        examData.dil_wrong = dilWrong;
        examData.dil_net = calculateNet(dilCorrect, dilWrong);
      }

      console.log('Sending exam data:', examData); // Debug için
      
      if (editingExam) {
        // Update existing exam
        await studentService.updateMockExam(editingExam.id, examData);
        toast.success('Deneme sınav kaydı başarıyla güncellendi!');
      } else {
        // Create new exam
        await studentService.createMockExam(examData);
        toast.success('Deneme sınav kaydı başarıyla eklendi!');
      }
      
      navigate('/exams');
    } catch (error) {
      console.error('Mock exam creation error:', error);
      console.error('Error response:', error.response); // Debug için
      toast.error(error.response?.data?.error?.message || 'Deneme sınav kaydı eklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const renderSection = (section) => {
    const correctValue = watch(section.correctField);
    const wrongValue = watch(section.wrongField);
    
    const correct = Number(correctValue) || 0;
    const wrong = Number(wrongValue) || 0;
    
    // Ensure non-negative values
    const validCorrect = Math.max(0, correct);
    const validWrong = Math.max(0, wrong);
    
    const net = calculateNet(validCorrect, validWrong);
    const answered = validCorrect + validWrong;
    const empty = Math.max(0, section.totalQuestions - answered);
    const isOverLimit = answered > section.totalQuestions;

    return (
      <div key={section.key} className={`border rounded-lg p-4 ${isOverLimit ? 'border-red-300 bg-red-50' : 'border-blue-200'}`}>
        <h4 className="font-medium text-gray-900 mb-3">{section.label}</h4>
        {isOverLimit && (
          <div className="mb-3 p-2 bg-red-100 border border-red-300 rounded text-red-700 text-sm">
            <AlertTriangleIcon className="h-4 w-4 inline mr-1" />
            Toplam cevap sayısı {section.totalQuestions} soruyu geçemez!
          </div>
        )}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-sm">
          <div>
            <label className="block text-xs text-gray-600 mb-1">Doğru</label>
            <input
              type="number"
              min="0"
              max={section.totalQuestions}
              placeholder="0"
              className={`w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 text-sm ${isOverLimit ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
              {...register(section.correctField, { 
                min: 0, 
                max: section.totalQuestions 
              })}
            />
          </div>
          
          <div>
            <label className="block text-xs text-gray-600 mb-1">Yanlış</label>
            <input
              type="number"
              min="0"
              max={section.totalQuestions}
              placeholder="0"
              className={`w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 text-sm ${isOverLimit ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
              {...register(section.wrongField, { 
                min: 0, 
                max: section.totalQuestions 
              })}
            />
          </div>
          
          <div>
            <label className="block text-xs text-gray-600 mb-1">Boş</label>
            <input
              type="number"
              value={empty}
              readOnly
              className="input text-sm bg-gray-50"
            />
          </div>
          
          <div>
            <label className="block text-xs text-gray-600 mb-1">Net</label>
            <input
              type="number"
              value={net.toFixed(2)}
              readOnly
              className="input text-sm bg-gray-50 font-medium"
            />
          </div>
          
          <div className="flex items-end">
            <span className="text-xs text-gray-500">
              /{section.totalQuestions} soru
            </span>
          </div>
        </div>
      </div>
    );
  };

  // Show loading spinner when fetching exam data
  if (fetchingExam) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-center">
          <div className="spinner h-8 w-8 mx-auto mb-4"></div>
          <p className="text-gray-600">Deneme sınav verileri yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 pt-6">
        {/* Modern Purple Gradient Header */}
        <div className="bg-gradient-to-r from-purple-600 via-purple-500 to-blue-500 rounded-2xl mb-8">
          <div className="p-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/30">
                {editingExam ? (
                  <EditIcon className="h-8 w-8 text-white" />
                ) : (
                  <TrophyIcon className="h-8 w-8 text-white" />
                )}
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">
                  {editingExam ? 'Deneme Sınav Kaydını Düzenle' : 'Deneme Sınav Kaydı Ekle'}
              </h1>
                <p className="text-purple-100 mt-1">
                  {editingExam 
                    ? 'Seçili deneme sınavının bilgilerini güncelleyin' 
                    : 'Deneme sınavı sonucunuzu girin ve performansınızı takip edin'
                  }
                </p>
              </div>
            </div>
            {editingExam && (
              <button
                type="button"
                onClick={() => navigate('/exams')}
                className="px-6 py-3 text-sm font-medium text-white bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl hover:bg-white/30 transition-all duration-200"
              >
                Düzenlemeyi İptal Et
              </button>
            )}
          </div>
        </div>
      </div>

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <CalendarIcon className="h-4 w-4 inline mr-2" />
                  Sınav Tarihi
                </label>
                <input
                  type="date"
                  className={`input ${errors.exam_date ? 'input-error' : ''}`}
                  {...register('exam_date', { required: 'Sınav tarihi gerekli' })}
                />
                {errors.exam_date && (
                  <p className="error-text">{errors.exam_date.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <BookOpenIcon className="h-4 w-4 inline mr-2" />
                  Sınav Türü
                </label>
                <Controller
                  name="exam_type"
                  control={control}
                  rules={{ required: 'Sınav türü gerekli' }}
                  render={({ field }) => (
                    <select className={`w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 appearance-none cursor-pointer transition-all duration-200 ${errors.exam_type ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`} {...field}>
                      <option value="TYT">TYT (165 dakika)</option>
                      <option value="AYT">AYT (180 dakika)</option>
                    </select>
                  )}
                />
                {errors.exam_type && (
                  <p className="error-text">{errors.exam_type.message}</p>
                )}
              </div>
            </div>

            {/* TYT Sections */}
            {examType === 'TYT' && (
              <div>
                <div className="bg-gray-50/50 rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                      <TrophyIcon className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">TYT Sonuçları</h3>
                      <p className="text-sm text-gray-600">Bölüm bazında performansınız</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    {tytSections.map(renderSection)}
                  </div>
                </div>
              </div>
            )}

            {/* AYT Sections */}
            {examType === 'AYT' && (
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                  <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center border border-blue-200 mr-3">
                    <TargetIcon className="h-5 w-5 text-gray-600" />
                  </div>
                  AYT Sonuçları
                </h3>
                <div className="space-y-4">
                  {aytSections.map(renderSection)}
                </div>
              </div>
            )}

            {/* Notes */}
            <div>
              <label className="label">Notlar (Opsiyonel)</label>
              <textarea
                rows={4}
                className="input"
                placeholder="Sınav hakkında notlarınız, zorlandığınız konular vb..."
                {...register('notes')}
              />
            </div>

            {/* Submit Button */}
            <div className="flex justify-center pt-6">
              <button
                type="submit"
                disabled={loading || hasValidationErrors}
                className="w-full max-w-md bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="spinner h-4 w-4 mr-3"></div>
                    <span>{editingExam ? 'Güncelleniyor...' : 'Kaydediliyor...'}</span>
                  </div>
                ) : hasValidationErrors ? (
                  'Lütfen hataları düzeltin'
                ) : (
                  <div className="flex items-center justify-center">
                    <TrophyIcon className="h-5 w-5 mr-2" />
                    <span>{editingExam ? 'Deneme Sınav Kaydını Güncelle' : 'Deneme Sınav Kaydını Ekle'}</span>
                  </div>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddMockExam;