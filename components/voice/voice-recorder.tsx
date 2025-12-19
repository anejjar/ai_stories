'use client'

import { useState, useRef, useEffect } from 'react'
import { Mic, Square, Trash2, Upload, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface VoiceRecorderProps {
  onRecordingsChange: (recordings: File[]) => void
  maxRecordings?: number
  minDuration?: number // in seconds
  maxDuration?: number // in seconds
}

interface Recording {
  id: string
  blob: Blob
  duration: number
  url: string
}

export function VoiceRecorder({
  onRecordingsChange,
  maxRecordings = 3,
  minDuration = 30,
  maxDuration = 300, // 5 minutes
}: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [recordings, setRecordings] = useState<Recording[]>([])
  const [currentDuration, setCurrentDuration] = useState(0)
  const [error, setError] = useState<string | null>(null)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const streamRef = useRef<MediaStream | null>(null)

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
      }
      recordings.forEach(rec => URL.revokeObjectURL(rec.url))
    }
  }, [recordings])

  const startRecording = async () => {
    try {
      setError(null)

      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream

      // Create MediaRecorder
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm',
      })

      mediaRecorderRef.current = mediaRecorder
      chunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
        const url = URL.createObjectURL(blob)

        const newRecording: Recording = {
          id: Date.now().toString(),
          blob,
          duration: currentDuration,
          url,
        }

        setRecordings(prev => [...prev, newRecording])
        setCurrentDuration(0)

        // Stop all tracks
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop())
          streamRef.current = null
        }
      }

      // Start recording
      mediaRecorder.start()
      setIsRecording(true)

      // Start timer
      let seconds = 0
      timerRef.current = setInterval(() => {
        seconds++
        setCurrentDuration(seconds)

        // Auto-stop at max duration
        if (seconds >= maxDuration) {
          stopRecording()
        }
      }, 1000)
    } catch (err) {
      console.error('Error starting recording:', err)
      setError('Failed to access microphone. Please check your permissions.')
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)

      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }
  }

  const deleteRecording = (id: string) => {
    setRecordings(prev => {
      const recording = prev.find(r => r.id === id)
      if (recording) {
        URL.revokeObjectURL(recording.url)
      }
      return prev.filter(r => r.id !== id)
    })
  }

  // Convert recordings to Files and notify parent
  useEffect(() => {
    const files = recordings.map((rec, index) => {
      return new File([rec.blob], `voice_sample_${index + 1}.webm`, {
        type: 'audio/webm',
      })
    })
    onRecordingsChange(files)
  }, [recordings, onRecordingsChange])

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const canRecord = recordings.length < maxRecordings && !isRecording
  const hasMinimumRecordings = recordings.length >= 1
  const totalDuration = recordings.reduce((sum, rec) => sum + rec.duration, 0)
  const meetsMinimumDuration = totalDuration >= minDuration

  return (
    <div className="space-y-6">
      {/* Recording Controls */}
      <div className="bg-gray-50 rounded-lg p-6 border-2 border-dashed border-gray-300">
        <div className="text-center">
          {isRecording ? (
            <div className="space-y-4">
              <div className="flex items-center justify-center gap-3">
                <div className="w-4 h-4 bg-red-500 rounded-full animate-pulse"></div>
                <span className="text-2xl font-bold text-red-500">
                  {formatDuration(currentDuration)}
                </span>
              </div>

              <div className="flex items-center justify-center gap-2">
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <div
                      key={i}
                      className="w-2 bg-red-500 rounded-full animate-pulse"
                      style={{
                        height: `${Math.random() * 30 + 20}px`,
                        animationDelay: `${i * 0.1}s`,
                      }}
                    />
                  ))}
                </div>
              </div>

              <Button
                onClick={stopRecording}
                variant="destructive"
                size="lg"
                className="gap-2"
              >
                <Square className="w-5 h-5" />
                Stop Recording
              </Button>

              <p className="text-sm text-gray-600">
                Maximum duration: {formatDuration(maxDuration)}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center">
                  <Mic className="w-8 h-8 text-purple-600" />
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-2">
                  Record Voice Sample {recordings.length + 1} of {maxRecordings}
                </h3>
                <p className="text-sm text-gray-600">
                  Read a story or talk naturally for at least {minDuration} seconds
                </p>
              </div>

              <Button
                onClick={startRecording}
                disabled={!canRecord}
                size="lg"
                className="gap-2 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800"
              >
                <Mic className="w-5 h-5" />
                {recordings.length === 0 ? 'Start Recording' : 'Record Another Sample'}
              </Button>

              {!canRecord && recordings.length >= maxRecordings && (
                <p className="text-sm text-gray-600">
                  Maximum recordings reached
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {/* Recordings List */}
      {recordings.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold">Recorded Samples</h4>
            <span className="text-sm text-gray-600">
              Total: {formatDuration(totalDuration)}
            </span>
          </div>

          <div className="space-y-2">
            {recordings.map((recording, index) => (
              <div
                key={recording.id}
                className="bg-white border border-gray-200 rounded-lg p-4 flex items-center gap-4"
              >
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-purple-600" />
                  </div>
                </div>

                <div className="flex-1">
                  <div className="font-medium">Sample {index + 1}</div>
                  <div className="text-sm text-gray-600">
                    Duration: {formatDuration(recording.duration)}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <audio
                    src={recording.url}
                    controls
                    className="h-8"
                    style={{ width: '200px' }}
                  />

                  <Button
                    onClick={() => deleteRecording(recording.id)}
                    variant="ghost"
                    size="sm"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Status Indicators */}
      {recordings.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Minimum samples ({hasMinimumRecordings ? '✅' : '❌'})</span>
              <span className="font-medium">
                {recordings.length} / 1 sample{recordings.length !== 1 ? 's' : ''}
              </span>
            </div>

            <div className="flex items-center justify-between text-sm">
              <span>Minimum duration ({meetsMinimumDuration ? '✅' : '❌'})</span>
              <span className="font-medium">
                {formatDuration(totalDuration)} / {formatDuration(minDuration)}
              </span>
            </div>
          </div>

          {hasMinimumRecordings && meetsMinimumDuration && (
            <div className="mt-3 pt-3 border-t border-blue-200">
              <p className="text-sm text-blue-800 flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                Ready to clone voice! Click "Create Voice Clone" to continue.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Tips */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="font-semibold mb-2 text-sm">Recording Tips:</h4>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• Record in a quiet environment</li>
          <li>• Speak naturally and clearly</li>
          <li>• Read a children's story or describe your day</li>
          <li>• Aim for at least {minDuration} seconds of clear audio</li>
          <li>• Multiple samples improve voice quality</li>
        </ul>
      </div>
    </div>
  )
}
