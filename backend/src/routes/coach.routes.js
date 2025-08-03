const express = require('express');
const router = express.Router();

const {
  authenticateToken,
  requireCoach
} = require('../middlewares/auth.middleware');

const {
  handleValidationErrors,
  sanitizeInput,
  validateDateRange,
  validatePagination,
  validateStudentAccess
} = require('../middlewares/validation.middleware');

const {
  taskValidator,
  idValidator,
  studentIdValidator
} = require('../utils/validators');

// Import controllers (will be created)
const coachController = require('../controllers/coachController');

// All routes require authentication and coach role
router.use(authenticateToken);
router.use(requireCoach);

// Dashboard
router.get('/dashboard', coachController.getDashboard);

// Students Management
router.get('/students', coachController.getStudents);

router.get('/student/:studentId',
  validateStudentAccess,
  coachController.getStudentDetails
);

router.put('/student/:studentId',
  validateStudentAccess,
  sanitizeInput,
  handleValidationErrors,
  coachController.updateStudent
);

router.delete('/student/:studentId',
  studentIdValidator,
  handleValidationErrors,
  coachController.deleteStudent
);

router.get('/student/:studentId/statistics',
  validateDateRange,
  coachController.getStudentStatistics
);

router.get('/student/:studentId/study-records',
  validateStudentAccess,
  validateDateRange,
  validatePagination,
  coachController.getStudentStudyRecords
);

router.get('/student/:studentId/mock-exams',
  validateStudentAccess,
  validateDateRange,
  coachController.getStudentMockExams
);

router.get('/student/:studentId/daily-questions-by-subject',
  validateDateRange,
  coachController.getStudentDailyQuestionsBySubject
);

router.get('/student/:studentId/progress',
  validateStudentAccess,
  coachController.getStudentProgress
);

// Task Management
router.get('/tasks',
  validatePagination,
  coachController.getTasks
);

router.post('/student/:studentId/task',
  validateStudentAccess,
  sanitizeInput,
  taskValidator,
  handleValidationErrors,
  coachController.createTask
);

router.put('/task/:id',
  sanitizeInput,
  idValidator,
  handleValidationErrors,
  coachController.updateTask
);

router.delete('/task/:id',
  idValidator,
  handleValidationErrors,
  coachController.deleteTask
);

router.get('/student/:studentId/tasks',
  validateStudentAccess,
  coachController.getStudentTasks
);

// Plans Management
router.get('/plans',
  validatePagination,
  coachController.getPlans
);

router.post('/student/:studentId/plan',
  validateStudentAccess,
  sanitizeInput,
  coachController.createPlan
);

router.put('/plan/:id',
  sanitizeInput,
  idValidator,
  handleValidationErrors,
  coachController.updatePlan
);

router.delete('/plan/:id',
  idValidator,
  handleValidationErrors,
  coachController.deletePlan
);

router.get('/student/:studentId/plans',
  validateStudentAccess,
  coachController.getStudentPlans
);

// Reports
router.get('/reports/overview',
  validateDateRange,
  coachController.getOverviewReport
);

router.get('/reports/student/:studentId',
  validateStudentAccess,
  validateDateRange,
  coachController.getStudentReport
);

router.get('/reports/performance',
  validateDateRange,
  coachController.getPerformanceReport
);

// Communication
router.post('/broadcast-message',
  sanitizeInput,
  coachController.broadcastMessage
);

router.post('/student/:studentId/message',
  validateStudentAccess,
  sanitizeInput,
  coachController.sendMessage
);

// Analytics
router.get('/analytics/students',
  coachController.getStudentsAnalytics
);

router.get('/analytics/subjects',
  validateDateRange,
  coachController.getSubjectsAnalytics
);

router.get('/analytics/progress',
  validateDateRange,
  coachController.getProgressAnalytics
);

// Student Assignment
router.post('/assign-student',
  sanitizeInput,
  coachController.assignStudent
);

router.delete('/unassign-student/:studentId',
  validateStudentAccess,
  coachController.unassignStudent
);

module.exports = router;