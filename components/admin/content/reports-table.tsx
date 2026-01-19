'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { StatusBadge } from '@/components/admin/shared/status-badge'
import type { StoryReport } from '@/types/admin'

interface ReportsTableProps {
  reports: StoryReport[]
}

export function ReportsTable({ reports }: ReportsTableProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Story
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Reported By
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Reason
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
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
          {reports.map((report) => (
            <tr key={report.id} className="hover:bg-gray-50">
              <td className="px-6 py-4">
                <div className="text-sm font-medium text-gray-900 truncate max-w-xs">
                  {report.story?.title || 'Story deleted'}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">
                  {report.reporter?.email || 'Unknown'}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-2 py-1 text-xs font-semibold rounded-full border capitalize ${
                  report.reason === 'inappropriate' 
                    ? 'bg-red-100 text-red-800 border-red-300'
                    : report.reason === 'spam'
                    ? 'bg-orange-100 text-orange-800 border-orange-300'
                    : report.reason === 'copyright'
                    ? 'bg-yellow-100 text-yellow-800 border-yellow-300'
                    : 'bg-gray-100 text-gray-800 border-gray-300'
                }`}>
                  {report.reason}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <StatusBadge status={report.status} type="report" />
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {new Date(report.createdAt).toLocaleDateString()}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <Link href={`/admin/content/reports/${report.id}`}>
                  <Button variant="outline" size="sm" className="border-yellow-300 text-yellow-700 hover:bg-yellow-50">
                    Review
                  </Button>
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {reports.length === 0 && (
        <div className="text-center py-12 text-gray-500">No reports found</div>
      )}
    </div>
  )
}
