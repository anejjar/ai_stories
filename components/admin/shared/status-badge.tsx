import { Badge } from '@/components/ui/badge'
import type { SubscriptionTier } from '@/types'
import type { StoryReportStatus } from '@/types/admin'

interface StatusBadgeProps {
  status: string
  type: 'subscription' | 'report' | 'visibility'
}

export function StatusBadge({ status, type }: StatusBadgeProps) {
  if (type === 'subscription') {
    const tier = status as SubscriptionTier
    const colors = {
      trial: 'bg-gray-100 text-gray-800 border-gray-300',
      pro: 'bg-blue-100 text-blue-800 border-blue-300',
      family: 'bg-purple-100 text-purple-800 border-purple-300',
    }
    return (
      <Badge variant="outline" className={colors[tier]}>
        {tier.charAt(0).toUpperCase() + tier.slice(1)}
      </Badge>
    )
  }

  if (type === 'report') {
    const reportStatus = status as StoryReportStatus
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      reviewed: 'bg-blue-100 text-blue-800 border-blue-300',
      resolved: 'bg-green-100 text-green-800 border-green-300',
      dismissed: 'bg-gray-100 text-gray-800 border-gray-300',
    }
    return (
      <Badge variant="outline" className={colors[reportStatus]}>
        {reportStatus.charAt(0).toUpperCase() + reportStatus.slice(1)}
      </Badge>
    )
  }

  if (type === 'visibility') {
    const colors = {
      public: 'bg-green-100 text-green-800 border-green-300',
      private: 'bg-gray-100 text-gray-800 border-gray-300',
    }
    return (
      <Badge variant="outline" className={colors[status as 'public' | 'private']}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    )
  }

  return <Badge variant="outline" className="bg-gray-100 text-gray-800 border-gray-300">{status}</Badge>
}
