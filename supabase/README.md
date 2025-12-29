# Supabase Migrations & Seed Data

This directory contains SQL migrations and seed data for the ThreadSign MVP database.

## Setup Instructions

### 1. Run Migrations

Execute the migration files in order:

1. `20240101000000_initial_schema.sql` - Creates all tables, indexes, RLS policies, and triggers
2. `20240101000001_seed_data.sql` - Seeds initial topics and subreddits

You can run these migrations in your Supabase SQL Editor or via the Supabase CLI.

### 2. Seed Mock Data

After running the migrations, execute `seed.sql` to populate the database with mock Reddit data:

- Mock Reddit posts that simulate real Reddit discussions
- Generated product ideas linked to those posts
- Topics and subreddits referenced by the mock data

**Note:** This seed data is used temporarily during MVP development while waiting for Reddit API approval. The data structure matches what would come from the real Reddit API, so the application will work identically once API access is available.

## Database Schema

The schema follows the structure defined in `docs/SystemDesign.md`:

- `profiles` - User profiles linked to Supabase Auth
- `topics` - Product idea categories (devtools, health, etc.)
- `subreddits` - Reddit sources being monitored
- `reddit_posts` - Raw Reddit post data
- `ideas` - Generated product ideas with viability scores
- `idea_sources` - Links ideas to their source Reddit posts
- `email_subscriptions` - User email subscription preferences
- `email_subscription_topics` - Topic filters for subscriptions

All tables have Row Level Security (RLS) enabled with appropriate policies for public read access (ideas, posts) and user-specific access (subscriptions).

