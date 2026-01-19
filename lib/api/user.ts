import { cache } from 'react'
import { supabaseAdmin } from '@/lib/supabase/admin'
import type { SubscriptionTier } from '@/types'

/**
 * Fetch user profile from Supabase with request-level memoization.
 * React cache() ensures that multiple calls to this function within the same
 * request lifecycle only result in one database query.
 */
export const getMemoizedUserProfile = cache(async (userId: string) => {
  console.log(`[DB Query] Fetching profile for user ${userId}`)
  
  const { data, error } = await supabaseAdmin
    .from('users')
    .select('subscription_tier, display_name, email, onboarding_completed, onboarding_step, onboarding_dismissed_at, onboarding_checklist')
    .eq('id', userId)
    .single()

  if (error || !data) {
    console.error(`Error fetching user profile for ${userId}:`, error)
    return null
  }

  return {
    id: userId,
    subscriptionTier: (data.subscription_tier as SubscriptionTier) || 'trial',
    displayName: data.display_name,
    email: data.email,
    onboardingCompleted: data.onboarding_completed,
    onboardingStep: data.onboarding_step,
    onboardingDismissedAt: data.onboarding_dismissed_at ? new Date(data.onboarding_dismissed_at) : undefined,
    onboardingChecklist: data.onboarding_checklist
  }
})

/**
 * Get user's subscription tier with memoization.
 */
export async function getSubscriptionTier(userId: string): Promise<SubscriptionTier> {
  const profile = await getMemoizedUserProfile(userId)
  return profile?.subscriptionTier || 'trial'
}

