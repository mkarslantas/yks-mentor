const express = require('express');
const router = express.Router();

const {
  authenticateToken,
  requireStudent
} = require('../middlewares/auth.middleware');

const {
  handleValidationErrors,
  sanitizeInput,
  validateDateRange,
  validatePagination
} = require('../middlewares/validation.middleware');

const {
  studyRecordValidator,
  mockExamValidator,
  idValidator
} = require('../utils/validators');

// Import controllers (will be created)
const studentController = require('../controllers/studentController');

// All routes require authentication and student role
router.use(authenticateToken);
router.use(requireStudent);

// Dashboard
router.get('/dashboard', studentController.getDashboard);

// Study Records
router.get('/study-records',
  validateDateRange,
  validatePagination,
  studentController.getStudyRecords
);

router.post('/study-record',
  sanitizeInput,
  studyRecordValidator,
  handleValidationErrors,
  studentController.createStudyRecord
);

router.get('/study-record/:id',
  idValidator,
  handleValidationErrors,
  studentController.getStudyRecord
);

router.put('/study-record/:id',
  sanitizeInput,
  idValidator,
  studyRecordValidator,
  handleValidationErrors,
  studentController.updateStudyRecord
);

router.delete('/study-record/:id',
  idValidator,
  handleValidationErrors,
  studentController.deleteStudyRecord
);

// Statistics
router.get('/statistics',
  validateDateRange,
  studentController.getStatistics
);

router.get('/statistics/streak',
  studentController.getStreak
);

router.get('/statistics/weekly',
  studentController.getWeeklyStats
);

router.get('/statistics/subject/:subject',
  studentController.getSubjectStats
);

// Advanced Statistics Routes
router.get('/statistics/daily-questions-by-subject',
  validateDateRange,
  studentController.getDailyQuestionsBySubject
);

router.get('/statistics/subject-performance-comparison',
  validateDateRange,
  studentController.getSubjectPerformanceComparison
);

router.get('/statistics/study-time-distribution',
  validateDateRange,
  studentController.getStudyTimeDistribution
);

router.get('/statistics/mock-exam-detailed',
  studentController.getMockExamDetailedStats
);

// Mock Exams
router.get('/mock-exams',
  validateDateRange,
  validatePagination,
  studentController.getMockExams
);

router.post('/mock-exam',
  sanitizeInput,
  mockExamValidator,
  handleValidationErrors,
  studentController.createMockExam
);

router.get('/mock-exam/:id',
  idValidator,
  handleValidationErrors,
  studentController.getMockExam
);

router.put('/mock-exam/:id',
  sanitizeInput,
  idValidator,
  mockExamValidator,
  handleValidationErrors,
  studentController.updateMockExam
);

router.delete('/mock-exam/:id',
  idValidator,
  handleValidationErrors,
  studentController.deleteMockExam
);

router.get('/mock-exams/progress/:examType',
  studentController.getMockExamProgress
);

// Tasks
router.get('/tasks',
  studentController.getTasks
);

router.put('/task/:id/complete',
  idValidator,
  handleValidationErrors,
  studentController.completeTask
);

router.put('/task/:id/status',
  sanitizeInput,
  idValidator,
  handleValidationErrors,
  studentController.updateTaskStatus
);

router.put('/task/:id/time',
  sanitizeInput,
  idValidator,
  handleValidationErrors,
  studentController.updateTaskTime
);

router.put('/task/:id/notes',
  sanitizeInput,
  idValidator,
  handleValidationErrors,
  studentController.updateTaskNotes
);

// Plans
router.get('/plans',
  studentController.getPlans
);

router.get('/plan/:id',
  idValidator,
  handleValidationErrors,
  studentController.getPlan
);

// Goals and targets
router.get('/goals',
  studentController.getGoals
);

router.post('/goals',
  sanitizeInput,
  studentController.setGoals
);

// Quotes
router.get('/quote/random',
  studentController.getRandomQuote
);

module.exports = router;