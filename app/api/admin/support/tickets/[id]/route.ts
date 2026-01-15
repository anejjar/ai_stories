import { NextRequest, NextResponse } from 'next/server'
import { requireSuperadmin, getRequestMetadata } from '@/lib/auth/admin-middleware'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { logAdminActivity } from '@/lib/admin/activity-logger'
import type { ApiResponse } from '@/types'
import type { SupportTicket } from '@/types/admin'

interface RouteContext {
  params: Promise<{ id: string }>
}

/**
 * GET /api/admin/support/tickets/[id]
 * Get detailed information about a specific support ticket
 */
export async function GET(request: NextRequest, context: RouteContext) {
  const { userId, response } = await requireSuperadmin(request)
  if (response) return response

  try {
    const { id: ticketId } = await context.params

    const { data: ticketData, error } = await supabaseAdmin
      .from('support_tickets')
      .select(
        `
        *,
        user:users!user_id(id, email, display_name, photo_url),
        admin:users!admin_id(id, email, display_name)
        `
      )
      .eq('id', ticketId)
      .single()

    if (error || !ticketData) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Ticket not found' },
        { status: 404 }
      )
    }

    const ticketDataTyped = ticketData as any
    const ticket: SupportTicket = {
      id: ticketDataTyped.id,
      userId: ticketDataTyped.user_id || undefined,
      userEmail: ticketDataTyped.user_email,
      userName: ticketDataTyped.user_name || undefined,
      ticketNumber: ticketDataTyped.ticket_number,
      category: ticketDataTyped.category,
      subject: ticketDataTyped.subject,
      message: ticketDataTyped.message,
      status: ticketDataTyped.status,
      priority: ticketDataTyped.priority,
      adminId: ticketDataTyped.admin_id || undefined,
      adminNotes: ticketDataTyped.admin_notes || undefined,
      adminResponse: ticketDataTyped.admin_response || undefined,
      resolvedAt: ticketDataTyped.resolved_at ? new Date(ticketDataTyped.resolved_at) : undefined,
      createdAt: new Date(ticketDataTyped.created_at),
      updatedAt: new Date(ticketDataTyped.updated_at),
      user: ticketDataTyped.user ? {
        id: ticketDataTyped.user.id,
        email: ticketDataTyped.user.email,
        displayName: ticketDataTyped.user.display_name || undefined,
      } : undefined,
      admin: ticketDataTyped.admin ? {
        id: ticketDataTyped.admin.id,
        email: ticketDataTyped.admin.email,
        displayName: ticketDataTyped.admin.display_name || undefined,
      } : undefined,
    }

    // Log admin activity
    const { ipAddress, userAgent } = getRequestMetadata(request)
    await logAdminActivity({
      adminId: userId,
      actionType: 'ticket_view',
      targetId: ticketId,
      targetType: 'ticket',
      details: { ticketNumber: ticketDataTyped.ticket_number },
      ipAddress,
      userAgent,
    })

    return NextResponse.json<ApiResponse<SupportTicket>>({
      success: true,
      data: ticket,
    })
  } catch (error) {
    console.error('Admin ticket detail error:', error)
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Failed to fetch ticket details' },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/admin/support/tickets/[id]
 * Update ticket status, priority, or admin notes
 */
export async function PATCH(request: NextRequest, context: RouteContext) {
  const { userId, response } = await requireSuperadmin(request)
  if (response) return response

  try {
    const { id: ticketId } = await context.params
    const body = await request.json()

    const { status, priority, adminResponse, adminNotes } = body

    const updates: any = {
      updated_at: new Date().toISOString(),
    }

    if (status) {
      updates.status = status
      // If status is being changed to resolved or closed, set resolved_at
      if (status === 'resolved' || status === 'closed') {
        updates.resolved_at = new Date().toISOString()
        updates.admin_id = userId
      }
      // If status is being changed to in_progress, assign admin
      if (status === 'in_progress' && !updates.admin_id) {
        updates.admin_id = userId
      }
    }

    if (priority) {
      updates.priority = priority
    }

    if (adminResponse !== undefined) {
      updates.admin_response = adminResponse
    }

    if (adminNotes !== undefined) {
      updates.admin_notes = adminNotes
    }

    const { data: updatedTicket, error } = await (supabaseAdmin
      .from('support_tickets') as any)
      .update(updates)
      .eq('id', ticketId)
      .select()
      .single()

    if (error || !updatedTicket) {
      console.error('Failed to update ticket:', error)
      throw error || new Error('Failed to update ticket')
    }

    const updatedTicketTyped = updatedTicket as any

    // Log admin activity
    const { ipAddress, userAgent } = getRequestMetadata(request)
    await logAdminActivity({
      adminId: userId,
      actionType: status === 'resolved' || status === 'closed' ? 'ticket_resolve' : 'ticket_update',
      targetId: ticketId,
      targetType: 'ticket',
      details: {
        updates,
        ticketNumber: updatedTicketTyped.ticket_number,
        newStatus: status,
      },
      ipAddress,
      userAgent,
    })

    return NextResponse.json<ApiResponse>({
      success: true,
      data: updatedTicketTyped,
    })
  } catch (error) {
    console.error('Admin ticket update error:', error)
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Failed to update ticket' },
      { status: 500 }
    )
  }
}
