'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { X, Lock, Crown, Plus, Users, UserCircle } from 'lucide-react'
import Link from 'next/link'
import { useAuth } from '@/hooks/use-auth'
import { useTrial } from '@/hooks/use-trial'
import { STORY_TEMPLATES, type StoryTemplate } from '@/lib/stories/templates'
import type { StoryInput, ChildAppearance, Child, ChildProfile } from '@/types'

const PREDEFINED_ADJECTIVES = [
  'brave',
  'kind',
  'curious',
  'creative',
  'adventurous',
  'helpful',
  'imaginative',
  'friendly',
  'clever',
  'gentle',
  'playful',
  'determined',
]

const STORY_THEMES = [
  'Adventure',
  'Fantasy',
  'Nature',
  'Friendship',
  'Learning',
  'Courage',
  'Kindness',
  'Discovery',
  'Magic',
  'Animals',
  'Space',
  'Ocean',
  'Superhero',
  'Princess',
  'Pirates',
  'Dinosaurs',
  'Fairies',
  'Robots',
  'Time Travel',
  'Mystery',
  'Sports',
  'Music',
  'Art',
  'Cooking',
  'Gardening',
]

interface StoryFormProps {
  onSubmit: (data: StoryInput) => Promise<void>
  disabled?: boolean
  loading?: boolean
}

