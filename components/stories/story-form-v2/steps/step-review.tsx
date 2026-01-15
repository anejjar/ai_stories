'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  Sparkles,
  User,
  Users,
  BookOpen,
  Palette,
  Crown,
  Clock,
  Edit2,
  Wand2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { useWizard } from '../wizard-context'
import { useAuth } from '@/hooks/use-auth'
import { useTrial } from '@/hooks/use-trial'
import { getTemplateById } from '@/lib/stories/templates'

interface StepReviewProps {
  disabled?: boolean
  loading?: boolean
  onSubmit: () => Promise<void>
  onShowUpgrade?: (tier: 'pro' | 'family') => void
}

const LOADING_MESSAGES = [
  'Generating plot...',
  'Creating characters...',
  'Weaving magic...',
  'Writing the story...',
  'Adding sparkles...',
  'Polishing the tale...',
  'Almost there...',
]

export function StepReview({ disabled, loading, onSubmit, onShowUpgrade }: StepReviewProps) {
  const { userProfile } = useAuth()
  const { canCreateStory } = useTrial()
  const { formData, goToStep, isFormComplete, getIllustrationMode } = useWizard()

  const [loadingMessage, setLoadingMessage] = useState(LOADING_MESSAGES[0])

  const isFamily = userProfile?.subscriptionTier === 'family'
  const selectedTemplate = formData.templateId ? getTemplateById(formData.templateId) : null
  const illustrationMode = getIllustrationMode()

  // Rotate loading messages
  useEffect(() => {
    if (!loading) return

    let index = 0
    const interval = setInterval(() => {
      index = (index + 1) % LOADING_MESSAGES.length
      setLoadingMessage(LOADING_MESSAGES[index])
    }, 2500)

    return () => clearInterval(interval)
  }, [loading])

  // Calculate estimated time
  const estimatedTime = formData.generateIllustratedBook ? '2-3 minutes' : '30 seconds'

  const handleSubmit = async () => {
    if (!canCreateStory) {
      onShowUpgrade?.('pro')
      return
    }
    await onSubmit()
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Review your story</h2>
        <p className="text-gray-500">Make sure everything looks good before generating</p>
      </div>

      {/* Summary cards */}
      <div className="space-y-4">
        {/* Child info */}
        <Card className="p-4 border-2 border-gray-200 rounded-xl">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-purple-100">
                {formData.isMultiChild ? (
                  <Users className="w-5 h-5 text-purple-600" />
                ) : (
                  <User className="w-5 h-5 text-purple-600" />
                )}
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">
                  {formData.isMultiChild ? 'Characters' : 'Main Character'}
                </h3>
                <p className="text-lg font-medium text-purple-600 mt-1">
                  {formData.isMultiChild
                    ? formData.children.map((c) => c.name).join(', ')
                    : formData.childName}
                </p>
                <div className="flex flex-wrap gap-1 mt-2">
                  {(formData.isMultiChild
                    ? formData.children[0]?.adjectives || []
                    : formData.adjectives
                  ).map((adj) => (
                    <Badge key={adj} variant="secondary" className="text-xs">
                      {adj}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => goToStep(0)}
              disabled={disabled || loading}
              className="text-purple-600 hover:text-purple-700"
            >
              <Edit2 className="w-4 h-4" />
            </Button>
          </div>
        </Card>

        {/* Template */}
        <Card className="p-4 border-2 border-gray-200 rounded-xl">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-green-100">
                <BookOpen className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Story Template</h3>
                <p className="text-lg font-medium text-green-600 mt-1">
                  {selectedTemplate?.emoji} {selectedTemplate?.name}
                </p>
                <p className="text-sm text-gray-500 mt-1">{selectedTemplate?.description}</p>
              </div>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => goToStep(1)}
              disabled={disabled || loading}
              className="text-green-600 hover:text-green-700"
            >
              <Edit2 className="w-4 h-4" />
            </Button>
          </div>
        </Card>

        {/* Moral/Lesson (if provided) */}
        {formData.moral && (
          <Card className="p-4 border-2 border-gray-200 rounded-xl">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-blue-100">
                  <Sparkles className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Story Lesson</h3>
                  <p className="text-gray-600 mt-1">{formData.moral}</p>
                </div>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => goToStep(2)}
                disabled={disabled || loading}
                className="text-blue-600 hover:text-blue-700"
              >
                <Edit2 className="w-4 h-4" />
              </Button>
            </div>
          </Card>
        )}

        {/* Illustrated book info (Family Plan) */}
        {isFamily && formData.generateIllustratedBook && (
          <Card className="p-4 border-2 border-yellow-200 bg-yellow-50 rounded-xl">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-yellow-100">
                  <Crown className="w-5 h-5 text-yellow-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Illustrated Book</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    AI-generated illustrations will be created for each scene
                  </p>
                  {illustrationMode && (
                    <Badge className="mt-2 bg-yellow-200 text-yellow-800">
                      {illustrationMode === 'character-photo' && 'Photo-based character'}
                      {illustrationMode === 'character-appearance' && 'Styled character'}
                      {illustrationMode === 'environment' && 'Scene-focused'}
                    </Badge>
                  )}
                </div>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => goToStep(2)}
                disabled={disabled || loading}
                className="text-yellow-600 hover:text-yellow-700"
              >
                <Edit2 className="w-4 h-4" />
              </Button>
            </div>
          </Card>
        )}

        {/* Estimated time */}
        <Card className="p-4 border-2 border-gray-100 bg-gray-50 rounded-xl">
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-gray-400" />
            <div>
              <p className="text-sm text-gray-500">Estimated generation time</p>
              <p className="font-medium text-gray-700">{estimatedTime}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Navigation buttons */}
      <div className="flex gap-3 pt-6">
        <Button
          type="button"
          variant="outline"
          onClick={() => goToStep(2)}
          disabled={disabled || loading}
          className="flex-1 py-6 text-lg font-semibold rounded-xl"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back
        </Button>
        <Button
          type="button"
          onClick={handleSubmit}
          disabled={disabled || loading || !isFormComplete}
          className={cn(
            'flex-1 py-6 text-lg font-semibold rounded-xl transition-all',
            'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white',
            (loading || !isFormComplete) && 'opacity-70'
          )}
        >
          {loading ? (
            <>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="mr-2"
              >
                <Sparkles className="w-5 h-5" />
              </motion.div>
              {loadingMessage}
            </>
          ) : !canCreateStory ? (
            <>
              <Crown className="w-5 h-5 mr-2" />
              Upgrade to Create
            </>
          ) : (
            <>
              <Wand2 className="w-5 h-5 mr-2" />
              Create Story
            </>
          )}
        </Button>
      </div>
    </motion.div>
  )
}
