'use client'

import { useState, useEffect } from 'react'
import { Mail, Clock, Trophy, Sparkles, Bell, Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase/client'

interface EmailPreferences {
  weekly_summary: boolean
  bedtime_reminder: boolean
  bedtime_reminder_time: string
  achievement_notifications: boolean
  new_features: boolean
}

export default function NotificationSettingsPage() {
  const [preferences, setPreferences] = useState<EmailPreferences>({
    weekly_summary: true,
    bedtime_reminder: false,
    bedtime_reminder_time: '19:00:00',
    achievement_notifications: true,
    new_features: true,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  useEffect(() => {
    loadPreferences()
  }, [])

  const loadPreferences = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        toast.error('Please sign in to manage notification settings')
        return
      }

      const { data, error } = await supabase
        .from('email_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (error) {
        // If no preferences exist, create default ones
        if (error.code === 'PGRST116') {
          const { error: insertError } = await supabase.from('email_preferences').insert({
            user_id: user.id,
          })

          if (insertError) {
            console.error('Error creating default preferences:', insertError)
          }
        } else {
          console.error('Error loading preferences:', error)
        }
      } else if (data) {
        setPreferences({
          weekly_summary: data.weekly_summary,
          bedtime_reminder: data.bedtime_reminder,
          bedtime_reminder_time: data.bedtime_reminder_time || '19:00:00',
          achievement_notifications: data.achievement_notifications,
          new_features: data.new_features,
        })
      }
    } catch (error) {
      console.error('Error loading preferences:', error)
      toast.error('Failed to load notification settings')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    setIsSaving(true)

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        toast.error('Please sign in to save settings')
        return
      }

      const { error } = await supabase
        .from('email_preferences')
        .update({
          weekly_summary: preferences.weekly_summary,
          bedtime_reminder: preferences.bedtime_reminder,
          bedtime_reminder_time: preferences.bedtime_reminder_time,
          achievement_notifications: preferences.achievement_notifications,
          new_features: preferences.new_features,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id)

      if (error) {
        throw error
      }

      toast.success('Notification settings saved!')
      setHasChanges(false)
    } catch (error) {
      console.error('Error saving preferences:', error)
      toast.error('Failed to save notification settings')
    } finally {
      setIsSaving(false)
    }
  }

  const updatePreference = (key: keyof EmailPreferences, value: boolean | string) => {
    setPreferences((prev) => ({ ...prev, [key]: value }))
    setHasChanges(true)
  }

  if (isLoading) {
    return (
      <div className="container max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    )
  }

  return (
    <div className="container max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Email Notifications</h1>
        <p className="text-gray-600">Choose which email notifications you'd like to receive</p>
      </div>

      {/* Notification Settings */}
      <div className="space-y-4 mb-6">
        {/* Weekly Summary */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4 flex-1">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <Mail className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg mb-1">Weekly Summary</h3>
                <p className="text-sm text-gray-600 mb-2">
                  Get a weekly email with reading stats, achievements, and insights
                </p>
                <div className="text-xs text-gray-500">Sent every Sunday at 6:00 PM</div>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.weekly_summary}
                onChange={(e) => updatePreference('weekly_summary', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
            </label>
          </div>
        </div>

        {/* Bedtime Reminder */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-start gap-4 flex-1">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg mb-1">Bedtime Reminder</h3>
                <p className="text-sm text-gray-600 mb-2">
                  Daily reminder to read a bedtime story together
                </p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.bedtime_reminder}
                onChange={(e) => updatePreference('bedtime_reminder', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {preferences.bedtime_reminder && (
            <div className="pl-16">
              <label className="block text-sm font-medium mb-2">Reminder Time</label>
              <input
                type="time"
                value={preferences.bedtime_reminder_time.substring(0, 5)}
                onChange={(e) => updatePreference('bedtime_reminder_time', e.target.value + ':00')}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Emails will be sent daily at this time
              </p>
            </div>
          )}
        </div>

        {/* Achievement Notifications */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4 flex-1">
              <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <Trophy className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg mb-1">Achievement Unlocked</h3>
                <p className="text-sm text-gray-600 mb-2">
                  Get notified when you unlock new achievements and milestones
                </p>
                <div className="text-xs text-gray-500">Sent immediately when earned</div>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.achievement_notifications}
                onChange={(e) => updatePreference('achievement_notifications', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-yellow-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-yellow-500 peer-checked:to-orange-500"></div>
            </label>
          </div>
        </div>

        {/* New Features */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4 flex-1">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg mb-1">New Features & Updates</h3>
                <p className="text-sm text-gray-600 mb-2">
                  Stay informed about new features, improvements, and special offers
                </p>
                <div className="text-xs text-gray-500">Sent occasionally (1-2 times per month)</div>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.new_features}
                onChange={(e) => updatePreference('new_features', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Save Button */}
      {hasChanges && (
        <div className="sticky bottom-4 bg-white border border-gray-200 rounded-lg p-4 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Bell className="w-4 h-4" />
              You have unsaved changes
            </div>
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="gap-2 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800"
            >
              {isSaving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Preferences
                </>
              )}
            </Button>
          </div>
        </div>
      )}

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
        <h3 className="font-semibold text-blue-900 mb-2">About Email Notifications</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• You can change these settings at any time</li>
          <li>• All emails include an unsubscribe link</li>
          <li>• We'll never share your email address</li>
          <li>• Some critical account emails cannot be disabled</li>
        </ul>
      </div>
    </div>
  )
}
