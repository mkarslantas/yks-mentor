const { ERROR_CODES } = require('../utils/constants');
const logger = require('../utils/logger');

const errorMiddleware = (err, req, res, next) => {
  // Log error with context
  logger.error('Request error', {
    error: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    userId: req.user?.id
  });

  // Default error
  let error = {
    code: ERROR_CODES.INTERNAL_ERROR,
    message: 'Sunucu hatası',
    statusCode: 500
  };

  // Validation errors
  if (err.name === 'ValidationError') {
    error = {
      code: ERROR_CODES.VALIDATION_ERROR,
      message: 'Veri doğrulama hatası',
      details: err.errors,
      statusCode: 400
    };
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    error = {
      code: ERROR_CODES.AUTHENTICATION_ERROR,
      message: 'Geçersiz token',
      statusCode: 401
    };
  }

  if (err.name === 'TokenExpiredError') {
    error = {
      code: ERROR_CODES.AUTHENTICATION_ERROR,
      message: 'Token süresi dolmuş',
      statusCode: 401
    };
  }

  // SQLite errors
  if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
    error = {
      code: ERROR_CODES.DUPLICATE_ENTRY,
      message: 'Bu kayıt zaten mevcut',
      statusCode: 409
    };
  }

  if (err.code === 'SQLITE_CONSTRAINT_FOREIGNKEY') {
    error = {
      code: ERROR_CODES.VALIDATION_ERROR,
      message: 'Geçersiz referans',
      statusCode: 400
    };
  }

  if (err.code === 'SQLITE_CONSTRAINT_CHECK') {
    error = {
      code: ERROR_CODES.VALIDATION_ERROR,
      message: 'Geçersiz veri değeri',
      statusCode: 400
    };
  }

  // Custom application errors
  if (err.statusCode) {
    error.statusCode = err.statusCode;
  }

  if (err.code) {
    error.code = err.code;
  }

  if (err.message) {
    error.message = err.message;
  }

  // Log errors in development
  if (process.env.NODE_ENV === 'development') {
    error.stack = err.stack;
  }

  res.status(error.statusCode).json({
    success: false,
    error
  });
};

// Async error handler wrapper
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// 404 handler
const notFoundHandler = (req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: ERROR_CODES.NOT_FOUND,
      message: 'Endpoint bulunamadı'
    }
  });
};

module.exports = {
  errorMiddleware,
  asyncHandler,
  notFoundHandler
};