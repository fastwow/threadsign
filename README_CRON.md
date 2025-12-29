# Automated Idea Generation Setup

This document describes the automated background jobs for idea generation.

## Overview

Two cron jobs run automatically:
1. **Reddit Post Generation** - Runs every 5 minutes
   - Generates mock Reddit posts using LLM
   - Scoped to Developer Tools topic and /startups subreddit

2. **Idea Generation & Scoring** - Runs every 12 minutes
   - Evaluates unprocessed Reddit posts
   - Generates product ideas with viability scores
   - Only stores ideas with score ≥ 60

## Environment Variables Required

- `OPENAI_API_KEY` - OpenAI API key for LLM generation
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key for background jobs
- `CRON_SECRET` - Secret token to secure cron endpoints (set in Vercel)

## Vercel Cron Configuration

The `vercel.json` file configures the cron jobs. In Vercel:
1. Set the `CRON_SECRET` environment variable (optional, for additional security)
2. The cron jobs will run automatically according to the schedule
3. Note: For production, consider additional security measures like IP allowlisting or using Vercel's built-in cron authentication

## Database Requirements

Ensure the following exist in your database:
- `topics` table with a topic where `key = 'devtools'`
- `subreddits` table with a subreddit where `name = 'r/startups'`
- `reddit_posts` table with `processed_at` column (nullable timestamptz)

## Manual Testing

You can test the cron endpoints manually:
```bash
curl "http://localhost:3000/api/cron/generate-reddit-posts?secret=YOUR_CRON_SECRET"
curl "http://localhost:3000/api/cron/generate-ideas?secret=YOUR_CRON_SECRET"
```

## Notes

- All OpenAI calls are server-only and never exposed to the client
- The service role client bypasses RLS for background operations
- Posts are marked as processed even if no idea is generated (to avoid infinite retries)
- Only ideas with score ≥ 60 are stored in the database

