const fs = require('fs');
const path = require('path');
const database = require('../src/config/database');

const runAllMigrations = async () => {
  try {
    console.log('Starting all database migrations...');
    
    // Connect to database
    await database.connect();
    
    // Enable foreign keys first
    await database.run('PRAGMA foreign_keys = ON');
    console.log('✓ Foreign keys enabled');
    
    // Get all SQL files in migrations directory
    const migrationDir = __dirname;
    const files = fs.readdirSync(migrationDir)
      .filter(file => file.endsWith('.sql'))
      .sort(); // Alphabetical sort ensures numeric order
    
    console.log(`Found ${files.length} migration files:`);
    files.forEach(file => console.log(`  - ${file}`));
    
    // Execute each migration
    const db = database.getDb();
    for (const file of files) {
      console.log(`\n🔄 Running migration: ${file}`);
      const migrationPath = path.join(migrationDir, file);
      const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
      
      // Split by semicolon and execute each statement
      const statements = migrationSQL
        .split(';')
        .map(stmt => stmt.trim())
        .filter(stmt => stmt.length > 0);
      
      for (const statement of statements) {
        try {
          await database.run(statement);
        } catch (err) {
          // Ignore table already exists errors
          if (!err.message.includes('already exists')) {
            console.warn(`⚠️  Warning in ${file}: ${err.message}`);
          }
        }
      }
      
      console.log(`✅ Completed: ${file}`);
    }
    
    console.log('\n✅ All database migrations completed successfully!');
    
    // Verify tables were created
    const tables = await database.all(`
      SELECT name FROM sqlite_master 
      WHERE type='table' AND name NOT LIKE 'sqlite_%'
      ORDER BY name
    `);
    
    console.log('\n📋 Current tables:');
    tables.forEach(table => {
      console.log(`  - ${table.name}`);
    });
    
    // Show sample data count
    console.log('\n📊 Data counts:');
    const userCount = await database.get('SELECT COUNT(*) as count FROM users');
    console.log(`  - Users: ${userCount.count}`);
    
    const studyCount = await database.get('SELECT COUNT(*) as count FROM study_records');
    console.log(`  - Study records: ${studyCount.count}`);
    
    const examCount = await database.get('SELECT COUNT(*) as count FROM mock_exams');
    console.log(`  - Mock exams: ${examCount.count}`);
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await database.close();
  }
};

// Run migrations if this file is executed directly
if (require.main === module) {
  runAllMigrations();
}

module.exports = runAllMigrations;