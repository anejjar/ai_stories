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
import { UsageDashboard } from '@/components/usage/usage-dashboard'

export default function ProfilePage() {
  const { userProfile } = useAuth()
  const { data: stories } = useStories()
  const { isTrialCompleted, storiesGenerated } = useTrial()
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const [upgradeTier, setUpgradeTier] = useState<'pro' | 'family'>('pro')

  const getTierBadge = (tier: string) => {
    switch (tier) {
      case 'pro_max':
        return (
          <Badge className="bg-playwize-orange text-white font-black rounded-full px-6 py-2 border-0 shadow-lg">
            <Crown className="h-4 w-4 mr-2" />
            FAMILY PLAN 👑
          </Badge>
        )
      case 'pro':
        return (
          <Badge className="bg-playwize-purple text-white font-black rounded-full px-6 py-2 border-0 shadow-lg">
            <Sparkles className="h-4 w-4 mr-2" />
            PRO ✨
          </Badge>
        )
      default:
        return (
          <Badge className="bg-gray-100 text-gray-500 font-black rounded-full px-6 py-2 border-0">
            TRIAL 🎁
          </Badge>
        )
    }
  }

  if (!userProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin text-playwize-purple">
          <BookOpen className="h-12 w-12" />
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="py-12 px-4 max-w-5xl mx-auto space-y-12">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-100 text-playwize-purple text-sm font-bold border border-purple-200">
            <User className="h-4 w-4" />
            <span>Parent Profile</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-gray-900 tracking-tight">
            Your <span className="text-playwize-purple">Profile</span>
          </h1>
          <p className="text-gray-600 text-lg font-medium">
            Manage your account and subscription details.
          </p>
        </div>

        {/* Testing Subscription Toggle - Only visible in development */}
        {process.env.NODE_ENV !== 'production' && (
          <div className="bg-white p-8 rounded-[3rem] border-4 border-dashed border-gray-200 shadow-inner">
            <SubscriptionToggle />
          </div>
        )}

        <div className="grid gap-8 md:grid-cols-2">
          {/* Account Information */}
          <div className="bg-white p-10 rounded-[3.5rem] border-4 border-gray-100 shadow-sm space-y-8">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-playwize-purple/10 flex items-center justify-center">
                <User className="h-6 w-6 text-playwize-purple" />
              </div>
              <h3 className="text-2xl font-black text-gray-900">Account Info</h3>
            </div>
            
            <div className="space-y-4">
              {[
                { label: 'Email', value: userProfile.email, icon: '📧' },
                { label: 'Display Name', value: userProfile.displayName || 'Friend', icon: '👋' },
                { label: 'Member Since', value: format(userProfile.createdAt, 'MMMM d, yyyy'), icon: '📅' },
              ].map((info, i) => (
                <div key={i} className="p-5 bg-gray-50 rounded-[2rem] border-2 border-white flex items-center gap-4">
                  <span className="text-2xl">{info.icon}</span>
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">{info.label}</p>
                    <p className="font-black text-gray-900">{info.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Subscription Information */}
          <div className="bg-white p-10 rounded-[3.5rem] border-4 border-gray-100 shadow-sm space-y-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-playwize-orange/5 rounded-full -mr-10 -mt-10" />
            
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-playwize-orange/10 flex items-center justify-center">
                <Crown className="h-6 w-6 text-playwize-orange" />
              </div>
              <h3 className="text-2xl font-black text-gray-900">Subscription</h3>
            </div>

            <div className="space-y-6">
              <div className="p-8 bg-gray-50 rounded-[2.5rem] border-2 border-white text-center space-y-4">
                <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Current Plan</p>
                <div className="flex justify-center">{getTierBadge(userProfile.subscriptionTier)}</div>
              </div>

              {userProfile.subscriptionTier === 'trial' && (
                <div className="bg-playwize-orange rounded-[2.5rem] p-8 text-white text-center space-y-6 shadow-xl shadow-orange-100">
                  <p className="font-black text-lg leading-tight">
                    {isTrialCompleted
                      ? '🎉 Trial completed! Upgrade to unlock unlimited magic!'
                      : `✨ Free Trial: ${storiesGenerated}/1 stories created`}
                  </p>
                  <Button
                    onClick={() => {
                      setUpgradeTier('pro')
                      setShowUpgradeModal(true)
                    }}
                    className="w-full h-14 rounded-full bg-white text-playwize-orange hover:bg-gray-100 font-black text-lg transition-all hover:scale-105 active:scale-95 shadow-lg"
                  >
                    Upgrade to PRO! 🚀
                  </Button>
                </div>
              )}

              {userProfile.subscriptionTier === 'pro' && (
                <div className="bg-playwize-orange rounded-[2.5rem] p-8 text-white text-center space-y-6 shadow-xl shadow-orange-100">
                  <p className="font-black text-lg leading-tight">
                    👑 Unlock FAMILY PLAN for magical AI-illustrations!
                  </p>
                  <Button
                    onClick={() => {
                      setUpgradeTier('family') // Note: tier name might need adjustment to pro_max if backend changed
                      setShowUpgradeModal(true)
                    }}
                    className="w-full h-14 rounded-full bg-white text-playwize-orange hover:bg-gray-100 font-black text-lg transition-all hover:scale-105 active:scale-95 shadow-lg"
                  >
                    Upgrade to FAMILY PLAN! 👑
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Usage Statistics */}
          <div className="md:col-span-2 bg-white p-10 rounded-[4rem] border-4 border-gray-100 shadow-sm space-y-10">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-blue-50 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-blue-500" />
              </div>
              <h3 className="text-2xl font-black text-gray-900">Activity & Stats</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {[
                { label: 'Stories Created', value: stories?.length || 0, icon: BookOpen, color: 'text-playwize-purple', bg: 'bg-purple-50' },
                { label: 'Account Tier', value: userProfile.subscriptionTier, icon: Sparkles, color: 'text-playwize-orange', bg: 'bg-orange-50', capitalize: true },
                { label: 'Last Updated', value: format(userProfile.updatedAt, 'MMM d, yyyy'), icon: TrendingUp, color: 'text-blue-500', bg: 'bg-blue-50' },
              ].map((stat, i) => (
                <div key={i} className={`${stat.bg} p-8 rounded-[3rem] border-2 border-white shadow-sm text-center space-y-4 hover:shadow-md transition-all`}>
                  <div className={`${stat.color} p-4 rounded-[1.5rem] bg-white w-fit mx-auto shadow-sm`}>
                    <stat.icon className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{stat.label}</p>
                    <p className={`text-2xl font-black ${stat.color} ${stat.capitalize ? 'capitalize' : ''}`}>
                      {stat.value}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Usage Dashboard */}
          {(userProfile.subscriptionTier === 'pro' || userProfile.subscriptionTier === 'family' || userProfile.subscriptionTier === 'pro_max') && (
            <div className="md:col-span-2">
              <div className="bg-white rounded-[4rem] border-4 border-gray-100 shadow-sm overflow-hidden">
                <div className="bg-playwize-purple p-8 text-white">
                  <h3 className="text-2xl font-black">Daily Usage & Limits 📊</h3>
                </div>
                <div className="p-10">
                  <UsageDashboard />
                </div>
              </div>
            </div>
          )}

          {/* Child Profiles Section */}
          <div className="md:col-span-2">
            <ChildProfileManager />
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

