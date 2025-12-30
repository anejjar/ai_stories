'use client'

import { SearchBar } from '@/components/admin/shared/search-bar'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { SubscriptionTier } from '@/types'

interface UserFiltersProps {
  search: string
  tier: SubscriptionTier | 'all'
  sortBy: string
  sortOrder: 'asc' | 'desc'
  onSearchChange: (value: string) => void
  onTierChange: (value: SubscriptionTier | 'all') => void
  onSortByChange: (value: string) => void
  onSortOrderChange: (value: 'asc' | 'desc') => void
}

export function UserFilters({
  search,
  tier,
  sortBy,
  sortOrder,
  onSearchChange,
  onTierChange,
  onSortByChange,
  onSortOrderChange,
}: UserFiltersProps) {
  return (
    <div className="flex flex-col md:flex-row gap-4">
      <div className="flex-1">
        <SearchBar
          value={search}
          onChange={onSearchChange}
          placeholder="Search by email or name..."
        />
      </div>

      <Select value={tier} onValueChange={onTierChange}>
        <SelectTrigger className="w-full md:w-40">
          <SelectValue placeholder="Subscription" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Tiers</SelectItem>
          <SelectItem value="trial">Trial</SelectItem>
          <SelectItem value="pro">Pro</SelectItem>
          <SelectItem value="family">Family</SelectItem>
        </SelectContent>
      </Select>

      <Select value={sortBy} onValueChange={onSortByChange}>
        <SelectTrigger className="w-full md:w-40">
          <SelectValue placeholder="Sort by" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="created_at">Created Date</SelectItem>
          <SelectItem value="email">Email</SelectItem>
          <SelectItem value="subscription_tier">Subscription</SelectItem>
        </SelectContent>
      </Select>

      <Select value={sortOrder} onValueChange={onSortOrderChange}>
        <SelectTrigger className="w-full md:w-32">
          <SelectValue placeholder="Order" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="desc">Newest</SelectItem>
          <SelectItem value="asc">Oldest</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}
