const StudyRecord = require('../models/StudyRecord');
const MockExam = require('../models/MockExam');
const Task = require('../models/Task');
const Quote = require('../models/Quote');
const { asyncHandler } = require('../middlewares/error.middleware');
const { SUCCESS_MESSAGES } = require('../utils/constants');
const database = require('../config/database');

const getDashboard = asyncHandler(async (req, res) => {
  const studentId = req.user.id;
  const today = new Date().toISOString().split('T')[0];

  // Get today's study records
  const todayRecords = await StudyRecord.findByStudent(studentId, { date: today });
  
  // Get weekly statistics
  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - weekStart.getDay());
  const weeklyProgress = await StudyRecord.getWeeklyProgress(studentId, weekStart);
  
  // Get current streak
  const currentStreak = await StudyRecord.getDailyStreak(studentId);
  
  // Get pending tasks
  const pendingTasks = await Task.findByStudent(studentId, { 
    status: 'pending', 
    limit: 5,
    orderBy: 'priority'
  });
  
  // Get upcoming tasks
  const dueTasks = await Task.getDueTasks(studentId, 3);
  
  // Get latest mock exam
  const latestTYT = await MockExam.getLatestExam(studentId, 'TYT');
  const latestAYT = await MockExam.getLatestExam(studentId, 'AYT');
  
  // Calculate today's total study time
  const todayTotalMinutes = todayRecords.reduce((sum, record) => sum + record.duration_minutes, 0);
  const todayTotalQuestions = todayRecords.reduce((sum, record) => sum + record.questions_solved, 0);

  res.json({
    success: true,
    data: {
      today: {
        studyMinutes: todayTotalMinutes,
        questionsSolved: todayTotalQuestions,
        sessionsCount: todayRecords.length
      },
      streak: currentStreak,
      weeklyProgress,
      tasks: {
        pending: pendingTasks,
        due: dueTasks
      },
      latestExams: {
        tyt: latestTYT,
        ayt: latestAYT
      }
    }
  });
});

const getStudyRecords = asyncHandler(async (req, res) => {
  const studentId = req.user.id;
  const { start_date, end_date, subject, page = 1, limit = 20 } = req.query;

  const options = {
    startDate: start_date,
    endDate: end_date,
    subject,
    limit: parseInt(limit),
    offset: (parseInt(page) - 1) * parseInt(limit)
  };

  const records = await StudyRecord.findByStudent(studentId, options);

  res.json({
    success: true,
    data: records
  });
});

const createStudyRecord = asyncHandler(async (req, res) => {
  const studentId = req.user.id;
  const recordData = { ...req.body, student_id: studentId };

  const record = await StudyRecord.create(recordData);

  res.status(201).json({
    success: true,
    message: SUCCESS_MESSAGES.RECORD_CREATED,
    data: record
  });
});

const getStudyRecord = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const studentId = req.user.id;

  const record = await StudyRecord.findById(id);

  if (!record || record.student_id !== studentId) {
    return res.status(404).json({
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: 'Kayıt bulunamadı'
      }
    });
  }

  res.json({
    success: true,
    data: record
  });
});

const updateStudyRecord = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const studentId = req.user.id;

  console.log('📝 Updating study record:', { id, studentId, body: req.body });

  const existingRecord = await StudyRecord.findById(id);

  if (!existingRecord || existingRecord.student_id !== studentId) {
    return res.status(404).json({
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: 'Kayıt bulunamadı'
      }
    });
  }

  try {
    const updatedRecord = await StudyRecord.update(id, req.body);
    console.log('✅ Study record updated successfully:', updatedRecord);

    res.json({
      success: true,
      message: SUCCESS_MESSAGES.RECORD_UPDATED,
      data: updatedRecord
    });
  } catch (error) {
    console.error('❌ Study record update error:', error);
    throw error;
  }
});

const deleteStudyRecord = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const studentId = req.user.id;

  const existingRecord = await StudyRecord.findById(id);

  if (!existingRecord || existingRecord.student_id !== studentId) {
    return res.status(404).json({
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: 'Kayıt bulunamadı'
      }
    });
  }

  await StudyRecord.delete(id);

  res.json({
    success: true,
    message: SUCCESS_MESSAGES.RECORD_DELETED
  });
});

