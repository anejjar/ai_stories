'use client'

import { StoryCard } from '@/components/stories/story-card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { UpgradeModal } from '@/components/modals/upgrade-modal'
import { SeedButton } from '@/components/admin/seed-button'
import { useStories } from '@/hooks/use-stories'
import { useAuth } from '@/hooks/use-auth'
import { useTrial } from '@/hooks/use-trial'
import Link from 'next/link'
import { Plus, BookOpen, Loader2, Crown, Sparkles } from 'lucide-react'
import { useState } from 'react'

export default function LibraryPage() {
  const { data: stories, isLoading, error } = useStories()
  const { userProfile } = useAuth()
  const { isTrialCompleted, storiesGenerated } = useTrial()
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)

  const isProMax = userProfile?.subscriptionTier === 'pro_max'
  const isPro = userProfile?.subscriptionTier === 'pro'
  const showProMaxUpsell = !isProMax

  return (
    <>
      <div className="min-h-screen bg-gradient-hero relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-20 left-10 text-5xl animate-float opacity-30">📚</div>
        <div className="absolute top-40 right-20 text-5xl animate-float opacity-30" style={{ animationDelay: '1s' }}>⭐</div>
        <div className="absolute bottom-20 left-1/4 text-4xl animate-bounce-slow opacity-20">🎨</div>

        <div className="container mx-auto px-4 py-8 relative z-10">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-5xl font-comic text-gradient-primary mb-2">
                📖 Story Library
              </h1>
              <p className="text-lg text-foreground font-semibold">
                All your magical stories in one place! ✨
              </p>
              {userProfile?.subscriptionTier === 'trial' && (
                <div className="mt-2 flex items-center gap-2">
                  <Badge className="bg-gradient-primary text-primary-foreground font-bold rounded-full px-3 py-1">
                    <Sparkles className="h-3 w-3 mr-1" />
                    Trial: {storiesGenerated}/1 stories
                  </Badge>
                  {isTrialCompleted && (
                    <Badge className="bg-gradient-accent text-accent-foreground font-bold rounded-full px-3 py-1 animate-pulse">
                      ⭐ Upgrade to unlock unlimited stories!
                    </Badge>
                  )}
                </div>
              )}
            </div>
            <div className="flex items-center gap-3">
              <SeedButton />
              <Link href="/create">
                <Button className="rounded-full bg-gradient-primary hover:opacity-90 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all font-bold text-lg px-6 py-6">
                  <Plus className="h-5 w-5 mr-2" />
                  Create Story 🎉
                </Button>
              </Link>
            </div>
          </div>

          {/* Soft Upsell: PRO MAX Library Card */}
          {showProMaxUpsell && stories && stories.length > 0 && (
            <div className="mb-8 bg-gradient-accent rounded-3xl border-4 border-accent p-6 shadow-xl relative overflow-hidden">
              <div className="absolute top-4 right-4 text-5xl opacity-20 animate-float">👑</div>
              <div className="absolute bottom-4 left-4 text-4xl opacity-20 animate-float" style={{ animationDelay: '1s' }}>⭐</div>
              <div className="relative z-10 flex items-center gap-6">
                <div className="text-6xl">🎨</div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-2xl font-comic text-gradient-accent font-bold">
                      Turn Your Stories Into Picture Books!
                    </h2>
                    <Badge className="bg-gradient-secondary text-secondary-foreground font-bold border-2 border-accent rounded-full px-3 py-1">
                      PRO MAX 👑
                    </Badge>
                  </div>
                  <p className="text-foreground font-semibold mb-4">
                    Unlock magical AI-generated illustrations featuring your child in every story! 🚀
                  </p>
                  <Button
                    onClick={() => setShowUpgradeModal(true)}
                    className="rounded-full bg-gradient-secondary hover:opacity-90 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all font-bold"
                  >
                    <Crown className="h-5 w-5 mr-2" />
                    Upgrade to PRO MAX! ✨
                  </Button>
                </div>
              </div>
            </div>
          )}

          {isLoading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-card backdrop-blur-sm rounded-3xl border-4 border-border p-6 space-y-4">
                  <Skeleton className="h-8 w-3/4 rounded-xl" />
                  <Skeleton className="h-4 w-1/2 rounded-xl" />
                  <Skeleton className="h-32 w-full rounded-xl" />
                  <div className="flex gap-2">
                    <Skeleton className="h-6 w-16 rounded-full" />
                    <Skeleton className="h-6 w-16 rounded-full" />
                    <Skeleton className="h-6 w-16 rounded-full" />
                  </div>
                  <Skeleton className="h-12 w-full rounded-full" />
                </div>
              ))}
            </div>
          )}

          {error && (
            <div className="p-5 text-base text-red-700 bg-red-100 border-2 border-red-300 rounded-2xl font-bold">
              ⚠️ Failed to load stories. Please try again!
            </div>
          )}

          {!isLoading && !error && stories && stories.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-center bg-card backdrop-blur-sm rounded-3xl border-4 border-primary shadow-xl">
              <div className="h-32 w-32 rounded-full bg-gradient-primary flex items-center justify-center mb-6 shadow-lg animate-bounce-slow">
                <BookOpen className="h-16 w-16 text-white" />
              </div>
              <h2 className="text-3xl font-comic text-gradient-primary mb-3">
                No stories yet! 📖
              </h2>
              <p className="text-lg text-foreground mb-8 max-w-md font-semibold">
                Create your first personalized story for your child. It only takes a few minutes! ⚡
              </p>
              <Link href="/create">
                <Button size="lg" className="rounded-full bg-gradient-primary hover:opacity-90 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all font-bold text-lg px-8 py-6">
                  <Plus className="h-5 w-5 mr-2" />
                  Create Your First Story! 🎉
                </Button>
              </Link>
            </div>
          )}

          {!isLoading && !error && stories && stories.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {stories.map((story) => (
                <StoryCard key={story.id} story={story} />
              ))}
            </div>
          )}
        </div>
      </div>
      <UpgradeModal
        open={showUpgradeModal}
        onOpenChange={setShowUpgradeModal}
        tier="pro_max"
      />
    </>
  )
}
