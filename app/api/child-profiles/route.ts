/**
 * Child Profiles API - PRO MAX Feature
 * Allows parents to create and manage profiles for their children
 */

import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth/middleware'
import { supabaseAdmin } from '@/lib/supabase/admin'
import type { ApiResponse, ChildProfile } from '@/types'
import { databaseChildProfileToChildProfile, childProfileToDatabaseChildProfile } from '@/types/database'

// GET - List all child profiles for the authenticated user
export async function GET(request: NextRequest) {
  const { userId, response } = await requireAuth(request)
  if (response) return response

  try {
    // Get user profile to check subscription tier
    const { data: userProfile } = await supabaseAdmin
      .from('users')
      .select('subscription_tier')
      .eq('id', userId)
      .single<{ subscription_tier: string }>()

    if (!userProfile) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'User profile not found',
        },
        { status: 404 }
      )
    }

    // Check if user has PRO MAX access
    if (userProfile.subscription_tier !== 'pro_max') {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'PRO MAX subscription required for child profiles',
          data: { requiresUpgrade: true, requiredTier: 'pro_max' },
        },
        { status: 403 }
      )
    }

    // Fetch child profiles
    const { data: profiles, error } = await supabaseAdmin
      .from('child_profiles')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true })

    if (error) {
      throw error
    }

    const childProfiles: ChildProfile[] = (profiles || []).map(databaseChildProfileToChildProfile)

    return NextResponse.json<ApiResponse<{ profiles: ChildProfile[] }>>({
      success: true,
      data: { profiles: childProfiles },
    })
  } catch (error) {
    console.error('Error fetching child profiles:', error)
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: 'Failed to fetch child profiles',
      },
      { status: 500 }
    )
  }
}

// POST - Create a new child profile
export async function POST(request: NextRequest) {
  const { userId, response } = await requireAuth(request)
  if (response) return response

  try {
    // Get user profile to check subscription tier
    const { data: userProfile } = await supabaseAdmin
      .from('users')
      .select('subscription_tier')
      .eq('id', userId)
      .single<{ subscription_tier: string }>()

    if (!userProfile) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'User profile not found',
        },
        { status: 404 }
      )
    }

    // Check if user has PRO MAX access
    if (userProfile.subscription_tier !== 'pro_max') {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'PRO MAX subscription required for child profiles',
          data: { requiresUpgrade: true, requiredTier: 'pro_max' },
        },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { name, nickname, birthDate, appearance } = body

    // Validate required fields
    if (!name || !name.trim()) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'Child name is required',
        },
        { status: 400 }
      )
    }

    // Create child profile
    const profileData = childProfileToDatabaseChildProfile({
      userId,
      name: name.trim(),
      nickname: nickname?.trim() || undefined,
      birthDate: birthDate ? new Date(birthDate) : undefined,
      appearance: appearance || undefined,
    })

    const { data: createdProfile, error: insertError } = await supabaseAdmin
      .from('child_profiles')
      .insert(profileData as any)
      .select()
      .single()

    if (insertError || !createdProfile) {
      throw insertError || new Error('Failed to create child profile')
    }

    const childProfile: ChildProfile = databaseChildProfileToChildProfile(createdProfile)

    return NextResponse.json<ApiResponse<{ profile: ChildProfile }>>({
      success: true,
      message: 'Child profile created successfully!',
      data: { profile: childProfile },
    })
  } catch (error: any) {
    console.error('Error creating child profile:', error)
    
    // Handle unique constraint violation
    if (error.code === '23505' || error.message?.includes('unique')) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'A profile with this name already exists',
        },
        { status: 400 }
      )
    }

    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: 'Failed to create child profile',
      },
      { status: 500 }
    )
  }
}

