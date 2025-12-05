import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth/middleware'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { getProviderManager } from '@/lib/ai/provider-manager'
import { checkTrialLimit, incrementTrialUsage } from '@/lib/trial/trial-service-server'
import { validateStoryInput } from '@/lib/moderation/content-moderation'
import { checkRateLimit, RATE_LIMITS, getRateLimitHeaders } from '@/lib/rate-limit'
import type { ApiResponse, StoryInput, Story } from '@/types'
import { storyToDatabaseStory, databaseStoryToStory, firestoreStoryToStory, type DatabaseStory } from '@/types/database'
import { ProviderError } from '@/lib/ai/types'

// Helper to get user profile from Supabase (server-side)
async function getUserProfile(userId: string) {
  const { data, error } = await supabaseAdmin
    .from('users')
    .select('subscription_tier')
    .eq('id', userId)
    .single<{ subscription_tier: string }>()

  if (error || !data) {
    return null
  }
  
  return {
    subscriptionTier: data.subscription_tier || 'trial',
  }
}

// Helper to generate story title from content
function generateStoryTitle(content: string, childName: string, theme: string): string {
  // Extract first sentence or use a default pattern
  const firstSentence = content.split('.')[0]?.trim()
  if (firstSentence && firstSentence.length < 60) {
    return firstSentence
  }
  return `${childName}'s ${theme} Adventure`
}

