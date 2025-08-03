// Web Worker for background timer
let timers = new Map();
let intervals = new Map();

// Handle messages from main thread
self.onmessage = function(e) {
  const { type, id, duration, action } = e.data;
  
  switch (type) {
    case 'START':
      startTimer(id, duration);
      break;
    case 'PAUSE':
      pauseTimer(id);
      break;
    case 'RESUME':
      resumeTimer(id);
      break;
    case 'STOP':
      stopTimer(id);
      break;
    case 'GET_TIME':
      sendTimeUpdate(id);
      break;
  }
};

function startTimer(id, duration) {
  // Clear any existing timer
  stopTimer(id);
  
  // Initialize timer state
  timers.set(id, {
    startTime: Date.now(),
    duration: duration,
    remaining: duration,
    isPaused: false,
    pausedAt: null
  });
  
  // Start interval
  const interval = setInterval(() => {
    updateTimer(id);
  }, 100); // Update every 100ms for smooth display
  
  intervals.set(id, interval);
}

function updateTimer(id) {
  const timer = timers.get(id);
  if (!timer || timer.isPaused) return;
  
  const elapsed = Date.now() - timer.startTime;
  const remaining = Math.max(0, timer.duration - elapsed);
  
  timer.remaining = remaining;
  
  // Send update to main thread
  self.postMessage({
    type: 'UPDATE',
    id: id,
    remaining: remaining,
    elapsed: elapsed,
    isComplete: remaining === 0
  });
  
  // Timer completed
  if (remaining === 0) {
    stopTimer(id);
    self.postMessage({
      type: 'COMPLETE',
      id: id
    });
  }
}

function pauseTimer(id) {
  const timer = timers.get(id);
  if (!timer || timer.isPaused) return;
  
  timer.isPaused = true;
  timer.pausedAt = Date.now();
  timer.pausedRemaining = timer.remaining;
  
  // Clear interval
  const interval = intervals.get(id);
  if (interval) {
    clearInterval(interval);
    intervals.delete(id);
  }
  
  self.postMessage({
    type: 'PAUSED',
    id: id,
    remaining: timer.remaining
  });
}

function resumeTimer(id) {
  const timer = timers.get(id);
  if (!timer || !timer.isPaused) return;
  
  // Calculate new start time based on remaining time
  timer.startTime = Date.now();
  timer.duration = timer.pausedRemaining;
  timer.isPaused = false;
  timer.pausedAt = null;
  
  // Restart interval
  const interval = setInterval(() => {
    updateTimer(id);
  }, 100);
  
  intervals.set(id, interval);
  
  self.postMessage({
    type: 'RESUMED',
    id: id
  });
}

function stopTimer(id) {
  // Clear interval
  const interval = intervals.get(id);
  if (interval) {
    clearInterval(interval);
    intervals.delete(id);
  }
  
  // Remove timer
  timers.delete(id);
  
  self.postMessage({
    type: 'STOPPED',
    id: id
  });
}

function sendTimeUpdate(id) {
  const timer = timers.get(id);
  if (!timer) {
    self.postMessage({
      type: 'UPDATE',
      id: id,
      remaining: 0,
      elapsed: 0,
      isComplete: false,
      notFound: true
    });
    return;
  }
  
  if (!timer.isPaused) {
    updateTimer(id);
  } else {
    self.postMessage({
      type: 'UPDATE',
      id: id,
      remaining: timer.remaining,
      elapsed: timer.duration - timer.remaining,
      isComplete: false,
      isPaused: true
    });
  }
}