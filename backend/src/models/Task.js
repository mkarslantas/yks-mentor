const database = require('../config/database');
const { formatDate } = require('../utils/helpers');

class Task {
  static async create(taskData) {
    const {
      student_id,
      assigned_by,
      title,
      description,
      subject,
      due_date,
      start_time,
      end_time,
      estimated_time,
      priority = 'medium',
      recurrence_type = 'none',
      recurrence_interval = 1,
      recurrence_end_date,
      parent_task_id
    } = taskData;

    const result = await database.run(`
      INSERT INTO tasks (
        student_id, assigned_by, title, description, subject, due_date, 
        start_time, end_time, estimated_time, priority, recurrence_type,
        recurrence_interval, recurrence_end_date, parent_task_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      student_id, assigned_by, title, description, subject, 
      due_date ? formatDate(due_date) : null,
      start_time || null,
      end_time || null,
      estimated_time || null,
      priority,
      recurrence_type,
      recurrence_interval,
      recurrence_end_date ? formatDate(recurrence_end_date) : null,
      parent_task_id || null
    ]);

    return await this.findById(result.id);
  }

  static async findById(id) {
    return await database.get(`
      SELECT 
        t.*,
        u1.name as student_name,
        u2.name as assigned_by_name
      FROM tasks t
      LEFT JOIN users u1 ON t.student_id = u1.id
      LEFT JOIN users u2 ON t.assigned_by = u2.id
      WHERE t.id = ?
    `, [id]);
  }

  static async findByStudent(studentId, options = {}) {
    let query = `
      SELECT 
        t.*,
        u.name as assigned_by_name
      FROM tasks t
      LEFT JOIN users u ON t.assigned_by = u.id
      WHERE t.student_id = ?
    `;
    const params = [studentId];

    if (options.status) {
      query += ' AND t.status = ?';
      params.push(options.status);
    }

    if (options.subject) {
      query += ' AND t.subject = ?';
      params.push(options.subject);
    }

    if (options.priority) {
      query += ' AND t.priority = ?';
      params.push(options.priority);
    }

    if (options.dueSoon) {
      const threeDaysFromNow = new Date();
      threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
      query += ' AND t.due_date <= ? AND t.status != "completed"';
      params.push(formatDate(threeDaysFromNow));
    }

    query += ' ORDER BY ';
    if (options.orderBy === 'priority') {
      query += 'CASE t.priority WHEN "high" THEN 1 WHEN "medium" THEN 2 WHEN "low" THEN 3 END, ';
    }
    query += 't.due_date ASC, t.created_at DESC';

    if (options.limit) {
      query += ' LIMIT ?';
      params.push(options.limit);
    }

    return await database.all(query, params);
  }

  static async findByCoach(coachId, options = {}) {
    let query = `
      SELECT 
        t.*,
        u.name as student_name,
        sp.target_field
      FROM tasks t
      JOIN users u ON t.student_id = u.id
      JOIN student_profiles sp ON u.id = sp.user_id
      WHERE sp.coach_id = ?
    `;
    const params = [coachId];

    if (options.status) {
      query += ' AND t.status = ?';
      params.push(options.status);
    }

    if (options.studentId) {
      query += ' AND t.student_id = ?';
      params.push(options.studentId);
    }

    query += ' ORDER BY t.due_date ASC, t.created_at DESC';

    if (options.limit) {
      query += ' LIMIT ?';
      params.push(options.limit);
    }

    return await database.all(query, params);
  }

  static async update(id, updateData) {
    const fields = [];
    const values = [];

    Object.keys(updateData).forEach(key => {
      if (updateData[key] !== undefined && key !== 'id' && key !== 'student_id') {
        if (key === 'due_date') {
          fields.push(`${key} = ?`);
          values.push(updateData[key] ? formatDate(updateData[key]) : null);
        } else if (key === 'start_time' || key === 'end_time') {
          // Zaman alanlarını direkt olarak kaydet
          fields.push(`${key} = ?`);
          values.push(updateData[key]);
        } else if (key === 'estimated_time') {
          // estimated_time alanını da ekle
          fields.push(`${key} = ?`);
          values.push(updateData[key]);
        } else {
          fields.push(`${key} = ?`);
          values.push(updateData[key]);
        }
      }
    });

    if (fields.length === 0) {
      throw new Error('No valid fields to update');
    }

    fields.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);

    await database.run(
      `UPDATE tasks SET ${fields.join(', ')} WHERE id = ?`,
      values
    );

    return await this.findById(id);
  }

  static async updateStatus(id, status) {
    await database.run(
      'UPDATE tasks SET status = ? WHERE id = ?',
      [status, id]
    );

    return await this.findById(id);
  }

  static async updateTime(id, timeData) {
    const fields = [];
    const values = [];

    if (timeData.due_date !== undefined) {
      fields.push('due_date = ?');
      values.push(timeData.due_date);
    }

    if (timeData.start_time !== undefined) {
      fields.push('start_time = ?');
      values.push(timeData.start_time);
    }

    if (timeData.end_time !== undefined) {
      fields.push('end_time = ?');
      values.push(timeData.end_time);
    }

    if (timeData.estimated_time !== undefined) {
      fields.push('estimated_time = ?');
      values.push(timeData.estimated_time);
    }

    if (fields.length === 0) {
      throw new Error('No time fields to update');
    }

    values.push(id);

    await database.run(
      `UPDATE tasks SET ${fields.join(', ')} WHERE id = ?`,
      values
    );

    return await this.findById(id);
  }

  static async updateNotes(id, notesData) {
    const fields = [];
    const values = [];

    console.log('📝 Task.updateNotes called with:', { id, notesData });

    if (notesData.student_notes !== undefined) {
      fields.push('student_notes = ?');
      values.push(notesData.student_notes);
    }

    if (notesData.questions_solved !== undefined) {
      fields.push('questions_solved = ?');
      values.push(notesData.questions_solved);
    }

    if (notesData.topics_studied !== undefined) {
      fields.push('topics_studied = ?');
      values.push(notesData.topics_studied);
    }

    if (notesData.study_duration !== undefined) {
      fields.push('study_duration = ?');
      values.push(notesData.study_duration);
    }

    if (fields.length === 0) {
      throw new Error('No notes fields to update');
    }

    values.push(id);

    const query = `UPDATE tasks SET ${fields.join(', ')} WHERE id = ?`;
    console.log('📝 Executing SQL:', query);
    console.log('📝 With values:', values);

    const result = await database.run(query, values);
    console.log('📝 Update result:', result);

    const updatedTask = await this.findById(id);
    console.log('📝 Final updated task:', updatedTask);

    return updatedTask;
  }

  static async delete(id) {
    const result = await database.run('DELETE FROM tasks WHERE id = ?', [id]);
    return result.changes > 0;
  }

  static async markCompleted(id) {
    await database.run(
      'UPDATE tasks SET status = "completed", completed_at = CURRENT_TIMESTAMP WHERE id = ?',
      [id]
    );

    return await this.findById(id);
  }

  static async getOverdueTasks() {
    const today = formatDate(new Date());
    
    return await database.all(`
      SELECT 
        t.*,
        u.name as student_name,
        u.email as student_email
      FROM tasks t
      JOIN users u ON t.student_id = u.id
      WHERE t.due_date < ? AND t.status != 'completed'
    `, [today]);
  }

  static async updateOverdueTasks() {
    const today = formatDate(new Date());
    
    const result = await database.run(`
      UPDATE tasks 
      SET status = 'overdue' 
      WHERE due_date < ? AND status = 'pending'
    `, [today]);

    return result.changes;
  }

  static async getTaskStats(studentId) {
    return await database.get(`
      SELECT 
        COUNT(*) as total_tasks,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_tasks,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_tasks,
        SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END) as in_progress_tasks,
        SUM(CASE WHEN status = 'overdue' THEN 1 ELSE 0 END) as overdue_tasks,
        SUM(CASE WHEN priority = 'high' AND status != 'completed' THEN 1 ELSE 0 END) as high_priority_pending
      FROM tasks 
      WHERE student_id = ?
    `, [studentId]);
  }

  static async getCoachTaskStats(coachId) {
    return await database.get(`
      SELECT 
        COUNT(*) as total_tasks,
        SUM(CASE WHEN t.status = 'completed' THEN 1 ELSE 0 END) as completed_tasks,
        SUM(CASE WHEN t.status = 'pending' THEN 1 ELSE 0 END) as pending_tasks,
        SUM(CASE WHEN t.status = 'overdue' THEN 1 ELSE 0 END) as overdue_tasks,
        COUNT(DISTINCT t.student_id) as students_with_tasks
      FROM tasks t
      JOIN student_profiles sp ON t.student_id = sp.user_id
      WHERE sp.coach_id = ?
    `, [coachId]);
  }

  static async getDueTasks(studentId, days = 7) {
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + days);

    return await database.all(`
      SELECT * FROM tasks 
      WHERE student_id = ? 
        AND due_date <= ? 
        AND status NOT IN ('completed', 'overdue')
      ORDER BY due_date ASC
    `, [studentId, formatDate(endDate)]);
  }

  static async bulkUpdateStatus(taskIds, status) {
    const placeholders = taskIds.map(() => '?').join(',');
    const result = await database.run(
      `UPDATE tasks SET status = ? WHERE id IN (${placeholders})`,
      [status, ...taskIds]
    );

    return result.changes;
  }

  static async createRecurringTasks(taskData) {
    const {
      recurrence_type,
      recurrence_interval = 1,
      recurrence_end_date,
      due_date,
      start_time,
      end_time
    } = taskData;

    if (recurrence_type === 'none') {
      return [await this.create(taskData)];
    }

    const tasks = [];
    const startDate = new Date(due_date);
    const endDate = recurrence_end_date ? new Date(recurrence_end_date) : null;
    
    // Create the parent (original) task
    const parentTask = await this.create({
      ...taskData,
      recurrence_type,
      recurrence_interval,
      recurrence_end_date
    });
    tasks.push(parentTask);

    // Generate recurring tasks with a reasonable limit
    let currentDate = new Date(startDate);
    let iterationCount = 0;
    const maxIterations = Math.min(50, 365); // Limit to 50 tasks max to prevent rate limiting

    while (iterationCount < maxIterations) {
      // Calculate next occurrence
      switch (recurrence_type) {
        case 'daily':
          currentDate.setDate(currentDate.getDate() + recurrence_interval);
          break;
        case 'weekly':
          currentDate.setDate(currentDate.getDate() + (7 * recurrence_interval));
          break;
        case 'monthly':
          currentDate.setMonth(currentDate.getMonth() + recurrence_interval);
          break;
        default:
          return tasks;
      }

      // Check if we've exceeded the end date or 3 months into future
      const threeMonthsFromNow = new Date();
      threeMonthsFromNow.setMonth(threeMonthsFromNow.getMonth() + 3);
      
      if ((endDate && currentDate > endDate) || currentDate > threeMonthsFromNow) {
        break;
      }

      // Create recurring task with updated dates
      const recurringTaskData = {
        ...taskData,
        due_date: formatDate(currentDate),
        start_time: start_time ? this.adjustTimeForDate(start_time, currentDate) : null,
        end_time: end_time ? this.adjustTimeForDate(end_time, currentDate) : null,
        recurrence_type: 'none', // Child tasks are not recurring themselves
        parent_task_id: parentTask.id
      };

      const recurringTask = await this.create(recurringTaskData);
      tasks.push(recurringTask);

      iterationCount++;
    }

    return tasks;
  }

  static adjustTimeForDate(timeString, date) {
    if (!timeString) return null;
    
    // If timeString is just time (HH:MM), combine with date
    if (timeString.includes('T')) {
      const time = timeString.split('T')[1];
      return `${formatDate(date)}T${time}`;
    } else {
      return `${formatDate(date)}T${timeString}`;
    }
  }

  static async findRecurringTasks(parentTaskId) {
    return await database.all(`
      SELECT * FROM tasks 
      WHERE parent_task_id = ? 
      ORDER BY due_date ASC
    `, [parentTaskId]);
  }
}

module.exports = Task;