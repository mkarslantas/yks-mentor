const fs = require('fs');
const path = require('path');

class Logger {
  constructor() {
    this.logDir = path.join(__dirname, '../../logs');
    this.ensureLogDir();
  }

  ensureLogDir() {
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
  }

  getTimestamp() {
    return new Date().toISOString();
  }

  formatMessage(level, message, meta = {}) {
    return JSON.stringify({
      timestamp: this.getTimestamp(),
      level: level.toUpperCase(),
      message,
      meta,
      pid: process.pid
    }) + '\n';
  }

  writeToFile(filename, content) {
    const filePath = path.join(this.logDir, filename);
    fs.appendFileSync(filePath, content, 'utf8');
  }

  log(level, message, meta = {}) {
    const logEntry = this.formatMessage(level, message, meta);
    
    // Console output for non-production
    if (process.env.NODE_ENV !== 'production') {
      const colors = {
        error: '\x1b[31m',
        warn: '\x1b[33m',
        info: '\x1b[36m',
        debug: '\x1b[90m',
        reset: '\x1b[0m'
      };
      
      const color = colors[level] || colors.reset;
      console.log(`${color}[${level.toUpperCase()}] ${message}${colors.reset}`, meta);
    }

    // File output
    this.writeToFile(`app-${new Date().toISOString().split('T')[0]}.log`, logEntry);
    
    // Separate error log
    if (level === 'error') {
      this.writeToFile(`error-${new Date().toISOString().split('T')[0]}.log`, logEntry);
    }
  }

  error(message, meta = {}) {
    this.log('error', message, meta);
  }

  warn(message, meta = {}) {
    this.log('warn', message, meta);
  }

  info(message, meta = {}) {
    this.log('info', message, meta);
  }

  debug(message, meta = {}) {
    if (process.env.NODE_ENV !== 'production') {
      this.log('debug', message, meta);
    }
  }

  // Clean old log files (keep last 14 days)
  cleanOldLogs() {
    const files = fs.readdirSync(this.logDir);
    const now = new Date();
    const fourteenDaysAgo = new Date(now.getTime() - (14 * 24 * 60 * 60 * 1000));

    files.forEach(file => {
      const filePath = path.join(this.logDir, file);
      const stats = fs.statSync(filePath);
      
      if (stats.mtime < fourteenDaysAgo) {
        fs.unlinkSync(filePath);
        this.info(`Cleaned old log file: ${file}`);
      }
    });
  }
}

// Create singleton instance
const logger = new Logger();

// Clean old logs on startup
if (process.env.NODE_ENV === 'production') {
  logger.cleanOldLogs();
}

module.exports = logger;