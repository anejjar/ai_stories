// Wrapper for Anthropic provider that handles missing package gracefully

import type { AIProvider } from '../types'

/**
 * Create Anthropic provider only if package is installed
 */
export function createAnthropicProvider(): AIProvider | null {
  try {
    // Check if package exists
    require.resolve('@anthropic-ai/sdk')
    
    // If it exists, dynamically import the provider
    // Using eval to prevent webpack from trying to resolve at build time
    const providerModule = eval('require')('./anthropic-provider')
    const { AnthropicProvider } = providerModule
    return new AnthropicProvider()
  } catch (error: any) {
    if (error.code === 'MODULE_NOT_FOUND') {
      console.warn('@anthropic-ai/sdk is not installed. Anthropic provider will not be available.')
    } else {
      console.warn('Failed to load Anthropic provider:', error.message)
    }
    return null
  }
}

