import { unstable_cache } from 'next/cache'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { databaseStoryToStory } from '@/types/database'
import { sanitizeSearchQuery, escapeLikePattern } from '@/lib/validation/input-sanitizer'
import type { PublicStory } from '@/types/discovery'

interface DiscoveryFilters {
  theme?: string
  search?: string
  sortBy?: 'recent' | 'popular' | 'top_rated' | 'trending'
  limit?: number
  page?: number
}

/**
 * Fetches public stories for the discovery feed with caching.
 */
export const getCachedPublicStories = unstable_cache(
  async (filters: DiscoveryFilters) => {
    const { theme, search, sortBy = 'recent', limit = 12, page = 1 } = filters
    const offset = (page - 1) * limit

    console.log(`[Cache Miss] Fetching public stories:`, filters)
    
    let query = supabaseAdmin
      .from('stories')
      .select('*', { count: 'exact' })
      .eq('visibility', 'public')
      .or('is_illustrated_book.eq.false,is_illustrated_book.is.null')

    if (theme) {
      query = query.eq('theme', theme)
    }

    if (search && search.trim().length > 0) {
      // Sanitize and validate search term
      const sanitized = sanitizeSearchQuery(search)
      
      if (sanitized.length > 0) {
        // Escape remaining special characters for ilike
        const escapedTerm = escapeLikePattern(sanitized)
        query = query.or(`title.ilike.%${escapedTerm}%,content.ilike.%${escapedTerm}%`)
      }
    }

    // Apply sorting
    switch (sortBy) {
      case 'popular':
        query = query.order('likes_count', { ascending: false, nullsFirst: false })
        query = query.order('created_at', { ascending: false })
        break
      case 'top_rated':
        query = query.order('average_rating', { ascending: false, nullsFirst: false })
        query = query.order('ratings_count', { ascending: false, nullsFirst: false })
        query = query.order('created_at', { ascending: false })
        break
      case 'trending':
        query = query.order('created_at', { ascending: false })
        query = query.order('likes_count', { ascending: false, nullsFirst: false })
        break
      case 'recent':
      default:
        query = query.order('published_at', { ascending: false, nullsFirst: false })
        query = query.order('created_at', { ascending: false })
        break
    }

    query = query.range(offset, offset + limit - 1)

    const { data, error, count } = await query

    if (error) {
      throw error
    }

    const stories = (data || []).map((dbStory: any) => {
      const story = databaseStoryToStory(dbStory)

      return {
        ...story,
        visibility: 'public' as const,
        viewCount: dbStory.view_count || 0,
        likesCount: dbStory.likes_count || 0,
        commentsCount: dbStory.comments_count || 0,
        averageRating: parseFloat(dbStory.average_rating) || 0,
        ratingsCount: dbStory.ratings_count || 0,
        publishedAt: dbStory.published_at || dbStory.created_at
      }
    })

    return {
      stories,
      total: count || 0
    }
  },
  ['public-stories'],
  {
    revalidate: 60, // 1 minute cache
    tags: ['stories', 'public-stories']
  }
)

