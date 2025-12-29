-- Add processed_at column to reddit_posts table for LLM processing tracking
ALTER TABLE reddit_posts
ADD COLUMN IF NOT EXISTS processed_at TIMESTAMPTZ;

-- Add index for efficient querying of unprocessed posts
CREATE INDEX IF NOT EXISTS idx_reddit_posts_processed_at ON reddit_posts(processed_at)
WHERE processed_at IS NULL;

