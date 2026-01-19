import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth/middleware'
import { supabaseAdmin } from '@/lib/supabase/admin'
import type { ApiResponse } from '@/types'

/**
 * GET /api/support/my-tickets
 * Get the current user's support tickets
 */
export async function GET(request: NextRequest) {
  const { userId, response } = await requireAuth(request)
  if (response) return response

  try {
    const { data: tickets, error } = await supabaseAdmin
      .from('support_tickets')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(20)

    if (error) {
      console.error('[My Tickets] Database error:', error)
      throw error
    }

    // Map to frontend format (only expose fields users should see)
    const userTickets = (tickets || []).map((ticket: any) => ({
      id: ticket.id,
      ticketNumber: ticket.ticket_number,
      category: ticket.category,
      subject: ticket.subject,
      message: ticket.message,
      status: ticket.status,
      adminResponse: ticket.admin_response || null,
      createdAt: ticket.created_at,
      updatedAt: ticket.updated_at,
      resolvedAt: ticket.resolved_at,
    }))

    return NextResponse.json<ApiResponse>({
      success: true,
      data: { tickets: userTickets },
    })
  } catch (error) {
    console.error('[My Tickets] Error:', error)
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Failed to fetch your tickets' },
      { status: 500 }
    )
  }
}
