// Content moderation utilities for kid-safe content

import { Filter } from 'bad-words'

// Initialize profanity filter with strict settings for kids
const profanityFilter = new Filter()

// Additional unsafe words specific to children's content
const ADDITIONAL_UNSAFE_WORDS = [
  'kill', 'killed', 'killing', 'murder', 'blood', 'bloody',
  'weapon', 'gun', 'knife', 'sword', 'bomb', 'explosion',
  'drug', 'drugs', 'alcohol', 'beer', 'wine', 'drunk',
  'suicide', 'die', 'dying', 'corpse', 'dead body',
  'kidnap', 'kidnapped', 'kidnapping', 'abduct',
  'abuse', 'abused', 'torture', 'tortured',
  'hate', 'hatred', 'racist', 'racism',
  'sexy', 'sexual', 'naked', 'nude',
]

profanityFilter.addWords(...ADDITIONAL_UNSAFE_WORDS)

// Common obfuscation patterns for extremely inappropriate terms
const CUSTOM_PATTERN_CHECKS = [
  /f+[\W_]*u+[\W_]*c+[\W_]*k/i,
  /s+[\W_]*h+[\W_]*i+[\W_]*t/i,
  /b+[\W_]*i+[\W_]*t+[\W_]*c+[\W_]*h/i,
  /a+[\W_]*s+[\W_]*s+[\W_]*h+[\W_]*o+[\W_]*l+[\W_]*e/i,
  /d+[\W_]*a+[\W_]*m+[\W_]*n/i,
  /h+[\W_]*e+[\W_]*l+[\W_]*l/i,
]

/**
 * Enhanced profanity detection with character substitution handling
 * Handles common obfuscation techniques: l33t speak, spacing, special chars
 * @param text Text to normalize
 * @returns Normalized text for profanity checking
 */
function normalizeForProfanityCheck(text: string): string {
  return text
    .toLowerCase()
    .replace(/[0-9]/g, (digit) => {
      const map: Record<string, string> = {
        '0': 'o', '1': 'i', '3': 'e', '4': 'a', '5': 's', '7': 't', '8': 'b', '9': 'g'
      }
      return map[digit] || digit
    })
    .replace(/[@]/g, 'a')
    .replace(/[$]/g, 's')
    .replace(/[!|]/g, 'i')
    .replace(/[*]/g, '')
    .replace(/\s+/g, '') // Remove spaces between letters (e.g., "b a d" → "bad")
    .replace(/[^a-z]/g, '') // Remove remaining special chars
}

/**
 * Check if text contains obfuscated profanity using pattern matching
 * @param text Text to check
 * @returns True if obfuscated profanity detected
 */
function containsObfuscatedProfanity(text: string): boolean {
  return CUSTOM_PATTERN_CHECKS.some(pattern => pattern.test(text))
}

const UNSAFE_THEMES = [
  'violence',
  'horror',
  'scary',
  'fear',
  'death',
  'war',
  'fighting',
  'weapon',
  'guns',
  'blood',
  'gore',
  'murder',
  'killing',
  'kidnapping',
  'abuse',
  'drugs',
  'alcohol',
  'adult content',
  'sexual',
  'terrorism',
  'hate',
  'discrimination',
]

/**
 * Check if input contains profanity or inappropriate content
 * Enhanced to detect obfuscated bad words (l33t speak, spacing, special characters)
 */
export function containsProfanity(text: string): boolean {
  // Check original text
  if (profanityFilter.isProfane(text)) {
    return true
  }

  // Check for obfuscated patterns
  if (containsObfuscatedProfanity(text)) {
    return true
  }

  // Check normalized version (catches l33t speak and other substitutions)
  const normalized = normalizeForProfanityCheck(text)
  if (profanityFilter.isProfane(normalized)) {
    return true
  }

  return false
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
 * Validate multi-child story input for kid-safe content
 */
export function validateMultiChildStoryInput(
  children: Array<{
    name: string
    adjectives: string[]
  }>,
  theme: string,
  moral?: string
): ValidationResult {
  const errors: string[] = []

  // Validate each child
  children.forEach((child, index) => {
    if (containsProfanity(child.name)) {
      errors.push(`Child ${index + 1} name contains inappropriate content`)
    }

    child.adjectives.forEach((adjective) => {
      if (containsProfanity(adjective)) {
        errors.push(`Child ${index + 1} has an adjective that contains inappropriate content`)
      }
    })
  })

  // Validate theme and moral
  if (isUnsafeTheme(theme)) {
    errors.push(`Theme "${theme}" is not suitable for children`)
  }

  if (moral && containsProfanity(moral)) {
    errors.push('Moral/lesson contains inappropriate content')
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
