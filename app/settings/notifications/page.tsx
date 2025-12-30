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
    <main className="min-h-screen playwize-bg relative selection:bg-playwize-purple selection:text-white py-12 px-4 overflow-hidden">
      {/* Background Ornaments */}
      <div className="absolute top-40 -left-20 w-80 h-80 circle-pattern opacity-30 pointer-events-none" />
      <div className="absolute top-[60%] -right-20 w-96 h-96 circle-pattern opacity-30 pointer-events-none" />

      <div className="max-w-4xl mx-auto space-y-12 relative z-10">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-100 text-playwize-purple text-sm font-bold border border-purple-200">
            <Bell className="h-4 w-4" />
            <span>Settings</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-gray-900 tracking-tight">
            Email <span className="text-playwize-purple">Notifications</span>
          </h1>
          <p className="text-gray-600 text-lg font-medium max-w-2xl mx-auto">
            Stay updated on your child's progress and new magical features.
          </p>
        </div>

        {/* Notification Settings */}
        <div className="grid gap-6">
          {[
            {
              id: 'weekly_summary',
              title: 'Weekly Summary',
              desc: 'Get a weekly email with reading stats, achievements, and insights.',
              info: 'Sent every Sunday at 6:00 PM',
              icon: Mail,
              color: 'bg-playwize-purple'
            },
            {
              id: 'bedtime_reminder',
              title: 'Bedtime Reminder',
              desc: 'Daily reminder to read a bedtime story together.',
              icon: Clock,
              color: 'bg-playwize-orange'
            },
            {
              id: 'achievement_notifications',
              title: 'Achievement Unlocked',
              desc: 'Get notified when you unlock new achievements and milestones.',
              info: 'Sent immediately when earned',
              icon: Trophy,
              color: 'bg-playwize-purple'
            },
            {
              id: 'new_features',
              title: 'New Features & Updates',
              desc: 'Stay informed about new features, improvements, and special offers.',
              info: 'Sent occasionally (1-2 times per month)',
              icon: Sparkles,
              color: 'bg-playwize-orange'
            }
          ].map((item) => (
            <div key={item.id} className="bg-white p-8 rounded-[3rem] border-4 border-gray-100 shadow-sm transition-all hover:border-gray-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div className="flex items-start gap-6">
                  <div className={`h-14 w-14 rounded-2xl ${item.color} flex items-center justify-center shrink-0 shadow-lg`}>
                    <item.icon className="h-7 w-7 text-white" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-xl font-black text-gray-900">{item.title}</h3>
                    <p className="text-gray-500 font-bold text-sm leading-relaxed">{item.desc}</p>
                    {item.info && <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest pt-1">{item.info}</p>}
                  </div>
                </div>
                
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={preferences[item.id as keyof EmailPreferences] as boolean}
                    onChange={(e) => updatePreference(item.id as keyof EmailPreferences, e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-14 h-8 bg-gray-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-gray-200 after:border-2 after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-playwize-purple shadow-inner transition-colors"></div>
                </label>
              </div>

              {item.id === 'bedtime_reminder' && preferences.bedtime_reminder && (
                <div className="mt-8 pt-8 border-t-2 border-gray-50 sm:pl-20">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    <label className="text-sm font-black text-gray-400 uppercase tracking-widest">Reminder Time:</label>
                    <input
                      type="time"
                      value={preferences.bedtime_reminder_time.substring(0, 5)}
                      onChange={(e) => updatePreference('bedtime_reminder_time', e.target.value + ':00')}
                      className="px-6 py-3 bg-gray-50 border-2 border-white rounded-full font-black text-gray-700 shadow-inner focus:outline-none focus:ring-2 focus:ring-playwize-purple/20 transition-all"
                    />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Info Box */}
        <div className="bg-white p-10 rounded-[3rem] border-4 border-gray-100 shadow-sm space-y-6">
          <h3 className="text-xl font-black text-gray-900 flex items-center gap-3">
            <span className="text-2xl">ℹ️</span>
            About Notifications
          </h3>
          <ul className="grid sm:grid-cols-2 gap-4">
            {[
              'Change settings any time',
              'One-click unsubscribe',
              'We never share your email',
              'Critical alerts always sent'
            ].map((text, i) => (
              <li key={i} className="flex items-center gap-3 text-gray-500 font-bold">
                <div className="h-2 w-2 rounded-full bg-playwize-purple" />
                {text}
              </li>
            ))}
          </ul>
        </div>

        {/* Save Button */}
        {hasChanges && (
          <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 w-full max-w-lg px-4 animate-in slide-in-from-bottom-8 duration-500">
            <div className="bg-white p-6 rounded-[2.5rem] border-4 border-playwize-purple shadow-2xl flex items-center justify-between gap-6">
              <div className="flex items-center gap-3 text-playwize-purple font-black uppercase tracking-widest text-xs">
                <Bell className="h-5 w-5 animate-bounce" />
                <span>Unsaved changes!</span>
              </div>
              <Button
                onClick={handleSave}
                disabled={isSaving}
                className="h-14 px-8 rounded-full bg-playwize-purple hover:bg-purple-700 text-white font-black text-lg shadow-xl shadow-purple-100 transition-all hover:scale-105 active:scale-95"
              >
                {isSaving ? (
                  <span className="flex items-center gap-2">
                    <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin" />
                    SAVING...
                  </span>
                ) : (
                  <>
                    <Save className="h-5 w-5 mr-2" />
                    SAVE CHANGES
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
