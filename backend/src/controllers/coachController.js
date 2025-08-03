const User = require('../models/User');
const StudyRecord = require('../models/StudyRecord');
const MockExam = require('../models/MockExam');
const Task = require('../models/Task');
const { asyncHandler } = require('../middlewares/error.middleware');
const { SUCCESS_MESSAGES } = require('../utils/constants');
const database = require('../config/database');

const getDashboard = asyncHandler(async (req, res) => {
  const coachId = req.user.id;

  // Get all students
  const students = await User.getAllStudents();
  const studentIds = students.map(s => s.id);

  if (studentIds.length === 0) {
    return res.json({
      success: true,
      data: {
        students: [],
        overview: {
          totalStudents: 0,
          activeTasks: 0,
          overdueTasks: 0,
          completedTasksThisWeek: 0
        },
        recentActivity: []
      }
    });
  }

  // Get task statistics
  const taskStats = await Task.getCoachTaskStats(coachId);

  // Get recent study activity
  const recentActivity = await database.all(`
    SELECT 
      sr.date,
      sr.subject,
      sr.duration_minutes,
      sr.questions_solved,
      u.name as student_name
    FROM study_records sr
    JOIN users u ON sr.student_id = u.id
    WHERE sr.student_id IN (${studentIds.map(() => '?').join(',')})
    ORDER BY sr.created_at DESC
    LIMIT 10
  `, studentIds);

  // Get students with low activity (no study records in last 3 days)
  const threeDaysAgo = new Date();
  threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
  
  const inactiveStudents = await database.all(`
    SELECT u.id, u.name
    FROM users u
    JOIN student_profiles sp ON u.id = sp.user_id
    WHERE sp.coach_id = ? AND u.id NOT IN (
      SELECT DISTINCT student_id 
      FROM study_records 
      WHERE date >= ? AND student_id IN (${studentIds.map(() => '?').join(',')})
    )
  `, [coachId, threeDaysAgo.toISOString().split('T')[0], ...studentIds]);

  res.json({
    success: true,
    data: {
      students,
      overview: {
        totalStudents: students.length,
        activeTasks: taskStats.pending_tasks || 0,
        overdueTasks: taskStats.overdue_tasks || 0,
        completedTasks: taskStats.completed_tasks || 0
      },
      recentActivity,
      inactiveStudents
    }
  });
});

const getStudents = asyncHandler(async (req, res) => {
  const coachId = req.user.id;
  const students = await User.getAllStudents();

  // Enrich student data with recent activity and statistics
  for (const student of students) {
    const lastRecord = await database.get(`
      SELECT date, subject, duration_minutes
      FROM study_records 
      WHERE student_id = ?
      ORDER BY date DESC, created_at DESC
      LIMIT 1
    `, [student.id]);

    const streak = await StudyRecord.getDailyStreak(student.id);
    
    const taskStats = await Task.getTaskStats(student.id);

    // Calculate total study time and questions
    const studyStats = await database.get(`
      SELECT 
        SUM(duration_minutes) as total_study_time,
        SUM(questions_solved) as total_questions,
        SUM(correct_answers) as total_correct,
        COUNT(*) as total_sessions
      FROM study_records 
      WHERE student_id = ?
    `, [student.id]);

    // Calculate accuracy rate
    const accuracyRate = studyStats?.total_questions > 0 
      ? Math.round((studyStats.total_correct / studyStats.total_questions) * 100) 
      : 0;

    // Calculate current streak
    const currentStreak = streak || 0;

    student.lastActivity = lastRecord;
    student.streak = currentStreak;
    student.current_streak = currentStreak;
    student.taskStats = taskStats;
    student.total_study_time = studyStats?.total_study_time || 0;
    student.total_questions = studyStats?.total_questions || 0;
    student.accuracy_rate = accuracyRate;
    student.total_sessions = studyStats?.total_sessions || 0;
  }

  res.json({
    success: true,
    data: students
  });
});

