'use client'

import { useState } from 'react'
import React from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'
import type { AdminActivity } from '@/types/admin'

interface ActivityLogTableProps {
  activities: AdminActivity[]
}

export function ActivityLogTable({ activities }: ActivityLogTableProps) {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())

  function toggleRow(id: string) {
    setExpandedRows((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  function formatActionType(actionType: string) {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/8e0a82ed-4c15-490d-b8c3-a1f6373be7bf',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'activity-log-table.tsx:26',message:'formatActionType called',data:{actionType,isUndefined:actionType===undefined,isNull:actionType===null,type:typeof actionType},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
    if (!actionType || typeof actionType !== 'string') {
      return 'Unknown Action'
    }
    return actionType
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="w-8"></th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Timestamp
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Admin
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Action
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Target
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              IP Address
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {activities.map((activity) => {
            const isExpanded = expandedRows.has(activity.id)

            // #region agent log
            fetch('http://127.0.0.1:7242/ingest/8e0a82ed-4c15-490d-b8c3-a1f6373be7bf',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'activity-log-table.tsx:57',message:'Activity object structure',data:{activityId:activity.id,hasActionType:!!activity.actionType,hasAction_type:!!(activity as any).action_type,actionTypeValue:activity.actionType,action_typeValue:(activity as any).action_type,allKeys:Object.keys(activity),activityObj:activity},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
            // #endregion

            return (
              <React.Fragment key={activity.id}>
                <tr className="hover:bg-gray-50">
                  <td className="px-2 py-4">
                    <button
                      onClick={() => toggleRow(activity.id)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      {isExpanded ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(activity.createdAt).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {activity.admin?.email || 'Unknown'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full border ${
                      (activity.actionType || (activity as any).action_type || '').includes('delete')
                        ? 'bg-red-100 text-red-800 border-red-300'
                        : (activity.actionType || (activity as any).action_type || '').includes('edit') || (activity.actionType || (activity as any).action_type || '').includes('change')
                        ? 'bg-blue-100 text-blue-800 border-blue-300'
                        : (activity.actionType || (activity as any).action_type || '').includes('review')
                        ? 'bg-yellow-100 text-yellow-800 border-yellow-300'
                        : 'bg-gray-100 text-gray-800 border-gray-300'
                    }`}>
                      {formatActionType(activity.actionType || (activity as any).action_type || 'unknown')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {activity.targetType || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                    {activity.ipAddress || '-'}
                  </td>
                </tr>
                {isExpanded && (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 bg-gray-50">
                      <div className="text-sm">
                        <p className="font-semibold mb-2">Details:</p>
                        <pre className="bg-white p-3 rounded border text-xs overflow-x-auto">
                          {JSON.stringify(activity.details, null, 2)}
                        </pre>
                        {activity.userAgent && (
                          <p className="mt-2 text-xs text-gray-600">
                            User Agent: {activity.userAgent}
                          </p>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            )
          })}
        </tbody>
      </table>

      {activities.length === 0 && (
        <div className="text-center py-12 text-gray-500">No activity logs found</div>
      )}
    </div>
  )
}
