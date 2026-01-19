import { Card } from '@/components/ui/card'
import { LucideIcon } from 'lucide-react'

interface StatsCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon: LucideIcon
  trend?: {
    value: number
    isPositive: boolean
  }
  alert?: boolean
}

export function StatsCard({ title, value, subtitle, icon: Icon, trend, alert }: StatsCardProps) {
  // Determine icon color based on title
  const getIconColor = () => {
    if (alert) return 'bg-yellow-100 text-yellow-700'
    if (title.toLowerCase().includes('user')) return 'bg-blue-100 text-blue-700'
    if (title.toLowerCase().includes('story')) return 'bg-purple-100 text-purple-700'
    if (title.toLowerCase().includes('report')) return 'bg-yellow-100 text-yellow-700'
    if (title.toLowerCase().includes('revenue') || title.toLowerCase().includes('dollar')) return 'bg-green-100 text-green-700'
    return 'bg-gray-100 text-gray-700'
  }

  return (
    <Card className={`p-6 ${alert ? 'border-yellow-300 bg-yellow-50' : ''}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold mt-2 text-gray-900">{value}</p>
          {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
          {trend && (
            <p className={`text-sm mt-2 ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
              {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}% from last week
            </p>
          )}
        </div>
        <div className={`p-3 rounded-lg ${getIconColor()}`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </Card>
  )
}
