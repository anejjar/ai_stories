// Supabase Auth helper functions

import { User as SupabaseUser } from '@supabase/supabase-js'
import { supabaseAdmin } from '@/lib/supabase/admin'
import type { User, SubscriptionTier } from '@/types'

/**
 * Get user ID from Supabase Auth token (server-side)
 */
export async function getUserIdFromToken(token: string): Promise<string | null> {
  try {
    const { data, error } = await supabaseAdmin.auth.getUser(token)
    if (error || !data.user) {
      return null
    }
    return data.user.id
  } catch (error) {
    console.error('Error verifying token:', error)
    return null
  }
}

/**
 * Get user ID from request headers (server-side)
 */
export async function getUserIdFromRequest(
  headers: Headers
): Promise<string | null> {
  const authHeader = headers.get('authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return null
  }
  const token = authHeader.split('Bearer ')[1]
  return getUserIdFromToken(token)
}

/**
 * Convert Supabase User to app User type
 */
export function supabaseUserToUser(
  supabaseUser: SupabaseUser,
  subscriptionTier: SubscriptionTier = 'trial'
): Partial<User> {
  return {
    id: supabaseUser.id,
    email: supabaseUser.email || '',
    displayName: supabaseUser.user_metadata?.display_name || supabaseUser.user_metadata?.full_name || undefined,
    photoURL: supabaseUser.user_metadata?.avatar_url || supabaseUser.user_metadata?.picture || undefined,
    subscriptionTier,
  }
}

// Legacy compatibility function
export function firebaseUserToUser(
  user: any,
  subscriptionTier: SubscriptionTier = 'trial'
): Partial<User> {
  return supabaseUserToUser(user, subscriptionTier)
}

/**
 * Check if user has access to a feature based on subscription tier
 */
export function hasFeatureAccess(
  userTier: SubscriptionTier,
  requiredTier: SubscriptionTier
): boolean {
  const tierHierarchy: Record<SubscriptionTier, number> = {
    trial: 0,
    pro: 1,
    pro_max: 2,
  }
  return tierHierarchy[userTier] >= tierHierarchy[requiredTier]
}

/**
 * Check if user can generate stories
 */
export function canGenerateStory(
  userTier: SubscriptionTier,
  storiesGenerated: number
): boolean {
  if (userTier === 'trial') {
    return storiesGenerated < 1
  }
  return userTier === 'pro' || userTier === 'pro_max'
}

/**
 * Check if user can generate images
 */
export function canGenerateImages(userTier: SubscriptionTier): boolean {
  return userTier === 'pro_max'
}

