# Participant Management Feature

## Overview

This feature allows tournament creators (admins) to add participants to their tournaments without requiring the participants to have user accounts. This makes it easy to quickly start tournaments with friends or local players.

## Features

### For Tournament Admins

1. **Add Participants by Name**: Tournament admins can add participants using just their names
2. **Optional Team Names**: Participants can have optional team names for team-based tournaments
3. **Bulk Add**: Add multiple participants at once through a user-friendly modal
4. **Remove Participants**: Remove participants from tournaments (only when tournament is in 'open' status)
5. **View All Participants**: See all participants in an organized list with pending and accepted sections

### UI Components

- **Add Participant Modal**: A modal dialog for adding multiple participants at once
- **Participant List**: Shows pending and accepted participants with management actions
- **Remove Button**: Quick remove button for accepted participants

## Database Changes

### Participants Table
- Added `display_name` field (required) for participant names
- Made `user_id` optional (nullable)
- Added unique constraint on `(tournament_id, display_name)`
- Updated unique constraint on `(tournament_id, user_id)` to only apply when user_id is not null

### Matches Table
- Updated foreign key references from `profiles(id)` to `participants(id)`
- Now matches reference participant IDs instead of user IDs

## Usage

### Adding Participants

1. Go to the tournament management page (`/tournaments/manage/{id}`)
2. Click the "Add Participants" button
3. Fill in participant names and optional team names
4. Click "Add Participants" to save

### Managing Participants

- **Pending Participants**: Can be accepted or rejected
- **Accepted Participants**: Can be removed (if tournament is still open)
- **View Details**: See participant names, team names, and user IDs (if applicable)

## Migration

Run the `migration.sql` script to update your existing database:

```sql
-- Run the migration script
\i migration.sql
```

This will:
1. Add the `display_name` column to participants
2. Update existing participants with display names
3. Update matches to reference participants instead of users
4. Add appropriate constraints and policies

## Technical Details

### Participant Structure
```typescript
interface Participant {
  id: string
  tournament_id: string
  user_id?: string  // Optional - only for registered users
  display_name: string  // Required - participant's display name
  team_name?: string   // Optional - team name
  status: 'pending' | 'accepted' | 'rejected' | 'withdrawn'
  created_at: string
  updated_at: string
}
```

### Bracket Generation
- Bracket generator now uses participant IDs instead of user IDs
- Supports both registered users and anonymous participants
- Maintains proper seeding and tournament progression

### Security
- Tournament admins can manage participants for their tournaments
- RLS policies ensure proper access control
- Unique constraints prevent duplicate participants

## Benefits

1. **Quick Setup**: Start tournaments immediately without waiting for user registrations
2. **Flexibility**: Support both registered users and anonymous participants
3. **User-Friendly**: Simple interface for adding multiple participants
4. **Backward Compatible**: Existing tournaments with registered users continue to work
5. **Scalable**: Supports large tournaments with many participants 