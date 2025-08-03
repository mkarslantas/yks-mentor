-- Add student notes and progress tracking to tasks table
ALTER TABLE tasks ADD COLUMN student_notes TEXT;
ALTER TABLE tasks ADD COLUMN questions_solved INTEGER DEFAULT 0;
ALTER TABLE tasks ADD COLUMN topics_studied TEXT;
ALTER TABLE tasks ADD COLUMN study_duration INTEGER DEFAULT 0; -- actual study time in minutes