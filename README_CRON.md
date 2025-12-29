# Automated Idea Generation Setup

This document describes the automated background jobs for idea generation.

## Overview

A single daily pipeline cron job runs automatically:
- **Daily Pipeline** - Runs daily at 09:00 Kyiv time (06:00 UTC)
  - Executes three sequential steps in one job:
    1. **Generate Mock Reddit Posts** - Generates at least 5 mock Reddit posts using LLM (scoped to Developer Tools topic and /startups subreddit)
    2. **Generate Ideas** - Evaluates unprocessed Reddit posts, generates product ideas with viability scores (only stores ideas with score ≥ 60)
    3. **Send Email Digests** - Sends email digests to subscribers with new ideas (only includes ideas that haven't been sent to each user before)

**Note:** This single-pipeline approach is configured for Vercel Hobby plan compatibility (daily cron jobs). All steps are idempotent and safe to re-run. The pipeline runs sequentially, so each step completes before the next begins.

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

You can test the daily pipeline endpoint manually:
```bash
curl "http://localhost:3000/api/cron/daily-pipeline?secret=YOUR_CRON_SECRET"
```

The pipeline will execute all three steps sequentially and return combined results.

## Notes

- All OpenAI calls are server-only and never exposed to the client
- The service role client bypasses RLS for background operations
- Posts are marked as processed even if no idea is generated (to avoid infinite retries)
- Only ideas with score ≥ 60 are stored in the database

