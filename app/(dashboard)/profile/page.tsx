'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { UpgradeModal } from '@/components/modals/upgrade-modal'
import { useAuth } from '@/hooks/use-auth'
import { useTrial } from '@/hooks/use-trial'
import { useStories } from '@/hooks/use-stories'
import { format } from 'date-fns'
import { Crown, Sparkles, User, BookOpen, TrendingUp } from 'lucide-react'
import { useState } from 'react'
import { SubscriptionToggle } from '@/components/test/subscription-toggle'
import { ChildProfileManager } from '@/components/child-profiles/child-profile-manager'

export default function ProfilePage() {
  const { userProfile } = useAuth()
  const { data: stories } = useStories()
  const { isTrialCompleted, storiesGenerated } = useTrial()
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const [upgradeTier, setUpgradeTier] = useState<'pro' | 'pro_max'>('pro')

  const getTierBadge = (tier: string) => {
    switch (tier) {
      case 'pro_max':
        return (
          <Badge className="bg-gradient-accent text-white font-bold rounded-full px-4 py-2 border-2 border-accent">
            <Crown className="h-4 w-4 mr-2" />
            PRO MAX 👑
          </Badge>
        )
      case 'pro':
        return (
          <Badge className="bg-gradient-primary text-white font-bold rounded-full px-4 py-2 border-2 border-primary">
            <Sparkles className="h-4 w-4 mr-2" />
            PRO ✨
          </Badge>
        )
      default:
        return (
          <Badge className="bg-muted text-white font-bold rounded-full px-4 py-2">
            Trial 🎁
          </Badge>
        )
    }
  }

  if (!userProfile) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-hero relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-20 right-10 text-5xl animate-float opacity-30">👤</div>
        <div className="absolute bottom-20 left-10 text-5xl animate-float opacity-30" style={{ animationDelay: '1s' }}>⭐</div>
        
        <div className="container mx-auto px-4 py-8 max-w-4xl relative z-10">
          <h1 className="text-5xl font-comic text-gradient-primary mb-8">
            👤 Your Profile
          </h1>

          {/* Testing Subscription Toggle - Only visible in development */}
          {process.env.NODE_ENV !== 'production' && (
            <div className="mb-6">
              <SubscriptionToggle />
            </div>
          )}

        <div className="grid gap-6 md:grid-cols-2">
          <Card className="border-4 border-primary/30 shadow-xl bg-white/95 backdrop-blur-sm rounded-3xl">
            <CardHeader className="bg-gradient-primary rounded-t-2xl border-b-4 border-primary/30">
              <CardTitle className="flex items-center gap-3 text-2xl font-comic">
                <User className="h-6 w-6 text-purple-600" />
                Account Information 👤
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <div className="bg-muted rounded-xl p-4 border-2 border-primary/30">
                <p className="text-sm text-gray-600 mb-1 font-semibold">📧 Email</p>
                <p className="font-bold text-gray-800">{userProfile.email}</p>
              </div>
              {userProfile.displayName && (
                <div className="bg-muted rounded-xl p-4 border-2 border-primary/30">
                  <p className="text-sm text-gray-600 mb-1 font-semibold">👋 Display Name</p>
                  <p className="font-bold text-gray-800">{userProfile.displayName}</p>
                </div>
              )}
              <div className="bg-muted rounded-xl p-4 border-2 border-primary/30">
                <p className="text-sm text-gray-600 mb-1 font-semibold">📅 Member Since</p>
                <p className="font-bold text-gray-800">
                  {format(userProfile.createdAt, 'MMMM d, yyyy')}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-4 border-accent shadow-xl bg-white/95 backdrop-blur-sm rounded-3xl">
            <CardHeader className="bg-gradient-secondary rounded-t-2xl border-b-4 border-accent">
              <CardTitle className="text-2xl font-comic">Subscription 💳</CardTitle>
              <CardDescription className="text-gray-700 font-semibold">Your current plan and status</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-xl p-4 border-2 border-primary/30">
                <p className="text-sm text-gray-600 mb-3 font-semibold">Current Tier</p>
                <div className="flex justify-center">{getTierBadge(userProfile.subscriptionTier)}</div>
              </div>
              {userProfile.subscriptionTier === 'trial' && (
                <div className="bg-gradient-to-r from-accent/10 to-secondary/10 border-4 border-accent rounded-2xl p-4">
                  <p className="text-sm text-gray-800 font-bold mb-3 text-center">
                    {isTrialCompleted
                      ? '🎉 Trial completed! Upgrade to unlock unlimited stories!'
                      : `✨ Free Trial: ${storiesGenerated}/1 stories created`}
                  </p>
                  <Button
                    onClick={() => {
                      setUpgradeTier('pro')
                      setShowUpgradeModal(true)
                    }}
                    className="w-full rounded-full bg-gradient-primary hover:from-pink-600 hover:to-purple-600 font-bold"
                  >
                    Upgrade to PRO! 🚀
                  </Button>
                </div>
              )}
              {userProfile.subscriptionTier === 'pro' && (
                <div className="bg-gradient-to-r from-accent/10 to-secondary/10 border-4 border-accent rounded-2xl p-4">
                  <p className="text-sm text-gray-800 font-bold mb-3 text-center">
                    👑 Unlock PRO MAX for magical illustrations!
                  </p>
                  <Button
                    onClick={() => {
                      setUpgradeTier('pro_max')
                      setShowUpgradeModal(true)
                    }}
                    className="w-full rounded-full bg-gradient-secondary hover:from-yellow-600 hover:to-orange-600 font-bold"
                  >
                    Upgrade to PRO MAX! 👑
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="md:col-span-2 border-4 border-primary/30 shadow-xl bg-white/95 backdrop-blur-sm rounded-3xl">
            <CardHeader className="bg-gradient-primary rounded-t-2xl border-b-4 border-primary/30">
              <CardTitle className="text-2xl font-comic flex items-center gap-2">
                <TrendingUp className="h-6 w-6 text-blue-600" />
                Usage Statistics 📊
              </CardTitle>
              <CardDescription className="text-gray-700 font-semibold">Your story creation activity</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-primary/20 to-accent/20 rounded-2xl p-6 border-4 border-primary/30 text-center shadow-lg">
                  <BookOpen className="h-8 w-8 text-pink-600 mx-auto mb-2" />
                  <p className="text-sm text-gray-600 mb-2 font-semibold">Stories Created</p>
                  <p className="text-4xl font-comic font-bold text-gradient-primary">
                    {stories?.length || 0}
                  </p>
                </div>
                <div className="bg-gradient-to-br from-primary/20 to-accent/20 rounded-2xl p-6 border-4 border-primary/30 text-center shadow-lg">
                  <Sparkles className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <p className="text-sm text-gray-600 mb-2 font-semibold">Account Type</p>
                  <div className="flex justify-center">
                    {getTierBadge(userProfile.subscriptionTier)}
                  </div>
                </div>
                <div className="bg-gradient-to-br from-primary/20 to-accent/20 rounded-2xl p-6 border-4 border-border text-center shadow-lg">
                  <TrendingUp className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <p className="text-sm text-gray-600 mb-2 font-semibold">Last Updated</p>
                  <p className="text-lg font-bold text-gray-800">
                    {format(userProfile.updatedAt, 'MMM d, yyyy')}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Child Profiles Section - PRO MAX Only */}
          <div className="md:col-span-2">
            <ChildProfileManager />
          </div>
        </div>
      </div>
      </div>
      <UpgradeModal
        open={showUpgradeModal}
        onOpenChange={setShowUpgradeModal}
        tier={upgradeTier}
      />
    </>
  )
}

