# Database Setup for Activity Invites & Notifications

To enable the invite-only activity feature and notifications system, you need to set up the required tables in your Supabase database.

## Setup Instructions

1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Copy and paste the contents of `activity_invites.sql`
4. Run the query

This will create:

- The `activity_invites` table with proper foreign key relationships
- Indexes for performance
- Row Level Security (RLS) policies for data protection

## Notifications System

The notifications system uses the existing `notifications` table with these types:

- `mate_request` - New mate requests
- `mate_accepted` - When someone accepts your mate request
- `activity_invite` - Activity invitations
- `activity_joined` - When someone joins your activity
- `activity_left` - When someone leaves your activity
- `activity_reminder` - Reminders for upcoming activities

### Update Notification Types

If you encounter an error about `activity_left` not being allowed, run `update_notification_types.sql` to update the database constraint to include all notification types.

### Testing Notifications

Use `sample_notifications.sql` to create test notifications:

1. Update the UUIDs with actual user/activity IDs from your database
2. Run the script in Supabase SQL Editor

## How it Works

### Activity Invites

When a user creates an invite-only activity:

1. The activity is created with `visibility = 'invite_only'`
2. Invitations are created in the `activity_invites` table for each selected friend
3. Only invited users (and the creator) can see the activity in their feed
4. Friends can later accept/decline invitations (to be implemented)

### Notifications

- Real-time notifications appear in the top-right bell icon
- Dropdown shows recent notifications with read/unread status
- Clicking notifications navigates to relevant pages
- Mark as read functionality
- Real-time updates via Supabase subscriptions

## Future Enhancements

- Notification system for new invitations
- Accept/decline invitation UI
- Remove invitations feature
- Invitation expiry
- Push notifications
- Email notifications
