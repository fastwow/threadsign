#!/usr/bin/env node
/**
 * Execute Supabase SQL migrations in order
 * 
 * Usage:
 *   node scripts/execute-migrations.mjs
 * 
 * Requires DATABASE_URL environment variable or connection details
 */

import { readFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { createClient } from '@supabase/supabase-js';
import pg from 'pg';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

const { Client } = pg;

// SQL files to execute in order
const SQL_FILES = [
  'supabase/migrations/20240101000000_initial_schema.sql',
  'supabase/migrations/20240101000001_seed_data.sql',
  'supabase/seed.sql',
];

async function getDatabaseClient() {
  // Try to get connection from environment
  const databaseUrl = process.env.DATABASE_URL;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (databaseUrl) {
    console.log('Using DATABASE_URL for direct PostgreSQL connection...');
    const client = new Client({
      connectionString: databaseUrl,
    });
    await client.connect();
    return { client, type: 'postgres' };
  } else if (supabaseUrl && supabaseServiceKey) {
    console.log('Using Supabase client (SQL execution via REST not supported)...');
    console.log('Please use DATABASE_URL or execute SQL files manually in Supabase dashboard.');
    process.exit(1);
  } else {
    console.error('ERROR: No database connection found.');
    console.error('Please set one of:');
    console.error('  - DATABASE_URL (PostgreSQL connection string)');
    console.error('  - NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY');
    console.error('\nAlternatively, execute SQL files manually in Supabase SQL Editor.');
    process.exit(1);
  }
}

async function executeSQLFile(client, filePath) {
  const fullPath = join(projectRoot, filePath);
  console.log(`\n📄 Executing: ${filePath}`);
  
  try {
    const sql = await readFile(fullPath, 'utf-8');
    
    // Execute SQL (PostgreSQL client handles multiple statements)
    await client.query(sql);
    
    console.log(`✅ Successfully executed: ${filePath}`);
    return true;
  } catch (error) {
    console.error(`❌ Error executing ${filePath}:`);
    console.error(error.message);
    if (error.position) {
      console.error(`   Position: ${error.position}`);
    }
    throw error;
  }
}

async function main() {
  console.log('🚀 Starting SQL migration execution...\n');
  
  let client;
  try {
    const connection = await getDatabaseClient();
    client = connection.client;
    
    console.log('✅ Connected to database\n');
    
    // Execute files in order
    for (const file of SQL_FILES) {
      await executeSQLFile(client, file);
    }
    
    console.log('\n✅ All migrations executed successfully!');
  } catch (error) {
    console.error('\n❌ Migration execution failed:');
    console.error(error);
    process.exit(1);
  } finally {
    if (client) {
      await client.end();
      console.log('\n🔌 Database connection closed');
    }
  }
}

main();

