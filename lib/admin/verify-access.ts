// Server-side admin access verification for server components and layouts

import { createServerSupabaseClient } from '@/lib/supabase/server'
import { hasSuperadminAccess } from '@/lib/auth/admin-middleware'

/**
 * Server-side function to verify superadmin access
 * Use in server components, layouts, and route handlers
 *
 * @returns true if the current user has superadmin access, false otherwise
 *
 * @example
 * ```typescript
 * // In a server component or layout
 * export default async function AdminLayout({ children }) {
 *   const hasAccess = await verifyAdminAccess()
 *   if (!hasAccess) {
 *     redirect('/dashboard?error=admin_access_required')
 *   }
 *   return <div>{children}</div>
 * }
 * ```
 */
export async function verifyAdminAccess(): Promise<boolean> {
  try {
    const supabase = await createServerSupabaseClient()

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return false
    }

    // Get user role from database
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (userError || !userData) {
      return false
    }

    return hasSuperadminAccess(userData.role)
  } catch (error) {
    console.error('Error verifying admin access:', error)
    return false
  }
}

/**
 * Get current admin user details (if authenticated as superadmin)
 *
 * @returns Admin user details or null
 */
export async function getCurrentAdminUser() {
  try {
    const supabase = await createServerSupabaseClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return null
    }

    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id, email, display_name, role')
      .eq('id', user.id)
      .single()

    if (userError || !userData || !hasSuperadminAccess(userData.role)) {
      return null
    }

    return userData
  } catch (error) {
    console.error('Error getting current admin user:', error)
    return null
  }
}
