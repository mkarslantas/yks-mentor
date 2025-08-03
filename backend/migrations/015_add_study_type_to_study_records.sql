-- Add study_type column to study_records table
ALTER TABLE study_records ADD COLUMN study_type VARCHAR(50) DEFAULT 'konu_calismasi' CHECK (study_type IN ('konu_calismasi', 'soru_cozumu', 'tekrar', 'deneme_sinavi'));

-- Update existing records to have appropriate study_type based on questions_solved
UPDATE study_records 
SET study_type = CASE 
  WHEN questions_solved > 0 THEN 'soru_cozumu'
  ELSE 'konu_calismasi'
END
WHERE study_type IS NULL OR study_type = 'konu_calismasi';

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_study_records_study_type ON study_records(study_type);