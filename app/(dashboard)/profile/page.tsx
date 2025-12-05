'use client'

import { ProtectedRoute } from '@/components/auth/protected-route'
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
          <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-bold rounded-full px-4 py-2 border-2 border-yellow-500">
            <Crown className="h-4 w-4 mr-2" />
            PRO MAX 👑
          </Badge>
        )
      case 'pro':
        return (
          <Badge className="bg-gradient-to-r from-blue-400 to-purple-500 text-white font-bold rounded-full px-4 py-2 border-2 border-blue-500">
            <Sparkles className="h-4 w-4 mr-2" />
            PRO ✨
          </Badge>
        )
      default:
        return (
          <Badge className="bg-gradient-to-r from-gray-400 to-gray-500 text-white font-bold rounded-full px-4 py-2">
            Trial 🎁
          </Badge>
        )
    }
  }

  if (!userProfile) {
    return (
      <ProtectedRoute>
        <div className="container mx-auto px-4 py-8">
          <p>Loading profile...</p>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-yellow-50 to-blue-50 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-20 right-10 text-5xl animate-float opacity-30">👤</div>
        <div className="absolute bottom-20 left-10 text-5xl animate-float opacity-30" style={{ animationDelay: '1s' }}>⭐</div>
        
        <div className="container mx-auto px-4 py-8 max-w-4xl relative z-10">
          <h1 className="text-5xl font-comic bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent mb-8">
            👤 Your Profile
          </h1>

          {/* Testing Subscription Toggle - Only visible in development */}
          {process.env.NODE_ENV !== 'production' && (
            <div className="mb-6">
              <SubscriptionToggle />
            </div>
          )}

        <div className="grid gap-6 md:grid-cols-2">
          <Card className="border-4 border-pink-300 shadow-xl bg-white/95 backdrop-blur-sm rounded-3xl">
            <CardHeader className="bg-gradient-to-r from-pink-100 to-purple-100 rounded-t-2xl border-b-4 border-pink-200">
              <CardTitle className="flex items-center gap-3 text-2xl font-comic">
                <User className="h-6 w-6 text-purple-600" />
                Account Information 👤
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <div className="bg-pink-50 rounded-xl p-4 border-2 border-pink-200">
                <p className="text-sm text-gray-600 mb-1 font-semibold">📧 Email</p>
                <p className="font-bold text-gray-800">{userProfile.email}</p>
              </div>
              {userProfile.displayName && (
                <div className="bg-purple-50 rounded-xl p-4 border-2 border-purple-200">
                  <p className="text-sm text-gray-600 mb-1 font-semibold">👋 Display Name</p>
                  <p className="font-bold text-gray-800">{userProfile.displayName}</p>
                </div>
              )}
              <div className="bg-blue-50 rounded-xl p-4 border-2 border-blue-200">
                <p className="text-sm text-gray-600 mb-1 font-semibold">📅 Member Since</p>
                <p className="font-bold text-gray-800">
                  {format(userProfile.createdAt, 'MMMM d, yyyy')}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-4 border-yellow-300 shadow-xl bg-white/95 backdrop-blur-sm rounded-3xl">
            <CardHeader className="bg-gradient-to-r from-yellow-100 to-orange-100 rounded-t-2xl border-b-4 border-yellow-200">
              <CardTitle className="text-2xl font-comic">Subscription 💳</CardTitle>
              <CardDescription className="text-gray-700 font-semibold">Your current plan and status</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 border-2 border-blue-200">
                <p className="text-sm text-gray-600 mb-3 font-semibold">Current Tier</p>
                <div className="flex justify-center">{getTierBadge(userProfile.subscriptionTier)}</div>
              </div>
              {userProfile.subscriptionTier === 'trial' && (
                <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-4 border-yellow-300 rounded-2xl p-4">
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
                    className="w-full rounded-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 font-bold"
                  >
                    Upgrade to PRO! 🚀
                  </Button>
                </div>
              )}
              {userProfile.subscriptionTier === 'pro' && (
                <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-4 border-yellow-300 rounded-2xl p-4">
                  <p className="text-sm text-gray-800 font-bold mb-3 text-center">
                    👑 Unlock PRO MAX for magical illustrations!
                  </p>
                  <Button
                    onClick={() => {
                      setUpgradeTier('pro_max')
                      setShowUpgradeModal(true)
                    }}
                    className="w-full rounded-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 font-bold"
                  >
                    Upgrade to PRO MAX! 👑
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="md:col-span-2 border-4 border-blue-300 shadow-xl bg-white/95 backdrop-blur-sm rounded-3xl">
            <CardHeader className="bg-gradient-to-r from-blue-100 to-purple-100 rounded-t-2xl border-b-4 border-blue-200">
              <CardTitle className="text-2xl font-comic flex items-center gap-2">
                <TrendingUp className="h-6 w-6 text-blue-600" />
                Usage Statistics 📊
              </CardTitle>
              <CardDescription className="text-gray-700 font-semibold">Your story creation activity</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-pink-100 to-purple-100 rounded-2xl p-6 border-4 border-pink-300 text-center shadow-lg">
                  <BookOpen className="h-8 w-8 text-pink-600 mx-auto mb-2" />
                  <p className="text-sm text-gray-600 mb-2 font-semibold">Stories Created</p>
                  <p className="text-4xl font-comic font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                    {stories?.length || 0}
                  </p>
                </div>
                <div className="bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl p-6 border-4 border-blue-300 text-center shadow-lg">
                  <Sparkles className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <p className="text-sm text-gray-600 mb-2 font-semibold">Account Type</p>
                  <div className="flex justify-center">
                    {getTierBadge(userProfile.subscriptionTier)}
                  </div>
                </div>
                <div className="bg-gradient-to-br from-green-100 to-blue-100 rounded-2xl p-6 border-4 border-green-300 text-center shadow-lg">
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
    </ProtectedRoute>
  )
}

