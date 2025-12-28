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
1. Reddit ingestion job fetches new posts
2. Raw posts are stored for traceability
3. LLM processes posts and generates ideas
4. Ideas are stored and surfaced via feed
5. Email digests are generated for subscribers

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
Raw Reddit posts ingested via API.

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

---

### `ideas`
Generated product ideas.

| Column | Type |
|------|------|
| id | uuid (PK) |
| title | text |
| pitch | text |
| pain_insight | text |
| score | int |
| topic_id | uuid (FK) |
| created_at | timestamptz |
| llm_model | text |
| llm_prompt_version | text |
| llm_raw | jsonb |

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

## 3. Security & Access Notes

- Public read access may be allowed for ideas/feed
- Subscription data is protected via RLS
- All background jobs use service role credentials
