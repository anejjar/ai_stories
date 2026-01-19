'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Compass, Loader2, BookOpen, Plus, Sparkles, Globe, Users } from 'lucide-react'
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
    <div className="py-12 px-4 max-w-7xl mx-auto space-y-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2 text-center md:text-left">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-100 text-playwize-purple text-sm font-bold border border-purple-200">
            <Compass className="h-4 w-4" />
            <span>Community Discover</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-gray-900 tracking-tight">
            Discover <span className="text-playwize-purple">Stories</span>
          </h1>
          <p className="text-gray-600 text-lg font-medium">
            Explore wonderful stories created by our community
          </p>
          {!isLoading && (
            <p className="text-sm font-black text-playwize-orange uppercase tracking-widest mt-4">
              {total > 0 ? (
                <>
                  Found {total} {total === 1 ? 'magical story' : 'magical stories'}
                </>
              ) : (
                'No stories found'
              )}
            </p>
          )}
        </div>

        <Link href="/create">
          <Button className="h-14 px-8 rounded-full bg-playwize-purple hover:bg-purple-700 text-white font-black text-lg shadow-lg shadow-purple-200 transition-all hover:scale-105 active:scale-95">
            <Plus className="h-6 w-6 mr-2" />
            Create Story
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-[3rem] border-4 border-gray-100 shadow-sm p-8">
        <DiscoveryFilters
          filters={filters}
          onFiltersChange={handleFiltersChange}
        />
      </div>

      {/* Encourage Public Stories Section */}
      {!isLoading && (
        <div className="bg-gradient-to-br from-purple-50 via-white to-orange-50 rounded-[3rem] border-4 border-purple-200 shadow-lg p-8 md:p-12 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-purple-100/30 rounded-full -mr-32 -mt-32 blur-3xl" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-orange-100/30 rounded-full -ml-24 -mb-24 blur-3xl" />
          
          <div className="relative z-10">
            <div className="flex flex-col md:flex-row items-center gap-8">
              {/* Icon Section */}
              <div className="flex-shrink-0">
                <div className="h-24 w-24 rounded-[2rem] bg-gradient-to-br from-[#7c3aed] to-purple-600 flex items-center justify-center shadow-xl">
                  <Globe className="h-12 w-12 text-white" />
                </div>
              </div>

              {/* Content Section */}
              <div className="flex-1 text-center md:text-left space-y-4">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-100 text-playwize-purple text-sm font-black border border-purple-200 mb-2">
                  <Users className="h-4 w-4" />
                  <span>Share Your Stories</span>
                </div>
                
                <h2 className="text-3xl md:text-4xl font-black text-gray-900">
                  Create Text Stories & Share with the Community
                </h2>
                
                <p className="text-lg text-gray-600 font-medium max-w-2xl">
                  Create amazing text stories and make them public so others can discover, read, and enjoy your creative work. Your stories can inspire and bring joy to readers around the world!
                </p>

                <div className="flex flex-wrap items-center gap-4 pt-2">
                  <div className="flex items-center gap-2 text-sm font-bold text-gray-700">
                    <BookOpen className="h-5 w-5 text-playwize-purple" />
                    <span>Create text stories</span>
                  </div>
                  <div className="text-gray-300">•</div>
                  <div className="flex items-center gap-2 text-sm font-bold text-gray-700">
                    <Globe className="h-5 w-5 text-playwize-purple" />
                    <span>Make them public</span>
                  </div>
                  <div className="text-gray-300">•</div>
                  <div className="flex items-center gap-2 text-sm font-bold text-gray-700">
                    <Users className="h-5 w-5 text-playwize-purple" />
                    <span>Share with everyone</span>
                  </div>
                </div>
              </div>

              {/* CTA Button */}
              <div className="flex-shrink-0">
                <Link href="/create">
                  <Button className="h-14 px-8 rounded-full bg-playwize-purple hover:bg-purple-700 text-white font-black text-lg shadow-xl shadow-purple-200 transition-all hover:scale-105 active:scale-95">
                    <Sparkles className="h-6 w-6 mr-2" />
                    Create Story
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stories Grid */}
      <div className="pb-12">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-32 space-y-6">
            <div className="relative">
              <div className="h-20 w-20 rounded-3xl bg-purple-50 animate-pulse" />
              <Loader2 className="h-10 w-10 animate-spin text-playwize-purple absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
            </div>
            <p className="text-gray-400 font-black uppercase tracking-widest">Loading amazing stories...</p>
          </div>
        ) : stories.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-[4rem] border-4 border-dashed border-gray-100 space-y-10 max-w-3xl mx-auto">
            <div className="h-40 w-40 rounded-[3rem] bg-purple-50 flex items-center justify-center shadow-inner animate-float-gentle mx-auto">
              <BookOpen className="h-20 w-20 text-playwize-purple opacity-40" />
            </div>
            <div className="space-y-4">
              <h3 className="text-3xl font-black text-gray-900">No Stories Found</h3>
              <p className="text-xl text-gray-500 font-bold max-w-md mx-auto">
                Try adjusting your filters or be the first to create a public story!
              </p>
            </div>
            <Link href="/create">
              <Button className="h-16 px-12 rounded-full bg-playwize-purple hover:bg-purple-700 text-white font-black text-xl shadow-xl shadow-purple-100 transition-all hover:scale-105 active:scale-95">
                <Sparkles className="h-6 w-6 mr-2" />
                Create Your First Story
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {stories.map((story) => (
              <PublicStoryCard key={story.id} story={story} />
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      {!isLoading && totalPages > 1 && (
        <div className="flex justify-center pb-12">
          <div className="bg-white rounded-full shadow-xl border-4 border-gray-50 px-6 py-4">
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
        <div className="bg-playwize-purple rounded-[4rem] p-12 md:p-20 text-center text-white relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -mr-48 -mt-48 blur-3xl" />
          <div className="space-y-8 relative z-10">
            <div className="text-7xl animate-bounce-slow inline-block">✨</div>
            <h2 className="text-4xl md:text-5xl font-black">
              Ready to Create Your Own Story?
            </h2>
            <p className="text-white/80 text-xl font-bold max-w-2xl mx-auto">
              Join our creative community and share your magical stories with the world!
            </p>
            <Link href="/create">
              <Button
                size="lg"
                className="h-16 px-12 rounded-full bg-white text-playwize-purple hover:bg-gray-100 font-black text-xl shadow-xl transition-all hover:scale-105 active:scale-95"
              >
                <Plus className="h-6 w-6 mr-2" />
                Start Creating
              </Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
