-- Update grade_level constraint to allow 9-13
-- SQLite doesn't support ALTER COLUMN, so we need to recreate the table

-- Start transaction
BEGIN TRANSACTION;

-- Create new student_profiles table with updated constraint
CREATE TABLE student_profiles_new (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  target_field VARCHAR(50) CHECK (target_field IN ('sayisal', 'esit_agirlik', 'sozel', 'dil')),
  target_university VARCHAR(255),
  target_department VARCHAR(255),
  exam_date DATE,
  coach_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  grade_level INTEGER CHECK (grade_level IN (9, 10, 11, 12, 13)),
  school_name VARCHAR(255),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Copy data from old table to new table
INSERT INTO student_profiles_new (id, user_id, target_field, target_university, target_department, exam_date, coach_id, grade_level, school_name, created_at, updated_at)
SELECT id, user_id, target_field, target_university, target_department, exam_date, coach_id, grade_level, school_name, created_at, updated_at
FROM student_profiles;

-- Drop old table
DROP TABLE student_profiles;

-- Rename new table to original name
ALTER TABLE student_profiles_new RENAME TO student_profiles;

-- Recreate indexes
CREATE INDEX IF NOT EXISTS idx_student_profiles_user_id ON student_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_student_profiles_coach_id ON student_profiles(coach_id);

-- Recreate trigger
CREATE TRIGGER IF NOT EXISTS update_student_profiles_updated_at 
  AFTER UPDATE ON student_profiles
  BEGIN
    UPDATE student_profiles SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
  END;

-- Commit transaction
COMMIT;