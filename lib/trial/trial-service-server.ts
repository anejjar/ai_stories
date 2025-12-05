// Server-side trial usage tracking service

import { supabaseAdmin } from '@/lib/supabase/admin'
import type { TrialUsage } from '@/types'
import { databaseTrialUsageToTrialUsage } from '@/types/database'

const TRIAL_LIMIT = 1

/**
 * Check if user has reached trial limit (server-side)
 */
export async function checkTrialLimit(userId: string): Promise<boolean> {
  const { data } = await supabaseAdmin
    .from('usage')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (!data) {
    return false // No trial usage yet, so limit not reached
  }

  return (data.stories_generated || 0) >= TRIAL_LIMIT || data.trial_completed === true
}

/**
 * Increment trial usage counter (server-side)
 */
export async function incrementTrialUsage(userId: string): Promise<TrialUsage> {
  // Get current usage
  const { data: currentData } = await supabaseAdmin
    .from('usage')
    .select('*')
    .eq('user_id', userId)
    .single()

  let currentCount = 0
  if (!currentData) {
    // Initialize if doesn't exist
    const { error } = await supabaseAdmin.from('usage').insert({
      user_id: userId,
      stories_generated: 0,
      trial_completed: false,
    })
    if (error && error.code !== '23505') {
      // Ignore duplicate key errors
      throw error
    }
  } else {
    currentCount = currentData.stories_generated || 0
  }

  const newCount = currentCount + 1
  const isCompleted = newCount >= TRIAL_LIMIT

  const { data, error } = await supabaseAdmin
    .from('usage')
    .update({
      stories_generated: newCount,
      trial_completed: isCompleted,
      trial_completed_at: isCompleted ? new Date().toISOString() : null,
    })
    .eq('user_id', userId)
    .select()
    .single()

  if (error || !data) {
    throw new Error('Failed to increment trial usage')
  }

  return databaseTrialUsageToTrialUsage(data)
}

