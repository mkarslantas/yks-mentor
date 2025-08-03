const fs = require('fs');
const path = require('path');
const database = require('../src/config/database');

const runMigrations = async () => {
  try {
    console.log('Starting database migrations...');
    
    // Connect to database
    await database.connect();
    
    // Enable foreign keys first
    await database.run('PRAGMA foreign_keys = ON');
    console.log('✓ Foreign keys enabled');
    
    // Read migration file
    const migrationPath = path.join(__dirname, '001_initial_schema.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    // Execute the entire SQL as one command
    const db = database.getDb();
    await new Promise((resolve, reject) => {
      db.exec(migrationSQL, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
    
    console.log('✅ Database migrations completed successfully!');
    
    // Verify tables were created
    const tables = await database.all(`
      SELECT name FROM sqlite_master 
      WHERE type='table' AND name NOT LIKE 'sqlite_%'
      ORDER BY name
    `);
    
    console.log('📋 Created tables:');
    tables.forEach(table => {
      console.log(`  - ${table.name}`);
    });
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await database.close();
  }
};

// Run migrations if this file is executed directly
if (require.main === module) {
  runMigrations();
}

module.exports = runMigrations;