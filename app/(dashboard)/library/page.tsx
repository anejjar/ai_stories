'use client'

import { StoryCard } from '@/components/stories/story-card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { UpgradeModal } from '@/components/modals/upgrade-modal'
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

  const isFamily = userProfile?.subscriptionTier === 'family'
  const isPro = userProfile?.subscriptionTier === 'pro'
  const showFamilyUpsell = !isFamily

  return (
    <>
      <div className="py-12 px-4 max-w-7xl mx-auto space-y-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-100 text-playwize-purple text-sm font-bold border border-purple-200">
              <BookOpen className="h-4 w-4" />
              <span>Personal Collection</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-black text-gray-900 tracking-tight">
              Story <span className="text-playwize-purple">Library</span>
            </h1>
            <p className="text-gray-600 text-lg font-medium">
              All your magical stories in one place! ✨
            </p>
            {userProfile?.subscriptionTier === 'trial' && (
              <div className="mt-4 flex flex-wrap gap-2">
                <Badge className="bg-playwize-purple text-white font-black rounded-full px-4 py-1.5 border-0">
                  <Sparkles className="h-3 w-3 mr-2" />
                  TRIAL: {storiesGenerated}/1 STORIES
                </Badge>
                {isTrialCompleted && (
                  <Badge className="bg-playwize-orange text-white font-black rounded-full px-4 py-1.5 border-0 animate-pulse">
                    ⭐ UPGRADE TO UNLOCK UNLIMITED!
                  </Badge>
                )}
              </div>
            )}
          </div>
          <div className="flex items-center gap-4">
            <Link href="/create">
              <Button className="h-14 px-8 rounded-full bg-playwize-purple hover:bg-purple-700 text-white font-black text-lg shadow-lg shadow-purple-200 transition-all hover:scale-105 active:scale-95">
                <Plus className="h-6 w-6 mr-2" />
                Create Story 🎉
              </Button>
            </Link>
          </div>
        </div>

        {/* Soft Upsell: FAMILY PLAN Library Card */}
        {showFamilyUpsell && stories && stories.length > 0 && (
          <div className="bg-playwize-orange rounded-[3rem] p-8 md:p-12 text-white relative overflow-hidden shadow-2xl group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl" />
            <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
              <div className="h-32 w-32 md:h-40 md:w-40 rounded-[2.5rem] bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-7xl rotate-3 group-hover:rotate-0 transition-transform">
                🎨
              </div>
              <div className="flex-1 text-center md:text-left space-y-4">
                <div className="flex flex-col md:flex-row items-center gap-4 mb-2">
                  <h2 className="text-3xl md:text-4xl font-black leading-tight">
                    Turn Your Stories Into Picture Books!
                  </h2>
                  <Badge className="bg-white text-playwize-orange font-black px-4 py-1.5 rounded-full border-0 shrink-0">
                    FAMILY PLAN 👑
                  </Badge>
                </div>
                <p className="text-white/90 text-lg font-bold max-w-2xl">
                  Unlock magical AI-generated illustrations and bring your stories to life with vivid, high-resolution imagery. 🚀
                </p>
                <Button
                  onClick={() => setShowUpgradeModal(true)}
                  className="h-14 px-10 rounded-full bg-white text-playwize-orange hover:bg-gray-100 font-black text-lg transition-all hover:scale-105"
                >
                  <Crown className="h-5 w-5 mr-2" />
                  Upgrade to FAMILY PLAN! ✨
                </Button>
              </div>
            </div>
          </div>
        )}

        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-[3rem] border-4 border-gray-100 p-10 space-y-6 shadow-sm">
                <Skeleton className="h-8 w-3/4 rounded-2xl" />
                <Skeleton className="h-4 w-1/2 rounded-full" />
                <Skeleton className="h-48 w-full rounded-[2rem]" />
                <Skeleton className="h-14 w-full rounded-full" />
              </div>
            ))}
          </div>
        )}

        {error && (
          <div className="p-10 text-center bg-red-50 border-4 border-dashed border-red-200 rounded-[3rem]">
            <p className="text-red-600 font-black text-xl uppercase tracking-widest mb-2">Oops! Something went wrong</p>
            <p className="text-red-400 font-bold italic">Failed to load your stories. Please refresh and try again!</p>
          </div>
        )}

        {!isLoading && !error && stories && stories.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center bg-white rounded-[4rem] border-4 border-dashed border-gray-100 space-y-10">
            <div className="h-40 w-40 rounded-[3rem] bg-purple-50 flex items-center justify-center shadow-inner animate-float-gentle">
              <BookOpen className="h-20 w-20 text-playwize-purple opacity-40" />
            </div>
            <div className="space-y-4">
              <h2 className="text-4xl font-black text-gray-900">Your library is empty! 📖</h2>
              <p className="text-xl text-gray-500 font-bold max-w-md mx-auto">
                Start your journey by creating your first personalized story for your child. It only takes seconds! ⚡
              </p>
            </div>
            <Link href="/create">
              <Button size="lg" className="h-16 px-12 rounded-full bg-playwize-purple hover:bg-purple-700 text-white font-black text-xl shadow-xl shadow-purple-100 transition-all hover:scale-105 active:scale-95">
                <Plus className="h-8 w-8 mr-2" />
                Create Your First Story! 🎉
              </Button>
            </Link>
          </div>
        )}

        {!isLoading && !error && stories && stories.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-12">
            {stories.map((story) => (
              <StoryCard key={story.id} story={story} />
            ))}
          </div>
        )}
      </div>
      <UpgradeModal
        open={showUpgradeModal}
        onOpenChange={setShowUpgradeModal}
        tier="pro_max"
      />
    </>
  )
}
