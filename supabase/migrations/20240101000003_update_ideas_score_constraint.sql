-- Update ideas table CHECK constraint to reflect that only ideas with score >= 60 are stored
-- This aligns with the PRD requirement that only ideas with average score >= 60 are stored
-- The application code enforces this, and the constraint documents the business rule at the database level

-- Drop existing CHECK constraint(s) on the score column if they exist
-- PostgreSQL auto-generates constraint names, so we find and drop by checking the constraint definition
DO $$
DECLARE
  constraint_name TEXT;
BEGIN
  -- Find CHECK constraints on the score column
  FOR constraint_name IN
    SELECT conname 
    FROM pg_constraint 
    WHERE conrelid = 'ideas'::regclass
      AND contype = 'c'
      AND pg_get_constraintdef(oid) LIKE '%score%'
  LOOP
    EXECUTE format('ALTER TABLE ideas DROP CONSTRAINT IF EXISTS %I', constraint_name);
  END LOOP;
END $$;

-- Add new constraint: score must be >= 60 and <= 100
-- This ensures only ideas meeting the quality threshold are stored
-- Check if constraint already exists to make migration idempotent
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conrelid = 'ideas'::regclass
      AND conname = 'ideas_score_check'
  ) THEN
    ALTER TABLE ideas ADD CONSTRAINT ideas_score_check CHECK (score >= 60 AND score <= 100);
  END IF;
END $$;

-- Note: This migration assumes existing data already meets the constraint (score >= 60)
-- If there are existing ideas with score < 60, they should be cleaned up first with:
-- DELETE FROM ideas WHERE score < 60;
-- The application code only inserts ideas with score >= 60, so this is safe for new data

