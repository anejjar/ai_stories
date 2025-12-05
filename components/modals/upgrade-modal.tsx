'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Check, Sparkles, Crown, Star, Zap, Heart, Shield, Infinity } from 'lucide-react'
import type { SubscriptionTier } from '@/types'
import { useAuth } from '@/hooks/use-auth'
import { toast } from '@/components/ui/toaster'

interface UpgradeModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  tier: 'pro' | 'pro_max'
}

const PRO_FEATURES = [
  { text: 'Unlimited text story generation', emoji: '📚', icon: Infinity },
  { text: 'Rewrite and enhance tools', emoji: '✨', icon: Zap },
  { text: '25+ story themes', emoji: '🎭', icon: Sparkles },
  { text: '10 story templates', emoji: '📋', icon: Star },
  { text: 'Ad-free experience', emoji: '🛡️', icon: Shield },
  { text: 'Unlimited story storage', emoji: '💾', icon: Heart },
]

const PRO_MAX_FEATURES = [
  { text: 'Everything in PRO', emoji: '⭐', icon: Crown, highlight: true },
  { text: 'AI-illustrated stories with your child', emoji: '🎨', icon: Sparkles },
  { text: 'High-resolution picture-book images', emoji: '🖼️', icon: Star },
  { text: 'Child appearance customization', emoji: '👤', icon: Heart },
  { text: 'Unlimited illustrated story generations', emoji: '🚀', icon: Zap },
  { text: 'PDF export for printing', emoji: '📄', icon: Crown },
  { text: 'Advanced themes & art styles', emoji: '🌟', icon: Sparkles },
]

