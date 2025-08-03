-- Add missing columns to mock_exams table
ALTER TABLE mock_exams ADD COLUMN ayt_category VARCHAR(10) CHECK (ayt_category IN ('SAY', 'SOZ', 'EA', 'DIL'));

-- Create mock_exam_results table
CREATE TABLE IF NOT EXISTS mock_exam_results (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  exam_id INTEGER NOT NULL REFERENCES mock_exams(id) ON DELETE CASCADE,
  subject VARCHAR(50) NOT NULL,
  correct_answers INTEGER NOT NULL CHECK (correct_answers >= 0),
  wrong_answers INTEGER NOT NULL CHECK (wrong_answers >= 0),
  empty_answers INTEGER NOT NULL CHECK (empty_answers >= 0),
  net_score DECIMAL(5,2) NOT NULL CHECK (net_score >= 0),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Sample study records for testing statistics
INSERT INTO study_records (student_id, date, subject, topic, duration_minutes, questions_solved, correct_answers, wrong_answers, empty_answers, mood) VALUES
-- Matematik çalışmaları
(1, '2024-07-25', 'matematik', 'Fonksiyonlar', 90, 25, 20, 4, 1, 'normal'),
(1, '2024-07-26', 'matematik', 'Türev', 120, 30, 25, 3, 2, 'normal'),
(1, '2024-07-27', 'matematik', 'İntegral', 75, 20, 15, 4, 1, 'normal'),
(1, '2024-07-28', 'matematik', 'Limit', 105, 28, 22, 5, 1, 'normal'),
(1, '2024-07-29', 'matematik', 'Fonksiyonlar', 85, 24, 18, 5, 1, 'normal'),
(1, '2024-07-30', 'matematik', 'Türev', 110, 32, 28, 3, 1, 'very_good'),
(1, '2024-07-31', 'matematik', 'İntegral', 95, 26, 21, 4, 1, 'normal'),
(1, '2024-08-01', 'matematik', 'Limit', 130, 35, 30, 4, 1, 'very_good'),

-- Fizik çalışmaları
(1, '2024-07-25', 'fizik', 'Mekanik', 60, 18, 14, 3, 1, 'normal'),
(1, '2024-07-26', 'fizik', 'Elektrik', 75, 22, 18, 3, 1, 'normal'),
(1, '2024-07-27', 'fizik', 'Manyetizma', 45, 15, 12, 2, 1, 'normal'),
(1, '2024-07-29', 'fizik', 'Optik', 80, 20, 16, 3, 1, 'normal'),
(1, '2024-07-30', 'fizik', 'Dalga', 70, 19, 15, 3, 1, 'normal'),
(1, '2024-08-01', 'fizik', 'Modern Fizik', 85, 23, 19, 3, 1, 'very_good'),

-- Kimya çalışmaları
(1, '2024-07-26', 'kimya', 'Atomun Yapısı', 50, 16, 13, 2, 1, 'normal'),
(1, '2024-07-28', 'kimya', 'Periyodik Sistem', 65, 20, 16, 3, 1, 'normal'),
(1, '2024-07-30', 'kimya', 'Kimyasal Bağlar', 55, 18, 14, 3, 1, 'normal'),
(1, '2024-08-01', 'kimya', 'Asit-Baz', 70, 22, 18, 3, 1, 'normal'),

-- Türkçe çalışmaları
(1, '2024-07-25', 'turkce', 'Dil Bilgisi', 45, 12, 10, 2, 0, 'normal'),
(1, '2024-07-27', 'turkce', 'Paragraf', 40, 10, 8, 2, 0, 'normal'),
(1, '2024-07-29', 'turkce', 'Sözcükte Anlam', 35, 8, 7, 1, 0, 'normal'),
(1, '2024-07-31', 'turkce', 'Cümlede Anlam', 50, 14, 12, 2, 0, 'normal'),

-- Biyoloji çalışmaları
(1, '2024-07-27', 'biyoloji', 'Hücre', 55, 17, 14, 2, 1, 'normal'),
(1, '2024-07-29', 'biyoloji', 'Metabolizma', 60, 19, 15, 3, 1, 'normal'),
(1, '2024-07-31', 'biyoloji', 'Kalıtım', 50, 16, 13, 2, 1, 'normal'),

-- Tarih çalışmaları
(1, '2024-07-28', 'tarih', 'Osmanlı Tarihi', 40, 12, 10, 2, 0, 'normal'),
(1, '2024-07-30', 'tarih', 'Cumhuriyet Tarihi', 45, 14, 11, 3, 0, 'normal'),

-- Coğrafya çalışmaları
(1, '2024-07-26', 'cografya', 'Fiziki Coğrafya', 35, 10, 8, 2, 0, 'normal'),
(1, '2024-07-28', 'cografya', 'Beşeri Coğrafya', 40, 12, 9, 3, 0, 'normal');

-- Sample mock exams
INSERT INTO mock_exams (student_id, exam_type, exam_date, ayt_category) VALUES
(1, 'TYT', '2024-07-20', NULL),
(1, 'TYT', '2024-07-27', NULL),
(1, 'AYT', '2024-07-21', 'SAY'),
(1, 'AYT', '2024-07-28', 'SAY'),
(1, 'TYT', '2024-08-03', NULL);

-- Sample mock exam results
INSERT INTO mock_exam_results (exam_id, subject, correct_answers, wrong_answers, empty_answers, net_score) VALUES
-- TYT Exam 1 (2024-07-20)
(1, 'matematik', 28, 8, 4, 26.0),
(1, 'turkce', 32, 6, 2, 30.5),
(1, 'fizik', 12, 5, 0, 10.75),
(1, 'kimya', 11, 4, 2, 10.0),
(1, 'biyoloji', 10, 3, 0, 9.25),
(1, 'tarih', 8, 2, 0, 7.5),
(1, 'cografya', 7, 3, 0, 6.25),
(1, 'felsefe', 9, 1, 0, 8.75),

-- TYT Exam 2 (2024-07-27)
(2, 'matematik', 30, 6, 4, 28.5),
(2, 'turkce', 34, 4, 2, 33.0),
(2, 'fizik', 13, 4, 0, 12.0),
(2, 'kimya', 12, 3, 2, 11.25),
(2, 'biyoloji', 11, 2, 0, 10.5),
(2, 'tarih', 9, 1, 0, 8.75),
(2, 'cografya', 8, 2, 0, 7.5),
(2, 'felsefe', 10, 0, 0, 10.0),

-- AYT SAY Exam 1 (2024-07-21)
(3, 'matematik', 25, 10, 5, 22.5),
(3, 'fizik', 18, 8, 4, 16.0),
(3, 'kimya', 15, 5, 3, 13.75),
(3, 'biyoloji', 16, 7, 3, 14.25),

-- AYT SAY Exam 2 (2024-07-28)
(4, 'matematik', 28, 8, 4, 26.0),
(4, 'fizik', 20, 6, 4, 18.5),
(4, 'kimya', 17, 4, 2, 16.0),
(4, 'biyoloji', 18, 5, 3, 16.75),

-- TYT Exam 3 (2024-08-03)
(5, 'matematik', 32, 4, 4, 31.0),
(5, 'turkce', 36, 3, 1, 35.25),
(5, 'fizik', 14, 3, 0, 13.25),
(5, 'kimya', 13, 2, 2, 12.5),
(5, 'biyoloji', 12, 1, 0, 11.75),
(5, 'tarih', 10, 0, 0, 10.0),
(5, 'cografya', 9, 1, 0, 8.75),
(5, 'felsefe', 11, 0, 0, 11.0);