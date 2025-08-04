# Tournament Matches Functionality

## Overview

The tournament matches functionality allows users to view and manage tournament brackets and individual matches. This includes:

- Viewing all matches for a tournament
- Filtering matches by status (pending, live, completed)
- Admin controls for updating match results
- Real-time match status updates

## Routes

### Tournament Matches Route
- **URL**: `/tournaments/{id}/matches`
- **File**: `app/routes/tournaments/$id/matches.tsx`
- **Description**: Displays all matches for a specific tournament with filtering and admin controls

## Features

### 1. Match Display
- **Enhanced Match Cards**: Each match is displayed in a card format showing:
  - Player information (name, team, avatar)
  - Match status with visual indicators
  - Scores (when available)
  - Round and match number
  - Winner indicators (crown emoji)

### 2. Status Management
- **Pending**: Matches that haven't started yet
- **Live**: Matches currently in progress (with pulsing indicator)
- **Completed**: Matches with final results

### 3. Admin Controls
- **Start Match**: Admins can start pending matches
- **Update Results**: Admins can set winners and scores
- **Real-time Updates**: Changes are immediately reflected in the UI

### 4. Filtering
- Filter by match status (All, Pending, Live, Completed)
- Quick stats showing counts for each status

### 5. Navigation
- "View Matches" button on tournament detail page
- Back navigation to tournament details
- Integration with tournament management

## Database Schema

The matches table includes:
```sql
CREATE TABLE matches (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tournament_id UUID REFERENCES tournaments(id) ON DELETE CASCADE NOT NULL,
  round INTEGER NOT NULL,
  match_number INTEGER NOT NULL,
  player1_id UUID REFERENCES participants(id) ON DELETE SET NULL,
  player2_id UUID REFERENCES participants(id) ON DELETE SET NULL,
  winner_id UUID REFERENCES participants(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed')),
  score1 INTEGER,
  score2 INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Components

### MatchCard Component
- Displays individual match information
- Handles admin controls for match management
- Shows player avatars and winner indicators
- Responsive design for different screen sizes

### StatusBadge Component
- Visual indicator for match status
- Color-coded status display
- Animated elements for live matches

## Integration Points

### Tournament Detail Page
- Added "View Matches" button
- Shows match count in button text
- Quick stats overview section
- Direct navigation to matches page

### Bracket Generator
- Matches are generated using the bracket algorithm
- Proper seeding ensures fair tournament progression
- Supports single elimination brackets

## Security

- Row Level Security (RLS) policies ensure only tournament admins can modify matches
- Public read access for viewing matches
- Proper authentication checks for admin actions

## Future Enhancements

Potential improvements could include:
- Real-time updates using WebSockets
- Match notifications
- Advanced filtering and sorting
- Match history and statistics
- Tournament progression tracking
- Automated winner advancement to next rounds 