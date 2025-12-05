/**
 * Child Profile Image Selection API - PRO MAX Feature
 * Saves the selected AI-generated image to permanent storage
 */

import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth/middleware'
import { supabaseAdmin } from '@/lib/supabase/admin'
import type { ApiResponse } from '@/types'

export async function POST(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  const { userId, response } = await requireAuth(request)
  if (response) return response

  try {
    const profileId = params.id

    // Verify the profile belongs to the user
    const { data: existingProfile, error: fetchError } = await supabaseAdmin
      .from('child_profiles')
      .select('user_id')
      .eq('id', profileId)
      .single()

    if (fetchError || !existingProfile) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Child profile not found' },
        { status: 404 }
      )
    }

    // @ts-expect-error - Supabase type inference issue with Manual Database definition
    if (existingProfile.user_id !== userId) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Unauthorized' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { imageUrl, theme } = body

    if (!imageUrl) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'No image URL provided' },
        { status: 400 }
      )
    }

    // Download image from temporary URL
    const imageResponse = await fetch(imageUrl)
    if (!imageResponse.ok) {
      throw new Error('Failed to download generated image')
    }
    const imageBuffer = await imageResponse.arrayBuffer()

    // Upload to Supabase Storage
    const fileName = `${userId}/${profileId}/${Date.now()}-${theme || 'generated'}.png`
    const bucketName = 'child-profiles' // Assuming this bucket exists or 'stories' bucket is used? 
    // The migration 006 says: "only AI-generated versions are stored". 
    // We should check if 'child-profiles' bucket exists. 
    // The migration 005 created 'stories' bucket. 
    // I'll use 'stories' bucket but organize under 'child-profiles' folder to be safe, or try 'child-profiles' bucket if I create it.
    // Let's assume we use the 'stories' bucket for now as it's already set up, or create 'child-profiles' bucket if needed.
    // Actually, migration 005 creates 'stories'. Migration 006 doesn't create a bucket.
    // Let's use 'stories' bucket for now, path: `child-profiles/${profileId}/avatar.png`

    const storagePath = `child-profiles/${profileId}/${Date.now()}.png`

    // Upload using admin client to bypass RLS if needed
    const { data: uploadData, error: uploadError } = await supabaseAdmin
      .storage
      .from('stories') // Using 'stories' bucket as shared storage
      .upload(storagePath, imageBuffer, {
        contentType: 'image/png',
        upsert: true
      })

    if (uploadError) {
      throw uploadError
    }

    // Get public URL
    const { data: { publicUrl } } = supabaseAdmin
      .storage
      .from('stories')
      .getPublicUrl(storagePath)

    // Update profile
    const { error: updateError } = await (supabaseAdmin
      .from('child_profiles') as any)
      .update({
        ai_generated_image_url: publicUrl,
        updated_at: new Date().toISOString(),
      })
      .eq('id', profileId)

    if (updateError) {
      throw updateError
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      message: 'Profile picture updated successfully!',
      data: { imageUrl: publicUrl }
    })

  } catch (error: any) {
    console.error('Error saving child profile image:', error)
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: error.message || 'Failed to save image'
      },
      { status: 500 }
    )
  }
}