const getStudentDetails = asyncHandler(async (req, res) => {
  const { studentId } = req.params;

  const student = await database.get(`
    SELECT 
      u.id, u.name, u.email, u.phone, u.created_at,
      sp.target_field, sp.target_university, sp.target_department,
      sp.exam_date, sp.grade_level, sp.school_name
    FROM users u
    JOIN student_profiles sp ON u.id = sp.user_id
    WHERE u.id = ?
  `, [studentId]);

  if (!student) {
    return res.status(404).json({
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: 'Öğrenci bulunamadı'
      }
    });
  }

  // Get additional stats
  const streak = await StudyRecord.getDailyStreak(studentId);
  const taskStats = await Task.getTaskStats(studentId);
  
  const thisWeekStart = new Date();
  thisWeekStart.setDate(thisWeekStart.getDate() - thisWeekStart.getDay());
  
  const weeklyStats = await StudyRecord.getStatistics(studentId, {
    startDate: thisWeekStart.toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    groupBy: 'subject'
  });

  student.streak = streak;
  student.taskStats = taskStats;
  student.weeklyStats = weeklyStats;

  res.json({
    success: true,
    data: student
  });
});


const getStudentStudyRecords = asyncHandler(async (req, res) => {
  const { studentId } = req.params;
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

const getStudentMockExams = asyncHandler(async (req, res) => {
  const { studentId } = req.params;
  const { start_date, end_date, exam_type } = req.query;

  const options = {
    startDate: start_date,
    endDate: end_date,
    examType: exam_type
  };

  const exams = await MockExam.findByStudent(studentId, options);

  res.json({
    success: true,
    data: exams
  });
});

const getStudentProgress = asyncHandler(async (req, res) => {
  const { studentId } = req.params;
  const { months = 3 } = req.query;

  const tytProgress = await MockExam.getComparisonData(studentId, 'TYT', parseInt(months));
  const aytProgress = await MockExam.getComparisonData(studentId, 'AYT', parseInt(months));

  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - parseInt(months));

  const studyProgress = await StudyRecord.getStatistics(studentId, {
    startDate: startDate.toISOString().split('T')[0],
    groupBy: 'date'
  });

  res.json({
    success: true,
    data: {
      mockExams: {
        tyt: tytProgress,
        ayt: aytProgress
      },
      studyProgress
    }
  });
});

const getTasks = asyncHandler(async (req, res) => {
  const coachId = req.user.id;
  const { status, student_id, page = 1, limit = 50 } = req.query;
  
  let whereClause = 'WHERE t.assigned_by = ?';
  let params = [coachId];
  
  if (status) {
    whereClause += ' AND t.status = ?';
    params.push(status);
  }
  
  if (student_id) {
    whereClause += ' AND t.student_id = ?';
    params.push(student_id);
  }
  
  const tasks = await database.all(`
    SELECT 
      t.*,
      u.name as student_name,
      u.email as student_email
    FROM tasks t
    JOIN users u ON t.student_id = u.id
    ${whereClause}
    ORDER BY t.due_date ASC
    LIMIT ? OFFSET ?
  `, [...params, parseInt(limit), (parseInt(page) - 1) * parseInt(limit)]);
  
  res.json({
    success: true,
    data: tasks
  });
});

const createTask = asyncHandler(async (req, res) => {
  const { studentId } = req.params;
  const coachId = req.user.id;

  const taskData = {
    ...req.body,
    student_id: studentId,
    assigned_by: coachId
  };

  // Check if this is a recurring task
  const { recurrence_type } = taskData;
  
  if (recurrence_type && recurrence_type !== 'none') {
    // Create recurring tasks
    const tasks = await Task.createRecurringTasks(taskData);
    
    res.status(201).json({
      success: true,
      message: `${tasks.length} görevi başarıyla oluşturuldu (${recurrence_type} tekrar ile)`,
      data: {
        tasks,
        parentTask: tasks[0],
        recurringCount: tasks.length - 1
      }
    });
  } else {
    // Create single task
    const task = await Task.create(taskData);

    res.status(201).json({
      success: true,
      message: SUCCESS_MESSAGES.RECORD_CREATED,
      data: task
    });
  }
});

const updateTask = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const coachId = req.user.id;

  const task = await Task.findById(id);

  if (!task || task.assigned_by !== coachId) {
    return res.status(404).json({
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: 'Görev bulunamadı'
      }
    });
  }

  const updatedTask = await Task.update(id, req.body);

  res.json({
    success: true,
    message: SUCCESS_MESSAGES.RECORD_UPDATED,
    data: updatedTask
  });
});

const deleteTask = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const coachId = req.user.id;

  const task = await Task.findById(id);

  if (!task || task.assigned_by !== coachId) {
    return res.status(404).json({
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: 'Görev bulunamadı'
      }
    });
  }

  await Task.delete(id);

  res.json({
    success: true,
    message: SUCCESS_MESSAGES.RECORD_DELETED
  });
});

const getStudentTasks = asyncHandler(async (req, res) => {
  const { studentId } = req.params;
  const { status } = req.query;

  const tasks = await Task.findByStudent(studentId, { status });

  res.json({
    success: true,
    data: tasks
  });
});

