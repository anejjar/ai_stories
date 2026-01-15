'use client'

import { useEffect, useState } from 'react'
import { ReportsTable } from '@/components/admin/content/reports-table'
import { Pagination } from '@/components/admin/shared/pagination'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { StoryReport, PaginationInfo, StoryReportStatus, StoryReportReason } from '@/types/admin'

export default function ReportsPage() {
  const [reports, setReports] = useState<StoryReport[]>([])
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 50,
    total: 0,
    totalPages: 0,
  })
  const [loading, setLoading] = useState(true)

  // Filters
  const [status, setStatus] = useState<StoryReportStatus | 'all'>('all')
  const [reason, setReason] = useState<StoryReportReason | 'all'>('all')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  useEffect(() => {
    fetchReports()
  }, [pagination.page, status, reason, sortOrder])

  async function fetchReports() {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        status,
        reason,
        sortBy: 'created_at',
        sortOrder,
      })

      const res = await fetch(`/api/admin/content/reports?${params}`)
      const data = await res.json()

      if (data.success) {
        setReports(data.data.reports)
        setPagination(data.data.pagination)
      } else {
        console.error('Failed to fetch reports:', data.error)
      }
    } catch (error) {
      console.error('Error fetching reports:', error)
    } finally {
      setLoading(false)
    }
  }

  function handlePageChange(page: number) {
    setPagination((prev) => ({ ...prev, page }))
  }

  function handleStatusChange(value: string) {
    setStatus(value as StoryReportStatus | 'all')
    setPagination((prev) => ({ ...prev, page: 1 }))
  }

  function handleReasonChange(value: string) {
    setReason(value as StoryReportReason | 'all')
    setPagination((prev) => ({ ...prev, page: 1 }))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Story Reports</h1>
        <div className="text-sm text-gray-500">Total: {pagination.total} reports</div>
      </div>

      <div className="flex gap-4">
        <Select value={status} onValueChange={handleStatusChange}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="reviewed">Reviewed</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
            <SelectItem value="dismissed">Dismissed</SelectItem>
          </SelectContent>
        </Select>

        <Select value={reason} onValueChange={handleReasonChange}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Reason" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Reasons</SelectItem>
            <SelectItem value="inappropriate">Inappropriate</SelectItem>
            <SelectItem value="spam">Spam</SelectItem>
            <SelectItem value="copyright">Copyright</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>

        <Select value={sortOrder} onValueChange={(v) => setSortOrder(v as 'asc' | 'desc')}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Order" />
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
          <p className="text-gray-500 mt-4">Loading reports...</p>
        </div>
      ) : (
        <>
          <ReportsTable reports={reports} />
          {pagination.totalPages > 1 && (
            <Pagination pagination={pagination} onPageChange={handlePageChange} />
          )}
        </>
      )}
    </div>
  )
}
