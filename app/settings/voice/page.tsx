'use client'

import { useState, useEffect } from 'react'
import { Mic, Plus, Trash2, Check, Volume2, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CreateVoiceCloneDialog } from '@/components/voice/create-voice-clone-dialog'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase/client'

interface VoiceProfile {
  id: string
  voice_id: string
  name: string
  description: string | null
  category: string
  preview_url: string | null
  is_active: boolean
  created_at: string
}

export default function VoiceSettingsPage() {
  const [voiceProfiles, setVoiceProfiles] = useState<VoiceProfile[]>([])
  const [selectedVoiceId, setSelectedVoiceId] = useState<string | null>(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    loadVoiceProfiles()
    loadUserSettings()
  }, [])

  const loadVoiceProfiles = async () => {
    try {
      const { data, error } = await supabase
        .from('voice_profiles')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })

      if (error) throw error

      setVoiceProfiles(data || [])
    } catch (error) {
      console.error('Error loading voice profiles:', error)
      toast.error('Failed to load voice profiles')
    } finally {
      setIsLoading(false)
    }
  }

  const loadUserSettings = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('users')
        .select('custom_voice_id')
        .eq('id', user.id)
        .single()

      if (error) throw error

      setSelectedVoiceId(data?.custom_voice_id || null)
    } catch (error) {
      console.error('Error loading user settings:', error)
    }
  }

  const handleSelectVoice = async (voiceId: string | null) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast.error('Please sign in to change voice settings')
        return
      }

      const { error } = await supabase
        .from('users')
        .update({ custom_voice_id: voiceId })
        .eq('id', user.id)

      if (error) throw error

      setSelectedVoiceId(voiceId)
      toast.success(voiceId ? 'Voice selected!' : 'Using default voice')
    } catch (error) {
      console.error('Error selecting voice:', error)
      toast.error('Failed to update voice selection')
    }
  }

  const handleDeleteVoice = async (profile: VoiceProfile) => {
    if (!confirm(`Are you sure you want to delete "${profile.name}"? This action cannot be undone.`)) {
      return
    }

    setDeletingId(profile.id)

    try {
      // Call API to delete from ElevenLabs
      const response = await fetch(`/api/voice/delete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ voiceId: profile.voice_id }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to delete voice')
      }

      // Update database
      const { error: dbError } = await supabase
        .from('voice_profiles')
        .update({ is_active: false })
        .eq('id', profile.id)

      if (dbError) throw dbError

      // If this was the selected voice, clear selection
      if (selectedVoiceId === profile.voice_id) {
        handleSelectVoice(null)
      }

      // Reload profiles
      await loadVoiceProfiles()

      toast.success('Voice deleted successfully')
    } catch (error) {
      console.error('Error deleting voice:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to delete voice')
    } finally {
      setDeletingId(null)
    }
  }

  const handleTestVoice = async (voiceId: string) => {
    try {
      toast.info('Generating test audio...')

      const response = await fetch('/api/voice/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: 'Hello! This is a test of your custom voice. Once upon a time, in a magical forest, there lived a curious little bunny.',
          voiceId,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to generate test audio')
      }

      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const audio = new Audio(url)
      audio.play()

      toast.success('Playing test audio...')
    } catch (error) {
      console.error('Error testing voice:', error)
      toast.error('Failed to test voice')
    }
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
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-100 text-playwize-orange text-sm font-bold border border-orange-200">
            <Mic className="h-4 w-4" />
            <span>AI Voice Magic</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-gray-900 tracking-tight">
            Voice <span className="text-playwize-purple">Settings</span>
          </h1>
          <p className="text-gray-600 text-lg font-medium max-w-2xl mx-auto">
            Create custom voice clones to narrate stories in your own voice.
          </p>
        </div>

        {/* Default Voice Option */}
        <div className="space-y-6">
          <h2 className="text-2xl font-black text-gray-900 px-4">AI Narrator</h2>
          <div
            onClick={() => handleSelectVoice(null)}
            className={`bg-white border-4 rounded-[2.5rem] p-8 cursor-pointer transition-all hover:shadow-xl ${
              selectedVoiceId === null
                ? 'border-playwize-purple shadow-xl shadow-purple-100'
                : 'border-gray-100 hover:border-playwize-purple/30'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className="h-16 w-16 bg-playwize-purple rounded-3xl flex items-center justify-center shadow-lg">
                  <Volume2 className="h-8 w-8 text-white" />
                </div>
                <div>
                  <div className="text-xl font-black text-gray-900">Standard AI Voice</div>
                  <div className="text-gray-500 font-bold">Our friendly professional AI narrator</div>
                </div>
              </div>
              {selectedVoiceId === null && (
                <div className="h-10 w-10 bg-playwize-purple rounded-full flex items-center justify-center shadow-lg animate-in zoom-in">
                  <Check className="h-6 w-6 text-white" />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Custom Voices */}
        <div className="space-y-6">
          <div className="flex items-center justify-between px-4">
            <h2 className="text-2xl font-black text-gray-900">Custom Voices</h2>
            <Button
              onClick={() => setIsCreateDialogOpen(true)}
              className="h-12 px-6 rounded-full bg-playwize-purple hover:bg-purple-700 text-white font-black shadow-lg transition-all hover:scale-105 active:scale-95"
            >
              <Plus className="h-5 w-5 mr-2" />
              CLONE VOICE
            </Button>
          </div>

          {voiceProfiles.length === 0 ? (
            <div className="bg-white border-4 border-dashed border-gray-100 rounded-[3rem] p-16 text-center space-y-8">
              <div className="h-32 w-32 bg-purple-50 rounded-[2.5rem] flex items-center justify-center mx-auto shadow-inner animate-float-gentle">
                <Mic className="h-16 w-16 text-playwize-purple opacity-40" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-black text-gray-900">No Custom Voices Yet</h3>
                <p className="text-gray-500 font-bold max-w-md mx-auto">
                  Narrate stories in your own voice! Perfect for bedtime when you're away.
                </p>
              </div>
              <Button
                onClick={() => setIsCreateDialogOpen(true)}
                className="h-14 px-10 rounded-full bg-playwize-purple hover:bg-purple-700 text-white font-black text-lg shadow-xl shadow-purple-100 transition-all hover:scale-105 active:scale-95"
              >
                <Sparkles className="h-5 w-5 mr-2" />
                GET STARTED
              </Button>
            </div>
          ) : (
            <div className="grid gap-4">
              {voiceProfiles.map((profile) => (
                <div
                  key={profile.id}
                  onClick={() => handleSelectVoice(profile.voice_id)}
                  className={`bg-white border-4 rounded-[2.5rem] p-8 cursor-pointer transition-all hover:shadow-xl ${
                    selectedVoiceId === profile.voice_id
                      ? 'border-playwize-purple shadow-xl shadow-purple-100'
                      : 'border-gray-100 hover:border-playwize-purple/30'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                    <div className="flex items-center gap-6 flex-1">
                      <div className="h-16 w-16 bg-playwize-orange rounded-3xl flex items-center justify-center shadow-lg">
                        <Mic className="h-8 w-8 text-white" />
                      </div>
                      <div>
                        <div className="text-xl font-black text-gray-900">{profile.name}</div>
                        {profile.description && (
                          <div className="text-gray-500 font-bold">{profile.description}</div>
                        )}
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">
                          Created {new Date(profile.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleTestVoice(profile.voice_id)
                        }}
                        variant="outline"
                        className="h-12 px-6 rounded-full border-2 border-gray-100 font-black text-gray-700 hover:border-playwize-purple transition-all shadow-sm"
                      >
                        <Volume2 className="h-5 w-5 mr-2" />
                        TEST
                      </Button>

                      <Button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeleteVoice(profile)
                        }}
                        variant="ghost"
                        className="h-12 w-12 rounded-full text-red-400 hover:text-red-600 hover:bg-red-50 transition-all"
                        disabled={deletingId === profile.id}
                      >
                        {deletingId === profile.id ? (
                          <div className="w-5 h-5 border-3 border-red-400 border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Trash2 className="h-5 w-5" />
                        )}
                      </Button>

                      {selectedVoiceId === profile.voice_id && (
                        <div className="h-10 w-10 bg-playwize-purple rounded-full flex items-center justify-center shadow-lg animate-in zoom-in">
                          <Check className="h-6 w-6 text-white" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Info Box */}
        <div className="bg-white p-10 rounded-[3rem] border-4 border-gray-100 shadow-sm space-y-6">
          <h3 className="text-xl font-black text-gray-900 flex items-center gap-3">
            <span className="text-2xl">ℹ️</span>
            About Voice Cloning
          </h3>
          <ul className="grid sm:grid-cols-2 gap-4">
            {[
              'Uses AI to digitalize your voice',
              'Perfect for reading when away',
              'Requires 30s audio sample',
              'Higher samples = better quality',
              'Only clone your own voice'
            ].map((text, i) => (
              <li key={i} className="flex items-center gap-3 text-gray-500 font-bold">
                <div className="h-2 w-2 rounded-full bg-playwize-purple" />
                {text}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <CreateVoiceCloneDialog
        isOpen={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        onSuccess={loadVoiceProfiles}
      />
    </main>
  )
}