const getPlans = asyncHandler(async (req, res) => {
  const coachId = req.user.id;
  const { page = 1, limit = 20 } = req.query;

  const plans = await database.all(`
    SELECT 
      wp.*,
      u.name as student_name
    FROM weekly_plans wp
    JOIN users u ON wp.student_id = u.id
    JOIN student_profiles sp ON u.id = sp.user_id
    WHERE sp.coach_id = ?
    ORDER BY wp.week_start DESC
    LIMIT ? OFFSET ?
  `, [coachId, parseInt(limit), (parseInt(page) - 1) * parseInt(limit)]);

  res.json({
    success: true,
    data: plans
  });
});

const createPlan = asyncHandler(async (req, res) => {
  const { studentId } = req.params;
  const coachId = req.user.id;

  const { week_start, week_end, plan_data } = req.body;

  const result = await database.run(`
    INSERT INTO weekly_plans (student_id, week_start, week_end, plan_data, created_by)
    VALUES (?, ?, ?, ?, ?)
  `, [studentId, week_start, week_end, JSON.stringify(plan_data), coachId]);

  const plan = await database.get(
    'SELECT * FROM weekly_plans WHERE id = ?',
    [result.id]
  );

  res.status(201).json({
    success: true,
    message: SUCCESS_MESSAGES.RECORD_CREATED,
    data: plan
  });
});

const updatePlan = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const coachId = req.user.id;

  const plan = await database.get(`
    SELECT wp.* FROM weekly_plans wp
    JOIN student_profiles sp ON wp.student_id = sp.user_id
    WHERE wp.id = ? AND sp.coach_id = ?
  `, [id, coachId]);

  if (!plan) {
    return res.status(404).json({
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: 'Plan bulunamadı'
      }
    });
  }

  const { plan_data, status, completion_rate } = req.body;
  const fields = [];
  const values = [];

  if (plan_data) {
    fields.push('plan_data = ?');
    values.push(JSON.stringify(plan_data));
  }
  if (status) {
    fields.push('status = ?');
    values.push(status);
  }
  if (completion_rate !== undefined) {
    fields.push('completion_rate = ?');
    values.push(completion_rate);
  }

  if (fields.length > 0) {
    values.push(id);
    await database.run(
      `UPDATE weekly_plans SET ${fields.join(', ')} WHERE id = ?`,
      values
    );
  }

  const updatedPlan = await database.get(
    'SELECT * FROM weekly_plans WHERE id = ?',
    [id]
  );

  res.json({
    success: true,
    message: SUCCESS_MESSAGES.RECORD_UPDATED,
    data: updatedPlan
  });
});

const deletePlan = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const coachId = req.user.id;

  const plan = await database.get(`
    SELECT wp.* FROM weekly_plans wp
    JOIN student_profiles sp ON wp.student_id = sp.user_id
    WHERE wp.id = ? AND sp.coach_id = ?
  `, [id, coachId]);

  if (!plan) {
    return res.status(404).json({
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: 'Plan bulunamadı'
      }
    });
  }

  await database.run('DELETE FROM weekly_plans WHERE id = ?', [id]);

  res.json({
    success: true,
    message: SUCCESS_MESSAGES.RECORD_DELETED
  });
});

