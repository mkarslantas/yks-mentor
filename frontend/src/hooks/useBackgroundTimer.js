import { useState, useEffect, useRef, useCallback } from 'react';

export const useBackgroundTimer = (initialTime = 25 * 60 * 1000, onComplete) => {
  const [timeRemaining, setTimeRemaining] = useState(initialTime);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const workerRef = useRef(null);
  const timerId = useRef('timer-' + Date.now());

  // Initialize Web Worker
  useEffect(() => {
    if (typeof Worker !== 'undefined') {
      workerRef.current = new Worker('/timer-worker.js');
      
      // Handle messages from worker
      workerRef.current.onmessage = (e) => {
        const { type, id, remaining, isComplete } = e.data;
        
        if (id !== timerId.current) return;
        
        switch (type) {
          case 'UPDATE':
            setTimeRemaining(remaining);
            break;
          case 'COMPLETE':
            setIsRunning(false);
            setIsPaused(false);
            setTimeRemaining(0);
            if (onComplete) onComplete();
            // Send notification if page is not visible
            if (document.hidden && 'Notification' in window && Notification.permission === 'granted') {
              new Notification('Pomodoro Tamamlandı!', {
                body: 'Çalışma seansınız sona erdi. Mola zamanı!',
                icon: '/favicon.ico'
              });
            }
            break;
          case 'PAUSED':
            setIsPaused(true);
            break;
          case 'RESUMED':
            setIsPaused(false);
            break;
        }
      };
      
      // Request notification permission
      if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
      }
    }
    
    return () => {
      if (workerRef.current) {
        workerRef.current.terminate();
      }
    };
  }, [onComplete]);

  // Start timer
  const start = useCallback(() => {
    if (workerRef.current && !isRunning) {
      workerRef.current.postMessage({
        type: 'START',
        id: timerId.current,
        duration: timeRemaining
      });
      setIsRunning(true);
      setIsPaused(false);
    }
  }, [timeRemaining, isRunning]);

  // Pause timer
  const pause = useCallback(() => {
    if (workerRef.current && isRunning && !isPaused) {
      workerRef.current.postMessage({
        type: 'PAUSE',
        id: timerId.current
      });
    }
  }, [isRunning, isPaused]);

  // Resume timer
  const resume = useCallback(() => {
    if (workerRef.current && isRunning && isPaused) {
      workerRef.current.postMessage({
        type: 'RESUME',
        id: timerId.current
      });
    }
  }, [isRunning, isPaused]);

  // Stop timer
  const stop = useCallback(() => {
    if (workerRef.current) {
      workerRef.current.postMessage({
        type: 'STOP',
        id: timerId.current
      });
      setIsRunning(false);
      setIsPaused(false);
      setTimeRemaining(initialTime);
    }
  }, [initialTime]);

  // Reset timer
  const reset = useCallback((newTime = initialTime) => {
    stop();
    setTimeRemaining(newTime);
  }, [initialTime, stop]);

  // Toggle play/pause
  const toggle = useCallback(() => {
    if (!isRunning) {
      start();
    } else if (isPaused) {
      resume();
    } else {
      pause();
    }
  }, [isRunning, isPaused, start, pause, resume]);

  // Update time when returning to the page
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && workerRef.current && isRunning) {
        // Request current time from worker
        workerRef.current.postMessage({
          type: 'GET_TIME',
          id: timerId.current
        });
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isRunning]);

  return {
    timeRemaining,
    isRunning,
    isPaused,
    start,
    pause,
    resume,
    stop,
    reset,
    toggle
  };
};