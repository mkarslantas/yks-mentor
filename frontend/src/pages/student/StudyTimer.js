import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { 
  PlayIcon, 
  PauseIcon, 
  Square, 
  SettingsIcon,
  BookOpenIcon,
  ClockIcon,
  TargetIcon,
  TrendingUpIcon,
  RefreshCwIcon,
  ZapIcon,
  CheckCircleIcon,
  TimerIcon,
  BrainIcon,
  CoffeeIcon,
  VolumeXIcon,
  Volume2Icon,
  SparklesIcon,
  StarIcon,
  FlameIcon
} from 'lucide-react';
import { studentService } from '../../services/student.service';
import { useTimer } from '../../context/TimerContext';

const StudyTimer = () => {
  const navigate = useNavigate();
  const audioRef = useRef(null);
  
  // Get timer state and methods from context
  const {
    isRunning,
    isPaused,
    timeRemaining,
    currentSession,
    sessionCount,
    totalStudyTime,
    studyData,
    settings,
    startTimer,
    pauseTimer,
    resumeTimer,
    stopTimer,
    resetTimer,
    updateSettings,
    updateStudyData
  } = useTimer();

  const [showSettings, setShowSettings] = useState(false);
  const [showStudyForm, setShowStudyForm] = useState(false);

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


  const playNotificationSound = () => {
    if (settings.soundEnabled && audioRef.current) {
      audioRef.current.play().catch(e => console.log('Audio play failed:', e));
    }
  };


  const handleStart = () => {
    if (!isRunning && currentSession === 'study' && sessionCount === 0) {
      setShowStudyForm(true);
      return;
    }
    startTimer();
  };

  const handlePause = () => {
    pauseTimer();
  };

  const handleStop = () => {
    // Save study record if there was any study time
    if (totalStudyTime > 0) {
      handleSaveStudyRecord();
    }
    stopTimer();
  };

  const handleReset = () => {
    resetTimer();
  };

  const handleSaveStudyRecord = async () => {
    if (totalStudyTime === 0) return;

    try {
      const recordData = {
        study_date: new Date().toISOString().split('T')[0],
        subject: studyData.subject,
        topic: studyData.topic || 'Pomodoro çalışması',
        duration_minutes: totalStudyTime,
        questions_solved: 0,
        correct_answers: 0,
        wrong_answers: 0,
        empty_answers: 0,
        study_type: 'konu_calismasi',
        notes: studyData.notes || `Pomodoro tekniği ile ${sessionCount} seans tamamlandı.`
      };

      await studentService.createStudyRecord(recordData);
      toast.success('Çalışma kaydı başarıyla kaydedildi!');
      handleReset();
    } catch (error) {
      console.error('Study record save error:', error);
      toast.error('Çalışma kaydı kaydedilirken hata oluştu');
    }
  };


  const formatDuration = (minutes) => {
    if (minutes < 60) return `${minutes} dk`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}s ${mins}dk` : `${hours} saat`;
  };

  const getSessionTitle = () => {
    if (currentSession === 'study') {
      return `Çalışma Seansı ${sessionCount + 1}`;
    } else {
      const isLongBreak = sessionCount % settings.longBreakInterval === 0;
      return isLongBreak ? 'Uzun Mola' : 'Kısa Mola';
    }
  };

  const getProgressPercentage = () => {
    // Calculate total time based on current session and settings
    const totalTime = currentSession === 'study' 
      ? settings.studyDuration * 60 * 1000
      : (sessionCount % settings.longBreakInterval === 0 
          ? settings.longBreakDuration * 60 * 1000 
          : settings.shortBreakDuration * 60 * 1000);
    
    const elapsed = totalTime - timeRemaining;
    return Math.max(0, Math.min(100, (elapsed / totalTime) * 100));
  };

  // Convert milliseconds to minutes and seconds
  const formatTime = (milliseconds) => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

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
                <TimerIcon className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">
                  Pomodoro Zamanlayıcı
                </h1>
                <p className="text-purple-100 text-base">
                  Verimli çalışma seansları için odaklanın ve ilerlemenizi takip edin
                </p>
                <div className="flex items-center gap-4 text-sm text-purple-100 mt-3">
                  <div className="flex items-center gap-1">
                    <BrainIcon className="h-4 w-4 text-white" />
                    <span>{sessionCount} seans</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <FlameIcon className="h-4 w-4 text-yellow-300" />
                    <span>{formatDuration(totalStudyTime)}</span>
                  </div>
                </div>
              </div>
            </div>
            <button
              onClick={() => setShowSettings(true)}
              className="bg-white/20 backdrop-blur-sm border border-white/30 hover:bg-white/30 text-white px-6 py-3 rounded-xl transition-all duration-200 flex items-center gap-2"
            >
              <SettingsIcon className="h-5 w-5" />
              Ayarlar
            </button>
          </div>
        </div>
      </div>

      {/* Two Row Layout */}
      <div className="space-y-6">
        {/* First Row - Professional Timer Section */}
        <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl border border-gray-200 shadow-lg p-8 relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute top-4 left-4 w-32 h-32 rounded-full bg-blue-500"></div>
            <div className="absolute bottom-4 right-4 w-24 h-24 rounded-full bg-green-500"></div>
          </div>
          
          {/* Session Header */}
          <div className="relative z-10 text-center mb-6">
            <div className="mb-2">
              <h2 className="text-2xl font-bold text-gray-800">
                {getSessionTitle()}
              </h2>
            </div>
            
            {/* Progress Bar */}
            <div className="w-64 h-2 bg-gray-200 rounded-full mx-auto mb-2 overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-500 ${
                  currentSession === 'study' 
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600' 
                    : 'bg-gradient-to-r from-green-500 to-green-600'
                }`}
                style={{ width: `${getProgressPercentage()}%` }}
              ></div>
            </div>
            
            <p className="text-sm text-gray-600 font-medium">
              {Math.round(getProgressPercentage())}% tamamlandı
            </p>
          </div>
          
          {/* Current Study Info */}
          {currentSession === 'study' && studyData.topic && (
            <div className="relative z-10 mb-6 max-w-md mx-auto">
              <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-blue-200/50 p-4 shadow-sm">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <BookOpenIcon className="h-4 w-4 text-blue-600" />
                  <span className="font-semibold text-blue-900 text-sm">
                    {subjects.find(s => s.value === studyData.subject)?.label}
                  </span>
                </div>
                <p className="text-blue-800 font-medium text-center">{studyData.topic}</p>
              </div>
            </div>
          )}
          
          {/* Main Timer Display */}
          <div className="relative z-10 flex items-center justify-center mb-8">
            {/* Enhanced Progress Circle */}
            <div className="relative">
              {/* Outer glow effect */}
              <div className={`absolute inset-0 rounded-full blur-3xl opacity-20 ${
                currentSession === 'study' ? 'bg-blue-500' : 'bg-green-500'
              }`}></div>
              
              {/* Main circle container */}
              <div className="relative w-80 h-80">
                <svg className="w-80 h-80 transform -rotate-90" viewBox="0 0 320 320">
                  {/* Background circle with shadow */}
                  <circle
                    cx="160"
                    cy="160"
                    r="140"
                    stroke="#f3f4f6"
                    strokeWidth="12"
                    fill="none"
                    className="drop-shadow-sm"
                  />
                  
                  {/* Progress circle with gradient */}
                  <circle
                    cx="160"
                    cy="160"
                    r="140"
                    stroke="url(#timerGradient)"
                    strokeWidth="12"
                    fill="none"
                    strokeDasharray={`${2 * Math.PI * 140}`}
                    strokeDashoffset={`${2 * Math.PI * 140 * (1 - getProgressPercentage() / 100)}`}
                    strokeLinecap="round"
                    className="drop-shadow-lg transition-all duration-500 ease-out"
                    style={{
                      filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.1))'
                    }}
                  />
                  
                  {/* Gradient definitions */}
                  <defs>
                    <linearGradient id="timerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      {currentSession === 'study' ? (
                        <>
                          <stop offset="0%" stopColor="#3b82f6" />
                          <stop offset="50%" stopColor="#6366f1" />
                          <stop offset="100%" stopColor="#8b5cf6" />
                        </>
                      ) : (
                        <>
                          <stop offset="0%" stopColor="#10b981" />
                          <stop offset="50%" stopColor="#06b6d4" />
                          <stop offset="100%" stopColor="#3b82f6" />
                        </>
                      )}
                    </linearGradient>
                  </defs>
                </svg>
                
                {/* Timer content */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    {/* Main time display */}
                    <div className={`text-7xl font-mono font-bold mb-3 bg-gradient-to-br bg-clip-text text-transparent ${
                      currentSession === 'study' 
                        ? 'from-blue-600 to-purple-600' 
                        : 'from-green-600 to-blue-600'
                    }`}>
                      {formatTime(timeRemaining)}
                    </div>
                    
                    {/* Session type indicator */}
                    <div className="flex items-center justify-center gap-2 mb-4">
                      <div className={`w-3 h-3 rounded-full ${
                        isRunning 
                          ? (currentSession === 'study' ? 'bg-blue-500 animate-pulse' : 'bg-green-500 animate-pulse')
                          : 'bg-gray-300'
                      }`}></div>
                      <span className="text-lg font-semibold text-gray-700">
                        {currentSession === 'study' ? 'Çalışma Zamanı' : 'Mola Zamanı'}
                      </span>
                    </div>
                    
                    {/* Session counter */}
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/60 backdrop-blur-sm rounded-full border border-gray-200/50">
                      <CheckCircleIcon className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-medium text-gray-700">
                        {sessionCount} seans tamamlandı
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Enhanced Timer Controls */}
          <div className="relative z-10 flex flex-wrap justify-center gap-4">
            {!isRunning ? (
              <button
                onClick={handleStart}
                className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-8 py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center gap-3"
              >
                <PlayIcon className="h-6 w-6" />
                <span className="text-lg">Başlat</span>
              </button>
            ) : isPaused ? (
              <button
                onClick={resumeTimer}
                className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-8 py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center gap-3"
              >
                <PlayIcon className="h-6 w-6" />
                <span className="text-lg">Devam Et</span>
              </button>
            ) : (
              <button
                onClick={handlePause}
                className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white px-8 py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center gap-3"
              >
                <PauseIcon className="h-6 w-6" />
                <span className="text-lg">Duraklat</span>
              </button>
            )}
            
            <button
              onClick={handleStop}
              className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-6 py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              disabled={sessionCount === 0 && totalStudyTime === 0}
            >
              <Square className="h-5 w-5" />
              <span>Durdur</span>
            </button>
            
            <button
              onClick={handleReset}
              className="bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white px-6 py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center gap-2"
            >
              <RefreshCwIcon className="h-5 w-5" />
              <span>Sıfırla</span>
            </button>
          </div>
        </div>

        {/* Second Row - Three Info Boxes Side by Side */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Session Stats */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 bg-blue-100 rounded-lg flex items-center justify-center">
                  <TrendingUpIcon className="h-3 w-3 text-blue-600" />
                </div>
                <h3 className="text-sm font-bold text-gray-900">İstatistikler</h3>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center p-2 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-1">
                    <CheckCircleIcon className="h-3 w-3 text-blue-600" />
                    <span className="font-medium text-gray-700 text-xs">Seans</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-lg font-bold text-blue-600">{sessionCount}</span>
                    {sessionCount > 0 && <StarIcon className="h-3 w-3 text-yellow-500" />}
                  </div>
                </div>
                
                <div className="flex justify-between items-center p-2 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-1">
                    <FlameIcon className="h-3 w-3 text-green-600" />
                    <span className="font-medium text-gray-700 text-xs">Süre</span>
                  </div>
                  <span className="text-sm font-bold text-green-600">
                    {formatDuration(totalStudyTime)}
                  </span>
                </div>
                
                <div className="flex justify-between items-center p-2 bg-purple-50 rounded-lg">
                  <div className="flex items-center gap-1">
                    <CoffeeIcon className="h-3 w-3 text-purple-600" />
                    <span className="font-medium text-gray-700 text-xs">Mola</span>
                  </div>
                  <span className="text-xs font-bold text-purple-600">
                    {sessionCount % settings.longBreakInterval === 0 && sessionCount > 0
                      ? `${settings.longBreakDuration}dk`
                      : `${settings.shortBreakDuration}dk`
                    }
                  </span>
                </div>
              </div>
            </div>
            
            {/* Current Study Subject */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 bg-green-100 rounded-lg flex items-center justify-center">
                  <BookOpenIcon className="h-3 w-3 text-green-600" />
                </div>
                <h3 className="text-sm font-bold text-gray-900">Çalışma Konusu</h3>
              </div>
              
              {studyData.topic ? (
                <div className="space-y-2">
                  <div className="bg-blue-50 rounded-lg p-2">
                    <p className="text-xs font-medium text-blue-700 mb-1">Ders</p>
                    <p className="text-xs font-bold text-blue-900">
                      {subjects.find(s => s.value === studyData.subject)?.label}
                    </p>
                  </div>
                  
                  <div className="bg-green-50 rounded-lg p-2">
                    <p className="text-xs font-medium text-green-700 mb-1">Konu</p>
                    <p className="text-xs font-bold text-green-900">{studyData.topic}</p>
                  </div>
                  
                  {studyData.notes && (
                    <div className="bg-purple-50 rounded-lg p-2">
                      <p className="text-xs font-medium text-purple-700 mb-1">Notlar</p>
                      <p className="text-xs text-purple-800 italic">{studyData.notes}</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-4">
                  <div className="w-8 h-8 bg-gray-100 rounded-full mx-auto mb-2 flex items-center justify-center">
                    <BookOpenIcon className="h-4 w-4 text-gray-400" />
                  </div>
                  <p className="text-gray-500 text-xs mb-1">Henüz konu seçilmedi</p>
                  <p className="text-xs text-gray-400">Timer başlatınca seçebilirsiniz</p>
                </div>
              )}
            </div>
            
            {/* Pomodoro Tips */}
            <div className="bg-blue-50 rounded-lg border border-blue-200 p-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 bg-blue-100 rounded-lg flex items-center justify-center">
                  <ZapIcon className="h-3 w-3 text-blue-600" />
                </div>
                <h3 className="text-sm font-bold text-blue-900">İpuçları</h3>
              </div>
              <div className="space-y-1">
                {[
                  { icon: BrainIcon, text: '25dk tek konuya odaklan' },
                  { icon: CoffeeIcon, text: 'Molada ekrandan uzaklaş' },
                  { icon: ClockIcon, text: 'Her 4 seansta uzun mola' },
                  { icon: TargetIcon, text: 'Dikkat dağıtıcıları kaldır' },
                  { icon: SparklesIcon, text: 'Düzenli su iç' }
                ].map((tip, index) => (
                  <div key={index} className="flex items-center gap-1 p-1 bg-white/60 rounded">
                    <tip.icon className="h-2 w-2 text-blue-600 flex-shrink-0" />
                    <span className="text-xs text-blue-800 font-medium">{tip.text}</span>
                  </div>
                ))}
              </div>
          </div>
        </div>
      </div>

        {/* Settings Modal */}
        {showSettings && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl border border-gray-200">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                  <SettingsIcon className="h-5 w-5 text-white" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Zamanlayıcı Ayarları</h2>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700">Çalışma Süresi</label>
                    <div className="relative">
                      <input
                        type="number"
                        min="1"
                        max="60"
                        value={settings.studyDuration}
                        onChange={(e) => updateSettings({ studyDuration: parseInt(e.target.value) })}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-gray-500">dk</span>
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700">Kısa Mola</label>
                    <div className="relative">
                      <input
                        type="number"
                        min="1"
                        max="30"
                        value={settings.shortBreakDuration}
                        onChange={(e) => updateSettings({ shortBreakDuration: parseInt(e.target.value) })}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-gray-500">dk</span>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700">Uzun Mola</label>
                    <div className="relative">
                      <input
                        type="number"
                        min="1"
                        max="60"
                        value={settings.longBreakDuration}
                        onChange={(e) => updateSettings({ longBreakDuration: parseInt(e.target.value) })}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-gray-500">dk</span>
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700">Uzun Mola Aralığı</label>
                    <div className="relative">
                      <input
                        type="number"
                        min="2"
                        max="10"
                        value={settings.longBreakInterval}
                        onChange={(e) => updateSettings({ longBreakInterval: parseInt(e.target.value) })}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-gray-500">seans</span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-3">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Otomatik Ayarlar</h4>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.autoStartBreaks}
                        onChange={(e) => updateSettings({ autoStartBreaks: e.target.checked })}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="text-sm text-gray-700">Molaları otomatik başlat</span>
                    </label>
                    
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.autoStartSessions}
                        onChange={(e) => updateSettings({ autoStartSessions: e.target.checked })}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="text-sm text-gray-700">Çalışma seanslarını otomatik başlat</span>
                    </label>
                    
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.soundEnabled}
                        onChange={(e) => updateSettings({ soundEnabled: e.target.checked })}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <div className="flex items-center gap-1">
                        {settings.soundEnabled ? (
                          <Volume2Icon className="h-4 w-4 text-blue-600" />
                        ) : (
                          <VolumeXIcon className="h-4 w-4 text-gray-400" />
                        )}
                        <span className="text-sm text-gray-700">Bildirim sesi</span>
                      </div>
                    </label>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-3 mt-5">
                <button
                  onClick={() => setShowSettings(false)}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 rounded-lg font-medium transition-all duration-200"
                >
                  İptal
                </button>
                <button
                  onClick={() => {
                    setShowSettings(false);
                    toast.success('Ayarlar kaydedildi!');
                  }}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2"
                >
                  <CheckCircleIcon className="h-4 w-4" />
                  Kaydet
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Study Form Modal */}
        {showStudyForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Çalışma Konusu</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ders</label>
                  <select
                    value={studyData.subject}
                    onChange={(e) => updateStudyData({ subject: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {subjects.map(subject => (
                      <option key={subject.value} value={subject.value}>
                        {subject.label}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Konu</label>
                  <input
                    type="text"
                    value={studyData.topic}
                    onChange={(e) => updateStudyData({ topic: e.target.value })}
                    placeholder="Örn: Türev, Limit, vb."
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notlar (Opsiyonel)</label>
                  <textarea
                    value={studyData.notes}
                    onChange={(e) => updateStudyData({ notes: e.target.value })}
                    placeholder="Çalışma planınız, hedefleriniz..."
                    rows={3}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              
              <div className="flex gap-3 mt-5">
                <button
                  onClick={() => setShowStudyForm(false)}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 rounded-lg font-medium transition-all duration-200"
                >
                  İptal
                </button>
                <button
                  onClick={() => {
                    if (studyData.topic.trim()) {
                      setShowStudyForm(false);
                      startTimer();
                    } else {
                      toast.error('Lütfen çalışma konusunu girin');
                    }
                  }}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium transition-all duration-200"
                >
                  Başlat
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Audio element for notifications */}
        <audio ref={audioRef} preload="auto">
          <source src="data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+z6z2IdBjOH0fPRfC4FJHAH8eOXQwsOPt/3yWQdCDeRz/LNeSgFLI7u9KxsGQU6ltny0IAzBBl+wW7Bb2OZAQ==" type="audio/wav" />
        </audio>
        </div>
      </div>
    </div>
  );
};

export default StudyTimer;