const getStudentPlans = asyncHandler(async (req, res) => {
  const { studentId } = req.params;

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

const getOverviewReport = asyncHandler(async (req, res) => {
  const coachId = req.user.id;
  const { start_date, end_date } = req.query;

  const students = await User.getAllStudents();
  const studentIds = students.map(s => s.id);

  if (studentIds.length === 0) {
    return res.json({
      success: true,
      data: {
        totalStudents: 0,
        totalStudyHours: 0,
        totalQuestions: 0,
        averageStreak: 0
      }
    });
  }

  let dateFilter = '';
  let params = [...studentIds];

  if (start_date && end_date) {
    dateFilter = ` AND date BETWEEN ? AND ?`;
    params.push(start_date, end_date);
  }

  const overview = await database.get(`
    SELECT 
      COUNT(DISTINCT student_id) as active_students,
      SUM(duration_minutes) as total_minutes,
      SUM(questions_solved) as total_questions,
      COUNT(*) as total_sessions
    FROM study_records 
    WHERE student_id IN (${studentIds.map(() => '?').join(',')})${dateFilter}
  `, params);

  res.json({
    success: true,
    data: {
      totalStudents: students.length,
      activeStudents: overview.active_students || 0,
      totalStudyHours: Math.round((overview.total_minutes || 0) / 60 * 100) / 100,
      totalQuestions: overview.total_questions || 0,
      totalSessions: overview.total_sessions || 0
    }
  });
});

const getStudentReport = asyncHandler(async (req, res) => {
  const { studentId } = req.params;
  const { start_date, end_date } = req.query;

  const stats = await StudyRecord.getStatistics(studentId, {
    startDate: start_date,
    endDate: end_date,
    groupBy: 'subject'
  });

  const mockExamProgress = await MockExam.getProgress(studentId);
  const taskStats = await Task.getTaskStats(studentId);

  res.json({
    success: true,
    data: {
      studyStats: stats,
      mockExamProgress,
      taskStats
    }
  });
});

const getPerformanceReport = asyncHandler(async (req, res) => {
  const coachId = req.user.id;
  const { start_date, end_date } = req.query;

  const students = await User.getAllStudents();
  const performanceData = [];

  for (const student of students) {
    const stats = await StudyRecord.getStatistics(student.id, {
      startDate: start_date,
      endDate: end_date
    });

    const streak = await StudyRecord.getDailyStreak(student.id);
    const taskStats = await Task.getTaskStats(student.id);

    performanceData.push({
      student: {
        id: student.id,
        name: student.name,
        target_field: student.target_field
      },
      stats: stats[0] || {},
      streak,
      taskStats
    });
  }

  res.json({
    success: true,
    data: performanceData
  });
});

const broadcastMessage = asyncHandler(async (req, res) => {
  const coachId = req.user.id;
  const { title, message } = req.body;

  const students = await User.getAllStudents();

  for (const student of students) {
    await database.run(`
      INSERT INTO notifications (user_id, title, message, type)
      VALUES (?, ?, ?, 'info')
    `, [student.id, title, message]);
  }

  res.json({
    success: true,
    message: `Mesaj ${students.length} öğrenciye gönderildi`
  });
});

const sendMessage = asyncHandler(async (req, res) => {
  const { studentId } = req.params;
  const { title, message } = req.body;

  await database.run(`
    INSERT INTO notifications (user_id, title, message, type)
    VALUES (?, ?, ?, 'info')
  `, [studentId, title, message]);

  res.json({
    success: true,
    message: 'Mesaj gönderildi'
  });
});

const getStudentsAnalytics = asyncHandler(async (req, res) => {
  const coachId = req.user.id;

  const analytics = await database.all(`
    SELECT 
      u.name,
      sp.target_field,
      COUNT(sr.id) as total_sessions,
      SUM(sr.duration_minutes) as total_minutes,
      SUM(sr.questions_solved) as total_questions
    FROM users u
    JOIN student_profiles sp ON u.id = sp.user_id
    LEFT JOIN study_records sr ON u.id = sr.student_id
    WHERE sp.coach_id = ?
    GROUP BY u.id, u.name, sp.target_field
    ORDER BY total_minutes DESC
  `, [coachId]);

  res.json({
    success: true,
    data: analytics
  });
});

const getSubjectsAnalytics = asyncHandler(async (req, res) => {
  const coachId = req.user.id;
  const { start_date, end_date } = req.query;

  const students = await User.getAllStudents();
  const studentIds = students.map(s => s.id);

  if (studentIds.length === 0) {
    return res.json({
      success: true,
      data: []
    });
  }

  let dateFilter = '';
  let params = [...studentIds];

  if (start_date && end_date) {
    dateFilter = ` AND date BETWEEN ? AND ?`;
    params.push(start_date, end_date);
  }

  const subjectStats = await database.all(`
    SELECT 
      subject,
      COUNT(*) as sessions,
      SUM(duration_minutes) as total_minutes,
      SUM(questions_solved) as total_questions,
      AVG(CASE WHEN questions_solved > 0 THEN CAST(correct_answers AS FLOAT) / questions_solved * 100 ELSE 0 END) as avg_accuracy
    FROM study_records 
    WHERE student_id IN (${studentIds.map(() => '?').join(',')})${dateFilter}
    GROUP BY subject
    ORDER BY total_minutes DESC
  `, params);

  res.json({
    success: true,
    data: subjectStats
  });
});

const getProgressAnalytics = asyncHandler(async (req, res) => {
  const coachId = req.user.id;
  const { start_date, end_date } = req.query;

  const students = await User.getAllStudents();
  const studentIds = students.map(s => s.id);

  if (studentIds.length === 0) {
    return res.json({
      success: true,
      data: []
    });
  }

  let dateFilter = '';
  let params = [...studentIds];

  if (start_date && end_date) {
    dateFilter = ` AND date BETWEEN ? AND ?`;
    params.push(start_date, end_date);
  }

  const progressData = await database.all(`
    SELECT 
      date,
      COUNT(DISTINCT student_id) as active_students,
      SUM(duration_minutes) as total_minutes,
      SUM(questions_solved) as total_questions
    FROM study_records 
    WHERE student_id IN (${studentIds.map(() => '?').join(',')})${dateFilter}
    GROUP BY date
    ORDER BY date
  `, params);

  res.json({
    success: true,
    data: progressData
  });
});

const assignStudent = asyncHandler(async (req, res) => {
  const coachId = req.user.id;
  const { student_id } = req.body;

  const success = await User.assignCoachToStudent(student_id, coachId);

  if (!success) {
    return res.status(404).json({
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: 'Öğrenci bulunamadı'
      }
    });
  }

  res.json({
    success: true,
    message: 'Öğrenci başarıyla atandı'
  });
});

const unassignStudent = asyncHandler(async (req, res) => {
  const { studentId } = req.params;

  const success = await User.assignCoachToStudent(studentId, null);

  if (!success) {
    return res.status(404).json({
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: 'Öğrenci bulunamadı'
      }
    });
  }

  res.json({
    success: true,
    message: 'Öğrenci ataması kaldırıldı'
  });
});

