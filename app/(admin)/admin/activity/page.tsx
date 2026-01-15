'use client'

import { useEffect, useState } from 'react'
import { ActivityLogTable } from '@/components/admin/system/activity-log-table'
import { Pagination } from '@/components/admin/shared/pagination'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { AdminActivity, AdminActionType, PaginationInfo } from '@/types/admin'

export default function ActivityLogPage() {
  const [activities, setActivities] = useState<AdminActivity[]>([])
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 50,
    total: 0,
    totalPages: 0,
  })
  const [loading, setLoading] = useState(true)

  // Filters
  const [actionType, setActionType] = useState<AdminActionType | 'all'>('all')

  useEffect(() => {
    fetchActivityLog()
  }, [pagination.page, actionType])

  async function fetchActivityLog() {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
      })

      if (actionType && actionType !== 'all') {
        params.append('actionType', actionType)
      }

      const res = await fetch(`/api/admin/system/activity?${params}`)
      const data = await res.json()

      if (data.success) {
        setActivities(data.data.activities)
        setPagination(data.data.pagination)
      } else {
        console.error('Failed to fetch activity log:', data.error)
      }
    } catch (error) {
      console.error('Error fetching activity log:', error)
    } finally {
      setLoading(false)
    }
  }

  function handlePageChange(page: number) {
    setPagination((prev) => ({ ...prev, page }))
  }

  function handleActionTypeChange(value: string) {
    setActionType(value as AdminActionType | 'all')
    setPagination((prev) => ({ ...prev, page: 1 }))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Admin Activity Log</h1>
        <div className="text-sm text-gray-500">Total: {pagination.total} activities</div>
      </div>

      <div className="flex gap-4">
        <Select value={actionType} onValueChange={handleActionTypeChange}>
          <SelectTrigger className="w-64">
            <SelectValue placeholder="Filter by action" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Actions</SelectItem>
            <SelectItem value="user_view">User View</SelectItem>
            <SelectItem value="user_edit">User Edit</SelectItem>
            <SelectItem value="subscription_change">Subscription Change</SelectItem>
            <SelectItem value="story_review">Story Review</SelectItem>
            <SelectItem value="story_delete">Story Delete</SelectItem>
            <SelectItem value="report_review">Report Review</SelectItem>
          </SelectContent>
        </Select>

        <div className="text-sm text-gray-500 flex items-center">
          <span>Showing last {pagination.limit} activities</span>
        </div>
      </div>

      {loading ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-400 mx-auto"></div>
          <p className="text-gray-500 mt-4">Loading activity log...</p>
        </div>
      ) : (
        <>
          <ActivityLogTable activities={activities} />
          {pagination.totalPages > 1 && (
            <Pagination pagination={pagination} onPageChange={handlePageChange} />
          )}
        </>
      )}
    </div>
  )
}
