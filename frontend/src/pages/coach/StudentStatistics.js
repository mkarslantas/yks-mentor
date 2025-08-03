import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { studentService } from '../../services/student.service';
import { coachService } from '../../services/coach.service';
import {
  BarChart3Icon,
  TrendingUpIcon,
  CalendarIcon,
  ClockIcon,
  TargetIcon,
  BookOpenIcon,
  TrophyIcon,
  ZapIcon,
  ActivityIcon,
  FilterIcon,
  DownloadIcon,
  RefreshCwIcon,
  EyeIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ArrowLeftIcon,
  UserIcon
} from 'lucide-react';
import Loading from '../../components/common/Loading';
import { LineChart, BarChart, DoughnutChart, formatChartData } from '../../components/charts/ChartComponents';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

// Chart Loading Component
const ChartLoading = () => (
  <div className="h-64 bg-white rounded-lg border border-gray-200 p-4 flex items-center justify-center">
    <div className="text-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
      <p className="text-sm text-gray-500 mt-2">Grafik yükleniyor...</p>
    </div>
  </div>
);

// YKS dersleri ve sınav türleri
const ALL_SUBJECTS = {
  matematik: 'Matematik',
  turkce: 'Türkçe', 
  fizik: 'Fizik',
  kimya: 'Kimya',
  biyoloji: 'Biyoloji',
  tarih: 'Tarih',
  cografya: 'Coğrafya',
  edebiyat: 'Edebiyat',
  felsefe: 'Felsefe'
};

const TYT_SUBJECTS = {
  matematik: 'Matematik',
  turkce: 'Türkçe',
  fizik: 'Fizik', 
  kimya: 'Kimya',
  biyoloji: 'Biyoloji',
  tarih: 'Tarih',
  cografya: 'Coğrafya',
  felsefe: 'Felsefe'
};

const AYT_SUBJECTS = {
  matematik: 'Matematik',
  edebiyat: 'Edebiyat',
  fizik: 'Fizik',
  kimya: 'Kimya', 
  biyoloji: 'Biyoloji',
  tarih: 'Tarih',
  cografya: 'Coğrafya'
};

const EXAM_TYPES = {
  all: 'Tüm Sınavlar',
  TYT: 'TYT',
  AYT: 'AYT'
};

