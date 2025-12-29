# Product Requirements Document (PRD)
## Product: ThreadSign (MVP)
**Tagline:** Product ideas from real discussion threads

---

## 1. Overview

### Problem Statement
Early-stage founders struggle to identify **real, validated problems** worth solving. While Reddit contains millions of candid discussions describing user frustrations, this information is noisy, fragmented, and difficult to convert into actionable product ideas.

### High-Level Solution
ThreadSign is a SaaS that uses **Reddit discussion data** (currently mocked during MVP development) to monitor selected, problem-heavy subreddits. The system periodically ingests discussion threads, extracts pain signals, and uses an LLM to generate **concise product ideas with a simplified viability score**. Users consume these ideas via a web feed and optional email updates.

> **Implementation Note:** During MVP development, mocked Reddit data is used temporarily. Access to the official Reddit API requires submitting and waiting for approval of an application form. This is an implementation detail only—the product flow, features, and UX are designed to work identically with real Reddit API data once approved. Mocked data does not represent a product limitation.

### Target Users
- Beginner founders
- Indie hackers
- Product-oriented developers exploring startup ideas

---

## 2. Goals & Non-Goals

### Goals
- Product ideas are traceable to real Reddit discussions
- Users can quickly scan, filter, and evaluate ideas
- Reddit ingestion runs reliably within API limits
- Email subscriptions work end-to-end
- Product is understandable without onboarding

### Non-Goals (Out of Scope)
- Real-time Reddit streaming
- Deep comment-thread analysis
- User-generated submissions
- Monetization or billing
- Advanced market sizing or competitive analysis
- Non-Reddit data sources

---

## 3. User Personas & Use Cases

### Primary Persona: Beginner Founder
- Limited experience with market research
- Wants fast inspiration grounded in real user pain
- Values clarity and signal over depth

### Key User Scenarios
1. **Browse Ideas**
   - User opens ThreadSign and views a feed of ideas derived from recent Reddit threads
   - User filters ideas by topic (e.g., devtools, health)

2. **Evaluate an Idea**
   - User reviews the pitch, pain insight, score, and source subreddit
   - User may open the original Reddit thread for context

3. **Subscribe for Updates**
   - User subscribes to email updates by topic
   - Receives periodic emails with new ideas
   - Can unsubscribe at any time

---

## 4. Functional Requirements

### Reddit Data Ingestion
- **Implementation:** Currently uses mocked Reddit data that simulates real Reddit discussion threads
  - Mocked data is used temporarily during MVP development
  - Official Reddit API integration will replace mocks once API access is approved
  - This is an implementation detail only—no changes to product flow or features
- Subreddits are manually curated for MVP
- Only recent posts are simulated/fetched (e.g., new / hot)
- Basic quality filters are applied (e.g., upvotes)
- Ingestion is asynchronous and scheduled

### Idea Generation & Scoring
- OpenAI is used to extract pain points and generate ideas
- Each idea includes a simplified viability score (0–100)
- LLM prompts and outputs are structured and versioned

### Idea Feed
- Displays generated product ideas
- Each item includes:
  - Name
  - Short pitch (1–2 sentences)
  - Key pain / insight
  - Source subreddit + link
  - Viability score
  - “New” badge
- Topic-based filtering
- Graceful loading and empty states

### Authentication
- Email/password authentication via Supabase
- Required for email subscriptions

### Email Subscriptions
- Topic-based subscriptions
- Emails sent via Resend
- Unsubscribe available via link or profile

---

## 5. Non-Functional Requirements

### Performance
- Feed loads in under 2 seconds on average
- Background jobs do not block UI

### Security & Privacy
- No Reddit user PII stored
- Secrets stored in environment variables
- Authentication handled by Supabase

### Scalability
- Batch ingestion to respect Reddit API limits (when API access is available)
- Caching of ingested posts and generated ideas
- MVP assumes low-to-moderate traffic

---

## 6. UX / UI Notes

- Clean, scannable layout
- Clear connection between idea and source thread
- External links open in a new tab
- Empty states explain what is happening (“Ideas are being generated”)

> Visual and styling guidance is defined in **VisualDesign.md**

---

## 7. Metrics & Success Criteria

### Quantitative
- Ideas generated per day
- Feed engagement (scroll depth, filters)
- Email subscription rate
- Email open rate (if enabled)

### Qualitative
- Ideas feel realistic and grounded
- Users understand value within first visit
- Minimal clarification needed

---

## 8. Open Questions & Assumptions

### Assumptions
- Reddit API access will be available after approval (currently using mocked data for development)
- Subreddit list is manually curated
- Viability scoring is heuristic

### Open Questions
- Ingestion frequency (daily vs more often)
- Reprocessing older posts
- Anonymous browsing vs auth-only

---

## 9. Technical Reference

Implementation details, database schema, and system architecture
are defined in **SystemDesign.md**.
