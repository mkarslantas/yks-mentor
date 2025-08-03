import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { coachService } from '../../services/coach.service';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import moment from 'moment';
import 'moment/locale/tr';
import { toast } from 'react-hot-toast';
import 'react-big-calendar/lib/addons/dragAndDrop/styles.css';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import {
  CalendarIcon,
  ArrowLeftIcon,
  ClockIcon,
  BookOpenIcon,
  CheckCircleIcon,
  AlertCircleIcon,
  PlayCircleIcon,
  UserIcon,
  TargetIcon,
  FileTextIcon,
  StarIcon,
  RefreshCwIcon,
  PlusIcon,
  SaveIcon,
  XIcon
} from 'lucide-react';
import Loading from '../../components/common/Loading';
import EmptyState from '../../components/common/EmptyState';

// Moment'i Türkçe yapılandır
moment.locale('tr');
const localizer = momentLocalizer(moment);

// Create DnD Calendar
const DnDCalendar = withDragAndDrop(Calendar);

const StudentTasks = () => {
  const { studentId } = useParams();
  const navigate = useNavigate();
  
  const [student, setStudent] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [showQuickAddModal, setShowQuickAddModal] = useState(false);
  const [calendarView, setCalendarView] = useState('week');
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [newTask, setNewTask] = useState({
    title: '',
    subject: 'matematik',
    description: '',
    due_date: '',
    due_time: '09:00',
    estimated_duration: 60,
    priority: 'medium',
    recurrence: 'none',
    recurrence_end: '',
    recurrence_count: 1
  });

  const [quickTask, setQuickTask] = useState({
    title: '',
    subject: 'matematik',
    priority: 'medium',
    recurrence: 'none'
  });

  // Helper functions
  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'high': return '#ef4444'; // red
      case 'medium': return '#f59e0b'; // amber
      case 'low': return '#10b981'; // green
      default: return '#6b7280'; // gray
    }
  };


  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Gerçek API çağrıları
        const [studentData, tasksData] = await Promise.all([
          coachService.getStudent(studentId),
          coachService.getStudentTasks(studentId)
        ]);
        
        setStudent(studentData);
        
        // Transform tasks for calendar
        const calendarTasks = (tasksData || []).map(task => {
          // Eğer start_time varsa onu kullan, yoksa due_date'i kullan
          const startDate = task.start_time ? new Date(task.start_time) : new Date(task.due_date);
          
          // Eğer end_time varsa onu kullan, yoksa start + duration hesapla
          let endDate;
          if (task.end_time) {
            endDate = new Date(task.end_time);
          } else {
            const duration = task.estimated_duration || task.estimated_time || 60;
            endDate = new Date(startDate.getTime() + (duration * 60000));
          }
          
          // Eğer sadece tarih varsa (saat 00:00 ise), varsayılan olarak sabah 9'a ayarla
          if (startDate.getHours() === 0 && startDate.getMinutes() === 0 && !task.start_time) {
            startDate.setHours(9, 0, 0, 0);
            endDate = new Date(startDate.getTime() + ((task.estimated_duration || task.estimated_time || 60) * 60000));
          }
          
          return {
            ...task,
            start: startDate,
            end: endDate,
            title: task.title,
            dragAndDropAllowed: true,
            resource: {
              ...task,
              color: getPriorityColor(task.priority),
              questions_solved: task.questions_solved || null,
              topics_studied: task.topics_studied || null,
              study_duration: task.study_duration || null,
              student_notes: task.student_notes || null
            }
          };
        });
        
        setTasks(calendarTasks);
        setLoading(false);
      } catch (err) {
        console.error('Student tasks fetch error:', err);
        setError('Görev listesi yüklenirken hata oluştu');
        setLoading(false);
      }
    };

    if (studentId) {
      fetchData();
    }
  }, [studentId]);

  const getStatusColor = (status) => {
    switch(status) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'in_progress': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'assigned': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'overdue': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'completed': return <CheckCircleIcon className="h-4 w-4" />;
      case 'in_progress': return <PlayCircleIcon className="h-4 w-4" />;
      case 'assigned': return <ClockIcon className="h-4 w-4" />;
      case 'overdue': return <AlertCircleIcon className="h-4 w-4" />;
      default: return <FileTextIcon className="h-4 w-4" />;
    }
  };

  const getStatusText = (status) => {
    switch(status) {
      case 'completed': return 'Tamamlandı';
      case 'in_progress': return 'Devam Ediyor';
      case 'assigned': return 'Atandı';
      case 'overdue': return 'Gecikmiş';
      default: return 'Bilinmiyor';
    }
  };

  const getPriorityTextColor = (priority) => {
    switch(priority) {
      case 'high': return 'text-red-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const formatTime = (minutes) => {
    if (!minutes) return '0 dk';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}s ${mins}dk` : `${minutes} dk`;
  };

  const isOverdue = (dueDate) => {
    return new Date(dueDate) < new Date() && tasks.find(t => t.due_date === dueDate)?.status !== 'completed';
  };

  const handleTaskClick = (task) => {
    setSelectedTask(task);
    setShowTaskModal(true);
  };

  // Calendar event styling
  const eventStyleGetter = (event) => {
    const isCompleted = event.resource.status === 'completed';
    return {
      style: {
        backgroundColor: isCompleted ? '#10b981' : getPriorityColor(event.resource.priority),
        borderRadius: '6px',
        opacity: isCompleted ? 0.7 : 0.9,
        color: 'white',
        border: '0px',
        display: 'block',
        fontSize: '12px',
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
    setSelectedTask(event.resource);
    setShowTaskModal(true);
  };

  const handleSelectSlot = ({ start, end }) => {
    console.log('📅 Slot selected:', start, '-', end);
    setSelectedSlot({ start, end });
    setShowQuickAddModal(true);
  };

  const handleEventDrop = async ({ event, start, end }) => {
    try {
      console.log('🔄 Moving task:', event.title, 'to', start, '-', end);
      
      // Update task time in backend
      const updateData = {
        due_date: start.toISOString().split('T')[0],
        start_time: start.toISOString(),
        end_time: end.toISOString()
      };
      
      // Call backend API to update task
      await coachService.updateTask(event.id, updateData);
      
      // Update local state
      setTasks(prevTasks => 
        prevTasks.map(task => 
          task.id === event.id 
            ? { 
                ...task, 
                ...updateData,
                start, 
                end,
                resource: {
                  ...task.resource,
                  ...updateData
                }
              }
            : task
        )
      );
      
      toast.success('Görev başarıyla güncellendi');
    } catch (error) {
      console.error('Error updating task:', error);
      console.error('Error details:', error.response?.data);
      toast.error('Görev güncellenirken hata oluştu: ' + (error.response?.data?.error?.message || error.message));
      // Reload tasks on error to revert changes
      const tasksData = await coachService.getStudentTasks(studentId);
      const calendarTasks = (tasksData || []).map(task => {
        const startDate = task.start_time ? new Date(task.start_time) : new Date(task.due_date);
        let endDate;
        if (task.end_time) {
          endDate = new Date(task.end_time);
        } else {
          const duration = task.estimated_duration || task.estimated_time || 60;
          endDate = new Date(startDate.getTime() + (duration * 60000));
        }
        if (startDate.getHours() === 0 && startDate.getMinutes() === 0 && !task.start_time) {
          startDate.setHours(9, 0, 0, 0);
          endDate = new Date(startDate.getTime() + ((task.estimated_duration || task.estimated_time || 60) * 60000));
        }
        return {
          ...task,
          start: startDate,
          end: endDate,
          title: task.title,
          dragAndDropAllowed: true,
          resource: {
            ...task,
            color: getPriorityColor(task.priority)
          }
        };
      });
      setTasks(calendarTasks);
    }
  };

  const handleEventResize = async ({ event, start, end }) => {
    try {
      const durationMinutes = moment(end).diff(moment(start), 'minutes');
      
      const updateData = {
        start_time: start.toISOString(),
        end_time: end.toISOString(),
        estimated_time: durationMinutes
      };
      
      // Call backend API to update task
      await coachService.updateTask(event.id, updateData);
      
      // Update local state
      setTasks(prevTasks => 
        prevTasks.map(task => 
          task.id === event.id 
            ? { 
                ...task, 
                ...updateData,
                estimated_duration: durationMinutes,
                start, 
                end,
                resource: {
                  ...task.resource,
                  ...updateData,
                  estimated_duration: durationMinutes
                }
              }
            : task
        )
      );
      
      toast.success('Görev süresi başarıyla güncellendi');
    } catch (error) {
      console.error('Error resizing task:', error);
      console.error('Error details:', error.response?.data);
      toast.error('Görev güncellenirken hata oluştu: ' + (error.response?.data?.error?.message || error.message));
      // Reload tasks on error to revert changes
      const tasksData = await coachService.getStudentTasks(studentId);
      const calendarTasks = (tasksData || []).map(task => {
        const startDate = task.start_time ? new Date(task.start_time) : new Date(task.due_date);
        let endDate;
        if (task.end_time) {
          endDate = new Date(task.end_time);
        } else {
          const duration = task.estimated_duration || task.estimated_time || 60;
          endDate = new Date(startDate.getTime() + (duration * 60000));
        }
        if (startDate.getHours() === 0 && startDate.getMinutes() === 0 && !task.start_time) {
          startDate.setHours(9, 0, 0, 0);
          endDate = new Date(startDate.getTime() + ((task.estimated_duration || task.estimated_time || 60) * 60000));
        }
        return {
          ...task,
          start: startDate,
          end: endDate,
          title: task.title,
          dragAndDropAllowed: true,
          resource: {
            ...task,
            color: getPriorityColor(task.priority)
          }
        };
      });
      setTasks(calendarTasks);
    }
  };

  const handleQuickAddTask = async () => {
    try {
      if (!quickTask.title || !selectedSlot) {
        toast.error('Görev başlığı gerekli');
        return;
      }

      const { start, end } = selectedSlot;
      const duration = moment(end).diff(moment(start), 'minutes');

      const taskData = {
        title: quickTask.title,
        subject: quickTask.subject,
        description: '',
        due_date: start.toISOString().split('T')[0],
        start_time: start.toISOString(),
        end_time: end.toISOString(),
        estimated_time: duration,
        priority: quickTask.priority,
        recurrence: quickTask.recurrence
      };

      console.log('Creating quick task with data:', taskData);

      if (quickTask.recurrence !== 'none') {
        // Create recurring task
        await createRecurringTask(taskData);
      } else {
        // Create single task
        await coachService.assignTask(studentId, taskData);
      }

      // Reload tasks
      const tasksData = await coachService.getStudentTasks(studentId);
      const calendarTasks = (tasksData || []).map(task => {
        const startDate = task.start_time ? new Date(task.start_time) : new Date(task.due_date);
        let endDate;
        if (task.end_time) {
          endDate = new Date(task.end_time);
        } else {
          const duration = task.estimated_duration || task.estimated_time || 60;
          endDate = new Date(startDate.getTime() + (duration * 60000));
        }
        if (startDate.getHours() === 0 && startDate.getMinutes() === 0 && !task.start_time) {
          startDate.setHours(9, 0, 0, 0);
          endDate = new Date(startDate.getTime() + ((task.estimated_duration || task.estimated_time || 60) * 60000));
        }
        return {
          ...task,
          start: startDate,
          end: endDate,
          title: task.title,
          dragAndDropAllowed: true,
          resource: {
            ...task,
            color: getPriorityColor(task.priority)
          }
        };
      });
      
      setTasks(calendarTasks);
      
      // Reset form
      setQuickTask({
        title: '',
        subject: 'matematik',
        priority: 'medium',
        recurrence: 'none'
      });
      
      setShowQuickAddModal(false);
      setSelectedSlot(null);
      toast.success('Görev başarıyla eklendi!');
    } catch (error) {
      console.error('Error adding quick task:', error);
      toast.error('Görev eklenirken hata oluştu: ' + (error.message || 'Bilinmeyen hata'));
    }
  };

  const createRecurringTask = async (baseTaskData) => {
    const tasks = [];
    const { start, end } = selectedSlot;
    const recurrence = quickTask.recurrence;
    
    let currentDate = moment(start);
    const endDate = moment(start).add(12, 'weeks'); // Max 12 weeks
    
    while (currentDate.isBefore(endDate)) {
      const taskStart = currentDate.clone().set({
        hour: moment(start).hour(),
        minute: moment(start).minute()
      });
      const taskEnd = currentDate.clone().set({
        hour: moment(end).hour(),
        minute: moment(end).minute()
      });
      
      const taskData = {
        ...baseTaskData,
        due_date: taskStart.format('YYYY-MM-DD'),
        start_time: taskStart.toISOString(),
        end_time: taskEnd.toISOString(),
      };
      
      tasks.push(coachService.assignTask(studentId, taskData));
      
      // Increment based on recurrence
      switch (recurrence) {
        case 'daily':
          currentDate.add(1, 'day');
          break;
        case 'weekly':
          currentDate.add(1, 'week');
          break;
        case 'monthly':
          currentDate.add(1, 'month');
          break;
        default:
          return; // No recurrence
      }
    }
    
    await Promise.all(tasks);
  };

  const handleAddTask = async () => {
    try {
      if (!newTask.title || !newTask.due_date) {
        toast.error('Görev başlığı ve tarih gerekli');
        return;
      }

      // Prepare task data for API
      const [hours, minutes] = newTask.due_time.split(':').map(Number);
      const dueDate = new Date(newTask.due_date);
      dueDate.setHours(hours, minutes, 0, 0);
      
      // Calculate start_time and end_time
      const startTime = new Date(dueDate);
      const endTime = new Date(startTime.getTime() + (newTask.estimated_duration * 60000));

      const taskData = {
        title: newTask.title,
        subject: newTask.subject,
        description: newTask.description,
        due_date: dueDate.toISOString().split('T')[0], // Sadece tarih kısmı
        start_time: startTime.toISOString(),
        end_time: endTime.toISOString(),
        estimated_time: newTask.estimated_duration,
        priority: newTask.priority,
        recurrence: newTask.recurrence
      };

      console.log('Creating task with data:', taskData);

      // Save to database via API
      const createdTask = await coachService.assignTask(studentId, taskData);
      console.log('Task created successfully:', createdTask);

      // Reload tasks from server to get the complete data
      const tasksData = await coachService.getStudentTasks(studentId);
      
      // Transform tasks for calendar
      const calendarTasks = (tasksData || []).map(task => {
        const taskDueDate = new Date(task.due_date);
        const taskEndDate = new Date(taskDueDate.getTime() + (60 * 60000)); // Default 1 hour duration
        
        return {
          ...task,
          start: taskDueDate,
          end: taskEndDate,
          title: task.title,
          dragAndDropAllowed: true,
          resource: {
            ...task,
            color: getPriorityColor(task.priority)
          }
        };
      });
      
      setTasks(calendarTasks);
      
      // Reset form
      setNewTask({
        title: '',
        subject: 'matematik',
        description: '',
        due_date: '',
        due_time: '09:00',
        estimated_duration: 60,
        priority: 'medium'
      });
      
      setShowAddTaskModal(false);
      toast.success('Görev başarıyla eklendi! Öğrenci panosunda görünecek.');
    } catch (error) {
      console.error('Error adding task:', error);
      toast.error('Görev eklenirken hata oluştu: ' + (error.message || 'Bilinmeyen hata'));
    }
  };

  if (loading) return <Loading context="tasks" />;

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <p className="text-red-800">{error}</p>
      </div>
    );
  }

  const completedTasks = tasks.filter(t => t.status === 'completed');
  const activeTasks = tasks.filter(t => t.status !== 'completed');
  const overdueTasks = tasks.filter(t => isOverdue(t.due_date));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate('/coach/dashboard')}
              className="p-2 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors duration-200"
            >
              <ArrowLeftIcon className="h-5 w-5 text-gray-600" />
            </button>
            <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center border border-blue-200">
              <UserIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold mb-1 text-gray-900">
                {student?.name} - Görev Takvimi
              </h1>
              <p className="text-gray-600">
                Öğrenci görevlerini takip edin ve ilerlemesini görün
              </p>
            </div>
          </div>
          
          <div className="flex gap-2">
            <button 
              onClick={() => setShowAddTaskModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors duration-200"
            >
              <PlusIcon className="h-4 w-4" />
              Görev Ekle
            </button>
            <button 
              onClick={() => window.location.reload()}
              className="btn-secondary flex items-center gap-2"
            >
              <RefreshCwIcon className="h-4 w-4" />
              Yenile
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center border border-blue-200">
              <FileTextIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <h2 className="text-sm font-medium text-gray-600">Toplam Görev</h2>
              <p className="text-2xl font-bold text-gray-900">{tasks.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center border border-green-200">
              <CheckCircleIcon className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <h2 className="text-sm font-medium text-gray-600">Tamamlanan</h2>
              <p className="text-2xl font-bold text-gray-900">{completedTasks.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-yellow-50 rounded-lg flex items-center justify-center border border-yellow-200">
              <PlayCircleIcon className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <h2 className="text-sm font-medium text-gray-600">Aktif</h2>
              <p className="text-2xl font-bold text-gray-900">{activeTasks.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-red-50 rounded-lg flex items-center justify-center border border-red-200">
              <AlertCircleIcon className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-4">
              <h2 className="text-sm font-medium text-gray-600">Geciken</h2>
              <p className="text-2xl font-bold text-gray-900">{overdueTasks.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Calendar View */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <CalendarIcon className="h-5 w-5 mr-2 text-gray-600" />
              Takvim Görünümü
            </h2>
            <div className="flex gap-2">
              <button
                onClick={() => setCalendarView('month')}
                className={`px-3 py-1 rounded text-sm font-medium ${
                  calendarView === 'month' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:text-blue-600'
                }`}
              >
                Ay
              </button>
              <button
                onClick={() => setCalendarView('week')}
                className={`px-3 py-1 rounded text-sm font-medium ${
                  calendarView === 'week' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:text-blue-600'
                }`}
              >
                Hafta
              </button>
              <button
                onClick={() => setCalendarView('day')}
                className={`px-3 py-1 rounded text-sm font-medium ${
                  calendarView === 'day' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:text-blue-600'
                }`}
              >
                Gün
              </button>
            </div>
          </div>
        </div>
        
        <div className="p-6">
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
                onSelectSlot={handleSelectSlot}
                onEventDrop={handleEventDrop}
                onEventResize={handleEventResize}
                views={['month', 'week', 'day']}
                view={calendarView}
                onView={setCalendarView}
                popup
                step={15}
                timeslots={4}
                min={new Date(2023, 0, 1, 7, 0, 0)}
                max={new Date(2023, 0, 1, 23, 0, 0)}
                scrollToTime={new Date(2023, 0, 1, 8, 0, 0)}
                resizable
                selectable
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
                }}
              />
            </DndProvider>
          </div>
        </div>
      </div>

      {/* Tasks List */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center">
            <CalendarIcon className="h-5 w-5 mr-2 text-gray-600" />
            Görevler ({tasks.length})
          </h2>
        </div>
        
        <div className="p-6">
          {tasks.length > 0 ? (
            <div className="space-y-4">
              {tasks.map((task) => (
                <div 
                  key={task.id} 
                  className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow duration-200 cursor-pointer"
                  onClick={() => handleTaskClick(task)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(task.status)}`}>
                          {getStatusIcon(task.status)}
                          {getStatusText(task.status)}
                        </span>
                        <span className={`text-xs font-medium ${getPriorityTextColor(task.priority)}`}>
                          {task.priority === 'high' ? '🔴 Yüksek' : 
                           task.priority === 'medium' ? '🟡 Orta' : '🟢 Düşük'} Öncelik
                        </span>
                      </div>
                      
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{task.title}</h3>
                      <p className="text-gray-600 mb-4">{task.description}</p>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <CalendarIcon className="h-4 w-4" />
                          <span>Son Tarih: {formatDate(task.due_date)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <ClockIcon className="h-4 w-4" />
                          <span>Tahmini: {formatTime(task.estimated_duration)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <BookOpenIcon className="h-4 w-4" />
                          <span>Ders: {task.subject}</span>
                        </div>
                      </div>
                      
                      {task.resource?.study_duration && (
                        <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                          <p className="text-sm text-blue-800">
                            <strong>İlerleme:</strong> {formatTime(task.resource.study_duration)} çalışıldı
                            {task.resource.questions_solved && `, ${task.resource.questions_solved} soru çözüldü`}
                          </p>
                        </div>
                      )}
                    </div>
                    
                    {isOverdue(task.due_date) && task.status !== 'completed' && (
                      <div className="ml-4">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800 border border-red-200">
                          Gecikmiş
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              type="tasks"
              title="Henüz görev bulunmuyor"
              description="Bu öğrenci için henüz herhangi bir görev atanmamış"
              size="md"
            />
          )}
        </div>
      </div>

      {/* Task Detail Modal */}
      {showTaskModal && selectedTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-96 overflow-y-auto">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900">{selectedTask.title}</h3>
                <button
                  onClick={() => setShowTaskModal(false)}
                  className="text-gray-400 hover:text-gray-600 text-xl"
                >
                  ×
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(selectedTask.status)}`}>
                    {getStatusIcon(selectedTask.status)}
                    {getStatusText(selectedTask.status)}
                  </span>
                </div>
                
                <p className="text-gray-700">{selectedTask.description}</p>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Son Tarih:</span>
                    <p className="text-gray-600">{formatDate(selectedTask.due_date)}</p>
                  </div>
                  <div>
                    <span className="font-medium">Tahmini Süre:</span>
                    <p className="text-gray-600">{formatTime(selectedTask.estimated_duration)}</p>
                  </div>
                </div>
                
                {selectedTask.resource?.study_duration && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium mb-2">Öğrenci İlerlemesi:</h4>
                    <div className="space-y-2 text-sm">
                      {selectedTask.resource.study_duration && (
                        <p><strong>Çalışma Süresi:</strong> {formatTime(selectedTask.resource.study_duration)}</p>
                      )}
                      {selectedTask.resource.questions_solved && (
                        <p><strong>Çözülen Sorular:</strong> {selectedTask.resource.questions_solved}</p>
                      )}
                      {selectedTask.resource.topics_studied && (
                        <p><strong>Çalışılan Konular:</strong> {selectedTask.resource.topics_studied}</p>
                      )}
                      {selectedTask.resource.student_notes && (
                        <p><strong>Öğrenci Notları:</strong> {selectedTask.resource.student_notes}</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Task Modal */}
      {showAddTaskModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-96 overflow-y-auto">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900">Yeni Görev Ekle</h3>
                <button
                  onClick={() => setShowAddTaskModal(false)}
                  className="text-gray-400 hover:text-gray-600 text-xl"
                >
                  <XIcon className="h-6 w-6" />
                </button>
              </div>
              
              <div className="space-y-4">
                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Görev Başlığı *
                  </label>
                  <input
                    type="text"
                    value={newTask.title}
                    onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Örn: Matematik - Türev Konusu"
                  />
                </div>

                {/* Subject */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ders
                  </label>
                  <select
                    value={newTask.subject}
                    onChange={(e) => setNewTask({...newTask, subject: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="matematik">Matematik</option>
                    <option value="fizik">Fizik</option>
                    <option value="kimya">Kimya</option>
                    <option value="biyoloji">Biyoloji</option>
                    <option value="turkce">Türkçe</option>
                    <option value="tarih">Tarih</option>
                    <option value="cografya">Coğrafya</option>
                    <option value="edebiyat">Edebiyat</option>
                    <option value="felsefe">Felsefe</option>
                  </select>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Açıklama
                  </label>
                  <textarea
                    value={newTask.description}
                    onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Görev detaylarını açıklayın..."
                  />
                </div>

                {/* Due Date and Time */}
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Son Tarih *
                    </label>
                    <input
                      type="date"
                      value={newTask.due_date}
                      onChange={(e) => setNewTask({...newTask, due_date: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Saat
                    </label>
                    <input
                      type="time"
                      value={newTask.due_time}
                      onChange={(e) => setNewTask({...newTask, due_time: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  {/* Estimated Duration */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tahmini Süre (dakika)
                    </label>
                    <input
                      type="number"
                      value={newTask.estimated_duration}
                      onChange={(e) => setNewTask({...newTask, estimated_duration: parseInt(e.target.value) || 60})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      min="15"
                      step="15"
                    />
                  </div>
                </div>

                {/* Priority */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Öncelik
                  </label>
                  <select
                    value={newTask.priority}
                    onChange={(e) => setNewTask({...newTask, priority: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="low">Düşük</option>
                    <option value="medium">Orta</option>
                    <option value="high">Yüksek</option>
                  </select>
                </div>

                {/* Recurrence */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tekrar
                  </label>
                  <select
                    value={newTask.recurrence}
                    onChange={(e) => setNewTask({...newTask, recurrence: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="none">Tekrarlanmaz</option>
                    <option value="daily">Her Gün</option>
                    <option value="weekly">Her Hafta</option>
                    <option value="monthly">Her Ay</option>
                  </select>
                </div>

                {/* Buttons */}
                <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => setShowAddTaskModal(false)}
                    className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                  >
                    İptal
                  </button>
                  <button
                    onClick={handleAddTask}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center gap-2"
                  >
                    <SaveIcon className="h-4 w-4" />
                    Görev Ekle
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Add Task Modal */}
      {showQuickAddModal && selectedSlot && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Yeni Görev</h3>
                  <p className="text-sm text-gray-600">
                    {moment(selectedSlot.start).format('DD MMMM YYYY, HH:mm')} - {moment(selectedSlot.end).format('HH:mm')}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowQuickAddModal(false);
                    setSelectedSlot(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XIcon className="h-6 w-6" />
                </button>
              </div>
              
              <div className="space-y-4">
                {/* Title */}
                <div>
                  <input
                    type="text"
                    value={quickTask.title}
                    onChange={(e) => setQuickTask({...quickTask, title: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Görev başlığı"
                    autoFocus
                  />
                </div>

                {/* Subject and Priority */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Ders</label>
                    <select
                      value={quickTask.subject}
                      onChange={(e) => setQuickTask({...quickTask, subject: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="matematik">Matematik</option>
                      <option value="fizik">Fizik</option>
                      <option value="kimya">Kimya</option>
                      <option value="biyoloji">Biyoloji</option>
                      <option value="turkce">Türkçe</option>
                      <option value="tarih">Tarih</option>
                      <option value="cografya">Coğrafya</option>
                      <option value="edebiyat">Edebiyat</option>
                      <option value="felsefe">Felsefe</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Öncelik</label>
                    <select
                      value={quickTask.priority}
                      onChange={(e) => setQuickTask({...quickTask, priority: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="low">Düşük</option>
                      <option value="medium">Orta</option>
                      <option value="high">Yüksek</option>
                    </select>
                  </div>
                </div>

                {/* Recurrence */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tekrar</label>
                  <select
                    value={quickTask.recurrence}
                    onChange={(e) => setQuickTask({...quickTask, recurrence: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="none">Tekrarlanmaz</option>
                    <option value="daily">Her Gün</option>
                    <option value="weekly">Her Hafta</option>
                    <option value="monthly">Her Ay</option>
                  </select>
                </div>

                {/* Buttons */}
                <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => {
                      setShowQuickAddModal(false);
                      setSelectedSlot(null);
                    }}
                    className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                  >
                    İptal
                  </button>
                  <button
                    onClick={handleQuickAddTask}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center gap-2"
                  >
                    <SaveIcon className="h-4 w-4" />
                    Ekle
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentTasks;