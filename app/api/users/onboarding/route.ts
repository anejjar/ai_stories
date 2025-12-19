/**
 * Onboarding API
 * Manages user onboarding state and progress
 */

import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth/middleware'
import { supabaseAdmin } from '@/lib/supabase/admin'
import type {
  ApiResponse,
  OnboardingUpdateRequest,
  OnboardingState,
} from '@/types'

// PATCH - Update onboarding state
export async function PATCH(request: NextRequest) {
  const { userId, response } = await requireAuth(request)
  if (response) return response

  try {
    const body: OnboardingUpdateRequest = await request.json()

    // Get current onboarding state
    const { data: currentUser, error: fetchError } = await supabaseAdmin
      .from('users')
      .select('onboarding_completed, onboarding_step, onboarding_dismissed_at, onboarding_checklist')
      .eq('id', userId)
      .single()

    if (fetchError || !currentUser) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'User not found',
        },
        { status: 404 }
      )
    }

    // Build update object
    const updates: any = {}

    // Update step
    if (body.step) {
      updates.onboarding_step = body.step
    }

    // Update completed status
    if (body.completed !== undefined) {
      updates.onboarding_completed = body.completed
    }

    // Update dismissed status
    if (body.dismissed !== undefined) {
      if (body.dismissed) {
        updates.onboarding_dismissed_at = new Date().toISOString()
      } else {
        updates.onboarding_dismissed_at = null
      }
    }

    // Update checklist item
    if (body.checklistUpdate) {
      const checklist = currentUser.onboarding_checklist || {
        items: [
          { id: 'first_story', label: 'Create your first story', completed: false },
          { id: 'create_profile', label: 'Add a child profile', completed: false },
          { id: 'try_theme', label: 'Explore different themes', completed: false },
          { id: 'customize_appearance', label: 'Customize character appearance', completed: false },
          { id: 'visit_discover', label: 'Discover community stories', completed: false },
          { id: 'read_achievement', label: 'Start a reading streak', completed: false },
        ],
        dismissed: false,
      }

      // Special case for dismissing checklist
      if (body.checklistUpdate.itemId === '_dismiss') {
        checklist.dismissed = true
      } else {
        // Update specific checklist item
        const itemIndex = checklist.items.findIndex(
          (item: any) => item.id === body.checklistUpdate!.itemId
        )

        if (itemIndex !== -1) {
          checklist.items[itemIndex].completed = body.checklistUpdate.completed
          if (body.checklistUpdate.completed) {
            checklist.items[itemIndex].completedAt = new Date().toISOString()
          }
        }
      }

      updates.onboarding_checklist = checklist
    }

    // Update user record
    const { data: updatedUser, error: updateError } = await supabaseAdmin
      .from('users')
      .update(updates)
      .eq('id', userId)
      .select('onboarding_completed, onboarding_step, onboarding_dismissed_at, onboarding_checklist')
      .single()

    if (updateError) {
      throw updateError
    }

    const onboardingState: OnboardingState = {
      onboardingCompleted: updatedUser.onboarding_completed,
      onboardingStep: updatedUser.onboarding_step,
      onboardingDismissedAt: updatedUser.onboarding_dismissed_at
        ? new Date(updatedUser.onboarding_dismissed_at)
        : undefined,
      onboardingChecklist: updatedUser.onboarding_checklist,
    }

    return NextResponse.json<ApiResponse<OnboardingState>>({
      success: true,
      data: onboardingState,
      message: 'Onboarding updated successfully',
    })
  } catch (error) {
    console.error('Error updating onboarding:', error)
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update onboarding',
      },
      { status: 500 }
    )
  }
}

// GET - Get current onboarding state
export async function GET(request: NextRequest) {
  const { userId, response } = await requireAuth(request)
  if (response) return response

  try {
    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select('onboarding_completed, onboarding_step, onboarding_dismissed_at, onboarding_checklist')
      .eq('id', userId)
      .single()

    if (error || !user) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'User not found',
        },
        { status: 404 }
      )
    }

    const onboardingState: OnboardingState = {
      onboardingCompleted: user.onboarding_completed,
      onboardingStep: user.onboarding_step,
      onboardingDismissedAt: user.onboarding_dismissed_at
        ? new Date(user.onboarding_dismissed_at)
        : undefined,
      onboardingChecklist: user.onboarding_checklist,
    }

    return NextResponse.json<ApiResponse<OnboardingState>>({
      success: true,
      data: onboardingState,
    })
  } catch (error) {
    console.error('Error fetching onboarding:', error)
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch onboarding',
      },
      { status: 500 }
    )
  }
}
