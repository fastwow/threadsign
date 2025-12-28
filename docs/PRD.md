# Product Requirements Document (PRD)
## Product: ThreadSign (MVP)
**Tagline:** Product ideas from real discussion threads

---

## 1. Overview

### Problem Statement
Early-stage founders struggle to identify **real, validated problems** worth solving. Although platforms like Reddit contain millions of candid discussions where users openly describe frustrations and unmet needs, this information is noisy, fragmented, and difficult to translate into actionable product ideas.

### High-Level Solution
ThreadSign is a SaaS that **uses the official Reddit API as its primary data source** to monitor selected, problem-heavy subreddits. The system periodically ingests new discussion threads, extracts pain signals, and uses an LLM to generate **concise product ideas with a simplified viability score**. Users consume these ideas via a web feed and optional email updates.

### Target Users
- Beginner founders
- Indie hackers
- Product-oriented developers exploring startup ideas

---

## 2. Goals & Non-Goals

### Goals (What Success Looks Like)
- Product ideas are clearly traceable to real Reddit discussions
- Users can quickly scan, filter, and evaluate ideas
- Reddit ingestion runs reliably within API limits
- Email subscriptions work end-to-end
- The product is understandable without onboarding or support

### Non-Goals (Out of Scope for MVP)
- Real-time Reddit streaming
- Deep comment-thread analysis
- User-generated submissions
- Monetization or billing
- Advanced competitive or market sizing analysis
- Multi-source ingestion beyond Reddit

---

## 3. User Personas & Use Cases

### Primary Persona: Beginner Founder
- Limited experience with market research
- Wants fast inspiration grounded in real user pain
- Values clarity and signal over depth

### Key User Scenarios
1. **Browse Ideas**
   - User opens ThreadSign and sees a feed of product ideas generated from recent Reddit threads
   - User filters ideas by topic (e.g., devtools, health, education)

2. **Evaluate an Idea**
   - User reads the pitch, pain insight, score, and source subreddit
   - User optionally opens the original Reddit thread for context

3. **Subscribe for Updates**
   - User subscribes to email updates for selected topics
   - Receives periodic emails with new ideas
   - Can unsubscribe at any time via link or profile

---

## 4. Functional Requirements

### 4.1 Reddit Data Ingestion (Primary Source)

- Use the official Reddit API (read-only, application OAuth)
- Ingest posts from a manually curated list of subreddits
- Fetch recent posts (e.g., new / hot)
- Apply basic quality filters:
  - Minimum upvotes
  - Optional minimum comment count
- Store raw post data for traceability
- Ingestion runs asynchronously (cron or scheduled job)

**Fallback (optional):**
- Static JSON snapshot can replace API ingestion if limits are reached

---

### 4.2 Idea Generation & Scoring (LLM)

- Use OpenAI as the LLM provider
- For each eligible Reddit post (or group of posts):
  - Extract pain points
  - Generate a short product idea
  - Assign a simplified viability score (0–100)
- Prompts and model parameters are configurable
- LLM output must be structured and typed

---

### 4.3 Idea Feed

- Display a feed of generated product ideas
- Each idea includes:
  - Idea name
  - Short pitch (1–2 sentences)
  - Key pain / insight
  - Source subreddit and link
  - Viability score (0–100)
  - “New” badge for recent ideas
- Filter by topic/category
- Handle loading and empty states gracefully

---

### 4.4 Authentication

- Supabase Auth (email/password)
- Login, signup, logout
- Authentication required for email subscriptions

---

### 4.5 Email Subscriptions

- Users can subscribe to topic-based updates
- Emails sent via Resend
- Correct API integration required (real sending optional)
- Unsubscribe available via:
  - Link in email
  - User profile

---

## 5. Non-Functional Requirements

### Performance
- Feed loads in under 2 seconds on average
- Reddit ingestion and LLM generation are asynchronous
- UI is never blocked by background processing

