-- Initial schema for ThreadSign MVP
-- Based on SystemDesign.md

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table (linked to auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Topics table
CREATE TABLE IF NOT EXISTS topics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key TEXT NOT NULL UNIQUE,
  label TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Subreddits table
CREATE TABLE IF NOT EXISTS subreddits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Reddit posts table
CREATE TABLE IF NOT EXISTS reddit_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reddit_post_id TEXT NOT NULL UNIQUE,
  subreddit_id UUID NOT NULL REFERENCES subreddits(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  body TEXT,
  permalink TEXT NOT NULL,
  score INTEGER NOT NULL DEFAULT 0,
  num_comments INTEGER NOT NULL DEFAULT 0,
  created_utc TIMESTAMPTZ NOT NULL,
  raw_json JSONB,
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Ideas table
-- Only ideas with score >= 60 are stored (lower scores discarded)
CREATE TABLE IF NOT EXISTS ideas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  pitch TEXT NOT NULL,
  pain_insight TEXT NOT NULL,
  score INTEGER NOT NULL CHECK (score >= 60 AND score <= 100),
  topic_id UUID NOT NULL REFERENCES topics(id) ON DELETE RESTRICT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  llm_model TEXT,
  llm_prompt_version TEXT,
  llm_raw JSONB
);

-- Idea sources (many-to-many relationship between ideas and reddit_posts)
CREATE TABLE IF NOT EXISTS idea_sources (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  idea_id UUID NOT NULL REFERENCES ideas(id) ON DELETE CASCADE,
  reddit_post_id UUID NOT NULL REFERENCES reddit_posts(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(idea_id, reddit_post_id)
);

-- Email subscriptions table
CREATE TABLE IF NOT EXISTS email_subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  unsubscribe_token TEXT NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(32), 'hex'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Email subscription topics (many-to-many relationship)
CREATE TABLE IF NOT EXISTS email_subscription_topics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  subscription_id UUID NOT NULL REFERENCES email_subscriptions(id) ON DELETE CASCADE,
  topic_id UUID NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(subscription_id, topic_id)
);

-- Email deliveries table (for tracking email sends to subscribers)
CREATE TABLE IF NOT EXISTS email_deliveries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  subscription_id UUID NOT NULL REFERENCES email_subscriptions(id) ON DELETE CASCADE,
  sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ideas_included JSONB NOT NULL DEFAULT '[]'::jsonb,
  resend_message_id TEXT
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_reddit_posts_subreddit_id ON reddit_posts(subreddit_id);
CREATE INDEX IF NOT EXISTS idx_reddit_posts_created_utc ON reddit_posts(created_utc DESC);
CREATE INDEX IF NOT EXISTS idx_reddit_posts_processed_at ON reddit_posts(processed_at)
WHERE processed_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_ideas_topic_id ON ideas(topic_id);
CREATE INDEX IF NOT EXISTS idx_ideas_created_at ON ideas(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ideas_score ON ideas(score DESC);
CREATE INDEX IF NOT EXISTS idx_idea_sources_idea_id ON idea_sources(idea_id);
CREATE INDEX IF NOT EXISTS idx_idea_sources_reddit_post_id ON idea_sources(reddit_post_id);
CREATE INDEX IF NOT EXISTS idx_email_subscriptions_user_id ON email_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_email_subscription_topics_subscription_id ON email_subscription_topics(subscription_id);
CREATE INDEX IF NOT EXISTS idx_email_subscription_topics_topic_id ON email_subscription_topics(topic_id);
CREATE INDEX IF NOT EXISTS idx_email_deliveries_subscription_id ON email_deliveries(subscription_id);
CREATE INDEX IF NOT EXISTS idx_email_deliveries_sent_at ON email_deliveries(sent_at DESC);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE subreddits ENABLE ROW LEVEL SECURITY;
ALTER TABLE reddit_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE ideas ENABLE ROW LEVEL SECURITY;
ALTER TABLE idea_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_subscription_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_deliveries ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Profiles: Users can read their own profile, update their own profile
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Topics: Public read access
CREATE POLICY "Topics are publicly readable" ON topics
  FOR SELECT USING (true);

-- Subreddits: Public read access
CREATE POLICY "Subreddits are publicly readable" ON subreddits
  FOR SELECT USING (true);

-- Reddit posts: Public read access
CREATE POLICY "Reddit posts are publicly readable" ON reddit_posts
  FOR SELECT USING (true);

-- Ideas: Public read access
CREATE POLICY "Ideas are publicly readable" ON ideas
  FOR SELECT USING (true);

-- Idea sources: Public read access
CREATE POLICY "Idea sources are publicly readable" ON idea_sources
  FOR SELECT USING (true);

-- Email subscriptions: Users can manage their own subscriptions
CREATE POLICY "Users can view own subscriptions" ON email_subscriptions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own subscriptions" ON email_subscriptions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own subscriptions" ON email_subscriptions
  FOR UPDATE USING (auth.uid() = user_id);

-- Email subscription topics: Users can manage topics for their subscriptions
CREATE POLICY "Users can view own subscription topics" ON email_subscription_topics
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM email_subscriptions
      WHERE email_subscriptions.id = email_subscription_topics.subscription_id
      AND email_subscriptions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage own subscription topics" ON email_subscription_topics
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM email_subscriptions
      WHERE email_subscriptions.id = email_subscription_topics.subscription_id
      AND email_subscriptions.user_id = auth.uid()
    )
  );

-- Email deliveries: Users can view their own email deliveries
CREATE POLICY "Users can view own email deliveries" ON email_deliveries
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM email_subscriptions
      WHERE email_subscriptions.id = email_deliveries.subscription_id
      AND email_subscriptions.user_id = auth.uid()
    )
  );

-- Function to automatically create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, NEW.email)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_email_subscriptions_updated_at ON email_subscriptions;
CREATE TRIGGER update_email_subscriptions_updated_at
  BEFORE UPDATE ON email_subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

