-- YKS Mentor Database Schema
-- SQLite Implementation

-- Enable foreign key constraints
PRAGMA foreign_keys = ON;

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL CHECK (role IN ('student', 'coach', 'parent')),
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Student profiles table
CREATE TABLE IF NOT EXISTS student_profiles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  target_field VARCHAR(50) CHECK (target_field IN ('sayisal', 'esit_agirlik', 'sozel', 'dil')),
  target_university VARCHAR(255),
  target_department VARCHAR(255),
  exam_date DATE,
  coach_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  grade_level INTEGER CHECK (grade_level IN (11, 12)),
  school_name VARCHAR(255),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Study records table
CREATE TABLE IF NOT EXISTS study_records (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  student_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  subject VARCHAR(100) NOT NULL,
  topic VARCHAR(255),
  duration_minutes INTEGER NOT NULL CHECK (duration_minutes > 0),
  questions_solved INTEGER DEFAULT 0 CHECK (questions_solved >= 0),
  correct_answers INTEGER DEFAULT 0 CHECK (correct_answers >= 0),
  wrong_answers INTEGER DEFAULT 0 CHECK (wrong_answers >= 0),
  empty_answers INTEGER DEFAULT 0 CHECK (empty_answers >= 0),
  notes TEXT,
  mood VARCHAR(50) CHECK (mood IN ('motivated', 'normal', 'tired', 'stressed')),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Weekly plans table
CREATE TABLE IF NOT EXISTS weekly_plans (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  student_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  week_start DATE NOT NULL,
  week_end DATE NOT NULL,
  plan_data TEXT NOT NULL, -- JSON string
  created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'completed')),
  completion_rate DECIMAL(5,2) DEFAULT 0 CHECK (completion_rate >= 0 AND completion_rate <= 100),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Mock exams table
CREATE TABLE IF NOT EXISTS mock_exams (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  student_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  exam_type VARCHAR(10) NOT NULL CHECK (exam_type IN ('TYT', 'AYT')),
  exam_date DATE NOT NULL,
  exam_name VARCHAR(255),
  -- TYT nets
  turkce_net DECIMAL(5,2) CHECK (turkce_net >= 0 AND turkce_net <= 40),
  matematik_net DECIMAL(5,2) CHECK (matematik_net >= 0 AND matematik_net <= 30),
  sosyal_net DECIMAL(5,2) CHECK (sosyal_net >= 0 AND sosyal_net <= 20),
  fen_net DECIMAL(5,2) CHECK (fen_net >= 0 AND fen_net <= 20),
  -- AYT nets (optional)
  edebiyat_net DECIMAL(5,2) CHECK (edebiyat_net >= 0 AND edebiyat_net <= 24),
  matematik_ayt_net DECIMAL(5,2) CHECK (matematik_ayt_net >= 0 AND matematik_ayt_net <= 40),
  fizik_net DECIMAL(5,2) CHECK (fizik_net >= 0 AND fizik_net <= 14),
  kimya_net DECIMAL(5,2) CHECK (kimya_net >= 0 AND kimya_net <= 13),
  biyoloji_net DECIMAL(5,2) CHECK (biyoloji_net >= 0 AND biyoloji_net <= 13),
  tarih_net DECIMAL(5,2) CHECK (tarih_net >= 0 AND tarih_net <= 21),
  cografya_net DECIMAL(5,2) CHECK (cografya_net >= 0 AND cografya_net <= 17),
  -- Scores
  tyt_score DECIMAL(6,2),
  ayt_score DECIMAL(6,2),
  ranking INTEGER,
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tasks table
CREATE TABLE IF NOT EXISTS tasks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  student_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  assigned_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  subject VARCHAR(100),
  due_date DATE,
  priority VARCHAR(10) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'overdue')),
  completed_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Refresh tokens table (for JWT)
CREATE TABLE IF NOT EXISTS refresh_tokens (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token VARCHAR(500) NOT NULL,
  expires_at DATETIME NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(50) DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'error')),
  read BOOLEAN DEFAULT FALSE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_student_profiles_user_id ON student_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_student_profiles_coach_id ON student_profiles(coach_id);
CREATE INDEX IF NOT EXISTS idx_study_records_student_id ON study_records(student_id);
CREATE INDEX IF NOT EXISTS idx_study_records_date ON study_records(date);
CREATE INDEX IF NOT EXISTS idx_study_records_subject ON study_records(subject);
CREATE INDEX IF NOT EXISTS idx_weekly_plans_student_id ON weekly_plans(student_id);
CREATE INDEX IF NOT EXISTS idx_weekly_plans_week_start ON weekly_plans(week_start);
CREATE INDEX IF NOT EXISTS idx_mock_exams_student_id ON mock_exams(student_id);
CREATE INDEX IF NOT EXISTS idx_mock_exams_exam_date ON mock_exams(exam_date);
CREATE INDEX IF NOT EXISTS idx_tasks_student_id ON tasks(student_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user_id ON refresh_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_token ON refresh_tokens(token);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);

-- Create triggers for updated_at columns
CREATE TRIGGER IF NOT EXISTS update_users_updated_at 
  AFTER UPDATE ON users
  BEGIN
    UPDATE users SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
  END;

CREATE TRIGGER IF NOT EXISTS update_student_profiles_updated_at 
  AFTER UPDATE ON student_profiles
  BEGIN
    UPDATE student_profiles SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
  END;

CREATE TRIGGER IF NOT EXISTS update_study_records_updated_at 
  AFTER UPDATE ON study_records
  BEGIN
    UPDATE study_records SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
  END;

CREATE TRIGGER IF NOT EXISTS update_weekly_plans_updated_at 
  AFTER UPDATE ON weekly_plans
  BEGIN
    UPDATE weekly_plans SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
  END;

CREATE TRIGGER IF NOT EXISTS update_mock_exams_updated_at 
  AFTER UPDATE ON mock_exams
  BEGIN
    UPDATE mock_exams SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
  END;

CREATE TRIGGER IF NOT EXISTS update_tasks_updated_at 
  AFTER UPDATE ON tasks
  BEGIN
    UPDATE tasks SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
  END;

-- Create trigger to automatically set completed_at when task status changes to completed
CREATE TRIGGER IF NOT EXISTS set_task_completed_at 
  AFTER UPDATE OF status ON tasks
  WHEN NEW.status = 'completed' AND OLD.status != 'completed'
  BEGIN
    UPDATE tasks SET completed_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
  END;

-- Create trigger to validate answer counts in study records
CREATE TRIGGER IF NOT EXISTS validate_study_record_answers 
  BEFORE INSERT ON study_records
  WHEN NEW.questions_solved > 0 AND (NEW.correct_answers + NEW.wrong_answers + NEW.empty_answers) > NEW.questions_solved
  BEGIN
    SELECT RAISE(ABORT, 'Toplam cevap sayısı çözülen soru sayısından fazla olamaz');
  END;

CREATE TRIGGER IF NOT EXISTS validate_study_record_answers_update 
  BEFORE UPDATE ON study_records
  WHEN NEW.questions_solved > 0 AND (NEW.correct_answers + NEW.wrong_answers + NEW.empty_answers) > NEW.questions_solved
  BEGIN
    SELECT RAISE(ABORT, 'Toplam cevap sayısı çözülen soru sayısından fazla olamaz');
  END;