'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Compass, Loader2, BookOpen, Plus, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DiscoveryFilters } from '@/components/discover/discovery-filters'
import { PublicStoryCard } from '@/components/discover/public-story-card'
import { PaginationControls } from '@/components/discover/pagination-controls'
import type { DiscoveryFilters as Filters, DiscoveryResponse, PublicStory } from '@/types/discovery'
import { toast } from 'sonner'

const DEFAULT_LIMIT = 12

export default function DiscoverPage() {
  const [stories, setStories] = useState<PublicStory[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)

  const [filters, setFilters] = useState<Filters>({
    sortBy: 'recent',
    page: 1,
    limit: DEFAULT_LIMIT
  })

  useEffect(() => {
    fetchStories()
  }, [filters])

  const fetchStories = async () => {
    setIsLoading(true)
    try {
      // Build query string
      const params = new URLSearchParams()
      if (filters.search) params.append('search', filters.search)
      if (filters.theme) params.append('theme', filters.theme)
      if (filters.sortBy) params.append('sortBy', filters.sortBy)
      params.append('page', String(filters.page || 1))
      params.append('limit', String(filters.limit || DEFAULT_LIMIT))

      const response = await fetch(`/api/stories/discover?${params.toString()}`)
      const result = await response.json()

      if (result.success) {
        const data: DiscoveryResponse = result.data
        setStories(data.stories)
        setTotalPages(data.totalPages)
        setTotal(data.total)

        // Scroll to top when page changes
        if (filters.page && filters.page > 1) {
          window.scrollTo({ top: 0, behavior: 'smooth' })
        }
      } else {
        toast.error(result.error || 'Failed to load stories')
      }
    } catch (error) {
      console.error('Error fetching stories:', error)
      toast.error('Failed to load stories')
    } finally {
      setIsLoading(false)
    }
  }

  const handleFiltersChange = (newFilters: Filters) => {
    setFilters(newFilters)
  }

  const handlePageChange = (page: number) => {
    setFilters({ ...filters, page })
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 via-pink-50 to-yellow-50">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-purple-500 to-pink-500 p-3 rounded-2xl shadow-lg">
                <Compass className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-gray-900 font-comic">
                  Discover Stories
                </h1>
                <p className="text-gray-600 mt-1">
                  Explore wonderful stories created by our community
                </p>
              </div>
            </div>

            <Link href="/create">
              <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg">
                <Plus className="h-5 w-5 mr-2" />
                Create Story
              </Button>
            </Link>
          </div>

          {/* Results Count */}
          {!isLoading && (
            <p className="text-sm text-gray-600">
              {total > 0 ? (
                <>
                  Found <span className="font-semibold text-purple-600">{total}</span> {total === 1 ? 'story' : 'stories'}
                </>
              ) : (
                'No stories found'
              )}
            </p>
          )}
        </div>

        {/* Filters */}
        <div className="mb-8 bg-white rounded-3xl shadow-lg p-6">
          <DiscoveryFilters
            filters={filters}
            onFiltersChange={handleFiltersChange}
          />
        </div>

        {/* Stories Grid */}
        <div className="mb-8">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="h-12 w-12 animate-spin text-purple-600 mb-4" />
              <p className="text-gray-600">Loading amazing stories...</p>
            </div>
          ) : stories.length === 0 ? (
            <div className="text-center py-20">
              <div className="bg-white rounded-3xl shadow-lg p-12 max-w-md mx-auto">
                <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  No Stories Found
                </h3>
                <p className="text-gray-600 mb-6">
                  Try adjusting your filters or be the first to create a public story!
                </p>
                <Link href="/create">
                  <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                    <Sparkles className="h-4 w-4 mr-2" />
                    Create Your First Story
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {stories.map((story) => (
                <PublicStoryCard key={story.id} story={story} />
              ))}
            </div>
          )}
        </div>

        {/* Pagination */}
        {!isLoading && totalPages > 1 && (
          <div className="flex justify-center pb-8">
            <div className="bg-white rounded-full shadow-lg px-4 py-3">
              <PaginationControls
                currentPage={filters.page || 1}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </div>
          </div>
        )}

        {/* CTA Banner */}
        {!isLoading && stories.length > 0 && (
          <div className="mt-12 bg-gradient-to-r from-purple-600 to-pink-600 rounded-3xl shadow-2xl p-8 text-center text-white">
            <Sparkles className="h-12 w-12 mx-auto mb-4 animate-pulse" />
            <h2 className="text-2xl font-bold mb-2">
              Ready to Create Your Own Story?
            </h2>
            <p className="text-purple-100 mb-6">
              Join our creative community and share your magical stories with the world!
            </p>
            <Link href="/create">
              <Button
                size="lg"
                className="bg-white text-purple-600 hover:bg-gray-100 shadow-lg font-bold"
              >
                <Plus className="h-5 w-5 mr-2" />
                Start Creating
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
