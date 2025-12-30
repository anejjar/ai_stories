'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { SearchBar } from '@/components/admin/shared/search-bar'
import { StatusBadge } from '@/components/admin/shared/status-badge'
import { Pagination } from '@/components/admin/shared/pagination'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import type { AdminStoryListItem, PaginationInfo } from '@/types/admin'

export default function StoriesPage() {
  const [stories, setStories] = useState<AdminStoryListItem[]>([])
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 50,
    total: 0,
    totalPages: 0,
  })
  const [loading, setLoading] = useState(true)

  // Filters
  const [search, setSearch] = useState('')
  const [visibility, setVisibility] = useState<'all' | 'public' | 'private'>('all')
  const [type, setType] = useState<'all' | 'text' | 'illustrated'>('all')
  const [sortBy, setSortBy] = useState('created_at')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  useEffect(() => {
    fetchStories()
  }, [pagination.page, search, visibility, type, sortBy, sortOrder])

  async function fetchStories() {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        search,
        visibility,
        type,
        sortBy,
        sortOrder,
      })

      const res = await fetch(`/api/admin/content/stories?${params}`)
      const data = await res.json()

      if (data.success) {
        setStories(data.data.stories)
        setPagination(data.data.pagination)
      } else {
        console.error('Failed to fetch stories:', data.error)
      }
    } catch (error) {
      console.error('Error fetching stories:', error)
    } finally {
      setLoading(false)
    }
  }

  async function deleteStory(storyId: string, title: string) {
    if (!confirm(`Delete story "${title}"? This action cannot be undone.`)) {
      return
    }

    try {
      const res = await fetch(`/api/admin/content/stories/${storyId}`, {
        method: 'DELETE',
      })

      const data = await res.json()

      if (data.success) {
        toast.success('Story deleted')
        fetchStories()
      } else {
        toast.error(data.error || 'Failed to delete story')
      }
    } catch (error) {
      console.error('Error deleting story:', error)
      toast.error('Failed to delete story')
    }
  }

  function handlePageChange(page: number) {
    setPagination((prev) => ({ ...prev, page }))
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">All Stories</h1>
        <div className="text-sm text-gray-500">Total: {pagination.total} stories</div>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <SearchBar
            value={search}
            onChange={(v) => {
              setSearch(v)
              setPagination((prev) => ({ ...prev, page: 1 }))
            }}
            placeholder="Search by title or author email..."
          />
        </div>

        <Select value={visibility} onValueChange={(v: any) => setVisibility(v)}>
          <SelectTrigger className="w-full md:w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Visibility</SelectItem>
            <SelectItem value="public">Public</SelectItem>
            <SelectItem value="private">Private</SelectItem>
          </SelectContent>
        </Select>

        <Select value={type} onValueChange={(v: any) => setType(v)}>
          <SelectTrigger className="w-full md:w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="text">Text Only</SelectItem>
            <SelectItem value="illustrated">Illustrated</SelectItem>
          </SelectContent>
        </Select>

        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-full md:w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="created_at">Created Date</SelectItem>
            <SelectItem value="view_count">Views</SelectItem>
            <SelectItem value="likes_count">Likes</SelectItem>
          </SelectContent>
        </Select>

        <Select value={sortOrder} onValueChange={(v: any) => setSortOrder(v)}>
          <SelectTrigger className="w-full md:w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="desc">Newest</SelectItem>
            <SelectItem value="asc">Oldest</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-400 mx-auto"></div>
          <p className="text-gray-500 mt-4">Loading stories...</p>
        </div>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden lg:block bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Title
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Visibility
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Stats
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {stories.map((story) => (
                    <tr key={story.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900 truncate max-w-xs">
                          {story.title} <br /> <span className="text-xs text-gray-500">{story.authorEmail || 'Unknown'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <StatusBadge status={story.visibility} type="visibility" />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          story.hasImages 
                            ? 'bg-purple-100 text-purple-800 border border-purple-300' 
                            : 'bg-gray-100 text-gray-800 border border-gray-300'
                        }`}>
                          {story.hasImages ? 'Illustrated' : 'Text'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {story.viewCount || 0} views, {story.likesCount || 0} likes
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(story.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(`/story/${story.id}`, '_blank')}
                            className="border-blue-300 text-blue-700 hover:bg-blue-50"
                          >
                            View
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => deleteStory(story.id, story.title)}
                            className="border-red-300 text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {stories.length === 0 && (
              <div className="text-center py-12 text-gray-500">No stories found</div>
            )}
          </div>

          {/* Mobile/Tablet Card View */}
          <div className="lg:hidden space-y-4">
            {stories.length === 0 ? (
              <div className="bg-white rounded-lg border border-gray-200 text-center py-12 text-gray-500">
                No stories found
              </div>
            ) : (
              stories.map((story) => (
                <div
                  key={story.id}
                  className="bg-white rounded-lg border border-gray-200 p-4 space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-sm font-medium text-gray-900 flex-1 line-clamp-2">
                      {story.title}
                    </h3>
                    <div className="flex gap-2 flex-shrink-0">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(`/story/${story.id}`, '_blank')}
                        className="text-xs border-blue-300 text-blue-700 hover:bg-blue-50"
                      >
                        View
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteStory(story.id, story.title)}
                        className="border-red-300 text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Author</p>
                      <p className="text-gray-900 truncate">{story.authorEmail || 'Unknown'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Created</p>
                      <p className="text-gray-900">
                        {new Date(story.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Visibility</p>
                      <StatusBadge status={story.visibility} type="visibility" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Type</p>
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full border ${
                        story.hasImages 
                          ? 'bg-purple-100 text-purple-800 border-purple-300' 
                          : 'bg-gray-100 text-gray-800 border-gray-300'
                      }`}>
                        {story.hasImages ? 'Illustrated' : 'Text'}
                      </span>
                    </div>
                    <div className="col-span-2">
                      <p className="text-xs text-gray-500 mb-1">Stats</p>
                      <p className="text-gray-900">
                        {story.viewCount || 0} views · {story.likesCount || 0} likes
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {pagination.totalPages > 1 && (
            <Pagination pagination={pagination} onPageChange={handlePageChange} />
          )}
        </>
      )}
    </div>
  )
}
