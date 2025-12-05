import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth/middleware'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { getProviderManager } from '@/lib/ai/provider-manager'
import { moderateContent } from '@/lib/moderation/content-moderation'
import type { ApiResponse } from '@/types'
import { ProviderError } from '@/lib/ai/types'

export type EnhancementType = 'calmer' | 'funnier' | 'extend' | 'shorten'

interface EnhanceRequest {
  type: EnhancementType
}

/**
 * Enhance/rewrite an existing story
 * PRO feature - allows users to modify their stories
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { userId, response } = await requireAuth(request)
  if (response) return response

  try {
    // Get user profile to check subscription tier
    const { data: userProfile } = await supabaseAdmin
      .from('users')
      .select('subscription_tier')
      .eq('id', userId)
      .single()

    if (!userProfile) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'User profile not found',
        },
        { status: 404 }
      )
    }

    // Check if user has PRO or PRO MAX access
    if (userProfile.subscription_tier === 'trial') {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'PRO subscription required for story enhancement',
          data: { requiresUpgrade: true, requiredTier: 'pro' },
        },
        { status: 403 }
      )
    }

    // Get the story
    const storyId = params.id
    const { data: story, error: storyError } = await supabaseAdmin
      .from('stories')
      .select('*')
      .eq('id', storyId)
      .eq('user_id', userId)
      .single()

    if (storyError || !story) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'Story not found',
        },
        { status: 404 }
      )
    }

    // Parse request body
    const body: EnhanceRequest = await request.json()
    const { type } = body

    if (!type || !['calmer', 'funnier', 'extend', 'shorten'].includes(type)) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'Invalid enhancement type. Must be: calmer, funnier, extend, or shorten',
        },
        { status: 400 }
      )
    }

    // Generate enhancement prompt based on type
    const enhancementPrompt = getEnhancementPrompt(type, story.content, story.child_name)

    // Moderate the enhancement request
    const moderationResult = await moderateContent(enhancementPrompt)
    if (moderationResult.flagged) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'Enhancement request contains inappropriate content. Please try again.',
          data: { moderationFlagged: true },
        },
        { status: 400 }
      )
    }

    // Generate enhanced story using AI
    const providerManager = getProviderManager()
    
    // Include the current story content in the prompt for context
    const fullPrompt = `${enhancementPrompt}\n\nCurrent story:\n${story.content}\n\nRewritten story:`
    
    const enhancedContent = await providerManager.generateText({
      childName: story.child_name,
      adjectives: story.adjectives,
      theme: story.theme,
      moral: story.moral,
      customPrompt: fullPrompt,
    })

    // Moderate the enhanced content
    const outputModeration = await moderateContent(enhancedContent)
    if (outputModeration.flagged) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'Enhanced story contains inappropriate content. Please try again.',
          data: { moderationFlagged: true },
        },
        { status: 400 }
      )
    }

    // Update story with enhanced content
    const { error: updateError } = await supabaseAdmin
      .from('stories')
      .update({
        content: enhancedContent,
        updated_at: new Date().toISOString(),
      })
      .eq('id', storyId)

    if (updateError) {
      throw updateError
    }

    return NextResponse.json<ApiResponse<{ content: string }>>({
      success: true,
      data: {
        content: enhancedContent,
      },
      message: `Story ${getEnhancementMessage(type)} successfully!`,
    })
  } catch (error) {
    console.error('Error enhancing story:', error)

    if (error instanceof ProviderError) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'Story enhancement service unavailable. Please try again later.',
        },
        { status: 503 }
      )
    }

    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: 'Failed to enhance story',
      },
      { status: 500 }
    )
  }
}

/**
 * Generate enhancement prompt based on type
 */
function getEnhancementPrompt(
  type: EnhancementType,
  currentContent: string,
  childName: string
): string {
  const baseInstructions = `Rewrite the following children's story about ${childName}. Keep it kid-safe, wholesome, and engaging. Maintain the same general plot and characters.`

  switch (type) {
    case 'calmer':
      return `${baseInstructions} Make the story more peaceful and calming. Reduce any excitement or tension. Use softer language and create a more serene atmosphere. Perfect for bedtime reading. Keep it around the same length.`

    case 'funnier':
      return `${baseInstructions} Make the story funnier and more playful. Add more humor, silly situations, and funny dialogue. Make it more entertaining and lighthearted. Keep it around the same length.`

    case 'extend':
      return `${baseInstructions} Extend the story by adding more details, scenes, and character development. Make it longer (approximately 50% more content) while maintaining the same tone and style. Add more adventures and interactions.`

    case 'shorten':
      return `${baseInstructions} Shorten the story while keeping the main plot points and key moments. Make it more concise (approximately 50% shorter) while maintaining the essence and message of the story.`

    default:
      return baseInstructions
  }
}

/**
 * Get user-friendly enhancement message
 */
function getEnhancementMessage(type: EnhancementType): string {
  switch (type) {
    case 'calmer':
      return 'made calmer'
    case 'funnier':
      return 'made funnier'
    case 'extend':
      return 'extended'
    case 'shorten':
      return 'shortened'
    default:
      return 'enhanced'
  }
}

