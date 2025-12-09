'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/use-auth'
import { toast } from '@/components/ui/toaster'
import {
  Sparkles,
  Moon,
  Smile,
  Plus,
  Minus,
  Loader2,
  Crown,
} from 'lucide-react'
import { UpgradeModal } from '@/components/modals/upgrade-modal'
import { ProMaxUpsell } from '@/components/pricing/promax-upsell'
import type { EnhancementType } from '@/app/api/stories/[id]/enhance/route'

interface StoryEnhancementProps {
  storyId: string
  onEnhanced?: (newContent: string) => void
}

export function StoryEnhancement({ storyId, onEnhanced }: StoryEnhancementProps) {
  const { userProfile, getAccessToken } = useAuth()
  const [loading, setLoading] = useState<EnhancementType | null>(null)
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)

  const isPro = userProfile?.subscriptionTier === 'pro' || userProfile?.subscriptionTier === 'pro_max'
  const isProMax = userProfile?.subscriptionTier === 'pro_max'
  const isProOnly = userProfile?.subscriptionTier === 'pro'

  const handleEnhance = async (type: EnhancementType) => {
    if (!isPro) {
      setShowUpgradeModal(true)
      return
    }

    setLoading(type)
    try {
      const token = await getAccessToken()
      if (!token) {
        throw new Error('Failed to get access token')
      }

      const response = await fetch(`/api/stories/${storyId}/enhance`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ type }),
      })

      const result = await response.json()

      if (!response.ok) {
        if (result.data?.requiresUpgrade) {
          setShowUpgradeModal(true)
          return
        }
        throw new Error(result.error || 'Failed to enhance story')
      }

      if (result.success && result.data?.content) {
        toast.success(
          `Story ${getEnhancementEmoji(type)} ${getEnhancementLabel(type)}!`,
          result.message || 'Your story has been enhanced!'
        )
        onEnhanced?.(result.data.content)
        // Refresh the page to show updated story
        setTimeout(() => {
          window.location.reload()
        }, 1000)
      }
    } catch (error) {
      console.error('Error enhancing story:', error)
      toast.error(
        'Failed to enhance story',
        error instanceof Error ? error.message : 'Please try again'
      )
    } finally {
      setLoading(null)
    }
  }

  const enhancements: Array<{
    type: EnhancementType
    label: string
    emoji: string
    icon: React.ReactNode
    description: string
    color: string
  }> = [
    {
      type: 'calmer',
      label: 'Make Calmer',
      emoji: '🌙',
      icon: <Moon className="h-5 w-5" />,
      description: 'Perfect for bedtime - peaceful and soothing',
      color: 'from-blue-500 to-indigo-500',
    },
    {
      type: 'funnier',
      label: 'Make Funnier',
      emoji: '😄',
      icon: <Smile className="h-5 w-5" />,
      description: 'Add more humor and playful moments',
      color: 'from-yellow-500 to-orange-500',
    },
    {
      type: 'extend',
      label: 'Extend Story',
      emoji: '➕',
      icon: <Plus className="h-5 w-5" />,
      description: 'Add more details and adventures',
      color: 'from-green-500 to-emerald-500',
    },
    {
      type: 'shorten',
      label: 'Shorten Story',
      emoji: '➖',
      icon: <Minus className="h-5 w-5" />,
      description: 'Make it more concise',
      color: 'from-purple-500 to-pink-500',
    },
  ]

  // Show ProMax upsell for Pro users instead of enhancement tools
  if (isProOnly) {
    return (
      <div className="mb-8">
        <ProMaxUpsell
          title="Want Illustrated Story Books?"
          description="Upgrade to PRO MAX to create beautiful illustrated story books with your child as the hero!"
          features={[
            "AI-illustrated story books",
            "5-7 custom illustrations per story",
            "Your child as the main hero",
            "Consistent character design",
            "Beautiful book page format",
            "Perfect for printing & sharing"
          ]}
          ctaText="Upgrade to PRO MAX"
          compact={false}
        />
      </div>
    )
  }

  return (
    <>
      <div className="bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 rounded-3xl border-4 border-purple-300 shadow-xl p-6 mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="text-4xl">✨</div>
          <div>
            <h3 className="text-2xl font-comic font-bold text-gray-800 mb-1">
              Enhance Your Story! 🎨
            </h3>
            <p className="text-sm text-gray-600 font-semibold">
              {isPro
                ? 'Make your story perfect with these magical tools!'
                : 'Upgrade to PRO to unlock story enhancement tools!'}
            </p>
          </div>
        </div>

        {!isPro && (
          <div className="mb-4 p-4 bg-yellow-100 border-2 border-yellow-300 rounded-2xl">
            <div className="flex items-center gap-2 mb-2">
              <Crown className="h-5 w-5 text-yellow-600" />
              <p className="font-bold text-gray-800">PRO Feature</p>
            </div>
            <p className="text-sm text-gray-700 font-semibold">
              Upgrade to PRO to unlock story enhancement tools!
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {enhancements.map((enhancement) => (
            <Button
              key={enhancement.type}
              onClick={() => handleEnhance(enhancement.type)}
              disabled={loading !== null || !isPro}
              className={`h-auto p-4 rounded-2xl border-4 border-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all bg-gradient-to-r ${enhancement.color} text-white font-bold text-left flex flex-col items-start gap-2 ${
                !isPro ? 'opacity-60' : ''
              }`}
            >
              <div className="flex items-center gap-3 w-full">
                {loading === enhancement.type ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <div className="text-2xl">{enhancement.emoji}</div>
                )}
                <div className="flex-1">
                  <div className="text-lg font-comic">{enhancement.label}</div>
                  <div className="text-xs opacity-90 font-normal">
                    {enhancement.description}
                  </div>
                </div>
              </div>
            </Button>
          ))}
        </div>
      </div>

      <UpgradeModal
        open={showUpgradeModal}
        onOpenChange={setShowUpgradeModal}
        tier="pro"
      />
    </>
  )
}

function getEnhancementLabel(type: EnhancementType): string {
  switch (type) {
    case 'calmer':
      return 'made calmer'
    case 'funnier':
      return 'made funnier'
    case 'extend':
      return 'extended'
    case 'shorten':
      return 'shortened'
  }
}

function getEnhancementEmoji(type: EnhancementType): string {
  switch (type) {
    case 'calmer':
      return '🌙'
    case 'funnier':
      return '😄'
    case 'extend':
      return '➕'
    case 'shorten':
      return '➖'
  }
}

