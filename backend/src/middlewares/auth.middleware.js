const { verifyToken } = require('../config/auth');
const User = require('../models/User');
const { ERROR_CODES, ERROR_MESSAGES } = require('../utils/constants');

const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        success: false,
        error: {
          code: ERROR_CODES.AUTHENTICATION_ERROR,
          message: ERROR_MESSAGES.INVALID_TOKEN
        }
      });
    }

    const decoded = verifyToken(token);
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({
        success: false,
        error: {
          code: ERROR_CODES.AUTHENTICATION_ERROR,
          message: ERROR_MESSAGES.USER_NOT_FOUND
        }
      });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        error: {
          code: ERROR_CODES.AUTHENTICATION_ERROR,
          message: ERROR_MESSAGES.INVALID_TOKEN
        }
      });
    }

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: {
          code: ERROR_CODES.AUTHENTICATION_ERROR,
          message: ERROR_MESSAGES.EXPIRED_TOKEN
        }
      });
    }

    console.error('Authentication error:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: ERROR_CODES.INTERNAL_ERROR,
        message: ERROR_MESSAGES.INTERNAL_ERROR
      }
    });
  }
};

const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: {
          code: ERROR_CODES.AUTHENTICATION_ERROR,
          message: ERROR_MESSAGES.UNAUTHORIZED
        }
      });
    }

    const userRole = req.user.role;
    const allowedRoles = Array.isArray(roles) ? roles : [roles];

    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        error: {
          code: ERROR_CODES.AUTHORIZATION_ERROR,
          message: ERROR_MESSAGES.UNAUTHORIZED
        }
      });
    }

    next();
  };
};

const requireStudent = requireRole(['student']);
const requireCoach = requireRole(['coach']);
const requireStudentOrCoach = requireRole(['student', 'coach']);

const checkResourceOwnership = (resourceField = 'student_id') => {
  return async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: {
          code: ERROR_CODES.AUTHENTICATION_ERROR,
          message: ERROR_MESSAGES.UNAUTHORIZED
        }
      });
    }

    // Coaches can access their students' resources
    if (req.user.role === 'coach') {
      return next();
    }

    // Students can only access their own resources
    if (req.user.role === 'student') {
      const resourceId = req.params.id || req.body[resourceField] || req.query[resourceField];
      
      if (resourceField === 'student_id' && resourceId && resourceId != req.user.id) {
        return res.status(403).json({
          success: false,
          error: {
            code: ERROR_CODES.AUTHORIZATION_ERROR,
            message: ERROR_MESSAGES.UNAUTHORIZED
          }
        });
      }
    }

    next();
  };
};

const refreshTokenMiddleware = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        error: {
          code: ERROR_CODES.AUTHENTICATION_ERROR,
          message: 'Refresh token gerekli'
        }
      });
    }

    const decoded = verifyToken(refreshToken, true);
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({
        success: false,
        error: {
          code: ERROR_CODES.AUTHENTICATION_ERROR,
          message: ERROR_MESSAGES.USER_NOT_FOUND
        }
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: {
        code: ERROR_CODES.AUTHENTICATION_ERROR,
        message: ERROR_MESSAGES.INVALID_TOKEN
      }
    });
  }
};

module.exports = {
  authenticateToken,
  requireRole,
  requireStudent,
  requireCoach,
  requireStudentOrCoach,
  checkResourceOwnership,
  refreshTokenMiddleware
};