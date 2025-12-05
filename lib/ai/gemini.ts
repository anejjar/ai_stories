// Gemini AI integration (Legacy - for backward compatibility)
// @deprecated Use ProviderManager from '@/lib/ai/provider-manager' instead

import type { StoryGenerationRequest } from '@/types'
import { getProviderManager } from './provider-manager'

/**
 * Generate a story using the configured AI provider
 * @deprecated Use ProviderManager.generateText() instead
 */
export async function generateStory(
  request: StoryGenerationRequest
): Promise<string> {
  const providerManager = getProviderManager()
  return providerManager.generateText(request)
}

/**
 * Retry story generation with exponential backoff
 * @deprecated ProviderManager handles retry and fallback automatically
 */
export async function generateStoryWithRetry(
  request: StoryGenerationRequest,
  maxRetries = 3
): Promise<string> {
  // ProviderManager already handles retries and fallbacks
  // This function is kept for backward compatibility
  return generateStory(request)
}

