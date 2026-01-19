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
import { Check, Sparkles, Crown, Star, Zap, Heart, Shield, Infinity, Users, Loader2 } from 'lucide-react'
import type { SubscriptionTier } from '@/types'
import { useAuth } from '@/hooks/use-auth'
import { toast } from '@/components/ui/toaster'

interface UpgradeModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  tier: 'pro' | 'family'
}

interface Feature {
  text: string
  emoji: string
  icon: any // LucideIcon
  highlight?: boolean
}

const PRO_FEATURES: Feature[] = [
  { text: 'Unlimited text story generation', emoji: '📚', icon: Infinity },
  { text: 'Rewrite and enhance tools', emoji: '✨', icon: Zap },
  { text: '25+ story themes', emoji: '🎭', icon: Sparkles },
  { text: '10 story templates', emoji: '📋', icon: Star },
  { text: 'Ad-free experience', emoji: '🛡️', icon: Shield },
  { text: 'Unlimited story storage', emoji: '💾', icon: Heart },
]

const FAMILY_PLAN_FEATURES: Feature[] = [
  { text: 'Everything in PRO', emoji: '⭐', icon: Crown, highlight: true },
  { text: 'Up to 3 Child Profiles', emoji: '👨‍👩‍👧‍👦', icon: Users },
  { text: '2 AI-illustrated stories per day', emoji: '🎨', icon: Sparkles },
  { text: '10 text stories per day', emoji: '📚', icon: Infinity },
  { text: 'High-resolution picture-book images', emoji: '🖼️', icon: Star },
  { text: 'Child appearance customization', emoji: '👤', icon: Heart },
  { text: 'PDF export for printing', emoji: '📄', icon: Crown },
  { text: 'Advanced themes & art styles', emoji: '🌟', icon: Sparkles },
]

