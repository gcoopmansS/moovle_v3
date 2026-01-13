-- Sample notifications for testing
-- Run this in your Supabase SQL Editor to create test notifications

-- Note: Replace the user_id and related_user_id with actual UUIDs from your profiles table

-- Mate request notification
INSERT INTO notifications (user_id, type, title, message, related_user_id, is_read, created_at) VALUES 
('YOUR_USER_ID_HERE', 'mate_request', 'New mate request', 'John Doe wants to be your mate', 'RELATED_USER_ID_HERE', false, NOW() - INTERVAL '1 hour');

-- Activity invite notification
INSERT INTO notifications (user_id, type, title, message, related_user_id, related_activity_id, is_read, created_at) VALUES 
('YOUR_USER_ID_HERE', 'activity_invite', 'Activity invitation', 'You''ve been invited to join "Morning Tennis Session"', 'RELATED_USER_ID_HERE', 'ACTIVITY_ID_HERE', false, NOW() - INTERVAL '30 minutes');

-- Mate accepted notification
INSERT INTO notifications (user_id, type, title, message, related_user_id, is_read, created_at) VALUES 
('YOUR_USER_ID_HERE', 'mate_accepted', 'Mate request accepted', 'Sarah Smith accepted your mate request', 'RELATED_USER_ID_HERE', true, NOW() - INTERVAL '2 hours');

-- Activity joined notification
INSERT INTO notifications (user_id, type, title, message, related_user_id, related_activity_id, is_read, created_at) VALUES 
('YOUR_USER_ID_HERE', 'activity_joined', 'Someone joined your activity', 'Mike Johnson joined your "Evening Run" activity', 'RELATED_USER_ID_HERE', 'ACTIVITY_ID_HERE', false, NOW() - INTERVAL '15 minutes');

-- Activity reminder notification
INSERT INTO notifications (user_id, type, title, message, related_activity_id, is_read, created_at) VALUES 
('YOUR_USER_ID_HERE', 'activity_reminder', 'Activity reminder', 'Your "Tennis Match" activity starts in 1 hour', 'ACTIVITY_ID_HERE', false, NOW() - INTERVAL '5 minutes');
