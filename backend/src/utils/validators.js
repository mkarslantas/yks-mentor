const { body, param, query, validationResult } = require('express-validator');
const { USER_ROLES, STUDY_MOODS, TASK_PRIORITIES, EXAM_TYPES, TARGET_FIELDS } = require('./constants');

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Veri doğrulama hatası',
        details: errors.array()
      }
    });
  }
  next();
};

// Auth validators
const registerValidator = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Geçerli bir email adresi girin'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Şifre en az 8 karakter olmalı')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Şifre en az bir büyük harf, bir küçük harf ve bir rakam içermeli'),
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('İsim 2-100 karakter arasında olmalı'),
  body('role')
    .isIn(Object.values(USER_ROLES))
    .withMessage('Geçerli bir rol seçin'),
  body('phone')
    .optional()
    .matches(/^(\+90|0)?[5][0-9]{9}$/)
    .withMessage('Geçerli bir telefon numarası girin')
];

const loginValidator = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Geçerli bir email adresi girin'),
  body('password')
    .notEmpty()
    .withMessage('Şifre gerekli')
];

// Study record validators
const studyRecordValidator = [
  body('date')
    .isISO8601()
    .withMessage('Geçerli bir tarih girin'),
  body('subject')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Ders adı 1-100 karakter arasında olmalı'),
  body('topic')
    .optional()
    .trim()
    .isLength({ max: 255 })
    .withMessage('Konu adı en fazla 255 karakter olabilir'),
  body('duration_minutes')
    .isInt({ min: 1, max: 1440 })
    .withMessage('Süre 1-1440 dakika arasında olmalı'),
  body('questions_solved')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Çözülen soru sayısı 0 veya daha büyük olmalı'),
  body('correct_answers')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Doğru cevap sayısı 0 veya daha büyük olmalı'),
  body('wrong_answers')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Yanlış cevap sayısı 0 veya daha büyük olmalı'),
  body('empty_answers')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Boş cevap sayısı 0 veya daha büyük olmalı'),
  body('mood')
    .optional()
    .isIn(Object.values(STUDY_MOODS))
    .withMessage('Geçerli bir ruh hali seçin'),
  body('notes')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Notlar en fazla 1000 karakter olabilir')
];