const getStatistics = asyncHandler(async (req, res) => {
  const studentId = req.user.id;
  const { start_date, end_date, group_by = 'subject' } = req.query;

  try {
    console.log('📊 Getting statistics for student:', studentId);
    
    // Get basic statistics
    const stats = await StudyRecord.getStatistics(studentId, {
      startDate: start_date,
      endDate: end_date,
      groupBy: group_by
    });
    
    console.log('📊 Basic stats:', stats);

    // Calculate basic statistics from study records
    const basicStats = await database.get(`
      SELECT 
        SUM(duration_minutes) as total_study_time,
        SUM(questions_solved) as total_questions,
        SUM(correct_answers) as total_correct,
        COUNT(*) as total_sessions,
        COUNT(DISTINCT date) as study_days
      FROM study_records 
      WHERE student_id = ?
      ${start_date && end_date ? 'AND date BETWEEN ? AND ?' : ''}
    `, start_date && end_date ? [studentId, start_date, end_date] : [studentId]);

    // Get subject breakdown
    const subjectStats = await database.all(`
      SELECT 
        subject,
        SUM(duration_minutes) as duration,
        SUM(questions_solved) as questions,
        SUM(correct_answers) as correct,
        COUNT(*) as sessions
      FROM study_records 
      WHERE student_id = ?
      ${start_date && end_date ? 'AND date BETWEEN ? AND ?' : ''}
      GROUP BY subject
      ORDER BY duration DESC
    `, start_date && end_date ? [studentId, start_date, end_date] : [studentId]);

    // Calculate accuracy rate
    const accuracyRate = basicStats?.total_questions > 0 
      ? Math.round((basicStats.total_correct / basicStats.total_questions) * 100) 
      : 0;

    const responseData = {
      basicStats: {
        totalStudyTime: basicStats?.total_study_time || 0,
        totalQuestions: basicStats?.total_questions || 0,
        totalCorrect: basicStats?.total_correct || 0,
        accuracyRate: accuracyRate,
        totalSessions: basicStats?.total_sessions || 0,
        studyDays: basicStats?.study_days || 0
      },
      subjectStats: subjectStats || [],
      originalStats: stats || []
    };

    res.json({
      success: true,
      data: responseData
    });
  } catch (error) {
    console.error('Get student statistics error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_FAILED',
        message: 'İstatistikler alınırken hata oluştu'
      }
    });
  }
});

const getStreak = asyncHandler(async (req, res) => {
  const studentId = req.user.id;
  const streak = await StudyRecord.getDailyStreak(studentId);

  res.json({
    success: true,
    data: { streak }
  });
});

const getWeeklyStats = asyncHandler(async (req, res) => {
  const studentId = req.user.id;
  const { week_start } = req.query;
  
  const weekStart = week_start ? new Date(week_start) : new Date();
  if (!week_start) {
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
  }

  const weeklyProgress = await StudyRecord.getWeeklyProgress(studentId, weekStart);

  res.json({
    success: true,
    data: weeklyProgress
  });
});

const getSubjectStats = asyncHandler(async (req, res) => {
  const studentId = req.user.id;
  const { subject } = req.params;
  const { days = 30 } = req.query;

  const subjectProgress = await StudyRecord.getSubjectProgress(studentId, subject, parseInt(days));

  res.json({
    success: true,
    data: subjectProgress
  });
});

const getMockExams = asyncHandler(async (req, res) => {
  const studentId = req.user.id;
  const { start_date, end_date, exam_type, page = 1, limit = 20 } = req.query;

  const options = {
    startDate: start_date,
    endDate: end_date,
    examType: exam_type,
    limit: parseInt(limit),
    offset: (parseInt(page) - 1) * parseInt(limit)
  };

  const exams = await MockExam.findByStudent(studentId, options);

  res.json({
    success: true,
    data: exams
  });
});

const createMockExam = asyncHandler(async (req, res) => {
  const studentId = req.user.id;
  console.log('Creating mock exam for student:', studentId);
  console.log('Received data:', req.body);
  
  const examData = { ...req.body, student_id: studentId };
  
  try {
    const exam = await MockExam.create(examData);
    res.status(201).json({
      success: true,
      message: SUCCESS_MESSAGES.RECORD_CREATED,
      data: exam
    });
  } catch (error) {
    console.error('Mock exam creation error in controller:', error);
    throw error;
  }
});

const getMockExam = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const studentId = req.user.id;

  const exam = await MockExam.findById(id);

  if (!exam || exam.student_id !== studentId) {
    return res.status(404).json({
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: 'Deneme bulunamadı'
      }
    });
  }

  res.json({
    success: true,
    data: exam
  });
});

