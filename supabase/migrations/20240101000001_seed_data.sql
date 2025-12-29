-- Seed data for ThreadSign MVP
-- Mock Reddit data for development (before Reddit API approval)

-- Seed topics
INSERT INTO topics (key, label) VALUES
  ('devtools', 'Developer Tools'),
  ('health', 'Health & Wellness'),
  ('productivity', 'Productivity'),
  ('finance', 'Finance'),
  ('education', 'Education')
ON CONFLICT (key) DO NOTHING;

-- Seed subreddits
INSERT INTO subreddits (name, is_active) VALUES
  ('r/programming', true),
  ('r/webdev', true),
  ('r/startups', true),
  ('r/entrepreneur', true),
  ('r/productivity', true),
  ('r/personalfinance', true),
  ('r/learnprogramming', true)
ON CONFLICT (name) DO NOTHING;

