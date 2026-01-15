'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Star, Heart, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import type { StoryTemplate } from '@/lib/stories/templates'

interface TemplateCardProps {
  template: StoryTemplate
  selected: boolean
  favorite?: boolean
  suggested?: { label: string; emoji: string }
  onClick: () => void
  onFavoriteClick?: () => void
  disabled?: boolean
}

// Sample story snippets for each template
const SAMPLE_SNIPPETS: Record<string, string> = {
  'classic-adventure': 'Emma discovered a mysterious map hidden in the old oak tree. Little did she know, this would be the beginning of an incredible adventure...',
  'bedtime-story': 'As the stars began to twinkle in the velvet sky, a gentle breeze carried whispers of sweet dreams through the window...',
  'friendship-tale': 'On the first day at the new playground, two pairs of eyes met across the sandbox. A smile was all it took to begin a beautiful friendship...',
  'magical-discovery': 'The ordinary garden suddenly shimmered with an extraordinary glow. Magic was hiding in plain sight all along...',
  'learning-adventure': 'Every question led to another discovery, and every discovery sparked a new wonder about the amazing world around us...',
  'hero-journey': 'When the call for help echoed through the land, only one young hero had the courage to answer. Today would change everything...',
  'animal-companion': 'The fluffy creature peeked out from behind the bush, its curious eyes meeting those of its new best friend...',
  'growth-story': 'At first, the challenge seemed impossible. But with each small step forward, something amazing began to happen inside...',
  'princess-prince': 'In a castle beyond the mountains, where magic danced in every corridor, a royal adventure was about to begin...',
  'space-adventure': 'The countdown began: 10... 9... 8... The stars were waiting, and countless wonders lay hidden among them...',
}

// Category colors and labels
const CATEGORY_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  adventure: { bg: 'bg-orange-100', text: 'text-orange-700', label: 'Adventure' },
  bedtime: { bg: 'bg-indigo-100', text: 'text-indigo-700', label: 'Calming' },
  educational: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Educational' },
  fantasy: { bg: 'bg-purple-100', text: 'text-purple-700', label: 'Fantasy' },
  friendship: { bg: 'bg-pink-100', text: 'text-pink-700', label: 'Friendship' },
  growth: { bg: 'bg-green-100', text: 'text-green-700', label: 'Growth' },
}

export function TemplateCard({
  template,
  selected,
  favorite,
  suggested,
  onClick,
  onFavoriteClick,
  disabled,
}: TemplateCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const categoryStyle = CATEGORY_STYLES[template.category] || CATEGORY_STYLES.adventure
  const snippet = SAMPLE_SNIPPETS[template.id] || 'An amazing story awaits...'

  return (
    <motion.div
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        onClick={disabled ? undefined : onClick}
        onKeyDown={(e) => {
          if (!disabled && (e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault()
            onClick()
          }
        }}
        className={cn(
          'relative w-full text-left rounded-2xl border-2 p-4 transition-all duration-300',
          'focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2',
          selected
            ? 'border-purple-500 bg-purple-50 shadow-lg shadow-purple-100'
            : 'border-gray-200 bg-white hover:border-purple-300 hover:shadow-md',
          disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
        )}
      >
        {/* Favorite button */}
        {onFavoriteClick && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onFavoriteClick()
            }}
            className={cn(
              'absolute top-3 right-3 p-1.5 rounded-full transition-colors',
              favorite
                ? 'text-yellow-500 bg-yellow-50'
                : 'text-gray-300 hover:text-yellow-400 hover:bg-yellow-50'
            )}
          >
            <Star className={cn('w-4 h-4', favorite && 'fill-current')} />
          </button>
        )}

        {/* Header with emoji and name */}
        <div className="flex items-start gap-3 mb-3">
          <span className="text-3xl">{template.emoji}</span>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-gray-900 truncate">{template.name}</h3>
            <p className="text-sm text-gray-500 line-clamp-2">{template.description}</p>
          </div>
        </div>

        {/* Category badge */}
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <Badge className={cn('text-xs', categoryStyle.bg, categoryStyle.text)}>
            {categoryStyle.label}
          </Badge>
          {suggested && (
            <Badge className="text-xs bg-amber-100 text-amber-700 border border-amber-200">
              {suggested.emoji} {suggested.label}
            </Badge>
          )}
          <div className="flex items-center gap-1 text-xs text-gray-400">
            <Clock className="w-3 h-3" />
            {template.ageRange}
          </div>
        </div>

        {/* Themes */}
        <div className="flex flex-wrap gap-1 mb-3">
          {template.suggestedThemes.slice(0, 3).map((theme) => (
            <span
              key={theme}
              className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600"
            >
              {theme}
            </span>
          ))}
        </div>

        {/* Story structure (visible on hover) */}
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: isHovered || selected ? 'auto' : 0, opacity: isHovered || selected ? 1 : 0 }}
          transition={{ duration: 0.2 }}
          className="overflow-hidden"
        >
          <div className="pt-3 border-t border-gray-100">
            <p className="text-xs text-gray-400 mb-1">Story structure:</p>
            <p className="text-xs text-gray-600 mb-2">{template.structure}</p>

            {/* Sample snippet */}
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-3 border border-purple-100">
              <p className="text-xs text-gray-400 mb-1 flex items-center gap-1">
                <Heart className="w-3 h-3 text-pink-400" />
                Preview
              </p>
              <p className="text-xs text-gray-700 italic leading-relaxed">
                &ldquo;{snippet}&rdquo;
              </p>
            </div>
          </div>
        </motion.div>

        {/* Selected indicator */}
        {selected && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-2 -right-2 w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center"
          >
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}
