'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, ArrowRight, Plus, X, Check, Crown, BookOpen, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { useWizard } from '../wizard-context'
import { IllustrationPreview } from '../illustration-preview'
import { useAuth } from '@/hooks/use-auth'
import { getTemplateById } from '@/lib/stories/templates'

interface StepCustomizeProps {
  disabled?: boolean
  onShowUpgrade?: (tier: 'pro' | 'family') => void
}

// Adjective categories
const ADJECTIVE_CATEGORIES = {
  personality: {
    label: 'Personality',
    emoji: '💫',
    adjectives: ['brave', 'kind', 'curious', 'creative', 'gentle', 'clever'],
  },
  interests: {
    label: 'Interests',
    emoji: '🎯',
    adjectives: ['adventurous', 'imaginative', 'playful', 'artistic', 'musical', 'sporty'],
  },
  traits: {
    label: 'Traits',
    emoji: '✨',
    adjectives: ['helpful', 'friendly', 'determined', 'patient', 'caring', 'funny'],
  },
}

export function StepCustomize({ disabled, onShowUpgrade }: StepCustomizeProps) {
  const { userProfile } = useAuth()
  const {
    formData,
    updateFormData,
    fieldValidation,
    touchField,
    prevStep,
    nextStep,
    validateStep,
    getIllustrationMode,
  } = useWizard()

  const [customAdjective, setCustomAdjective] = useState('')

  const isFamily = userProfile?.subscriptionTier === 'family'
  const selectedTemplate = formData.templateId ? getTemplateById(formData.templateId) : null
  const illustrationMode = getIllustrationMode()

  // Get suggested adjectives based on template
  const getSuggestedAdjectives = () => {
    if (!selectedTemplate) return []
    const templateCategory = selectedTemplate.category
    switch (templateCategory) {
      case 'adventure':
        return ['brave', 'adventurous', 'determined']
      case 'bedtime':
        return ['gentle', 'peaceful', 'dreamy']
      case 'educational':
        return ['curious', 'clever', 'thoughtful']
      case 'fantasy':
        return ['imaginative', 'magical', 'creative']
      case 'friendship':
        return ['kind', 'friendly', 'caring']
      case 'growth':
        return ['brave', 'determined', 'growing']
      default:
        return ['kind', 'brave', 'curious']
    }
  }

  const suggestedAdjectives = getSuggestedAdjectives()

  const handleAddAdjective = (adj: string) => {
    const trimmed = adj.trim().toLowerCase()
    if (trimmed && !formData.adjectives.includes(trimmed)) {
      if (formData.isMultiChild) {
        // Add to first child for now (could be improved)
        const newChildren = [...formData.children]
        if (newChildren[0]) {
          newChildren[0] = {
            ...newChildren[0],
            adjectives: [...newChildren[0].adjectives, trimmed],
          }
          updateFormData('children', newChildren)
        }
      } else {
        updateFormData('adjectives', [...formData.adjectives, trimmed])
      }
      touchField('adjectives')
    }
  }

  const handleRemoveAdjective = (adj: string) => {
    if (formData.isMultiChild) {
      const newChildren = [...formData.children]
      if (newChildren[0]) {
        newChildren[0] = {
          ...newChildren[0],
          adjectives: newChildren[0].adjectives.filter((a) => a !== adj),
        }
        updateFormData('children', newChildren)
      }
    } else {
      updateFormData(
        'adjectives',
        formData.adjectives.filter((a) => a !== adj)
      )
    }
  }

  const handleCustomAdjectiveSubmit = () => {
    if (customAdjective.trim()) {
      handleAddAdjective(customAdjective)
      setCustomAdjective('')
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleCustomAdjectiveSubmit()
    }
  }

  const handleChildAdjectiveAdd = (childIndex: number, adj: string) => {
    const trimmed = adj.trim().toLowerCase()
    if (trimmed) {
      const newChildren = [...formData.children]
      if (newChildren[childIndex] && !newChildren[childIndex].adjectives.includes(trimmed)) {
        newChildren[childIndex] = {
          ...newChildren[childIndex],
          adjectives: [...newChildren[childIndex].adjectives, trimmed],
        }
        updateFormData('children', newChildren)
      }
    }
  }

  const handleChildAdjectiveRemove = (childIndex: number, adj: string) => {
    const newChildren = [...formData.children]
    if (newChildren[childIndex]) {
      newChildren[childIndex] = {
        ...newChildren[childIndex],
        adjectives: newChildren[childIndex].adjectives.filter((a) => a !== adj),
      }
      updateFormData('children', newChildren)
    }
  }

  // Get current adjectives based on mode
  const currentAdjectives = formData.isMultiChild
    ? formData.children[0]?.adjectives || []
    : formData.adjectives

  const canProceed = validateStep(2)

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Customize the story</h2>
        <p className="text-gray-500">
          Describe{' '}
          <span className="font-medium text-purple-600">
            {formData.isMultiChild
              ? formData.children.map((c) => c.name).join(' & ')
              : formData.childName}
          </span>{' '}
          to make the story personal
        </p>
      </div>

      {/* Suggested adjectives */}
      {suggestedAdjectives.length > 0 && (
        <div className="mb-4">
          <p className="text-sm text-gray-500 mb-2">
            <Sparkles className="w-4 h-4 inline mr-1 text-purple-500" />
            Suggested for {selectedTemplate?.name}:
          </p>
          <div className="flex flex-wrap gap-2">
            {suggestedAdjectives.map((adj) => (
              <Button
                key={adj}
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleAddAdjective(adj)}
                disabled={disabled || currentAdjectives.includes(adj)}
                className={cn(
                  'rounded-full border-2 border-purple-200 text-purple-700 hover:bg-purple-50',
                  currentAdjectives.includes(adj) && 'opacity-50'
                )}
              >
                {adj}
                {!currentAdjectives.includes(adj) && <Plus className="w-3 h-3 ml-1" />}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Single child adjectives */}
      {!formData.isMultiChild && (
        <Card className="p-4 border-2 border-yellow-200 bg-yellow-50 rounded-xl">
          <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            💫 How would you describe {formData.childName}?
          </h3>

          {/* Selected adjectives */}
          {formData.adjectives.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {formData.adjectives.map((adj) => (
                <Badge
                  key={adj}
                  className="flex items-center gap-1 bg-gradient-to-r from-pink-400 to-purple-400 text-white px-3 py-1"
                >
                  {adj}
                  <button
                    type="button"
                    onClick={() => handleRemoveAdjective(adj)}
                    disabled={disabled}
                    className="ml-1 hover:text-red-200"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}

          {/* Adjective categories */}
          {Object.entries(ADJECTIVE_CATEGORIES).map(([key, category]) => (
            <div key={key} className="mb-3">
              <p className="text-xs text-gray-500 mb-2">
                {category.emoji} {category.label}
              </p>
              <div className="flex flex-wrap gap-2">
                {category.adjectives.map((adj) => (
                  <Button
                    key={adj}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleAddAdjective(adj)}
                    disabled={disabled || formData.adjectives.includes(adj)}
                    className={cn(
                      'rounded-full text-xs',
                      formData.adjectives.includes(adj)
                        ? 'bg-purple-100 border-purple-300 text-purple-700'
                        : 'border-gray-200 hover:border-purple-300'
                    )}
                  >
                    {adj}
                  </Button>
                ))}
              </div>
            </div>
          ))}

          {/* Custom adjective input */}
          <div className="flex gap-2 mt-4">
            <Input
              value={customAdjective}
              onChange={(e) => setCustomAdjective(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Add your own..."
              disabled={disabled}
              className="rounded-xl border-2 border-gray-200"
            />
            <Button
              type="button"
              onClick={handleCustomAdjectiveSubmit}
              disabled={disabled || !customAdjective.trim()}
              className="rounded-xl bg-purple-500 hover:bg-purple-600"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>

          {/* Validation message */}
          {formData.adjectives.length === 0 && (
            <p className="text-sm text-amber-600 mt-3">
              Select at least one adjective to continue
            </p>
          )}
        </Card>
      )}

      {/* Multi-child adjectives */}
      {formData.isMultiChild && (
        <div className="space-y-4">
          {formData.children.map((child, index) => (
            <Card key={index} className="p-4 border-2 border-gray-200 rounded-xl">
              <h3 className="font-semibold text-gray-900 mb-3">
                💫 Describe {child.name}
              </h3>

              {/* Selected adjectives */}
              {child.adjectives.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {child.adjectives.map((adj) => (
                    <Badge
                      key={adj}
                      className="flex items-center gap-1 bg-gradient-to-r from-pink-400 to-purple-400 text-white"
                    >
                      {adj}
                      <button
                        type="button"
                        onClick={() => handleChildAdjectiveRemove(index, adj)}
                        disabled={disabled}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}

              {/* Quick adjective buttons */}
              <div className="flex flex-wrap gap-2">
                {['brave', 'kind', 'curious', 'creative', 'adventurous', 'friendly'].map((adj) => (
                  <Button
                    key={adj}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleChildAdjectiveAdd(index, adj)}
                    disabled={disabled || child.adjectives.includes(adj)}
                    className="rounded-full text-xs"
                  >
                    {adj}
                  </Button>
                ))}
              </div>

              {child.adjectives.length === 0 && (
                <p className="text-sm text-amber-600 mt-2">Select at least one adjective</p>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Moral/Lesson (optional) */}
      <Card className="p-4 border-2 border-green-200 bg-green-50 rounded-xl">
        <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-green-600" />
          Story lesson (optional)
        </h3>
        <p className="text-sm text-gray-500 mb-3">
          What message or lesson should the story teach?
        </p>
        <Textarea
          value={formData.moral}
          onChange={(e) => updateFormData('moral', e.target.value)}
          placeholder="e.g., Always be kind to others, It's okay to make mistakes..."
          disabled={disabled}
          className="rounded-xl border-2 border-green-200 bg-white min-h-[80px]"
        />
      </Card>

      {/* Illustrated Book Option (Family Plan) */}
      {isFamily && formData.selectedProfile && (
        <Card className="p-4 border-2 border-purple-200 bg-purple-50 rounded-xl">
          <div className="flex items-start gap-3 mb-4">
            <div className="p-2 rounded-lg bg-purple-100">
              <Crown className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Generate Illustrated Book</h3>
              <p className="text-sm text-gray-500">
                Create a beautiful picture book with AI-generated illustrations
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer ml-auto">
              <input
                type="checkbox"
                checked={formData.generateIllustratedBook}
                onChange={(e) => updateFormData('generateIllustratedBook', e.target.checked)}
                disabled={disabled}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-500"></div>
            </label>
          </div>

          {formData.generateIllustratedBook && (
            <IllustrationPreview
              currentMode={illustrationMode}
              profile={formData.selectedProfile}
            />
          )}
        </Card>
      )}

      {/* Family Plan Upsell */}
      {!isFamily && (
        <Card className="p-4 border-2 border-yellow-200 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-yellow-100">
              <Crown className="w-5 h-5 text-yellow-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900">Want illustrated stories?</h3>
              <p className="text-sm text-gray-500 mb-3">
                Upgrade to Family Plan to generate beautiful AI-illustrated picture books
              </p>
              <Button
                type="button"
                onClick={() => onShowUpgrade?.('family')}
                disabled={disabled}
                className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white rounded-full"
              >
                <Crown className="w-4 h-4 mr-2" />
                Unlock Family Plan
              </Button>
            </div>
          </div>
        </Card>
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
          Review Story
          <ArrowRight className="w-5 h-5 ml-2" />
        </Button>
      </div>
    </motion.div>
  )
}
