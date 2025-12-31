import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth/middleware'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { getProviderManager } from '@/lib/ai/provider-manager'
import { uploadImagesToStorage, getSuccessfulUploadUrls } from '@/lib/supabase/storage'
import { retryDatabaseOperation } from '@/lib/database/retry'
import { checkRateLimit, RATE_LIMITS, getRateLimitHeaders } from '@/lib/rate-limit'
import type { ApiResponse } from '@/types'
import type { ImageGenerationRequest } from '@/lib/ai/types'
import { ProviderError } from '@/lib/ai/types'
import type { DatabaseStory } from '@/types/database'
import {
  buildEnhancedIllustrationPrompt,
  buildAppearanceDescription,
  determineCharacterTier,
  selectArtStyle,
  determineMoodFromScene,
  type IllustrationRequest
} from '@/lib/ai/illustration-prompt-builder'
import { extractScenesFromStory, extractKeyVisualMoment } from '@/lib/ai/scene-extractor'

/**
 * Generate images for an existing story (Family Plan feature)
 */
export async function POST(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  const { userId, response } = await requireAuth(request)
  if (response) return response

  // Rate limiting for expensive image generation
  const rateLimitResult = checkRateLimit(userId, RATE_LIMITS.imageGeneration)
  if (!rateLimitResult.success) {
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: 'Too many image generation requests. Please wait before generating more images.',
      },
      {
        status: 429,
        headers: getRateLimitHeaders(rateLimitResult)
      }
    )
  }

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

    // Check if user has Family Plan access
    if (userProfile.subscription_tier !== 'family') {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'Family Plan subscription required for image generation',
          data: { requiresUpgrade: true, requiredTier: 'family' },
        },
        { status: 403 }
      )
    }

    // Get the story
    const storyId = params.id
    const { data: story, error: storyError } = await supabaseAdmin
      .from('stories')
      .select('*, appearance, children')
      .eq('id', storyId)
      .eq('user_id', userId)
      .single<DatabaseStory>()

    if (storyError || !story) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'Story not found',
        },
        { status: 404 }
      )
    }

    // Parse request body for image generation options
    const body = await request.json().catch(() => ({}))
    const { scenes, style, appearance: requestAppearance } = body

    // Check if this is a multi-child story
    const isMultiChild = story.children && Array.isArray(story.children) && story.children.length > 0
    const children = isMultiChild ? (story.children as any[]) : undefined

    // Use appearance from request body, or fall back to story's saved appearance
    // For multi-child, use children[].appearance; for single-child, use story.appearance
    const appearance = requestAppearance || (isMultiChild ? undefined : (story.appearance as any))

    // Generate image prompts using enhanced prompt builder for consistency
    const imagePrompts = isMultiChild && children
      ? generateImagePromptsFromMultiChildStory(
        story.content,
        children,
        story.theme
      )
      : generateImagePromptsFromStory(
        story.content,
        story.child_name,
        story.theme,
        appearance
      )

    // Helper function to randomly select aspect ratio
    const selectRandomAspectRatio = (): 'square' | 'portrait' | 'landscape' => {
      const ratios: Array<'square' | 'portrait' | 'landscape'> = ['square', 'portrait', 'landscape']
      return ratios[Math.floor(Math.random() * ratios.length)]
    }

    // Helper function to map aspect ratio to size
    const getSizeForAspectRatio = (aspectRatio: 'square' | 'portrait' | 'landscape'): '1024x1024' | '1024x1792' | '1792x1024' => {
      switch (aspectRatio) {
        case 'square':
          return '1024x1024'
        case 'portrait':
          return '1024x1792'
        case 'landscape':
          return '1792x1024'
      }
    }

    // Generate images using configured image provider
    const providerManager = getProviderManager()
    const imageUrls: string[] = []

    for (const prompt of imagePrompts) {
      try {
        // Randomly select aspect ratio for visual variety
        const aspectRatio = selectRandomAspectRatio()
        const size = getSizeForAspectRatio(aspectRatio)

        const imageRequest: ImageGenerationRequest = {
          prompt,
          count: 1,
          size: size,
          style: style || 'natural',
        }

        const urls = await providerManager.generateImages(imageRequest)
        imageUrls.push(...urls)
      } catch (error) {
        console.error('Error generating image:', error)
        // Continue with other images even if one fails
      }
    }

    if (imageUrls.length === 0) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'Failed to generate any images. Please try again.',
        },
        { status: 500 }
      )
    }

    // Upload images to Supabase Storage with detailed results
    console.log(`📤 Uploading ${imageUrls.length} images to storage...`)
    const uploadResults = await uploadImagesToStorage(imageUrls, storyId)
    const successfulResults = uploadResults.filter(r => r.success)
    const failedResults = uploadResults.filter(r => !r.success)

    console.log(`📊 Upload complete: ${successfulResults.length}/${imageUrls.length} successful`)

    // Get successful upload URLs
    const storageUrls = getSuccessfulUploadUrls(successfulResults)
    
    // Fallback to original URLs for failed uploads (if any)
    const finalImageUrls = storageUrls.length > 0 ? storageUrls : imageUrls

    // Update story with image URLs using retry
    const updatePayload: Record<string, any> = {
      has_images: storageUrls.length > 0,
      image_urls: finalImageUrls,
    }

    try {
      await retryDatabaseOperation(async () => {
        const { error: updateError } = await (supabaseAdmin
          .from('stories') as any)
          .update(updatePayload)
          .eq('id', storyId)

        if (updateError) {
          throw new Error(`Failed to update story with images: ${updateError.message}`)
        }
      })

      if (failedResults.length > 0) {
        console.warn(`⚠️ ${failedResults.length} image upload(s) failed, but story updated with ${successfulResults.length} successful upload(s)`)
      }
    } catch (updateError) {
      console.error('Failed to update story with images:', updateError)
      throw new Error(`Images uploaded but failed to update story: ${updateError instanceof Error ? updateError.message : String(updateError)}`)
    }

    return NextResponse.json<ApiResponse<{ imageUrls: string[] }>>({
      success: true,
      data: {
        imageUrls: finalImageUrls,
      },
    })
  } catch (error) {
    console.error('Error generating images:', error)

    if (error instanceof ProviderError) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'Image generation service unavailable. Please try again later.',
        },
        { status: 503 }
      )
    }

    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: 'Failed to generate images',
      },
      { status: 500 }
    )
  }
}

