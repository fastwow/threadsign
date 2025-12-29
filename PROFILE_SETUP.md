# Supabase Profile Auto-Creation Setup

This SQL sets up automatic profile creation for authenticated users in Supabase.

## What This Does

1. Creates a `public.profiles` table linked to `auth.users`
2. Sets up a trigger that automatically creates a profile when a user signs up
3. Configures Row Level Security (RLS) policies so users can only read/update their own profile

## SQL File

The complete SQL is in: `supabase/migrations/setup_profiles.sql`

## Quick Setup

Copy and paste the SQL from `supabase/migrations/setup_profiles.sql` into your Supabase SQL Editor and run it.

## Features

✅ **Idempotent** - Safe to run multiple times
✅ **Secure** - Uses RLS to restrict access
✅ **Automatic** - Trigger handles profile creation
✅ **Extensible** - Table can be extended with additional columns later

## Verification

After running the SQL:

1. Sign up a new user through your auth flow
2. Check the `profiles` table - you should see a new row with the user's id and email
3. Try querying the profile - users should only be able to see/update their own profile

## Note

This setup is already included in the main migration file `20240101000000_initial_schema.sql`. Use this standalone file if you only need the profile setup.