export async function GET(request: NextRequest) {
  const { userId, response } = await requireAuth(request)
  if (response) return response

  try {
    // Get query parameters
    const { searchParams } = new URL(request.url)
    const limitParam = searchParams.get('limit')
    const storyLimit = limitParam ? parseInt(limitParam, 10) : 50

    // Fetch user's stories from Supabase
    const { data: storiesData, error } = await supabaseAdmin
      .from('stories')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(storyLimit)

    if (error) {
      throw error
    }

    const stories: Story[] = (storiesData || []).map((data) =>
      databaseStoryToStory(data)
    )

    return NextResponse.json<ApiResponse<Story[]>>({
      success: true,
      data: stories,
    })
  } catch (error) {
    console.error('Error fetching stories:', error)
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: 'Failed to fetch stories',
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  const { userId, response } = await requireAuth(request)
  if (response) return response

  // Rate limiting
  const rateLimitResult = checkRateLimit(userId, RATE_LIMITS.storyGeneration)
  if (!rateLimitResult.success) {
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: 'Too many requests. Please wait before creating another story.',
      },
      { 
        status: 429,
        headers: getRateLimitHeaders(rateLimitResult)
      }
    )
  }

  try {
    // Get user profile to check subscription tier
    const userProfile = await getUserProfile(userId)
    if (!userProfile) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'User profile not found',
        },
        { status: 404 }
      )
    }

    const subscriptionTier = userProfile.subscriptionTier

    // Check if user can generate stories
    if (subscriptionTier === 'trial') {
      const trialLimitReached = await checkTrialLimit(userId)
      if (trialLimitReached) {
        return NextResponse.json<ApiResponse>(
          {
            success: false,
            error: 'Trial limit reached. Please upgrade to continue creating stories.',
            data: { requiresUpgrade: true },
          },
          { status: 403 }
        )
      }
    }

    // Parse request body
    const body = await request.json()
    const storyInput: StoryInput = {
      childName: body.childName,
      adjectives: body.adjectives,
      children: body.children, // Multi-child support
      theme: body.theme,
      moral: body.moral,
      generateImages: body.generateImages || false,
      templateId: body.templateId,
      appearance: body.appearance, // PRO MAX only (deprecated, use children[].appearance)
    }

    // Validate required fields - support both single and multi-child
    const isMultiChild = storyInput.children && storyInput.children.length > 0
    if (isMultiChild) {
      // Multi-child validation
      if (!storyInput.children || storyInput.children.length === 0) {
        return NextResponse.json<ApiResponse>(
          {
            success: false,
            error: 'Missing required fields: children array',
          },
          { status: 400 }
        )
      }
      for (const child of storyInput.children) {
        if (!child.name || !child.adjectives || child.adjectives.length === 0) {
          return NextResponse.json<ApiResponse>(
            {
              success: false,
              error: 'Each child must have a name and at least one adjective',
            },
            { status: 400 }
          )
        }
      }
    } else {
      // Single-child validation (backward compatible)
      if (!storyInput.childName || !storyInput.adjectives || !storyInput.theme) {
        return NextResponse.json<ApiResponse>(
          {
            success: false,
            error: 'Missing required fields: childName, adjectives, theme',
          },
          { status: 400 }
        )
      }
    }

    if (!storyInput.theme) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'Missing required field: theme',
        },
        { status: 400 }
      )
    }

    // Content moderation - validate for kid-safe content
    const validation = isMultiChild
      ? validateStoryInput({
          childName: storyInput.children![0].name, // Use first child for validation
          adjectives: storyInput.children![0].adjectives,
          theme: storyInput.theme,
          moral: storyInput.moral,
        })
      : validateStoryInput({
          childName: storyInput.childName!,
          adjectives: storyInput.adjectives!,
          theme: storyInput.theme,
          moral: storyInput.moral,
        })

    if (!validation.isValid) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: validation.errors.join('. '),
        },
        { status: 400 }
      )
    }

    // Generate story using configured AI provider with fallback
    const providerManager = getProviderManager()
    
    // Prepare generation request - support both single and multi-child
    const generationRequest = isMultiChild
      ? {
          children: storyInput.children!,
          theme: storyInput.theme,
          moral: storyInput.moral,
          templateId: storyInput.templateId,
          // For backward compatibility, also include first child's data
          childName: storyInput.children![0].name,
          adjectives: storyInput.children![0].adjectives,
        }
      : {
          childName: storyInput.childName!,
          adjectives: storyInput.adjectives!,
          theme: storyInput.theme,
          moral: storyInput.moral,
          templateId: storyInput.templateId,
        }
    
    const storyContent = await providerManager.generateText(generationRequest)

    // Generate story title
    const titleChildName = isMultiChild
      ? storyInput.children!.map((c) => c.name).join(' & ')
      : storyInput.childName!
    const storyTitle = generateStoryTitle(
      storyContent,
      titleChildName,
      storyInput.theme
    )

    // Handle image generation for PRO MAX users
    let imageUrls: string[] = []
    if (storyInput.generateImages && subscriptionTier === 'pro_max') {
      // For MVP, images are generated after story creation via separate endpoint
      // This allows users to review the story first, then add illustrations
      imageUrls = []
    }

    // Save story to Supabase
    const storyData = storyToDatabaseStory({
      userId,
      title: storyTitle,
      content: storyContent,
      // Backward compatibility fields
      childName: isMultiChild ? storyInput.children![0].name : storyInput.childName!,
      adjectives: isMultiChild ? storyInput.children![0].adjectives : storyInput.adjectives!,
      // New multi-child support
      children: isMultiChild ? storyInput.children : undefined,
      theme: storyInput.theme,
      moral: storyInput.moral,
      hasImages: storyInput.generateImages || false,
      imageUrls: imageUrls.length > 0 ? imageUrls : undefined,
      // Deprecated: kept for backward compatibility
      appearance: subscriptionTier === 'pro_max' && !isMultiChild ? storyInput.appearance : undefined,
    })

    const { data: createdStory, error: insertError } = await supabaseAdmin
      .from('stories')
      .insert(storyData as any)
      .select()
      .single<DatabaseStory>()

    if (insertError || !createdStory) {
      throw new Error('Failed to save story to database')
    }

    // Update trial usage if trial user
    if (subscriptionTier === 'trial') {
      await incrementTrialUsage(userId)
    }

    const story: Story = databaseStoryToStory(createdStory)

    return NextResponse.json<ApiResponse<Story>>({
      success: true,
      data: story,
    })
  } catch (error) {
    console.error('Error creating story:', error)
    
    // Handle specific error types
    if (error instanceof Error) {
      if (error.message.includes('Trial limit')) {
        return NextResponse.json<ApiResponse>(
          {
            success: false,
            error: error.message,
            data: { requiresUpgrade: true },
          },
          { status: 403 }
        )
      }
      
      if (error instanceof ProviderError || error.message.includes('API') || error.message.includes('provider')) {
        return NextResponse.json<ApiResponse>(
          {
            success: false,
            error: 'Failed to generate story. Please try again.',
          },
          { status: 500 }
        )
      }
    }

    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: 'Failed to create story',
      },
      { status: 500 }
    )
  }
}
