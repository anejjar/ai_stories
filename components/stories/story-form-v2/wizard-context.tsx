'use client'

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import type { Child, ChildProfile, ChildAppearance, StoryInput } from '@/types'

// Wizard steps
export const WIZARD_STEPS = ['Child', 'Template', 'Customize', 'Review'] as const
export type WizardStep = (typeof WIZARD_STEPS)[number]

// Form data interface
export interface WizardFormData {
  // Step 1: Child info
  childName: string
  children: Child[]
  isMultiChild: boolean
  selectedProfileId: string | null
  selectedProfile: ChildProfile | null

  // Step 2: Template
  templateId: string | null

  // Step 3: Customization
  adjectives: string[]
  moral: string
  generateIllustratedBook: boolean
}

// Preferences stored in localStorage
export interface WizardPreferences {
  lastTemplateId: string | null
  lastProfileId: string | null
  favoriteTemplates: string[]
}

// Validation state
export interface WizardValidation {
  step1Valid: boolean
  step2Valid: boolean
  step3Valid: boolean
}

// Field-level validation for real-time feedback
export interface FieldValidation {
  childName: { valid: boolean; touched: boolean; error?: string }
  template: { valid: boolean; touched: boolean; error?: string }
  adjectives: { valid: boolean; touched: boolean; error?: string }
}

// Context value interface
interface WizardContextValue {
  // Current step
  currentStep: number
  setCurrentStep: (step: number) => void
  nextStep: () => void
  prevStep: () => void
  goToStep: (step: number) => void

  // Form data
  formData: WizardFormData
  updateFormData: <K extends keyof WizardFormData>(key: K, value: WizardFormData[K]) => void

  // Validation
  validation: WizardValidation
  fieldValidation: FieldValidation
  validateStep: (step: number) => boolean
  touchField: (field: keyof FieldValidation) => void

  // Preferences
  preferences: WizardPreferences
  savePreference: <K extends keyof WizardPreferences>(key: K, value: WizardPreferences[K]) => void
  addFavoriteTemplate: (templateId: string) => void
  removeFavoriteTemplate: (templateId: string) => void

  // Child profiles
  childProfiles: ChildProfile[]
  setChildProfiles: (profiles: ChildProfile[]) => void
  loadingProfiles: boolean
  setLoadingProfiles: (loading: boolean) => void

  // Illustration mode
  getIllustrationMode: () => 'character-photo' | 'character-appearance' | 'environment' | null

  // Submission
  getStoryInput: () => StoryInput
  isFormComplete: boolean

  // Draft persistence
  hasDraft: boolean
  restoreDraft: () => void
  clearDraft: () => void
  setIsAutoSelecting: (isAuto: boolean) => void

  // Last successful settings (for Quick Create)
  lastSettings: LastStorySettings | null
  saveLastSettings: () => void
  applyLastSettings: () => void
  hasLastSettings: boolean
}

// Draft data for persistence
export interface WizardDraft {
  formData: Omit<WizardFormData, 'selectedProfile'>
  currentStep: number
  savedAt: number
}

// Last successful story settings
export interface LastStorySettings {
  childName: string
  profileId: string | null
  templateId: string
  adjectives: string[]
  savedAt: number
}

const WizardContext = createContext<WizardContextValue | null>(null)

const PREFERENCES_KEY = 'story-form-v2-preferences'
const DRAFT_KEY = 'story-form-v2-draft'
const LAST_SETTINGS_KEY = 'story-form-v2-last-settings'
const DRAFT_DISMISSED_KEY = 'story-form-v2-draft-dismissed'

// Initial form data
const initialFormData: WizardFormData = {
  childName: '',
  children: [{ name: '', adjectives: [], appearance: undefined }],
  isMultiChild: false,
  selectedProfileId: null,
  selectedProfile: null,
  templateId: null,
  adjectives: [],
  moral: '',
  generateIllustratedBook: false,
}

// Initial field validation
const initialFieldValidation: FieldValidation = {
  childName: { valid: false, touched: false },
  template: { valid: false, touched: false },
  adjectives: { valid: false, touched: false },
}

