'use client'

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, ArrowRight, Star, Clock, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { useWizard } from '../wizard-context'
import { TemplateCard } from '../template-card'
import { STORY_TEMPLATES, type StoryTemplate } from '@/lib/stories/templates'

interface StepTemplateProps {
  disabled?: boolean
}

type FilterCategory = 'all' | 'favorites' | 'suggested' | StoryTemplate['category']

const FILTER_OPTIONS: { id: FilterCategory; label: string; emoji?: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'suggested', label: 'Suggested', emoji: '✨' },
  { id: 'favorites', label: 'Favorites', emoji: '⭐' },
  { id: 'bedtime', label: 'Calming', emoji: '🌙' },
  { id: 'adventure', label: 'Adventure', emoji: '🗺️' },
  { id: 'educational', label: 'Educational', emoji: '📚' },
  { id: 'fantasy', label: 'Fantasy', emoji: '✨' },
  { id: 'friendship', label: 'Friendship', emoji: '👫' },
  { id: 'growth', label: 'Growth', emoji: '🌱' },
]

// Time-aware template suggestions
function getTimeOfDay(): 'morning' | 'afternoon' | 'evening' {
  const hour = new Date().getHours()
  if (hour >= 18 || hour < 6) return 'evening'
  if (hour >= 6 && hour < 12) return 'morning'
  return 'afternoon'
}

const TIME_SUGGESTIONS: Record<string, { templates: string[]; label: string; emoji: string }> = {
  evening: {
    templates: ['bedtime-story', 'magical-discovery', 'growth-story'],
    label: 'Perfect for bedtime',
    emoji: '🌙',
  },
  morning: {
    templates: ['learning-adventure', 'hero-journey', 'classic-adventure'],
    label: 'Great for morning',
    emoji: '☀️',
  },
  afternoon: {
    templates: ['classic-adventure', 'friendship-tale', 'animal-companion'],
    label: 'Fun for afternoon',
    emoji: '🌤️',
  },
}

export function StepTemplate({ disabled }: StepTemplateProps) {
  const {
    formData,
    updateFormData,
    preferences,
    savePreference,
    addFavoriteTemplate,
    removeFavoriteTemplate,
    prevStep,
    nextStep,
    validateStep,
  } = useWizard()

  const [filter, setFilter] = useState<FilterCategory>('all')

  // Get time-aware suggestions
  const timeOfDay = getTimeOfDay()
  const timeSuggestion = TIME_SUGGESTIONS[timeOfDay]
  const suggestedTemplateIds = timeSuggestion.templates

  // Filter templates
  const filteredTemplates = useMemo(() => {
    if (filter === 'all') return STORY_TEMPLATES
    if (filter === 'suggested') {
      return STORY_TEMPLATES.filter((t) => suggestedTemplateIds.includes(t.id))
    }
    if (filter === 'favorites') {
      return STORY_TEMPLATES.filter((t) => preferences.favoriteTemplates.includes(t.id))
    }
    return STORY_TEMPLATES.filter((t) => t.category === filter)
  }, [filter, preferences.favoriteTemplates, suggestedTemplateIds])

  // Check if a template is suggested for current time
  const isSuggested = (templateId: string) => suggestedTemplateIds.includes(templateId)

  const handleTemplateSelect = (templateId: string) => {
    updateFormData('templateId', templateId)
    savePreference('lastTemplateId', templateId)
  }

  const handleFavoriteToggle = (templateId: string) => {
    if (preferences.favoriteTemplates.includes(templateId)) {
      removeFavoriteTemplate(templateId)
    } else {
      addFavoriteTemplate(templateId)
    }
  }

  const canProceed = validateStep(1)

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Choose a story template</h2>
        <p className="text-gray-500">
          Pick a template that matches the mood you want for{' '}
          <span className="font-medium text-purple-600">
            {formData.isMultiChild
              ? formData.children.map((c) => c.name).join(' & ')
              : formData.childName}
          </span>
          &apos;s story
        </p>
      </div>

      {/* Filter buttons */}
      <div className="flex flex-wrap justify-center gap-2 mb-6">
        {FILTER_OPTIONS.map((option) => {
          const isActive = filter === option.id
          const hasFavorites =
            option.id === 'favorites' && preferences.favoriteTemplates.length > 0

          // Hide favorites filter if no favorites
          if (option.id === 'favorites' && preferences.favoriteTemplates.length === 0) {
            return null
          }

          return (
            <Button
              key={option.id}
              type="button"
              variant={isActive ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter(option.id)}
              disabled={disabled}
              className={cn(
                'rounded-full px-4 transition-all',
                isActive && 'bg-purple-500 hover:bg-purple-600',
                option.id === 'favorites' && hasFavorites && !isActive && 'border-yellow-300 text-yellow-700'
              )}
            >
              {option.emoji && <span className="mr-1">{option.emoji}</span>}
              {option.label}
              {option.id === 'favorites' && (
                <span className="ml-1 text-xs">({preferences.favoriteTemplates.length})</span>
              )}
            </Button>
          )
        })}
      </div>

      {/* Template grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredTemplates.map((template, index) => (
          <motion.div
            key={template.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <TemplateCard
              template={template}
              selected={formData.templateId === template.id}
              favorite={preferences.favoriteTemplates.includes(template.id)}
              suggested={isSuggested(template.id) ? timeSuggestion : undefined}
              onClick={() => handleTemplateSelect(template.id)}
              onFavoriteClick={() => handleFavoriteToggle(template.id)}
              disabled={disabled}
            />
          </motion.div>
        ))}
      </div>

      {/* Empty state for favorites */}
      {filter === 'favorites' && filteredTemplates.length === 0 && (
        <div className="text-center py-12">
          <Star className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No favorite templates yet</p>
          <p className="text-sm text-gray-400">Click the star on any template to add it to favorites</p>
        </div>
      )}

      {/* Navigation buttons */}
      <div className="flex gap-3 pt-6">
        <Button
          type="button"
          variant="outline"
          onClick={prevStep}
          disabled={disabled}
          className="flex-1 py-6 text-lg font-semibold rounded-xl"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back
        </Button>
        <Button
          type="button"
          onClick={nextStep}
          disabled={disabled || !canProceed}
          className={cn(
            'flex-1 py-6 text-lg font-semibold rounded-xl transition-all',
            canProceed
              ? 'bg-purple-500 hover:bg-purple-600 text-white'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          )}
        >
          Continue
          <ArrowRight className="w-5 h-5 ml-2" />
        </Button>
      </div>
    </motion.div>
  )
}
