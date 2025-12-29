-- Seed script with mock Reddit data
-- Run this after initial schema migration
-- Usage: Execute this file in your Supabase SQL editor or via psql

-- Note: This file contains mock data that simulates Reddit posts and generated ideas
-- In production, this data would come from the Reddit API

-- Get topic and subreddit IDs (assumes they exist from seed_data migration)
DO $$
DECLARE
  devtools_topic_id UUID;
  health_topic_id UUID;
  productivity_topic_id UUID;
  finance_topic_id UUID;
  programming_sub_id UUID;
  webdev_sub_id UUID;
  startups_sub_id UUID;
  entrepreneur_sub_id UUID;
  productivity_sub_id UUID;
  personalfinance_sub_id UUID;
  
  post1_id UUID;
  post2_id UUID;
  post3_id UUID;
  post4_id UUID;
  post5_id UUID;
  post6_id UUID;
  post7_id UUID;
  post8_id UUID;
  
  idea1_id UUID;
  idea2_id UUID;
  idea3_id UUID;
  idea4_id UUID;
  idea5_id UUID;
  idea6_id UUID;
  idea7_id UUID;
  idea8_id UUID;
BEGIN
  -- Get topic IDs
  SELECT id INTO devtools_topic_id FROM topics WHERE key = 'devtools';
  SELECT id INTO health_topic_id FROM topics WHERE key = 'health';
  SELECT id INTO productivity_topic_id FROM topics WHERE key = 'productivity';
  SELECT id INTO finance_topic_id FROM topics WHERE key = 'finance';
  
  -- Get subreddit IDs
  SELECT id INTO programming_sub_id FROM subreddits WHERE name = 'r/programming';
  SELECT id INTO webdev_sub_id FROM subreddits WHERE name = 'r/webdev';
  SELECT id INTO startups_sub_id FROM subreddits WHERE name = 'r/startups';
  SELECT id INTO entrepreneur_sub_id FROM subreddits WHERE name = 'r/entrepreneur';
  SELECT id INTO productivity_sub_id FROM subreddits WHERE name = 'r/productivity';
  SELECT id INTO personalfinance_sub_id FROM subreddits WHERE name = 'r/personalfinance';

  -- Insert mock Reddit posts
  INSERT INTO reddit_posts (reddit_post_id, subreddit_id, title, body, permalink, score, num_comments, created_utc)
  VALUES
    ('mock_reddit_post_1', programming_sub_id, 'Need a better way to manage environment variables across projects', 'I''m constantly switching between projects and having to update .env files. There has to be a better solution for managing secrets across different environments.', '/r/programming/comments/mock1', 127, 43, NOW() - INTERVAL '2 days')
  RETURNING id INTO post1_id;
  
  INSERT INTO reddit_posts (reddit_post_id, subreddit_id, title, body, permalink, score, num_comments, created_utc)
  VALUES
    ('mock_reddit_post_2', webdev_sub_id, 'Is there a tool that shows all unused CSS in a project?', 'Working on a legacy codebase with tons of CSS. Looking for something that can analyze and identify unused styles so I can clean them up.', '/r/webdev/comments/mock2', 89, 28, NOW() - INTERVAL '1 day')
  RETURNING id INTO post2_id;
  
  INSERT INTO reddit_posts (reddit_post_id, subreddit_id, title, body, permalink, score, num_comments, created_utc)
  VALUES
    ('mock_reddit_post_3', startups_sub_id, 'Tracking expenses across multiple credit cards is a nightmare', 'I use 3 different cards for different purposes and manually categorizing expenses takes forever. Wish there was something that could auto-categorize based on merchant patterns.', '/r/startups/comments/mock3', 203, 67, NOW() - INTERVAL '5 hours')
  RETURNING id INTO post3_id;
  
  INSERT INTO reddit_posts (reddit_post_id, subreddit_id, title, body, permalink, score, num_comments, created_utc)
  VALUES
    ('mock_reddit_post_4', entrepreneur_sub_id, 'Need help organizing client feedback across multiple tools', 'I''m collecting feedback from Slack, email, Intercom, and Google Forms. There''s no single place to see all of it organized. This is driving me crazy.', '/r/entrepreneur/comments/mock4', 156, 52, NOW() - INTERVAL '12 hours')
  RETURNING id INTO post4_id;
  
  INSERT INTO reddit_posts (reddit_post_id, subreddit_id, title, body, permalink, score, num_comments, created_utc)
  VALUES
    ('mock_reddit_post_5', productivity_sub_id, 'I wish there was a focus app that actually worked for my ADHD brain', 'Tried every pomodoro timer and focus app. They all assume I can just "focus" when the timer starts. Need something that actually helps with executive dysfunction.', '/r/productivity/comments/mock5', 312, 89, NOW() - INTERVAL '8 hours')
  RETURNING id INTO post5_id;
  
  INSERT INTO reddit_posts (reddit_post_id, subreddit_id, title, body, permalink, score, num_comments, created_utc)
  VALUES
    ('mock_reddit_post_6', personalfinance_sub_id, 'Tracking subscription renewals is impossible', 'Between streaming, software, and services, I have 20+ subscriptions. I keep getting charged for things I forgot I even had. Need a better way to track and cancel.', '/r/personalfinance/comments/mock6', 445, 134, NOW() - INTERVAL '1 day')
  RETURNING id INTO post6_id;
  
  INSERT INTO reddit_posts (reddit_post_id, subreddit_id, title, body, permalink, score, num_comments, created_utc)
  VALUES
    ('mock_reddit_post_7', webdev_sub_id, 'API documentation that stays in sync with code changes', 'Our API docs are always outdated. Every time we change an endpoint, someone forgets to update the docs. There must be a better way.', '/r/webdev/comments/mock7', 234, 71, NOW() - INTERVAL '3 days')
  RETURNING id INTO post7_id;
  
  INSERT INTO reddit_posts (reddit_post_id, subreddit_id, title, body, permalink, score, num_comments, created_utc)
  VALUES
    ('mock_reddit_post_8', productivity_sub_id, 'Need a habit tracker that doesn''t make me feel like a failure', 'Every habit tracker I''ve tried shows a huge "streak broken" screen when I miss a day. I just want something that encourages me to continue, not shames me for missing.', '/r/productivity/comments/mock8', 278, 95, NOW() - INTERVAL '6 hours')
  RETURNING id INTO post8_id;

  -- Insert generated ideas
  INSERT INTO ideas (title, pitch, pain_insight, score, topic_id, llm_model, llm_prompt_version)
  VALUES
    ('EnvVar Manager', 'A centralized tool for managing environment variables across multiple projects with encryption and team sharing.', 'Developers struggle with managing secrets across different environments, leading to security risks and workflow inefficiency.', 78, devtools_topic_id, 'gpt-4', 'v1')
  RETURNING id INTO idea1_id;
  
  INSERT INTO ideas (title, pitch, pain_insight, score, topic_id, llm_model, llm_prompt_version)
  VALUES
    ('CSS Dead Code Eliminator', 'An intelligent tool that analyzes your codebase to identify and remove unused CSS styles automatically.', 'Large codebases accumulate unused CSS over time, increasing bundle size and maintenance burden.', 72, devtools_topic_id, 'gpt-4', 'v1')
  RETURNING id INTO idea2_id;
  
  INSERT INTO ideas (title, pitch, pain_insight, score, topic_id, llm_model, llm_prompt_version)
  VALUES
    ('Expense Auto-Categorizer', 'Smart expense tracking that automatically categorizes transactions across multiple cards using merchant pattern recognition.', 'Manual expense categorization is time-consuming and error-prone, especially with multiple payment methods.', 85, finance_topic_id, 'gpt-4', 'v1')
  RETURNING id INTO idea3_id;
  
  INSERT INTO ideas (title, pitch, pain_insight, score, topic_id, llm_model, llm_prompt_version)
  VALUES
    ('Unified Feedback Hub', 'Centralize customer feedback from Slack, email, Intercom, and forms into one organized, searchable dashboard.', 'Feedback scattered across multiple channels makes it impossible to get a holistic view of customer needs.', 81, productivity_topic_id, 'gpt-4', 'v1')
  RETURNING id INTO idea4_id;
  
  INSERT INTO ideas (title, pitch, pain_insight, score, topic_id, llm_model, llm_prompt_version)
  VALUES
    ('ADHD-Friendly Focus App', 'A focus app designed for neurodivergent brains with adaptive timers, gentle reminders, and no shame-based streak tracking.', 'Existing productivity tools don''t account for executive dysfunction and can be counterproductive for people with ADHD.', 88, productivity_topic_id, 'gpt-4', 'v1')
  RETURNING id INTO idea5_id;
  
  INSERT INTO ideas (title, pitch, pain_insight, score, topic_id, llm_model, llm_prompt_version)
  VALUES
    ('Subscription Lifecycle Manager', 'Track, categorize, and get reminders for all subscriptions with easy cancellation workflows.', 'People lose track of recurring subscriptions, leading to wasted money on forgotten services.', 83, finance_topic_id, 'gpt-4', 'v1')
  RETURNING id INTO idea6_id;
  
  INSERT INTO ideas (title, pitch, pain_insight, score, topic_id, llm_model, llm_prompt_version)
  VALUES
    ('Auto-Syncing API Docs', 'Generate and maintain API documentation that automatically stays in sync with code changes using code analysis.', 'API documentation becomes stale quickly, creating confusion and extra maintenance work.', 76, devtools_topic_id, 'gpt-4', 'v1')
  RETURNING id INTO idea7_id;
  
  INSERT INTO ideas (title, pitch, pain_insight, score, topic_id, llm_model, llm_prompt_version)
  VALUES
    ('Compassionate Habit Tracker', 'A habit tracking app with a forgiving, encouraging design that focuses on progress over perfection.', 'Traditional habit trackers use shame-based streak tracking that demotivates users when they miss days.', 79, productivity_topic_id, 'gpt-4', 'v1')
  RETURNING id INTO idea8_id;

  -- Link ideas to Reddit posts
  INSERT INTO idea_sources (idea_id, reddit_post_id) VALUES
    (idea1_id, post1_id),
    (idea2_id, post2_id),
    (idea3_id, post3_id),
    (idea4_id, post4_id),
    (idea5_id, post5_id),
    (idea6_id, post6_id),
    (idea7_id, post7_id),
    (idea8_id, post8_id)
  ON CONFLICT DO NOTHING;

END $$;

