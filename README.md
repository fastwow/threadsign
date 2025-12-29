# ThreadSign
Product ideas from real discussion threads

## Setup Instructions

### Local Development

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd threadsign
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   - Copy `.env.local.example` to `.env.local` (if it exists) or create a new `.env.local` file
   - Add all required environment variables (see [Environment Variables](#environment-variables) below)

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

2. **Deploy the application**
   - Follow your platform's deployment instructions
   - Ensure all migrations have been run in your Supabase instance

3. **Configure Vercel Cron jobs** (if using Vercel)
   - The `vercel.json` file includes cron job configurations
   - Verify cron jobs are active in your Vercel project settings

## Environment Variables

The following environment variables are required for the application to function:

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

### Example `.env.local` File

Create a `.env.local` file in the root directory with the following structure:

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
- Never commit `.env.local` to version control
- The `SUPABASE_SERVICE_ROLE_KEY` has full database access and should be kept secret
- The `CRON_SECRET` should be a strong, random string
- Server-only variables (without `NEXT_PUBLIC_` prefix) are safe and should never be exposed to client-side code
