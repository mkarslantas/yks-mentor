const database = require('../src/config/database');
const logger = require('../src/utils/logger');

async function cleanDemoData() {
  try {
    console.log('🧹 Starting demo data cleanup...');
    
    // Clean demo users (keep admin users)
    const demoUsers = await database.all(`
      SELECT id, email FROM users 
      WHERE email LIKE '%test%' 
      OR email LIKE '%demo%' 
      OR email LIKE '%example%'
      OR name LIKE '%Test%'
      OR name LIKE '%Demo%'
    `);
    
    console.log(`Found ${demoUsers.length} demo users to clean`);
    
    for (const user of demoUsers) {
      console.log(`Cleaning user: ${user.email}`);
      
      // Delete related data first (foreign key constraints)
      await database.run('DELETE FROM tasks WHERE student_id = ? OR assigned_by = ?', [user.id, user.id]);
      await database.run('DELETE FROM study_records WHERE student_id = ?', [user.id]);
      await database.run('DELETE FROM mock_exams WHERE student_id = ?', [user.id]);
      await database.run('DELETE FROM student_profiles WHERE user_id = ?', [user.id]);
      await database.run('DELETE FROM refresh_tokens WHERE user_id = ?', [user.id]);
      await database.run('DELETE FROM notifications WHERE user_id = ?', [user.id]);
      
      // Finally delete the user
      await database.run('DELETE FROM users WHERE id = ?', [user.id]);
    }
    
    // Clean test tasks (tasks with test-related content)
    const testTasks = await database.run(`
      DELETE FROM tasks 
      WHERE title LIKE '%test%' 
      OR title LIKE '%demo%' 
      OR description LIKE '%test%'
      OR description LIKE '%demo%'
    `);
    
    console.log(`Cleaned ${testTasks.changes} test tasks`);
    
    // Clean test study records
    const testStudyRecords = await database.run(`
      DELETE FROM study_records 
      WHERE notes LIKE '%test%' 
      OR notes LIKE '%demo%'
    `);
    
    console.log(`Cleaned ${testStudyRecords.changes} test study records`);
    
    // Clean test mock exams
    const testMockExams = await database.run(`
      DELETE FROM mock_exams 
      WHERE title LIKE '%test%' 
      OR title LIKE '%demo%'
    `);
    
    console.log(`Cleaned ${testMockExams.changes} test mock exams`);
    
    // Vacuum database to reclaim space
    console.log('🗜️ Optimizing database...');
    await database.run('VACUUM');
    
    // Get final statistics
    const stats = await database.get(`
      SELECT 
        (SELECT COUNT(*) FROM users) as users,
        (SELECT COUNT(*) FROM tasks) as tasks,
        (SELECT COUNT(*) FROM study_records) as study_records,
        (SELECT COUNT(*) FROM mock_exams) as mock_exams
    `);
    
    console.log('✅ Demo data cleanup completed!');
    console.log('📊 Remaining data:');
    console.log(`  - Users: ${stats.users}`);
    console.log(`  - Tasks: ${stats.tasks}`);
    console.log(`  - Study Records: ${stats.study_records}`);
    console.log(`  - Mock Exams: ${stats.mock_exams}`);
    
    logger.info('Demo data cleanup completed', stats);
    
  } catch (error) {
    console.error('❌ Error cleaning demo data:', error);
    logger.error('Demo data cleanup failed', { error: error.message });
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  cleanDemoData()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = cleanDemoData;