import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import type { ApiResponse } from '@/types'
import type { DiscoveryResponse, DiscoveryFilters, PublicStory } from '@/types/discovery'
import { getCachedPublicStories } from '@/lib/api/cached-queries'

const DEFAULT_LIMIT = 12
const MAX_LIMIT = 50

/**
 * GET /api/stories/discover
 *
 * Fetches public stories with filtering, search, sorting, and pagination
 * Requires authentication
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()

    // Check authentication (optional for discovery)
    const { data: { user } } = await supabase.auth.getUser()

    // Parse query parameters
    const { searchParams } = new URL(request.url)
    const filters: DiscoveryFilters = {
      search: searchParams.get('search') || undefined,
      theme: searchParams.get('theme') || undefined,
      sortBy: (searchParams.get('sortBy') as DiscoveryFilters['sortBy']) || 'recent',
      page: parseInt(searchParams.get('page') || '1', 10),
      limit: Math.min(parseInt(searchParams.get('limit') || String(DEFAULT_LIMIT), 10), MAX_LIMIT)
    }

    // Validate pagination parameters
    if (filters.page! < 1) filters.page = 1
    if (filters.limit! < 1) filters.limit = DEFAULT_LIMIT

    console.log('🔍 Discovery query (using cache if available):', filters)

    // Use cached query for the heavy database lifting
    const { stories: cachedStories, total } = await getCachedPublicStories({
      theme: filters.theme,
      search: filters.search,
      sortBy: filters.sortBy,
      limit: filters.limit,
      page: filters.page
    })

    // Get user's likes and ratings for these stories if logged in
    // This part is NOT cached as it's user-specific
    const storyIds = cachedStories.map(story => story.id)
    let likedStoryIds = new Set<string>()
    let ratingsMap = new Map<string, number>()

    if (user && storyIds.length > 0) {
      const { data: userLikes } = await supabase
        .from('story_likes')
        .select('story_id')
        .eq('user_id', user.id)
        .in('story_id', storyIds)

      likedStoryIds = new Set(userLikes?.map(like => like.story_id) || [])

      // Get user's ratings for these stories
      const { data: userRatings } = await supabase
        .from('story_ratings')
        .select('story_id, rating')
        .eq('user_id', user.id)
        .in('story_id', storyIds)

      ratingsMap = new Map(
        userRatings?.map(rating => [rating.story_id, rating.rating]) || []
      )
    }

    // Combine cached story data with user-specific data
    const publicStories: PublicStory[] = cachedStories.map((story: any) => ({
      ...story,
      publishedAt: new Date(story.publishedAt), // Convert back to Date object
      isLikedByUser: likedStoryIds.has(story.id),
      userRating: ratingsMap.get(story.id)
    }))

    // Calculate pagination metadata
    const totalPages = Math.ceil(total / filters.limit!)
    const hasMore = filters.page! < totalPages

    const response: DiscoveryResponse = {
      stories: publicStories,
      total,
      page: filters.page!,
      limit: filters.limit!,
      totalPages,
      hasMore
    }

    console.log(`✅ Found ${publicStories.length} stories (${total} total)`)

    return NextResponse.json<ApiResponse<DiscoveryResponse>>(
      { success: true, data: response },
      { status: 200 }
    )

  } catch (error) {
    console.error('Discovery API error:', error)
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
