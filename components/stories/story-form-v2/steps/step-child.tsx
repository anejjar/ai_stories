'use client'

import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { User, Users, Plus, X, Check, Crown, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { useWizard } from '../wizard-context'
import { useAuth } from '@/hooks/use-auth'
import { QuickCreate } from '../quick-create'
import { StoryInsights } from '../story-insights'
import type { Child } from '@/types'

interface StepChildProps {
  disabled?: boolean
}

export function StepChild({ disabled }: StepChildProps) {
  const { userProfile, getAccessToken } = useAuth()
  const {
    formData,
    updateFormData,
    fieldValidation,
    touchField,
    childProfiles,
    setChildProfiles,
    loadingProfiles,
    setLoadingProfiles,
    preferences,
    savePreference,
    nextStep,
    validateStep,
    setIsAutoSelecting,
  } = useWizard()

  const isFamily = userProfile?.subscriptionTier === 'family'

  // Fetch child profiles for Family Plan users
  useEffect(() => {
    if (isFamily && childProfiles.length === 0 && !loadingProfiles) {
      fetchChildProfiles()
    }
  }, [isFamily, userProfile, childProfiles.length, loadingProfiles])

  // Auto-select last used profile
  useEffect(() => {
    if (
      isFamily &&
      childProfiles.length > 0 &&
      preferences.lastProfileId &&
      !formData.selectedProfileId
    ) {
      const lastProfile = childProfiles.find((p) => p.id === preferences.lastProfileId)
      if (lastProfile) {
        // Mark as auto-selecting to prevent draft save
        setIsAutoSelecting(true)
        handleProfileSelect(preferences.lastProfileId, false) // false = not user action
        // Reset auto-selecting flag after a short delay
        setTimeout(() => setIsAutoSelecting(false), 100)
      }
    }
  }, [childProfiles, preferences.lastProfileId, setIsAutoSelecting])

  const fetchChildProfiles = async () => {
    setLoadingProfiles(true)
    try {
      const token = await getAccessToken()
      const response = await fetch('/api/child-profiles', {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (response.ok) {
        const result = await response.json()
        // API returns { success: true, data: { profiles: [...] } }
        setChildProfiles(result.data?.profiles || [])
      }
    } catch (error) {
      console.error('Error fetching profiles:', error)
    } finally {
      setLoadingProfiles(false)
    }
  }

  const handleProfileSelect = (profileId: string, isUserAction: boolean = true) => {
    const profile = childProfiles.find((p) => p.id === profileId)
    if (profile) {
      updateFormData('selectedProfileId', profileId, isUserAction)
      updateFormData('selectedProfile', profile, isUserAction)
      updateFormData('childName', profile.name, isUserAction)
      if (isUserAction) {
        savePreference('lastProfileId', profileId)
      }
    }
  }

  const handleNameChange = (value: string) => {
    updateFormData('childName', value)
    if (!fieldValidation.childName.touched) {
      touchField('childName')
    }
  }

  const handleMultiChildToggle = (isMulti: boolean) => {
    updateFormData('isMultiChild', isMulti)
    if (isMulti && formData.children.length === 1 && !formData.children[0].name) {
      // Transfer single child name to multi-child
      updateFormData('children', [
        { name: formData.childName, adjectives: formData.adjectives, appearance: undefined },
      ])
    }
  }

  const handleAddChild = () => {
    if (formData.children.length < 5) {
      updateFormData('children', [
        ...formData.children,
        { name: '', adjectives: [], appearance: undefined },
      ])
    }
  }

  const handleRemoveChild = (index: number) => {
    if (formData.children.length > 1) {
      updateFormData(
        'children',
        formData.children.filter((_, i) => i !== index)
      )
    }
  }

  const handleChildNameChange = (index: number, name: string) => {
    const newChildren = [...formData.children]
    newChildren[index] = { ...newChildren[index], name }
    updateFormData('children', newChildren)
  }

  const handleChildProfileSelect = (index: number, profileId: string) => {
    const profile = childProfiles.find((p) => p.id === profileId)
    if (profile) {
      const newChildren = [...formData.children]
      newChildren[index] = {
        ...newChildren[index],
        name: profile.name,
        appearance: profile.appearance || undefined,
        profileId: profile.id,
      }
      updateFormData('children', newChildren)
    }
  }

  const isNameValid = formData.childName.trim().length >= 2
  const canProceed = validateStep(0)

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Who is this story for?</h2>
        <p className="text-gray-500">Enter your child&apos;s name to personalize the story</p>
      </div>

      {/* Quick Create */}
      <QuickCreate onQuickCreate={() => {}} disabled={disabled} />

      {/* Single/Multi-child toggle
      <div className="flex justify-center gap-2 mb-6">
        <Button
          type="button"
          variant={!formData.isMultiChild ? 'default' : 'outline'}
          onClick={() => handleMultiChildToggle(false)}
          disabled={disabled}
          className={cn(
            'flex items-center gap-2 rounded-full px-6',
            !formData.isMultiChild && 'bg-purple-500 hover:bg-purple-600'
          )}
        >
          <User className="w-4 h-4" />
          One Child
        </Button>
        <Button
          type="button"
          variant={formData.isMultiChild ? 'default' : 'outline'}
          onClick={() => handleMultiChildToggle(true)}
          disabled={disabled}
          className={cn(
            'flex items-center gap-2 rounded-full px-6',
            formData.isMultiChild && 'bg-purple-500 hover:bg-purple-600'
          )}
        >
          <Users className="w-4 h-4" />
          Multiple Children
        </Button>
      </div>
       */}

      {/* Single child form */}
      {!formData.isMultiChild && (
        <div className="space-y-4">
          {/* Family Plan: Profile selector */}
          {isFamily && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Crown className="w-4 h-4 text-yellow-500" />
                Select saved profile (optional)
              </label>
              {loadingProfiles ? (
                <div className="flex items-center gap-2 p-3 rounded-xl border-2 border-yellow-200 bg-yellow-50 text-gray-500">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-yellow-500 border-t-transparent" />
                  Loading profiles...
                </div>
              ) : childProfiles.length > 0 ? (
                <Select
                  value={formData.selectedProfileId || ''}
                  onValueChange={handleProfileSelect}
                  disabled={disabled}
                >
                  <SelectTrigger className="rounded-xl border-2 border-yellow-200 bg-yellow-50">
                    <SelectValue placeholder="Choose a child profile..." />
                  </SelectTrigger>
                  <SelectContent>
                    {childProfiles.map((profile) => (
                      <SelectItem key={profile.id} value={profile.id}>
                        <div className="flex items-center gap-2">
                          <span>{profile.name}</span>
                          {profile.ai_generated_image_url && (
                            <span className="text-xs text-green-600">(Photo)</span>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <div className="p-3 rounded-xl border-2 border-gray-200 bg-gray-50 text-gray-500 text-sm">
                  No child profiles found.{' '}
                  <a href="/profile" className="text-purple-600 hover:underline">
                    Create one in your profile
                  </a>
                </div>
              )}
            </div>
          )}

          {/* Name input */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Child&apos;s name</label>
            <div className="relative">
              <Input
                value={formData.childName}
                onChange={(e) => handleNameChange(e.target.value)}
                onBlur={() => touchField('childName')}
                placeholder="Enter your child's name"
                disabled={disabled}
                className={cn(
                  'text-lg py-6 px-4 rounded-xl border-2 transition-all',
                  isNameValid && fieldValidation.childName.touched
                    ? 'border-green-400 bg-green-50 focus:border-green-500'
                    : fieldValidation.childName.touched && !isNameValid
                    ? 'border-red-300 bg-red-50 focus:border-red-400'
                    : 'border-gray-200 focus:border-purple-400'
                )}
              />
              {/* Validation indicator */}
              {fieldValidation.childName.touched && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  {isNameValid ? (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center"
                    >
                      <Check className="w-4 h-4 text-white" />
                    </motion.div>
                  ) : (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="w-6 h-6 bg-red-400 rounded-full flex items-center justify-center"
                    >
                      <X className="w-4 h-4 text-white" />
                    </motion.div>
                  )}
                </div>
              )}
            </div>
            {/* Error message */}
            {fieldValidation.childName.touched && !isNameValid && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-sm text-red-500"
              >
                Name must be at least 2 characters
              </motion.p>
            )}
          </div>

          {/* Story Insights - show when child name is valid */}
          {isNameValid && (
            <StoryInsights
              childName={formData.childName}
              profileId={formData.selectedProfileId}
            />
          )}
        </div>
      )}

      {/* Multi-child form */}
      {formData.isMultiChild && (
        <div className="space-y-4">
          {formData.children.map((child, index) => (
            <Card key={index} className="p-4 border-2 border-gray-200 rounded-xl">
              <div className="flex items-center justify-between mb-3">
                <span className="font-medium text-gray-700">Child {index + 1}</span>
                {formData.children.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveChild(index)}
                    disabled={disabled}
                    className="text-red-500 hover:text-red-600 hover:bg-red-50"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>

              {/* Profile selector for multi-child */}
              {isFamily && childProfiles.length > 0 && (
                <Select
                  value={child.profileId || ''}
                  onValueChange={(value) => handleChildProfileSelect(index, value)}
                  disabled={disabled}
                >
                  <SelectTrigger className="mb-3 rounded-xl border-2 border-yellow-200 bg-yellow-50">
                    <SelectValue placeholder="Select profile (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    {childProfiles.map((profile) => (
                      <SelectItem key={profile.id} value={profile.id}>
                        {profile.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              {/* Name input */}
              <Input
                value={child.name}
                onChange={(e) => handleChildNameChange(index, e.target.value)}
                placeholder="Child's name"
                disabled={disabled}
                className={cn(
                  'rounded-xl border-2 transition-all',
                  child.name.trim().length >= 2
                    ? 'border-green-400 bg-green-50'
                    : 'border-gray-200'
                )}
              />
            </Card>
          ))}

          {/* Add child button */}
          {formData.children.length < 5 && (
            <Button
              type="button"
              variant="outline"
              onClick={handleAddChild}
              disabled={disabled}
              className="w-full rounded-xl border-2 border-dashed border-gray-300 hover:border-purple-400 hover:bg-purple-50"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Another Child ({formData.children.length}/5)
            </Button>
          )}
        </div>
      )}

      {/* Continue button */}
      <div className="pt-6">
        <Button
          type="button"
          onClick={nextStep}
          disabled={disabled || !canProceed}
          className={cn(
            'w-full py-6 text-lg font-semibold rounded-xl transition-all',
            canProceed
              ? 'bg-purple-500 hover:bg-purple-600 text-white'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          )}
        >
          Continue to Template
          <ArrowRight className="w-5 h-5 ml-2" />
        </Button>
      </div>
    </motion.div>
  )
}
