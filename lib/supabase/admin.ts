// Server-side Supabase Admin configuration

import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'
import type { SupabaseClient } from '@supabase/supabase-js'

let _supabaseAdmin: SupabaseClient<Database> | null = null

// Lazy initialization of Supabase admin client
// This prevents errors during build when environment variables might not be available
function getSupabaseAdmin(): SupabaseClient<Database> {
  if (_supabaseAdmin) {
    return _supabaseAdmin
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new Error(
      'Missing Supabase environment variables. ' +
      'Please ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set.'
    )
  }

  _supabaseAdmin = createClient<Database>(
    supabaseUrl,
    supabaseServiceRoleKey,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
      db: {
        schema: 'public',
      },
      global: {
        headers: {
          'x-client-info': 'ai-stories-server',
        },
      },
    }
  )

  return _supabaseAdmin
}

// Export a proxy that lazily initializes the client
export const supabaseAdmin = new Proxy({} as SupabaseClient<Database>, {
  get(target, prop) {
    const client = getSupabaseAdmin()
    const value = client[prop as keyof SupabaseClient<Database>]
    return typeof value === 'function' ? value.bind(client) : value
  },
})

