// User profile creation and management service

import { User as SupabaseUser } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase/client'
import type { User, SubscriptionTier } from '@/types'
import { databaseUserToUser, userToDatabaseUser } from '@/types/database'

/**
 * Create or update user profile in Supabase
 */
export async function createUserProfile(
  supabaseUser: SupabaseUser,
  subscriptionTier: SubscriptionTier = 'trial'
): Promise<User> {
  const userId = supabaseUser.id

  // Get the current session to get the access token
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session) {
    // If no session (e.g., email confirmation required), use API route with admin client
    // This bypasses RLS and works even without an active session
    const response = await fetch('/api/auth/create-profile', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId, // Pass userId directly when no session
        email: supabaseUser.email || '',
        displayName: supabaseUser.user_metadata?.display_name || supabaseUser.user_metadata?.full_name || undefined,
        photoURL: supabaseUser.user_metadata?.avatar_url || supabaseUser.user_metadata?.picture || undefined,
        subscriptionTier,
      }),
    })

    const result = await response.json()
    if (!result.success || !result.data) {
      throw new Error(result.error || 'Failed to create user profile')
    }
    return result.data
  }

  // Use server-side API route that uses admin client to bypass RLS
  const response = await fetch('/api/auth/create-profile', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.access_token}`,
    },
    body: JSON.stringify({
      email: supabaseUser.email || '',
      displayName: supabaseUser.user_metadata?.display_name || supabaseUser.user_metadata?.full_name || undefined,
      photoURL: supabaseUser.user_metadata?.avatar_url || supabaseUser.user_metadata?.picture || undefined,
      subscriptionTier,
    }),
  })

  const result = await response.json()

  if (!result.success || !result.data) {
    throw new Error(result.error || 'Failed to create user profile')
  }

  return result.data
}

/**
 * Initialize trial usage tracking for a new user
 */
async function initializeTrialUsage(userId: string): Promise<void> {
  const { data: existingUsage } = await supabase
    .from('usage')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (!existingUsage) {
    const { error } = await supabase.from('usage').insert({
      user_id: userId,
      stories_generated: 0,
      trial_completed: false,
    })
    if (error) throw error
  }
}

/**
 * Update user subscription tier
 */
export async function updateUserSubscriptionTier(
  userId: string,
  tier: SubscriptionTier
): Promise<void> {
  const { error } = await supabase
    .from('users')
    .update({ subscription_tier: tier })
    .eq('id', userId)

  if (error) throw error
}

/**
 * Get user profile from Supabase
 */
export async function getUserProfile(userId: string): Promise<User | null> {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single()

  if (error || !data) {
    return null
  }

  return databaseUserToUser(data)
}

