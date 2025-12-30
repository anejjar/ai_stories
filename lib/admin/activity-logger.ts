// Admin activity logger for audit trail

import { supabaseAdmin } from '@/lib/supabase/admin'

export type AdminActionType =
  | 'user_view'
  | 'user_edit'
  | 'subscription_change'
  | 'story_review'
  | 'story_delete'
  | 'report_review'

export interface LogActivityParams {
  adminId: string
  actionType: AdminActionType
  targetId?: string
  targetType?: string
  details?: Record<string, any>
  ipAddress?: string
  userAgent?: string
}

export interface AdminActivity {
  id: string
  admin_id: string
  action_type: AdminActionType
  target_id?: string
  target_type?: string
  details: Record<string, any>
  ip_address?: string
  user_agent?: string
  created_at: string
}

/**
 * Log admin activity for audit trail
 * This function never throws - logging failures are silently caught
 * to prevent admin actions from failing due to logging issues
 *
 * @param params - Activity log parameters
 *
 * @example
 * ```typescript
 * await logAdminActivity({
 *   adminId: userId,
 *   actionType: 'user_edit',
 *   targetId: editedUserId,
 *   targetType: 'user',
 *   details: { field: 'subscription_tier', oldValue: 'trial', newValue: 'pro' },
 *   ipAddress: '192.168.1.1',
 *   userAgent: 'Mozilla/5.0...'
 * })
 * ```
 */
export async function logAdminActivity({
  adminId,
  actionType,
  targetId,
  targetType,
  details = {},
  ipAddress,
  userAgent,
}: LogActivityParams): Promise<void> {
  try {
    const { error } = await supabaseAdmin.from('admin_activity_log').insert({
      admin_id: adminId,
      action_type: actionType,
      target_id: targetId,
      target_type: targetType,
      details,
      ip_address: ipAddress,
      user_agent: userAgent,
    })

    if (error) {
      console.error('Failed to log admin activity:', error)
    }
  } catch (error) {
    console.error('Failed to log admin activity:', error)
    // Don't throw - logging failure shouldn't break admin actions
  }
}

export interface GetActivityLogParams {
  adminId?: string
  actionType?: AdminActionType
  targetId?: string
  targetType?: string
  limit?: number
  offset?: number
}

/**
 * Get admin activity log with pagination and filtering
 *
 * @param params - Query parameters
 * @returns Activity logs with pagination info
 *
 * @example
 * ```typescript
 * const result = await getAdminActivityLog({
 *   actionType: 'user_edit',
 *   limit: 50,
 *   offset: 0
 * })
 * ```
 */
export async function getAdminActivityLog(params: GetActivityLogParams = {}) {
  const { adminId, actionType, targetId, targetType, limit = 50, offset = 0 } = params

  let query = supabaseAdmin
    .from('admin_activity_log')
    .select('*, admin:users!admin_id(email, display_name)', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (adminId) {
    query = query.eq('admin_id', adminId)
  }

  if (actionType) {
    query = query.eq('action_type', actionType)
  }

  if (targetId) {
    query = query.eq('target_id', targetId)
  }

  if (targetType) {
    query = query.eq('target_type', targetType)
  }

  const { data, error, count } = await query

  if (error) {
    console.error('Failed to fetch admin activity log:', error)
    throw error
  }

  return {
    data: data || [],
    pagination: {
      total: count || 0,
      limit,
      offset,
      hasMore: (count || 0) > offset + limit,
    },
  }
}

/**
 * Get recent admin activity for a specific admin
 *
 * @param adminId - Admin user ID
 * @param limit - Number of recent activities to fetch
 * @returns Recent activity logs
 */
export async function getRecentAdminActivity(adminId: string, limit: number = 10) {
  return getAdminActivityLog({
    adminId,
    limit,
    offset: 0,
  })
}

/**
 * Get activity statistics for an admin
 *
 * @param adminId - Admin user ID
 * @returns Activity statistics
 */
export async function getAdminActivityStats(adminId: string) {
  const { data, error } = await supabaseAdmin
    .from('admin_activity_log')
    .select('action_type')
    .eq('admin_id', adminId)

  if (error) {
    console.error('Failed to fetch admin activity stats:', error)
    return {
      total: 0,
      byType: {} as Record<AdminActionType, number>,
    }
  }

  const byType = (data || []).reduce((acc, log) => {
    const type = log.action_type as AdminActionType
    acc[type] = (acc[type] || 0) + 1
    return acc
  }, {} as Record<AdminActionType, number>)

  return {
    total: data?.length || 0,
    byType,
  }
}
