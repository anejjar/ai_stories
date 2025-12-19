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
    <div className="container max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Voice Settings</h1>
        <p className="text-gray-600">
          Create custom voice clones to narrate stories in your own voice
        </p>
      </div>

      {/* Default Voice Option */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-4">Default Voice</h2>
        <div
          onClick={() => handleSelectVoice(null)}
          className={`bg-white border-2 rounded-lg p-6 cursor-pointer transition-all ${
            selectedVoiceId === null
              ? 'border-purple-600 bg-purple-50'
              : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center">
                <Volume2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="font-semibold">AI Narrator</div>
                <div className="text-sm text-gray-600">Professional AI-generated voice</div>
              </div>
            </div>
            {selectedVoiceId === null && (
              <div className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center">
                <Check className="w-4 h-4 text-white" />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Custom Voices */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Custom Voices</h2>
          <Button
            onClick={() => setIsCreateDialogOpen(true)}
            className="gap-2 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800"
          >
            <Plus className="w-4 h-4" />
            Create Voice Clone
          </Button>
        </div>

        {voiceProfiles.length === 0 ? (
          <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mic className="w-8 h-8 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No Custom Voices Yet</h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Create your first voice clone to narrate stories in your own voice. Perfect for bedtime stories when you're away!
            </p>
            <Button
              onClick={() => setIsCreateDialogOpen(true)}
              className="gap-2 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800"
            >
              <Sparkles className="w-4 h-4" />
              Get Started
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {voiceProfiles.map((profile) => (
              <div
                key={profile.id}
                onClick={() => handleSelectVoice(profile.voice_id)}
                className={`bg-white border-2 rounded-lg p-6 cursor-pointer transition-all ${
                  selectedVoiceId === profile.voice_id
                    ? 'border-purple-600 bg-purple-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center">
                      <Mic className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold">{profile.name}</div>
                      {profile.description && (
                        <div className="text-sm text-gray-600">{profile.description}</div>
                      )}
                      <div className="text-xs text-gray-500 mt-1">
                        Created {new Date(profile.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleTestVoice(profile.voice_id)
                      }}
                      variant="outline"
                      size="sm"
                      className="gap-2"
                    >
                      <Volume2 className="w-4 h-4" />
                      Test
                    </Button>

                    <Button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDeleteVoice(profile)
                      }}
                      variant="ghost"
                      size="sm"
                      disabled={deletingId === profile.id}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      {deletingId === profile.id ? (
                        <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </Button>

                    {selectedVoiceId === profile.voice_id && (
                      <div className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center ml-2">
                        <Check className="w-4 h-4 text-white" />
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
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 mb-2">About Voice Cloning</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Voice cloning uses AI to create a digital version of your voice</li>
          <li>• Perfect for narrating bedtime stories when you're away</li>
          <li>• Requires at least 30 seconds of clear audio</li>
          <li>• More audio samples = better voice quality</li>
          <li>• Only clone voices you have permission to use</li>
        </ul>
      </div>

      {/* Create Dialog */}
      <CreateVoiceCloneDialog
        isOpen={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        onSuccess={loadVoiceProfiles}
      />
    </div>
  )
}
