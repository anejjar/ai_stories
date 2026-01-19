import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth/middleware'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { getProviderManager } from '@/lib/ai/provider-manager'
import { validateStoryInput } from '@/lib/moderation/content-moderation'
import { validateAIResponse } from '@/lib/moderation/ai-response-validator'
import type { ApiResponse, DraftGenerationRequest, Story } from '@/types'
import { storyToDatabaseStory, databaseStoryToStory } from '@/types/database'
import { ProviderError } from '@/lib/ai/types'

// Helper to get user profile from Supabase (server-side)
async function getUserProfile(userId: string) {
  const { data, error } = await (supabaseAdmin
    .from('users') as any)
    .select('subscription_tier')
    .eq('id', userId)
    .single()

  if (error || !data) {
    return null
  }

  return {
    subscriptionTier: data.subscription_tier || 'trial',
  }
}

// Helper to generate story title from content
function generateStoryTitle(content: string, childName: string, theme: string): string {
  const firstSentence = content.split('.')[0]?.trim()
  if (firstSentence && firstSentence.length < 60) {
    return firstSentence
  }
  return `${childName}'s ${theme} Adventure`
}

/**
 * POST /api/stories/drafts
 * Generate multiple story drafts from the same input
 * Requires PRO or FAMILY PLAN subscription
 */
export async function POST(request: NextRequest) {
  const { userId, response } = await requireAuth(request)
  if (response) return response

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

    // Only PRO and FAMILY PLAN users can generate drafts
    if (subscriptionTier === 'trial') {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'Draft generation is available for PRO and FAMILY PLAN subscribers. Please upgrade to continue.',
          data: { requiresUpgrade: true },
        },
        { status: 403 }
      )
    }

    // Parse request body
    const body = await request.json()
    const draftRequest: DraftGenerationRequest = {
      childName: body.childName,
      adjectives: body.adjectives,
      theme: body.theme,
      moral: body.moral,
      templateId: body.templateId,
      numberOfDrafts: body.numberOfDrafts || 3, // Default to 3 drafts
    }

    // Validate required fields
    if (!draftRequest.childName || !draftRequest.adjectives || !draftRequest.theme) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'Missing required fields: childName, adjectives, theme',
        },
        { status: 400 }
      )
    }

    // Validate number of drafts (limit to 5 for performance)
    const numberOfDrafts = Math.min(Math.max(1, draftRequest.numberOfDrafts || 3), 5)

    // Content moderation - validate for kid-safe content
    const validation = validateStoryInput({
      childName: draftRequest.childName,
      adjectives: draftRequest.adjectives,
      theme: draftRequest.theme,
      moral: draftRequest.moral,
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

    // Generate multiple drafts using configured AI provider
    const providerManager = getProviderManager()
    const drafts: Story[] = []
    let parentStoryId: string | undefined = undefined

    // Generate all drafts
    for (let i = 0; i < numberOfDrafts; i++) {
      try {
        // Generate story content with slight variation in temperature/prompt for diversity
        const storyContent = await providerManager.generateText({
          childName: draftRequest.childName,
          adjectives: draftRequest.adjectives,
          theme: draftRequest.theme,
          moral: draftRequest.moral,
          templateId: draftRequest.templateId,
        })
        // Validate AI response for refusal messages
        const aiResponseValidation = validateAIResponse(storyContent)
        if (!aiResponseValidation.isValid) {
          console.error(`Draft ${i + 1} validation failed:`, {
            reason: aiResponseValidation.reason,
            confidence: aiResponseValidation.confidence
          })
          // Skip this draft and continue with others
          continue
        }


        // Generate story title
        const storyTitle = generateStoryTitle(
          storyContent,
          draftRequest.childName,
          draftRequest.theme
        )

        // Save draft to database
        // First draft is the parent (parent_story_id = null)
        // Subsequent drafts reference the first one
        const storyData = storyToDatabaseStory({
          userId,
          title: storyTitle,
          content: storyContent,
          childName: draftRequest.childName,
          adjectives: draftRequest.adjectives,
          theme: draftRequest.theme,
          moral: draftRequest.moral,
          hasImages: false,
          parentStoryId: i === 0 ? undefined : parentStoryId, // First draft is parent
          draftNumber: i + 1,
          isSelectedDraft: false,
        })

        const { data: createdStory, error: insertError } = await (supabaseAdmin
          .from('stories') as any)
          .insert(storyData)
          .select()
          .single()

        if (insertError || !createdStory) {
          console.error(`Failed to save draft ${i + 1}:`, insertError)
          // Continue with other drafts even if one fails
          continue
        }

        const draft: Story = databaseStoryToStory(createdStory)
        drafts.push(draft)

        // Set parent story ID from first draft
        if (i === 0) {
          parentStoryId = draft.id
        }
      } catch (error) {
        console.error(`Error generating draft ${i + 1}:`, error)
        // Continue with other drafts even if one fails
        continue
      }
    }

    // If no drafts were created, return error
    if (drafts.length === 0) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'Failed to generate any drafts. Please try again.',
        },
        { status: 500 }
      )
    }

    // Update parent story ID for all drafts (except the first one which is the parent)
    if (parentStoryId && drafts.length > 1) {
      // Update all drafts except the first to reference the parent
      for (let i = 1; i < drafts.length; i++) {
        await (supabaseAdmin
          .from('stories') as any)
          .update({ parent_story_id: parentStoryId })
          .eq('id', drafts[i].id)

        drafts[i].parentStoryId = parentStoryId
      }
    }

    return NextResponse.json<ApiResponse<{ drafts: Story[]; parentStoryId?: string }>>({
      success: true,
      data: {
        drafts,
        parentStoryId: parentStoryId || drafts[0]?.id,
      },
    })
  } catch (error) {
    console.error('Error generating drafts:', error)

    // Handle specific error types
    if (error instanceof Error) {
      if (error.message.includes('Trial limit') || error.message.includes('upgrade')) {
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
            error: 'Failed to generate drafts. Please try again.',
          },
          { status: 500 }
        )
      }
    }

    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: 'Failed to generate drafts',
      },
      { status: 500 }
    )
  }
}

