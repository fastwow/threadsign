# System Design & Data Model
## ThreadSign (MVP)

This document defines **implementation-level details** for ThreadSign,
including architecture and Supabase schema.

---

## 1. Architecture Overview

### Stack
- Frontend: Next.js
- Backend: Next.js API routes / server actions
- Auth & Database: Supabase (Auth + Postgres)
- LLM: OpenAI
- Email: Resend

### High-Level Flow
1. Reddit ingestion job generates new posts (runs every 5 minutes, generates at least 5 posts per run)
2. Raw posts are stored as signal data only (no scoring or evaluation)
3. LLM processes posts and generates ideas (runs every 12 minutes)
4. Ideas are scored on 4 criteria (0-100 each), final score is average
5. Ideas are stored and surfaced via feed (only ideas with average score ≥ 60)
6. All posts are marked as processed regardless of score (prevents blocking)
7. Email digests are sent to subscribers (runs every 20 minutes) with new ideas matching their topics

All ingestion, LLM processing, and email sending
run server-side using Supabase service role keys.

---

## 2. Supabase Schema (MVP)

### `profiles`
User profile data linked to Supabase Auth.

| Column | Type |
|------|------|
| id | uuid (PK, FK → auth.users) |
| email | text |
| created_at | timestamptz |
| updated_at | timestamptz |

---

### `topics`
Controlled list of categories (e.g., devtools, health).

| Column | Type |
|------|------|
| id | uuid (PK) |
| key | text (unique) |
| label | text |

---

### `subreddits`
Curated list of Reddit sources.

| Column | Type |
|------|------|
| id | uuid (PK) |
| name | text (unique) |
| is_active | boolean |

---

### `reddit_posts`
Raw Reddit posts ingested via API (or generated via LLM mock generator in MVP).

| Column | Type |
|------|------|
| id | uuid (PK) |
| reddit_post_id | text (unique) |
| subreddit_id | uuid (FK) |
| title | text |
| body | text |
| permalink | text |
| score | int |
| num_comments | int |
| created_utc | timestamptz |
| raw_json | jsonb |
| processed_at | timestamptz |

---

### `ideas`
Generated product ideas. Only ideas with score ≥ 60 are stored.

| Column | Type |
|------|------|
| id | uuid (PK) |
| title | text |
| pitch | text |
| pain_insight | text |
| score | int (CHECK score >= 60, average of 4 criteria 0-100) |
| topic_id | uuid (FK) |
| created_at | timestamptz |
| llm_model | text |
| llm_prompt_version | text |
| llm_raw | jsonb (stores individual criterion scores: pain_point_intensity, willingness_to_pay, competitive_landscape, tam) |

---

### `idea_sources`
Mapping ideas to Reddit posts.

| Column | Type |
|------|------|
| id | uuid (PK) |
| idea_id | uuid (FK) |
| reddit_post_id | uuid (FK) |

---

### `email_subscriptions`
User subscription state.

| Column | Type |
|------|------|
| id | uuid (PK) |
| user_id | uuid (FK) |
| is_active | boolean |
| unsubscribe_token | text (unique) |

---

### `email_subscription_topics`
Topic filters per subscription.

| Column | Type |
|------|------|
| id | uuid (PK) |
| subscription_id | uuid (FK) |
| topic_id | uuid (FK) |

---

### `email_deliveries`
Email delivery tracking (implementation detail for metrics).

| Column | Type |
|------|------|
| id | uuid (PK) |
| subscription_id | uuid (FK → email_subscriptions) |
| sent_at | timestamptz |
| ideas_included | jsonb (array of idea_ids) |
| resend_message_id | text (from Resend API) |

---

## 3. Processing & Tracking Notes

### LLM Processing
- `reddit_posts.processed_at` tracks when a post was last processed by LLM
- Reddit posts are raw signals only—no scoring or evaluation at ingestion stage
- Each idea is scored on 4 criteria (each 0–100 independently): pain point intensity, willingness to pay, competitive landscape, TAM
- Final score is simple average of all criteria
- `ideas.llm_raw` stores individual criterion scores for breakdown display
- Only ideas with average score ≥ 60 are stored (lower scores discarded)
- **All posts are marked as processed regardless of score** - low-scoring posts don't block processing

### Email Delivery Tracking
- `email_deliveries` table tracks when emails were sent to subscribers
- Stores Resend message IDs for delivery status lookups (if needed)
- Used for metrics (email open rate, delivery rate) - implementation detail only
- **Email Delivery Schedule:** Runs every 20 minutes
- **Duplicate Prevention:** Emails include only ideas that haven't been sent to that user before (tracked via `email_deliveries.ideas_included`)
- Each delivery includes all new ideas matching the user's subscribed topics since their last email

## 4. Security & Access Notes

- Public read access may be allowed for ideas/feed
- Subscription data is protected via RLS
- Email delivery tracking is protected via RLS (users can only see their own)
- All background jobs use service role credentials
