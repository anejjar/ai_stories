// AI response validation utilities to detect refusal messages
// This prevents AI refusal messages from being saved as story content

/**
 * Patterns that indicate AI refusal/rejection
 * These are common phrases used by AI models when refusing to generate content
 */
const REFUSAL_PATTERNS = [
  // Direct refusals
  /I cannot create|I can't create|I'm unable to create/i,
  /I cannot write|I can't write|I'm unable to write/i,
  /I cannot generate|I can't generate|I'm unable to generate/i,
  /I won't create|I will not create/i,

  // Apologies and explanations
  /I apologize,?\s+but/i,
  /I'm sorry,?\s+but/i,
  /Unfortunately,?\s+I/i,
  /I must decline/i,

  // Content policy references
  /inappropriate content|inappropriate language/i,
  /content policy|safety guidelines|ethical guidelines/i,
  /against (my|our) (policy|guidelines)/i,
  /violates (my|our) (policy|guidelines)/i,
  /doesn't align with (my|our)/i,

  // Child safety specific
  /not appropriate for children|unsuitable for children/i,
  /kid-safe|child-safe/i,
  /harmful content/i,

  // Request modifications
  /please provide (different|appropriate|suitable)/i,
  /suggest choosing (different|another)/i,
  /try a different|use a different/i,

  // OpenAI specific
  /As an AI language model/i,
  /As an AI assistant/i,
  /As a helpful assistant/i,

  // Anthropic specific
  /I don't feel comfortable/i,
  /would not be appropriate/i,
  /wouldn't be suitable/i,

  // Meta-comments instead of story
  /This story contains|This content contains/i,
  /I should note that|I must note that/i,
  /I need to mention/i,
]

/**
 * Patterns that indicate actual story content (reduce false positives)
 */
const STORY_INDICATORS = [
  /Once upon a time/i,
  /In a (magical|wonderful|faraway|distant|enchanted|mystical) (land|kingdom|forest|place|world)/i,
  /There (was|lived|once lived) (a|an) (child|boy|girl|kid|little)/i,
  /One (day|morning|evening|night|afternoon)/i,
  /Long ago/i,
  /Many years ago/i,
  /\b(Chapter|Part) \d+/i,
  /lived in a/i,
  /The story of/i,
]

export interface AIResponseValidation {
  isValid: boolean
  isRefusal: boolean
  reason?: string
  confidence: 'high' | 'medium' | 'low'
}

/**
 * Validate if AI response is a valid story or a refusal message
 * @param content The AI-generated content to validate
 * @returns Validation result with isValid flag and reason
 */
export function validateAIResponse(content: string): AIResponseValidation {
  // 1. Basic checks
  if (!content || typeof content !== 'string') {
    return {
      isValid: false,
      isRefusal: true,
      reason: 'Response is empty or invalid',
      confidence: 'high'
    }
  }

  const trimmedContent = content.trim()

  // 2. Check length - refusals are typically short
  if (trimmedContent.length < 100) {
    return {
      isValid: false,
      isRefusal: true,
      reason: 'Response too short to be a valid story (minimum 100 characters)',
      confidence: 'high'
    }
  }

  // 3. Check for refusal patterns
  const refusalMatches = REFUSAL_PATTERNS.filter(pattern => pattern.test(content))

  if (refusalMatches.length > 0) {
    // Check if it also has story indicators (might be a story about apologizing)
    const hasStoryIndicators = STORY_INDICATORS.some(pattern => pattern.test(content))

    if (!hasStoryIndicators && refusalMatches.length >= 2) {
      // Multiple refusal patterns and no story indicators = definite refusal
      return {
        isValid: false,
        isRefusal: true,
        reason: 'AI provider refused to generate content due to safety concerns',
        confidence: 'high'
      }
    } else if (!hasStoryIndicators && refusalMatches.length === 1) {
      // Single refusal pattern and no story indicators = likely refusal
      return {
        isValid: false,
        isRefusal: true,
        reason: 'AI provider refused to generate content due to safety concerns',
        confidence: 'medium'
      }
    }
    // If has story indicators, continue validation
  }

  // 4. Check for story structure
  const hasParagraphs = content.split(/\n\n+/).length >= 2
  const hasDialogue = /["']/.test(content) || /said|asked|replied|shouted|whispered/i.test(content)
  const hasStoryElements = STORY_INDICATORS.some(pattern => pattern.test(content))

  // At least 2 of these should be true for a valid story
  const structureScore = (hasParagraphs ? 1 : 0) + (hasDialogue ? 1 : 0) + (hasStoryElements ? 1 : 0)

  if (structureScore < 1) {
    return {
      isValid: false,
      isRefusal: true,
      reason: 'Response does not appear to be a valid story (missing narrative structure)',
      confidence: 'low'
    }
  }

  // 5. Check for minimum word count (stories should have substance)
  const wordCount = trimmedContent.split(/\s+/).length
  if (wordCount < 50) {
    return {
      isValid: false,
      isRefusal: true,
      reason: 'Response too short to be a valid story (minimum 50 words)',
      confidence: 'high'
    }
  }

  return {
    isValid: true,
    isRefusal: false,
    confidence: 'high'
  }
}

/**
 * Specific validator for illustrated book pages
 * Validates both the main story content and individual book pages
 * @param storyContent The main story text
 * @param bookPages Array of pages with text and illustration URLs
 * @returns Validation result
 */
export function validateIllustratedBookContent(
  storyContent: string,
  bookPages: Array<{ text: string; illustration_url?: string }>
): AIResponseValidation {
  // Validate main story content
  const contentValidation = validateAIResponse(storyContent)
  if (!contentValidation.isValid) {
    return contentValidation
  }

  // Validate that we have pages
  if (!bookPages || bookPages.length === 0) {
    return {
      isValid: false,
      isRefusal: true,
      reason: 'Illustrated book has no pages',
      confidence: 'high'
    }
  }

  // Validate each page (less strict than full story validation)
  for (let i = 0; i < bookPages.length; i++) {
    const page = bookPages[i]
    if (!page.text || typeof page.text !== 'string') {
      return {
        isValid: false,
        isRefusal: true,
        reason: `Page ${i + 1} has no text content`,
        confidence: 'high'
      }
    }

    // Check for refusal patterns in individual pages
    const pageText = page.text.trim()
    const hasRefusalPattern = REFUSAL_PATTERNS.some(pattern => pattern.test(pageText))

    if (hasRefusalPattern) {
      return {
        isValid: false,
        isRefusal: true,
        reason: `Page ${i + 1} contains refusal or invalid content`,
        confidence: 'high'
      }
    }

    // Each page should have at least some content
    if (pageText.length < 20) {
      return {
        isValid: false,
        isRefusal: true,
        reason: `Page ${i + 1} has insufficient content (minimum 20 characters)`,
        confidence: 'medium'
      }
    }
  }

  return {
    isValid: true,
    isRefusal: false,
    confidence: 'high'
  }
}
