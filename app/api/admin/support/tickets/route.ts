import { NextRequest, NextResponse } from 'next/server'
import { requireSuperadmin, getRequestMetadata } from '@/lib/auth/admin-middleware'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { logAdminActivity } from '@/lib/admin/activity-logger'
import type { ApiResponse } from '@/types'
import type { PaginationInfo, SupportTicket } from '@/types/admin'

/**
 * GET /api/admin/support/tickets
 * List all support tickets with pagination and filters
 */
export async function GET(request: NextRequest) {
  const { userId, response } = await requireSuperadmin(request)
  if (response) return response

  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const status = searchParams.get('status') || 'all'
    const category = searchParams.get('category') || 'all'
    const priority = searchParams.get('priority') || 'all'
    const search = searchParams.get('search') || ''
    const sortBy = searchParams.get('sortBy') || 'created_at'
    const sortOrder = (searchParams.get('sortOrder') || 'desc') as 'asc' | 'desc'

    const offset = (page - 1) * limit

    // Build query
    let query = supabaseAdmin
      .from('support_tickets')
      .select(
        `
        *,
        user:users!user_id(id, email, display_name),
        admin:users!admin_id(id, email, display_name)
        `,
        { count: 'exact' }
      )
      .range(offset, offset + limit - 1)
      .order(sortBy, { ascending: sortOrder === 'asc' })

    // Apply status filter
    if (status && status !== 'all') {
      query = query.eq('status', status)
    }

    // Apply category filter
    if (category && category !== 'all') {
      query = query.eq('category', category)
    }

    // Apply priority filter
    if (priority && priority !== 'all') {
      query = query.eq('priority', priority)
    }

    // Apply search filter (ticket number, subject, or email)
    if (search) {
      query = query.or(`ticket_number.ilike.%${search}%,subject.ilike.%${search}%,user_email.ilike.%${search}%`)
    }

    const { data: ticketsData, error, count } = await query

    if (error) {
      console.error('Failed to fetch support tickets:', error)
      throw error
    }

    const tickets: SupportTicket[] = (ticketsData || []).map((ticket: any) => ({
      id: ticket.id,
      userId: ticket.user_id || undefined,
      userEmail: ticket.user_email,
      userName: ticket.user_name || undefined,
      ticketNumber: ticket.ticket_number,
      category: ticket.category,
      subject: ticket.subject,
      message: ticket.message,
      status: ticket.status,
      priority: ticket.priority,
      adminId: ticket.admin_id || undefined,
      adminNotes: ticket.admin_notes || undefined,
      resolvedAt: ticket.resolved_at ? new Date(ticket.resolved_at) : undefined,
      createdAt: new Date(ticket.created_at),
      updatedAt: new Date(ticket.updated_at),
      user: ticket.user ? {
        id: ticket.user.id,
        email: ticket.user.email,
        displayName: ticket.user.display_name || undefined,
      } : undefined,
      admin: ticket.admin ? {
        id: ticket.admin.id,
        email: ticket.admin.email,
        displayName: ticket.admin.display_name || undefined,
      } : undefined,
    }))

    const pagination: PaginationInfo = {
      page,
      limit,
      total: count || 0,
      totalPages: Math.ceil((count || 0) / limit),
    }

    // Log admin activity
    const { ipAddress, userAgent } = getRequestMetadata(request)
    await logAdminActivity({
      adminId: userId,
      actionType: 'ticket_view',
      targetType: 'tickets',
      details: { filters: { status, category, priority, search, page, limit } },
      ipAddress,
      userAgent,
    })

    return NextResponse.json<ApiResponse>({
      success: true,
      data: {
        tickets,
        pagination,
      },
    })
  } catch (error) {
    console.error('Admin support tickets list error:', error)
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Failed to fetch support tickets' },
      { status: 500 }
    )
  }
}
