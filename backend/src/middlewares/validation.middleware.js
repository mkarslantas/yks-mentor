const { validationResult } = require('express-validator');
const { ERROR_CODES } = require('../utils/constants');

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map(error => ({
      field: error.path || error.param,
      message: error.msg,
      value: error.value
    }));

    return res.status(400).json({
      success: false,
      error: {
        code: ERROR_CODES.VALIDATION_ERROR,
        message: 'Veri doğrulama hatası',
        details: formattedErrors
      }
    });
  }

  next();
};

const sanitizeInput = (req, res, next) => {
  // Remove any potential XSS content from string fields
  const sanitizeValue = (value) => {
    if (typeof value === 'string') {
      // Basic XSS prevention - remove script tags and javascript: URLs
      return value
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/javascript:/gi, '')
        .trim();
    }
    return value;
  };

  const sanitizeObject = (obj) => {
    if (obj && typeof obj === 'object') {
      Object.keys(obj).forEach(key => {
        if (Array.isArray(obj[key])) {
          obj[key] = obj[key].map(item => sanitizeValue(item));
        } else if (typeof obj[key] === 'object' && obj[key] !== null) {
          sanitizeObject(obj[key]);
        } else {
          obj[key] = sanitizeValue(obj[key]);
        }
      });
    }
  };

  // Sanitize request body
  if (req.body) {
    sanitizeObject(req.body);
  }

  // Sanitize query parameters
  if (req.query) {
    sanitizeObject(req.query);
  }

  next();
};

const validateStudentAccess = async (req, res, next) => {
  try {
    const studentId = req.params.studentId || req.params.id;
    const user = req.user;

    if (!studentId) {
      return res.status(400).json({
        success: false,
        error: {
          code: ERROR_CODES.VALIDATION_ERROR,
          message: 'Öğrenci ID gerekli'
        }
      });
    }

    // Students can only access their own data
    if (user.role === 'student' && user.id != studentId) {
      return res.status(403).json({
        success: false,
        error: {
          code: ERROR_CODES.AUTHORIZATION_ERROR,
          message: 'Bu veriye erişim yetkiniz yok'
        }
      });
    }

    // Coaches can only access their students' data
    if (user.role === 'coach') {
      const Student = require('../models/User');
      const studentProfile = await Student.findById(studentId);
      
      if (!studentProfile || studentProfile.role !== 'student') {
        return res.status(404).json({
          success: false,
          error: {
            code: ERROR_CODES.NOT_FOUND,
            message: 'Öğrenci bulunamadı'
          }
        });
      }

      // Check if this coach is assigned to this student
      const database = require('../config/database');
      const assignment = await database.get(
        'SELECT coach_id FROM student_profiles WHERE user_id = ?',
        [studentId]
      );

      if (!assignment || assignment.coach_id !== user.id) {
        return res.status(403).json({
          success: false,
          error: {
            code: ERROR_CODES.AUTHORIZATION_ERROR,
            message: 'Bu öğrenciye erişim yetkiniz yok'
          }
        });
      }
    }

    req.validatedStudentId = studentId;
    next();
  } catch (error) {
    next(error);
  }
};

const validateDateRange = (req, res, next) => {
  const { start_date, end_date } = req.query;

  if (start_date && end_date) {
    const startDate = new Date(start_date);
    const endDate = new Date(end_date);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return res.status(400).json({
        success: false,
        error: {
          code: ERROR_CODES.VALIDATION_ERROR,
          message: 'Geçersiz tarih formatı'
        }
      });
    }

    if (startDate > endDate) {
      return res.status(400).json({
        success: false,
        error: {
          code: ERROR_CODES.VALIDATION_ERROR,
          message: 'Başlangıç tarihi bitiş tarihinden büyük olamaz'
        }
      });
    }

    // Prevent too large date ranges (max 1 year)
    const oneYear = 365 * 24 * 60 * 60 * 1000;
    if (endDate - startDate > oneYear) {
      return res.status(400).json({
        success: false,
        error: {
          code: ERROR_CODES.VALIDATION_ERROR,
          message: 'Tarih aralığı en fazla 1 yıl olabilir'
        }
      });
    }
  }

  next();
};

const validatePagination = (req, res, next) => {
  const { page = 1, limit = 20 } = req.query;

  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);

  if (isNaN(pageNum) || pageNum < 1) {
    return res.status(400).json({
      success: false,
      error: {
        code: ERROR_CODES.VALIDATION_ERROR,
        message: 'Sayfa numarası 1 veya daha büyük olmalı'
      }
    });
  }

  if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
    return res.status(400).json({
      success: false,
      error: {
        code: ERROR_CODES.VALIDATION_ERROR,
        message: 'Limit 1-100 arasında olmalı'
      }
    });
  }

  req.pagination = {
    page: pageNum,
    limit: limitNum,
    offset: (pageNum - 1) * limitNum
  };

  next();
};

module.exports = {
  handleValidationErrors,
  sanitizeInput,
  validateStudentAccess,
  validateDateRange,
  validatePagination
};