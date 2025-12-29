#!/bin/bash
# Execute Supabase SQL migrations in order
#
# Usage:
#   ./scripts/execute-migrations.sh
#
# Requires DATABASE_URL or Supabase connection details

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

SQL_FILES=(
  "supabase/migrations/20240101000000_initial_schema.sql"
  "supabase/migrations/20240101000001_seed_data.sql"
  "supabase/seed.sql"
)

echo "🚀 Starting SQL migration execution..."
echo ""

# Check for psql
if ! command -v psql &> /dev/null; then
  echo "❌ ERROR: psql not found"
  echo "Please install PostgreSQL client or use Supabase Dashboard SQL Editor"
  exit 1
fi

# Check for DATABASE_URL
if [ -z "$DATABASE_URL" ]; then
  echo "❌ ERROR: DATABASE_URL environment variable not set"
  echo ""
  echo "To get your DATABASE_URL:"
  echo "1. Go to your Supabase project dashboard"
  echo "2. Navigate to Settings > Database"
  echo "3. Copy the 'Connection string' (URI format)"
  echo "4. Set it as: export DATABASE_URL='postgresql://...'"
  echo ""
  echo "Alternatively, execute SQL files manually in Supabase SQL Editor:"
  for file in "${SQL_FILES[@]}"; do
    echo "  - $file"
  done
  exit 1
fi

echo "✅ Using DATABASE_URL for connection"
echo ""

# Execute each SQL file
for file in "${SQL_FILES[@]}"; do
  file_path="$PROJECT_ROOT/$file"
  
  if [ ! -f "$file_path" ]; then
    echo "❌ ERROR: File not found: $file_path"
    exit 1
  fi
  
  echo "📄 Executing: $file"
  
  if psql "$DATABASE_URL" -f "$file_path"; then
    echo "✅ Successfully executed: $file"
  else
    echo "❌ Failed to execute: $file"
    exit 1
  fi
  echo ""
done

echo "✅ All migrations executed successfully!"

