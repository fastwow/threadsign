# Main 10 Prompts from Development History

## 1. Marketing Landing Page Redesign
**Prompt:** "You are a senior frontend engineer + UI-focused product engineer. Goal: Redesign the marketing landing page to match the PRD. Source of truth: Read and follow @docs/PRD.md @docs/VisualDesign.md. Use my logo @app/logo.png. Ensure the page includes: clear above-the-fold hero with CTA, feature sections aligned to PRD, simple 'How it works', social proof placeholders, responsive layout."

## 2. Automatic Profile Creation on User Signup
**Prompt:** "Set up Supabase so that a profile is automatically created for each authenticated user. Create a public.profiles table where: id is a UUID and references auth.users(id). Create a Postgres trigger on auth.users that runs after a user is created and inserts a corresponding row into public.profiles. Enable Row Level Security (RLS) on public.profiles and add policies so users can read and update their own profile."

## 3. Email Subscription Backend Implementation
**Prompt:** "I introduced RESEND_API_KEY in the environment variables. Implement email subscription handling with the following requirements: Add a Supabase function (RPC or server-side logic) to handle email subscriptions. The function should create, update, and deactivate subscriptions as needed. Use Resend for sending subscription-related emails. Access the Resend API using the server-only RESEND_API_KEY. Do not expose any email logic or secrets to the client. Ensure the subscription behavior and user flow are fully aligned with @docs/PRD.md."

## 4. LLM-Based Mock Reddit Ingestion and Idea Evaluation
**Prompt:** "Update @docs/PRD.md to reflect the following changes: Mock Reddit Ingestion - Replace direct Reddit API usage with an LLM-based mock generator. Every 5 minutes, generate mock Reddit posts using an LLM. Scope the mock generation to: Topic: Developer Tools, Subreddit: /startups"

## 5. Automated Idea Generation and Scoring Implementation
**Prompt:** "I added OPENAI_API_KEY to the environment variables and I will use Vercel Cron for background jobs. Implement automated idea generation and scoring aligned with @docs/PRD.md. Ensure OPENAI_API_KEY is server-only and never exposed to the client."

## 6. Idea Feed Enhancements and Scoring Logic Updates
**Prompt:** "1. Remove any score or evaluation logic from reddit_posts. Reddit posts are raw signals only; no scoring, ranking, or evaluation at this stage. Update the generator to create at least 5 Reddit posts per run. 2. Idea Feed Filtering - Add filtering and sorting controls to the idea feed: Sort by date (newest first / oldest first), Sort by score (highest first / lowest first). 3. Show Score Breakdown on score label hover - Clearly show how each criterion contributes to the final score. 4. Scoring Logic Update - Update idea evaluation logic as follows: Each criterion is scored independently from 0 to 100. Final score is the simple average of all criteria. Persist individual criterion scores so they can be displayed in the breakdown view."

## 7. Email Delivery and UI Improvements
**Prompt:** "1. Email Subscriptions UI (Dashboard) - Make the Email Subscriptions section collapsible / expandable. Default behavior: Expanded if the user has no topics selected yet. Collapsed if the user already has one or more topics selected. 2. Email Delivery Schedule - Send emails with subscribed ideas every 20 minutes. Emails should include only new ideas that match the user's subscribed topics and have not been sent to that user before. 3. Reddit Post Processing Semantics - Update the processing logic so that all Reddit posts are marked as processed, regardless of their evaluation score."

## 8. Dashboard Timestamp Display Update
**Prompt:** "Update the dashboard timestamp display logic: Replace the '0h ago' label with minute-level precision. When an item is less than 1 hour old, display: 'X min ago' (e.g. 3 min ago, 42 min ago). Preserve the existing behavior for items older than 1 hour (e.g. hours, days). Ensure the formatting is consistent across the dashboard."


