import React, { createContext, useContext, useState, useEffect, useRef } from 'react';

const TimerContext = createContext();

export const TimerProvider = ({ children }) => {
  const [timerState, setTimerState] = useState(() => {
    // Load saved state from localStorage
    const saved = localStorage.getItem('pomodoroTimerState');
    if (saved) {
      return JSON.parse(saved);
    }
    return {
      isRunning: false,
      isPaused: false,
      timeRemaining: 25 * 60 * 1000,
      currentSession: 'study',
      sessionCount: 0,
      totalStudyTime: 0,
      studyData: {
        subject: 'matematik',
        topic: '',
        notes: ''
      },
      settings: {
        studyDuration: 25,
        shortBreakDuration: 5,
        longBreakDuration: 15,
        longBreakInterval: 4,
        autoStartBreaks: false,
        autoStartSessions: false,
        soundEnabled: true
      }
    };
  });

  const workerRef = useRef(null);
  const timerId = useRef('global-timer-' + Date.now());

  // Initialize Web Worker
  useEffect(() => {
    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
    
    if (typeof Worker !== 'undefined' && !workerRef.current) {
      workerRef.current = new Worker('/timer-worker.js');
      
      // Handle messages from worker
      workerRef.current.onmessage = (e) => {
        const { type, id, remaining, isComplete } = e.data;
        
        if (id !== timerId.current) return;
        
        switch (type) {
          case 'UPDATE':
            setTimerState(prev => ({
              ...prev,
              timeRemaining: remaining
            }));
            break;
          case 'COMPLETE':
            handleSessionComplete();
            break;
          case 'PAUSED':
            setTimerState(prev => ({
              ...prev,
              isPaused: true,
              timeRemaining: remaining
            }));
            break;
          case 'RESUMED':
            setTimerState(prev => ({
              ...prev,
              isPaused: false
            }));
            break;
          case 'STOPPED':
            setTimerState(prev => ({
              ...prev,
              isRunning: false,
              isPaused: false
            }));
            break;
        }
      };

      // Restore timer if it was running
      if (timerState.isRunning) {
        workerRef.current.postMessage({
          type: 'START',
          id: timerId.current,
          duration: timerState.timeRemaining
        });
        
        if (timerState.isPaused) {
          setTimeout(() => {
            workerRef.current.postMessage({
              type: 'PAUSE',
              id: timerId.current
            });
          }, 100);
        }
      }
    }
    
    return () => {
      if (workerRef.current && !timerState.isRunning) {
        workerRef.current.terminate();
        workerRef.current = null;
      }
    };
  }, []);

  // Save state to localStorage
  useEffect(() => {
    localStorage.setItem('pomodoroTimerState', JSON.stringify(timerState));
  }, [timerState]);

  const handleSessionComplete = () => {
    const { currentSession, sessionCount, settings, totalStudyTime } = timerState;
    
    if (currentSession === 'study') {
      const newSessionCount = sessionCount + 1;
      const newTotalStudyTime = totalStudyTime + settings.studyDuration;
      const isLongBreak = newSessionCount % settings.longBreakInterval === 0;
      const breakDuration = isLongBreak ? settings.longBreakDuration : settings.shortBreakDuration;
      
      setTimerState(prev => ({
        ...prev,
        isRunning: false,
        isPaused: false,
        currentSession: 'break',
        sessionCount: newSessionCount,
        totalStudyTime: newTotalStudyTime,
        timeRemaining: breakDuration * 60 * 1000
      }));

      // Send notification
      if (document.hidden && 'Notification' in window && Notification.permission === 'granted') {
        new Notification('Pomodoro Tamamlandı!', {
          body: `Çalışma seansı tamamlandı! ${isLongBreak ? 'Uzun' : 'Kısa'} mola zamanı (${breakDuration} dk)`,
          icon: '/favicon.ico'
        });
      }
      
      if (settings.autoStartBreaks) {
        setTimeout(() => startTimer(), 1000);
      }
    } else {
      setTimerState(prev => ({
        ...prev,
        isRunning: false,
        isPaused: false,
        currentSession: 'study',
        timeRemaining: settings.studyDuration * 60 * 1000
      }));

      if (document.hidden && 'Notification' in window && Notification.permission === 'granted') {
        new Notification('Mola Bitti!', {
          body: 'Çalışmaya devam edebilirsiniz.',
          icon: '/favicon.ico'
        });
      }
      
      if (settings.autoStartSessions) {
        setTimeout(() => startTimer(), 1000);
      }
    }
  };

  const startTimer = () => {
    if (workerRef.current && !timerState.isRunning) {
      workerRef.current.postMessage({
        type: 'START',
        id: timerId.current,
        duration: timerState.timeRemaining
      });
      setTimerState(prev => ({
        ...prev,
        isRunning: true,
        isPaused: false
      }));
    }
  };

  const pauseTimer = () => {
    if (workerRef.current && timerState.isRunning && !timerState.isPaused) {
      workerRef.current.postMessage({
        type: 'PAUSE',
        id: timerId.current
      });
    }
  };

  const resumeTimer = () => {
    if (workerRef.current && timerState.isRunning && timerState.isPaused) {
      workerRef.current.postMessage({
        type: 'RESUME',
        id: timerId.current
      });
    }
  };

  const stopTimer = () => {
    if (workerRef.current) {
      workerRef.current.postMessage({
        type: 'STOP',
        id: timerId.current
      });
    }
  };

  const resetTimer = () => {
    stopTimer();
    const { settings } = timerState;
    setTimerState(prev => ({
      ...prev,
      isRunning: false,
      isPaused: false,
      timeRemaining: settings.studyDuration * 60 * 1000,
      currentSession: 'study',
      sessionCount: 0,
      totalStudyTime: 0,
      studyData: {
        subject: 'matematik',
        topic: '',
        notes: ''
      }
    }));
    localStorage.removeItem('pomodoroTimerState');
  };

  const updateSettings = (newSettings) => {
    setTimerState(prev => ({
      ...prev,
      settings: { ...prev.settings, ...newSettings }
    }));
  };

  const updateStudyData = (newData) => {
    setTimerState(prev => ({
      ...prev,
      studyData: { ...prev.studyData, ...newData }
    }));
  };

  const value = {
    ...timerState,
    startTimer,
    pauseTimer,
    resumeTimer,
    stopTimer,
    resetTimer,
    updateSettings,
    updateStudyData
  };

  return (
    <TimerContext.Provider value={value}>
      {children}
    </TimerContext.Provider>
  );
};

export const useTimer = () => {
  const context = useContext(TimerContext);
  if (!context) {
    throw new Error('useTimer must be used within a TimerProvider');
  }
  return context;
};