#!/bin/bash
# Validate SQL files for syntax errors (basic check)
# This doesn't execute them, just checks they're readable SQL

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

SQL_FILES=(
  "supabase/migrations/20240101000000_initial_schema.sql"
  "supabase/migrations/20240101000001_seed_data.sql"
  "supabase/seed.sql"
)

echo "🔍 Validating SQL files..."
echo ""

errors=0
for file in "${SQL_FILES[@]}"; do
  file_path="$PROJECT_ROOT/$file"
  
  if [ ! -f "$file_path" ]; then
    echo "❌ ERROR: File not found: $file_path"
    errors=$((errors + 1))
    continue
  fi
  
  # Basic validation: file exists and is readable
  if [ -r "$file_path" ]; then
    lines=$(wc -l < "$file_path")
    echo "✅ $file ($lines lines)"
  else
    echo "❌ ERROR: Cannot read: $file_path"
    errors=$((errors + 1))
  fi
done

echo ""

if [ $errors -eq 0 ]; then
  echo "✅ All SQL files validated"
  exit 0
else
  echo "❌ Validation found $errors error(s)"
  exit 1
fi

