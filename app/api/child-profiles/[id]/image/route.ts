/**
 * Child Profile Image Upload & Generation API - FAMILY PLAN Feature
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
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
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

    // Check subscription tier
    const { data: userProfile, error: profileError } = await supabaseAdmin
      .from('users')
      .select('subscription_tier')
      .eq('id', userId)
      .single<{ subscription_tier: string }>()

    if (profileError || !userProfile) {
      return NextResponse.json(
        { success: false, error: 'User profile not found' },
        { status: 404 }
      )
    }

    if (userProfile.subscription_tier !== 'family' && userProfile.subscription_tier !== 'pro') {
      // Allow Pro for now as per some logic, OR strictly Family? 
      // The original check was for 'family' (which I added).
      // Let's stick to 'family' as per requirement "Upgrade to FAMILY PLAN".
      // Actually, wait. Is it only Family?
      // The "Family Plan" is the new top tier.
    }

    if (userProfile.subscription_tier !== 'family') {
      return NextResponse.json(
        { success: false, error: 'Family Plan required to add photos to child profiles' },
        { status: 403 }
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

    // Step 1: Analyze Image with Enhanced Prompt for Better Consistency
    console.log(`Analyzing image for profile ${profileId}...`)
    const description = await providerManager.analyzeImage(
      base64Image,
      `You are analyzing a child's photo to create a detailed character description for consistent AI illustration generation across multiple images.

CRITICAL: Your description will be used to generate illustrations where the character MUST look identical every time. Be extremely specific and detailed.

Describe this child with precise details:

1. **Hair**: Exact color (e.g., "light brown with golden highlights"), exact style (e.g., "shoulder-length wavy", "short curly", "long straight with bangs"), texture, and any distinctive patterns

2. **Eyes**: Exact color (e.g., "bright hazel with green flecks", "deep brown"), shape (round, almond, wide-set), expression quality

3. **Skin Tone**: Precise description (e.g., "fair with rosy cheeks", "medium tan", "rich dark brown", "light olive")

4. **Face Shape & Features**: Face shape (round, oval, heart-shaped), distinctive features like freckles, dimples, nose shape, smile characteristics

5. **Physical Build**: Age-appropriate body type and height indicators (small/average/tall for age)

6. **Distinctive Characteristics**: Glasses, birthmarks, unique expressions, or other memorable features

7. **Typical Appearance**: Common clothing colors/styles that reflect their personality

Format your response as a single, detailed paragraph (60-100 words) that an AI can use to draw this exact same child repeatedly. Focus on permanent physical features, not temporary elements like specific outfits or backgrounds.

Example: "A 5-year-old girl with shoulder-length wavy brown hair with natural highlights, bright hazel eyes with green flecks, and fair skin with rosy cheeks. She has a round, friendly face with a distinctive dimple on her right cheek when she smiles. Medium height for her age with a cheerful, expressive demeanor. Often wears bright, playful colors like pink and purple."

Do NOT include: background details, props, or temporary elements.`
    )

    console.log('Enhanced image analysis result:', description)

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

    // Generate images with timeout and fail-fast logic
    const generatePromises = themes.map(async (theme) => {
      // Format prompt as a single line (DALL-E works better with single-line prompts)
      // Limit prompt to 1000 characters (DALL-E 3 has a 4000 char limit, but we'll be conservative)
      const basePrompt = `Character illustration of a child: ${description}. Create this ${theme.promptSuffix} The character should be facing forward or slightly to the side, suitable for a profile picture. Ensure the character looks friendly and approachable.`
      const prompt = basePrompt.length > 1000 ? basePrompt.substring(0, 1000) : basePrompt

      try {
        console.log(`Generating ${theme.name} variation with prompt length: ${prompt.length}`)

        // Add individual timeout per image generation (25 seconds)
        const timeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(() => reject(new Error(`Image generation timeout for ${theme.name}`)), 25000)
        })

        const images = await Promise.race([
          providerManager.generateImages({
            prompt,
            count: 1,
            size: '1024x1024',
            style: theme.id === 'pixar' ? 'vivid' : 'natural' // Use vivid for 3D
          }),
          timeoutPromise
        ])

        console.log(`Successfully generated ${theme.name} variation:`, images.length, 'images')
        return {
          url: images[0],
          theme: theme.name,
          description: description
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : String(err)
        console.error(`Failed to generate ${theme.name} variation:`, errorMessage)
        // Don't log full error to reduce noise, just the message
        return null
      }
    })

    // Use Promise.allSettled to get partial results even if some fail
    const results = await Promise.allSettled(generatePromises)
    const successfulImages = results
      .filter((result): result is PromiseFulfilledResult<{ url: string; theme: string; description: string }> =>
        result.status === 'fulfilled' && result.value !== null
      )
      .map(result => result.value)

    if (successfulImages.length === 0) {
      // Provide more helpful error message
      const failedCount = results.filter(r => r.status === 'rejected').length
      throw new Error(
        `Failed to generate any images. ${failedCount} attempts failed. ` +
        `Please check your image provider configuration (GEMINI_API_KEY or OPENAI_API_KEY).`
      )
    }

    // Log partial success
    if (successfulImages.length < themes.length) {
      console.log(`Generated ${successfulImages.length} out of ${themes.length} image variations`)
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
