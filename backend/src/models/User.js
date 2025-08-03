const database = require('../config/database');
const { hashPassword, sanitizeUser } = require('../utils/helpers');

class User {
  static async create(userData) {
    const { email, password, role, name, phone } = userData;
    const hashedPassword = await hashPassword(password);
    
    const result = await database.run(
      `INSERT INTO users (email, password, role, name, phone) 
       VALUES (?, ?, ?, ?, ?)`,
      [email, hashedPassword, role, name, phone]
    );
    
    const user = await this.findById(result.id);
    return sanitizeUser(user);
  }

  static async findById(id) {
    return await database.get('SELECT * FROM users WHERE id = ?', [id]);
  }

  static async findByEmail(email) {
    return await database.get('SELECT * FROM users WHERE email = ?', [email]);
  }

  static async update(id, updateData) {
    const fields = [];
    const values = [];
    
    Object.keys(updateData).forEach(key => {
      if (updateData[key] !== undefined && key !== 'id' && key !== 'password') {
        fields.push(`${key} = ?`);
        values.push(updateData[key]);
      }
    });
    
    if (fields.length === 0) {
      throw new Error('No valid fields to update');
    }
    
    values.push(id);
    
    await database.run(
      `UPDATE users SET ${fields.join(', ')} WHERE id = ?`,
      values
    );
    
    const user = await this.findById(id);
    return sanitizeUser(user);
  }

  static async updatePassword(id, newPassword) {
    const hashedPassword = await hashPassword(newPassword);
    await database.run(
      'UPDATE users SET password = ? WHERE id = ?',
      [hashedPassword, id]
    );
  }

  static async delete(id) {
    const result = await database.run('DELETE FROM users WHERE id = ?', [id]);
    return result.changes > 0;
  }

  static async getCoaches() {
    const coaches = await database.all(
      'SELECT id, name, email, phone FROM users WHERE role = ?',
      ['coach']
    );
    return coaches;
  }

  static async getStudentsByCoach(coachId) {
    const students = await database.all(`
      SELECT u.id, u.name, u.email, u.phone, sp.target_field, sp.grade_level, sp.school_name
      FROM users u
      LEFT JOIN student_profiles sp ON u.id = sp.user_id
      WHERE u.role = 'student' AND sp.coach_id = ?
    `, [coachId]);
    return students;
  }

  static async getAllStudents() {
    const students = await database.all(`
      SELECT u.id, u.name, u.email, u.phone, sp.target_field, sp.grade_level, sp.school_name, sp.coach_id,
             c.name as coach_name
      FROM users u
      LEFT JOIN student_profiles sp ON u.id = sp.user_id
      LEFT JOIN users c ON sp.coach_id = c.id
      WHERE u.role = 'student'
      ORDER BY u.name
    `);
    return students;
  }

  static async assignCoachToStudent(studentId, coachId) {
    const result = await database.run(
      'UPDATE student_profiles SET coach_id = ? WHERE user_id = ?',
      [coachId, studentId]
    );
    return result.changes > 0;
  }
}

module.exports = User;