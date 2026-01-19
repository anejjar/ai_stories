import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey)

async function debugSchema() {
    console.log('🔍 Debugging schema...')
    
    const tables = ['users', 'usage', 'email_preferences']
    
    for (const table of tables) {
        console.log(`\n--- Checking table: ${table} ---`)
        const { data, error } = await supabase
            .from(table)
            .select('*')
            .limit(0)
            
        if (error) {
            console.error(`❌ Error on table ${table}:`, error.message)
        } else {
            console.log(`✅ Table ${table} exists.`)
            // Try to get column names if possible by selecting one row or using a trick
            const { data: colData, error: colError } = await supabase.rpc('get_table_columns', { t_name: table })
            if (colError) {
                // Alternative: select * limit 1 and check keys
                const { data: sample } = await supabase.from(table).select('*').limit(1)
                if (sample && sample.length > 0) {
                    console.log('Columns:', Object.keys(sample[0]))
                } else {
                    console.log('No rows to check columns.')
                }
            } else {
                console.log('Columns:', colData)
            }
        }
    }
}

debugSchema()