export function WizardProvider({ children }: { children: ReactNode }) {
  const [currentStep, setCurrentStep] = useState(0)
  const [formData, setFormData] = useState<WizardFormData>(initialFormData)
  const [fieldValidation, setFieldValidation] = useState<FieldValidation>(initialFieldValidation)
  const [childProfiles, setChildProfiles] = useState<ChildProfile[]>([])
  const [loadingProfiles, setLoadingProfiles] = useState(false)
  const [preferences, setPreferences] = useState<WizardPreferences>({
    lastTemplateId: null,
    lastProfileId: null,
    favoriteTemplates: [],
  })
  const [hasDraft, setHasDraft] = useState(false)
  const [lastSettings, setLastSettings] = useState<LastStorySettings | null>(null)
  const [userHasMadeChanges, setUserHasMadeChanges] = useState(false)
  const [isAutoSelecting, setIsAutoSelecting] = useState(false)

  // Load preferences, draft, and last settings from localStorage on mount
  useEffect(() => {
    try {
      // Load preferences
      const stored = localStorage.getItem(PREFERENCES_KEY)
      if (stored) {
        const parsed = JSON.parse(stored) as WizardPreferences
        setPreferences(parsed)
      }

      // Check if user dismissed the modal
      let isDismissed = false
      const dismissed = localStorage.getItem(DRAFT_DISMISSED_KEY)
      if (dismissed) {
        // Check if it was dismissed recently (within 1 hour)
        const dismissedTime = parseInt(dismissed, 10)
        const oneHourAgo = Date.now() - 60 * 60 * 1000
        if (dismissedTime > oneHourAgo) {
          // Modal was recently dismissed, don't show it
          isDismissed = true
        } else {
          // Dismissal expired, clear it
          localStorage.removeItem(DRAFT_DISMISSED_KEY)
        }
      }

      // Check for existing draft
      const draftStored = localStorage.getItem(DRAFT_KEY)
      if (draftStored) {
        const draft = JSON.parse(draftStored) as WizardDraft
        // Only consider draft valid if:
        // 1. Less than 24 hours old
        // 2. User progressed beyond step 0 (has template or adjectives selected)
        // 3. Has user-initiated changes (not just auto-selection)
        // 4. Modal was not recently dismissed
        const isRecent = Date.now() - draft.savedAt < 24 * 60 * 60 * 1000
        const hasMeaningfulProgress = draft.formData.templateId || draft.formData.adjectives.length > 0
        // Check if draft has user changes (stored in draft metadata)
        const hasUserChanges = (draft as any).hasUserChanges !== false // Default to true for old drafts
        
        if (isRecent && draft.formData.childName && hasMeaningfulProgress && hasUserChanges && !isDismissed) {
          setHasDraft(true)
        } else {
          // If dismissed, clear the draft
          if (isDismissed) {
            localStorage.removeItem(DRAFT_KEY)
          }
        }
      }

      // Load last successful settings
      const lastSettingsStored = localStorage.getItem(LAST_SETTINGS_KEY)
      if (lastSettingsStored) {
        const settings = JSON.parse(lastSettingsStored) as LastStorySettings
        setLastSettings(settings)
      }
    } catch {
      // Ignore localStorage errors
    }
  }, [])

  // Save preferences to localStorage
  const savePreferencesToStorage = useCallback((newPrefs: WizardPreferences) => {
    try {
      localStorage.setItem(PREFERENCES_KEY, JSON.stringify(newPrefs))
    } catch {
      // Ignore localStorage errors
    }
  }, [])

  // Auto-save draft when form data changes (only if user made changes)
  useEffect(() => {
    // Don't save if we're auto-selecting (e.g., profile auto-selection)
    if (isAutoSelecting) {
      return
    }

    // Only save if there's meaningful data AND user has made changes
    if (userHasMadeChanges && (formData.childName || formData.templateId || formData.adjectives.length > 0)) {
      try {
        const draft: WizardDraft & { hasUserChanges: boolean } = {
          formData: {
            childName: formData.childName,
            children: formData.children,
            isMultiChild: formData.isMultiChild,
            selectedProfileId: formData.selectedProfileId,
            templateId: formData.templateId,
            adjectives: formData.adjectives,
            moral: formData.moral,
            generateIllustratedBook: formData.generateIllustratedBook,
          },
          currentStep,
          savedAt: Date.now(),
          hasUserChanges: true,
        }
        localStorage.setItem(DRAFT_KEY, JSON.stringify(draft))
        setHasDraft(true)
      } catch {
        // Ignore localStorage errors
      }
    }
  }, [formData, currentStep, userHasMadeChanges, isAutoSelecting])

  // Restore draft from localStorage
  const restoreDraft = useCallback(() => {
    try {
      const draftStored = localStorage.getItem(DRAFT_KEY)
      if (draftStored) {
        const draft = JSON.parse(draftStored) as WizardDraft
        setFormData((prev) => ({
          ...prev,
          ...draft.formData,
          selectedProfile: null, // Will be populated when profiles load
        }))
        setCurrentStep(draft.currentStep)
        setHasDraft(false)
        // Clear dismissed flag since user chose to resume
        localStorage.removeItem(DRAFT_DISMISSED_KEY)
        setUserHasMadeChanges(true) // Mark that we're restoring user changes
      }
    } catch {
      // Ignore localStorage errors
    }
  }, [])

  // Clear draft from localStorage and reset form
  const clearDraft = useCallback(() => {
    try {
      localStorage.removeItem(DRAFT_KEY)
      // Mark that user dismissed the modal so it doesn't show again after refresh
      localStorage.setItem(DRAFT_DISMISSED_KEY, Date.now().toString())
      setHasDraft(false)
      setUserHasMadeChanges(false)
      // Reset form data to initial state
      setFormData(initialFormData)
      setCurrentStep(0)
      setFieldValidation(initialFieldValidation)
    } catch {
      // Ignore localStorage errors
    }
  }, [])

  // Save current settings as last successful settings
  const saveLastSettings = useCallback(() => {
    if (formData.childName && formData.templateId && formData.adjectives.length > 0) {
      const settings: LastStorySettings = {
        childName: formData.childName,
        profileId: formData.selectedProfileId,
        templateId: formData.templateId,
        adjectives: formData.adjectives,
        savedAt: Date.now(),
      }
      try {
        localStorage.setItem(LAST_SETTINGS_KEY, JSON.stringify(settings))
        setLastSettings(settings)
        // Clear draft after successful save
        localStorage.removeItem(DRAFT_KEY)
        setHasDraft(false)
      } catch {
        // Ignore localStorage errors
      }
    }
  }, [formData])

  // Apply last settings (for Quick Create)
  const applyLastSettings = useCallback(() => {
    if (lastSettings) {
      setFormData((prev) => ({
        ...prev,
        childName: lastSettings.childName,
        selectedProfileId: lastSettings.profileId,
        templateId: lastSettings.templateId,
        adjectives: lastSettings.adjectives,
      }))
      // Go to review step
      setCurrentStep(3)
    }
  }, [lastSettings])

  const hasLastSettings = !!lastSettings && !!lastSettings.templateId

  // Update form data
  const updateFormData = useCallback(<K extends keyof WizardFormData>(key: K, value: WizardFormData[K], isUserAction: boolean = true) => {
    // Track if this is a user-initiated change (not auto-selection)
    if (isUserAction && !isAutoSelecting) {
      setUserHasMadeChanges(true)
    }

    setFormData((prev) => ({ ...prev, [key]: value }))

    // Update field validation in real-time
    if (key === 'childName') {
      const name = value as string
      setFieldValidation((prev) => ({
        ...prev,
        childName: {
          valid: name.trim().length >= 2,
          touched: prev.childName.touched,
          error: name.trim().length < 2 && prev.childName.touched ? 'Name must be at least 2 characters' : undefined,
        },
      }))
    } else if (key === 'templateId') {
      setFieldValidation((prev) => ({
        ...prev,
        template: {
          valid: !!value,
          touched: true,
        },
      }))
    } else if (key === 'adjectives') {
      const adjs = value as string[]
      setFieldValidation((prev) => ({
        ...prev,
        adjectives: {
          valid: adjs.length > 0,
          touched: prev.adjectives.touched,
          error: adjs.length === 0 && prev.adjectives.touched ? 'Select at least one adjective' : undefined,
        },
      }))
    }
  }, [isAutoSelecting])

  // Touch a field (mark as interacted)
  const touchField = useCallback((field: keyof FieldValidation) => {
    setFieldValidation((prev) => ({
      ...prev,
      [field]: { ...prev[field], touched: true },
    }))
  }, [])

  // Validate a specific step
  const validateStep = useCallback((step: number): boolean => {
    switch (step) {
      case 0: // Child step
        if (formData.isMultiChild) {
          return formData.children.every((child) => child.name.trim().length >= 2)
        }
        return formData.childName.trim().length >= 2
      case 1: // Template step
        return !!formData.templateId
      case 2: // Customize step
        if (formData.isMultiChild) {
          return formData.children.every((child) => child.adjectives.length > 0)
        }
        return formData.adjectives.length > 0
      case 3: // Review step
        return true
      default:
        return false
    }
  }, [formData])

  // Validation state
  const validation: WizardValidation = {
    step1Valid: validateStep(0),
    step2Valid: validateStep(1),
    step3Valid: validateStep(2),
  }

  // Navigation
  const nextStep = useCallback(() => {
    if (currentStep < WIZARD_STEPS.length - 1 && validateStep(currentStep)) {
      setCurrentStep((prev) => prev + 1)
    }
  }, [currentStep, validateStep])

  const prevStep = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1)
    }
  }, [currentStep])

  const goToStep = useCallback((step: number) => {
    // Can only go to completed steps or current step
    if (step >= 0 && step <= currentStep) {
      setCurrentStep(step)
    } else if (step > currentStep) {
      // Check if all previous steps are valid
      let canGo = true
      for (let i = 0; i < step; i++) {
        if (!validateStep(i)) {
          canGo = false
          break
        }
      }
      if (canGo) {
        setCurrentStep(step)
      }
    }
  }, [currentStep, validateStep])

  // Preferences management
  const savePreference = useCallback(<K extends keyof WizardPreferences>(key: K, value: WizardPreferences[K]) => {
    setPreferences((prev) => {
      const newPrefs = { ...prev, [key]: value }
      savePreferencesToStorage(newPrefs)
      return newPrefs
    })
  }, [savePreferencesToStorage])

  const addFavoriteTemplate = useCallback((templateId: string) => {
    setPreferences((prev) => {
      if (prev.favoriteTemplates.includes(templateId)) return prev
      const newPrefs = { ...prev, favoriteTemplates: [...prev.favoriteTemplates, templateId] }
      savePreferencesToStorage(newPrefs)
      return newPrefs
    })
  }, [savePreferencesToStorage])

  const removeFavoriteTemplate = useCallback((templateId: string) => {
    setPreferences((prev) => {
      const newPrefs = { ...prev, favoriteTemplates: prev.favoriteTemplates.filter((id) => id !== templateId) }
      savePreferencesToStorage(newPrefs)
      return newPrefs
    })
  }, [savePreferencesToStorage])

  // Get illustration mode based on profile
  const getIllustrationMode = useCallback((): 'character-photo' | 'character-appearance' | 'environment' | null => {
    const profile = formData.selectedProfile
    if (!profile) return null

    if (profile.ai_generated_image_url && profile.ai_description) {
      return 'character-photo'
    } else if (
      profile.appearance &&
      (profile.appearance.skinTone || profile.appearance.hairColor || profile.appearance.hairStyle)
    ) {
      return 'character-appearance'
    } else {
      return 'environment'
    }
  }, [formData.selectedProfile])

  // Get story input for submission
  const getStoryInput = useCallback((): StoryInput => {
    const input: StoryInput = {
      theme: formData.templateId || 'Adventure',
      templateId: formData.templateId || undefined,
      moral: formData.moral || undefined,
      generateImages: formData.generateIllustratedBook,
    }

    if (formData.isMultiChild) {
      input.children = formData.children.map((child) => ({
        name: child.name,
        adjectives: child.adjectives,
        appearance: child.appearance,
        profileId: child.profileId,
      }))
    } else {
      input.childName = formData.childName
      input.adjectives = formData.adjectives
      if (formData.selectedProfile) {
        input.appearance = formData.selectedProfile.appearance || undefined
        input.profileId = formData.selectedProfileId || undefined
      }
    }

    return input
  }, [formData])

  // Check if form is complete
  const isFormComplete = validation.step1Valid && validation.step2Valid && validation.step3Valid

  return (
    <WizardContext.Provider
      value={{
        currentStep,
        setCurrentStep,
        nextStep,
        prevStep,
        goToStep,
        formData,
        updateFormData,
        validation,
        fieldValidation,
        validateStep,
        touchField,
        preferences,
        savePreference,
        addFavoriteTemplate,
        removeFavoriteTemplate,
        childProfiles,
        setChildProfiles,
        loadingProfiles,
        setLoadingProfiles,
        getIllustrationMode,
        getStoryInput,
        isFormComplete,
        hasDraft,
        restoreDraft,
        clearDraft,
        setIsAutoSelecting,
        lastSettings,
        saveLastSettings,
        applyLastSettings,
        hasLastSettings,
      }}
    >
      {children}
    </WizardContext.Provider>
  )
}

export function useWizard() {
  const context = useContext(WizardContext)
  if (!context) {
    throw new Error('useWizard must be used within a WizardProvider')
  }
  return context
}
