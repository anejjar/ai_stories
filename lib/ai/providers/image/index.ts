// Image Provider Registry

import { DalleProvider } from './dalle-provider'
import { MidjourneyProvider } from './midjourney-provider'
import { StableDiffusionProvider } from './stable-diffusion-provider'
import type { ImageProvider, ImageProviderType } from '../../types'

/**
 * Registry of all available image generation providers
 */
const providers: Map<ImageProviderType, () => ImageProvider> = new Map([
  ['dalle', () => new DalleProvider()],
  ['midjourney', () => new MidjourneyProvider()],
  ['stable-diffusion', () => new StableDiffusionProvider()],
])

/**
 * Get an image provider instance by type
 */
export function getImageProvider(type: ImageProviderType): ImageProvider | null {
  const factory = providers.get(type)
  if (!factory) {
    return null
  }

  const provider = factory()
  return provider.isAvailable() ? provider : null
}

/**
 * Get all available image providers
 */
export function getAvailableImageProviders(): ImageProvider[] {
  const available: ImageProvider[] = []
  
  for (const [type, factory] of providers.entries()) {
    const provider = factory()
    if (provider.isAvailable()) {
      available.push(provider)
    }
  }
  
  return available
}

/**
 * Get image provider types from comma-separated string
 */
export function parseImageProviderList(list: string | undefined): ImageProviderType[] {
  if (!list) {
    return ['dalle'] // Default fallback
  }

  const types = list.split(',').map((t) => t.trim().toLowerCase() as ImageProviderType)
  const validTypes = types.filter((t) => providers.has(t))
  
  // If no valid types found, return default
  return validTypes.length > 0 ? validTypes : ['dalle']
}

