import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import type { ApiResponse, Story } from '@/types'
import type { DiscoveryResponse, DiscoveryFilters, PublicStory } from '@/types/discovery'
import { databaseStoryToStory, type DatabaseStory } from '@/types/database'

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

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

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

    // Calculate offset
    const offset = (filters.page! - 1) * filters.limit!

    console.log('🔍 Discovery query:', filters)

    // Build base query - only text stories (no illustrated books for discovery)
    let query = supabase
      .from('stories')
      .select('*, users!inner(email, display_name)', { count: 'exact' })
      .eq('visibility', 'public')
      .or('is_illustrated_book.is.null,is_illustrated_book.eq.false')

    // Apply theme filter
    if (filters.theme) {
      query = query.eq('theme', filters.theme)
    }

    // Apply search filter (search in title and content)
    if (filters.search && filters.search.trim().length > 0) {
      const searchTerm = filters.search.trim()
      query = query.or(`title.ilike.%${searchTerm}%,content.ilike.%${searchTerm}%`)
    }

    // Apply sorting
    switch (filters.sortBy) {
      case 'popular':
        query = query.order('likes_count', { ascending: false })
        query = query.order('created_at', { ascending: false }) // Secondary sort
        break
      case 'top_rated':
        query = query.order('average_rating', { ascending: false })
        query = query.order('ratings_count', { ascending: false }) // Secondary sort
        query = query.order('created_at', { ascending: false }) // Tertiary sort
        break
      case 'trending':
        // Trending: Combination of recent + likes (weighted)
        // Note: This is a simplified trending algorithm
        // For production, consider a more sophisticated approach with time decay
        query = query.order('created_at', { ascending: false })
        query = query.order('likes_count', { ascending: false })
        break
      case 'recent':
      default:
        query = query.order('published_at', { ascending: false })
        break
    }

    // Apply pagination
    query = query.range(offset, offset + filters.limit! - 1)

    const { data, error, count } = await query

    if (error) {
      console.error('Error fetching discovery stories:', error)
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Failed to fetch stories' },
        { status: 500 }
      )
    }

    // Get user's likes for these stories
    const storyIds = data.map(story => story.id)
    const { data: userLikes } = await supabase
      .from('story_likes')
      .select('story_id')
      .eq('user_id', user.id)
      .in('story_id', storyIds)

    const likedStoryIds = new Set(userLikes?.map(like => like.story_id) || [])

    // Get user's ratings for these stories
    const { data: userRatings } = await supabase
      .from('story_ratings')
      .select('story_id, rating')
      .eq('user_id', user.id)
      .in('story_id', storyIds)

    const ratingsMap = new Map(
      userRatings?.map(rating => [rating.story_id, rating.rating]) || []
    )

    // Transform database stories to public stories
    const publicStories: PublicStory[] = data.map((dbStory: any) => {
      const story = databaseStoryToStory(dbStory as DatabaseStory)

      // Extract author name from joined users table
      const authorName = dbStory.users?.display_name ||
        dbStory.users?.email?.split('@')[0] ||
        'Anonymous'

      return {
        ...story,
        visibility: 'public' as const,
        viewCount: dbStory.view_count || 0,
        likesCount: dbStory.likes_count || 0,
        commentsCount: dbStory.comments_count || 0,
        averageRating: parseFloat(dbStory.average_rating) || 0,
        ratingsCount: dbStory.ratings_count || 0,
        publishedAt: new Date(dbStory.published_at || dbStory.created_at),
        isLikedByUser: likedStoryIds.has(story.id),
        userRating: ratingsMap.get(story.id),
        authorName
      }
    })

    // Calculate pagination metadata
    const total = count || 0
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
