const database = require('../config/database');
const { hashPassword } = require('../utils/helpers');

const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seeding...');
    
    await database.connect();

    // Create demo student
    const studentPassword = await hashPassword('password123');
    const studentResult = await database.run(`
      INSERT OR IGNORE INTO users (email, password, role, name, phone) 
      VALUES (?, ?, ?, ?, ?)
    `, ['student@demo.com', studentPassword, 'student', 'Ali Öğrenci', '05551234567']);

    if (studentResult.id || studentResult.changes > 0) {
      // Get student ID for profile creation
      const student = await database.get('SELECT id FROM users WHERE email = ?', ['student@demo.com']);
      
      // Create student profile
      await database.run(`
        INSERT OR IGNORE INTO student_profiles (user_id, target_field, grade_level, school_name)
        VALUES (?, ?, ?, ?)
      `, [student.id, 'sayisal', 12, 'Demo Lisesi']);
      
      console.log('✅ Demo student created: student@demo.com / password123');
    }

    // Create demo coach
    const coachPassword = await hashPassword('password123');
    const coachResult = await database.run(`
      INSERT OR IGNORE INTO users (email, password, role, name, phone) 
      VALUES (?, ?, ?, ?, ?)
    `, ['coach@demo.com', coachPassword, 'coach', 'Mehmet Hoca', '05559876543']);

    if (coachResult.id || coachResult.changes > 0) {
      console.log('✅ Demo coach created: coach@demo.com / password123');
    }

    // Assign coach to student
    const coach = await database.get('SELECT id FROM users WHERE email = ?', ['coach@demo.com']);
    const student = await database.get('SELECT id FROM users WHERE email = ?', ['student@demo.com']);
    
    if (coach && student) {
      await database.run(`
        UPDATE student_profiles SET coach_id = ? WHERE user_id = ?
      `, [coach.id, student.id]);
      console.log('✅ Coach assigned to student');
    }

    // Create sample study records for demo
    const today = new Date();
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      dates.push(date.toISOString().split('T')[0]);
    }

    for (const date of dates) {
      // Math study
      const mathQuestions = 20 + Math.floor(Math.random() * 10);
      const mathCorrect = Math.floor(mathQuestions * 0.7);
      const mathWrong = Math.floor((mathQuestions - mathCorrect) * 0.8);
      const mathEmpty = mathQuestions - mathCorrect - mathWrong;
      
      await database.run(`
        INSERT OR IGNORE INTO study_records 
        (student_id, date, subject, topic, duration_minutes, questions_solved, correct_answers, wrong_answers, empty_answers, mood)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [student.id, date, 'Matematik', 'Türev', 60 + Math.floor(Math.random() * 60), mathQuestions, mathCorrect, mathWrong, mathEmpty, 'motivated']);

      // Turkish study
      const turkishQuestions = 15 + Math.floor(Math.random() * 8);
      const turkishCorrect = Math.floor(turkishQuestions * 0.8);
      const turkishWrong = Math.floor((turkishQuestions - turkishCorrect) * 0.7);
      const turkishEmpty = turkishQuestions - turkishCorrect - turkishWrong;
      
      await database.run(`
        INSERT OR IGNORE INTO study_records 
        (student_id, date, subject, topic, duration_minutes, questions_solved, correct_answers, wrong_answers, empty_answers, mood)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [student.id, date, 'Türkçe', 'Paragraf', 45 + Math.floor(Math.random() * 30), turkishQuestions, turkishCorrect, turkishWrong, turkishEmpty, 'normal']);
    }

    // Create sample mock exam
    await database.run(`
      INSERT OR IGNORE INTO mock_exams 
      (student_id, exam_type, exam_date, exam_name, turkce_net, matematik_net, sosyal_net, fen_net, tyt_score)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [student.id, 'TYT', dates[0], 'Demo Deneme 1', 25.5, 18.25, 12.0, 15.75, 350.5]);

    // Create sample tasks
    await database.run(`
      INSERT OR IGNORE INTO tasks 
      (student_id, assigned_by, title, description, subject, due_date, priority, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [student.id, coach.id, 'Matematik Türev Çalışması', 'Bu hafta türev konusunu tamamla', 'Matematik', dates[0], 'high', 'pending']);

    await database.run(`
      INSERT OR IGNORE INTO tasks 
      (student_id, assigned_by, title, description, subject, due_date, priority, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [student.id, coach.id, 'Deneme Çöz', 'Hafta sonuna kadar 1 TYT denemesi çöz', 'Genel', dates[2], 'medium', 'in_progress']);

    console.log('✅ Sample data created');
    console.log('🎉 Database seeding completed successfully!');
    
    console.log('\n📝 Demo Accounts:');
    console.log('👨‍🎓 Student: student@demo.com / password123');
    console.log('👨‍🏫 Coach: coach@demo.com / password123');

  } catch (error) {
    console.error('❌ Seeding failed:', error);
  } finally {
    await database.close();
  }
};

// Run seeding if this file is executed directly
if (require.main === module) {
  seedDatabase();
}

module.exports = seedDatabase;