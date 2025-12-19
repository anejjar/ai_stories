'use client'

import { useState } from 'react'
import { X, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { VoiceRecorder } from './voice-recorder'
import { toast } from 'sonner'

interface CreateVoiceCloneDialogProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function CreateVoiceCloneDialog({ isOpen, onClose, onSuccess }: CreateVoiceCloneDialogProps) {
  const [step, setStep] = useState<'info' | 'record' | 'details'>('info')
  const [recordings, setRecordings] = useState<File[]>([])
  const [voiceName, setVoiceName] = useState('')
  const [voiceDescription, setVoiceDescription] = useState('')
  const [isCreating, setIsCreating] = useState(false)

  if (!isOpen) return null

  const handleCreateVoice = async () => {
    if (!voiceName.trim()) {
      toast.error('Please enter a name for your voice')
      return
    }

    if (recordings.length === 0) {
      toast.error('Please record at least one voice sample')
      return
    }

    setIsCreating(true)

    try {
      // Create FormData for API
      const formData = new FormData()
      formData.append('name', voiceName)
      if (voiceDescription.trim()) {
        formData.append('description', voiceDescription)
      }
      recordings.forEach((file, index) => {
        formData.append('audioFiles', file)
      })

      const response = await fetch('/api/voice/clone', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create voice clone')
      }

      const data = await response.json()

      toast.success('Voice clone created successfully!')
      onSuccess()
      handleClose()
    } catch (error) {
      console.error('Error creating voice clone:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to create voice clone')
    } finally {
      setIsCreating(false)
    }
  }

  const handleClose = () => {
    setStep('info')
    setRecordings([])
    setVoiceName('')
    setVoiceDescription('')
    setIsCreating(false)
    onClose()
  }

  const canProceedToDetails = recordings.length >= 1 && recordings.reduce((sum, file) => sum + file.size, 0) > 100 * 1024

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Create Voice Clone</h2>
              <p className="text-sm text-gray-600">
                {step === 'info' && 'Learn about voice cloning'}
                {step === 'record' && 'Record voice samples'}
                {step === 'details' && 'Name your voice'}
              </p>
            </div>
          </div>
          <Button onClick={handleClose} variant="ghost" size="sm">
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Step 1: Info */}
          {step === 'info' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-3">What is Voice Cloning?</h3>
                <p className="text-gray-600 mb-4">
                  Voice cloning allows you to create a digital version of your voice that can narrate stories.
                  Imagine hearing bedtime stories in your own voice, even when you're away!
                </p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-2">How it works:</h4>
                <ol className="list-decimal list-inside space-y-2 text-sm text-blue-800">
                  <li>Record 1-3 voice samples (at least 30 seconds total)</li>
                  <li>We'll process your voice using AI</li>
                  <li>Use your cloned voice to narrate any story!</li>
                </ol>
              </div>

              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <h4 className="font-semibold text-purple-900 mb-2">Best Practices:</h4>
                <ul className="space-y-2 text-sm text-purple-800">
                  <li>✅ Record in a quiet environment</li>
                  <li>✅ Speak naturally and clearly</li>
                  <li>✅ Use an expressive, storytelling voice</li>
                  <li>✅ Record at least 1 minute of audio total</li>
                  <li>❌ Avoid background noise or music</li>
                  <li>❌ Don't rush - speak at a comfortable pace</li>
                </ul>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <h4 className="font-semibold text-amber-900 mb-2">⚠️ Important Notes:</h4>
                <ul className="space-y-1 text-sm text-amber-800">
                  <li>• Voice cloning requires ElevenLabs Pro subscription</li>
                  <li>• Only clone voices you have permission to use</li>
                  <li>• Processing may take a few minutes</li>
                  <li>• You can create multiple voice profiles</li>
                </ul>
              </div>

              <Button
                onClick={() => setStep('record')}
                className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800"
                size="lg"
              >
                Get Started →
              </Button>
            </div>
          )}

          {/* Step 2: Record */}
          {step === 'record' && (
            <div className="space-y-6">
              <VoiceRecorder
                onRecordingsChange={setRecordings}
                maxRecordings={3}
                minDuration={30}
                maxDuration={300}
              />

              <div className="flex gap-3">
                <Button
                  onClick={() => setStep('info')}
                  variant="outline"
                  className="flex-1"
                >
                  ← Back
                </Button>
                <Button
                  onClick={() => setStep('details')}
                  disabled={!canProceedToDetails}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800"
                >
                  Continue →
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Details */}
          {step === 'details' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Name Your Voice</h3>
                <p className="text-sm text-gray-600 mb-6">
                  Give your voice clone a memorable name so you can easily identify it later.
                </p>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Voice Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={voiceName}
                      onChange={(e) => setVoiceName(e.target.value)}
                      placeholder="e.g., Mom's Bedtime Voice, Dad's Story Voice"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      maxLength={50}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {voiceName.length}/50 characters
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Description (Optional)
                    </label>
                    <textarea
                      value={voiceDescription}
                      onChange={(e) => setVoiceDescription(e.target.value)}
                      placeholder="e.g., Warm and gentle voice perfect for bedtime stories"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                      rows={3}
                      maxLength={200}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {voiceDescription.length}/200 characters
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-sm mb-2">Summary:</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• {recordings.length} voice sample{recordings.length !== 1 ? 's' : ''} recorded</li>
                  <li>• Total duration: ~{Math.floor(recordings.reduce((sum, file) => sum + file.size, 0) / 16000)} seconds</li>
                  <li>• Ready to create voice clone</li>
                </ul>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={() => setStep('record')}
                  variant="outline"
                  className="flex-1"
                  disabled={isCreating}
                >
                  ← Back
                </Button>
                <Button
                  onClick={handleCreateVoice}
                  disabled={!voiceName.trim() || isCreating}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800"
                >
                  {isCreating ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Creating Voice...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Create Voice Clone
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