const updateStudent = asyncHandler(async (req, res) => {
  const { studentId } = req.params;
  const coachId = req.user.id;
  const { name, phone, target_field, grade_level, school_name, target_university, target_department } = req.body;

  // Verify this student belongs to this coach
  const student = await database.get(`
    SELECT u.id
    FROM users u
    JOIN student_profiles sp ON u.id = sp.user_id
    WHERE u.id = ? AND sp.coach_id = ?
  `, [studentId, coachId]);

  if (!student) {
    return res.status(404).json({
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: 'Öğrenci bulunamadı'
      }
    });
  }

  try {
    // Update user basic info
    if (name || phone) {
      const userUpdates = [];
      const userValues = [];
      
      if (name) {
        userUpdates.push('name = ?');
        userValues.push(name);
      }
      if (phone) {
        userUpdates.push('phone = ?');
        userValues.push(phone);
      }
      
      userValues.push(studentId);
      
      await database.run(`
        UPDATE users SET ${userUpdates.join(', ')} WHERE id = ?
      `, userValues);
    }

    // Update student profile
    const profileUpdates = [];
    const profileValues = [];
    
    if (target_field) {
      profileUpdates.push('target_field = ?');
      profileValues.push(target_field);
    }
    if (grade_level !== undefined) {
      profileUpdates.push('grade_level = ?');
      profileValues.push(grade_level);
    }
    if (school_name !== undefined) {
      profileUpdates.push('school_name = ?');
      profileValues.push(school_name);
    }
    if (target_university !== undefined) {
      profileUpdates.push('target_university = ?');
      profileValues.push(target_university);
    }
    if (target_department !== undefined) {
      profileUpdates.push('target_department = ?');
      profileValues.push(target_department);
    }
    
    if (profileUpdates.length > 0) {
      profileValues.push(studentId);
      await database.run(`
        UPDATE student_profiles SET ${profileUpdates.join(', ')} WHERE user_id = ?
      `, profileValues);
    }

    // Get updated student data
    const updatedStudent = await database.get(`
      SELECT 
        u.id, u.name, u.email, u.phone, u.created_at,
        sp.target_field, sp.target_university, sp.target_department,
        sp.exam_date, sp.grade_level, sp.school_name
      FROM users u
      JOIN student_profiles sp ON u.id = sp.user_id
      WHERE u.id = ?
    `, [studentId]);

    res.json({
      success: true,
      data: updatedStudent,
      message: 'Öğrenci bilgileri başarıyla güncellendi'
    });
  } catch (error) {
    console.error('Update student error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'UPDATE_FAILED',
        message: 'Öğrenci güncellenirken hata oluştu'
      }
    });
  }
});

