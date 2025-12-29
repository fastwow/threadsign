# ThreadSign
Product ideas from real discussion threads

## Product Requirements

Detailed requirements, features, technical architecture, and product goals are documented in [@docs/PRD.md](./docs/PRD.md).  
This is the **source of truth** for the ThreadSign MVP.  
Please refer to it for all product and implementation details.

## Setup Instructions

### Local Development

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd threadsign
   ```

2. **Install dependencies**
   ```bash
   yarn install
   ```

3. **Set up environment variables**
   - Copy `.env.local.example` to `.env.local`  
     `.env.local.example` is provided in the repository as a template that shows all required environment variables and example placeholders.
   - Fill in the actual values for each variable as described below and in the provided example file.

4. **Set up Supabase**
   - Run all SQL migrations in `supabase/migrations/` in order
   - Ensure Row Level Security (RLS) policies are enabled

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   - Navigate to `http://localhost:3000`

### Production Deployment

1. **Set up environment variables** in your deployment platform (Vercel, etc.)
   - Add all required environment variables from the [Environment Variables](#environment-variables) section
   - You can reference the `.env.local.example` file for the correct variable names and structure

2. **Deploy the application**
   - Follow your platform's deployment instructions
   - Ensure all migrations have been run in your Supabase instance

3. **Configure Vercel Cron job** (if using Vercel)
   - The `vercel.json` file includes a single daily pipeline cron job configuration
   - The pipeline runs daily at 09:00 Kyiv time (06:00 UTC)
   - Verify the cron job is active in your Vercel project settings

## Environment Variables

The following environment variables are required for the application to function.  
See `.env.local.example` in the repository for an example file you can copy and update.

### Client-Side Variables

These variables are prefixed with `NEXT_PUBLIC_` and are exposed to the browser:

- **`NEXT_PUBLIC_SUPABASE_URL`** - Your Supabase project URL (used for client-side authentication and database queries)
- **`NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`** - Supabase anon/public key (used for client-side authentication)

### Server-Only Variables

These variables are **never exposed to the client** and must remain server-side only:

- **`SUPABASE_SERVICE_ROLE_KEY`** - Supabase service role key with elevated permissions (used by background jobs and server-side operations that bypass RLS)
- **`RESEND_API_KEY`** - Resend API key for sending subscription confirmation and digest emails
- **`OPENAI_API_KEY`** - OpenAI API key for generating mock Reddit posts and evaluating/scoring product ideas
- **`CRON_SECRET`** - Secret token for securing cron job endpoints (prevents unauthorized access to background job routes)

### Example Environment Variable File

A `.env.local.example` file is included in the root of the repository and provides all required variables with example values.  
To get started, copy this file to `.env.local` and update each value as needed:

```
cp .env.local.example .env.local
```

Example contents:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Email Service (Resend)
RESEND_API_KEY=re_your-resend-api-key

# LLM Service (OpenAI)
OPENAI_API_KEY=sk-your-openai-api-key

# Cron Job Security
CRON_SECRET=your-random-secret-token-here
```

**Important Security Notes:**
- Never commit `.env.local` or `.env.local.example` with real secrets to version control
- The `SUPABASE_SERVICE_ROLE_KEY` has full database access and should be kept secret
- The `CRON_SECRET` should be a strong, random string
- Server-only variables (without `NEXT_PUBLIC_` prefix) are safe and should never be exposed to client-side code
