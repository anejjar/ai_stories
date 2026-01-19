'use client'

import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { SupportTicketStatus, SupportTicketCategory, SupportTicketPriority } from '@/types/admin'

interface TicketFiltersProps {
  status: SupportTicketStatus | 'all'
  category: SupportTicketCategory | 'all'
  priority: SupportTicketPriority | 'all'
  search: string
  onStatusChange: (value: SupportTicketStatus | 'all') => void
  onCategoryChange: (value: SupportTicketCategory | 'all') => void
  onPriorityChange: (value: SupportTicketPriority | 'all') => void
  onSearchChange: (value: string) => void
}

export function TicketFilters({
  status,
  category,
  priority,
  search,
  onStatusChange,
  onCategoryChange,
  onPriorityChange,
  onSearchChange,
}: TicketFiltersProps) {
  return (
    <div className="flex flex-col md:flex-row gap-4 mb-6">
      {/* Search */}
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search by ticket #, subject, or email..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Status Filter */}
      <Select value={status} onValueChange={(v) => onStatusChange(v as SupportTicketStatus | 'all')}>
        <SelectTrigger className="w-full md:w-[150px]">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Status</SelectItem>
          <SelectItem value="open">Open</SelectItem>
          <SelectItem value="in_progress">In Progress</SelectItem>
          <SelectItem value="resolved">Resolved</SelectItem>
          <SelectItem value="closed">Closed</SelectItem>
        </SelectContent>
      </Select>

      {/* Category Filter */}
      <Select value={category} onValueChange={(v) => onCategoryChange(v as SupportTicketCategory | 'all')}>
        <SelectTrigger className="w-full md:w-[150px]">
          <SelectValue placeholder="Category" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Categories</SelectItem>
          <SelectItem value="bug_report">Bug Report</SelectItem>
          <SelectItem value="account_issue">Account Issue</SelectItem>
          <SelectItem value="billing_payment">Billing</SelectItem>
          <SelectItem value="general_inquiry">General</SelectItem>
        </SelectContent>
      </Select>

      {/* Priority Filter */}
      <Select value={priority} onValueChange={(v) => onPriorityChange(v as SupportTicketPriority | 'all')}>
        <SelectTrigger className="w-full md:w-[140px]">
          <SelectValue placeholder="Priority" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Priority</SelectItem>
          <SelectItem value="high">High</SelectItem>
          <SelectItem value="normal">Normal</SelectItem>
          <SelectItem value="low">Low</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}