// Mock exam validators
const mockExamValidator = [
  body('exam_type')
    .isIn(Object.values(EXAM_TYPES))
    .withMessage('Geçerli bir sınav tipi seçin'),
  body('exam_date')
    .isISO8601()
    .withMessage('Geçerli bir tarih girin'),
  body('exam_name')
    .optional()
    .trim()
    .isLength({ max: 255 })
    .withMessage('Sınav adı en fazla 255 karakter olabilir'),
  // TYT sections
  body('turkce_net')
    .optional()
    .isFloat({ min: 0, max: 40 })
    .withMessage('Türkçe net 0-40 arasında olmalı'),
  body('matematik_net')
    .optional()
    .isFloat({ min: 0, max: 40 })
    .withMessage('Matematik net 0-40 arasında olmalı'),
  body('sosyal_net')
    .optional()
    .isFloat({ min: 0, max: 20 })
    .withMessage('Sosyal net 0-20 arasında olmalı'),
  body('fen_net')
    .optional()
    .isFloat({ min: 0, max: 20 })
    .withMessage('Fen net 0-20 arasında olmalı'),
  // AYT sections
  body('edebiyat_net')
    .optional()
    .isFloat({ min: 0, max: 24 })
    .withMessage('Edebiyat net 0-24 arasında olmalı'),
  body('matematik_ayt_net')
    .optional()
    .isFloat({ min: 0, max: 40 })
    .withMessage('AYT Matematik net 0-40 arasında olmalı'),
  body('fizik_net')
    .optional()
    .isFloat({ min: 0, max: 14 })
    .withMessage('Fizik net 0-14 arasında olmalı'),
  body('kimya_net')
    .optional()
    .isFloat({ min: 0, max: 13 })
    .withMessage('Kimya net 0-13 arasında olmalı'),
  body('biyoloji_net')
    .optional()
    .isFloat({ min: 0, max: 13 })
    .withMessage('Biyoloji net 0-13 arasında olmalı'),
  body('tarih_net')
    .optional()
    .isFloat({ min: 0, max: 10 })
    .withMessage('Tarih net 0-10 arasında olmalı'),
  body('cografya_net')
    .optional()
    .isFloat({ min: 0, max: 6 })
    .withMessage('Coğrafya net 0-6 arasında olmalı'),
  body('dil_net')
    .optional()
    .isFloat({ min: 0, max: 80 })
    .withMessage('Yabancı Dil net 0-80 arasında olmalı'),
  // TYT Correct/Wrong values
  body('turkce_correct')
    .optional()
    .isInt({ min: 0, max: 40 })
    .withMessage('Türkçe doğru sayısı 0-40 arasında olmalı'),
  body('turkce_wrong')
    .optional()
    .isInt({ min: 0, max: 40 })
    .withMessage('Türkçe yanlış sayısı 0-40 arasında olmalı'),
  body('matematik_correct')
    .optional()
    .isInt({ min: 0, max: 40 })
    .withMessage('Matematik doğru sayısı 0-40 arasında olmalı'),
  body('matematik_wrong')
    .optional()
    .isInt({ min: 0, max: 40 })
    .withMessage('Matematik yanlış sayısı 0-40 arasında olmalı'),
  body('sosyal_correct')
    .optional()
    .isInt({ min: 0, max: 20 })
    .withMessage('Sosyal doğru sayısı 0-20 arasında olmalı'),
  body('sosyal_wrong')
    .optional()
    .isInt({ min: 0, max: 20 })
    .withMessage('Sosyal yanlış sayısı 0-20 arasında olmalı'),
  body('fen_correct')
    .optional()
    .isInt({ min: 0, max: 20 })
    .withMessage('Fen doğru sayısı 0-20 arasında olmalı'),
  body('fen_wrong')
    .optional()
    .isInt({ min: 0, max: 20 })
    .withMessage('Fen yanlış sayısı 0-20 arasında olmalı'),
  // AYT Correct/Wrong values
  body('edebiyat_correct')
    .optional()
    .isInt({ min: 0, max: 24 })
    .withMessage('Edebiyat doğru sayısı 0-24 arasında olmalı'),
  body('edebiyat_wrong')
    .optional()
    .isInt({ min: 0, max: 24 })
    .withMessage('Edebiyat yanlış sayısı 0-24 arasında olmalı'),
  body('matematik_ayt_correct')
    .optional()
    .isInt({ min: 0, max: 40 })
    .withMessage('AYT Matematik doğru sayısı 0-40 arasında olmalı'),
  body('matematik_ayt_wrong')
    .optional()
    .isInt({ min: 0, max: 40 })
    .withMessage('AYT Matematik yanlış sayısı 0-40 arasında olmalı'),
  body('fizik_correct')
    .optional()
    .isInt({ min: 0, max: 14 })
    .withMessage('Fizik doğru sayısı 0-14 arasında olmalı'),
  body('fizik_wrong')
    .optional()
    .isInt({ min: 0, max: 14 })
    .withMessage('Fizik yanlış sayısı 0-14 arasında olmalı'),
  body('kimya_correct')
    .optional()
    .isInt({ min: 0, max: 13 })
    .withMessage('Kimya doğru sayısı 0-13 arasında olmalı'),
  body('kimya_wrong')
    .optional()
    .isInt({ min: 0, max: 13 })
    .withMessage('Kimya yanlış sayısı 0-13 arasında olmalı'),
  body('biyoloji_correct')
    .optional()
    .isInt({ min: 0, max: 13 })
    .withMessage('Biyoloji doğru sayısı 0-13 arasında olmalı'),
  body('biyoloji_wrong')
    .optional()
    .isInt({ min: 0, max: 13 })
    .withMessage('Biyoloji yanlış sayısı 0-13 arasında olmalı'),
  body('tarih_correct')
    .optional()
    .isInt({ min: 0, max: 10 })
    .withMessage('Tarih doğru sayısı 0-10 arasında olmalı'),
  body('tarih_wrong')
    .optional()
    .isInt({ min: 0, max: 10 })
    .withMessage('Tarih yanlış sayısı 0-10 arasında olmalı'),
  body('cografya_correct')
    .optional()
    .isInt({ min: 0, max: 6 })
    .withMessage('Coğrafya doğru sayısı 0-6 arasında olmalı'),
  body('cografya_wrong')
    .optional()
    .isInt({ min: 0, max: 6 })
    .withMessage('Coğrafya yanlış sayısı 0-6 arasında olmalı'),
  body('dil_correct')
    .optional()
    .isInt({ min: 0, max: 80 })
    .withMessage('Yabancı Dil doğru sayısı 0-80 arasında olmalı'),
  body('dil_wrong')
    .optional()
    .isInt({ min: 0, max: 80 })
    .withMessage('Yabancı Dil yanlış sayısı 0-80 arasında olmalı'),
  // Optional fields
  body('duration_minutes')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Süre en az 1 dakika olmalı'),
  body('notes')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Notlar en fazla 1000 karakter olabilir')
];

