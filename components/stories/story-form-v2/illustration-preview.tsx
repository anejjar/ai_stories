'use client'

import { motion } from 'framer-motion'
import { User, Palette, Mountain, Check, Camera, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ChildProfile } from '@/types'

type IllustrationMode = 'character-photo' | 'character-appearance' | 'environment' | null

interface IllustrationPreviewProps {
  currentMode: IllustrationMode
  profile: ChildProfile | null
  onUpgradeClick?: () => void
}

const MODES = [
  {
    id: 'character-photo' as const,
    name: 'Character Photo',
    icon: Camera,
    description: 'Your child appears in illustrations based on their uploaded photo',
    quality: 'Best Quality',
    requirement: 'Photo uploaded & processed',
    color: 'purple',
    preview: '/illustrations/character-photo-preview.png',
  },
  {
    id: 'character-appearance' as const,
    name: 'Character Style',
    icon: Palette,
    description: 'Character based on appearance settings (skin tone, hair color)',
    quality: 'Great Quality',
    requirement: 'Appearance settings configured',
    color: 'blue',
    preview: '/illustrations/character-appearance-preview.png',
  },
  {
    id: 'environment' as const,
    name: 'Scene Focus',
    icon: Mountain,
    description: 'Beautiful illustrated scenes and environments',
    quality: 'Standard',
    requirement: 'No photo or appearance needed',
    color: 'green',
    preview: '/illustrations/environment-preview.png',
  },
]

export function IllustrationPreview({ currentMode, profile, onUpgradeClick }: IllustrationPreviewProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="w-5 h-5 text-purple-500" />
        <h3 className="font-bold text-gray-900">Illustration Mode</h3>
      </div>

      {/* Mode cards */}
      <div className="space-y-3">
        {MODES.map((mode) => {
          const isActive = currentMode === mode.id
          const Icon = mode.icon

          // Determine if this mode is available
          let isAvailable = false
          if (profile) {
            if (mode.id === 'character-photo') {
              isAvailable = !!(profile.ai_generated_image_url && profile.ai_description)
            } else if (mode.id === 'character-appearance') {
              isAvailable = !!(
                profile.appearance &&
                (profile.appearance.skinTone || profile.appearance.hairColor || profile.appearance.hairStyle)
              )
            } else {
              isAvailable = true // Environment is always available
            }
          }

          const colorClasses = {
            purple: {
              active: 'border-purple-500 bg-purple-50',
              icon: 'text-purple-500 bg-purple-100',
              badge: 'bg-purple-100 text-purple-700',
            },
            blue: {
              active: 'border-blue-500 bg-blue-50',
              icon: 'text-blue-500 bg-blue-100',
              badge: 'bg-blue-100 text-blue-700',
            },
            green: {
              active: 'border-green-500 bg-green-50',
              icon: 'text-green-500 bg-green-100',
              badge: 'bg-green-100 text-green-700',
            },
          }[mode.color]

          return (
            <motion.div
              key={mode.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                'relative rounded-xl border-2 p-4 transition-all duration-300',
                isActive ? colorClasses.active : 'border-gray-200 bg-white',
                !isAvailable && !isActive && 'opacity-50'
              )}
            >
              <div className="flex items-start gap-3">
                {/* Icon */}
                <div className={cn('p-2 rounded-lg', colorClasses.icon)}>
                  <Icon className="w-5 h-5" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-gray-900">{mode.name}</h4>
                    <span className={cn('text-xs px-2 py-0.5 rounded-full', colorClasses.badge)}>
                      {mode.quality}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{mode.description}</p>

                  {/* Requirement status */}
                  <div className="flex items-center gap-2 text-xs">
                    {isAvailable ? (
                      <>
                        <Check className="w-3 h-3 text-green-500" />
                        <span className="text-green-600">{mode.requirement}</span>
                      </>
                    ) : (
                      <>
                        <span className="w-3 h-3 rounded-full border-2 border-gray-300" />
                        <span className="text-gray-400">{mode.requirement}</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Active indicator */}
                {isActive && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center shrink-0"
                  >
                    <Check className="w-4 h-4 text-white" />
                  </motion.div>
                )}
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Current mode explanation */}
      {currentMode && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mt-4 p-4 rounded-xl bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-100"
        >
          <p className="text-sm text-gray-700">
            {currentMode === 'character-photo' && (
              <>
                <strong>{profile?.name}</strong> will be featured in every illustration using their
                uploaded photo for consistent, personalized artwork.
              </>
            )}
            {currentMode === 'character-appearance' && (
              <>
                <strong>{profile?.name}</strong> will appear as a stylized character based on their
                appearance settings (hair, skin tone).
              </>
            )}
            {currentMode === 'environment' && (
              <>
                Your story will feature beautiful illustrated scenes. Add a photo or appearance
                settings to include <strong>{profile?.name}</strong> in the illustrations.
              </>
            )}
          </p>
        </motion.div>
      )}

      {/* No profile selected */}
      {!profile && (
        <div className="p-4 rounded-xl bg-yellow-50 border border-yellow-200">
          <div className="flex items-start gap-3">
            <User className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-yellow-800 font-medium mb-1">
                Select a child profile to enable illustrations
              </p>
              <p className="text-xs text-yellow-600">
                Choose a profile in Step 1 to unlock illustrated book generation.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