export function StoryForm({ onSubmit, disabled, loading }: StoryFormProps) {
  const { userProfile, getAccessToken } = useAuth()
  const { canCreateStory } = useTrial()
  const [isMultiChild, setIsMultiChild] = useState(false)
  const [childName, setChildName] = useState('')
  const [adjectives, setAdjectives] = useState<string[]>([])
  const [customAdjective, setCustomAdjective] = useState('')
  const [children, setChildren] = useState<Child[]>([
    { name: '', adjectives: [], appearance: undefined },
  ])
  const [theme, setTheme] = useState('')
  const [moral, setMoral] = useState('')
  const [templateId, setTemplateId] = useState<string | undefined>(undefined)
  const [error, setError] = useState('')
  const [appearance, setAppearance] = useState<ChildAppearance>({
    skinTone: undefined,
    hairColor: undefined,
    hairStyle: undefined,
  })
  const [childProfiles, setChildProfiles] = useState<ChildProfile[]>([])
  const [selectedProfileId, setSelectedProfileId] = useState<string>('')
  const [loadingProfiles, setLoadingProfiles] = useState(false)
  
  const isProMax = userProfile?.subscriptionTier === 'pro_max'
  const isPro = userProfile?.subscriptionTier === 'pro' || isProMax
  const showProMaxUpsell = !isProMax

  // Fetch child profiles for PRO MAX users
  useEffect(() => {
    if (isProMax) {
      fetchChildProfiles()
    }
  }, [isProMax])

  const fetchChildProfiles = async () => {
    if (!isProMax) return

    setLoadingProfiles(true)
    try {
      const token = await getAccessToken()
      if (!token) return

      const response = await fetch('/api/child-profiles', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const data = await response.json()
      if (data.success && data.data?.profiles) {
        setChildProfiles(data.data.profiles)
      }
    } catch (err) {
      console.error('Failed to fetch child profiles:', err)
    } finally {
      setLoadingProfiles(false)
    }
  }

  // Handle profile selection - populate form with profile data
  const handleProfileSelect = (profileId: string) => {
    const profile = childProfiles.find((p) => p.id === profileId)
    if (profile) {
      setSelectedProfileId(profileId)
      setChildName(profile.name)
      // setAdjectives([]) // Keep existing adjectives or clear? Let's keep them to avoid annoyance
      if (profile.appearance) {
        setAppearance(profile.appearance)
      }
    } else if (profileId === 'none') {
      setSelectedProfileId('')
      setChildName('')
      setAppearance({})
    }
  }

  // Multi-child profile selection
  const handleChildProfileSelect = (index: number, profileId: string) => {
    const profile = childProfiles.find((p) => p.id === profileId)
    if (profile) {
      const updated = [...children]
      updated[index] = {
        ...updated[index],
        name: profile.name,
        appearance: profile.appearance,
        profileId: profile.id // Assuming we might use this later
      }
      setChildren(updated)
    }
  }

  const handleAddAdjective = (adjective: string) => {
    if (adjective && !adjectives.includes(adjective.toLowerCase())) {
      setAdjectives([...adjectives, adjective.toLowerCase()])
    }
  }

  const handleRemoveAdjective = (adjective: string) => {
    setAdjectives(adjectives.filter((adj) => adj !== adjective))
  }

  const handleAddCustomAdjective = () => {
    if (customAdjective.trim()) {
      handleAddAdjective(customAdjective.trim())
      setCustomAdjective('')
    }
  }

  // Multi-child handlers
  const handleAddChild = () => {
    if (children.length < 5) { // Limit to 5 children
      setChildren([...children, { name: '', adjectives: [], appearance: undefined }])
    }
  }

  const handleRemoveChild = (index: number) => {
    if (children.length > 1) {
      setChildren(children.filter((_, i) => i !== index))
    }
  }

  const handleUpdateChild = (index: number, field: keyof Child, value: any) => {
    const updated = [...children]
    updated[index] = { ...updated[index], [field]: value }
    setChildren(updated)
  }

  const handleAddChildAdjective = (childIndex: number, adjective: string) => {
    const child = children[childIndex]
    if (adjective && !child.adjectives.includes(adjective.toLowerCase())) {
      handleUpdateChild(childIndex, 'adjectives', [...child.adjectives, adjective.toLowerCase()])
    }
  }

  const handleRemoveChildAdjective = (childIndex: number, adjective: string) => {
    const child = children[childIndex]
    handleUpdateChild(childIndex, 'adjectives', child.adjectives.filter((adj) => adj !== adjective))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Validation
    if (isMultiChild) {
      // Multi-child validation
      const validChildren = children.filter((child) => child.name.trim() && child.adjectives.length > 0)
      if (validChildren.length === 0) {
        setError('Please add at least one child with a name and adjectives')
        return
      }
      if (validChildren.length !== children.length) {
        setError('Please complete all child information (name and at least one adjective)')
        return
      }
    } else {
      // Single-child validation
      if (!childName.trim()) {
        setError('Please enter your child\'s name')
        return
      }

      if (adjectives.length === 0) {
        setError('Please select at least one adjective')
        return
      }
    }

    if (!theme) {
      setError('Please select a theme')
      return
    }

    const storyInput: StoryInput = isMultiChild
      ? {
          children: children.map((child) => ({
            name: child.name.trim(),
            adjectives: child.adjectives,
            appearance: isProMax && (child.appearance?.skinTone || child.appearance?.hairColor || child.appearance?.hairStyle)
              ? child.appearance
              : undefined,
            profileId: child.profileId
          })),
          theme,
          moral: moral.trim() || undefined,
          generateImages: isProMax && false,
          templateId: templateId || undefined,
        }
      : {
          childName: childName.trim(),
          adjectives,
          theme,
          moral: moral.trim() || undefined,
          generateImages: isProMax && false,
          templateId: templateId || undefined,
          appearance: isProMax && (appearance.skinTone || appearance.hairColor || appearance.hairStyle) 
            ? appearance 
            : undefined,
        }

    try {
      await onSubmit(storyInput)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create story')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-4 text-sm text-red-700 bg-red-100 border-2 border-red-300 rounded-2xl font-semibold">
          ⚠️ {error}
        </div>
      )}

      {/* Multi-Child Toggle - PRO Feature */}
      {isPro && (
        <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border-2 border-blue-200">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={isMultiChild}
              onChange={(e) => {
                setIsMultiChild(e.target.checked)
                if (e.target.checked) {
                  // Initialize with current single child data
                  setChildren([{ name: childName, adjectives, appearance, profileId: selectedProfileId || undefined }])
                } else {
                  // Reset to single child mode
                  if (children.length > 0) {
                    setChildName(children[0].name)
                    setAdjectives(children[0].adjectives)
                    setAppearance(children[0].appearance || {})
                    if (children[0].profileId) setSelectedProfileId(children[0].profileId)
                  }
                  setChildren([{ name: '', adjectives: [], appearance: undefined }])
                }
              }}
              disabled={disabled || loading}
              className="w-5 h-5 rounded border-2 border-blue-400 text-blue-600 focus:ring-blue-500"
            />
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-600" />
              <span className="font-bold text-gray-800">
                Create Story with Multiple Children (PRO Feature) 👨‍👩‍👧‍👦
              </span>
            </div>
          </label>
          <p className="text-sm text-gray-600 mt-2 ml-8 font-semibold">
            Perfect for siblings or friends! Create stories featuring multiple children as heroes together. ✨
          </p>
        </div>
      )}

      {!isMultiChild ? (
        <>
          {/* Single Child Form */}
          <div className="space-y-4">
            {isProMax && childProfiles.length > 0 && (
              <div className="bg-purple-50 p-4 rounded-xl border-2 border-purple-200 mb-4">
                <label className="text-sm font-bold text-purple-800 mb-2 block flex items-center gap-2">
                  <UserCircle className="h-4 w-4" />
                  Select Saved Profile (Optional)
                </label>
                <Select value={selectedProfileId || 'none'} onValueChange={handleProfileSelect} disabled={disabled || loading}>
                  <SelectTrigger className="rounded-xl border-2 border-purple-300 bg-white">
                    <SelectValue placeholder="Choose a child profile..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None (Enter manually)</SelectItem>
                    {childProfiles.map((profile) => (
                      <SelectItem key={profile.id} value={profile.id}>
                        {profile.name} {profile.nickname ? `(${profile.nickname})` : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="childName" className="text-base font-bold text-gray-700 flex items-center gap-2">
                <span className="text-2xl">👶</span>
                Child's Name <span className="text-red-500">*</span>
              </label>
              <Input
                id="childName"
                type="text"
                placeholder="Enter your child's name ✨"
                value={childName}
                onChange={(e) => setChildName(e.target.value)}
                disabled={disabled || loading}
                required
                className="rounded-xl border-2 border-pink-300 focus:border-pink-500 text-lg py-3 px-4"
              />
            </div>
          </div>
        </>
      ) : (
        <>
          {/* Multi-Child Form */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-base font-bold text-gray-700 flex items-center gap-2">
                <span className="text-2xl">👨‍👩‍👧‍👦</span>
                Children <span className="text-red-500">*</span>
              </label>
              {children.length < 5 && (
                <Button
                  type="button"
                  onClick={handleAddChild}
                  disabled={disabled || loading}
                  className="rounded-full border-2 border-blue-400 hover:bg-blue-50 font-bold"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Child
                </Button>
              )}
            </div>
            <p className="text-sm text-gray-600 font-semibold">
              Add up to 5 children to feature in the story! Each child can have their own name and traits. 🎨
            </p>

            {children.map((child, childIndex) => (
              <Card key={childIndex} className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50 p-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-lg text-purple-700">
                      Child {childIndex + 1} 👶
                    </h3>
                    {children.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleRemoveChild(childIndex)}
                        disabled={disabled || loading}
                        className="text-red-600 hover:text-red-700 border-red-300"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  {isProMax && childProfiles.length > 0 && (
                    <div className="mb-2">
                      <Select 
                        value={child.profileId || 'none'} 
                        onValueChange={(val) => handleChildProfileSelect(childIndex, val === 'none' ? '' : val)}
                      >
                        <SelectTrigger className="h-8 text-sm bg-white border-purple-200">
                          <SelectValue placeholder="Load from profile..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">None</SelectItem>
                          {childProfiles.map((profile) => (
                            <SelectItem key={profile.id} value={profile.id}>
                              {profile.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700">
                      Name <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="text"
                      placeholder={`Child ${childIndex + 1}'s name ✨`}
                      value={child.name}
                      onChange={(e) => handleUpdateChild(childIndex, 'name', e.target.value)}
                      disabled={disabled || loading}
                      required
                      className="rounded-xl border-2 border-pink-300 focus:border-pink-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700">
                      Adjectives <span className="text-red-500">*</span>
                    </label>
                    <div className="flex flex-wrap gap-2 mb-2 p-2 bg-yellow-50 rounded-xl border-2 border-yellow-200">
                      {child.adjectives.map((adj) => (
                        <Badge
                          key={adj}
                          variant="secondary"
                          className="flex items-center gap-1 bg-gradient-to-r from-pink-400 to-purple-400 text-white font-bold px-2 py-1 rounded-full border-2 border-pink-500"
                        >
                          {adj}
                          <button
                            type="button"
                            onClick={() => handleRemoveChildAdjective(childIndex, adj)}
                            className="ml-1 hover:text-red-600 transition-colors"
                            disabled={disabled || loading}
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {PREDEFINED_ADJECTIVES.map((adj) => (
                        <Button
                          key={adj}
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleAddChildAdjective(childIndex, adj)}
                          disabled={disabled || loading || child.adjectives.includes(adj)}
                          className="rounded-full border-2 border-purple-300 hover:bg-purple-100 text-xs"
                        >
                          {adj}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Appearance for PRO MAX */}
                  {isProMax && (
                    <div className="space-y-2 pt-2 border-t-2 border-purple-200">
                      <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                        <span className="text-lg">🎨</span>
                        Appearance (Auto-filled from Profile)
                        <Badge className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white text-xs font-bold px-2">
                          PRO MAX
                        </Badge>
                      </label>
                      {child.appearance ? (
                         <div className="text-xs text-gray-600 bg-white p-2 rounded border border-gray-200">
                           {child.appearance.skinTone && `Skin: ${child.appearance.skinTone}, `}
                           {child.appearance.hairColor && `Hair: ${child.appearance.hairColor} `}
                           {child.appearance.hairStyle && `(${child.appearance.hairStyle})`}
                         </div>
                      ) : (
                        <div className="text-xs text-gray-400 italic">No appearance set (images will be random)</div>
                      )}
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </>
      )}

      {/* Single Child Adjectives (only show if not multi-child) */}
      {!isMultiChild && (
        <div className="space-y-3">
        <label className="text-base font-bold text-gray-700 flex items-center gap-2">
          <span className="text-2xl">⭐</span>
          Adjectives <span className="text-red-500">*</span>
        </label>
        <p className="text-sm text-gray-600 mb-3 font-semibold">
          Select or add adjectives that describe your child! 🎨
        </p>
        
        <div className="flex flex-wrap gap-2 mb-3 p-3 bg-yellow-50 rounded-xl border-2 border-yellow-200">
          {adjectives.map((adj) => (
            <Badge
              key={adj}
              variant="secondary"
              className="flex items-center gap-1 bg-gradient-to-r from-pink-400 to-purple-400 text-white font-bold px-3 py-1 rounded-full border-2 border-pink-500"
            >
              {adj}
              <button
                type="button"
                onClick={() => handleRemoveAdjective(adj)}
                className="ml-1 hover:text-red-600 transition-colors"
                disabled={disabled || loading}
              >
                <X className="h-4 w-4" />
              </button>
            </Badge>
          ))}
        </div>

        <div className="flex flex-wrap gap-2 mb-3">
          {PREDEFINED_ADJECTIVES.map((adj) => (
            <Button
              key={adj}
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleAddAdjective(adj)}
              disabled={disabled || loading || adjectives.includes(adj)}
              className="rounded-full border-2 border-purple-300 hover:bg-purple-100 hover:border-purple-500 font-semibold transition-all transform hover:scale-105"
            >
              {adj}
            </Button>
          ))}
        </div>

        <div className="flex gap-2">
          <Input
            type="text"
            placeholder="Add custom adjective ✨"
            value={customAdjective}
            onChange={(e) => setCustomAdjective(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                handleAddCustomAdjective()
              }
            }}
            disabled={disabled || loading}
            className="rounded-xl border-2 border-purple-300 focus:border-purple-500"
          />
          <Button
            type="button"
            variant="outline"
            onClick={handleAddCustomAdjective}
            disabled={disabled || loading || !customAdjective.trim()}
            className="rounded-full border-2 border-purple-400 hover:bg-purple-100 font-bold"
          >
            Add ➕
          </Button>
        </div>
      </div>
      )}

      <div className="space-y-2">
        <label htmlFor="theme" className="text-base font-bold text-gray-700 flex items-center gap-2">
          <span className="text-2xl">🎭</span>
          Theme <span className="text-red-500">*</span>
        </label>
        <Select value={theme} onValueChange={setTheme} disabled={disabled || loading}>
          <SelectTrigger id="theme" className="rounded-xl border-2 border-blue-300 focus:border-blue-500 text-lg py-3">
            <SelectValue placeholder="Select a theme 🎨" />
          </SelectTrigger>
          <SelectContent className="rounded-xl border-2 border-blue-300">
            {STORY_THEMES.map((t) => (
              <SelectItem key={t} value={t} className="font-semibold hover:bg-blue-100">
                {t}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <label htmlFor="template" className="text-base font-bold text-gray-700 flex items-center gap-2">
          <span className="text-2xl">📋</span>
          Story Template (Optional)
        </label>
        <p className="text-sm text-gray-600 mb-2 font-semibold">
          Choose a story structure to guide the narrative! 🎬
        </p>
        <Select value={templateId || 'none'} onValueChange={(value) => setTemplateId(value === 'none' ? undefined : value)} disabled={disabled || loading}>
          <SelectTrigger id="template" className="rounded-xl border-2 border-green-300 focus:border-green-500 text-lg py-3">
            <SelectValue placeholder="Select a template (or leave blank for free-form) 📖" />
          </SelectTrigger>
          <SelectContent className="rounded-xl border-2 border-green-300 max-h-[400px]">
            <SelectItem value="none" className="font-semibold hover:bg-green-100">
              None (Free-form) ✨
            </SelectItem>
            {STORY_TEMPLATES.map((template) => (
              <SelectItem key={template.id} value={template.id} className="font-semibold hover:bg-green-100">
                <div className="flex items-center gap-2">
                  <span>{template.emoji}</span>
                  <div>
                    <div className="font-bold">{template.name}</div>
                    <div className="text-xs text-gray-500">{template.description}</div>
                  </div>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {templateId && (
          <div className="p-3 bg-green-50 rounded-xl border-2 border-green-200">
            {(() => {
              const selectedTemplate = STORY_TEMPLATES.find((t) => t.id === templateId)
              return selectedTemplate ? (
                <div className="space-y-1">
                  <p className="text-sm font-bold text-gray-800">
                    {selectedTemplate.emoji} {selectedTemplate.name}
                  </p>
                  <p className="text-xs text-gray-600">{selectedTemplate.description}</p>
                  <p className="text-xs text-gray-500">
                    Structure: {selectedTemplate.structure}
                  </p>
                </div>
              ) : null
            })()}
          </div>
        )}
      </div>

      <div className="space-y-2">
        <label htmlFor="moral" className="text-base font-bold text-gray-700 flex items-center gap-2">
          <span className="text-2xl">💡</span>
          Moral or Lesson (Optional)
        </label>
        <p className="text-sm text-gray-600 mb-2 font-semibold">
          What lesson or moral should the story teach? 📖
        </p>
        <textarea
          id="moral"
          className="flex min-h-[100px] w-full rounded-xl border-2 border-green-300 bg-background px-4 py-3 text-base ring-offset-background placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-400 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 focus:border-green-500"
          placeholder="e.g., The importance of sharing, Being kind to others... ✨"
          value={moral}
          onChange={(e) => setMoral(e.target.value)}
          disabled={disabled || loading}
        />
      </div>

      {/* Child Profile Info - PRO MAX Only */}
      {isProMax && (
        <div className="space-y-4 p-6 rounded-2xl border-4 border-purple-300 bg-gradient-to-br from-purple-50 to-pink-50">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-2xl">👨‍👩‍👧‍👦</span>
            <label className="text-base font-bold text-gray-700">
              Child Profiles
            </label>
            <Badge className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white font-bold border-2 border-yellow-500 rounded-full px-3">
              PRO MAX 👑
            </Badge>
          </div>
          <p className="text-sm text-gray-600 mb-4 font-semibold">
            Create and manage child profiles in your <Link href="/profile" className="text-purple-600 hover:text-purple-700 underline font-bold">Profile</Link> page! 
            You can customize each child's appearance and upload photos (safely processed by AI). 
            Then use those profiles when creating stories! ✨
          </p>
        </div>
      )}

      {/* Soft Upsell: PRO MAX Image Generation */}
      {showProMaxUpsell && (
        <div className="relative p-6 rounded-2xl border-4 border-yellow-300 bg-gradient-to-br from-yellow-50 to-orange-50 overflow-hidden">
          <div className="absolute top-2 right-2">
            <Crown className="h-6 w-6 text-yellow-500 animate-sparkle" />
          </div>
          <div className="flex items-start gap-4">
            <div className="text-4xl">🎨</div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-bold text-lg text-gray-800">Add Magical Illustrations</h3>
                <Badge className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white font-bold border-2 border-yellow-500 rounded-full px-3">
                  PRO MAX 👑
                </Badge>
              </div>
              <p className="text-sm text-gray-700 mb-3 font-semibold">
                Turn your story into a beautiful picture book with AI-generated illustrations featuring your child! ✨
              </p>
              <Button
                type="button"
                variant="outline"
                disabled
                className="rounded-full border-2 border-yellow-400 bg-white/80 font-bold cursor-not-allowed opacity-75"
              >
                <Lock className="h-4 w-4 mr-2" />
                Unlock with PRO MAX 🚀
              </Button>
            </div>
          </div>
        </div>
      )}

      <Button
        type="submit"
        className="w-full rounded-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-lg py-6 font-bold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
        disabled={disabled || loading || !canCreateStory}
        size="lg"
      >
        {loading ? (
          <>
            <span className="animate-spin mr-2">⏳</span>
            Creating Story...
          </>
        ) : !canCreateStory ? (
          <>
            <Lock className="h-5 w-5 mr-2" />
            Trial Limit Reached - Upgrade to Continue 🚀
          </>
        ) : (
          <>
            ✨ Create Story! 🎉
          </>
        )}
      </Button>
    </form>
  )
}