export function UpgradeModal({ open, onOpenChange, tier }: UpgradeModalProps) {
  const router = useRouter()
  const { user, getAccessToken } = useAuth()
  const [loading, setLoading] = useState(false)

  const handleUpgrade = async () => {
    if (!user) {
      router.push('/login')
      return
    }

    setLoading(true)
    try {
      // Get Supabase access token
      const token = await getAccessToken()
      if (!token) {
        throw new Error('Failed to get access token')
      }

      // Call checkout API
      const response = await fetch('/api/payments/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ tier }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create checkout session')
      }

      if (result.data?.checkoutUrl) {
        // Redirect to Stripe Checkout
        window.location.href = result.data.checkoutUrl
      } else {
        throw new Error('No checkout URL received')
      }
    } catch (error) {
      console.error('Error initiating checkout:', error)
      toast.error(
        'Oops! Something went wrong',
        error instanceof Error ? error.message : 'Failed to start checkout. Please try again.'
      )
      setLoading(false)
    }
  }

  const features = tier === 'pro' ? PRO_FEATURES : PRO_MAX_FEATURES
  const price = tier === 'pro' ? '$9.99' : '$19.99'
  const title = tier === 'pro' ? 'Upgrade to PRO' : 'Upgrade to PRO MAX'
  const description =
    tier === 'pro'
      ? 'Unlock unlimited stories and powerful features'
      : 'Unlock magical illustrations and premium features'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px] max-h-[90vh] border-4 border-pink-300 rounded-2xl bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 shadow-2xl p-0">
        <div className="flex flex-col h-full max-h-[90vh] overflow-hidden relative">
        {/* Animated background decorations - reduced */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-2 right-2 text-2xl animate-sparkle opacity-40">✨</div>
          <div className="absolute top-2 left-2 text-2xl animate-sparkle opacity-40" style={{ animationDelay: '0.5s' }}>⭐</div>
        </div>
      
        {/* Compact Header */}
        <DialogHeader className="relative bg-gradient-to-r from-pink-100 via-purple-100 to-blue-100 rounded-t-2xl p-4 border-b-2 border-pink-300 flex-shrink-0">
          {/* Most Popular Badge for PRO MAX */}
          {tier === 'pro_max' && (
            <div className="flex justify-center mb-2">
              <Badge className="bg-gradient-to-r from-yellow-400 via-orange-500 to-pink-500 text-white font-bold rounded-full px-3 py-1 text-xs border-2 border-white shadow-xl">
                <Star className="h-3 w-3 mr-1 inline" />
                MOST POPULAR
              </Badge>
            </div>
          )}
          <div className="flex items-center gap-3">
            {tier === 'pro_max' ? (
              <div className="h-12 w-12 rounded-full bg-gradient-to-br from-yellow-400 via-orange-500 to-pink-500 flex items-center justify-center shadow-lg flex-shrink-0">
                <Crown className="h-6 w-6 text-white" />
              </div>
            ) : (
              <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg flex-shrink-0">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <DialogTitle className="text-2xl font-comic bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                {title} 🎉
              </DialogTitle>
              <DialogDescription className="text-sm text-gray-700 font-semibold mt-0.5">
                {description}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto px-4 py-4 relative z-10">
          {/* Compact Pricing */}
          <div className="text-center mb-4 bg-gradient-to-br from-white via-pink-50 to-purple-50 backdrop-blur-sm p-4 rounded-xl border-2 border-yellow-300 shadow-lg">
            <div className="flex items-baseline justify-center gap-1 mb-1">
              <span className="text-4xl font-bold font-comic bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                {price}
              </span>
              <span className="text-lg text-gray-500 font-semibold">/mo</span>
            </div>
            {tier === 'pro_max' && (
              <Badge className="bg-gradient-to-r from-green-400 to-emerald-500 text-white text-xs font-bold px-2 py-0.5 mt-1">
                Save 33% ✨
              </Badge>
            )}
            <div className="text-xs text-gray-600 font-semibold mt-1 flex items-center justify-center gap-1">
              <Shield className="h-3 w-3 text-green-500" />
              Cancel anytime
            </div>
          </div>

          {/* Compact Features List */}
          <div className="space-y-2 mb-4">
            {features.map((feature, index) => {
              const IconComponent = feature.icon || Check
              return (
                <div
                  key={index}
                  className={`flex items-center gap-2 bg-white/90 backdrop-blur-sm p-3 rounded-xl border-2 ${
                    feature.highlight
                      ? 'border-yellow-400 bg-gradient-to-r from-yellow-50 to-orange-50'
                      : 'border-pink-200'
                  }`}
                >
                  <div className={`h-7 w-7 rounded-full flex items-center justify-center flex-shrink-0 ${
                    feature.highlight
                      ? 'bg-gradient-to-br from-yellow-400 to-orange-500'
                      : 'bg-gradient-to-br from-green-400 to-emerald-500'
                  }`}>
                    <IconComponent className="h-4 w-4 text-white" />
                  </div>
                  <span className="text-xl flex-shrink-0">{feature.emoji}</span>
                  <span className={`text-sm font-semibold flex-1 ${
                    feature.highlight ? 'text-gray-900' : 'text-gray-800'
                  }`}>
                    {feature.text}
                  </span>
                </div>
              )
            })}
          </div>

          {/* Compact Social Proof */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-2 border-2 border-blue-200 mb-2">
            <div className="flex items-center justify-center gap-2 text-xs text-gray-700 font-semibold">
              <span className="text-lg">😊</span>
              <span>Join <span className="font-bold text-purple-600">1,000+</span> happy families!</span>
            </div>
          </div>
        </div>

        {/* Fixed Footer */}
        <DialogFooter className="flex !flex-col gap-2 pt-3 pb-4 px-4 border-t-2 border-pink-200 from-pink-50 to-purple-50 flex-shrink-0">
          {/* Main CTA Button */}
          <Button
            onClick={handleUpgrade}
            disabled={loading}
            className={`w-full rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all font-bold text-lg py-4 relative overflow-hidden ${
              tier === 'pro_max'
                ? 'bg-gradient-to-r from-yellow-500 via-orange-500 to-pink-500 hover:from-yellow-600 hover:via-orange-600 hover:to-pink-600'
                : 'bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600'
            }`}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
            <div className="relative z-10 flex flex-col items-center gap-1">
              <span className="flex items-center justify-center gap-2">
                {loading ? (
                  <>
                    <span className="animate-spin text-xl">⏳</span>
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    {tier === 'pro_max' ? (
                      <>
                        <Crown className="h-5 w-5" />
                        <span>Get PRO MAX Now! 👑</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-5 w-5" />
                        <span>Get PRO Now! ✨</span>
                      </>
                    )}
                  </>
                )}
              </span>
            </div>
          </Button>
          {/* Trust indicators inside button */}
          <div className="flex items-center justify-center gap-3 text-xs font-semibold opacity-90">
            <div className="flex items-center gap-1">
              <Shield className="h-3 w-3 text-green-500" />
              <span>Secure</span>
            </div>
            <span>•</span>
            <div className="flex items-center gap-1">
              <Heart className="h-3 w-3 text-red-500" />
              <span>Cancel Anytime</span>
            </div>
          </div>
        </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  )
}

