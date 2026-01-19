// Server-side Supabase Admin configuration

import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'
import type { SupabaseClient } from '@supabase/supabase-js'
import { registerCleanupTask } from '@/lib/utils/graceful-shutdown'

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

  // Note: Supabase JavaScript client uses HTTP/REST API, not direct PostgreSQL connections
  // Connection pooling is handled automatically by Supabase infrastructure
  // For high-traffic scenarios, Supabase automatically manages connection pools
  // If you need direct PostgreSQL access with pooling, use the connection pooler URL:
  // Format: postgresql://[user]:[password]@[host].pooler.supabase.com:6543/[database]
  // But for REST API usage (this client), the standard URL is sufficient

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
        // Connection pooling is handled by Supabase infrastructure
        // The client automatically manages HTTP connection reuse
      },
    }
  )

  // Register cleanup task for graceful shutdown
  registerCleanupTask(() => {
    // Supabase client doesn't require explicit cleanup, but we log it
    console.log('🧹 Cleaning up Supabase connections...')
  })

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

