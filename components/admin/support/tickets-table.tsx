'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { StatusBadge } from '@/components/admin/shared/status-badge'
import type { SupportTicket } from '@/types/admin'

interface TicketsTableProps {
  tickets: SupportTicket[]
}

const CATEGORY_LABELS: Record<string, string> = {
  bug_report: 'Bug Report',
  account_issue: 'Account',
  billing_payment: 'Billing',
  general_inquiry: 'General',
}

const CATEGORY_COLORS: Record<string, string> = {
  bug_report: 'bg-red-100 text-red-800 border-red-300',
  account_issue: 'bg-blue-100 text-blue-800 border-blue-300',
  billing_payment: 'bg-green-100 text-green-800 border-green-300',
  general_inquiry: 'bg-purple-100 text-purple-800 border-purple-300',
}

const PRIORITY_COLORS: Record<string, string> = {
  low: 'bg-gray-100 text-gray-600',
  normal: 'bg-yellow-100 text-yellow-700',
  high: 'bg-red-100 text-red-700',
}

export function TicketsTable({ tickets }: TicketsTableProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Ticket
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              User
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Category
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Priority
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
          {tickets.map((ticket) => (
            <tr key={ticket.id} className="hover:bg-gray-50">
              <td className="px-6 py-4">
                <div>
                  <div className="text-xs font-mono text-gray-400 mb-1">
                    {ticket.ticketNumber}
                  </div>
                  <div className="text-sm font-medium text-gray-900 truncate max-w-xs">
                    {ticket.subject}
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div>
                  <div className="text-sm text-gray-900">
                    {ticket.userName || ticket.userEmail}
                  </div>
                  {ticket.userName && (
                    <div className="text-xs text-gray-500">
                      {ticket.userEmail}
                    </div>
                  )}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-2 py-1 text-xs font-semibold rounded-full border ${CATEGORY_COLORS[ticket.category]}`}>
                  {CATEGORY_LABELS[ticket.category]}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${PRIORITY_COLORS[ticket.priority]}`}>
                  {ticket.priority.charAt(0).toUpperCase() + ticket.priority.slice(1)}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <StatusBadge status={ticket.status} type="ticket" />
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {new Date(ticket.createdAt).toLocaleDateString()}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <Link href={`/admin/support/tickets/${ticket.id}`}>
                  <Button variant="outline" size="sm" className="border-purple-300 text-purple-700 hover:bg-purple-50">
                    View
                  </Button>
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {tickets.length === 0 && (
        <div className="text-center py-12 text-gray-500">No support tickets found</div>
      )}
    </div>
  )
}
