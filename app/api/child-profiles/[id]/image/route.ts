/**
 * Child Profile Image Upload & Generation API - PRO MAX Feature
 * Handles image upload, analysis, and generation of stylized variations
 */

import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth/middleware'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { getProviderManager } from '@/lib/ai/provider-manager'
import { checkRateLimit, RATE_LIMITS, getRateLimitHeaders } from '@/lib/rate-limit'
import type { ApiResponse } from '@/types'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { userId, response } = await requireAuth(request)
  if (response) return response

  // Rate limiting for profile image generation
  const rateLimitResult = checkRateLimit(userId, RATE_LIMITS.profileImageGeneration)
  if (!rateLimitResult.success) {
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: 'Too many profile image requests. Please wait before uploading another photo.',
      },
      { 
        status: 429,
        headers: getRateLimitHeaders(rateLimitResult)
      }
    )
  }

  try {
    const profileId = params.id

    // Verify the profile belongs to the user
    const { data: existingProfile, error: fetchError } = await supabaseAdmin
      .from('child_profiles')
      .select('user_id, name, appearance')
      .eq('id', profileId)
      .single<{ user_id: string; name: string; appearance: any }>()

    if (fetchError || !existingProfile) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Child profile not found' },
        { status: 404 }
      )
    }

    if (existingProfile.user_id !== userId) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Unauthorized' },
        { status: 403 }
      )
    }

    // Parse form data
    const formData = await request.formData()
    const imageFile = formData.get('image') as File

    if (!imageFile) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'No image file provided' },
        { status: 400 }
      )
    }

    // Validate file type
    if (!imageFile.type.startsWith('image/')) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Invalid file type. Please upload an image.' },
        { status: 400 }
      )
    }

    // Convert file to base64
    const buffer = Buffer.from(await imageFile.arrayBuffer())
    const base64Image = buffer.toString('base64')
    
    const providerManager = getProviderManager()

    // Step 1: Analyze Image
    console.log(`Analyzing image for profile ${profileId}...`)
    const description = await providerManager.analyzeImage(
      base64Image,
      `Describe this child for a character illustration. Focus on:
      1. Hair color and style
      2. Eye color
      3. Skin tone
      4. Distinctive features (freckles, glasses, etc.)
      5. Clothing style/colors
      6. Facial expression
      Keep it concise (under 50 words). Do not include background details.`
    )
    
    console.log('Image analysis result:', description)

    // Step 2: Generate 3 Variations
    const themes = [
      {
        id: 'pixar',
        name: '3D Animation',
        promptSuffix: 'in the style of a high-quality 3D animated movie (Pixar/Disney style). Cute, expressive, vibrant colors, soft lighting, 3D render, 8k.'
      },
      {
        id: 'disney',
        name: 'Storybook',
        promptSuffix: 'in the style of a classic hand-drawn storybook illustration. Watercolors, soft edges, whimsical, charming, warm atmosphere, detailed background.'
      },
      {
        id: 'anime',
        name: 'Anime',
        promptSuffix: 'in the style of Studio Ghibli anime. Vibrant, clean lines, expressive eyes, beautiful lighting, atmospheric, detailed.'
      }
    ]

    const generatePromises = themes.map(async (theme) => {
      const prompt = `Character illustration of a child: ${description}. 
      Create this ${theme.promptSuffix}
      The character should be facing forward or slightly to the side, suitable for a profile picture.
      Ensure the character looks friendly and approachable.`

      try {
        const images = await providerManager.generateImages({
          prompt,
          count: 1,
          size: '1024x1024',
          style: theme.id === 'pixar' ? 'vivid' : 'natural' // Use vivid for 3D
        })
        
        return {
          url: images[0],
          theme: theme.name,
          description: description
        }
      } catch (err) {
        console.error(`Failed to generate ${theme.name} variation:`, err)
        return null
      }
    })

    const results = await Promise.all(generatePromises)
    const successfulImages = results.filter(Boolean)

    if (successfulImages.length === 0) {
      throw new Error('Failed to generate any images')
    }

    return NextResponse.json({
      success: true,
      data: {
        images: successfulImages,
        analysis: description
      }
    })

  } catch (error: any) {
    console.error('Error uploading/processing child profile image:', error)
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: error.message || 'Failed to process image'
      },
      { status: 500 }
    )
  }
}
