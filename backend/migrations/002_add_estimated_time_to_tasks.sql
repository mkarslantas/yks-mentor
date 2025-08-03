-- Add estimated_time column to tasks table
ALTER TABLE tasks ADD COLUMN estimated_time INTEGER DEFAULT 60;

-- Update existing tasks with estimated_time based on priority
UPDATE tasks SET estimated_time = 
  CASE 
    WHEN priority = 'high' THEN 120    -- 2 hours for high priority
    WHEN priority = 'medium' THEN 90   -- 1.5 hours for medium priority  
    WHEN priority = 'low' THEN 60      -- 1 hour for low priority
    ELSE 60
  END
WHERE estimated_time IS NULL OR estimated_time = 60;