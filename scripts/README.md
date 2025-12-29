# SQL Migration Execution Scripts

This directory contains scripts to execute Supabase SQL migrations.

## Prerequisites

1. **Database Connection**: You need a connection to your Supabase database
   - Get `DATABASE_URL` from Supabase Dashboard > Settings > Database > Connection string (URI format)

## Execution Methods

### Method 1: Supabase Dashboard (Recommended for first-time setup)

1. Go to your Supabase project: https://app.supabase.com
2. Navigate to SQL Editor
3. Execute files in this order:
   - `supabase/migrations/20240101000000_initial_schema.sql`
   - `supabase/migrations/20240101000001_seed_data.sql`
   - `supabase/seed.sql`

### Method 2: Using psql (Command Line)

```bash
export DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@[YOUR-PROJECT-REF].supabase.co:5432/postgres"
./scripts/execute-migrations.sh
```

### Method 3: Using Supabase CLI (if installed)

```bash
supabase db reset  # Only if using local Supabase
# OR
supabase migration up  # For cloud projects
```

## File Execution Order

1. **20240101000000_initial_schema.sql** - Creates tables, indexes, RLS policies
2. **20240101000001_seed_data.sql** - Seeds topics and subreddits
3. **seed.sql** - Seeds mock Reddit posts and ideas

All files are idempotent (use `IF NOT EXISTS` and `ON CONFLICT DO NOTHING`).