/**
 * Generate image prompts from story content using enhanced prompt builder
 * Extracts key scenes and creates consistent, kid-friendly prompts
 */
function generateImagePromptsFromStory(
  content: string,
  childName: string,
  theme: string,
  appearance?: {
    skinTone?: string
    hairColor?: string
    hairStyle?: string
  }
): string[] {
  // Determine character rendering tier
  const characterTier = determineCharacterTier(undefined, appearance as any)
  
  // Build character description
  let characterDescription: string | undefined
  let includeCharacter = true
  
  if (characterTier === 'appearance' && appearance) {
    characterDescription = buildAppearanceDescription(appearance as any, childName)
  } else {
    includeCharacter = false
    characterDescription = undefined
  }

  // Extract scenes using shared scene extractor
  const scenes = extractScenesFromStory(
    content,
    childName,
    theme,
    characterDescription,
    includeCharacter
  )

  // Select 3-5 key scenes (beginning, middle, end)
  const sceneCount = Math.min(5, Math.max(3, scenes.length))
  const selectedScenes = [
    scenes[0], // Beginning
    ...scenes.slice(1, -1).slice(0, sceneCount - 2), // Middle scenes
    scenes[scenes.length - 1], // End
  ].filter(Boolean)

  // Determine art style ONCE for the entire story
  const storyArtStyle = selectArtStyle(theme, 'exciting')

  // Generate prompts using enhanced prompt builder
  return selectedScenes.map((scene, index) => {
    const mood = determineMoodFromScene(scene.text)
    
    const illustrationRequest: IllustrationRequest = {
      sceneDescription: extractKeyVisualMoment(scene.text, childName),
      childName,
      childDescription: characterDescription,
      theme,
      mood,
      artStyle: storyArtStyle, // Use story-level art style for consistency
      includeCharacter,
      sceneNumber: index + 1,
      totalScenes: selectedScenes.length,
    }

    return buildEnhancedIllustrationPrompt(illustrationRequest)
  })
}

/**
 * Generate image prompts from multi-child story content using enhanced prompt builder
 */
function generateImagePromptsFromMultiChildStory(
  content: string,
  children: any[],
  theme: string
): string[] {
  // Use first child as main character for scene extraction
  const mainChild = children[0]
  const mainChildName = mainChild?.name || 'children'
  
  // Build character description for main child
  let characterDescription: string | undefined
  if (mainChild?.appearance) {
    characterDescription = buildAppearanceDescription(mainChild.appearance, mainChildName)
  }
  
  // Build description of other children
  const otherChildren = children.slice(1).map((c: any) => {
    const parts: string[] = [c.name]
    if (c.appearance) {
      if (c.appearance.skinTone) parts.push(`${c.appearance.skinTone} skin`)
      if (c.appearance.hairColor && c.appearance.hairStyle) {
        parts.push(`${c.appearance.hairColor} ${c.appearance.hairStyle} hair`)
      } else if (c.appearance.hairColor) {
        parts.push(`${c.appearance.hairColor} hair`)
      }
    }
    return parts.join(' with ')
  }).join(', ')
  
  const fullChildDescription = otherChildren
    ? `${characterDescription || 'friendly child'}. With friends: ${otherChildren}`
    : characterDescription || 'friendly children'

  // Extract scenes using shared scene extractor
  const scenes = extractScenesFromStory(
    content,
    mainChildName,
    theme,
    fullChildDescription,
    true // Always include character for multi-child
  )

  // Select 3-5 key scenes (beginning, middle, end)
  const sceneCount = Math.min(5, Math.max(3, scenes.length))
  const selectedScenes = [
    scenes[0], // Beginning
    ...scenes.slice(1, -1).slice(0, sceneCount - 2), // Middle scenes
    scenes[scenes.length - 1], // End
  ].filter(Boolean)

  // Determine art style ONCE for the entire story
  const storyArtStyle = selectArtStyle(theme, 'exciting')

  // Generate prompts using enhanced prompt builder
  return selectedScenes.map((scene, index) => {
    const mood = determineMoodFromScene(scene.text)
    
    const illustrationRequest: IllustrationRequest = {
      sceneDescription: extractKeyVisualMoment(scene.text, mainChildName),
      childName: mainChildName,
      childDescription: fullChildDescription,
      theme,
      mood,
      artStyle: storyArtStyle, // Use story-level art style for consistency
      includeCharacter: true,
      sceneNumber: index + 1,
      totalScenes: selectedScenes.length,
    }

    return buildEnhancedIllustrationPrompt(illustrationRequest)
  })
}

