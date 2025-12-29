# Top 10 Most Important Prompts from Development History

## 1. Marketing Landing Page Redesign (Foundation)
**Prompt:** "You are a senior frontend engineer + UI-focused product engineer. Goal: Redesign the marketing landing page to match the PRD. Source of truth: Read and follow @docs/PRD.md @docs/VisualDesign.md. Use my logo @app/logo.png. Ensure the page includes: clear above-the-fold hero with CTA, feature sections aligned to PRD, simple 'How it works', social proof placeholders, responsive layout."

**Impact:** Established the entire marketing site foundation and initial UI/UX architecture.

---

## 2. Automated Idea Generation and Scoring Implementation (Core Feature)
**Prompt:** "I added OPENAI_API_KEY to the environment variables and I will use Vercel Cron for background jobs. Implement automated idea generation and scoring aligned with @docs/PRD.md. Ensure OPENAI_API_KEY is server-only and never exposed to the client."

**Impact:** Implemented the core product functionality - automated LLM-based idea generation from Reddit posts with scoring.

---

## 3. LLM-Based Mock Reddit Ingestion and Idea Evaluation (Architecture Decision)
**Prompt:** "Update @docs/PRD.md to reflect the following changes: Mock Reddit Ingestion - Replace direct Reddit API usage with an LLM-based mock generator. Every 5 minutes, generate mock Reddit posts using an LLM. Scope the mock generation to: Topic: Developer Tools, Subreddit: /startups. Idea Evaluation via LLM - Every 12 minutes, evaluate newly generated Reddit posts using an LLM to identify potential product ideas. Each idea receives a score from 0 to 100. Use four evaluation criteria, each contributing 25% of the total score: Pain point intensity, Willingness to pay, Competitive landscape, TAM (Total Addressable Market). Scoring Threshold: Only ideas with a score ≥ 60 are considered valid and stored/surfaced."

**Impact:** Defined the MVP architecture using LLM-based mock generation instead of Reddit API, establishing the scoring system.

---

## 4. Email Subscription Backend Implementation (Critical Feature)
**Prompt:** "I introduced RESEND_API_KEY in the environment variables. Implement email subscription handling with the following requirements: Add a Supabase function (RPC or server-side logic) to handle email subscriptions. The function should create, update, and deactivate subscriptions as needed. Use Resend for sending subscription-related emails. Access the Resend API using the server-only RESEND_API_KEY. Do not expose any email logic or secrets to the client. Ensure the subscription behavior and user flow are fully aligned with @docs/PRD.md."

**Impact:** Implemented complete email subscription system with backend logic, Resend integration, and user management.

---

## 5. Idea Feed Enhancements and Scoring Logic Updates (UX Improvements)
**Prompt:** "1. Remove any score or evaluation logic from reddit_posts. Reddit posts are raw signals only; no scoring, ranking, or evaluation at this stage. Update the generator to create at least 5 Reddit posts per run. 2. Idea Feed Filtering - Add filtering and sorting controls to the idea feed: Sort by date (newest first / oldest first), Sort by score (highest first / lowest first). 3. Show Score Breakdown on score label hover - Clearly show how each criterion contributes to the final score. 4. Scoring Logic Update - Update idea evaluation logic as follows: Each criterion is scored independently from 0 to 100. Final score is the simple average of all criteria. Persist individual criterion scores so they can be displayed in the breakdown view."

**Impact:** Enhanced user experience with filtering, sorting, and detailed score breakdowns, while refining the scoring architecture.

---

## 6. Single Daily Pipeline Refactoring (Infrastructure Optimization)
**Prompt:** "Refactor the background jobs to use one daily cron pipeline instead of multiple scheduled jobs. Goal: Run the entire daily flow in a single sequence, executed once per day via Vercel Cron (Hobby plan–compatible). Pipeline Steps (run in order): 1. Generate mock Reddit posts, 2. Evaluate posts → generate ideas, 3. Send email digests. Implement a single API route (e.g. /api/cron/daily-pipeline). Configure one daily Vercel cron to call this route. Protect the route with CRON_SECRET."

**Impact:** Consolidated multiple cron jobs into a single efficient pipeline, optimizing for Vercel Hobby plan and simplifying architecture.

---

## 7. Automatic Profile Creation on User Signup (Database Setup)
**Prompt:** "Set up Supabase so that a profile is automatically created for each authenticated user. Create a public.profiles table where: id is a UUID and references auth.users(id). Create a Postgres trigger on auth.users that runs after a user is created and inserts a corresponding row into public.profiles. Enable Row Level Security (RLS) on public.profiles and add policies so users can read and update their own profile."

**Impact:** Established the foundation for user profile management and authentication integration with Supabase.

---

## 8. Email Delivery and Processing Semantics (System Reliability)
**Prompt:** "1. Email Subscriptions UI (Dashboard) - Make the Email Subscriptions section collapsible / expandable. Default behavior: Expanded if the user has no topics selected yet. Collapsed if the user already has one or more topics selected. 2. Email Delivery Schedule - Send emails with subscribed ideas every 20 minutes. Emails should include only new ideas that match the user's subscribed topics and have not been sent to that user before. 3. Reddit Post Processing Semantics - Update the processing logic so that all Reddit posts are marked as processed, regardless of their evaluation score. processed_at should be set once a Reddit post has been: Evaluated by the LLM, and Either accepted or rejected based on the score threshold. Low-scoring posts should not block processing or remain unprocessed."

**Impact:** Improved system reliability, user experience, and ensured processing doesn't get blocked by low-scoring posts.

---

## 9. Code Refactoring - Extract Steps into Separate Files (Code Quality)
**Prompt:** "refactor my @app/api/cron/daily-pipeline/route.ts . move each step into separate file."

**Impact:** Improved code modularity, testability, and maintainability by extracting each pipeline step into dedicated modules.

---

## 10. Documentation and Configuration Updates (Production Readiness)
**Prompt:** "Make the following updates to the project configuration and documentation. 1. Daily Pipeline Cron - Configure the daily pipeline cron to run once per day at 09:00 Kyiv time. Use Vercel Cron (Hobby-plan compatible). 2. Cleanup Unnecessary Cron APIs - Remove any unused or obsolete cron API routes. Keep only the single daily pipeline cron endpoint. 3. Documentation Updates - Update @docs/PRD.md and @README.md to reflect the current architecture."

**Impact:** Finalized production configuration, cleaned up codebase, and ensured documentation accuracy for deployment.

---

## Summary

These 10 prompts represent the most critical milestones in building ThreadSign:
- **Foundation** (Landing page, Database setup)
- **Core Features** (Idea generation, Email subscriptions, Scoring system)
- **Architecture** (LLM-based approach, Single pipeline, Code organization)
- **UX/UI** (Feed enhancements, Score breakdowns, Collapsible sections)
- **Production Readiness** (Configuration, Documentation, Cleanup)

Each prompt built upon previous work and advanced the project toward a production-ready MVP.

