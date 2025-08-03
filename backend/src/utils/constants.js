const USER_ROLES = {
  STUDENT: 'student',
  COACH: 'coach',
  PARENT: 'parent'
};

const STUDY_MOODS = {
  MOTIVATED: 'motivated',
  NORMAL: 'normal',
  TIRED: 'tired',
  STRESSED: 'stressed'
};

const TASK_STATUSES = {
  PENDING: 'pending',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  OVERDUE: 'overdue'
};

const TASK_PRIORITIES = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high'
};

const EXAM_TYPES = {
  TYT: 'TYT',
  AYT: 'AYT'
};

const TARGET_FIELDS = {
  SAYISAL: 'sayisal',
  ESIT_AGIRLIK: 'esit_agirlik',
  SOZEL: 'sozel',
  DIL: 'dil'
};

const PLAN_STATUSES = {
  DRAFT: 'draft',
  ACTIVE: 'active',
  COMPLETED: 'completed'
};

const YKS_SUBJECTS = {
  TYT: {
    TURKCE: 'Türkçe',
    MATEMATIK: 'Matematik',
    SOSYAL: 'Sosyal Bilimler',
    FEN: 'Fen Bilimleri'
  },
  AYT: {
    EDEBIYAT: 'Türk Dili ve Edebiyatı',
    MATEMATIK: 'Matematik',
    FIZIK: 'Fizik',
    KIMYA: 'Kimya',
    BIYOLOJI: 'Biyoloji',
    TARIH: 'Tarih',
    COGRAFYA: 'Coğrafya',
    FELSEFE: 'Felsefe',
    DIN_KULTURU: 'Din Kültürü'
  }
};

const ERROR_CODES = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  AUTHENTICATION_ERROR: 'AUTHENTICATION_ERROR',
  AUTHORIZATION_ERROR: 'AUTHORIZATION_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  DUPLICATE_ENTRY: 'DUPLICATE_ENTRY',
  INTERNAL_ERROR: 'INTERNAL_ERROR'
};

const SUCCESS_MESSAGES = {
  USER_CREATED: 'Kullanıcı başarıyla oluşturuldu',
  LOGIN_SUCCESS: 'Giriş başarılı',
  LOGOUT_SUCCESS: 'Çıkış başarılı',
  RECORD_CREATED: 'Kayıt başarıyla oluşturuldu',
  RECORD_UPDATED: 'Kayıt başarıyla güncellendi',
  RECORD_DELETED: 'Kayıt başarıyla silindi'
};

const ERROR_MESSAGES = {
  INVALID_CREDENTIALS: 'Geçersiz email veya şifre',
  USER_NOT_FOUND: 'Kullanıcı bulunamadı',
  EMAIL_ALREADY_EXISTS: 'Bu email adresi zaten kullanımda',
  UNAUTHORIZED: 'Bu işlem için yetkiniz yok',
  INVALID_TOKEN: 'Geçersiz token',
  EXPIRED_TOKEN: 'Token süresi dolmuş',
  VALIDATION_FAILED: 'Veri doğrulama hatası',
  INTERNAL_ERROR: 'Sunucu hatası'
};

module.exports = {
  USER_ROLES,
  STUDY_MOODS,
  TASK_STATUSES,
  TASK_PRIORITIES,
  EXAM_TYPES,
  TARGET_FIELDS,
  PLAN_STATUSES,
  YKS_SUBJECTS,
  ERROR_CODES,
  SUCCESS_MESSAGES,
  ERROR_MESSAGES
};