/**
 * TESTING ONLY - Subscription Tier Toggle Component
 * This component should be removed before production deployment
 * 
 * Allows developers to quickly switch between subscription tiers for testing
 */

'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/hooks/use-auth'
import { Loader2, Crown, Sparkles, Star, AlertTriangle } from 'lucide-react'
import type { SubscriptionTier } from '@/types'

export function SubscriptionToggle() {
  const { userProfile, refreshProfile, getAccessToken } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Only show in development
  if (process.env.NODE_ENV === 'production') {
    return null
  }

  const currentTier = userProfile?.subscriptionTier || 'trial'

  const handleUpdateTier = async (tier: SubscriptionTier) => {
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const token = await getAccessToken()
      if (!token) {
        throw new Error('Failed to get access token. Please log in again.')
      }

      const response = await fetch('/api/test/subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ tier }),
      })

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || 'Failed to update subscription tier')
      }

      setSuccess(`Successfully updated to ${tier.toUpperCase()}!`)
      await refreshProfile()
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update subscription tier')
    } finally {
      setLoading(false)
    }
  }

  const tiers: { tier: SubscriptionTier; label: string; icon: typeof Crown; color: string; description: string }[] = [
    {
      tier: 'trial',
      label: 'Trial',
      icon: Star,
      color: 'from-blue-400 to-cyan-400',
      description: '1 free story',
    },
    {
      tier: 'pro',
      label: 'PRO',
      icon: Sparkles,
      color: 'from-pink-400 to-purple-400',
      description: 'Unlimited stories, drafts, TTS',
    },
    {
      tier: 'pro_max',
      label: 'PRO MAX',
      icon: Crown,
      color: 'from-yellow-400 via-orange-400 to-pink-400',
      description: 'Everything + AI illustrations',
    },
  ]

  return (
    <Card className="border-4 border-red-300 bg-gradient-to-br from-red-50 to-orange-50">
      <CardHeader className="bg-gradient-to-r from-red-100 to-orange-100 border-b-4 border-red-200">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-red-600" />
          <CardTitle className="text-lg font-bold text-red-800">
            🧪 TESTING ONLY - Subscription Tier Switcher
          </CardTitle>
        </div>
        <p className="text-sm text-red-700 font-semibold mt-2">
          ⚠️ This component should be removed before production deployment!
        </p>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="space-y-4">
          {/* Current Tier Display */}
          <div className="p-4 bg-white rounded-xl border-2 border-gray-300">
            <p className="text-sm font-bold text-gray-600 mb-2">Current Tier:</p>
            <div className="flex items-center gap-2">
              {tiers.map((t) => {
                if (t.tier === currentTier) {
                  const Icon = t.icon
                  return (
                    <Badge
                      key={t.tier}
                      className={`bg-gradient-to-r ${t.color} text-white font-bold px-4 py-2 text-base border-2 border-white`}
                    >
                      <Icon className="h-4 w-4 mr-2" />
                      {t.label}
                    </Badge>
                  )
                }
                return null
              })}
            </div>
          </div>

          {/* Error/Success Messages */}
          {error && (
            <div className="p-3 bg-red-100 border-2 border-red-300 rounded-xl">
              <p className="text-sm font-bold text-red-700">❌ {error}</p>
            </div>
          )}
          {success && (
            <div className="p-3 bg-green-100 border-2 border-green-300 rounded-xl">
              <p className="text-sm font-bold text-green-700">✅ {success}</p>
            </div>
          )}

          {/* Tier Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {tiers.map(({ tier, label, icon: Icon, color, description }) => (
              <Button
                key={tier}
                onClick={() => handleUpdateTier(tier)}
                disabled={loading || currentTier === tier}
                className={`h-auto p-4 rounded-xl border-2 transition-all ${
                  currentTier === tier
                    ? `bg-gradient-to-r ${color} text-white border-white shadow-xl cursor-default`
                    : 'bg-white hover:bg-gray-50 border-gray-300 hover:border-gray-400'
                }`}
              >
                <div className="flex flex-col items-center gap-2 w-full">
                  {loading && currentTier === tier ? (
                    <Loader2 className="h-6 w-6 animate-spin" />
                  ) : (
                    <Icon className={`h-6 w-6 ${currentTier === tier ? 'text-white' : 'text-gray-600'}`} />
                  )}
                  <div className="text-center">
                    <div className={`font-bold text-base ${currentTier === tier ? 'text-white' : 'text-gray-800'}`}>
                      {label}
                    </div>
                    <div className={`text-xs mt-1 ${currentTier === tier ? 'text-white/90' : 'text-gray-600'}`}>
                      {description}
                    </div>
                  </div>
                  {currentTier === tier && (
                    <Badge className="bg-white/20 text-white text-xs font-bold px-2 py-1">
                      Active
                    </Badge>
                  )}
                </div>
              </Button>
            ))}
          </div>

          {/* Warning Footer */}
          <div className="p-3 bg-yellow-50 border-2 border-yellow-300 rounded-xl">
            <p className="text-xs text-yellow-800 font-semibold text-center">
              ⚠️ This is a testing tool. Changes are temporary and will not persist in production.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

