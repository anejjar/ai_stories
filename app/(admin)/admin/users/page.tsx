'use client'

import { useEffect, useState } from 'react'
import { UserFilters } from '@/components/admin/users/user-filters'
import { UsersTable } from '@/components/admin/users/users-table'
import { Pagination } from '@/components/admin/shared/pagination'
import type { AdminUserListItem, PaginationInfo } from '@/types/admin'
import type { SubscriptionTier } from '@/types'

export default function UsersPage() {
  const [users, setUsers] = useState<AdminUserListItem[]>([])
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 50,
    total: 0,
    totalPages: 0,
  })
  const [loading, setLoading] = useState(true)

  // Filters
  const [search, setSearch] = useState('')
  const [tier, setTier] = useState<SubscriptionTier | 'all'>('all')
  const [sortBy, setSortBy] = useState('created_at')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  useEffect(() => {
    fetchUsers()
  }, [pagination.page, search, tier, sortBy, sortOrder])

  async function fetchUsers() {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        search,
        tier,
        sortBy,
        sortOrder,
      })

      const res = await fetch(`/api/admin/users?${params}`)
      const data = await res.json()

      if (data.success) {
        setUsers(data.data.users)
        setPagination(data.data.pagination)
      } else {
        console.error('Failed to fetch users:', data.error)
      }
    } catch (error) {
      console.error('Error fetching users:', error)
    } finally {
      setLoading(false)
    }
  }

  function handlePageChange(page: number) {
    setPagination((prev) => ({ ...prev, page }))
  }

  function handleSearchChange(value: string) {
    setSearch(value)
    setPagination((prev) => ({ ...prev, page: 1 }))
  }

  function handleTierChange(value: SubscriptionTier | 'all') {
    setTier(value)
    setPagination((prev) => ({ ...prev, page: 1 }))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">User Management</h1>
        <div className="text-sm text-gray-500">Total: {pagination.total} users</div>
      </div>

      <UserFilters
        search={search}
        tier={tier}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSearchChange={handleSearchChange}
        onTierChange={handleTierChange}
        onSortByChange={setSortBy}
        onSortOrderChange={setSortOrder}
      />

      {loading ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-400 mx-auto"></div>
          <p className="text-gray-500 mt-4">Loading users...</p>
        </div>
      ) : (
        <>
          <UsersTable users={users} />
          {pagination.totalPages > 1 && (
            <Pagination pagination={pagination} onPageChange={handlePageChange} />
          )}
        </>
      )}
    </div>
  )
}
