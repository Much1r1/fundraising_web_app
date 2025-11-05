-- Fix timestamp issues in comments and notifications tables

-- Update comments table: set default for created_at and backfill existing NULL values
UPDATE comments 
SET created_at = NOW() 
WHERE created_at IS NULL;

ALTER TABLE comments 
ALTER COLUMN created_at SET DEFAULT NOW(),
ALTER COLUMN created_at SET NOT NULL;

-- Update notifications table: set default for created_at and backfill existing NULL values
UPDATE notifications 
SET created_at = NOW() 
WHERE created_at IS NULL;

ALTER TABLE notifications 
ALTER COLUMN created_at SET DEFAULT NOW(),
ALTER COLUMN created_at SET NOT NULL;