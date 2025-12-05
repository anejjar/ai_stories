'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Play, Pause, Square, Moon, Sun } from 'lucide-react'
import { TTSService } from '@/lib/tts/tts-service'
import { toast } from '@/components/ui/toaster'

interface AudioPlayerProps {
  text: string
  title?: string
  bedtimeMode?: boolean
}

export function AudioPlayer({ text, title, bedtimeMode: initialBedtimeMode = false }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [bedtimeMode, setBedtimeMode] = useState(initialBedtimeMode)
  const [isSupported, setIsSupported] = useState(false)
  const ttsServiceRef = useRef<TTSService | null>(null)

  useEffect(() => {
    // Check if TTS is supported
    if (TTSService.isSupported()) {
      setIsSupported(true)
      ttsServiceRef.current = new TTSService()
    } else {
      setIsSupported(false)
      toast.warning('Audio not supported', 'Your browser does not support text-to-speech')
    }

    // Cleanup on unmount
    return () => {
      if (ttsServiceRef.current) {
        ttsServiceRef.current.stop()
      }
    }
  }, [])

  const handlePlay = () => {
    if (!ttsServiceRef.current || !text) return

    if (isPaused) {
      // Resume
      ttsServiceRef.current.resume()
      setIsPaused(false)
      setIsPlaying(true)
    } else {
      // Start new or restart
      ttsServiceRef.current.speak(
        text,
        { bedtimeMode },
        () => {
          // On end
          setIsPlaying(false)
          setIsPaused(false)
        },
        (error) => {
          // On error
          setIsPlaying(false)
          setIsPaused(false)
          toast.error('Audio error', error.message)
        }
      )
      setIsPlaying(true)
      setIsPaused(false)
    }
  }

  const handlePause = () => {
    if (!ttsServiceRef.current) return
    ttsServiceRef.current.pause()
    setIsPaused(true)
  }

  const handleStop = () => {
    if (!ttsServiceRef.current) return
    ttsServiceRef.current.stop()
    setIsPlaying(false)
    setIsPaused(false)
  }

  const handleBedtimeModeToggle = () => {
    const newMode = !bedtimeMode
    setBedtimeMode(newMode)
    
    // If currently playing, restart with new mode
    if (isPlaying || isPaused) {
      handleStop()
      setTimeout(() => {
        handlePlay()
      }, 100)
    }
  }

  if (!isSupported) {
    return (
      <div className="p-4 rounded-2xl border-2 border-gray-300 bg-gray-50 text-center">
        <p className="text-sm text-gray-600 font-semibold">
          Audio playback is not supported in your browser 😢
        </p>
      </div>
    )
  }

  return (
    <div className="p-6 rounded-3xl border-4 border-purple-300 bg-gradient-to-br from-purple-50 to-pink-50 shadow-xl">
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold font-comic bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-1">
              🔊 Listen to Story
            </h3>
            {title && (
              <p className="text-sm text-gray-600 font-semibold">{title}</p>
            )}
          </div>
          <Badge
            className={`cursor-pointer transition-all ${
              bedtimeMode
                ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white border-2 border-blue-600'
                : 'bg-gradient-to-r from-yellow-400 to-orange-400 text-white border-2 border-yellow-500'
            }`}
            onClick={handleBedtimeModeToggle}
          >
            {bedtimeMode ? (
              <>
                <Moon className="h-3 w-3 mr-1" />
                Bedtime Mode 🌙
              </>
            ) : (
              <>
                <Sun className="h-3 w-3 mr-1" />
                Normal Mode ☀️
              </>
            )}
          </Badge>
        </div>

        <div className="flex items-center gap-3">
          {!isPlaying && !isPaused ? (
            <Button
              onClick={handlePlay}
              className="rounded-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all font-bold text-lg px-6 py-6"
            >
              <Play className="h-5 w-5 mr-2" />
              Play Story 🎧
            </Button>
          ) : (
            <>
              {isPaused ? (
                <Button
                  onClick={handlePlay}
                  className="rounded-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 shadow-lg font-bold px-6 py-6"
                >
                  <Play className="h-5 w-5 mr-2" />
                  Resume ▶️
                </Button>
              ) : (
                <Button
                  onClick={handlePause}
                  className="rounded-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 shadow-lg font-bold px-6 py-6"
                >
                  <Pause className="h-5 w-5 mr-2" />
                  Pause ⏸️
                </Button>
              )}
              <Button
                onClick={handleStop}
                variant="outline"
                className="rounded-full border-2 border-red-400 hover:bg-red-100 text-red-600 font-bold px-6 py-6"
              >
                <Square className="h-4 w-4 mr-2" />
                Stop ⏹️
              </Button>
            </>
          )}
        </div>

        {bedtimeMode && (
          <div className="mt-2 p-3 rounded-xl bg-blue-100 border-2 border-blue-300">
            <p className="text-sm text-blue-800 font-semibold flex items-center gap-2">
              <Moon className="h-4 w-4" />
              Bedtime Mode: Slower, calmer narration for peaceful sleep 😴
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

