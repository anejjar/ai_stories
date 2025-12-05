// Provider Registry

import { GeminiProvider } from './gemini-provider'
import { OpenAIProvider } from './openai-provider'
import { createAnthropicProvider } from './anthropic-provider-wrapper'
import type { AIProvider, AIProviderType } from '../types'

/**
 * Registry of all available text generation providers
 */
const providers: Map<AIProviderType, () => AIProvider | null> = new Map([
  ['gemini', () => new GeminiProvider()],
  ['openai', () => new OpenAIProvider()],
  ['anthropic', () => createAnthropicProvider()],
])

/**
 * Get a provider instance by type
 */
export function getProvider(type: AIProviderType): AIProvider | null {
  const factory = providers.get(type)
  if (!factory) {
    return null
  }

  const provider = factory()
  if (!provider) {
    return null
  }
  
  return provider.isAvailable() ? provider : null
}

/**
 * Get all available providers
 */
export function getAvailableProviders(): AIProvider[] {
  const available: AIProvider[] = []
  
  for (const [type, factory] of providers.entries()) {
    const provider = factory()
    if (provider && provider.isAvailable()) {
      available.push(provider)
    }
  }
  
  return available
}

/**
 * Get provider types from comma-separated string
 */
export function parseProviderList(list: string | undefined): AIProviderType[] {
  if (!list) {
    return ['gemini'] // Default fallback
  }

  const types = list.split(',').map((t) => t.trim().toLowerCase() as AIProviderType)
  const validTypes = types.filter((t) => providers.has(t))
  
  // If no valid types found, return default
  return validTypes.length > 0 ? validTypes : ['gemini']
}

