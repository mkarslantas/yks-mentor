const express = require('express');
const router = express.Router();

const {
  register,
  login,
  refreshToken,
  logout,
  getProfile,
  updateProfile,
  changePassword
} = require('../controllers/authController');

const {
  authenticateToken,
  refreshTokenMiddleware
} = require('../middlewares/auth.middleware');

const {
  handleValidationErrors,
  sanitizeInput
} = require('../middlewares/validation.middleware');

const {
  registerValidator,
  loginValidator
} = require('../utils/validators');

const { body } = require('express-validator');

// Public routes
router.post('/register', 
  sanitizeInput,
  registerValidator,
  handleValidationErrors,
  register
);

router.post('/login',
  sanitizeInput,
  loginValidator,
  handleValidationErrors,
  login
);

router.post('/refresh',
  sanitizeInput,
  refreshTokenMiddleware,
  refreshToken
);

router.post('/logout',
  sanitizeInput,
  logout
);

// Protected routes
router.get('/profile',
  authenticateToken,
  getProfile
);

router.put('/profile',
  authenticateToken,
  sanitizeInput,
  [
    body('name')
      .optional({ checkFalsy: true })
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage('İsim 2-100 karakter arasında olmalı'),
    body('email')
      .optional({ checkFalsy: true })
      .trim()
      .isEmail()
      .withMessage('Geçerli bir e-posta adresi girin')
      .normalizeEmail(),
    body('phone')
      .optional({ checkFalsy: true })
      .custom((value) => {
        if (!value || value.trim() === '') return true;
        // Remove all non-digit characters for validation
        const cleanPhone = value.replace(/\D/g, '');
        if (cleanPhone.length < 10 || cleanPhone.length > 11) {
          throw new Error('Telefon numarası 10-11 haneli olmalı');
        }
        return true;
      }),
    body('studentProfile.target_field')
      .optional()
      .isIn(['sayisal', 'esit_agirlik', 'sozel', 'dil'])
      .withMessage('Geçerli bir alan seçin'),
    body('studentProfile.grade_level')
      .optional()
      .isInt({ min: 9, max: 13 })
      .withMessage('Sınıf seviyesi 9-13 arasında olmalı')
  ],
  handleValidationErrors,
  updateProfile
);

router.put('/change-password',
  authenticateToken,
  sanitizeInput,
  [
    body('currentPassword')
      .notEmpty()
      .withMessage('Mevcut şifre gerekli'),
    body('newPassword')
      .isLength({ min: 8 })
      .withMessage('Yeni şifre en az 8 karakter olmalı')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage('Yeni şifre en az bir büyük harf, bir küçük harf ve bir rakam içermeli')
  ],
  handleValidationErrors,
  changePassword
);

module.exports = router;