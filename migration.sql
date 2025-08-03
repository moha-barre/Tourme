-- Migration to support participants without user accounts
-- This migration updates the participants and matches tables

-- Step 1: Add display_name column to participants table
ALTER TABLE participants ADD COLUMN display_name TEXT;

-- Step 2: Update existing participants to have display_name
-- For participants with user_id, use the username from profiles
UPDATE participants 
SET display_name = (
  SELECT username 
  FROM profiles 
  WHERE profiles.id = participants.user_id
)
WHERE user_id IS NOT NULL;

-- Step 3: For participants without user_id, use team_name as display_name
UPDATE participants 
SET display_name = COALESCE(team_name, 'Unknown Player')
WHERE user_id IS NULL;

-- Step 4: Make display_name NOT NULL after populating it
ALTER TABLE participants ALTER COLUMN display_name SET NOT NULL;

-- Step 5: Add unique constraint on tournament_id and display_name
ALTER TABLE participants ADD CONSTRAINT unique_tournament_display_name UNIQUE (tournament_id, display_name);

-- Step 6: Update matches table to reference participants instead of profiles
-- First, create a temporary column
ALTER TABLE matches ADD COLUMN player1_participant_id UUID;
ALTER TABLE matches ADD COLUMN player2_participant_id UUID;
ALTER TABLE matches ADD COLUMN winner_participant_id UUID;

-- Step 7: Populate the new columns based on existing user_id references
UPDATE matches 
SET player1_participant_id = (
  SELECT id 
  FROM participants 
  WHERE participants.user_id = matches.player1_id 
  AND participants.tournament_id = matches.tournament_id
)
WHERE player1_id IS NOT NULL;

UPDATE matches 
SET player2_participant_id = (
  SELECT id 
  FROM participants 
  WHERE participants.user_id = matches.player2_id 
  AND participants.tournament_id = matches.tournament_id
)
WHERE player2_id IS NOT NULL;

UPDATE matches 
SET winner_participant_id = (
  SELECT id 
  FROM participants 
  WHERE participants.user_id = matches.winner_id 
  AND participants.tournament_id = matches.tournament_id
)
WHERE winner_id IS NOT NULL;

-- Step 8: Drop the old columns and rename the new ones
ALTER TABLE matches DROP COLUMN player1_id;
ALTER TABLE matches DROP COLUMN player2_id;
ALTER TABLE matches DROP COLUMN winner_id;

ALTER TABLE matches RENAME COLUMN player1_participant_id TO player1_id;
ALTER TABLE matches RENAME COLUMN player2_participant_id TO player2_id;
ALTER TABLE matches RENAME COLUMN winner_participant_id TO winner_id;

-- Step 9: Add foreign key constraints to participants table
ALTER TABLE matches 
ADD CONSTRAINT fk_matches_player1_participant 
FOREIGN KEY (player1_id) REFERENCES participants(id) ON DELETE SET NULL;

ALTER TABLE matches 
ADD CONSTRAINT fk_matches_player2_participant 
FOREIGN KEY (player2_id) REFERENCES participants(id) ON DELETE SET NULL;

ALTER TABLE matches 
ADD CONSTRAINT fk_matches_winner_participant 
FOREIGN KEY (winner_id) REFERENCES participants(id) ON DELETE SET NULL;

-- Step 10: Update RLS policies for participants to allow tournament admins to manage them
DROP POLICY IF EXISTS "Tournament admins can manage participants" ON participants;

CREATE POLICY "Tournament admins can manage participants" ON participants
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM tournaments 
      WHERE tournaments.id = participants.tournament_id 
      AND tournaments.admin_id = auth.uid()
    )
  );

-- Step 11: Update the unique constraint on participants to allow multiple participants without user_id
-- First drop the old constraint
ALTER TABLE participants DROP CONSTRAINT IF EXISTS unique_tournament_user_id;

-- Create new constraint that only applies when user_id is not null
CREATE UNIQUE INDEX unique_tournament_user_id 
ON participants (tournament_id, user_id) 
WHERE user_id IS NOT NULL; 