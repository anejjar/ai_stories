/**
 * Individual Child Profile API - PRO MAX Feature
 */

import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth/middleware'
import { supabaseAdmin } from '@/lib/supabase/admin'
import type { ApiResponse, ChildProfile } from '@/types'
import { databaseChildProfileToChildProfile, childProfileToDatabaseChildProfile } from '@/types/database'

// PUT - Update a child profile
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { userId, response } = await requireAuth(request)
  if (response) return response

  try {
    const profileId = params.id

    // Verify the profile belongs to the user
    const { data: existingProfile, error: fetchError } = await supabaseAdmin
      .from('child_profiles')
      .select('user_id')
      .eq('id', profileId)
      .single<{ user_id: string }>()

    if (fetchError || !existingProfile) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'Child profile not found',
        },
        { status: 404 }
      )
    }

    if (existingProfile.user_id !== userId) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'Unauthorized',
        },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { name, nickname, birthDate, appearance } = body

    // Update profile
    const updateData: Record<string, any> = {}
    if (name !== undefined) updateData.name = name.trim()
    if (nickname !== undefined) updateData.nickname = nickname?.trim() || null
    if (birthDate !== undefined) updateData.birth_date = birthDate ? new Date(birthDate).toISOString().split('T')[0] : null
    if (appearance !== undefined) updateData.appearance = appearance || null

    const { data: updatedProfile, error: updateError } = await (supabaseAdmin
      .from('child_profiles') as any)
      .update(updateData)
      .eq('id', profileId)
      .select()
      .single()

    if (updateError || !updatedProfile) {
      throw updateError || new Error('Failed to update child profile')
    }

    const childProfile: ChildProfile = databaseChildProfileToChildProfile(updatedProfile)

    return NextResponse.json<ApiResponse<{ profile: ChildProfile }>>({
      success: true,
      message: 'Child profile updated successfully!',
      data: { profile: childProfile },
    })
  } catch (error: any) {
    console.error('Error updating child profile:', error)
    
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
        error: 'Failed to update child profile',
      },
      { status: 500 }
    )
  }
}

// DELETE - Delete a child profile
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { userId, response } = await requireAuth(request)
  if (response) return response

  try {
    const profileId = params.id

    // Verify the profile belongs to the user
    const { data: existingProfile, error: fetchError } = await supabaseAdmin
      .from('child_profiles')
      .select('user_id')
      .eq('id', profileId)
      .single<{ user_id: string }>()

    if (fetchError || !existingProfile) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'Child profile not found',
        },
        { status: 404 }
      )
    }

    if (existingProfile.user_id !== userId) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'Unauthorized',
        },
        { status: 403 }
      )
    }

    // Delete profile
    const { error: deleteError } = await supabaseAdmin
      .from('child_profiles')
      .delete()
      .eq('id', profileId)

    if (deleteError) {
      throw deleteError
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      message: 'Child profile deleted successfully!',
    })
  } catch (error) {
    console.error('Error deleting child profile:', error)
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: 'Failed to delete child profile',
      },
      { status: 500 }
    )
  }
}

