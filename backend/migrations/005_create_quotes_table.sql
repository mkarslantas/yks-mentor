-- Create quotes table for motivational quotes
CREATE TABLE quotes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  author VARCHAR(255) NOT NULL,
  quote_en TEXT NOT NULL,
  quote_tr TEXT NOT NULL,
  category VARCHAR(100) DEFAULT 'motivation',
  is_active BOOLEAN DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create index for faster random selection
CREATE INDEX idx_quotes_active ON quotes(is_active);

-- Add trigger for updated_at
CREATE TRIGGER update_quotes_updated_at 
  AFTER UPDATE ON quotes
  BEGIN
    UPDATE quotes SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
  END;