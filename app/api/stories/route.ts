import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth/middleware'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { getProviderManager } from '@/lib/ai/provider-manager'
import { checkTrialLimit, incrementTrialUsage } from '@/lib/trial/trial-service-server'
import { checkStoryLimit, incrementStoryUsage } from '@/lib/usage/daily-limits'
import { validateStoryInput } from '@/lib/moderation/content-moderation'
import { checkRateLimit, RATE_LIMITS, getRateLimitHeaders } from '@/lib/rate-limit'
import type { ApiResponse, StoryInput, Story } from '@/types'
import { storyToDatabaseStory, databaseStoryToStory, firestoreStoryToStory, type DatabaseStory } from '@/types/database'
import { ProviderError } from '@/lib/ai/types'
import { generateIllustratedBook, type BookPage } from '@/lib/ai/illustrated-book-generator'
import { uploadImageToStorage } from '@/lib/supabase/storage'
import { supabaseAdmin } from '@/lib/supabase/admin'

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

// Helper to generate regular (text-only) story
async function generateRegularStory(
  providerManager: ReturnType<typeof getProviderManager>,
  storyInput: StoryInput,
  isMultiChild: boolean
): Promise<string> {
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

  return await providerManager.generateText(generationRequest)
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
  try {
    // Use server-side client with user's session instead of service role
    const supabase = await createServerSupabaseClient()

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const limitParam = searchParams.get('limit')
    // Temporary: Reduced from 50 to 10 to improve performance while investigating
    const storyLimit = limitParam ? parseInt(limitParam, 10) : 10

    console.log(`📊 Fetching stories for user ${user.id}, limit: ${storyLimit}`)
    const queryStart = Date.now()

    // Fetch user's stories using RLS-enabled client
    // Note: Using select('*') to get all fields - the 43s query time suggests a Supabase connection issue
    const { data: storiesData, error } = await supabase
      .from('stories')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(storyLimit)

    const queryTime = Date.now() - queryStart
    console.log(`⏱️  Stories query took: ${queryTime}ms for ${storiesData?.length || 0} stories`)

    if (error) {
      console.error('❌ Supabase query error:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      })
      throw error
    }

    const stories: Story[] = (storiesData || []).map((data) =>
      databaseStoryToStory(data)
    )

    console.log(`✅ Successfully fetched ${stories.length} stories in ${queryTime}ms`)

    return NextResponse.json<ApiResponse<Story[]>>({
      success: true,
      data: stories,
    })
  } catch (error) {
    console.error('❌ Error fetching stories:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      details: error instanceof Error ? error.stack : String(error),
      hint: '',
      code: ''
    })
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

    // Parse request body first to determine story type
    const body = await request.json()

    // Check Family Plan limits (rolling 24-hour windows)
    if (subscriptionTier === 'family') {
      const isIllustrated = body.generateImages === true
      const limitCheck = await checkStoryLimit(userId, isIllustrated)

      if (!limitCheck.canCreate) {
        const errorData: any = {
          requiresUpgrade: false,
          isLimitReached: true,
        }

        if (limitCheck.resetAt) {
          errorData.resetAt = limitCheck.resetAt.toISOString()
        }

        return NextResponse.json<ApiResponse>(
          {
            success: false,
            error: limitCheck.reason,
            data: errorData,
          },
          { status: 429 }
        )
      }

      console.log(`[Family Plan] User can create story: ${limitCheck.reason}`)
    }

    // Parse story input from request body
    const storyInput: StoryInput = {
      childName: body.childName,
      adjectives: body.adjectives,
      children: body.children, // Multi-child support
      theme: body.theme,
      moral: body.moral,
      generateImages: body.generateImages || false,
      templateId: body.templateId,
      appearance: body.appearance, // FAMILY PLAN only (deprecated, use children[].appearance)
      profileId: body.profileId, // For illustrated books
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

    let storyContent: string
    let bookPages: BookPage[] = []
    let isIllustratedBook = false

    // Check if this is an illustrated book request (Family Plan feature)
    if (storyInput.generateImages && subscriptionTier === 'family' && storyInput.profileId) {
      console.log(`Generating illustrated book for ${subscriptionTier.toUpperCase()} user...`)

      // Fetch child profile with all character data (photo, appearance, age)
      const { data: childProfile, error: profileError } = await supabaseAdmin
        .from('child_profiles')
        .select('ai_description, ai_generated_image_url, name, appearance, birth_date')
        .eq('id', storyInput.profileId)
        .eq('user_id', userId)
        .single<{
          ai_description?: string
          ai_generated_image_url?: string
          name: string
          appearance?: any
          birth_date?: string
        }>()

      if (profileError || !childProfile) {
        console.error('Failed to fetch child profile for illustrated book:', profileError)
        // Fall back to regular story generation
        storyContent = await generateRegularStory(providerManager, storyInput, isMultiChild)
      } else {
        try {
          // Calculate child age if birth_date is available
          let childAge: number | undefined
          if (childProfile.birth_date) {
            const birthDate = new Date(childProfile.birth_date)
            const today = new Date()
            childAge = today.getFullYear() - birthDate.getFullYear()
            const monthDiff = today.getMonth() - birthDate.getMonth()
            if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
              childAge--
            }
          }

          console.log('🎨 Starting illustrated book generation...')
          console.log(`Character data available: AI description=${!!childProfile.ai_description}, Appearance=${!!childProfile.appearance}, Age=${childAge}`)

          // Generate illustrated book with 3-tier character system
          const illustratedBookResult = await generateIllustratedBook({
            childName: storyInput.childName || childProfile.name,
            adjectives: storyInput.adjectives || [],
            theme: storyInput.theme,
            moral: storyInput.moral,
            templateId: storyInput.templateId,
            aiDescription: childProfile.ai_description, // Tier 1: Photo description
            appearance: childProfile.appearance, // Tier 2: Manual appearance
            profileImageUrl: childProfile.ai_generated_image_url,
            childAge, // For better appearance descriptions
          })

          storyContent = illustratedBookResult.content
          bookPages = illustratedBookResult.bookPages
          isIllustratedBook = true

          console.log(`✅ Successfully generated illustrated book with ${bookPages.length} pages`)
          console.log('Book pages summary:', bookPages.map((p, i) => ({
            page: i + 1,
            textLength: p.text.length,
            hasUrl: !!p.illustration_url,
            urlLength: p.illustration_url.length
          })))
        } catch (illustratedError) {
          console.error('❌ Failed to generate illustrated book:', illustratedError)
          console.error('Illustrated book error details:', {
            message: illustratedError instanceof Error ? illustratedError.message : String(illustratedError),
            stack: illustratedError instanceof Error ? illustratedError.stack : undefined
          })
          console.log('Falling back to regular story generation...')
          // Fall back to regular story generation
          storyContent = await generateRegularStory(providerManager, storyInput, isMultiChild)
        }
      }
    } else {
      // Regular story generation (text-only)
      storyContent = await generateRegularStory(providerManager, storyInput, isMultiChild)
    }

    // Generate story title
    const titleChildName = isMultiChild
      ? storyInput.children!.map((c) => c.name).join(' & ')
      : storyInput.childName!
    const storyTitle = generateStoryTitle(
      storyContent,
      titleChildName,
      storyInput.theme
    )

    // STEP 1: Save story to database WITHOUT images first (to get story ID)
    // Base64 images are too large (~13MB) and cause database timeout
    console.log('💾 Saving story metadata to database (without images)...')

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
      hasImages: bookPages.length > 0,
      imageUrls: undefined, // Will add after upload
      // Deprecated: kept for backward compatibility
      appearance: subscriptionTier === 'family' && !isMultiChild ? storyInput.appearance : undefined,
      // Illustrated book support (will add pages after upload)
      isIllustratedBook,
      bookPages: undefined, // Will add after upload
    })

    const { data: createdStory, error: insertError } = await supabaseAdmin
      .from('stories')
      .insert(storyData as any)
      .select()
      .single<DatabaseStory>()

    if (insertError || !createdStory) {
      console.error('❌ Supabase insert error:', {
        message: insertError?.message,
        details: insertError?.details,
        hint: insertError?.hint,
        code: insertError?.code
      })
      throw new Error(`Failed to save story to database: ${insertError?.message || 'Unknown error'}`)
    }

    console.log(`✅ Story saved to database with ID: ${createdStory.id}`)

    // STEP 2: Upload images to storage in parallel batches
    // Parallel processing: compress and upload images simultaneously
    if (isIllustratedBook && bookPages.length > 0) {
      console.log(`📤 Uploading ${bookPages.length} images to storage in parallel...`)

      const storyId = createdStory.id

      // Create upload promises - no timeout, trust Supabase's built-in timeout
      const uploadPromises = bookPages.map(async (page, index) => {
        try {
          console.log(`Starting upload ${index + 1}/${bookPages.length}...`)

          // Upload without artificial timeout (Supabase has built-in timeouts)
          // Compression + upload typically takes 10-30s per image
          const storageUrl = await uploadImageToStorage(page.illustration_url, storyId, index)

          console.log(`✅ Image ${index + 1} uploaded successfully`)

          return {
            success: true,
            index,
            page: {
              ...page,
              illustration_url: storageUrl
            },
            storageUrl
          }
        } catch (uploadError) {
          console.error(`⚠️ Failed to upload image ${index + 1}:`, uploadError)
          return {
            success: false,
            index,
            page,
            error: uploadError
          }
        }
      })

      // Wait for all uploads to complete (in parallel)
      const uploadStartTime = Date.now()
      const results = await Promise.all(uploadPromises)
      const uploadDuration = ((Date.now() - uploadStartTime) / 1000).toFixed(1)

      // Extract successful uploads
      const successfulResults = results.filter(r => r.success)
      const uploadedPages = successfulResults.map(r => r.page)
      const storageUrls = successfulResults.map(r => r.storageUrl)

      console.log(`📊 Upload complete: ${successfulResults.length}/${bookPages.length} successful in ${uploadDuration}s`)

      // Update story with successfully uploaded images
      if (uploadedPages.length > 0) {
        console.log(`Updating story with ${uploadedPages.length} uploaded images...`)

        const { error: updateError } = await (supabaseAdmin
          .from('stories') as any)
          .update({
            image_urls: storageUrls,
            book_pages: uploadedPages
          })
          .eq('id', storyId)

        if (updateError) {
          console.error('⚠️ Failed to update story with images:', updateError)
        } else {
          console.log(`✅ Story updated with ${uploadedPages.length}/${bookPages.length} images`)
        }
      } else {
        console.error('❌ All image uploads failed - story saved without images')
      }
    }

    // Update usage tracking based on subscription tier
    if (subscriptionTier === 'trial') {
      await incrementTrialUsage(userId)
    } else if (subscriptionTier === 'family') {
      // Track Family Plan usage for rolling 24-hour limits
      await incrementStoryUsage(userId, isIllustratedBook)
      console.log(`[Family Plan] Usage incremented for user ${userId}, illustrated: ${isIllustratedBook}`)
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
