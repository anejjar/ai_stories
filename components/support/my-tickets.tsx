'use client'

import { useState, useEffect } from 'react'
import { ChevronDown, ChevronUp, Clock, CheckCircle, Loader2, XCircle, MessageSquare } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'

interface UserTicket {
  id: string
  ticketNumber: string
  category: string
  subject: string
  message: string
  status: 'open' | 'in_progress' | 'resolved' | 'closed'
  adminResponse: string | null
  createdAt: string
  updatedAt: string
  resolvedAt: string | null
}

interface MyTicketsProps {
  userId?: string
}

const CATEGORY_LABELS: Record<string, string> = {
  bug_report: 'Bug Report',
  account_issue: 'Account Issue',
  billing_payment: 'Billing',
  general_inquiry: 'General',
}

const STATUS_CONFIG: Record<string, { label: string; icon: any; color: string; bgColor: string }> = {
  open: {
    label: 'Open',
    icon: Clock,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-100',
  },
  in_progress: {
    label: 'In Progress',
    icon: Loader2,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
  },
  resolved: {
    label: 'Resolved',
    icon: CheckCircle,
    color: 'text-green-600',
    bgColor: 'bg-green-100',
  },
  closed: {
    label: 'Closed',
    icon: XCircle,
    color: 'text-gray-600',
    bgColor: 'bg-gray-100',
  },
}

function timeAgo(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (seconds < 60) return 'Just now'
  if (seconds < 3600) return `${Math.floor(seconds / 60)} min ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`
  if (seconds < 604800) return `${Math.floor(seconds / 86400)} days ago`
  return date.toLocaleDateString()
}

function TicketCard({ ticket }: { ticket: UserTicket }) {
  const [isExpanded, setIsExpanded] = useState(false)
  const statusConfig = STATUS_CONFIG[ticket.status]
  const StatusIcon = statusConfig.icon

  return (
    <div className="bg-white rounded-2xl border-2 border-gray-100 overflow-hidden transition-all hover:border-gray-200">
      {/* Header - Always visible */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-5 text-left flex items-start justify-between gap-4"
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono text-gray-400">{ticket.ticketNumber}</span>
            <span className="text-xs text-gray-300">·</span>
            <span className="text-xs text-gray-400">{CATEGORY_LABELS[ticket.category]}</span>
          </div>
          <h4 className="font-bold text-gray-900 truncate">{ticket.subject}</h4>
          <div className="flex items-center gap-3 mt-2">
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${statusConfig.bgColor} ${statusConfig.color}`}>
              <StatusIcon className="h-3 w-3" />
              {statusConfig.label}
            </span>
            <span className="text-xs text-gray-400">{timeAgo(ticket.createdAt)}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {ticket.adminResponse && (
            <span className="text-xs text-purple-600 font-bold flex items-center gap-1">
              <MessageSquare className="h-3 w-3" />
              Reply
            </span>
          )}
          {isExpanded ? (
            <ChevronUp className="h-5 w-5 text-gray-400" />
          ) : (
            <ChevronDown className="h-5 w-5 text-gray-400" />
          )}
        </div>
      </button>

      {/* Expanded content */}
      {isExpanded && (
        <div className="px-5 pb-5 space-y-4 border-t border-gray-50 pt-4">
          {/* Original message */}
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Your Message</p>
            <p className="text-sm text-gray-600 whitespace-pre-wrap bg-gray-50 p-4 rounded-xl">
              {ticket.message}
            </p>
          </div>

          {/* Admin response */}
          {ticket.adminResponse && (
            <div>
              <p className="text-xs font-bold text-purple-500 uppercase tracking-widest mb-2">Our Response</p>
              <p className="text-sm text-gray-700 whitespace-pre-wrap bg-purple-50 p-4 rounded-xl border border-purple-100">
                {ticket.adminResponse}
              </p>
            </div>
          )}

          {/* Status info */}
          {ticket.status === 'resolved' && ticket.resolvedAt && (
            <p className="text-xs text-green-600">
              Resolved on {new Date(ticket.resolvedAt).toLocaleDateString()}
            </p>
          )}
        </div>
      )}
    </div>
  )
}

export function MyTickets({ userId }: MyTicketsProps) {
  const { getAccessToken } = useAuth()
  const [tickets, setTickets] = useState<UserTicket[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (userId) {
      fetchTickets()
    } else {
      setIsLoading(false)
    }
  }, [userId])

  const fetchTickets = async () => {
    try {
      const token = await getAccessToken()
      if (!token) {
        setError('Please sign in to view tickets')
        setIsLoading(false)
        return
      }

      const res = await fetch('/api/support/my-tickets', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      const data = await res.json()

      if (data.success) {
        setTickets(data.data.tickets)
      } else {
        setError(data.error || 'Failed to load tickets')
      }
    } catch (err) {
      console.error('Error fetching tickets:', err)
      setError('Failed to load tickets')
    } finally {
      setIsLoading(false)
    }
  }

  // Don't show section if not logged in
  if (!userId) {
    return null
  }

  if (isLoading) {
    return (
      <div className="bg-white p-8 rounded-[3rem] border-4 border-gray-100 shadow-sm">
        <div className="flex items-center justify-center py-8">
          <div className="w-6 h-6 border-3 border-purple-600 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white p-8 rounded-[3rem] border-4 border-gray-100 shadow-sm">
        <p className="text-center text-gray-500">{error}</p>
      </div>
    )
  }

  if (tickets.length === 0) {
    return null // Don't show empty section
  }

  return (
    <div className="bg-white p-8 rounded-[3rem] border-4 border-gray-100 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-black text-gray-900">My Tickets</h2>
        <span className="text-sm text-gray-400 font-bold">{tickets.length} ticket{tickets.length !== 1 ? 's' : ''}</span>
      </div>

      <div className="space-y-4">
        {tickets.map((ticket) => (
          <TicketCard key={ticket.id} ticket={ticket} />
        ))}
      </div>
    </div>
  )
}