### Security & Privacy
- No Reddit user PII stored
- API keys and OAuth tokens stored in environment variables
- Authentication handled exclusively by Supabase

### Scalability & Limits
- Batch Reddit ingestion to respect API rate limits
- Cache ingested posts and generated ideas
- MVP assumes low to moderate traffic

---

## 6. UX / UI Notes

### Key Screens
- Landing page
- Authentication screens
- Idea feed
- Subscription settings

### UX Principles
- Clear visual link between idea and source thread
- Scannable layout: idea → pitch → pain → score
- External Reddit links open in a new tab

### Empty & Error States
- No ideas yet → “New ideas are being generated”
- LLM failure → generic fallback message
- Email failure → user sees success UI; errors logged internally

---

## 7. Metrics & Success Criteria

### Quantitative Metrics
- Number of ideas generated per day
- Feed engagement (scroll depth, filter usage)
- Email subscription rate
- Email open rate (if enabled)

### Qualitative Signals
- Ideas feel realistic and grounded
- Users understand the value within the first visit
- No clarification needed to use the product

---

## 8. Open Questions & Assumptions

### Assumptions
- Reddit API access is stable and approved
- Initial subreddit list is manually curated
- Viability scoring is heuristic and illustrative

### Open Questions
- Ideal ingestion frequency (daily vs multiple times per day)
- Should older Reddit posts be reprocessed?
- Anonymous browsing vs auth-only access

---

## 9. Technical Architecture & Supabase Schema

### 9.1 Architecture Overview

- **Frontend:** Next.js
- **Backend:** Next.js API routes / server actions
- **Auth & DB:** Supabase (Auth + Postgres)
- **LLM:** OpenAI
- **Email:** Resend

**Pipeline:**
1. Ingest Reddit posts
2. Store raw posts
3. Generate ideas via LLM
4. Store ideas
5. Surface via feed and email

---

### 9.2 Supabase Schema (MVP)

#### `profiles`
| Column | Type | Notes |
|------|------|------|
| id | uuid (PK, FK → auth.users) | |
| email | text | optional |
| created_at | timestamptz | |
| updated_at | timestamptz | |

---

#### `topics`
| Column | Type | Notes |
|------|------|------|
| id | uuid (PK) | |
| key | text (unique) | e.g. devtools |
| label | text | e.g. Dev Tools |

---

#### `subreddits`
| Column | Type | Notes |
|------|------|------|
| id | uuid (PK) | |
| name | text (unique) | e.g. startups |
| is_active | boolean | |

---

#### `reddit_posts`
| Column | Type | Notes |
|------|------|------|
| id | uuid (PK) | |
| reddit_post_id | text (unique) | |
| subreddit_id | uuid (FK) | |
| title | text | |
| body | text | |
| permalink | text | |
| score | int | |
| num_comments | int | |
| created_utc | timestamptz | |
| raw_json | jsonb | |

---

#### `ideas`
| Column | Type | Notes |
|------|------|------|
| id | uuid (PK) | |
| title | text | |
| pitch | text | |
| pain_insight | text | |
| score | int | 0–100 |
| topic_id | uuid (FK) | |
| created_at | timestamptz | |
| llm_model | text | |
| llm_prompt_version | text | |
| llm_raw | jsonb | |

---

#### `idea_sources`
| Column | Type | Notes |
|------|------|------|
| id | uuid (PK) | |
| idea_id | uuid (FK) | |
| reddit_post_id | uuid (FK) | |

---

#### `email_subscriptions`
| Column | Type | Notes |
|------|------|------|
| id | uuid (PK) | |
| user_id | uuid (FK) | |
| is_active | boolean | |
| unsubscribe_token | text (unique) | |

---

#### `email_subscription_topics`
| Column | Type | Notes |
|------|------|------|
| id | uuid (PK) | |
| subscription_id | uuid (FK) | |
| topic_id | uuid (FK) | |

---

## End of PRD
