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
import { ArrowLeft, Mail, Clock, User, Tag, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import type { SupportTicket, SupportTicketStatus, SupportTicketPriority } from '@/types/admin'

const CATEGORY_LABELS: Record<string, string> = {
  bug_report: 'Bug Report',
  account_issue: 'Account Issue',
  billing_payment: 'Billing / Payment',
  general_inquiry: 'General Inquiry',
}

export default function TicketDetailPage() {
  const params = useParams()
  const router = useRouter()
  const ticketId = params.id as string

  const [ticket, setTicket] = useState<SupportTicket | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)

  const [newStatus, setNewStatus] = useState<SupportTicketStatus>('open')
  const [newPriority, setNewPriority] = useState<SupportTicketPriority>('normal')
  const [adminResponse, setAdminResponse] = useState('')
  const [adminNotes, setAdminNotes] = useState('')

  useEffect(() => {
    fetchTicket()
  }, [ticketId])

  async function fetchTicket() {
    try {
      const res = await fetch(`/api/admin/support/tickets/${ticketId}`)
      const data = await res.json()

      if (data.success) {
        setTicket(data.data)
        setNewStatus(data.data.status)
        setNewPriority(data.data.priority)
        setAdminResponse(data.data.adminResponse || '')
        setAdminNotes(data.data.adminNotes || '')
      } else {
        toast.error('Failed to load ticket details')
      }
    } catch (error) {
      console.error('Error fetching ticket:', error)
      toast.error('Failed to load ticket details')
    } finally {
      setLoading(false)
    }
  }

  async function updateTicket() {
    try {
      setUpdating(true)
      const res = await fetch(`/api/admin/support/tickets/${ticketId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatus,
          priority: newPriority,
          adminResponse,
          adminNotes,
        }),
      })

      const data = await res.json()

      if (data.success) {
        toast.success('Ticket updated successfully')
        fetchTicket()
      } else {
        toast.error(data.error || 'Failed to update ticket')
      }
    } catch (error) {
      console.error('Error updating ticket:', error)
      toast.error('Failed to update ticket')
    } finally {
      setUpdating(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-400"></div>
      </div>
    )
  }

  if (!ticket) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Ticket not found</p>
        <Button onClick={() => router.push('/admin/support/tickets')} className="mt-4">
          Back to Tickets
        </Button>
      </div>
    )
  }

  const isClosed = ticket.status === 'resolved' || ticket.status === 'closed'

  return (
    <div className="space-y-6">
      <Button variant="ghost" onClick={() => router.push('/admin/support/tickets')}>
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Tickets
      </Button>

      {/* Ticket Header */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-sm font-mono text-gray-400 mb-1">{ticket.ticketNumber}</p>
            <h1 className="text-2xl font-bold text-gray-900">{ticket.subject}</h1>
          </div>
          <StatusBadge status={ticket.status} type="ticket" />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="flex items-center gap-2 text-gray-600">
            <Tag className="h-4 w-4" />
            <span>{CATEGORY_LABELS[ticket.category]}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <AlertCircle className="h-4 w-4" />
            <span className="capitalize">{ticket.priority} Priority</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <Clock className="h-4 w-4" />
            <span>{new Date(ticket.createdAt).toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <User className="h-4 w-4" />
            <span>{ticket.userName || 'Unknown'}</span>
          </div>
        </div>
      </div>

      {/* User & Contact Info */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h2 className="text-lg font-semibold mb-4">Contact Information</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">Name</p>
            <p className="font-medium">{ticket.userName || 'Not provided'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Email</p>
            <a
              href={`mailto:${ticket.userEmail}?subject=Re: ${ticket.ticketNumber} - ${ticket.subject}`}
              className="font-medium text-blue-600 hover:underline flex items-center gap-2"
            >
              <Mail className="h-4 w-4" />
              {ticket.userEmail}
            </a>
          </div>
          {ticket.userId && (
            <div>
              <p className="text-sm text-gray-500">User ID</p>
              <p className="font-mono text-sm">{ticket.userId}</p>
            </div>
          )}
        </div>
      </div>

      {/* Message */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h2 className="text-lg font-semibold mb-4">Message</h2>
        <div className="bg-gray-50 p-4 rounded-lg whitespace-pre-wrap text-gray-700">
          {ticket.message}
        </div>
      </div>

      {/* Admin Actions */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h2 className="text-lg font-semibold mb-4">
          {isClosed ? 'Resolution' : 'Update Ticket'}
        </h2>

        <div className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <Select
                value={newStatus}
                onValueChange={(v) => setNewStatus(v as SupportTicketStatus)}
                disabled={isClosed}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Priority
              </label>
              <Select
                value={newPriority}
                onValueChange={(v) => setNewPriority(v as SupportTicketPriority)}
                disabled={isClosed}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Response to User
              <span className="text-xs text-purple-600 ml-2 font-normal">(Visible to the user)</span>
            </label>
            <Textarea
              value={adminResponse}
              onChange={(e) => setAdminResponse(e.target.value)}
              placeholder="Write a response that the user will see..."
              rows={4}
              disabled={isClosed}
              className="border-purple-200 focus:border-purple-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Internal Notes
              <span className="text-xs text-gray-400 ml-2 font-normal">(Only visible to admins)</span>
            </label>
            <Textarea
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              placeholder="Internal notes about this ticket..."
              rows={3}
              disabled={isClosed}
            />
          </div>

          {!isClosed && (
            <div className="flex gap-4">
              <Button
                onClick={updateTicket}
                disabled={updating}
                className="flex-1"
              >
                {updating ? 'Saving...' : 'Save Changes'}
              </Button>
              <Button
                onClick={() => {
                  setNewStatus('resolved')
                  setTimeout(updateTicket, 100)
                }}
                disabled={updating}
                className="bg-green-600 hover:bg-green-700"
              >
                Mark Resolved
              </Button>
            </div>
          )}

          {isClosed && ticket.resolvedAt && (
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <p className="text-sm text-green-800">
                <strong>Resolved on:</strong>{' '}
                {new Date(ticket.resolvedAt).toLocaleString()}
                {ticket.admin && (
                  <span> by {ticket.admin.displayName || ticket.admin.email}</span>
                )}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Reply */}
      {!isClosed && (
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-800 mb-2">
            <strong>Quick Reply:</strong> Click the email above to send a direct response to the user.
          </p>
          <p className="text-xs text-blue-600">
            Remember to update the ticket status after responding.
          </p>
        </div>
      )}
    </div>
  )
}
