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
import { readFileSync, readdirSync } from 'fs'
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
        // Read all SQL files in the migrations directory
        const migrationsDir = join(process.cwd(), 'supabase', 'migrations')
        const migrationFiles = readdirSync(migrationsDir)
            .filter(file => file.endsWith('.sql'))
            .sort()

        console.log(`📂 Found ${migrationFiles.length} migration files in ${migrationsDir}`)

        for (const file of migrationFiles) {
            console.log(`📝 Checking migration: ${file}...`)
            const migrationPath = join(migrationsDir, file)
            const migrationSQL = readFileSync(migrationPath, 'utf-8')

            // Execute the SQL
            const { error } = await supabase.rpc('exec_sql', { sql: migrationSQL })

            if (error) {
                if (error.message.includes('function "exec_sql" does not exist')) {
                    console.log(`⚠️  "exec_sql" function not found. Please run ${file} manually in the Supabase SQL Editor.`)
                    console.log('='.repeat(80))
                    console.log(migrationSQL)
                    console.log('='.repeat(80))
                } else {
                    console.error(`❌ Error applying migration ${file}:`, error.message)
                }
                continue
            }
            console.log(`✅ Migration ${file} applied successfully!`)
        }

        // Verify the columns exist
        console.log('\n🔍 Verifying schema...')
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
        console.log('\n📋 Manual migration might be required. If the error persists, please run your SQL files manually in the Supabase SQL Editor.')
    }
}

applyMigrations()
