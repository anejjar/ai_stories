/**
 * Script to apply missing database migrations to Supabase
 * 
 * This script reads the combined migration SQL file and applies it to your Supabase database.
 * 
 * Usage:
 *   npm run migrate
 * 
 * Or directly:
 *   npx tsx scripts/apply-migrations.ts
 */
import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { join } from 'path'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceRoleKey) {
    console.error('❌ Missing Supabase environment variables')
    console.error('Required: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY')
    process.exit(1)
}

async function applyMigrations() {
    console.log('🔄 Connecting to Supabase...')

    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
        },
    })

    try {
        // Read the migration SQL file
        const migrationPath = join(process.cwd(), 'supabase', 'migrations', 'apply_missing_migrations.sql')
        const migrationSQL = readFileSync(migrationPath, 'utf-8')

        console.log('📝 Applying migrations...')
        console.log('Migration file:', migrationPath)

        // Execute the SQL
        const { error } = await supabase.rpc('exec_sql', { sql: migrationSQL })

        if (error) {
            // If exec_sql doesn't exist, try direct SQL execution
            console.log('⚠️  exec_sql function not found, trying alternative method...')
            console.log('\n📋 Please run the following SQL in your Supabase SQL Editor:')
            console.log('='.repeat(80))
            console.log(migrationSQL)
            console.log('='.repeat(80))
            console.log('\nSteps:')
            console.log('1. Go to your Supabase project dashboard')
            console.log('2. Navigate to SQL Editor')
            console.log('3. Copy and paste the SQL above')
            console.log('4. Click "Run" to execute')
            return
        }

        console.log('✅ Migrations applied successfully!')

        // Verify the columns exist
        console.log('\n🔍 Verifying migrations...')
        const { data, error: queryError } = await supabase
            .from('stories')
            .select('*')
            .limit(1)

        if (queryError) {
            console.error('❌ Error verifying migrations:', queryError.message)
        } else {
            console.log('✅ Verification successful!')
            if (data && data.length > 0) {
                const columns = Object.keys(data[0])
                const requiredColumns = ['appearance', 'children', 'parent_story_id', 'draft_number', 'is_selected_draft']
                const missingColumns = requiredColumns.filter(col => !columns.includes(col))

                if (missingColumns.length > 0) {
                    console.log('⚠️  Still missing columns:', missingColumns.join(', '))
                } else {
                    console.log('✅ All required columns are present!')
                }
            }
        }
    } catch (error) {
        console.error('❌ Error applying migrations:', error)
        console.log('\n📋 Manual migration required. Run this SQL in your Supabase SQL Editor:')
        console.log('='.repeat(80))
        const migrationPath = join(process.cwd(), 'supabase', 'migrations', 'apply_missing_migrations.sql')
        const migrationSQL = readFileSync(migrationPath, 'utf-8')
        console.log(migrationSQL)
        console.log('='.repeat(80))
    }
}

applyMigrations()
