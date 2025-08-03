-- Add time columns to tasks table for drag-and-drop functionality
ALTER TABLE tasks ADD COLUMN start_time DATETIME;
ALTER TABLE tasks ADD COLUMN end_time DATETIME;