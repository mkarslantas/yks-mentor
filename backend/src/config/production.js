const fs = require('fs');
const path = require('path');

const productionConfig = {
  // Database optimizations for production
  database: {
    // Enable WAL mode for better concurrency
    pragma: {
      journal_mode: 'WAL',
      synchronous: 'NORMAL',
      cache_size: -64000, // 64MB cache
      temp_store: 'MEMORY',
      mmap_size: 67108864, // 64MB
    }
  },

  // Logging configuration
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    file: {
      enabled: true,
      path: './logs',
      maxFiles: '14d',
      maxSize: '20m'
    },
    console: {
      enabled: process.env.NODE_ENV !== 'production'
    }
  },

  // Security headers
  security: {
    helmet: {
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", "data:", "https:"],
          connectSrc: ["'self'"],
          fontSrc: ["'self'"],
          objectSrc: ["'none'"],
          mediaSrc: ["'self'"],
          frameSrc: ["'none'"],
        },
      },
      crossOriginEmbedderPolicy: false,
      hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true
      }
    }
  },

  // Performance settings
  performance: {
    compression: {
      enabled: true,
      level: 6,
      threshold: 1024
    },
    staticFiles: {
      maxAge: '1y',
      etag: true
    }
  }
};

module.exports = productionConfig;