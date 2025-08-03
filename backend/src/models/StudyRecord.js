const database = require('../config/database');
const { formatDate } = require('../utils/helpers');

class StudyRecord {
  static async create(recordData) {
    const {
      student_id,
      date,
      subject,
      topic,
      duration_minutes,
      questions_solved = 0,
      correct_answers = 0,
      wrong_answers = 0,
      empty_answers = 0,
      study_type = 'konu_calismasi',
      notes,
      mood
    } = recordData;

    const result = await database.run(`
      INSERT INTO study_records (
        student_id, date, subject, topic, duration_minutes,
        questions_solved, correct_answers, wrong_answers, empty_answers,
        study_type, notes, mood
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      student_id, formatDate(date), subject, topic, duration_minutes,
      questions_solved, correct_answers, wrong_answers, empty_answers,
      study_type, notes, mood
    ]);

    return await this.findById(result.id);
  }

  static async findById(id) {
    return await database.get('SELECT * FROM study_records WHERE id = ?', [id]);
  }

  static async findByStudent(studentId, options = {}) {
    let query = 'SELECT * FROM study_records WHERE student_id = ?';
    const params = [studentId];

    if (options.startDate && options.endDate) {
      query += ' AND date BETWEEN ? AND ?';
      params.push(formatDate(options.startDate), formatDate(options.endDate));
    } else if (options.date) {
      query += ' AND date = ?';
      params.push(formatDate(options.date));
    }

    if (options.subject) {
      query += ' AND subject = ?';
      params.push(options.subject);
    }

    query += ' ORDER BY date DESC, created_at DESC';

    if (options.limit) {
      query += ' LIMIT ?';
      params.push(options.limit);
    }

    return await database.all(query, params);
  }

  static async update(id, updateData) {
    const fields = [];
    const values = [];

    // List of valid columns that exist in database
    const validColumns = [
      'date', 'subject', 'topic', 'duration_minutes', 
      'questions_solved', 'correct_answers', 'wrong_answers', 
      'empty_answers', 'study_type', 'notes', 'mood'
    ];

    Object.keys(updateData).forEach(key => {
      if (updateData[key] !== undefined && key !== 'id' && key !== 'student_id' && validColumns.includes(key)) {
        if (key === 'date') {
          fields.push(`${key} = ?`);
          values.push(formatDate(updateData[key]));
        } else {
          fields.push(`${key} = ?`);
          values.push(updateData[key]);
        }
      }
    });

    if (fields.length === 0) {
      throw new Error('No valid fields to update');
    }

    values.push(id);

    await database.run(
      `UPDATE study_records SET ${fields.join(', ')} WHERE id = ?`,
      values
    );

    return await this.findById(id);
  }

  static async delete(id) {
    const result = await database.run('DELETE FROM study_records WHERE id = ?', [id]);
    return result.changes > 0;
  }

  static async getStatistics(studentId, options = {}) {
    let query = `
      SELECT 
        COUNT(*) as total_sessions,
        SUM(duration_minutes) as total_minutes,
        SUM(questions_solved) as total_questions,
        SUM(correct_answers) as total_correct,
        SUM(wrong_answers) as total_wrong,
        AVG(duration_minutes) as avg_session_duration,
        subject,
        COUNT(*) as subject_sessions,
        SUM(duration_minutes) as subject_minutes
      FROM study_records 
      WHERE student_id = ?
    `;
    const params = [studentId];

    if (options.startDate && options.endDate) {
      query += ' AND date BETWEEN ? AND ?';
      params.push(formatDate(options.startDate), formatDate(options.endDate));
    }

    if (options.groupBy === 'subject') {
      query += ' GROUP BY subject ORDER BY subject_minutes DESC';
    } else if (options.groupBy === 'date') {
      query = `
        SELECT 
          date,
          COUNT(*) as sessions,
          SUM(duration_minutes) as minutes,
          SUM(questions_solved) as questions
        FROM study_records 
        WHERE student_id = ?
      `;
      if (options.startDate && options.endDate) {
        query += ' AND date BETWEEN ? AND ?';
      }
      query += ' GROUP BY date ORDER BY date DESC';
    }

    return await database.all(query, params);
  }

  static async getDailyStreak(studentId) {
    const records = await database.all(`
      SELECT DISTINCT date 
      FROM study_records 
      WHERE student_id = ? 
      ORDER BY date DESC
    `, [studentId]);

    if (records.length === 0) return 0;

    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Sort records by date descending
    const sortedRecords = records.map(record => {
      const date = new Date(record.date);
      date.setHours(0, 0, 0, 0);
      return date;
    }).sort((a, b) => b - a);

    let expectedDate = new Date(today);
    
    // Check if there's study today - if not, start from yesterday
    const todayStudy = sortedRecords.find(date => date.getTime() === today.getTime());
    if (!todayStudy) {
      expectedDate.setDate(expectedDate.getDate() - 1);
    }

    for (const recordDate of sortedRecords) {
      const diffDays = Math.floor((expectedDate - recordDate) / (1000 * 60 * 60 * 24));
      
      if (diffDays === 0) {
        // Found expected date
        streak++;
        expectedDate.setDate(expectedDate.getDate() - 1);
      } else if (diffDays > 0) {
        // Gap found, streak breaks
        break;
      }
      // diffDays < 0 means future date, skip
    }

    return streak;
  }

  static async getWeeklyProgress(studentId, weekStart) {
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);

    return await database.all(`
      SELECT 
        date,
        SUM(duration_minutes) as total_minutes,
        SUM(questions_solved) as total_questions,
        COUNT(*) as sessions
      FROM study_records 
      WHERE student_id = ? AND date BETWEEN ? AND ?
      GROUP BY date
      ORDER BY date
    `, [studentId, formatDate(weekStart), formatDate(weekEnd)]);
  }

  static async getSubjectProgress(studentId, subject, days = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    return await database.all(`
      SELECT 
        date,
        SUM(duration_minutes) as minutes,
        SUM(questions_solved) as questions,
        SUM(correct_answers) as correct,
        SUM(wrong_answers) as wrong
      FROM study_records 
      WHERE student_id = ? AND subject = ? AND date >= ?
      GROUP BY date
      ORDER BY date
    `, [studentId, subject, formatDate(startDate)]);
  }

  // Derslere göre günlük soru sayıları
  static async getDailyQuestionsBySubject(studentId, { startDate, endDate }) {
    const query = `
      SELECT 
        date,
        subject,
        SUM(questions_solved) as questions
      FROM study_records 
      WHERE student_id = ? 
        AND date BETWEEN ? AND ?
      GROUP BY date, subject
      ORDER BY date, subject
    `;
    
    const params = [
      studentId,
      startDate || formatDate(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)),
      endDate || formatDate(new Date())
    ];
    
    return await database.all(query, params);
  }

  // Ders bazlı performans karşılaştırması - Improved accuracy calculation
  static async getSubjectPerformanceComparison(studentId, { startDate, endDate }) {
    const start = startDate || formatDate(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000));
    const end = endDate || formatDate(new Date());
    
    const query = `
      SELECT 
        subject,
        SUM(questions_solved) as total_questions,
        SUM(correct_answers) as total_correct,
        SUM(wrong_answers) as total_wrong,
        SUM(empty_answers) as total_empty,
        CASE 
          WHEN SUM(questions_solved) > 0 THEN 
            ROUND(CAST(SUM(correct_answers) AS REAL) / SUM(questions_solved) * 100, 2)
          ELSE 0 
        END as accuracy_rate,
        COUNT(*) as session_count,
        SUM(duration_minutes) as total_duration
      FROM study_records 
      WHERE student_id = ? 
        AND date BETWEEN ? AND ?
        AND questions_solved > 0
      GROUP BY subject
      HAVING SUM(questions_solved) > 0
      ORDER BY accuracy_rate DESC, total_questions DESC
    `;
    
    const params = [studentId, start, end];
    
    return await database.all(query, params);
  }

  // Çalışma süresi dağılımı - Optimized with CTE
  static async getStudyTimeDistribution(studentId, { startDate, endDate }) {
    const start = startDate || formatDate(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000));
    const end = endDate || formatDate(new Date());
    
    const query = `
      WITH total_minutes AS (
        SELECT SUM(duration_minutes) as total 
        FROM study_records 
        WHERE student_id = ? AND date BETWEEN ? AND ?
      ),
      subject_minutes AS (
        SELECT 
          subject,
          SUM(duration_minutes) as subject_total
        FROM study_records 
        WHERE student_id = ? AND date BETWEEN ? AND ?
        GROUP BY subject
      )
      SELECT 
        sm.subject,
        sm.subject_total as total_minutes,
        CASE 
          WHEN tm.total > 0 THEN ROUND(CAST(sm.subject_total AS REAL) / tm.total * 100, 2)
          ELSE 0
        END as percentage
      FROM subject_minutes sm, total_minutes tm
      ORDER BY sm.subject_total DESC
    `;
    
    const params = [studentId, start, end, studentId, start, end];
    
    return await database.all(query, params);
  }
}

module.exports = StudyRecord;