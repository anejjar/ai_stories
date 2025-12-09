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
    const { imageUrl, theme, aiDescription } = body

    if (!imageUrl) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'No image URL provided' },
        { status: 400 }
      )
    }

    let imageBuffer: ArrayBuffer
    const startTime = Date.now()

    // Handle data URLs (base64) directly - no need to download
    if (imageUrl.startsWith('data:image/')) {
      console.log('Processing base64 image data...')
      try {
        // Extract base64 data from data URL
        const base64Data = imageUrl.split(',')[1]
        if (!base64Data) {
          throw new Error('Invalid data URL format')
        }
        imageBuffer = Buffer.from(base64Data, 'base64').buffer
        console.log(`Base64 image processed in ${Date.now() - startTime}ms`)
      } catch (error) {
        throw new Error('Failed to process base64 image data')
      }
    } else {
      // Download image from URL with timeout
      console.log('Downloading image from URL...')
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout

      try {
        const imageResponse = await fetch(imageUrl, {
          signal: controller.signal,
        })
        clearTimeout(timeoutId)

        if (!imageResponse.ok) {
          throw new Error(`Failed to download image: ${imageResponse.status} ${imageResponse.statusText}`)
        }

        imageBuffer = await imageResponse.arrayBuffer()
        console.log(`Image downloaded in ${Date.now() - startTime}ms`)
      } catch (error: any) {
        clearTimeout(timeoutId)
        if (error.name === 'AbortError') {
          throw new Error('Image download timeout - please try again')
        }
        throw new Error(`Failed to download image: ${error.message}`)
      }
    }

    // Upload to Supabase Storage with optimized path (fallbacks to original URL on failure)
    const storagePath = `child-profiles/${profileId}/${Date.now()}.png`
    const uploadStartTime = Date.now()
    let publicUrl = imageUrl as string

    try {
      console.log('Uploading image to storage...')
      // Upload using admin client with timeout handling
      const uploadPromise = supabaseAdmin
        .storage
        .from('stories') // Using 'stories' bucket as shared storage
        .upload(storagePath, imageBuffer, {
          contentType: 'image/png',
          upsert: true,
          cacheControl: '3600', // Cache for 1 hour
        })

      const { data: uploadData, error: uploadError } = await uploadPromise

      if (uploadError) {
        throw uploadError
      }

      console.log(`Image uploaded in ${Date.now() - uploadStartTime}ms`)

      // Get public URL
      const { data: { publicUrl: storageUrl } } = supabaseAdmin
        .storage
        .from('stories')
        .getPublicUrl(storagePath)

      if (!storageUrl) {
        throw new Error('Supabase returned no public URL for uploaded image')
      }

      publicUrl = storageUrl
    } catch (uploadError: any) {
      // Fall back to original URL (often a data URL) so the user still succeeds
      console.error('Error uploading image to storage, using original URL instead:', uploadError)
      publicUrl = imageUrl
    }

    // Update profile (optimized - only update necessary fields)
    console.log('Updating profile...')
    const updateData: any = {
      ai_generated_image_url: publicUrl,
      updated_at: new Date().toISOString(),
    }

    // Save AI description if provided (for consistent illustration generation)
    if (aiDescription) {
      updateData.ai_description = aiDescription
    }

    const { error: updateError } = await (supabaseAdmin
      .from('child_profiles') as any)
      .update(updateData)
      .eq('id', profileId)
      .select('id') // Only select id to minimize response size

    if (updateError) {
      console.error('Update error:', updateError)
      throw updateError
    }

    console.log(`Profile updated successfully in ${Date.now() - startTime}ms total`)

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

