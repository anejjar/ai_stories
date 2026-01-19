'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { StatusBadge } from '@/components/admin/shared/status-badge'
import type { SubscriptionTier } from '@/types'
import { toast } from 'sonner'

interface SubscriptionManagerProps {
  userId: string
  currentTier: SubscriptionTier
  onUpdate: () => void
}

export function SubscriptionManager({
  userId,
  currentTier,
  onUpdate,
}: SubscriptionManagerProps) {
  const [updating, setUpdating] = useState(false)

  async function updateSubscription(newTier: SubscriptionTier) {
    if (newTier === currentTier) {
      toast.info('User already has this subscription tier')
      return
    }

    if (!confirm(`Change subscription from ${currentTier} to ${newTier}?`)) {
      return
    }

    try {
      setUpdating(true)
      const res = await fetch(`/api/admin/users/${userId}/subscription`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscriptionTier: newTier }),
      })

      const data = await res.json()

      if (data.success) {
        toast.success(`Subscription updated to ${newTier}`)
        onUpdate()
      } else {
        toast.error(data.error || 'Failed to update subscription')
      }
    } catch (error) {
      console.error('Error updating subscription:', error)
      toast.error('Failed to update subscription')
    } finally {
      setUpdating(false)
    }
  }

  const tiers: SubscriptionTier[] = ['trial', 'pro', 'family']

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200">
      <h2 className="text-lg font-semibold mb-4">Subscription Management</h2>

      <div className="mb-4">
        <p className="text-sm text-gray-600 mb-2">Current Tier:</p>
        <StatusBadge status={currentTier} type="subscription" />
      </div>

      <div className="space-y-2">
        <p className="text-sm text-gray-600 mb-2">Change to:</p>
        <div className="flex gap-2">
          {tiers.map((tier) => {
            const tierColors = {
              trial: 'border-gray-300 text-gray-700 hover:bg-gray-50',
              pro: 'border-blue-300 text-blue-700 hover:bg-blue-50',
              family: 'border-purple-300 text-purple-700 hover:bg-purple-50',
            }
            return (
              <Button
                key={tier}
                onClick={() => updateSubscription(tier)}
                disabled={updating || tier === currentTier}
                variant="outline"
                size="sm"
                className={tier === currentTier 
                  ? `${tierColors[tier]} bg-opacity-20` 
                  : tierColors[tier]}
              >
                {tier.charAt(0).toUpperCase() + tier.slice(1)}
              </Button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