// Student profile validators
const studentProfileValidator = [
  body('target_field')
    .isIn(Object.values(TARGET_FIELDS))
    .withMessage('Geçerli bir alan seçin'),
  body('target_university')
    .optional()
    .trim()
    .isLength({ max: 255 })
    .withMessage('Hedef üniversite adı en fazla 255 karakter olabilir'),
  body('target_department')
    .optional()
    .trim()
    .isLength({ max: 255 })
    .withMessage('Hedef bölüm adı en fazla 255 karakter olabilir'),
  body('exam_date')
    .optional()
    .isISO8601()
    .withMessage('Geçerli bir tarih girin'),
  body('grade_level')
    .isInt({ min: 11, max: 12 })
    .withMessage('Sınıf seviyesi 11 veya 12 olmalı'),
  body('school_name')
    .optional()
    .trim()
    .isLength({ max: 255 })
    .withMessage('Okul adı en fazla 255 karakter olabilir')
];

// Task validators
const taskValidator = [
  body('title')
    .trim()
    .isLength({ min: 1, max: 255 })
    .withMessage('Görev başlığı 1-255 karakter arasında olmalı'),
  body('description')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Açıklama en fazla 1000 karakter olabilir'),
  body('subject')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Ders adı en fazla 100 karakter olabilir'),
  body('due_date')
    .optional()
    .isISO8601()
    .withMessage('Geçerli bir tarih girin'),
  body('priority')
    .optional()
    .isIn(Object.values(TASK_PRIORITIES))
    .withMessage('Geçerli bir öncelik seviyesi seçin')
];

// Parameter validators
const idValidator = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Geçerli bir ID girin')
];

const studentIdValidator = [
  param('studentId')
    .isInt({ min: 1 })
    .withMessage('Geçerli bir öğrenci ID\'si girin')
];

// Query validators
const dateRangeValidator = [
  query('start_date')
    .optional()
    .isISO8601()
    .withMessage('Geçerli bir başlangıç tarihi girin'),
  query('end_date')
    .optional()
    .isISO8601()
    .withMessage('Geçerli bir bitiş tarihi girin'),
  query('period')
    .optional()
    .isIn(['day', 'week', 'month', 'year'])
    .withMessage('Geçerli bir periyot seçin')
];

module.exports = {
  handleValidationErrors,
  registerValidator,
  loginValidator,
  studyRecordValidator,
  mockExamValidator,
  studentProfileValidator,
  taskValidator,
  idValidator,
  studentIdValidator,
  dateRangeValidator
};