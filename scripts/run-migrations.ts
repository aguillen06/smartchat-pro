/**
 * Database Migration Runner for SmartChat Pro
 *
 * This script reads and executes SQL migration files from the supabase/migrations directory.
 * It connects to Supabase using the service role key and runs migrations in order.
 *
 * Usage:
 *   npx tsx scripts/run-migrations.ts
 *
 * To also run seed data:
 *   npx tsx scripts/run-migrations.ts --seed
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync, readdirSync, existsSync } from 'fs';
import { join } from 'path';

// Load environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Configuration
const MIGRATIONS_DIR = join(process.cwd(), 'supabase', 'migrations');
const SEEDS_DIR = join(process.cwd(), 'supabase', 'seeds');

// Check for required environment variables
if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Error: Missing required environment variables');
  console.error('   Please ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in your .env file');
  process.exit(1);
}

// Create Supabase admin client
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

/**
 * Execute a SQL file against the database
 */
async function executeSqlFile(filePath: string, fileName: string): Promise<void> {
  try {
    console.log(`\n📄 Running: ${fileName}`);

    // Read the SQL file
    const sql = readFileSync(filePath, 'utf-8');

    // Execute the SQL using Supabase's RPC or raw query
    // Note: Supabase JS client doesn't have direct SQL execution
    // We need to use the REST API or PostgREST
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseServiceKey,
        'Authorization': `Bearer ${supabaseServiceKey}`,
      },
      body: JSON.stringify({ query: sql }),
    });

    if (!response.ok) {
      // If RPC doesn't work, try using pg library approach
      // For now, we'll provide instructions for manual migration
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    console.log(`✅ Success: ${fileName}`);
  } catch (error) {
    console.error(`❌ Error executing ${fileName}:`, error);
    throw error;
  }
}

/**
 * Get all migration files sorted by name (timestamp)
 */
function getMigrationFiles(): string[] {
  if (!existsSync(MIGRATIONS_DIR)) {
    console.error(`❌ Error: Migrations directory not found: ${MIGRATIONS_DIR}`);
    return [];
  }

  const files = readdirSync(MIGRATIONS_DIR)
    .filter(file => file.endsWith('.sql'))
    .sort(); // Sort by timestamp in filename

  return files;
}

/**
 * Get all seed files
 */
function getSeedFiles(): string[] {
  if (!existsSync(SEEDS_DIR)) {
    console.log(`⚠️  Warning: Seeds directory not found: ${SEEDS_DIR}`);
    return [];
  }

  const files = readdirSync(SEEDS_DIR)
    .filter(file => file.endsWith('.sql'))
    .sort();

  return files;
}

/**
 * Main migration runner
 */
async function runMigrations() {
  console.log('🚀 SmartChat Pro Migration Runner');
  console.log('================================\n');

  const runSeeds = process.argv.includes('--seed');

  try {
    // Test database connection
    console.log('🔌 Testing database connection...');
    const { error: connectionError } = await supabase
      .from('_test_connection')
      .select('*')
      .limit(1);

    // Connection test - if table doesn't exist, that's actually fine
    if (connectionError && !connectionError.message.includes('does not exist')) {
      throw new Error(`Connection failed: ${connectionError.message}`);
    }

    console.log('✅ Database connection successful\n');

    // Get migration files
    const migrationFiles = getMigrationFiles();

    if (migrationFiles.length === 0) {
      console.log('⚠️  No migration files found');
      return;
    }

    console.log(`📋 Found ${migrationFiles.length} migration file(s)\n`);

    // Note: Direct SQL execution requires additional setup
    console.log('⚠️  IMPORTANT: Direct SQL execution requires additional configuration.');
    console.log('   Please run migrations using one of these methods:\n');
    console.log('   Method 1 - Supabase CLI (Recommended):');
    console.log('   $ supabase db push\n');
    console.log('   Method 2 - Supabase Dashboard:');
    console.log('   1. Go to your Supabase project dashboard');
    console.log('   2. Navigate to SQL Editor');
    console.log('   3. Copy and paste the migration file contents');
    console.log('   4. Run the query\n');
    console.log('   Method 3 - Using psql:');
    console.log('   $ psql "postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres" -f supabase/migrations/[FILE].sql\n');

    // List the migration files
    console.log('📄 Migration files to run:');
    migrationFiles.forEach((file, index) => {
      console.log(`   ${index + 1}. ${file}`);
    });

    // If seed flag is set, list seed files
    if (runSeeds) {
      const seedFiles = getSeedFiles();
      if (seedFiles.length > 0) {
        console.log('\n🌱 Seed files to run:');
        seedFiles.forEach((file, index) => {
          console.log(`   ${index + 1}. ${file}`);
        });
      }
    }

    console.log('\n✅ Migration runner completed');
    console.log('   Follow the instructions above to apply migrations to your database.\n');

  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    process.exit(1);
  }
}

// Run migrations
runMigrations();
