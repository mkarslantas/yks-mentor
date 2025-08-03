import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { studentService } from '../../services/student.service';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import moment from 'moment';
import 'moment/locale/tr';
import { toast } from 'react-hot-toast';
import 'react-big-calendar/lib/addons/dragAndDrop/styles.css';
import { 
  ClockIcon, 
  BookOpenIcon, 
  TrendingUpIcon, 
  TargetIcon, 
  CheckCircleIcon,
  CalendarIcon,
  CheckIcon,
  XIcon,
  EditIcon,
  SaveIcon,
  QuoteIcon,
  RefreshCwIcon,
  LanguagesIcon,
  AlertTriangleIcon,
  ZapIcon,
  StarIcon,
  ChevronRightIcon,
  ArrowUpIcon,
  PlayIcon,
  PauseIcon,
  FilterIcon,
  EyeIcon,
  FileTextIcon
} from 'lucide-react';
import Loading from '../../components/common/Loading';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import './StudentDashboard.css';

// Moment'i Türkçe yapılandır
moment.locale('tr');
const localizer = momentLocalizer(moment);

// Create DnD Calendar
const DnDCalendar = withDragAndDrop(Calendar);

const StudentDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [completingTask, setCompletingTask] = useState(false);
  const [editingTask, setEditingTask] = useState(false);
  const [updatingTask, setUpdatingTask] = useState(false);
  const [taskForm, setTaskForm] = useState({
    student_notes: '',
    questions_solved: 0,
    topics_studied: '',
    study_duration: 0
  });
  const [currentQuote, setCurrentQuote] = useState(null);
  const [showEnglish, setShowEnglish] = useState(false);
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [taskToComplete, setTaskToComplete] = useState(null);
  const [completionForm, setCompletionForm] = useState({
    questions_solved: '',
    topics_studied: '',
    study_duration: '',
    student_notes: ''
  });
  const [showOverdueWarning, setShowOverdueWarning] = useState(true);
  const [expandedQuickStats, setExpandedQuickStats] = useState(false);
  const [calendarView, setCalendarView] = useState('week');
  const [showFilters, setShowFilters] = useState(false);

  // Helper functions - defined before useEffect
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return '#ef4444'; // red
      case 'medium':
        return '#f59e0b'; // amber
      case 'low':
        return '#10b981'; // green
      default:
        return '#6b7280'; // gray
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return '#10b981'; // green
      case 'in_progress':
        return '#f59e0b'; // amber
      case 'pending':
        return '#6b7280'; // gray
      default:
        return '#6b7280';
    }
  };

  const getPriorityText = (priority) => {
    switch (priority) {
      case 'high': return 'Yüksek';
      case 'medium': return 'Orta';
      case 'low': return 'Düşük';
      default: return 'Belirsiz';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'completed': return 'Tamamlandı';
      case 'in_progress': return 'Devam Ediyor';
      case 'pending': return 'Bekliyor';
      default: return 'Belirsiz';
    }
  };

  const getStudyTypeColor = (studyType) => {
    switch (studyType) {
      case 'konu_calismasi':
        return '#10b981'; // Green - Konu Çalışması
      case 'soru_cozumu':
        return '#3b82f6'; // Blue - Soru Çözümü  
      case 'tekrar':
        return '#f59e0b'; // Orange - Tekrar
      case 'deneme_sinavi':
        return '#8b5cf6'; // Purple - Deneme Sınavı
      default:
        return '#10b981'; // Default green
    }
  };

  // Get study type from record - now directly from backend after migration
  const getStudyTypeFromRecord = (record) => {
    // Use study_type directly from backend (after migration)
    if (record.study_type && record.study_type !== 'undefined') {
      return record.study_type;
    }

    // Fallback logic for old records without study_type
    if (record.questions_solved > 0) {
      return 'soru_cozumu';
    }
    
    return 'konu_calismasi';
  };

  const formatTime = (minutes) => {
    if (minutes < 60) return `${minutes} dk`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}s ${mins}dk` : `${hours} saat`;
  };

  const fetchRandomQuote = async () => {
    try {
      setQuoteLoading(true);
      const quote = await studentService.getRandomQuote();
      setCurrentQuote(quote);
      console.log('✨ Fetched quote:', quote);
    } catch (error) {
      console.error('❌ Quote fetch error:', error);
      // Don't show error toast for quotes as it's not critical
    } finally {
      setQuoteLoading(false);
    }
  };

  // Calendar event styling
  const eventStyleGetter = (event) => {
    // Study records are always "completed" (they're past events)
    if (event.resource.isStudyRecord) {
      const baseColor = event.resource.color;
      // Generate a darker border color
      const borderColor = baseColor.replace('#', '').match(/.{2}/g)
        .map(hex => Math.max(0, parseInt(hex, 16) - 30).toString(16).padStart(2, '0'))
        .join('');
      
      return {
        style: {
          backgroundColor: baseColor,
          borderRadius: '6px',
          opacity: 0.9,
          color: 'white',
          border: `1px solid #${borderColor}`,
          display: 'block',
          fontSize: '12px',
          fontWeight: '500'
        }
      };
    }
    
    // Task styling
    const isCompleted = event.resource.status === 'completed';
    
    return {
      style: {
        backgroundColor: isCompleted ? '#10b981' : event.resource.color,
        borderRadius: '6px',
        opacity: isCompleted ? 0.7 : 0.9,
        color: 'white',
        border: '0px',
        display: 'block',
        fontSize: '12px',
        textDecoration: isCompleted ? 'line-through' : 'none'
      }
    };
  };

  // Calendar messages in Turkish
  const messages = {
    allDay: 'Tüm gün',
    previous: 'Önceki',
    next: 'Sonraki',
    today: 'Bugün',
    month: 'Ay',
    week: 'Hafta',
    day: 'Gün',
    agenda: 'Ajanda',
    date: 'Tarih',
    time: 'Saat',
    event: 'Görev',
    noEventsInRange: 'Bu tarih aralığında görev yok',
    showMore: total => `+${total} daha fazla`
  };

  const handleSelectEvent = (event) => {
    // Navigate to study history for study records
    if (event.resource.isStudyRecord) {
      // Navigate with the record ID as a query parameter
      navigate(`/study/history?record=${event.resource.id}`);
      return;
    }
    
    // Show modal for tasks
    setSelectedTask(event.resource);
    setTaskForm({
      student_notes: event.resource.student_notes || '',
      questions_solved: event.resource.questions_solved || 0,
      topics_studied: event.resource.topics_studied || '',
      study_duration: event.resource.study_duration || 0
    });
    setEditingTask(false);
    setShowTaskModal(true);
  };

  const handleUpdateTask = async () => {
    try {
      console.log('📝 Starting task update for task ID:', selectedTask.id);
      console.log('📝 Task form data:', taskForm);
      console.log('📝 Selected task:', selectedTask);
      setUpdatingTask(true);
      
      const response = await studentService.updateTaskNotes(selectedTask.id, taskForm);
      console.log('✅ Task update response:', response);
      
      // Update tasks state
      setTasks(tasks.map(task => 
        task.id === selectedTask.id 
          ? { ...task, resource: { ...task.resource, ...taskForm } }
          : task
      ));
      
      // Update selected task
      setSelectedTask({ ...selectedTask, ...taskForm });
      
      toast.success('Görev notları güncellendi! 📝');
      setEditingTask(false);
      console.log('✅ Task update completed successfully');
    } catch (error) {
      console.error('❌ Update task error:', error);
      console.error('❌ Error response:', error.response?.data);
      console.error('❌ Error status:', error.response?.status);
      console.error('❌ Error message:', error.message);
      console.error('❌ Full error object:', error);
      
      if (error.response?.status === 404) {
        toast.error('Görev bulunamadı');
      } else if (error.response?.status === 401) {
        toast.error('Yetkiniz yok, lütfen tekrar giriş yapın');
      } else {
        toast.error(`Görev güncellenirken hata oluştu: ${error.response?.data?.error?.message || error.message}`);
      }
    } finally {
      setUpdatingTask(false);
    }
  };

  const handleCompleteTask = (taskId) => {
    // Find the task to complete
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    
    setTaskToComplete(task);
    setCompletionForm({
      questions_solved: task.resource.questions_solved || '',
      topics_studied: task.resource.topics_studied || '',
      study_duration: task.resource.study_duration || '',
      student_notes: task.resource.student_notes || ''
    });
    setShowCompletionModal(true);
    setShowTaskModal(false); // Close task detail modal if open
  };

  const handleCompleteTaskWithDetails = async () => {
    try {
      console.log('🎯 Starting task completion with details for task ID:', taskToComplete.id);
      setCompletingTask(true);
      
      // First update the task notes with completion details
      await studentService.updateTaskNotes(taskToComplete.id, {
        questions_solved: parseInt(completionForm.questions_solved) || 0,
        topics_studied: completionForm.topics_studied,
        study_duration: parseInt(completionForm.study_duration) || 0,
        student_notes: completionForm.student_notes
      });
      
      // Then mark as completed
      const response = await studentService.completeTask(taskToComplete.id);
      console.log('✅ Task completion response:', response);
      
      // Update tasks state
      setTasks(tasks.map(task => 
        task.id === taskToComplete.id 
          ? { 
              ...task, 
              resource: { 
                ...task.resource, 
                status: 'completed',
                questions_solved: parseInt(completionForm.questions_solved) || 0,
                topics_studied: completionForm.topics_studied,
                study_duration: parseInt(completionForm.study_duration) || 0,
                student_notes: completionForm.student_notes
              } 
            }
          : task
      ));
      
      toast.success('Görev başarıyla tamamlandı! 🎉');
      setShowCompletionModal(false);
      setTaskToComplete(null);
      console.log('✅ Task completion completed successfully');
    } catch (error) {
      console.error('❌ Complete task error:', error);
      console.error('❌ Error response:', error.response?.data);
      console.error('❌ Error status:', error.response?.status);
      console.error('❌ Error message:', error.message);
      
      if (error.response?.status === 404) {
        toast.error('Görev bulunamadı');
      } else if (error.response?.status === 401) {
        toast.error('Yetkiniz yok, lütfen tekrar giriş yapın');
      } else {
        toast.error(`Görev tamamlanırken hata oluştu: ${error.response?.data?.error?.message || error.message}`);
      }
    } finally {
      setCompletingTask(false);
    }
  };

  // Drag and Drop handlers
  const handleEventDrop = async ({ event, start, end }) => {
    // Don't allow moving study records - they're historical data
    if (event.resource.isStudyRecord) {
      return;
    }
    
    try {
      console.log('🔄 Moving task:', event.title, 'to', start, '-', end);
      console.log('🔄 Event object:', event);
      console.log('🔄 Event ID:', event.id);
      console.log('🔄 Event resource:', event.resource);
      
      // Update task time in backend
      const updatedTask = {
        ...event.resource,
        due_date: start.toISOString().split('T')[0], // Update due date
        start_time: start.toISOString(),
        end_time: end.toISOString(),
        estimated_time: Math.round((end - start) / (1000 * 60)) // Calculate duration in minutes
      };

      console.log('📝 Update data being sent:', {
        due_date: updatedTask.due_date,
        start_time: updatedTask.start_time,
        end_time: updatedTask.end_time,
        estimated_time: updatedTask.estimated_time
      });

      // Call backend API to update task
      const response = await studentService.updateTaskTime(event.id, {
        due_date: updatedTask.due_date,
        start_time: updatedTask.start_time,
        end_time: updatedTask.end_time,
        estimated_time: updatedTask.estimated_time
      });

      console.log('✅ Backend response:', response);

      // Update local state
      setTasks(tasks.map(task => 
        task.id === event.id 
          ? { ...task, start, end, resource: updatedTask }
          : task
      ));

      toast.success('Görev zamanı güncellendi! ⏰');
      console.log('✅ Task time updated successfully');
    } catch (error) {
      console.error('❌ Task move error:', error);
      console.error('❌ Error details:', error.response?.data);
      console.error('❌ Error status:', error.response?.status);
      toast.error('Görev zamanı güncellenirken hata oluştu');
    }
  };

  const handleEventResize = async ({ event, start, end }) => {
    // Don't allow resizing study records - they're historical data
    if (event.resource.isStudyRecord) {
      return;
    }
    
    try {
      console.log('📏 Resizing task:', event.title, 'to', start, '-', end);
      console.log('📏 Event ID:', event.id);
      
      const estimatedTime = Math.round((end - start) / (1000 * 60));
      
      console.log('📝 Resize data being sent:', {
        estimated_time: estimatedTime,
        start_time: start.toISOString(),
        end_time: end.toISOString()
      });
      
      // Call backend API to update task duration
      const response = await studentService.updateTaskTime(event.id, {
        estimated_time: estimatedTime,
        start_time: start.toISOString(),
        end_time: end.toISOString()
      });

      console.log('✅ Backend response:', response);

      // Update local state
      setTasks(tasks.map(task => 
        task.id === event.id 
          ? { 
              ...task, 
              start, 
              end, 
              resource: { 
                ...task.resource, 
                estimated_time: estimatedTime 
              } 
            }
          : task
      ));

      toast.success(`Görev süresi ${estimatedTime} dakika olarak güncellendi! ⏱️`);
      console.log('✅ Task duration updated successfully');
    } catch (error) {
      console.error('❌ Task resize error:', error);
      console.error('❌ Error details:', error.response?.data);
      console.error('❌ Error status:', error.response?.status);
      toast.error('Görev süresi güncellenirken hata oluştu');
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('🔄 Starting data fetch for student dashboard...');
        console.log('👤 Current user:', user);
        
        // Check if user is authenticated
        const token = localStorage.getItem('accessToken');
        console.log('🔑 Access token exists:', !!token);
        
        if (!token) {
          console.error('❌ No access token found');
          setError('Giriş yapmanız gerekiyor');
          return;
        }

        console.log('📡 Fetching dashboard, tasks, and study records data...');
        
        const [dashboardResponse, tasksResponse, studyRecordsResponse] = await Promise.all([
          studentService.getDashboard(),
          studentService.getTasks(),
          studentService.getStudyRecords()
        ]);
        
        console.log('✅ Dashboard response:', dashboardResponse);
        console.log('✅ Tasks response:', tasksResponse);
        console.log('✅ Study records response:', studyRecordsResponse);
        
        setDashboardData(dashboardResponse);
        
        // Format tasks for calendar
        const formattedTasks = (tasksResponse || []).map(task => {
          const dueDate = new Date(task.due_date);
          
          // If task has estimated_time, create time-based event
          if (task.estimated_time && task.estimated_time > 0) {
            let startTime, endTime;
            
            // If task has specific start_time and end_time from database, use them
            if (task.start_time && task.end_time) {
              startTime = new Date(task.start_time);
              endTime = new Date(task.end_time);
              console.log('📅 Using stored times for task', task.id, ':', startTime, '-', endTime);
            } else {
              // Set start time based on priority (high=morning, medium=afternoon, low=evening)
              let startHour = 9; // Default to 9 AM
              if (task.priority === 'high') {
                startHour = 9; // 9 AM for high priority
              } else if (task.priority === 'medium') {
                startHour = 14; // 2 PM for medium priority  
              } else {
                startHour = 19; // 7 PM for low priority
              }
              
              startTime = new Date(dueDate);
              startTime.setHours(startHour, 0, 0, 0);
              
              endTime = new Date(startTime);
              endTime.setMinutes(endTime.getMinutes() + (task.estimated_time || 60));
              console.log('📅 Generated default times for task', task.id, ':', startTime, '-', endTime);
            }
            
            return {
              id: task.id,
              title: `${task.subject}: ${task.title}`,
              start: startTime,
              end: endTime,
              allDay: false,
              dragAndDropAllowed: task.status !== 'completed', // Don't allow moving completed tasks
              resource: {
                ...task,
                color: getPriorityColor(task.priority),
                statusColor: getStatusColor(task.status),
                duration: task.estimated_time
              }
            };
          } else {
            // All-day event for tasks without specific time
            return {
              id: task.id,
              title: `${task.subject}: ${task.title}`,
              start: dueDate,
              end: dueDate,
              allDay: true,
              resource: {
                ...task,
                color: getPriorityColor(task.priority),
                statusColor: getStatusColor(task.status)
              }
            };
          }
        });
        
        console.log('📅 Formatted tasks for calendar:', formattedTasks);
        
        // Format study records for calendar
        const formattedStudyRecords = (studyRecordsResponse || []).map(record => {
          const studyDate = new Date(record.date); // Use 'date' field, not 'study_date'
          
          // Get study type from record (now directly from backend)
          const studyType = getStudyTypeFromRecord(record);
          const studyTypeColor = getStudyTypeColor(studyType);
          
          // Create an all-day event for study records
          return {
            id: `study-${record.id}`,
            title: `📚 ${record.subject}: ${record.topic}`,
            start: studyDate,
            end: studyDate,
            allDay: true,
            dragAndDropAllowed: false, // Don't allow moving study records
            resource: {
              ...record,
              type: 'study_record',
              color: studyTypeColor, // Color based on study type
              statusColor: studyTypeColor,
              isStudyRecord: true,
              actualStudyType: studyType // Store the actual study type used
            }
          };
        });
        
        console.log('📅 Formatted study records for calendar:', formattedStudyRecords);
        
        // Combine tasks and study records
        const allEvents = [...formattedTasks, ...formattedStudyRecords];
        console.log('📅 All calendar events:', allEvents);
        setTasks(allEvents);
        
        // Fetch random quote
        await fetchRandomQuote();
        
        console.log('✅ Data fetch completed successfully');
      } catch (err) {
        console.error('❌ Data fetch error:', err);
        console.error('❌ Error details:', err.response?.data);
        console.error('❌ Error status:', err.response?.status);
        
        if (err.response?.status === 401) {
          setError('Oturum süreniz doldu, lütfen tekrar giriş yapın');
          // Redirect to login
          setTimeout(() => {
            window.location.href = '/login';
          }, 2000);
        } else {
          setError(`Veriler yüklenirken hata oluştu: ${err.response?.data?.error?.message || err.message}`);
        }
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchData();
    } else {
      console.log('👤 No user found, waiting for authentication...');
      setLoading(false);
      setError('Kullanıcı bilgileri yükleniyor...');
    }
  }, [user]);

  if (loading) {
    return <Loading text="Dashboard yükleniyor..." />;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
              <XIcon className="h-6 w-6 text-red-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Veri Yükleme Hatası</h3>
            <p className="text-gray-600 mb-6">{error}</p>
            <div className="space-y-3">
              <button
                onClick={() => window.location.reload()}
                className="w-full btn-primary"
              >
                Tekrar Dene
              </button>
              <button
                onClick={() => window.location.href = '/login'}
                className="w-full btn-secondary"
              >
                Giriş Sayfasına Git
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <style>
        {`
          .rbc-btn-group button:hover {
            background-color: #3b82f6 !important;
            color: white !important;
            border-color: #3b82f6 !important;
          }
          .rbc-btn-group .rbc-active {
            background-color: #3b82f6 !important;
            color: white !important;
            border-color: #3b82f6 !important;
          }
          .rbc-btn-group .rbc-active:hover {
            background-color: #2563eb !important;
            color: white !important;
          }
        `}
      </style>
      <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 pt-6">
        {/* Modern Purple Gradient Header */}
        <div className="bg-gradient-to-r from-purple-600 via-purple-500 to-blue-500 rounded-2xl mb-8">
          <div className="p-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/30">
                    <StarIcon className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h1 className="text-3xl sm:text-4xl font-bold text-white">
                      {(() => {
                        const hour = new Date().getHours();
                        if (hour < 12) return 'Günaydın';
                        if (hour < 18) return 'İyi günler';
                        return 'İyi akşamlar';
                      })()} {user?.name?.split(' ')[0]}
                    </h1>
                    <p className="text-purple-100 text-sm sm:text-base mt-1">
                  {(() => {
                    const overdue = tasks.filter(task => {
                      const today = moment().startOf('day');
                      const taskDate = moment(task.start).startOf('day');
                      return !task.resource.isStudyRecord && taskDate.isBefore(today) && task.resource.status !== 'completed';
                    }).length;
                    const todayTasks = tasks.filter(task => {
                      const today = moment().startOf('day');
                      const taskDate = moment(task.start).startOf('day');
                      return !task.resource.isStudyRecord && taskDate.isSame(today) && task.resource.status !== 'completed';
                    }).length;
                    
                    if (overdue > 0) {
                      return `${overdue} geciken görev var. Hadi bunları halledelim!`;
                    } else if (todayTasks > 0) {
                      return `Bugün ${todayTasks} görev seni bekliyor. Harika bir gün olacak!`;
                    } else {
                      return 'Tüm görevlerin tamamlanmış! Kendini ödüllendirebilirsin';
                    }
                    })()
                  }
                  </p>
                  </div>
                </div>
                
                {/* Quick motivation based on streak */}
                <div className="flex items-center gap-2">
                  <ZapIcon className="h-5 w-5 text-yellow-300" />
                  <span className="text-sm text-purple-100">
                    {dashboardData?.streak > 0 
                      ? `${dashboardData.streak} günlük serin devam ediyor!`
                      : 'Yeni bir seri başlatmaya hazır mısın?'
                    }
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-8">
        {/* Motivational Quote Section */}
        {currentQuote && (
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100">
          <div className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center mb-3">
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mr-3">
                    <QuoteIcon className="h-6 w-6 text-purple-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">
                    Günün Motivasyonu
                  </h3>
                </div>
                <blockquote className="text-lg italic text-gray-800 mb-3 leading-relaxed">
                  "{showEnglish ? currentQuote.quote_en : currentQuote.quote_tr}"
                </blockquote>
                <p className="text-right text-sm font-medium text-gray-600">
                  {currentQuote.author}
                </p>
              </div>
              <div className="flex items-center space-x-2 ml-4">
                <button
                  onClick={() => setShowEnglish(!showEnglish)}
                  className="p-2 text-blue-600 hover:bg-gray-50 rounded-lg border border-gray-200"
                  title={showEnglish ? 'Türkçe göster' : 'İngilizce göster'}
                >
                  <LanguagesIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div className="mt-4 text-xs text-blue-600 bg-gray-50 px-3 py-1 rounded border border-gray-200 inline-block">
              {showEnglish ? 'English' : 'Türkçe'}
            </div>
          </div>
        </div>
      )}

      {/* Smart Stats Cards with Insights */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        {/* Today's Study Time */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center border border-blue-200">
                <ClockIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <h2 className="text-sm font-medium text-gray-600">Bugün Çalışma</h2>
                <p className="text-2xl font-bold text-gray-900">
                  {formatTime(dashboardData?.today?.studyMinutes || 0)}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {dashboardData?.today?.sessionsCount || 0} oturum
                </p>
              </div>
            </div>
            {(dashboardData?.today?.studyMinutes || 0) > 0 && (
              <div className="text-green-600">
                <ArrowUpIcon className="h-4 w-4" />
              </div>
            )}
          </div>
        </div>

        {/* Tasks Overview */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center border border-green-200">
                <TargetIcon className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <h2 className="text-sm font-medium text-gray-600">Görevler</h2>
                <p className="text-2xl font-bold text-gray-900">
                  {tasks.filter(task => !task.resource.isStudyRecord && task.resource.status !== 'completed').length}
                  <span className="text-lg text-gray-400">/{tasks.filter(task => !task.resource.isStudyRecord).length}</span>
                </p>
                <div className="w-full bg-gray-200 rounded h-2 mt-2">
                  <div 
                    className="bg-green-600 h-2 rounded" 
                    style={{ 
                      width: `${tasks.filter(task => !task.resource.isStudyRecord).length > 0 ? (tasks.filter(task => !task.resource.isStudyRecord && task.resource.status === 'completed').length / tasks.filter(task => !task.resource.isStudyRecord).length * 100) : 0}%` 
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Completion Rate */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center border border-purple-200">
                <CheckCircleIcon className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <h2 className="text-sm font-medium text-gray-600">Tamamlanan</h2>
                <p className="text-2xl font-bold text-gray-900">
                  {tasks.filter(task => !task.resource.isStudyRecord && task.resource.status === 'completed').length}
                </p>
                <p className="text-xs text-purple-600 mt-1 font-medium">
                  %{tasks.filter(task => !task.resource.isStudyRecord).length > 0 ? Math.round(tasks.filter(task => !task.resource.isStudyRecord && task.resource.status === 'completed').length / tasks.filter(task => !task.resource.isStudyRecord).length * 100) : 0} başarı
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Streak Counter */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-orange-50 rounded-lg flex items-center justify-center border border-orange-200">
                <TrendingUpIcon className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <h2 className="text-sm font-medium text-gray-600">Çalışma Serisi</h2>
                <p className="text-2xl font-bold text-gray-900 flex items-center gap-1">
                  {dashboardData?.streak || 0}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {(dashboardData?.streak || 0) > 7 ? 'Müthiş seri!' : 
                   (dashboardData?.streak || 0) > 3 ? 'Harika gidişat!' : 
                   (dashboardData?.streak || 0) > 0 ? 'Devam et!' : 'Başlangıç yap!'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Task Calendar */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200 bg-gray-50">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center border border-blue-200">
                <CalendarIcon className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Görev Takvimi</h2>
                <p className="text-sm text-gray-600">Görevlerini sürükleyerek zamanlarını değiştirebilirsin</p>
              </div>
            </div>
            
            {/* Legend */}
            <div className="space-y-2">
              {/* Task Priorities Row */}
              <div className="flex flex-wrap items-center gap-3 text-sm">
                <div className="flex items-center gap-2 text-xs text-gray-600 font-semibold">GÖREVLER:</div>
                <span className="flex items-center gap-2 px-2 py-1 bg-red-50 rounded border border-red-200">
                  <div className="w-3 h-3 bg-red-500 rounded"></div>
                  <span className="text-red-700 font-medium text-xs">Yüksek</span>
                </span>
                <span className="flex items-center gap-2 px-2 py-1 bg-yellow-50 rounded border border-yellow-200">
                  <div className="w-3 h-3 bg-yellow-500 rounded"></div>
                  <span className="text-yellow-700 font-medium text-xs">Orta</span>
                </span>
                <span className="flex items-center gap-2 px-2 py-1 bg-green-50 rounded border border-green-200">
                  <div className="w-3 h-3 bg-green-500 rounded"></div>
                  <span className="text-green-700 font-medium text-xs">Düşük</span>
                </span>
              </div>

              {/* Study Types Row */}
              <div className="flex flex-wrap items-center gap-3 text-sm">
                <div className="flex items-center gap-2 text-xs text-gray-600 font-semibold">ÇALIŞMALAR:</div>
                <span className="flex items-center gap-2 px-2 py-1 bg-emerald-50 rounded border border-emerald-200">
                  <div className="w-3 h-3 bg-emerald-600 rounded"></div>
                  <span className="text-emerald-700 font-medium text-xs">Konu</span>
                </span>
                <span className="flex items-center gap-2 px-2 py-1 bg-blue-50 rounded border border-blue-200">
                  <div className="w-3 h-3 bg-blue-500 rounded"></div>
                  <span className="text-blue-700 font-medium text-xs">Soru</span>
                </span>
                <span className="flex items-center gap-2 px-2 py-1 bg-orange-50 rounded border border-orange-200">
                  <div className="w-3 h-3 bg-orange-500 rounded"></div>
                  <span className="text-orange-700 font-medium text-xs">Tekrar</span>
                </span>
                <span className="flex items-center gap-2 px-2 py-1 bg-purple-50 rounded border border-purple-200">
                  <div className="w-3 h-3 bg-purple-500 rounded"></div>
                  <span className="text-purple-700 font-medium text-xs">Deneme</span>
                </span>
              </div>
            </div>
          </div>
        </div>
        <div className="p-4 sm:p-6">
          <div className="calendar-container" style={{ height: 'calc(100vh - 400px)', minHeight: '600px' }}>
            <DndProvider backend={HTML5Backend}>
              <DnDCalendar
                localizer={localizer}
                events={tasks}
                startAccessor="start"
                endAccessor="end"
                style={{ height: '100%', width: '100%' }}
                messages={messages}
                eventPropGetter={eventStyleGetter}
                onSelectEvent={handleSelectEvent}
                onEventDrop={handleEventDrop}
                onEventResize={handleEventResize}
                views={['month', 'week', 'day']}
                defaultView={calendarView}
                popup
                step={15}
                timeslots={4}
                min={new Date(2023, 0, 1, 7, 0, 0)}
                max={new Date(2023, 0, 1, 23, 0, 0)}
                scrollToTime={new Date(2023, 0, 1, 8, 0, 0)}
                resizable
                dragAndDropAccessor="dragAndDropAllowed"
                formats={{
                  monthHeaderFormat: 'MMMM YYYY',
                  weekHeaderFormat: 'DD MMMM YYYY',
                  dayHeaderFormat: 'DD MMMM YYYY, dddd',
                  agendaDateFormat: 'DD MMMM YYYY',
                  agendaTimeFormat: 'HH:mm',
                  timeGutterFormat: 'HH:mm',
                  eventTimeRangeFormat: ({ start, end }, culture, localizer) =>
                    localizer.format(start, 'HH:mm', culture) + ' - ' + 
                    localizer.format(end, 'HH:mm', culture),
                  dayRangeHeaderFormat: ({ start, end }, culture, localizer) =>
                    localizer.format(start, 'DD MMMM', culture) + ' - ' + 
                    localizer.format(end, 'DD MMMM YYYY', culture)
                }}
              />
            </DndProvider>
          </div>
        </div>
      </div>

      {/* Tasks Section - Full Width */}
      <div className="mt-6 space-y-6">
          {/* Overdue Tasks with Enhanced Warning */}
          {(() => {
            const today = moment().startOf('day');
            const overdueTasks = tasks.filter(task => {
              const taskDate = moment(task.start).startOf('day');
              return !task.resource.isStudyRecord && taskDate.isBefore(today) && task.resource.status !== 'completed';
            });
            
            if (overdueTasks.length > 0 && showOverdueWarning) {
              return (
                <div className="bg-red-50 rounded-lg border border-red-200">
                  <div className="p-6 border-b border-red-200">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center border border-red-200">
                          <AlertTriangleIcon className="h-6 w-6 text-red-600" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-red-800 flex items-center gap-2">
                            Dikkat! Geciken Görevler
                            <span className="bg-red-600 text-white text-sm px-2 py-1 rounded border border-red-700">
                              {overdueTasks.length}
                            </span>
                          </h3>
                          <p className="text-red-700 mt-1 font-medium">
                            Bu görevlerin tarihi geçmiş. Öncelikle bunları tamamlaman önemli!
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => setShowOverdueWarning(false)}
                        className="text-red-400 hover:text-red-600 p-1 rounded hover:bg-red-100 border border-red-200"
                      >
                        <XIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {overdueTasks.map((task) => {
                        const daysPassed = today.diff(moment(task.start).startOf('day'), 'days');
                        return (
                          <div key={task.id} className="border border-red-200 bg-white rounded-lg p-4">
                            <div className="flex items-start justify-between">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center mb-3">
                                  <div 
                                    className="w-4 h-4 rounded mr-3 flex-shrink-0 border border-gray-300"
                                    style={{ backgroundColor: task.resource.color }}
                                  ></div>
                                  <div className="min-w-0 flex-1">
                                    <p className="font-semibold text-gray-900 truncate text-sm">{task.title}</p>
                                    <p className="text-xs text-gray-600 uppercase tracking-wide">{task.resource.subject}</p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2 mb-3">
                                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800 border border-red-200">
                                    <ClockIcon className="h-3 w-3 mr-1" />
                                    {daysPassed} gün gecikti
                                  </span>
                                  {task.resource.estimated_time && (
                                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                                      {formatTime(task.resource.estimated_time)}
                                    </span>
                                  )}
                                </div>
                                {task.resource.description && (
                                  <p className="text-xs text-gray-600 mb-3 line-clamp-2">
                                    {task.resource.description}
                                  </p>
                                )}
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                                      task.resource.priority === 'high' ? 'bg-red-100 text-red-800 border border-red-200' :
                                      task.resource.priority === 'medium' ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' :
                                      'bg-green-100 text-green-800 border border-green-200'
                                    }`}>
                                      {getPriorityText(task.resource.priority)}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <button
                                      onClick={() => handleSelectEvent(task)}
                                      className="p-2 rounded hover:bg-red-100 border border-red-200 flex-shrink-0 text-gray-500 hover:text-red-600"
                                      title="Görev detayları"
                                    >
                                      <EyeIcon className="h-4 w-4" />
                                    </button>
                                    <button
                                      onClick={() => handleCompleteTask(task.id)}
                                      disabled={completingTask}
                                      className="bg-red-600 hover:bg-red-700 text-white p-2 rounded border border-red-600"
                                      title="Hemen tamamla"
                                    >
                                      <CheckIcon className="h-4 w-4" />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            }
            return null;
          })()}

          {/* Today's Tasks */}
          {(() => {
            const today = moment().startOf('day');
            const todayTasks = tasks.filter(task => {
              const taskDate = moment(task.start).startOf('day');
              return !task.resource.isStudyRecord && taskDate.isSame(today) && task.resource.status !== 'completed';
            });
            
            return (
              <div className="bg-white rounded-lg border border-gray-200">
                <div className="p-6 border-b border-gray-200 bg-blue-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center border border-blue-200">
                        <CheckCircleIcon className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">
                          Bugünkü Görevlerim
                        </h3>
                        <p className="text-sm text-gray-600">
                          {todayTasks.length > 0 ? `${todayTasks.length} görev seni bekliyor` : 'Tüm görevler tamamlandı!'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-blue-600">{todayTasks.length}</div>
                      <div className="text-xs text-gray-500">aktif görev</div>
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  {todayTasks.length > 0 ? (
                    <div className="space-y-4">
                      {todayTasks.map((task, index) => {
                        const timeUntilTask = task.start ? moment(task.start).fromNow() : null;
                        return (
                          <div 
                            key={task.id} 
                            className="border border-gray-200 rounded-lg p-5 bg-white"
                          >
                            {/* Priority indicator */}
                            <div 
                              className="h-1 rounded-t-lg mb-3 border border-gray-200"
                              style={{ backgroundColor: task.resource.color }}
                            ></div>
                            
                            <div className="flex items-start justify-between">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center mb-3">
                                  <div 
                                    className="w-4 h-4 rounded mr-3 flex-shrink-0 border border-gray-300"
                                    style={{ backgroundColor: task.resource.color }}
                                  ></div>
                                  <div className="min-w-0 flex-1">
                                    <p className="font-semibold text-gray-900 truncate">{task.title}</p>
                                    <div className="flex items-center gap-2 mt-1">
                                      <p className="text-xs text-gray-600 uppercase tracking-wide">{task.resource.subject}</p>
                                      {timeUntilTask && (
                                        <span className="text-xs text-blue-600 bg-blue-100 px-2 py-0.5 rounded border border-blue-200">
                                          {timeUntilTask}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                
                                {task.resource.description && (
                                  <p className="text-sm text-gray-600 mb-4 line-clamp-2 leading-relaxed">
                                    {task.resource.description}
                                  </p>
                                )}
                                
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                                      task.resource.priority === 'high' ? 'bg-red-100 text-red-800 border border-red-200' :
                                      task.resource.priority === 'medium' ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' :
                                      'bg-green-100 text-green-800 border border-green-200'
                                    }`}>
                                      {getPriorityText(task.resource.priority)}
                                    </span>
                                    {task.resource.estimated_time && (
                                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded border border-gray-200">
                                        {formatTime(task.resource.estimated_time)}
                                      </span>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <button
                                      onClick={() => handleSelectEvent(task)}
                                      className="p-2 rounded hover:bg-blue-100 border border-blue-200 text-gray-500 hover:text-blue-600"
                                      title="Görev detayları"
                                    >
                                      <EyeIcon className="h-4 w-4" />
                                    </button>
                                    <button
                                      onClick={() => handleCompleteTask(task.id)}
                                      disabled={completingTask}
                                      className="bg-green-600 hover:bg-green-700 text-white p-2.5 rounded border border-green-600 disabled:opacity-50"
                                      title="Tamamla"
                                    >
                                      <CheckIcon className="h-4 w-4" />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-16">
                      <div className="w-24 h-24 bg-green-100 rounded-lg mx-auto mb-6 flex items-center justify-center border border-green-200">
                        <CheckCircleIcon className="h-12 w-12 text-green-600" />
                      </div>
                      <h4 className="text-2xl font-bold text-gray-900 mb-3">Mükemmel çalışma!</h4>
                      <p className="text-gray-600 mb-6 max-w-md mx-auto leading-relaxed">
                        Bugün için tüm görevleri tamamladın! Bu başarıyı kutlamaya değer.
                      </p>
                      <div className="flex justify-center">
                        <Link 
                          to="/study/add" 
                          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium border border-blue-600"
                        >
                          Çalışma Kaydı Ekle
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })()}

          {/* Upcoming Tasks */}
          {(() => {
            const today = moment().startOf('day');
            const upcomingTasks = tasks.filter(task => {
              const taskDate = moment(task.start).startOf('day');
              return !task.resource.isStudyRecord && taskDate.isAfter(today) && task.resource.status !== 'completed';
            }).slice(0, 4); // Show only next 4 upcoming tasks
            
            if (upcomingTasks.length > 0) {
              return (
                <div className="bg-white rounded-lg border border-gray-200">
                  <div className="p-6 border-b border-gray-200 bg-purple-50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center border border-purple-200">
                          <CalendarIcon className="h-5 w-5 text-purple-600" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-gray-900">
                            Yaklaşan Görevler
                          </h3>
                          <p className="text-sm text-gray-600">
                            Önceden planlama yap, başarılı ol
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-purple-600">{upcomingTasks.length}</div>
                        <div className="text-xs text-gray-500">yaklaşan</div>
                      </div>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="space-y-3">
                      {upcomingTasks.map((task) => {
                        const taskDate = moment(task.start);
                        const daysUntil = taskDate.startOf('day').diff(today, 'days');
                        return (
                          <div key={task.id} className="flex items-center justify-between p-3 border border-gray-200 rounded hover:bg-gray-50">
                            <div className="flex items-center flex-1 min-w-0">
                              <div 
                                className="w-3 h-3 rounded mr-3 flex-shrink-0 border border-gray-300"
                                style={{ backgroundColor: task.resource.color }}
                              ></div>
                              <div className="min-w-0 flex-1">
                                <p className="text-sm font-medium text-gray-900 truncate">{task.title}</p>
                                <p className="text-xs text-gray-500">{task.resource.subject}</p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2 ml-4">
                              <span className="text-xs text-gray-500">
                                {daysUntil === 1 ? 'Yarın' : `${daysUntil} gün sonra`}
                              </span>
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                task.resource.priority === 'high' ? 'bg-red-100 text-red-800' :
                                task.resource.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-green-100 text-green-800'
                              }`}>
                                {getPriorityText(task.resource.priority)}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            }
            return null;
          })()}
      </div>

      {/* Task Detail Modal */}
      {showTaskModal && selectedTask && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  {editingTask ? 'Görev Düzenle' : 'Görev Detayları'}
                </h3>
                <div className="flex items-center space-x-2">
                  {!editingTask && (
                    <button
                      onClick={() => setEditingTask(true)}
                      className="text-blue-600 hover:text-blue-800 p-1 rounded"
                      title="Düzenle"
                    >
                      <EditIcon className="h-5 w-5" />
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setShowTaskModal(false);
                      setEditingTask(false);
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
              
              <div className="space-y-4">
                {/* Task Info - Read Only */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-4 border-b border-gray-200">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Görev</label>
                    <p className="text-gray-900 font-medium">{selectedTask.title}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Ders</label>
                    <p className="text-gray-900 capitalize">{selectedTask.subject}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Açıklama</label>
                    <p className="text-gray-900">{selectedTask.description || 'Açıklama yok'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Öncelik</label>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      selectedTask.priority === 'high' ? 'bg-red-100 text-red-800' :
                      selectedTask.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {getPriorityText(selectedTask.priority)}
                    </span>
                  </div>
                </div>

                {/* Student Notes Section - Editable */}
                <div className="space-y-4">
                  <h4 className="text-md font-medium text-gray-800 border-b pb-2">
                    <FileTextIcon className="h-4 w-4 inline mr-2" />
                    Çalışma Notlarım
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Çözdüğüm Soru Sayısı</label>
                      {editingTask ? (
                        <input
                          type="number"
                          min="0"
                          value={taskForm.questions_solved}
                          onChange={(e) => setTaskForm({
                            ...taskForm,
                            questions_solved: parseInt(e.target.value) || 0
                          })}
                          className="mt-1 block w-full rounded border border-gray-300 p-2 focus:border-blue-500 focus:outline-none"
                        />
                      ) : (
                        <p className="mt-1 text-gray-900">{selectedTask.questions_solved || 0} soru</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-700">Gerçek Çalışma Süresi (dk)</label>
                      {editingTask ? (
                        <input
                          type="number"
                          min="0"
                          value={taskForm.study_duration}
                          onChange={(e) => setTaskForm({
                            ...taskForm,
                            study_duration: parseInt(e.target.value) || 0
                          })}
                          className="mt-1 block w-full rounded border border-gray-300 p-2 focus:border-blue-500 focus:outline-none"
                        />
                      ) : (
                        <p className="mt-1 text-gray-900">{formatTime(selectedTask.study_duration || 0)}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700">Çalıştığım Konular</label>
                    {editingTask ? (
                      <textarea
                        value={taskForm.topics_studied}
                        onChange={(e) => setTaskForm({
                          ...taskForm,
                          topics_studied: e.target.value
                        })}
                        placeholder="Örn: Türev kuralları, limit problemleri, integrasyon..."
                        className="mt-1 block w-full rounded border border-gray-300 p-2 focus:border-blue-500 focus:outline-none"
                        rows="2"
                      />
                    ) : (
                      <p className="mt-1 text-gray-900">{selectedTask.topics_studied || 'Henüz konu belirtilmemiş'}</p>
                    )}
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700">Notlarım ve Gözlemler</label>
                    {editingTask ? (
                      <textarea
                        value={taskForm.student_notes}
                        onChange={(e) => setTaskForm({
                          ...taskForm,
                          student_notes: e.target.value
                        })}
                        placeholder="Zorlandığım konuları, dikkat ettiklerimi, tekrar edilmesi gereken konuları buraya yazabilirsin..."
                        className="mt-1 block w-full rounded border border-gray-300 p-2 focus:border-blue-500 focus:outline-none"
                        rows="3"
                      />
                    ) : (
                      <p className="mt-1 text-gray-900">{selectedTask.student_notes || 'Henüz not eklenmemiş'}</p>
                    )}
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="pt-4 border-t border-gray-200 flex space-x-3">
                  {editingTask ? (
                    <>
                      <button
                        onClick={handleUpdateTask}
                        disabled={updatingTask}
                        className="flex-1 btn-primary flex items-center justify-center"
                      >
                        {updatingTask ? (
                          <>
                            <div className="spinner h-4 w-4 mr-2"></div>
                            Kaydediliyor...
                          </>
                        ) : (
                          <>
                            <SaveIcon className="h-4 w-4 mr-2" />
                            Kaydet
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => setEditingTask(false)}
                        className="flex-1 btn-secondary"
                      >
                        İptal
                      </button>
                    </>
                  ) : (
                    selectedTask.status !== 'completed' && (
                      <button
                        onClick={() => handleCompleteTask(selectedTask.id)}
                        disabled={completingTask}
                        className="w-full btn-primary flex items-center justify-center"
                      >
                        {completingTask ? (
                          <>
                            <div className="spinner h-4 w-4 mr-2"></div>
                            Tamamlanıyor...
                          </>
                        ) : (
                          <>
                            <CheckIcon className="h-4 w-4 mr-2" />
                            Görevi Tamamla
                          </>
                        )}
                      </button>
                    )
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Task Completion Modal */}
      {showCompletionModal && taskToComplete && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border border-gray-300 w-full max-w-lg rounded-lg bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  <TargetIcon className="h-4 w-4 inline mr-2" />
                  Görev Tamamlama
                </h3>
                <button
                  onClick={() => {
                    setShowCompletionModal(false);
                    setTaskToComplete(null);
                  }}
                  className="text-gray-400 hover:text-gray-600 p-1 rounded border border-gray-200"
                >
                  <XIcon className="h-5 w-5" />
                </button>
              </div>
              
              <div className="mb-4 p-3 bg-blue-50 rounded border border-blue-200">
                <p className="text-sm text-blue-800">
                  <strong>{taskToComplete.resource.title}</strong> görevini tamamlamak için aşağıdaki bilgileri doldur.
                </p>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Çözülen Soru Sayısı *
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={completionForm.questions_solved}
                      onChange={(e) => setCompletionForm({
                        ...completionForm,
                        questions_solved: e.target.value
                      })}
                      className="w-full rounded border border-gray-300 p-2 focus:border-blue-500 focus:outline-none"
                      placeholder="0"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Çalışma Süresi (dk) *
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={completionForm.study_duration}
                      onChange={(e) => setCompletionForm({
                        ...completionForm,
                        study_duration: e.target.value
                      })}
                      className="w-full rounded border border-gray-300 p-2 focus:border-blue-500 focus:outline-none"
                      placeholder="0"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Çalışılan Konular *
                  </label>
                  <textarea
                    value={completionForm.topics_studied}
                    onChange={(e) => setCompletionForm({
                      ...completionForm,
                      topics_studied: e.target.value
                    })}
                    placeholder="Örn: Türev kuralları, limit problemleri, integrasyon..."
                    className="w-full rounded border border-gray-300 p-2 focus:border-blue-500 focus:outline-none"
                    rows="2"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notlar ve Gözlemler
                  </label>
                  <textarea
                    value={completionForm.student_notes}
                    onChange={(e) => setCompletionForm({
                      ...completionForm,
                      student_notes: e.target.value
                    })}
                    placeholder="Zorlandığın konular, dikkat ettiklerin, tekrar edilmesi gerekenler..."
                    className="w-full rounded border border-gray-300 p-2 focus:border-blue-500 focus:outline-none"
                    rows="3"
                  />
                </div>
              </div>
              
              <div className="mt-6 flex space-x-3">
                <button
                  onClick={handleCompleteTaskWithDetails}
                  disabled={completingTask || !completionForm.questions_solved || !completionForm.study_duration || !completionForm.topics_studied}
                  className="flex-1 btn-primary flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {completingTask ? (
                    <>
                      <div className="spinner h-4 w-4 mr-2"></div>
                      Tamamlanıyor...
                    </>
                  ) : (
                    <>
                      <CheckIcon className="h-4 w-4 mr-2" />
                      Tamamla
                    </>
                  )}
                </button>
                <button
                  onClick={() => {
                    setShowCompletionModal(false);
                    setTaskToComplete(null);
                  }}
                  className="flex-1 btn-secondary"
                >
                  İptal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
        </div>
      </div>
    </div>
    </>
  );
};

export default StudentDashboard;