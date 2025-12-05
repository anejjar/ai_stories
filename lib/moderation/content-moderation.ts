// Content moderation utilities for kid-safe content

const PROFANITY_WORDS = [
  // Add common profanity words here (keeping it minimal for example)
  // In production, use a proper profanity filter library
]

const UNSAFE_THEMES = [
  'violence',
  'horror',
  'scary',
  'fear',
  'death',
  'war',
  'fighting',
]

/**
 * Check if input contains profanity
 */
export function containsProfanity(text: string): boolean {
  const lowerText = text.toLowerCase()
  return PROFANITY_WORDS.some((word) => lowerText.includes(word.toLowerCase()))
}

/**
 * Check if theme is unsafe for children
 */
export function isUnsafeTheme(theme: string): boolean {
  const lowerTheme = theme.toLowerCase()
  return UNSAFE_THEMES.some((unsafe) => lowerTheme.includes(unsafe))
}

/**
 * Validate story input for kid-safe content
 */
export interface ValidationResult {
  isValid: boolean
  errors: string[]
}

export function validateStoryInput(input: {
  childName: string
  adjectives: string[]
  theme: string
  moral?: string
}): ValidationResult {
  const errors: string[] = []

  // Check child name
  if (containsProfanity(input.childName)) {
    errors.push('Child name contains inappropriate content')
  }

  // Check adjectives
  for (const adjective of input.adjectives) {
    if (containsProfanity(adjective)) {
      errors.push(`Adjective "${adjective}" contains inappropriate content`)
    }
  }

  // Check theme
  if (isUnsafeTheme(input.theme)) {
    errors.push(`Theme "${input.theme}" is not suitable for children`)
  }

  // Check moral
  if (input.moral && containsProfanity(input.moral)) {
    errors.push('Moral/lesson contains inappropriate content')
  }

  // Length checks
  if (input.childName.length > 50) {
    errors.push('Child name is too long (max 50 characters)')
  }

  if (input.adjectives.length > 10) {
    errors.push('Too many adjectives (max 10)')
  }

  if (input.moral && input.moral.length > 500) {
    errors.push('Moral/lesson is too long (max 500 characters)')
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

/**
 * Sanitize text input (basic sanitization)
 */
export function sanitizeInput(text: string): string {
  return text
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .slice(0, 1000) // Limit length
}

/**
 * Moderate content for inappropriate material
 * Returns a result indicating if content should be flagged
 */
export interface ModerationResult {
  flagged: boolean
  reason?: string
}

export async function moderateContent(content: string): Promise<ModerationResult> {
  // Basic moderation checks
  const lowerContent = content.toLowerCase()
  
  // Check for profanity
  if (containsProfanity(lowerContent)) {
    return {
      flagged: true,
      reason: 'Contains inappropriate language',
    }
  }
  
  // Check for unsafe themes
  for (const unsafeTheme of UNSAFE_THEMES) {
    if (lowerContent.includes(unsafeTheme)) {
      return {
        flagged: true,
        reason: `Contains unsafe theme: ${unsafeTheme}`,
      }
    }
  }
  
  // Additional checks can be added here (e.g., API calls to moderation services)
  
  return {
    flagged: false,
  }
}