const updateMockExam = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const studentId = req.user.id;

  const existingExam = await MockExam.findById(id);

  if (!existingExam || existingExam.student_id !== studentId) {
    return res.status(404).json({
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: 'Deneme bulunamadı'
      }
    });
  }

  const updatedExam = await MockExam.update(id, req.body);

  res.json({
    success: true,
    message: SUCCESS_MESSAGES.RECORD_UPDATED,
    data: updatedExam
  });
});

const deleteMockExam = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const studentId = req.user.id;

  console.log('🗑️ Deleting mock exam:', { id, studentId });

  const existingExam = await MockExam.findById(id);
  console.log('🔍 Found exam:', existingExam);

  if (!existingExam || existingExam.student_id !== studentId) {
    console.log('❌ Exam not found or access denied');
    return res.status(404).json({
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: 'Deneme bulunamadı'
      }
    });
  }

  try {
    const deleteResult = await MockExam.delete(id);
    console.log('🗑️ Delete result:', deleteResult);

    if (!deleteResult) {
      console.log('❌ Delete failed - no rows affected');
      return res.status(400).json({
        success: false,
        error: {
          code: 'DELETE_FAILED',
          message: 'Deneme sınavı silinemedi'
        }
      });
    }

    console.log('✅ Mock exam deleted successfully');
    res.json({
      success: true,
      message: SUCCESS_MESSAGES.RECORD_DELETED
    });
  } catch (error) {
    console.error('❌ Mock exam delete error:', error);
    throw error;
  }
});

const getMockExamProgress = asyncHandler(async (req, res) => {
  const studentId = req.user.id;
  const { examType } = req.params;
  const { months = 6 } = req.query;

  const progress = await MockExam.getComparisonData(studentId, examType, parseInt(months));

  res.json({
    success: true,
    data: progress
  });
});

const getTasks = asyncHandler(async (req, res) => {
  const studentId = req.user.id;
  const { status, subject, priority, due_soon } = req.query;

  const options = {
    status,
    subject,
    priority,
    dueSoon: due_soon === 'true'
  };

  const tasks = await Task.findByStudent(studentId, options);

  res.json({
    success: true,
    data: tasks
  });
});

const completeTask = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const studentId = req.user.id;

  const task = await Task.findById(id);

  if (!task || task.student_id !== studentId) {
    return res.status(404).json({
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: 'Görev bulunamadı'
      }
    });
  }

  const completedTask = await Task.markCompleted(id);

  res.json({
    success: true,
    message: 'Görev tamamlandı',
    data: completedTask
  });
});

const updateTaskStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const studentId = req.user.id;

  const task = await Task.findById(id);

  if (!task || task.student_id !== studentId) {
    return res.status(404).json({
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: 'Görev bulunamadı'
      }
    });
  }

  const updatedTask = await Task.updateStatus(id, status);

  res.json({
    success: true,
    message: 'Görev durumu güncellendi',
    data: updatedTask
  });
});

const updateTaskTime = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { due_date, start_time, end_time, estimated_time } = req.body;
  const studentId = req.user.id;

  const task = await Task.findById(id);

  if (!task || task.student_id !== studentId) {
    return res.status(404).json({
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: 'Görev bulunamadı'
      }
    });
  }

  const updateData = {};
  if (due_date) updateData.due_date = due_date;
  if (start_time) updateData.start_time = start_time;
  if (end_time) updateData.end_time = end_time;
  if (estimated_time) updateData.estimated_time = estimated_time;

  const updatedTask = await Task.updateTime(id, updateData);

  res.json({
    success: true,
    message: 'Görev zamanı güncellendi',
    data: updatedTask
  });
});

const updateTaskNotes = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { student_notes, questions_solved, topics_studied, study_duration } = req.body;
  const studentId = req.user.id;

  console.log('📝 Update task notes request:');
  console.log('   Task ID:', id);
  console.log('   Student ID:', studentId);
  console.log('   Request body:', req.body);

  const task = await Task.findById(id);
  console.log('📝 Found task:', task);

  if (!task || task.student_id !== studentId) {
    console.log('❌ Task not found or access denied');
    return res.status(404).json({
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: 'Görev bulunamadı'
      }
    });
  }

  const updateData = {};
  if (student_notes !== undefined) updateData.student_notes = student_notes;
  if (questions_solved !== undefined) updateData.questions_solved = questions_solved;
  if (topics_studied !== undefined) updateData.topics_studied = topics_studied;
  if (study_duration !== undefined) updateData.study_duration = study_duration;

  console.log('📝 Update data:', updateData);

  const updatedTask = await Task.updateNotes(id, updateData);
  console.log('✅ Updated task:', updatedTask);

  res.json({
    success: true,
    message: 'Görev notları güncellendi',
    data: updatedTask
  });
});