const StudentStatistics = () => {
  const { studentId } = useParams();
  const navigate = useNavigate();
  
  const [student, setStudent] = useState(null);
  const [studentLoading, setStudentLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState('30'); // 7, 30, 90, 365 days
  const [selectedSubjects, setSelectedSubjects] = useState(['all']); // Array for multi-select
  const [selectedExamType, setSelectedExamType] = useState('all'); // all, TYT, AYT
  const [showSubjectDropdown, setShowSubjectDropdown] = useState(false);
  
  // Individual chart filters
  const [chartFilters, setChartFilters] = useState({
    dailyQuestions: { subjects: ['all'], timeRange: '30', examType: 'all', timeOffset: 0 },
    subjectPerformance: { subjects: ['all'], examType: 'all' },
    studyTimeDistribution: { subjects: ['all'], examType: 'all' },
    studyDuration: { subjects: ['all'], timeRange: '30', examType: 'all', timeOffset: 0 },
    mockExamProgress: { examType: 'TYT', aytCategory: 'SAY', timeOffset: 0, timeRange: '30' }
  });
  
  // Chart dropdown visibility states
  const [chartDropdowns, setChartDropdowns] = useState({
    dailyQuestions: false,
    subjectPerformance: false,
    studyTimeDistribution: false,
    studyDuration: false,
    mockExamProgress: false
  });
  
  // Get available subjects based on exam type
  const getAvailableSubjects = () => {
    switch(selectedExamType) {
      case 'TYT':
        return TYT_SUBJECTS;
      case 'AYT':
        return AYT_SUBJECTS;
      default:
        return ALL_SUBJECTS;
    }
  };

  // Download PDF report function
  const downloadReport = async () => {
    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      // Add Turkish font support (using default font for now)
      pdf.setFont('helvetica');
      
      const currentDate = new Date().toLocaleDateString('tr-TR');
      const fileName = `YKS_Mentor_İstatistik_Raporu_${new Date().toISOString().split('T')[0]}.pdf`;
      
      // Header
      pdf.setFontSize(20);
      pdf.setTextColor(41, 128, 185);
      pdf.text('YKS MENTOR', 105, 20, { align: 'center' });
      
      pdf.setFontSize(16);
      pdf.setTextColor(0, 0, 0);
      pdf.text('İSTATİSTİK RAPORU', 105, 30, { align: 'center' });
      
      // Report info
      pdf.setFontSize(10);
      pdf.setTextColor(128, 128, 128);
      pdf.text(`Rapor Tarihi: ${currentDate}`, 20, 45);
      pdf.text(`Zaman Aralığı: Son ${timeRange} gün`, 20, 52);
      pdf.text(`Seçilen Dersler: ${selectedSubjects.includes('all') ? 'Tüm Dersler' : selectedSubjects.map(s => ALL_SUBJECTS[s] || s).join(', ')}`, 20, 59);
      pdf.text(`Sınav Türü: ${EXAM_TYPES[selectedExamType]}`, 20, 66);
      
      // Line separator
      pdf.setDrawColor(200, 200, 200);
      pdf.line(20, 75, 190, 75);
      
      let yPosition = 85;
      
      // General Statistics
      pdf.setFontSize(14);
      pdf.setTextColor(0, 0, 0);
      pdf.text('GENEL İSTATİSTİKLER', 20, yPosition);
      yPosition += 10;
      
      if (stats) {
        const generalStats = [
          ['Toplam Çalışma Süresi', `${Math.round((stats.totalStudyMinutes || 0) / 60)} saat ${(stats.totalStudyMinutes || 0) % 60} dakika`],
          ['Çözülen Soru Sayısı', `${stats.totalQuestions || 0}`],
          ['Doğru Cevap Sayısı', `${stats.totalCorrect || 0}`],
          ['Genel Başarı Oranı', `%${stats.totalQuestions > 0 ? Math.round((stats.totalCorrect / stats.totalQuestions) * 100) : 0}`],
          ['Günlük Çalışma Serisi', `${stats.currentStreak || 0} gün`],
          ['Aktif Çalışma Günleri', `${stats.activeDays || 0}`],
          ['En Çok Çalışılan Ders', `${stats.topSubject || 'Belirtilmemiş'}`]
        ];
        
        pdf.autoTable({
          startY: yPosition,
          head: [['Metrik', 'Değer']],
          body: generalStats,
          theme: 'grid',
          headStyles: { fillColor: [41, 128, 185], textColor: 255 },
          styles: { fontSize: 9, cellPadding: 3 },
          columnStyles: { 0: { cellWidth: 80 }, 1: { cellWidth: 80 } }
        });
        
        yPosition = pdf.lastAutoTable.finalY + 15;
      }
      
      // Subject Performance
      if (subjectPerformance && subjectPerformance.length > 0) {
        // Check if we need a new page
        if (yPosition > 200) {
          pdf.addPage();
          yPosition = 20;
        }
        
        pdf.setFontSize(14);
        pdf.text('DERS BAZLI PERFORMANS', 20, yPosition);
        yPosition += 10;
        
        const subjectData = subjectPerformance.map(subject => [
          ALL_SUBJECTS[subject.subject] || subject.subject,
          `${Math.round((subject.duration_minutes || 0) / 60)} saat`,
          `${subject.questions_solved || 0}`,
          `${subject.correct_answers || 0}`,
          `%${subject.questions_solved > 0 ? Math.round((subject.correct_answers / subject.questions_solved) * 100) : 0}`
        ]);
        
        pdf.autoTable({
          startY: yPosition,
          head: [['Ders', 'Süre', 'Çözülen', 'Doğru', 'Başarı']],
          body: subjectData,
          theme: 'grid',
          headStyles: { fillColor: [52, 152, 219], textColor: 255 },
          styles: { fontSize: 8, cellPadding: 2 },
          columnStyles: {
            0: { cellWidth: 60 },
            1: { cellWidth: 30 },
            2: { cellWidth: 25 },
            3: { cellWidth: 25 },
            4: { cellWidth: 25 }
          }
        });
        
        yPosition = pdf.lastAutoTable.finalY + 15;
      }
      
      // Study Time Distribution
      if (studyTimeDistribution && studyTimeDistribution.length > 0) {
        // Check if we need a new page
        if (yPosition > 220) {
          pdf.addPage();
          yPosition = 20;
        }
        
        pdf.setFontSize(14);
        pdf.text('ÇALIŞMA ZAMANI DAĞILIMI', 20, yPosition);
        yPosition += 10;
        
        const distributionData = studyTimeDistribution.map(item => [
          ALL_SUBJECTS[item.subject] || item.subject,
          `${Math.round((item.duration_minutes || 0) / 60)} saat`,
          `%${Math.round(item.percentage || 0)}`
        ]);
        
        pdf.autoTable({
          startY: yPosition,
          head: [['Ders', 'Süre', 'Oran']],
          body: distributionData,
          theme: 'grid',
          headStyles: { fillColor: [46, 204, 113], textColor: 255 },
          styles: { fontSize: 9, cellPadding: 3 },
          columnStyles: {
            0: { cellWidth: 80 },
            1: { cellWidth: 40 },
            2: { cellWidth: 30 }
          }
        });
        
        yPosition = pdf.lastAutoTable.finalY + 15;
      }
      
      // Mock Exam Progress
      if (mockExamProgress) {
        // Check if we need a new page
        if (yPosition > 220) {
          pdf.addPage();
          yPosition = 20;
        }
        
        pdf.setFontSize(14);
        pdf.text('DENEME SINAVI İLERLEMESİ', 20, yPosition);
        yPosition += 10;
        
        const examData = [
          ['TYT Ortalaması', mockExamProgress.tyt?.averageScore || 'Veri yok'],
          ['AYT Ortalaması', mockExamProgress.ayt?.averageScore || 'Veri yok'],
          ['Toplam Deneme Sayısı', `${(mockExamProgress.tyt?.count || 0) + (mockExamProgress.ayt?.count || 0)}`]
        ];
        
        pdf.autoTable({
          startY: yPosition,
          head: [['Sınav Türü', 'Sonuç']],
          body: examData,
          theme: 'grid',
          headStyles: { fillColor: [155, 89, 182], textColor: 255 },
          styles: { fontSize: 9, cellPadding: 3 },
          columnStyles: { 0: { cellWidth: 80 }, 1: { cellWidth: 80 } }
        });
        
        yPosition = pdf.lastAutoTable.finalY + 15;
      }
      
      // Footer
      const pageCount = pdf.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        pdf.setPage(i);
        pdf.setFontSize(8);
        pdf.setTextColor(128, 128, 128);
        pdf.text('Bu rapor YKS Mentor uygulaması tarafından otomatik olarak oluşturulmuştur.', 105, 285, { align: 'center' });
        pdf.text(`Sayfa ${i} / ${pageCount}`, 190, 290, { align: 'right' });
      }
      
      // Save the PDF
      pdf.save(fileName);
      
    } catch (error) {
      console.error('PDF rapor oluşturma hatası:', error);
      alert('PDF raporu oluşturulurken bir hata oluştu.');
    }
  };

  
  // Handle exam type change
  const handleExamTypeChange = (newExamType) => {
    setSelectedExamType(newExamType);
    // Reset subject selection when exam type changes
    setSelectedSubjects(['all']);
    // Reset all chart filters to use 'all' subjects when exam type changes
    setChartFilters(prev => ({
      ...prev,
      dailyQuestions: { ...prev.dailyQuestions, subjects: ['all'] },
      subjectPerformance: { ...prev.subjectPerformance, subjects: ['all'] },
      studyTimeDistribution: { ...prev.studyTimeDistribution, subjects: ['all'] },
      studyDuration: { ...prev.studyDuration, subjects: ['all'] }
    }));
  };
  
  // Handle subject selection
  const handleSubjectToggle = (subject) => {
    if (subject === 'all') {
      setSelectedSubjects(['all']);
    } else {
      setSelectedSubjects(prev => {
        const filtered = prev.filter(s => s !== 'all');
        if (filtered.includes(subject)) {
          const newSelection = filtered.filter(s => s !== subject);
          return newSelection.length === 0 ? ['all'] : newSelection;
        } else {
          return [...filtered, subject];
        }
      });
    }
  };
  
  // Chart filter helpers
  const updateChartFilter = (chartId, filterType, value) => {
    setChartFilters(prev => ({
      ...prev,
      [chartId]: {
        ...prev[chartId],
        [filterType]: value
      }
    }));
  };
  
  const toggleChartDropdown = (chartId) => {
    setChartDropdowns(prev => ({
      ...prev,
      [chartId]: !prev[chartId]
    }));
  };
  
  const handleChartSubjectToggle = (chartId, subject) => {
    setChartFilters(prev => {
      const currentSubjects = prev[chartId].subjects || ['all'];
      let newSubjects;
      
      if (subject === 'all') {
        newSubjects = ['all'];
      } else {
        const filtered = currentSubjects.filter(s => s !== 'all');
        if (filtered.includes(subject)) {
          const withoutSubject = filtered.filter(s => s !== subject);
          newSubjects = withoutSubject.length === 0 ? ['all'] : withoutSubject;
        } else {
          newSubjects = [...filtered, subject];
        }
      }
      
      return {
        ...prev,
        [chartId]: {
          ...prev[chartId],
          subjects: newSubjects
        }
      };
    });
  };
  
  // Advanced chart data states
  const [dailyQuestions, setDailyQuestions] = useState([]);
  const [dailyStudyDuration, setDailyStudyDuration] = useState([]);
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.subject-dropdown') && !event.target.closest('.chart-dropdown')) {
        setShowSubjectDropdown(false);
        setChartDropdowns({
          dailyQuestions: false,
          subjectPerformance: false,
          studyTimeDistribution: false,
          studyDuration: false,
          mockExamProgress: false
        });
      }
    };
    
    if (showSubjectDropdown || Object.values(chartDropdowns).some(Boolean)) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [showSubjectDropdown, chartDropdowns]);
  const [subjectPerformance, setSubjectPerformance] = useState([]);
  const [studyTimeDistribution, setStudyTimeDistribution] = useState([]);
  const [mockExamProgress, setMockExamProgress] = useState(null);
  const [chartsLoading, setChartsLoading] = useState(true);
  const [dailyQuestionsLoading, setDailyQuestionsLoading] = useState(false);
  const [studyDurationLoading, setStudyDurationLoading] = useState(false);
  const [mockExamLoading, setMockExamLoading] = useState(false);

  // Fetch student data
  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        setStudentLoading(true);
        const studentData = await coachService.getStudent(studentId);
        setStudent(studentData);
      } catch (error) {
        console.error('Error fetching student:', error);
        setError('Öğrenci bilgileri yüklenirken hata oluştu');
      } finally {
        setStudentLoading(false);
      }
    };

    if (studentId) {
      fetchStudentData();
    }
  }, [studentId]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const data = await coachService.getStudentStatistics(studentId, { 
          timeRange: timeRange,
          subject: selectedSubjects.includes('all') ? undefined : selectedSubjects.join(','),
          examType: selectedExamType !== 'all' ? selectedExamType : undefined
        });
        if (process.env.NODE_ENV === 'development') {
          console.log('Statistics API response:', data);
        }
        
        // Validate and use real API data if available
        if (data && data.success && data.data) {
          console.log('📊 Setting stats from API data:', data.data);
          setStats(data.data);
        } else if (data && typeof data === 'object' && !Array.isArray(data)) {
          console.log('📊 Setting stats directly:', data);
          setStats(data);
        } else {
          throw new Error('Invalid API response format');
        }
      } catch (err) {
        console.error('Statistics fetch error:', err);
        setError(`İstatistikler yüklenirken hata oluştu: ${err.message}`);
        setStats(null);
      } finally {
        setLoading(false);
      }
    };

    // Ana filtreler değiştiğinde tüm istatistikleri yenile
    fetchStats();
    fetchAdvancedStats();
  }, [timeRange, selectedSubjects, selectedExamType]);

  // Daily Questions Chart filter değişikliklerini dinle
  useEffect(() => {
    fetchDailyQuestionsData();
  }, [chartFilters.dailyQuestions.timeRange, chartFilters.dailyQuestions.timeOffset]);

  // Mock Exam Progress Chart filter değişikliklerini dinle
  useEffect(() => {
    fetchMockExamData();
  }, [chartFilters.mockExamProgress.timeOffset, chartFilters.mockExamProgress.timeRange, chartFilters.mockExamProgress.aytCategory]);

  // Daily Study Duration filter değişikliklerini dinle
  useEffect(() => {
    fetchStudyDurationData();
  }, [chartFilters.studyDuration.timeRange, chartFilters.studyDuration.timeOffset]);

  // Stats güncellendiğinde chart'ları yeniden hesapla
  useEffect(() => {
    if (stats) {
      const calculatedStats = calculateOverallStats(timeRange);
      console.log('📊 Coach stats updated, recalculating charts:', {
        subjectPerformance: calculatedStats.subjectPerformance,
        studyTimeDistribution: calculatedStats.studyTimeDistribution
      });
      setSubjectPerformance(calculatedStats.subjectPerformance || []);
      setStudyTimeDistribution(calculatedStats.studyTimeDistribution || []);
    }
  }, [stats]);

  // Daily Questions Chart'ı için veri getir
  const fetchDailyQuestionsData = async () => {
    try {
      setDailyQuestionsLoading(true);
      
      // Calculate date range based on timeOffset and timeRange
      const endDate = new Date();
      endDate.setDate(endDate.getDate() - chartFilters.dailyQuestions.timeOffset);
      const startDate = new Date(endDate);
      startDate.setDate(startDate.getDate() - parseInt(chartFilters.dailyQuestions.timeRange));
      
      const startDateStr = startDate.toISOString().split('T')[0];
      const endDateStr = endDate.toISOString().split('T')[0];
      
      // Fetch data from API
      const data = await coachService.getDailyQuestionsBySubject(studentId, {
        startDate: startDateStr,
        endDate: endDateStr
      });
      
      setDailyQuestions(data || []);
    } catch (err) {
      console.error('Daily questions data fetch error:', err);
      setDailyQuestions([]);
    } finally {
      setDailyQuestionsLoading(false);
    }
  };

  // Study Duration Chart'ı için veri getir
  const fetchStudyDurationData = async () => {
    try {
      setStudyDurationLoading(true);
      
      // Calculate date range based on timeOffset and timeRange
      const endDate = new Date();
      endDate.setDate(endDate.getDate() - chartFilters.studyDuration.timeOffset);
      const startDate = new Date(endDate);
      startDate.setDate(startDate.getDate() - parseInt(chartFilters.studyDuration.timeRange));
      
      const startDateStr = startDate.toISOString().split('T')[0];
      const endDateStr = endDate.toISOString().split('T')[0];
      
      // StudyRecord model'den direkt veri al
      const response = await coachService.getStudentStudyRecords(studentId, {
        start_date: startDateStr,
        end_date: endDateStr
      });
      
      // Transform data for daily duration chart - group by date and subject
      console.log('📊 Coach Study Duration API response:', response);
      const groupedData = {};
      (response?.data || []).forEach(record => {
        const date = record.date;
        const subject = record.subject;
        
        if (!groupedData[date]) {
          groupedData[date] = {};
        }
        if (!groupedData[date][subject]) {
          groupedData[date][subject] = 0;
        }
        groupedData[date][subject] += record.duration_minutes;
      });
      
      // Convert to format needed by chart
      const dailyData = [];
      Object.keys(groupedData).forEach(date => {
        Object.keys(groupedData[date]).forEach(subject => {
          dailyData.push({
            date: date,
            subject: subject,
            duration: groupedData[date][subject]
          });
        });
      });
      
      setDailyStudyDuration(dailyData);
    } catch (err) {
      console.error('Study duration data fetch error:', err);
      setDailyStudyDuration([]);
    } finally {
      setStudyDurationLoading(false);
    }
  };

  // Mock Exam Chart'ı için veri getir
  const fetchMockExamData = async () => {
    try {
      setMockExamLoading(true);
      
      // Calculate date range
      const endDate = new Date();
      endDate.setDate(endDate.getDate() - chartFilters.mockExamProgress.timeOffset);
      const startDate = new Date(endDate);
      startDate.setDate(startDate.getDate() - parseInt(chartFilters.mockExamProgress.timeRange));
      
      const startDateStr = startDate.toISOString().split('T')[0];
      const endDateStr = endDate.toISOString().split('T')[0];
      
      // Fetch mock exam data from API
      const data = await coachService.getStudentMockExams(studentId, {
        start_date: startDateStr,
        end_date: endDateStr,
        exam_type: chartFilters.mockExamProgress.examType !== 'all' ? chartFilters.mockExamProgress.examType : undefined
      });
      
      // Transform mock exam data into expected chart format
      if (data && Array.isArray(data)) {
        const examsByType = { TYT: [], AYT: [] };
        data.forEach(exam => {
          if (exam.exam_type && examsByType[exam.exam_type]) {
            examsByType[exam.exam_type].push(exam);
          }
        });
        
        // Create subject trends for each exam type
        const progressData = {};
        Object.keys(examsByType).forEach(examType => {
          const exams = examsByType[examType];
          progressData[examType] = { subjectTrends: {} };
          
          if (exams.length > 0) {
            // Define subjects for each exam type
            const subjects = examType === 'TYT' 
              ? ['turkce', 'matematik', 'sosyal', 'fen']
              : ['matematik_ayt', 'fizik', 'kimya', 'biyoloji', 'edebiyat', 'tarih', 'cografya'];
            
            // Create subject trends from actual database fields
            const subjectTrends = {};
            subjects.forEach(subject => {
              subjectTrends[subject] = exams.map(exam => ({
                date: exam.exam_date,
                net: exam[`${subject}_net`] || 0
              })).filter(item => item.net > 0); // Only include entries with actual data
            });
            
            // Only include subjects that have data
            Object.keys(subjectTrends).forEach(subject => {
              if (subjectTrends[subject].length > 0) {
                progressData[examType].subjectTrends[subject] = subjectTrends[subject];
              }
            });
          }
        });
        
        setMockExamProgress(progressData);
      } else {
        setMockExamProgress({
          TYT: { subjectTrends: {} },
          AYT: { subjectTrends: {} }
        });
      }
    } catch (err) {
      console.error('Mock exam data fetch error:', err);
      setMockExamProgress(null);
    } finally {
      setMockExamLoading(false);
    }
  };

  // Initial load için tüm chart verilerini getir
  const fetchAdvancedStats = async () => {
    try {
      setChartsLoading(true);
      
      // Tüm chart'ların verilerini paralel yükle
      await Promise.all([
        fetchDailyQuestionsData(),
        fetchStudyDurationData(), 
        fetchMockExamData()
      ]);
      
      // KPI ve diğer hesaplanmış verileri güncelle
      const calculatedStats = calculateOverallStats(timeRange);
      console.log('📊 Coach calculated stats:', {
        subjectPerformance: calculatedStats.subjectPerformance,
        studyTimeDistribution: calculatedStats.studyTimeDistribution
      });
      setSubjectPerformance(calculatedStats.subjectPerformance || []);
      setStudyTimeDistribution(calculatedStats.studyTimeDistribution || []);
      
    } catch (err) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Advanced stats fetch error:', err);
        console.log('Using mock advanced stats due to API error');
      }
      
      // Hata durumunda da ayrı fonksiyonları çağır
      await Promise.all([
        fetchDailyQuestionsData(),
        fetchStudyDurationData(), 
        fetchMockExamData()
      ]);
      
      // KPI verilerini güncelle
      const errorCalculatedStats = calculateOverallStats(timeRange);
      setSubjectPerformance(errorCalculatedStats.subjectPerformance || []);
      setStudyTimeDistribution(errorCalculatedStats.studyTimeDistribution || []);
    } finally {
      setChartsLoading(false);
    }
  };

  const formatTime = (minutes) => {
    if (!minutes || minutes < 60) return `${minutes || 0} dk`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}s ${mins}dk` : `${hours} saat`;
  };

  // Calculate real statistics from API data
  const calculateOverallStats = (selectedTimeRange = timeRange) => {
    // Use real API data if available, otherwise return empty defaults
    console.log('📊 Coach calculateOverallStats - stats:', stats);
    if (stats && stats.basicStats) {
      // Calculate subject performance data from subjectStats
      const subjectPerformance = (stats.subjectStats || []).map(subjectData => ({
        subject: subjectData.subject,
        accuracy_rate: subjectData.questions > 0 
          ? Math.round((subjectData.correct / subjectData.questions) * 100) 
          : 0
      }));

      // Calculate study time distribution from subjectStats
      const totalTime = (stats.subjectStats || []).reduce((sum, subject) => sum + (subject.duration || 0), 0);
      const studyTimeDistribution = (stats.subjectStats || []).map(subjectData => ({
        subject: subjectData.subject,
        percentage: totalTime > 0 
          ? Math.round((subjectData.duration / totalTime) * 100) 
          : 0
      }));

      return {
        totalStudyTime: stats.basicStats.totalStudyTime || 0,
        totalQuestions: stats.basicStats.totalQuestions || 0,
        correctAnswers: stats.basicStats.totalCorrect || 0,
        totalSessions: stats.basicStats.totalSessions || 0,
        studyDays: stats.basicStats.studyDays || 0,
        averageAccuracy: stats.basicStats.accuracyRate || 0,
        subjectStats: stats.subjectStats || [],
        favoriteSubject: stats.subjectStats && stats.subjectStats.length > 0 
          ? stats.subjectStats[0].subject 
          : null,
        studyStreak: stats.basicStats.studyDays || 0, // Use study days as streak for now
        subjectPerformance: subjectPerformance,
        studyTimeDistribution: studyTimeDistribution
      };
    }
    
    // Gerçek veri yokken tamamen boş değerler döndür
    return {
      totalStudyTime: 0,
      totalQuestions: 0,
      correctAnswers: 0,
      totalSessions: 0,
      studyDays: 0,
      averageAccuracy: 0,
      subjectStats: [],
      favoriteSubject: null,
      studyStreak: 0,
      subjectPerformance: [], // Boş grafik için
      studyTimeDistribution: [] // Boş grafik için
    };
    
    // Mock veri üretim kısmını kaldırdık
    /*const generateKPIData = () => {
      // Ana ders listesi - exam type'a göre filtrele
      let availableSubjects = ['matematik', 'fizik', 'turkce', 'kimya', 'biyoloji', 'tarih', 'edebiyat', 'cografya', 'felsefe'];
      
      // Exam type filtresi uygula
      if (selectedExamType === 'TYT') {
        availableSubjects = ['matematik', 'turkce', 'fizik', 'kimya', 'biyoloji', 'tarih', 'cografya', 'felsefe'];
      } else if (selectedExamType === 'AYT') {
        availableSubjects = ['matematik', 'edebiyat', 'fizik', 'kimya', 'biyoloji', 'tarih', 'cografya'];
      }
      
      // Subject filtresi uygula
      const filteredSubjects = selectedSubjects.includes('all') 
        ? availableSubjects 
        : availableSubjects.filter(subject => selectedSubjects.includes(subject));
      
      const kpiQuestions = [];
      const kpiStudyDuration = [];
      const days = parseInt(selectedTimeRange);
      
      for (let i = days - 1; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        
        // Her gün 2-4 farklı dersten çalışma (filtered subjects'ten)
        const dayHash = dateStr.split('-').reduce((a, b) => a + parseInt(b), 0);
        const maxSubjectsPerDay = Math.min(4, filteredSubjects.length);
        const dailySubjectsCount = (dayHash % Math.max(1, maxSubjectsPerDay - 1)) + 2; // 2-4 ders
        const todaySubjects = filteredSubjects.filter((_, index) => ((dayHash + index) % 7) < dailySubjectsCount);
        
        todaySubjects.forEach(subject => {
          // Soru verisi
          const baseQuestions = subject === 'matematik' ? 35 : subject === 'fizik' ? 25 : 20;
          const dayHash = dateStr.split('-').reduce((a, b) => a + parseInt(b), 0);
          const subjectHash = dayHash + subject.charCodeAt(0);
          const questions = Math.max(5, baseQuestions + ((subjectHash % 20) - 10));
          
          kpiQuestions.push({
            date: dateStr,
            subject: subject,
            questions: questions
          });
          
          // Süre verisi
          const baseMinutes = subject === 'matematik' ? 90 : subject === 'fizik' ? 75 : 60;
          const duration = Math.max(30, baseMinutes + ((subjectHash % 60) - 30));
          
          kpiStudyDuration.push({
            date: dateStr,
            subject: subject,
            duration: duration
          });
        });
      }
      
      return { kpiQuestions, kpiStudyDuration };
    };
    
    const { kpiQuestions, kpiStudyDuration } = generateKPIData();
    
    if (!kpiQuestions || !kpiStudyDuration) return {};

    // Calculate total study time (in minutes)
    const totalStudyTime = kpiStudyDuration.reduce((total, record) => total + record.duration, 0);
    
    // Calculate total questions
    const totalQuestions = kpiQuestions.reduce((total, record) => total + record.questions, 0);
    
    // Calculate real average accuracy from correct/total questions
    const calculateRealAccuracy = () => {
      if (!kpiQuestions.length) return 0;
      
      // Generate realistic correct answers based on questions
      let totalCorrect = 0;
      let totalQuestions = 0;
      
      kpiQuestions.forEach(record => {
        totalQuestions += record.questions;
        // Use subject-based accuracy rates for realistic calculation
        const subjectAccuracy = record.subject === 'matematik' ? 0.72 : 
                               record.subject === 'fizik' ? 0.68 :
                               record.subject === 'turkce' ? 0.78 : 
                               record.subject === 'kimya' ? 0.70 :
                               record.subject === 'biyoloji' ? 0.75 : 0.73;
        totalCorrect += Math.round(record.questions * subjectAccuracy);
      });
      
      return totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;
    };
    
    const averageAccuracy = calculateRealAccuracy();

    // Find favorite subject (most studied) from filtered subjects
    const subjectTimes = {};
    kpiStudyDuration.forEach(record => {
      subjectTimes[record.subject] = (subjectTimes[record.subject] || 0) + record.duration;
    });
    const favoriteSubject = Object.keys(subjectTimes).length > 0 ? 
      Object.keys(subjectTimes).reduce((a, b) => (subjectTimes[a] || 0) > (subjectTimes[b] || 0) ? a : b) : null;

    // Calculate study streak (mock - based on consecutive days with data)
    const uniqueDates = [...new Set(kpiQuestions.map(record => record.date))].sort();
    const studyStreak = Math.min(uniqueDates.length, 12); // Cap at 12 days

    // Calculate changes based on selected time range
    const timeRangeDays = parseInt(selectedTimeRange);
    let comparisonPeriod, timeChange = 0, questionChange = 0;

    // Determine comparison period based on selected time range
    if (timeRangeDays <= 7) {
      comparisonPeriod = 'bu hafta';
      // Compare last 3 days vs first 4 days
      const cutoffIndex = Math.floor(kpiQuestions.length * 0.6);
      const earlierPeriod = kpiQuestions.slice(0, cutoffIndex);
      const laterPeriod = kpiQuestions.slice(cutoffIndex);
      
      const earlierTime = earlierPeriod.reduce((sum, record) => {
        const studyRecord = kpiStudyDuration.find(s => s.date === record.date && s.subject === record.subject);
        return sum + (studyRecord?.duration || 0);
      }, 0);
      
      const laterTime = laterPeriod.reduce((sum, record) => {
        const studyRecord = kpiStudyDuration.find(s => s.date === record.date && s.subject === record.subject);
        return sum + (studyRecord?.duration || 0);
      }, 0);
      
      const earlierQuestions = earlierPeriod.reduce((sum, record) => sum + record.questions, 0);
      const laterQuestions = laterPeriod.reduce((sum, record) => sum + record.questions, 0);
      
      timeChange = earlierTime > 0 ? Math.round(((laterTime - earlierTime) / earlierTime) * 100) : 0;
      questionChange = earlierQuestions > 0 ? Math.round(((laterQuestions - earlierQuestions) / earlierQuestions) * 100) : 0;
    } else if (timeRangeDays <= 30) {
      comparisonPeriod = 'bu ay';
      // Compare last 2 weeks vs first 2 weeks
      const midPoint = Math.floor(kpiQuestions.length / 2);
      const firstHalf = kpiQuestions.slice(0, midPoint);
      const secondHalf = kpiQuestions.slice(midPoint);
      
      const firstHalfTime = firstHalf.reduce((sum, record) => {
        const studyRecord = kpiStudyDuration.find(s => s.date === record.date && s.subject === record.subject);
        return sum + (studyRecord?.duration || 0);
      }, 0);
      
      const secondHalfTime = secondHalf.reduce((sum, record) => {
        const studyRecord = kpiStudyDuration.find(s => s.date === record.date && s.subject === record.subject);
        return sum + (studyRecord?.duration || 0);
      }, 0);
      
      const firstHalfQuestions = firstHalf.reduce((sum, record) => sum + record.questions, 0);
      const secondHalfQuestions = secondHalf.reduce((sum, record) => sum + record.questions, 0);
      
      timeChange = firstHalfTime > 0 ? Math.round(((secondHalfTime - firstHalfTime) / firstHalfTime) * 100) : 0;
      questionChange = firstHalfQuestions > 0 ? Math.round(((secondHalfQuestions - firstHalfQuestions) / firstHalfQuestions) * 100) : 0;
    } else if (timeRangeDays <= 90) {
      comparisonPeriod = 'son 3 ay';
      // Compare last month vs first 2 months
      const cutoffIndex = Math.floor(kpiQuestions.length * 0.67);
      const earlierPeriod = kpiQuestions.slice(0, cutoffIndex);
      const laterPeriod = kpiQuestions.slice(cutoffIndex);
      
      const earlierTime = earlierPeriod.reduce((sum, record) => {
        const studyRecord = kpiStudyDuration.find(s => s.date === record.date && s.subject === record.subject);
        return sum + (studyRecord?.duration || 0);
      }, 0);
      
      const laterTime = laterPeriod.reduce((sum, record) => {
        const studyRecord = kpiStudyDuration.find(s => s.date === record.date && s.subject === record.subject);
        return sum + (studyRecord?.duration || 0);
      }, 0);
      
      const earlierQuestions = earlierPeriod.reduce((sum, record) => sum + record.questions, 0);
      const laterQuestions = laterPeriod.reduce((sum, record) => sum + record.questions, 0);
      
      timeChange = earlierTime > 0 ? Math.round(((laterTime - earlierTime) / earlierTime) * 100) : 0;
      questionChange = earlierQuestions > 0 ? Math.round(((laterQuestions - earlierQuestions) / earlierQuestions) * 100) : 0;
    } else {
      comparisonPeriod = 'son 6 ay';
      // For year view, compare last 6 months vs first 6 months  
      const midPoint = Math.floor(kpiQuestions.length / 2);
      const firstHalf = kpiQuestions.slice(0, midPoint);
      const secondHalf = kpiQuestions.slice(midPoint);
      
      const firstHalfTime = firstHalf.reduce((sum, record) => {
        const studyRecord = kpiStudyDuration.find(s => s.date === record.date && s.subject === record.subject);
        return sum + (studyRecord?.duration || 0);
      }, 0);
      
      const secondHalfTime = secondHalf.reduce((sum, record) => {
        const studyRecord = kpiStudyDuration.find(s => s.date === record.date && s.subject === record.subject);
        return sum + (studyRecord?.duration || 0);
      }, 0);
      
      const firstHalfQuestions = firstHalf.reduce((sum, record) => sum + record.questions, 0);
      const secondHalfQuestions = secondHalf.reduce((sum, record) => sum + record.questions, 0);
      
      timeChange = firstHalfTime > 0 ? Math.round(((secondHalfTime - firstHalfTime) / firstHalfTime) * 100) : 0;
      questionChange = firstHalfQuestions > 0 ? Math.round(((secondHalfQuestions - firstHalfQuestions) / firstHalfQuestions) * 100) : 0;
    }

    // Calculate subject performance (accuracy rates) - only for filtered subjects
    const subjectAccuracyData = [];
    const subjectQuestionCounts = {};
    
    kpiQuestions.forEach(record => {
      if (!subjectQuestionCounts[record.subject]) {
        subjectQuestionCounts[record.subject] = 0;
      }
      subjectQuestionCounts[record.subject] += record.questions;
    });
    
    Object.keys(subjectQuestionCounts).forEach(subject => {
      // Calculate realistic accuracy based on subject difficulty
      const baseAccuracy = subject === 'matematik' ? 72 : 
                          subject === 'fizik' ? 68 :
                          subject === 'turkce' ? 78 : 
                          subject === 'kimya' ? 70 :
                          subject === 'biyoloji' ? 75 : 
                          subject === 'tarih' ? 73 :
                          subject === 'edebiyat' ? 76 : 
                          subject === 'cografya' ? 71 :
                          subject === 'felsefe' ? 69 : 74;
      
      // Add practice bonus (more questions = slight improvement, but realistic cap)
      const totalQuestions = subjectQuestionCounts[subject];
      const practiceBonus = Math.min(6, Math.floor(totalQuestions / 150)); // More conservative bonus
      
      // Add time-based improvement (longer study period = slight improvement)
      const timeBonus = selectedTimeRange === '365' ? 3 : 
                       selectedTimeRange === '90' ? 2 : 
                       selectedTimeRange === '30' ? 1 : 0;
      
      const finalAccuracy = Math.min(88, Math.max(45, baseAccuracy + practiceBonus + timeBonus));
      
      subjectAccuracyData.push({
        subject: subject,
        accuracy_rate: finalAccuracy
      });
    });

    // Calculate study time distribution (percentages)
    const totalTime = kpiStudyDuration.reduce((sum, record) => sum + record.duration, 0);
    const subjectTimeDistribution = [];
    
    Object.keys(subjectTimes).forEach(subject => {
      const percentage = totalTime > 0 ? Math.round((subjectTimes[subject] / totalTime) * 100) : 0;
      subjectTimeDistribution.push({
        subject: subject,
        percentage: percentage
      });
    });

    return {
      totalStudyTime,
      totalQuestions,
      averageAccuracy,
      studyStreak,
      favoriteSubject: favoriteSubject && typeof favoriteSubject === 'string' ? 
        favoriteSubject.charAt(0).toUpperCase() + favoriteSubject.slice(1) : null,
      goalProgress: Math.min(85, Math.round((totalQuestions / 1000) * 100)), // Mock goal of 1000 questions
      timeChange: Math.max(-50, Math.min(50, timeChange)), // Cap between -50% and +50%
      questionChange: Math.max(-50, Math.min(50, questionChange)),
      comparisonPeriod,
      subjectPerformance: subjectAccuracyData,
      studyTimeDistribution: subjectTimeDistribution
    };*/
  };

  const calculatedStats = calculateOverallStats();

  // Use real API data if available, otherwise use calculated stats
  const safeStats = {
    overview: {
      totalStudyTime: stats?.overview?.totalStudyTime || calculatedStats.totalStudyTime || 0,
      totalQuestions: stats?.overview?.totalQuestions || calculatedStats.totalQuestions || 0,
      averageAccuracy: stats?.overview?.averageAccuracy || calculatedStats.averageAccuracy || 0,
      studyStreak: stats?.overview?.studyStreak || calculatedStats.studyStreak || 0,
      favoriteSubject: stats?.overview?.favoriteSubject || calculatedStats.favoriteSubject || 'Henüz veri yok',
      goalProgress: stats?.overview?.goalProgress || calculatedStats.goalProgress || 0,
      timeChange: stats?.overview?.timeChange || calculatedStats.timeChange || 0,
      questionChange: stats?.overview?.questionChange || calculatedStats.questionChange || 0,
      comparisonPeriod: stats?.overview?.comparisonPeriod || calculatedStats.comparisonPeriod || 'bu hafta'
    },
    trends: stats?.trends || {},
    subjects: stats?.subjects || {},
    performance: {
      weeklyAverage: stats?.performance?.weeklyAverage || calculatedStats.averageAccuracy || 0,
      monthlyImprovement: stats?.performance?.monthlyImprovement || Math.abs(calculatedStats.timeChange || 0),
      strongestSubject: stats?.performance?.strongestSubject || calculatedStats.favoriteSubject || 'Henüz veri yok',
      weakestSubject: stats?.performance?.weakestSubject || 'Henüz veri yok',
      bestTimeSlot: stats?.performance?.bestTimeSlot || '14:00-16:00',
      consistency: stats?.performance?.consistency || Math.min(85, calculatedStats.studyStreak * 5) || 0
    }
  };

  if (loading || studentLoading) return <Loading />;

  // Info banner component
  const InfoBanner = () => error ? (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
      <div className="flex">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-blue-800">Demo Modu</h3>
          <p className="text-sm text-blue-700 mt-1">{error}</p>
        </div>
      </div>
    </div>
  ) : null;

  return (
    <div>
      <div className="space-y-6 p-6">
        {/* Info Banner */}
        <InfoBanner />
        
        {/* Header */}
        <div className="bg-white rounded-lg border border-gray-200 p-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-4">
                <button 
                  onClick={() => navigate('/coach/dashboard')}
                  className="p-2 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors duration-200"
                >
                  <ArrowLeftIcon className="h-5 w-5 text-gray-600" />
                </button>
                <div className="w-12 h-12 bg-blue-50 border border-blue-200 flex items-center justify-center">
                  <UserIcon className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h1 className="text-2xl lg:text-3xl font-bold mb-1 text-gray-900">
                    {student?.name || 'Öğrenci'} - İstatistikler
                  </h1>
                  <p className="text-blue-600 text-base">
                    Öğrenci performans analizi ve detaylı raporlar (Koç görünümü)
                  </p>
                </div>
              </div>
              
              {/* Quick Insights - Filtered Data */}
              <div className="flex items-center gap-6 mt-6">
                <div className="flex items-center gap-2">
                  <TrophyIcon className="h-4 w-4 text-blue-600" />
                  <span className="text-sm text-gray-700">
                    {safeStats.overview.studyStreak || 0} gün streak
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingUpIcon className="h-4 w-4 text-blue-600" />
                  <span className="text-sm text-gray-700">
                    %{Math.abs(safeStats.overview.timeChange || 0)} 
                    {safeStats.overview.timeChange >= 0 ? ' artış' : ' azalış'} {safeStats.overview.comparisonPeriod}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <BookOpenIcon className="h-4 w-4 text-blue-600" />
                  <span className="text-sm text-gray-700">
                    {safeStats.overview.favoriteSubject || 'Henüz veri yok'} en çok çalışılan
                  </span>
                </div>
              </div>
            </div>
            
            {/* Controls */}
            <div className="lg:ml-8">
              <div className="flex flex-col sm:flex-row gap-3">
                <select
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value)}
                  className="bg-white rounded border border-gray-200 text-gray-900 pl-4 pr-10 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2714%27%20height%3D%278%27%20viewBox%3D%270%200%2014%208%27%20xmlns%3D%27http%3A//www.w3.org/2000/svg%27%3E%3Cpath%20d%3D%27M1%201l6%206%206-6%27%20stroke%3D%27%236b7280%27%20stroke-width%3D%272%27%20fill%3D%27none%27%20fill-rule%3D%27evenodd%27/%3E%3C/svg%3E')] bg-no-repeat bg-[position:right_0.7rem_center] bg-[size:16px]"
                >
                  <option value="7">Son 7 gün</option>
                  <option value="30">Son 30 gün</option>
                  <option value="90">Son 3 ay</option>
                  <option value="365">Son 1 yıl</option>
                </select>
                <div className="relative subject-dropdown">
                  <button 
                    className="bg-white rounded border border-gray-200 text-gray-900 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 flex items-center gap-2"
                    onClick={() => setShowSubjectDropdown(!showSubjectDropdown)}
                  >
                    <span>
                      {selectedSubjects.includes('all') 
                        ? 'Tüm Dersler' 
                        : selectedSubjects.length === 1 
                          ? getAvailableSubjects()[selectedSubjects[0]]
                          : `${selectedSubjects.length} Ders Seçili`
                      }
                    </span>
                    <FilterIcon className="h-4 w-4" />
                  </button>
                  {showSubjectDropdown && (
                    <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded shadow-lg z-10 min-w-48">
                      <div className="p-2">
                        <label className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selectedSubjects.includes('all')}
                            onChange={() => handleSubjectToggle('all')}
                            className="text-blue-600"
                          />
                          <span className="font-medium">Tüm Dersler</span>
                        </label>
                        <div className="border-t border-gray-200 my-1"></div>
                        {Object.entries(getAvailableSubjects()).map(([key, label]) => (
                          <label key={key} className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer">
                            <input
                              type="checkbox"
                              checked={selectedSubjects.includes(key)}
                              onChange={() => handleSubjectToggle(key)}
                              className="text-blue-600"
                            />
                            <span>{label}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <select
                  value={selectedExamType}
                  onChange={(e) => handleExamTypeChange(e.target.value)}
                  className="bg-white rounded border border-gray-200 text-gray-900 pl-4 pr-10 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2714%27%20height%3D%278%27%20viewBox%3D%270%200%2014%208%27%20xmlns%3D%27http%3A//www.w3.org/2000/svg%27%3E%3Cpath%20d%3D%27M1%201l6%206%206-6%27%20stroke%3D%27%236b7280%27%20stroke-width%3D%272%27%20fill%3D%27none%27%20fill-rule%3D%27evenodd%27/%3E%3C/svg%3E')] bg-no-repeat bg-[position:right_0.7rem_center] bg-[size:16px]"
                >
                  {Object.entries(EXAM_TYPES).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
                <button 
                  onClick={downloadReport}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 border border-blue-600 flex items-center gap-2 transition-colors duration-200"
                  title="İstatistik raporunu PDF formatında indir"
                >
                  <DownloadIcon className="h-4 w-4" />
                  Rapor İndir
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {/* Total Study Time */}
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-blue-50 border border-blue-200 flex items-center justify-center">
                <ClockIcon className="h-5 w-5 text-blue-600" />
              </div>
              {safeStats.overview.timeChange >= 0 ? (
                <ArrowUpIcon className="h-4 w-4 text-green-600" />
              ) : (
                <ArrowDownIcon className="h-4 w-4 text-red-600" />
              )}
            </div>
            <div>
              <h3 className="text-sm font-medium text-blue-600 mb-1">Toplam Süre</h3>
              <p className="text-xl font-bold text-gray-900">{formatTime(safeStats.overview.totalStudyTime || 0)}</p>
              <p className={`text-xs font-medium ${safeStats.overview.timeChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {safeStats.overview.timeChange >= 0 ? '+' : ''}{safeStats.overview.timeChange}% {safeStats.overview.comparisonPeriod}
              </p>
            </div>
          </div>

          {/* Total Questions */}
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-blue-50 border border-blue-200 flex items-center justify-center">
                <TargetIcon className="h-5 w-5 text-blue-600" />
              </div>
              {safeStats.overview.questionChange >= 0 ? (
                <ArrowUpIcon className="h-4 w-4 text-green-600" />
              ) : (
                <ArrowDownIcon className="h-4 w-4 text-red-600" />
              )}
            </div>
            <div>
              <h3 className="text-sm font-medium text-blue-600 mb-1">Toplam Soru</h3>
              <p className="text-xl font-bold text-gray-900">{safeStats.overview.totalQuestions || 0}</p>
              <p className={`text-xs font-medium ${safeStats.overview.questionChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {safeStats.overview.questionChange >= 0 ? '+' : ''}{safeStats.overview.questionChange}% {safeStats.overview.comparisonPeriod}
              </p>
            </div>
          </div>

          {/* Average Accuracy */}
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-blue-50 border border-blue-200 flex items-center justify-center">
                <TrendingUpIcon className="h-5 w-5 text-blue-600" />
              </div>
              <div className="text-xs text-gray-500 font-medium">
                {safeStats.overview.averageAccuracy >= 70 ? 'İyi' : 
                 safeStats.overview.averageAccuracy >= 50 ? 'Orta' : 'Düşük'}
              </div>
            </div>
            <div>
              <h3 className="text-sm font-medium text-blue-600 mb-1">Ortalama Başarı</h3>
              <p className="text-xl font-bold text-gray-900">{safeStats.overview.averageAccuracy || 0}%</p>
              <div className="w-full bg-gray-200 border border-gray-200 h-2 mt-2">
                <div 
                  className="bg-blue-600 h-2" 
                  style={{ width: `${safeStats.overview.averageAccuracy || 0}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Study Streak */}
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-blue-50 border border-blue-200 flex items-center justify-center">
                <ZapIcon className="h-5 w-5 text-blue-600" />
              </div>
              <TrophyIcon className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-blue-600 mb-1">Çalışma Serisi</h3>
              <p className="text-xl font-bold text-gray-900">{safeStats.overview.studyStreak || 0}</p>
              <p className="text-xs text-blue-600 font-medium">gün</p>
            </div>
          </div>

          {/* Favorite Subject */}
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-blue-50 border border-blue-200 flex items-center justify-center">
                <BookOpenIcon className="h-5 w-5 text-blue-600" />
              </div>
              <ActivityIcon className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-blue-600 mb-1">En Çok Çalışılan</h3>
              <p className="text-base font-bold text-gray-900">{safeStats.overview.favoriteSubject || 'Henüz veri yok'}</p>
              <p className="text-xs text-blue-600 font-medium">Bu ay</p>
            </div>
          </div>

          {/* Goal Progress */}
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-blue-50 border border-blue-200 flex items-center justify-center">
                <TargetIcon className="h-5 w-5 text-blue-600" />
              </div>
              <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 border border-gray-200 font-medium">
                {safeStats.overview.goalProgress || 0}%
              </span>
            </div>
            <div>
              <h3 className="text-sm font-medium text-blue-600 mb-1">Hedef İlerleme</h3>
              <div className="w-full bg-gray-200 border border-gray-200 h-2 mb-2">
                <div 
                  className="bg-blue-600 h-2" 
                  style={{ width: `${safeStats.overview.goalProgress}%` }}
                ></div>
              </div>
              <p className="text-xs text-blue-600 font-medium">Aylık hedef</p>
            </div>
          </div>
        </div>

        {/* Subject Performance and Study Time Distribution - Side by Side */}  
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Subject Performance Comparison */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-50 border border-blue-200 flex items-center justify-center">
                  <TrendingUpIcon className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Ders Başarı Oranları</h3>
                  <p className="text-sm text-blue-600">Derslere göre performans</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="relative chart-dropdown">
                  <button 
                    className="bg-white rounded border border-gray-200 text-gray-900 px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center gap-2"
                    onClick={() => toggleChartDropdown('subjectPerformance')}
                  >
                    <span>
                      {chartFilters.subjectPerformance.subjects.includes('all') 
                        ? 'Tüm Dersler' 
                        : chartFilters.subjectPerformance.subjects.length === 1 
                          ? ALL_SUBJECTS[chartFilters.subjectPerformance.subjects[0]]
                          : `${chartFilters.subjectPerformance.subjects.length} Ders`
                      }
                    </span>
                    <FilterIcon className="h-3 w-3" />
                  </button>
                  {chartDropdowns.subjectPerformance && (
                    <div className="absolute top-full right-0 mt-1 bg-white border border-gray-200 rounded shadow-lg z-10 min-w-48">
                      <div className="p-2">
                        <label className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer">
                          <input
                            type="checkbox"
                            checked={chartFilters.subjectPerformance.subjects.includes('all')}
                            onChange={() => handleChartSubjectToggle('subjectPerformance', 'all')}
                            className="text-blue-600"
                          />
                          <span className="font-medium">Tüm Dersler</span>
                        </label>
                        <div className="border-t border-gray-200 my-1"></div>
                        {Object.entries(ALL_SUBJECTS).map(([key, label]) => (
                          <label key={key} className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer">
                            <input
                              type="checkbox"
                              checked={chartFilters.subjectPerformance.subjects.includes(key)}
                              onChange={() => handleChartSubjectToggle('subjectPerformance', key)}
                              className="text-blue-600"
                            />
                            <span>{label}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            {chartsLoading ? <ChartLoading /> : (
              subjectPerformance.length > 0 ? (
                <BarChart 
                  data={formatChartData.subjectPerformanceComparison(
                    chartFilters.subjectPerformance.subjects.includes('all') 
                      ? subjectPerformance 
                      : subjectPerformance.filter(item => chartFilters.subjectPerformance.subjects.includes(item.subject))
                  )} 
                  title={`${chartFilters.subjectPerformance.subjects.includes('all') 
                    ? 'Tüm Dersler' 
                    : chartFilters.subjectPerformance.subjects.length === 1 
                      ? ALL_SUBJECTS[chartFilters.subjectPerformance.subjects[0]]
                      : `${chartFilters.subjectPerformance.subjects.length} Ders`
                  } - Başarı Oranları`}
                  height={320}
                />
              ) : (
                <div className="h-64 flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <TrendingUpIcon className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                    <p className="text-sm">Seçilen filtrelerde performans verisi bulunmuyor</p>
                    <p className="text-xs text-gray-400 mt-1">Farklı zaman aralığı veya ders seçmeyi deneyin</p>
                  </div>
                </div>
              )
            )}
          </div>

          {/* Study Time Distribution */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-50 border border-blue-200 flex items-center justify-center">
                  <ClockIcon className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Çalışma Zamanı Dağılımı</h3>
                  <p className="text-sm text-blue-600">Derslere ayrılan zaman oranı</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="relative chart-dropdown">
                  <button 
                    className="bg-white rounded border border-gray-200 text-gray-900 px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center gap-2"
                    onClick={() => toggleChartDropdown('studyTimeDistribution')}
                  >
                    <span>
                      {chartFilters.studyTimeDistribution.subjects.includes('all') 
                        ? 'Tüm Dersler' 
                        : chartFilters.studyTimeDistribution.subjects.length === 1 
                          ? ALL_SUBJECTS[chartFilters.studyTimeDistribution.subjects[0]]
                          : `${chartFilters.studyTimeDistribution.subjects.length} Ders`
                      }
                    </span>
                    <FilterIcon className="h-3 w-3" />
                  </button>
                  {chartDropdowns.studyTimeDistribution && (
                    <div className="absolute top-full right-0 mt-1 bg-white border border-gray-200 rounded shadow-lg z-10 min-w-48">
                      <div className="p-2">
                        <label className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer">
                          <input
                            type="checkbox"
                            checked={chartFilters.studyTimeDistribution.subjects.includes('all')}
                            onChange={() => handleChartSubjectToggle('studyTimeDistribution', 'all')}
                            className="text-blue-600"
                          />
                          <span className="font-medium">Tüm Dersler</span>
                        </label>
                        <div className="border-t border-gray-200 my-1"></div>
                        {Object.entries(ALL_SUBJECTS).map(([key, label]) => (
                          <label key={key} className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer">
                            <input
                              type="checkbox"
                              checked={chartFilters.studyTimeDistribution.subjects.includes(key)}
                              onChange={() => handleChartSubjectToggle('studyTimeDistribution', key)}
                              className="text-blue-600"
                            />
                            <span>{label}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            {chartsLoading ? <ChartLoading /> : (
              studyTimeDistribution.length > 0 ? (
                <DoughnutChart 
                  data={formatChartData.studyTimeDistribution(
                    chartFilters.studyTimeDistribution.subjects.includes('all') 
                      ? studyTimeDistribution 
                      : studyTimeDistribution.filter(item => chartFilters.studyTimeDistribution.subjects.includes(item.subject))
                  )} 
                  title="Zaman Dağılımı (%)"
                  height={320}
                />
              ) : (
                <div className="h-64 flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <ClockIcon className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                    <p className="text-sm">Seçilen filtrelerde çalışma süresi verisi bulunmuyor</p>
                    <p className="text-xs text-gray-400 mt-1">Farklı zaman aralığı veya ders seçmeyi deneyin</p>
                  </div>
                </div>
              )
            )}
          </div>
        </div>

        {/* Daily Questions Chart - Full Width */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-50 border border-blue-200 flex items-center justify-center">
                <TargetIcon className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Günlük Soru Sayıları</h3>
                <p className="text-sm text-blue-600">Derslere göre çözülen sorular</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {/* Zaman Navigasyonu */}
              <div className="flex items-center gap-1 bg-gray-50 rounded border border-gray-200">
                <button
                  onClick={() => updateChartFilter('dailyQuestions', 'timeOffset', chartFilters.dailyQuestions.timeOffset + parseInt(chartFilters.dailyQuestions.timeRange))}
                  className="p-1 hover:bg-gray-100 rounded-l text-gray-600 hover:text-gray-900"
                  title="Geçmişe git"
                >
                  <ChevronLeftIcon className="h-4 w-4" />
                </button>
                <div className="px-2 py-1 text-xs text-gray-600 border-x border-gray-200 min-w-16 text-center">
                  {chartFilters.dailyQuestions.timeOffset === 0 ? 'Güncel' : `${chartFilters.dailyQuestions.timeOffset}g önce`}
                </div>
                <button
                  onClick={() => updateChartFilter('dailyQuestions', 'timeOffset', Math.max(0, chartFilters.dailyQuestions.timeOffset - parseInt(chartFilters.dailyQuestions.timeRange)))}
                  disabled={chartFilters.dailyQuestions.timeOffset === 0}
                  className="p-1 hover:bg-gray-100 rounded-r text-gray-600 hover:text-gray-900 disabled:text-gray-300 disabled:cursor-not-allowed"
                  title="Bugüne yaklaş"
                >
                  <ChevronRightIcon className="h-4 w-4" />
                </button>
              </div>
              
              <select
                value={chartFilters.dailyQuestions.timeRange}
                onChange={(e) => updateChartFilter('dailyQuestions', 'timeRange', e.target.value)}
                className="bg-white rounded border border-gray-200 text-gray-900 pl-3 pr-8 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2714%27%20height%3D%278%27%20viewBox%3D%270%200%2014%208%27%20xmlns%3D%27http%3A//www.w3.org/2000/svg%27%3E%3Cpath%20d%3D%27M1%201l6%206%206-6%27%20stroke%3D%27%236b7280%27%20stroke-width%3D%272%27%20fill%3D%27none%27%20fill-rule%3D%27evenodd%27/%3E%3C/svg%3E')] bg-no-repeat bg-[position:right_0.5rem_center] bg-[size:14px]"
              >
                <option value="7">Son 7 gün</option>
                <option value="30">Son 30 gün</option>
                <option value="90">Son 3 ay</option>
              </select>
              <div className="relative chart-dropdown">
                <button 
                  className="bg-white rounded border border-gray-200 text-gray-900 px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center gap-2"
                  onClick={() => toggleChartDropdown('dailyQuestions')}
                >
                  <span>
                    {chartFilters.dailyQuestions.subjects.includes('all') 
                      ? 'Tüm Dersler' 
                      : chartFilters.dailyQuestions.subjects.length === 1 
                        ? ALL_SUBJECTS[chartFilters.dailyQuestions.subjects[0]]
                        : `${chartFilters.dailyQuestions.subjects.length} Ders`
                    }
                  </span>
                  <FilterIcon className="h-3 w-3" />
                </button>
                {chartDropdowns.dailyQuestions && (
                  <div className="absolute top-full right-0 mt-1 bg-white border border-gray-200 rounded shadow-lg z-10 min-w-48">
                    <div className="p-2">
                      <label className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer">
                        <input
                          type="checkbox"
                          checked={chartFilters.dailyQuestions.subjects.includes('all')}
                          onChange={() => handleChartSubjectToggle('dailyQuestions', 'all')}
                          className="text-blue-600"
                        />
                        <span className="font-medium">Tüm Dersler</span>
                      </label>
                      <div className="border-t border-gray-200 my-1"></div>
                      {Object.entries(ALL_SUBJECTS).map(([key, label]) => (
                        <label key={key} className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer">
                          <input
                            type="checkbox"
                            checked={chartFilters.dailyQuestions.subjects.includes(key)}
                            onChange={() => handleChartSubjectToggle('dailyQuestions', key)}
                            className="text-blue-600"
                          />
                          <span>{label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <RefreshCwIcon className="h-5 w-5 text-gray-500 cursor-pointer" onClick={fetchDailyQuestionsData} />
            </div>
          </div>
          {dailyQuestionsLoading ? <ChartLoading /> : (
            dailyQuestions.length > 0 ? (
              <BarChart 
                data={formatChartData.dailyQuestionsBySubject(
                  chartFilters.dailyQuestions.subjects.includes('all') 
                    ? dailyQuestions 
                    : dailyQuestions.filter(item => chartFilters.dailyQuestions.subjects.includes(item.subject))
                )} 
                title={`${chartFilters.dailyQuestions.subjects.includes('all') 
                  ? 'Tüm Dersler' 
                  : chartFilters.dailyQuestions.subjects.length === 1 
                    ? ALL_SUBJECTS[chartFilters.dailyQuestions.subjects[0]]
                    : `${chartFilters.dailyQuestions.subjects.length} Ders`
                } - Son ${chartFilters.dailyQuestions.timeRange} Günlük Soru Dağılımı`}
                height={400}
                stacked={true}
              />
            ) : (
              <div className="h-64 flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <TargetIcon className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">Seçilen filtrelerde çalışma verisi bulunmuyor</p>
                  <p className="text-xs text-gray-400 mt-1">Farklı zaman aralığı veya ders seçmeyi deneyin</p>
                </div>
              </div>
            )
          )}
        </div>

        {/* Mock Exam Progress Chart - Full Width */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-50 border border-blue-200 flex items-center justify-center">
                <TrophyIcon className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Günlük Deneme Performansı</h3>
                <p className="text-sm text-blue-600">Günlük deneme sınavı net puanları</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {/* Zaman Navigasyonu */}
              <div className="flex items-center gap-1 bg-gray-50 rounded border border-gray-200">
                <button
                  onClick={() => updateChartFilter('mockExamProgress', 'timeOffset', chartFilters.mockExamProgress.timeOffset + parseInt(chartFilters.mockExamProgress.timeRange))}
                  className="p-1 hover:bg-gray-100 rounded-l text-gray-600 hover:text-gray-900"
                  title="Geçmişe git"
                >
                  <ChevronLeftIcon className="h-4 w-4" />
                </button>
                <div className="px-2 py-1 text-xs text-gray-600 border-x border-gray-200 min-w-16 text-center">
                  {chartFilters.mockExamProgress.timeOffset === 0 ? 'Güncel' : `${chartFilters.mockExamProgress.timeOffset}g önce`}
                </div>
                <button
                  onClick={() => updateChartFilter('mockExamProgress', 'timeOffset', Math.max(0, chartFilters.mockExamProgress.timeOffset - parseInt(chartFilters.mockExamProgress.timeRange)))}
                  disabled={chartFilters.mockExamProgress.timeOffset === 0}
                  className="p-1 hover:bg-gray-100 rounded-r text-gray-600 hover:text-gray-900 disabled:text-gray-300 disabled:cursor-not-allowed"
                  title="Bugüne yaklaş"
                >
                  <ChevronRightIcon className="h-4 w-4" />
                </button>
              </div>
              
              <select
                value={chartFilters.mockExamProgress.timeRange}
                onChange={(e) => updateChartFilter('mockExamProgress', 'timeRange', e.target.value)}
                className="bg-white rounded border border-gray-200 text-gray-900 pl-3 pr-8 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2714%27%20height%3D%278%27%20viewBox%3D%270%200%2014%208%27%20xmlns%3D%27http%3A//www.w3.org/2000/svg%27%3E%3Cpath%20d%3D%27M1%201l6%206%206-6%27%20stroke%3D%27%236b7280%27%20stroke-width%3D%272%27%20fill%3D%27none%27%20fill-rule%3D%27evenodd%27/%3E%3C/svg%3E')] bg-no-repeat bg-[position:right_0.5rem_center] bg-[size:14px]"
              >
                <option value="7">Son 7 gün</option>
                <option value="30">Son 30 gün</option>
                <option value="90">Son 3 ay</option>
              </select>
              
              <select
                value={chartFilters.mockExamProgress.examType}
                onChange={(e) => updateChartFilter('mockExamProgress', 'examType', e.target.value)}
                className="bg-white rounded border border-gray-200 text-gray-900 pl-3 pr-8 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2714%27%20height%3D%278%27%20viewBox%3D%270%200%2014%208%27%20xmlns%3D%27http%3A//www.w3.org/2000/svg%27%3E%3Cpath%20d%3D%27M1%201l6%206%206-6%27%20stroke%3D%27%236b7280%27%20stroke-width%3D%272%27%20fill%3D%27none%27%20fill-rule%3D%27evenodd%27/%3E%3C/svg%3E')] bg-no-repeat bg-[position:right_0.5rem_center] bg-[size:14px]"
              >
                <option value="TYT">TYT</option>
                <option value="AYT">AYT</option>
              </select>
              
              {/* AYT Alan Seçici - Sadece AYT seçiliyken göster */}
              {chartFilters.mockExamProgress.examType === 'AYT' && (
                <select
                  value={chartFilters.mockExamProgress.aytCategory}
                  onChange={(e) => updateChartFilter('mockExamProgress', 'aytCategory', e.target.value)}
                  className="bg-white rounded border border-gray-200 text-gray-900 pl-3 pr-8 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2714%27%20height%3D%278%27%20viewBox%3D%270%200%2014%208%27%20xmlns%3D%27http%3A//www.w3.org/2000/svg%27%3E%3Cpath%20d%3D%27M1%201l6%206%206-6%27%20stroke%3D%27%236b7280%27%20stroke-width%3D%272%27%20fill%3D%27none%27%20fill-rule%3D%27evenodd%27/%3E%3C/svg%3E')] bg-no-repeat bg-[position:right_0.5rem_center] bg-[size:14px]"
                >
                  <option value="SAY">Sayısal</option>
                  <option value="SÖZ">Sözel</option>
                  <option value="EA">Eşit Ağırlık</option>
                  <option value="DIL">Dil</option>
                </select>
              )}
              <RefreshCwIcon className="h-5 w-5 text-gray-500 cursor-pointer" onClick={fetchMockExamData} />
            </div>
            </div>
            {mockExamLoading ? <ChartLoading /> : (
              mockExamProgress && mockExamProgress[chartFilters.mockExamProgress.examType] ? (
                <BarChart 
                  data={formatChartData.mockExamProgress(
                    mockExamProgress[chartFilters.mockExamProgress.examType]
                  )} 
                  title={`${chartFilters.mockExamProgress.examType}${chartFilters.mockExamProgress.examType === 'AYT' ? ` ${chartFilters.mockExamProgress.aytCategory}` : ''} - Son ${chartFilters.mockExamProgress.timeRange} Günlük Deneme Net Dağılımı`}
                  height={320}
                  stacked={true}
                />
              ) : (
                <div className="h-64 flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <TrendingUpIcon className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                    <p>Henüz deneme sınavı verisi bulunmuyor</p>
                  </div>
                </div>
              )
            )}
          </div>

        {/* Daily Study Duration Chart - Full Width */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-50 border border-blue-200 flex items-center justify-center">
                <ClockIcon className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Günlük Çalışma Süreleri</h3>
                <p className="text-sm text-blue-600">Derslere göre günlük çalışma süresi dağılımı</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {/* Günlük çalışma süresi navigasyon sistemi */}
              <div className="flex items-center gap-1 bg-gray-50 rounded border border-gray-200">
                <button
                  onClick={() => updateChartFilter('studyDuration', 'timeOffset', chartFilters.studyDuration.timeOffset + parseInt(chartFilters.studyDuration.timeRange))}
                  className="p-1 hover:bg-gray-100 rounded-l text-gray-600 hover:text-gray-900"
                  title="Geçmişe git"
                >
                  <ChevronLeftIcon className="h-4 w-4" />
                </button>
                <div className="px-2 py-1 text-xs text-gray-600 border-x border-gray-200 min-w-16 text-center">
                  {chartFilters.studyDuration.timeOffset === 0 ? 'Güncel' : `${chartFilters.studyDuration.timeOffset}g önce`}
                </div>
                <button
                  onClick={() => updateChartFilter('studyDuration', 'timeOffset', Math.max(0, chartFilters.studyDuration.timeOffset - parseInt(chartFilters.studyDuration.timeRange)))}
                  disabled={chartFilters.studyDuration.timeOffset === 0}
                  className="p-1 hover:bg-gray-100 rounded-r text-gray-600 hover:text-gray-900 disabled:text-gray-300 disabled:cursor-not-allowed"
                  title="Bugüne yaklaş"
                >
                  <ChevronRightIcon className="h-4 w-4" />
                </button>
              </div>
              
              <select
                value={chartFilters.studyDuration.timeRange}
                onChange={(e) => updateChartFilter('studyDuration', 'timeRange', e.target.value)}
                className="bg-white rounded border border-gray-200 text-gray-900 pl-3 pr-8 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2714%27%20height%3D%278%27%20viewBox%3D%270%200%2014%208%27%20xmlns%3D%27http%3A//www.w3.org/2000/svg%27%3E%3Cpath%20d%3D%27M1%201l6%206%206-6%27%20stroke%3D%27%236b7280%27%20stroke-width%3D%272%27%20fill%3D%27none%27%20fill-rule%3D%27evenodd%27/%3E%3C/svg%3E')] bg-no-repeat bg-[position:right_0.5rem_center] bg-[size:14px]"
              >
                <option value="7">Son 7 gün</option>
                <option value="30">Son 30 gün</option>
                <option value="90">Son 3 ay</option>
              </select>
              <RefreshCwIcon className="h-5 w-5 text-gray-500 cursor-pointer" onClick={fetchStudyDurationData} />
            </div>
          </div>
          {studyDurationLoading ? <ChartLoading /> : (
            dailyStudyDuration.length > 0 ? (
              <BarChart 
                data={formatChartData.dailyStudyDuration(dailyStudyDuration)} 
                title="Günlük Ders Bazlı Çalışma Süresi Dağılımı"
                height={400}
                stacked={true}
              />
            ) : (
              <div className="h-64 flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <ClockIcon className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                  <p>Henüz çalışma süresi verisi bulunmuyor</p>
                </div>
              </div>
            )
          )}
        </div>


      </div>
    </div>
  );
};

export default StudentStatistics;