export function UpgradeModal({ open, onOpenChange, tier }: UpgradeModalProps) {
  const router = useRouter()
  const { user, getAccessToken, loading: authLoading } = useAuth()
  const [loading, setLoading] = useState(false)

  const handleUpgrade = async () => {
    if (authLoading) {
      return // Wait for auth to load
    }

    if (!user) {
      router.push('/login')
      return
    }

    setLoading(true)
    try {
      const token = await getAccessToken()
      if (!token) {
        throw new Error('Failed to get access token - please try logging in again')
      }

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

  const features = tier === 'pro' ? PRO_FEATURES : FAMILY_PLAN_FEATURES
  const price = tier === 'pro' ? '$9.99' : '$24.99'
  const title = tier === 'pro' ? 'Get Pro Access' : 'Join Family Plan'
  const subtitle = tier === 'pro' ? 'PRO' : 'FAMILY'
  const description =
    tier === 'pro'
      ? 'Unlimited text stories and powerful editing tools for your child.'
      : 'Our most magical plan with AI illustrations, PDF exports, and more.'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden border-0 bg-transparent shadow-none ring-0 focus:ring-0 focus-visible:ring-0 max-h-[95vh]">
        <div className="bg-white rounded-[4rem] border-8 border-gray-50 shadow-2xl overflow-hidden relative flex flex-col max-h-[95vh]">
          {/* Top Decorative Header - Fixed at top */}
          <div className={`h-32 w-full shrink-0 relative overflow-hidden ${
            tier === 'family' ? 'bg-playwize-orange' : 'bg-playwize-purple'
          }`}>
            <div className="absolute inset-0 playwize-bg opacity-20" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-white text-center space-y-1">
                <div className="flex items-center justify-center gap-2 mb-1">
                  {tier === 'family' ? (
                    <Crown className="h-6 w-6 text-white animate-bounce-slow" />
                  ) : (
                    <Sparkles className="h-6 w-6 text-white animate-pulse" />
                  )}
                  <span className="text-xs font-black uppercase tracking-[0.3em] opacity-90">
                    {subtitle} PLAN
                  </span>
                </div>
                <DialogTitle className="text-3xl font-black tracking-tight">{title}</DialogTitle>
              </div>
            </div>

            {/* Hidden description for accessibility */}
            <DialogDescription className="sr-only">
              {description}
            </DialogDescription>

            {/* Floating Elements */}
            <div className="absolute top-4 right-4 animate-float-gentle opacity-50">✨</div>
            <div className="absolute bottom-4 left-6 animate-bounce-slow opacity-30">⭐</div>
          </div>

          {/* Scrollable Content Area */}
          <div className="overflow-y-auto flex-1 custom-scrollbar">
            <div className="p-8 md:p-10 space-y-8">
              {/* Value Proposition */}
              <div className="text-center space-y-4">
                <p className="text-gray-500 font-bold text-lg leading-relaxed px-4">
                  {description}
                </p>

                <div className="flex items-center justify-center gap-3">
                  <div className="bg-gray-50 px-6 py-3 rounded-full border-2 border-gray-100 shadow-sm flex items-baseline gap-1">
                    <span className="text-4xl font-black text-gray-900">{price}</span>
                    <span className="text-sm font-black text-gray-400 uppercase tracking-widest">/month</span>
                  </div>
                  {tier === 'family' && (
                    <Badge className="bg-green-100 text-green-600 border-2 border-green-200 rounded-full px-4 py-1.5 font-black text-[10px] tracking-widest uppercase">
                      Best Value
                    </Badge>
                  )}
                </div>
              </div>

              {/* Features Grid */}
              <div className="grid gap-3">
                {features.map((feature, index) => {
                  const IconComponent = feature.icon || Check
                  return (
                    <div
                      key={index}
                      className={`flex items-center gap-4 p-4 rounded-[2rem] transition-all border-2 ${
                        feature.highlight
                          ? 'bg-purple-50 border-purple-100'
                          : 'bg-gray-50/50 border-white'
                      }`}
                    >
                      <div className={`h-10 w-10 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${
                        feature.highlight
                          ? 'bg-playwize-purple text-white'
                          : 'bg-white text-playwize-purple'
                      }`}>
                        <IconComponent className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <p className={`font-bold leading-tight ${
                          feature.highlight ? 'text-playwize-purple' : 'text-gray-700'
                        }`}>
                          {feature.text}
                        </p>
                      </div>
                      <span className="text-2xl opacity-80">{feature.emoji}</span>
                    </div>
                  )
                })}
              </div>

              {/* Trust Badges */}
              <div className="flex items-center justify-center gap-6 py-2 border-y-2 border-gray-50">
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.15em] text-gray-400">
                  <Shield className="h-3 w-3 text-green-500" />
                  Secure Checkout
                </div>
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.15em] text-gray-400">
                  <Heart className="h-3 w-3 text-red-400" />
                  Cancel Anytime
                </div>
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.15em] text-gray-400">
                  <Users className="h-3 w-3 text-blue-400" />
                  1000+ Happy Parents
                </div>
              </div>
            </div>
          </div>

          {/* Footer Actions - Fixed at bottom */}
          <div className="p-8 md:p-10 pt-4 bg-white border-t-2 border-gray-50 shrink-0">
            <Button
              onClick={handleUpgrade}
              disabled={loading || authLoading}
              className={`w-full h-16 rounded-full text-xl font-black shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98] ${
                tier === 'family'
                  ? 'bg-playwize-orange hover:bg-orange-600 text-white shadow-orange-100'
                  : 'bg-playwize-purple hover:bg-purple-700 text-white shadow-purple-100'
              }`}
            >
              {loading ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                <>
                  {tier === 'family' ? (
                    <span className="flex items-center gap-3">
                      Start Family Adventure <Crown className="h-6 w-6" />
                    </span>
                  ) : (
                    <span className="flex items-center gap-3">
                      Go Pro Now <Sparkles className="h-6 w-6" />
                    </span>
                  )}
                </>
              )}
            </Button>
            <p className="text-center mt-6 text-xs font-bold text-gray-400">
              By upgrading, you agree to our Terms and Conditions.
              <br />
              Secure payment processed by Lemon Squeezy.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

