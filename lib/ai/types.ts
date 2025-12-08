// AI Provider Type Definitions

import type { StoryGenerationRequest } from '@/types'

/**
 * Supported AI providers for text generation
 */
export type AIProviderType = 'gemini' | 'openai' | 'anthropic'

/**
 * Supported image generation providers
 */
export type ImageProviderType = 'dalle' | 'gemini-image' | 'midjourney' | 'stable-diffusion'

/**
 * Request for text generation
 */
export interface TextGenerationRequest extends StoryGenerationRequest {
  // Can be extended with provider-specific options
  customPrompt?: string // Optional custom prompt for enhancements/rewrites
}

/**
 * Request for image generation
 */
export interface ImageGenerationRequest {
  prompt: string
  count?: number
  size?: '256x256' | '512x512' | '1024x1024' | '1024x1792' | '1792x1024'
  style?: string
}

/**
 * Base interface for AI providers
 */
export interface AIProvider {
  /** Provider name/identifier */
  name: AIProviderType

  /** Check if provider is available (API key configured) */
  isAvailable(): boolean

  /** Generate text content */
  generateText(request: TextGenerationRequest): Promise<string>

  /** Analyze image and return description (optional) */
  analyzeImage?(base64Image: string, prompt?: string): Promise<string>

  /** Generate images (optional, not all providers support this) */
  generateImage?(request: ImageGenerationRequest): Promise<string[]>
}

/**
 * Base interface for image generation providers
 */
export interface ImageProvider {
  /** Provider name/identifier */
  name: ImageProviderType

  /** Check if provider is available (API key configured) */
  isAvailable(): boolean

  /** Generate images */
  generateImage(request: ImageGenerationRequest): Promise<string[]>
}

/**
 * Provider error with context
 */
export class ProviderError extends Error {
  constructor(
    message: string,
    public provider: string,
    public originalError?: unknown
  ) {
    super(message)
    this.name = 'ProviderError'
  }
}