const getPlans = asyncHandler(async (req, res) => {
  const studentId = req.user.id;

  const plans = await database.all(`
    SELECT * FROM weekly_plans 
    WHERE student_id = ? 
    ORDER BY week_start DESC
  `, [studentId]);

  res.json({
    success: true,
    data: plans
  });
});

const getPlan = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const studentId = req.user.id;

  const plan = await database.get(`
    SELECT wp.*, u.name as created_by_name
    FROM weekly_plans wp
    LEFT JOIN users u ON wp.created_by = u.id
    WHERE wp.id = ? AND wp.student_id = ?
  `, [id, studentId]);

  if (!plan) {
    return res.status(404).json({
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: 'Plan bulunamadı'
      }
    });
  }

  res.json({
    success: true,
    data: plan
  });
});

const getGoals = asyncHandler(async (req, res) => {
  const studentId = req.user.id;

  // This is a placeholder - goals can be stored in a separate table or as part of student profile
  const goals = await database.get(`
    SELECT target_field, target_university, target_department, exam_date
    FROM student_profiles 
    WHERE user_id = ?
  `, [studentId]);

  res.json({
    success: true,
    data: goals || {}
  });
});

const setGoals = asyncHandler(async (req, res) => {
  const studentId = req.user.id;
  const { target_field, target_university, target_department, exam_date } = req.body;

  await database.run(`
    UPDATE student_profiles 
    SET target_field = ?, target_university = ?, target_department = ?, exam_date = ?
    WHERE user_id = ?
  `, [target_field, target_university, target_department, exam_date, studentId]);

  res.json({
    success: true,
    message: 'Hedefler güncellendi'
  });
});

const getRandomQuote = asyncHandler(async (req, res) => {
  const quote = await Quote.getRandomQuote();

  if (!quote) {
    return res.status(404).json({
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: 'Motivasyon sözü bulunamadı'
      }
    });
  }

  res.json({
    success: true,
    data: quote
  });
});

// Derslere göre günlük soru sayıları
const getDailyQuestionsBySubject = asyncHandler(async (req, res) => {
  const studentId = req.user.id;
  const { start_date, end_date } = req.query;
  
  const data = await StudyRecord.getDailyQuestionsBySubject(studentId, {
    startDate: start_date,
    endDate: end_date
  });
  
  res.json({
    success: true,
    data
  });
});

// Ders bazlı performans karşılaştırması
const getSubjectPerformanceComparison = asyncHandler(async (req, res) => {
  const studentId = req.user.id;
  const { start_date, end_date } = req.query;
  
  const data = await StudyRecord.getSubjectPerformanceComparison(studentId, {
    startDate: start_date,
    endDate: end_date
  });
  
  res.json({
    success: true,
    data
  });
});

// Çalışma süresi dağılımı
const getStudyTimeDistribution = asyncHandler(async (req, res) => {
  const studentId = req.user.id;
  const { start_date, end_date } = req.query;
  
  const data = await StudyRecord.getStudyTimeDistribution(studentId, {
    startDate: start_date,
    endDate: end_date
  });
  
  res.json({
    success: true,
    data
  });
});

// Gelişmiş deneme sınavı istatistikleri
const getMockExamDetailedStats = asyncHandler(async (req, res) => {
  const studentId = req.user.id;
  const { exam_type, months = 6 } = req.query;
  
  const data = await MockExam.getDetailedStats(studentId, {
    examType: exam_type,
    months: parseInt(months)
  });
  
  res.json({
    success: true,
    data
  });
});

module.exports = {
  getDashboard,
  getStudyRecords,
  createStudyRecord,
  getStudyRecord,
  updateStudyRecord,
  deleteStudyRecord,
  getStatistics,
  getStreak,
  getWeeklyStats,
  getSubjectStats,
  getMockExams,
  createMockExam,
  getMockExam,
  updateMockExam,
  deleteMockExam,
  getMockExamProgress,
  getTasks,
  completeTask,
  updateTaskStatus,
  updateTaskTime,
  updateTaskNotes,
  getPlans,
  getPlan,
  getGoals,
  setGoals,
  getRandomQuote,
  getDailyQuestionsBySubject,
  getSubjectPerformanceComparison,
  getStudyTimeDistribution,
  getMockExamDetailedStats
};