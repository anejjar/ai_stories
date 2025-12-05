import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth/middleware'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { getProviderManager } from '@/lib/ai/provider-manager'
import { uploadImagesToStorage } from '@/lib/supabase/storage'
import { checkRateLimit, RATE_LIMITS, getRateLimitHeaders } from '@/lib/rate-limit'
import type { ApiResponse } from '@/types'
import type { ImageGenerationRequest } from '@/lib/ai/types'
import { ProviderError } from '@/lib/ai/types'
import type { DatabaseStory } from '@/types/database'

/**
 * Generate images for an existing story (PRO MAX feature)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Check if user has PRO MAX access
    if (userProfile.subscription_tier !== 'pro_max') {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'PRO MAX subscription required for image generation',
          data: { requiresUpgrade: true, requiredTier: 'pro_max' },
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

    // Generate image prompts from story content
    // For MVP, we'll generate 3-5 key scenes from the story
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

    // Generate images using configured image provider
    const providerManager = getProviderManager()
    const imageUrls: string[] = []

    for (const prompt of imagePrompts) {
      try {
        const imageRequest: ImageGenerationRequest = {
          prompt,
          count: 1,
          size: '1024x1024',
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

    // Upload images to Supabase Storage
    let storageUrls: string[] = []
    try {
      storageUrls = await uploadImagesToStorage(imageUrls, storyId)
    } catch (storageError) {
      console.error('Error uploading images to storage, using original URLs:', storageError)
      // Fallback to original URLs if storage upload fails
      storageUrls = imageUrls
    }

    // Update story with image URLs (prefer storage URLs, fallback to original)
    const finalImageUrls = storageUrls.length > 0 ? storageUrls : imageUrls
    const updatePayload: Record<string, any> = {
      has_images: true,
      image_urls: finalImageUrls,
    }
    const { error: updateError } = await (supabaseAdmin
      .from('stories') as any)
      .update(updatePayload)
      .eq('id', storyId)

    if (updateError) {
      throw updateError
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
 * Generate image prompts from story content
 * Extracts key scenes and creates kid-friendly, safe prompts
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
  // Split story into paragraphs
  const paragraphs = content
    .split('\n\n')
    .filter((p) => p.trim().length > 50) // Filter out very short paragraphs

  // Select 3-5 key scenes (beginning, middle, end)
  const sceneCount = Math.min(5, Math.max(3, paragraphs.length))
  const selectedParagraphs = [
    paragraphs[0], // Beginning
    ...paragraphs.slice(1, -1).slice(0, sceneCount - 2), // Middle scenes
    paragraphs[paragraphs.length - 1], // End
  ].filter(Boolean)

  // Build appearance description
  let appearanceDesc = ''
  if (appearance) {
    const parts: string[] = []
    if (appearance.skinTone) parts.push(`${appearance.skinTone} skin`)
    if (appearance.hairColor && appearance.hairStyle) {
      parts.push(`${appearance.hairColor} ${appearance.hairStyle} hair`)
    } else if (appearance.hairColor) {
      parts.push(`${appearance.hairColor} hair`)
    }
    appearanceDesc = parts.length > 0 ? `, ${parts.join(', ')}` : ''
  }

  // Generate prompts for each scene
  return selectedParagraphs.map((paragraph, index) => {
    // Extract key visual elements
    const scene = paragraph
      .substring(0, 200) // Limit length
      .replace(/[^\w\s.,!?-]/g, '') // Remove special chars
      .trim()

    return `A beautiful, kid-friendly illustration for a children's storybook. The scene shows ${childName}${appearanceDesc} in a ${theme.toLowerCase()} setting. ${scene}. Style: colorful, whimsical, safe for children, storybook illustration, soft colors, friendly characters, no scary elements.`
  })
}

/**
 * Generate image prompts from multi-child story content
 */
function generateImagePromptsFromMultiChildStory(
  content: string,
  children: any[],
  theme: string
): string[] {
  // Split story into paragraphs
  const paragraphs = content
    .split('\n\n')
    .filter((p) => p.trim().length > 50) // Filter out very short paragraphs

  // Select 3-5 key scenes (beginning, middle, end)
  const sceneCount = Math.min(5, Math.max(3, paragraphs.length))
  const selectedParagraphs = [
    paragraphs[0], // Beginning
    ...paragraphs.slice(1, -1).slice(0, sceneCount - 2), // Middle scenes
    paragraphs[paragraphs.length - 1], // End
  ].filter(Boolean)

  // Build children description with appearances
  const childrenNames = children.map((c: any) => c.name).join(' and ')
  const childrenDescriptions = children.map((child: any, index: number) => {
    const parts: string[] = [child.name]
    if (child.appearance) {
      if (child.appearance.skinTone) parts.push(`${child.appearance.skinTone} skin`)
      if (child.appearance.hairColor && child.appearance.hairStyle) {
        parts.push(`${child.appearance.hairColor} ${child.appearance.hairStyle} hair`)
      } else if (child.appearance.hairColor) {
        parts.push(`${child.appearance.hairColor} hair`)
      }
    }
    return parts.join(' with ')
  }).join(', ')

  // Generate prompts for each scene
  return selectedParagraphs.map((paragraph, index) => {
    // Extract key visual elements
    const scene = paragraph
      .substring(0, 200) // Limit length
      .replace(/[^\w\s.,!?-]/g, '') // Remove special chars
      .trim()

    return `A beautiful, kid-friendly illustration for a children's storybook. The scene shows ${childrenDescriptions} together in a ${theme.toLowerCase()} setting. ${scene}. Style: colorful, whimsical, safe for children, storybook illustration, soft colors, friendly characters, no scary elements, multiple children playing together.`
  })
}

