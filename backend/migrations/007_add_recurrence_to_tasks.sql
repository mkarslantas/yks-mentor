-- Add recurrence support to tasks table

ALTER TABLE tasks ADD COLUMN recurrence_type VARCHAR(20) DEFAULT 'none' CHECK (recurrence_type IN ('none', 'daily', 'weekly', 'monthly'));
ALTER TABLE tasks ADD COLUMN recurrence_interval INTEGER DEFAULT 1 CHECK (recurrence_interval >= 1);
ALTER TABLE tasks ADD COLUMN recurrence_end_date DATE;
ALTER TABLE tasks ADD COLUMN parent_task_id INTEGER REFERENCES tasks(id) ON DELETE CASCADE;

-- Create index for parent task relationships
CREATE INDEX IF NOT EXISTS idx_tasks_parent_task_id ON tasks(parent_task_id);
CREATE INDEX IF NOT EXISTS idx_tasks_recurrence_type ON tasks(recurrence_type);

-- Add trigger to update updated_at when recurrence fields are modified
CREATE TRIGGER IF NOT EXISTS update_tasks_recurrence_updated_at 
  AFTER UPDATE OF recurrence_type, recurrence_interval, recurrence_end_date ON tasks
  BEGIN
    UPDATE tasks SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
  END;