'use client'

import { useState, useEffect } from 'react'
import { Search, X, TrendingUp, Clock, Heart, Star } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import type { DiscoveryFilters as Filters, DiscoverySortBy } from '@/types/discovery'

interface DiscoveryFiltersProps {
  filters: Filters
  onFiltersChange: (filters: Filters) => void
}

const THEMES = [
  'Adventure',
  'Fantasy',
  'Mystery',
  'Science Fiction',
  'Friendship',
  'Bedtime',
  'Learning',
  'Animals',
  'Magic',
  'Space',
  'Ocean',
  'Forest'
]

const SORT_OPTIONS: Array<{ value: DiscoverySortBy; label: string; icon: any; description: string }> = [
  {
    value: 'recent',
    label: 'Recent',
    icon: Clock,
    description: 'Newest stories first'
  },
  {
    value: 'popular',
    label: 'Popular',
    icon: Heart,
    description: 'Most liked stories'
  },
  {
    value: 'top_rated',
    label: 'Top Rated',
    icon: Star,
    description: 'Highest rated stories'
  },
  {
    value: 'trending',
    label: 'Trending',
    icon: TrendingUp,
    description: 'Hot right now'
  }
]

export function DiscoveryFilters({ filters, onFiltersChange }: DiscoveryFiltersProps) {
  const [searchInput, setSearchInput] = useState(filters.search || '')

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput !== filters.search) {
        onFiltersChange({ ...filters, search: searchInput || undefined, page: 1 })
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [searchInput])

  const handleThemeChange = (theme: string) => {
    const newTheme = filters.theme === theme ? undefined : theme
    onFiltersChange({ ...filters, theme: newTheme, page: 1 })
  }

  const handleSortChange = (sortBy: DiscoverySortBy) => {
    onFiltersChange({ ...filters, sortBy, page: 1 })
  }

  const clearFilters = () => {
    setSearchInput('')
    onFiltersChange({
      sortBy: 'recent',
      page: 1,
      limit: filters.limit
    })
  }

  const hasActiveFilters = filters.search || filters.theme

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
        <Input
          type="text"
          placeholder="Search stories by title or content..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="pl-10 pr-10 h-12 text-base border-2 focus:border-purple-400"
        />
        {searchInput && (
          <button
            onClick={() => setSearchInput('')}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Sort Options */}
      <div className="space-y-3">
        <label className="text-sm font-semibold text-gray-700">Sort By</label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {SORT_OPTIONS.map((option) => {
            const Icon = option.icon
            const isSelected = filters.sortBy === option.value

            return (
              <button
                key={option.value}
                onClick={() => handleSortChange(option.value)}
                className={`
                  p-3 rounded-xl border-2 transition-all duration-200
                  ${isSelected
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-gray-200 hover:border-purple-300 hover:bg-gray-50'
                  }
                `}
              >
                <div className="flex flex-col items-center gap-2">
                  <Icon className={`h-5 w-5 ${isSelected ? 'text-purple-600' : 'text-gray-600'}`} />
                  <span className={`text-sm font-semibold ${isSelected ? 'text-purple-700' : 'text-gray-700'}`}>
                    {option.label}
                  </span>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Theme Filter */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-sm font-semibold text-gray-700">Theme</label>
          {hasActiveFilters && (
            <Button
              onClick={clearFilters}
              variant="ghost"
              size="sm"
              className="text-purple-600 hover:text-purple-700"
            >
              <X className="h-4 w-4 mr-1" />
              Clear Filters
            </Button>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {THEMES.map((theme) => {
            const isSelected = filters.theme === theme

            return (
              <Badge
                key={theme}
                onClick={() => handleThemeChange(theme)}
                variant={isSelected ? 'default' : 'outline'}
                className={`
                  cursor-pointer transition-all duration-200 px-3 py-1.5
                  ${isSelected
                    ? 'bg-purple-600 hover:bg-purple-700 text-white'
                    : 'border-purple-200 text-purple-700 hover:bg-purple-50'
                  }
                `}
              >
                {theme}
              </Badge>
            )
          })}
        </div>
      </div>
    </div>
  )
}