const addStudent = asyncHandler(async (req, res) => {
  const coachId = req.user.id;
  const { name, email, phone, target_field, grade_level, school_name, password } = req.body;

  // Check if user already exists
  const existingUser = await database.get('SELECT id FROM users WHERE email = ?', [email]);
  if (existingUser) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'EMAIL_EXISTS',
        message: 'Bu e-posta adresi zaten kullanılıyor'
      }
    });
  }

  try {
    // Create user
    const hashedPassword = await require('../utils/helpers').hashPassword(password || '123456');
    const userResult = await database.run(`
      INSERT INTO users (email, password, role, name, phone)
      VALUES (?, ?, 'student', ?, ?)
    `, [email, hashedPassword, name, phone]);

    // Create student profile
    await database.run(`
      INSERT INTO student_profiles (user_id, coach_id, target_field, grade_level, school_name)
      VALUES (?, ?, ?, ?, ?)
    `, [userResult.id, coachId, target_field, grade_level, school_name]);

    // Get created student with profile
    const student = await database.get(`
      SELECT u.id, u.name, u.email, u.phone, sp.target_field, sp.grade_level, sp.school_name
      FROM users u
      LEFT JOIN student_profiles sp ON u.id = sp.user_id
      WHERE u.id = ?
    `, [userResult.id]);

    res.status(201).json({
      success: true,
      data: student,
      message: 'Öğrenci başarıyla eklendi'
    });
  } catch (error) {
    console.error('Add student error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'CREATE_FAILED',
        message: 'Öğrenci oluşturulurken hata oluştu'
      }
    });
  }
});

const deleteStudent = asyncHandler(async (req, res) => {
  const { studentId } = req.params;

  // Verify student exists
  const student = await database.get('SELECT id, name FROM users WHERE id = ? AND role = ?', [studentId, 'student']);
  
  if (!student) {
    return res.status(404).json({
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: 'Öğrenci bulunamadı'
      }
    });
  }

  try {
    // Delete related records in order (due to foreign key constraints)
    
    // Delete notifications
    await database.run('DELETE FROM notifications WHERE user_id = ?', [studentId]);
    
    // Delete weekly plans
    await database.run('DELETE FROM weekly_plans WHERE student_id = ?', [studentId]);
    
    // Delete tasks
    await database.run('DELETE FROM tasks WHERE student_id = ?', [studentId]);
    
    // Delete mock exams
    await database.run('DELETE FROM mock_exams WHERE student_id = ?', [studentId]);
    
    // Delete study records
    await database.run('DELETE FROM study_records WHERE student_id = ?', [studentId]);
    
    // Delete student profile
    await database.run('DELETE FROM student_profiles WHERE user_id = ?', [studentId]);
    
    // Finally delete the user
    await database.run('DELETE FROM users WHERE id = ?', [studentId]);

    res.json({
      success: true,
      message: `Öğrenci "${student.name}" ve tüm verileri başarıyla silindi`
    });
  } catch (error) {
    console.error('Delete student error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'DELETE_FAILED',
        message: 'Öğrenci silinirken hata oluştu'
      }
    });
  }
});

const getStudentStatistics = asyncHandler(async (req, res) => {
  const { studentId } = req.params;
  const coachId = req.user.id;
  const { start_date, end_date, group_by = 'subject', timeRange, subject, examType } = req.query;

  // All mentors can access all students
  const student = await database.get('SELECT id FROM users WHERE id = ? AND role = ?', [studentId, 'student']);
  
  if (!student) {
    return res.status(404).json({
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: 'Öğrenci bulunamadı'
      }
    });
  }

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

const getStudentDailyQuestionsBySubject = asyncHandler(async (req, res) => {
  const { studentId } = req.params;
  const { startDate, endDate } = req.query;

  try {
    const data = await StudyRecord.getDailyQuestionsBySubject(studentId, {
      startDate,
      endDate
    });

    res.json({
      success: true,
      data: data
    });
  } catch (error) {
    console.error('Get daily questions by subject error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_FAILED',
        message: 'Günlük soru verileri alınırken hata oluştu'
      }
    });
  }
});

module.exports = {
  getDashboard,
  getStudents,
  getStudentDetails,
  getStudentStatistics,
  getStudentStudyRecords,
  getStudentMockExams,
  getStudentProgress,
  getTasks,
  createTask,
  updateTask,
  deleteTask,
  getStudentTasks,
  getPlans,
  createPlan,
  updatePlan,
  deletePlan,
  getStudentPlans,
  getOverviewReport,
  getStudentReport,
  getPerformanceReport,
  broadcastMessage,
  sendMessage,
  getStudentsAnalytics,
  getSubjectsAnalytics,
  getProgressAnalytics,
  assignStudent,
  unassignStudent,
  updateStudent,
  addStudent,
  deleteStudent,
  getStudentDailyQuestionsBySubject
};