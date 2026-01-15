'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { StatusBadge } from '@/components/admin/shared/status-badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'
import type { StoryReport, StoryReportAction } from '@/types/admin'

export default function ReportDetailPage() {
  const params = useParams()
  const router = useRouter()
  const reportId = params.id as string

  const [report, setReport] = useState<StoryReport | null>(null)
  const [loading, setLoading] = useState(true)
  const [resolving, setResolving] = useState(false)

  const [resolutionNotes, setResolutionNotes] = useState('')
  const [actionTaken, setActionTaken] = useState<StoryReportAction>('no_action')

  useEffect(() => {
    fetchReport()
  }, [reportId])

  async function fetchReport() {
    try {
      const res = await fetch(`/api/admin/content/reports/${reportId}`)
      const data = await res.json()

      if (data.success) {
        setReport(data.data)
        setResolutionNotes(data.data.resolutionNotes || '')
        setActionTaken(data.data.actionTaken || 'no_action')
      } else {
        toast.error('Failed to load report details')
      }
    } catch (error) {
      console.error('Error fetching report:', error)
      toast.error('Failed to load report details')
    } finally {
      setLoading(false)
    }
  }

  async function resolveReport() {
    if (!resolutionNotes.trim()) {
      toast.error('Please add resolution notes')
      return
    }

    if (!confirm(`Resolve this report with action: ${actionTaken}?`)) {
      return
    }

    try {
      setResolving(true)
      const res = await fetch(`/api/admin/content/reports/${reportId}/resolve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ actionTaken, resolutionNotes }),
      })

      const data = await res.json()

      if (data.success) {
        toast.success('Report resolved successfully')
        fetchReport()
      } else {
        toast.error(data.error || 'Failed to resolve report')
      }
    } catch (error) {
      console.error('Error resolving report:', error)
      toast.error('Failed to resolve report')
    } finally {
      setResolving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-400"></div>
      </div>
    )
  }

  if (!report) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Report not found</p>
        <Button onClick={() => router.push('/admin/content/reports')} className="mt-4">
          Back to Reports
        </Button>
      </div>
    )
  }

  const isResolved = report.status === 'resolved'

  return (
    <div className="space-y-6">
      <Button variant="ghost" onClick={() => router.push('/admin/content/reports')}>
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Reports
      </Button>

      {/* Report Details */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h1 className="text-2xl font-bold mb-4">Report Details</h1>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <p className="text-sm text-gray-600">Status:</p>
            <StatusBadge status={report.status} type="report" />
          </div>
          <div>
            <p className="text-sm text-gray-600">Reason:</p>
            <p className="font-medium capitalize">{report.reason}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Reported By:</p>
            <p className="font-medium">{report.reporter?.email || 'Unknown'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Reported On:</p>
            <p className="font-medium">{new Date(report.createdAt).toLocaleString()}</p>
          </div>
        </div>

        {report.description && (
          <div className="mb-6">
            <p className="text-sm text-gray-600 mb-2">Description:</p>
            <p className="text-sm bg-gray-50 p-3 rounded">{report.description}</p>
          </div>
        )}

        {isResolved && (
          <div className="border-t pt-6">
            <h3 className="font-semibold mb-3">Resolution</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Reviewed By:</p>
                <p className="font-medium">{report.reviewer?.email || 'Unknown'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Reviewed On:</p>
                <p className="font-medium">
                  {report.reviewedAt ? new Date(report.reviewedAt).toLocaleString() : 'N/A'}
                </p>
              </div>
              <div className="col-span-2">
                <p className="text-sm text-gray-600">Action Taken:</p>
                <p className="font-medium capitalize">{report.actionTaken?.replace(/_/g, ' ')}</p>
              </div>
              {report.resolutionNotes && (
                <div className="col-span-2">
                  <p className="text-sm text-gray-600">Resolution Notes:</p>
                  <p className="text-sm bg-gray-50 p-3 rounded">{report.resolutionNotes}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Story Preview */}
      {report.story && (
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h2 className="text-lg font-semibold mb-4">Reported Story</h2>
          <div className="mb-4">
            <h3 className="text-xl font-bold mb-2">{report.story.title}</h3>
            <StatusBadge status={report.story.visibility} type="visibility" />
          </div>
          <div className="prose max-w-none">
            <p className="text-gray-700 whitespace-pre-wrap line-clamp-10">{report.story.content}</p>
          </div>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => window.open(`/story/${report.storyId}`, '_blank')}
          >
            View Full Story
          </Button>
        </div>
      )}

      {/* Resolution Section */}
      {!isResolved && (
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h2 className="text-lg font-semibold mb-4">Resolve Report</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Action Taken
              </label>
              <Select value={actionTaken} onValueChange={(v) => setActionTaken(v as StoryReportAction)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="no_action">No Action</SelectItem>
                  <SelectItem value="warning_sent">Warning Sent</SelectItem>
                  <SelectItem value="story_hidden">Story Hidden</SelectItem>
                  <SelectItem value="story_deleted">Story Deleted</SelectItem>
                  <SelectItem value="user_warned">User Warned</SelectItem>
                  <SelectItem value="user_suspended">User Suspended</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Resolution Notes
              </label>
              <Textarea
                value={resolutionNotes}
                onChange={(e) => setResolutionNotes(e.target.value)}
                placeholder="Explain your decision and any actions taken..."
                rows={5}
              />
            </div>

            <Button onClick={resolveReport} disabled={resolving} className="w-full bg-green-600 hover:bg-green-700 text-white">
              {resolving ? 'Resolving...' : 'Resolve Report'}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
