
import { createClient } from '@supabase/supabase-js'
import type { Database } from '../types/database'

// Test the Insert type resolution directly
type UserInsert = Database['public']['Tables']['users']['Insert']

const testData: UserInsert = {
    id: 'uid',
    email: 'test@example.com',
    display_name: 'Test Usr',
    photo_url: 'http://example.com/photo.jpg',
    subscription_tier: 'trial',
    stripe_customer_id: null,
    stripe_subscription_id: null
}

console.log('Type check passed for object assignment')

const supabase = createClient<Database>('', '')

async function test() {
    return supabase.from('users').insert(testData).select()
}
