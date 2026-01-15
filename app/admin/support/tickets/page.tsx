'use client'

import { useEffect, useState } from 'react'
import { TicketsTable } from '@/components/admin/support/tickets-table'
import { TicketFilters } from '@/components/admin/support/ticket-filters'
import { Pagination } from '@/components/admin/shared/pagination'
import type {
  SupportTicket,
  PaginationInfo,
  SupportTicketStatus,
  SupportTicketCategory,
  SupportTicketPriority,
} from '@/types/admin'

export default function SupportTicketsPage() {
  const [tickets, setTickets] = useState<SupportTicket[]>([])
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 50,
    total: 0,
    totalPages: 0,
  })
  const [loading, setLoading] = useState(true)

  // Filters
  const [status, setStatus] = useState<SupportTicketStatus | 'all'>('all')
  const [category, setCategory] = useState<SupportTicketCategory | 'all'>('all')
  const [priority, setPriority] = useState<SupportTicketPriority | 'all'>('all')
  const [search, setSearch] = useState('')

  // Debounce search
  const [debouncedSearch, setDebouncedSearch] = useState('')
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300)
    return () => clearTimeout(timer)
  }, [search])

  useEffect(() => {
    fetchTickets()
  }, [pagination.page, status, category, priority, debouncedSearch])

  async function fetchTickets() {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        status,
        category,
        priority,
        search: debouncedSearch,
        sortBy: 'created_at',
        sortOrder: 'desc',
      })

      const res = await fetch(`/api/admin/support/tickets?${params}`)
      const data = await res.json()

      if (data.success) {
        setTickets(data.data.tickets)
        setPagination(data.data.pagination)
      } else {
        console.error('Failed to fetch tickets:', data.error)
      }
    } catch (error) {
      console.error('Error fetching tickets:', error)
    } finally {
      setLoading(false)
    }
  }

  function handlePageChange(page: number) {
    setPagination((prev) => ({ ...prev, page }))
  }

  function handleStatusChange(value: SupportTicketStatus | 'all') {
    setStatus(value)
    setPagination((prev) => ({ ...prev, page: 1 }))
  }

  function handleCategoryChange(value: SupportTicketCategory | 'all') {
    setCategory(value)
    setPagination((prev) => ({ ...prev, page: 1 }))
  }

  function handlePriorityChange(value: SupportTicketPriority | 'all') {
    setPriority(value)
    setPagination((prev) => ({ ...prev, page: 1 }))
  }

  function handleSearchChange(value: string) {
    setSearch(value)
    setPagination((prev) => ({ ...prev, page: 1 }))
  }

  // Count open tickets
  const openCount = tickets.filter((t) => t.status === 'open').length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Support Tickets</h1>
          {openCount > 0 && (
            <p className="text-sm text-yellow-600 mt-1">
              {openCount} ticket{openCount !== 1 ? 's' : ''} awaiting response
            </p>
          )}
        </div>
        <div className="text-sm text-gray-500">Total: {pagination.total} tickets</div>
      </div>

      <TicketFilters
        status={status}
        category={category}
        priority={priority}
        search={search}
        onStatusChange={handleStatusChange}
        onCategoryChange={handleCategoryChange}
        onPriorityChange={handlePriorityChange}
        onSearchChange={handleSearchChange}
      />

      {loading ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-400 mx-auto"></div>
          <p className="text-gray-500 mt-4">Loading tickets...</p>
        </div>
      ) : (
        <>
          <TicketsTable tickets={tickets} />
          {pagination.totalPages > 1 && (
            <Pagination pagination={pagination} onPageChange={handlePageChange} />
          )}
        </>
      )}
    </div>
  )
}
