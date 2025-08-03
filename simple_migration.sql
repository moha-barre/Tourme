-- Simple migration to support participants without user accounts
-- This migration updates the participants table to allow participants without user_id

-- Step 1: Add display_name column to participants table (if it doesn't exist)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'participants' AND column_name = 'display_name') THEN
        ALTER TABLE participants ADD COLUMN display_name TEXT;
    END IF;
END $$;

-- Step 2: Update existing participants to have display_name
UPDATE participants 
SET display_name = (
  SELECT username 
  FROM profiles 
  WHERE profiles.id = participants.user_id
)
WHERE user_id IS NOT NULL AND display_name IS NULL;

-- Step 3: For participants without user_id, use team_name as display_name
UPDATE participants 
SET display_name = COALESCE(team_name, 'Unknown Player')
WHERE user_id IS NULL AND display_name IS NULL;

-- Step 4: Make display_name NOT NULL after populating it
ALTER TABLE participants ALTER COLUMN display_name SET NOT NULL;

-- Step 5: Make user_id nullable
ALTER TABLE participants ALTER COLUMN user_id DROP NOT NULL;

-- Step 6: Add unique constraint on tournament_id and display_name (if it doesn't exist)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'unique_tournament_display_name') THEN
        ALTER TABLE participants ADD CONSTRAINT unique_tournament_display_name UNIQUE (tournament_id, display_name);
    END IF;
END $$;

-- Step 7: Update the unique constraint on user_id to only apply when user_id is not null
-- First drop the old constraint if it exists
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'unique_tournament_user_id') THEN
        ALTER TABLE participants DROP CONSTRAINT unique_tournament_user_id;
    END IF;
END $$;

-- Create new constraint that only applies when user_id is not null
CREATE UNIQUE INDEX unique_tournament_user_id 
ON participants (tournament_id, user_id) 
WHERE user_id IS NOT NULL;

-- Step 8: Update RLS policies for participants to allow tournament admins to manage them
DROP POLICY IF EXISTS "Tournament admins can manage participants" ON participants;

CREATE POLICY "Tournament admins can manage participants" ON participants
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM tournaments 
      WHERE tournaments.id = participants.tournament_id 
      AND tournaments.admin_id = auth.uid()
    )
  ); 