// Provider Manager - Central manager for provider selection and fallback

import {
  getProvider,
  getAvailableProviders,
  parseProviderList,
} from './providers'
import {
  getImageProvider,
  getAvailableImageProviders,
  parseImageProviderList,
} from './providers/image'
import { retryWithFallback } from './retry'
import type {
  AIProvider,
  ImageProvider,
  AIProviderType,
  ImageProviderType,
  TextGenerationRequest,
  ImageGenerationRequest,
} from './types'
import { ProviderError } from './types'

export class ProviderManager {
  private textProviders: AIProviderType[]
  private imageProviders: ImageProviderType[]

  constructor() {
    // Parse provider lists from environment variables
    this.textProviders = parseProviderList(process.env.AI_PROVIDER)
    this.imageProviders = parseImageProviderList(process.env.IMAGE_PROVIDER)
  }

  /**
   * Get the primary text provider
   */
  getTextProvider(): AIProvider | null {
    if (this.textProviders.length === 0) {
      return null
    }

    return getProvider(this.textProviders[0])
  }

  /**
   * Get all available text providers in fallback order
   */
  getTextProviders(): AIProvider[] {
    const providers: AIProvider[] = []

    for (const type of this.textProviders) {
      const provider = getProvider(type)
      if (provider) {
        providers.push(provider)
      }
    }

    return providers
  }

  /**
   * Get the primary image provider
   */
  getImageProvider(): ImageProvider | null {
    if (this.imageProviders.length === 0) {
      return null
    }

    return getImageProvider(this.imageProviders[0])
  }

  /**
   * Get all available image providers in fallback order
   */
  getImageProviders(): ImageProvider[] {
    const providers: ImageProvider[] = []

    for (const type of this.imageProviders) {
      const provider = getImageProvider(type)
      if (provider) {
        providers.push(provider)
      }
    }

    return providers
  }

  /**
   * Generate text with automatic fallback between providers
   */
  async generateText(request: TextGenerationRequest): Promise<string> {
    const providers = this.getTextProviders()

    if (providers.length === 0) {
      throw new ProviderError(
        'No AI providers are available. Please configure at least one provider.',
        'none'
      )
    }

    // Create provider functions for fallback retry
    const providerFunctions = providers.map((provider) => {
      return async () => {
        try {
          return await provider.generateText(request)
        } catch (error) {
          throw new ProviderError(
            `Failed to generate text with ${provider.name}`,
            provider.name,
            error
          )
        }
      }
    })

    try {
      const { result, providerIndex } = await retryWithFallback(providerFunctions)
      console.log(`Successfully generated text using provider: ${providers[providerIndex].name}`)
      return result
    } catch (error) {
      if (error instanceof ProviderError) {
        throw error
      }

      throw new ProviderError(
        'All text generation providers failed',
        'all',
        error
      )
    }
  }

  /**
   * Analyze image with automatic fallback between providers
   */
  async analyzeImage(base64Image: string, prompt?: string): Promise<string> {
    const providers = this.getTextProviders()

    if (providers.length === 0) {
      throw new ProviderError(
        'No AI providers are available. Please configure at least one provider.',
        'none'
      )
    }

    // Filter providers that support image analysis
    const capableProviders = providers.filter(p => typeof p.analyzeImage === 'function')

    if (capableProviders.length === 0) {
      throw new ProviderError(
        'No configured providers support image analysis. Please configure OpenAI or Gemini.',
        'none'
      )
    }

    // Create provider functions for fallback retry
    const providerFunctions = capableProviders.map((provider) => {
      return async () => {
        try {
          // We checked for existence above, but TypeScript might need reassurance or the check is enough
          if (provider.analyzeImage) {
            return await provider.analyzeImage(base64Image, prompt)
          }
          throw new Error('Provider does not support analyzeImage')
        } catch (error) {
          throw new ProviderError(
            `Failed to analyze image with ${provider.name}`,
            provider.name,
            error
          )
        }
      }
    })

    try {
      const { result, providerIndex } = await retryWithFallback(providerFunctions)
      console.log(`Successfully analyzed image using provider: ${capableProviders[providerIndex].name}`)
      return result
    } catch (error) {
      if (error instanceof ProviderError) {
        throw error
      }

      throw new ProviderError(
        'All image analysis providers failed',
        'all',
        error
      )
    }
  }

  /**
   * Generate images with automatic fallback between providers
   */
  async generateImages(request: ImageGenerationRequest): Promise<string[]> {
    const providers = this.getImageProviders()

    if (providers.length === 0) {
      throw new ProviderError(
        'No image providers are available. Please configure at least one provider.',
        'none'
      )
    }

    // Create provider functions for fallback retry
    const providerFunctions = providers.map((provider) => {
      return async () => {
        try {
          return await provider.generateImage(request)
        } catch (error) {
          throw new ProviderError(
            `Failed to generate images with ${provider.name}`,
            provider.name,
            error
          )
        }
      }
    })

    try {
      const { result, providerIndex } = await retryWithFallback(providerFunctions)
      console.log(`Successfully generated images using provider: ${providers[providerIndex].name}`)
      return result
    } catch (error) {
      if (error instanceof ProviderError) {
        throw error
      }

      throw new ProviderError(
        'All image generation providers failed',
        'all',
        error
      )
    }
  }

  /**
   * Get information about available providers
   */
  getProviderInfo() {
    return {
      text: {
        configured: this.textProviders,
        available: getAvailableProviders().map((p) => p.name),
      },
      image: {
        configured: this.imageProviders,
        available: getAvailableImageProviders().map((p) => p.name),
      },
    }
  }
}

// Singleton instance
let managerInstance: ProviderManager | null = null

/**
 * Get the singleton ProviderManager instance
 */
export function getProviderManager(): ProviderManager {
  if (!managerInstance) {
    managerInstance = new ProviderManager()
  }
  return managerInstance
}






