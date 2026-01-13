-- Update notifications table to support activity_left type
-- Run this in your Supabase SQL Editor

-- First, check the current constraint
SELECT conname, pg_get_constraintdef(oid) 
FROM pg_constraint 
WHERE conrelid = 'notifications'::regclass 
AND contype = 'c';

-- Drop the existing check constraint on type column
ALTER TABLE notifications 
DROP CONSTRAINT IF EXISTS notifications_type_check;

-- Add updated constraint that includes activity_left
ALTER TABLE notifications 
ADD CONSTRAINT notifications_type_check 
CHECK (type IN (
    'mate_request', 
    'mate_accepted', 
    'activity_invite', 
    'activity_joined', 
    'activity_left', 
    'activity_reminder'
));

-- Verify the constraint was updated
SELECT conname, pg_get_constraintdef(oid) 
FROM pg_constraint 
WHERE conrelid = 'notifications'::regclass 
AND contype = 'c';
