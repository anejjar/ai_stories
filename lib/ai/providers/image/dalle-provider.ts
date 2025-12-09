// OpenAI DALL-E Image Provider

import OpenAI from 'openai'
import type { ImageProvider, ImageGenerationRequest } from '../../types'

export class DalleProvider implements ImageProvider {
  name: 'dalle' = 'dalle'
  private client: OpenAI | null = null

  constructor() {
    const apiKey = process.env.OPENAI_API_KEY || process.env.DALL_E_API_KEY
    if (apiKey) {
      this.client = new OpenAI({ apiKey })
    } else {
      console.warn('OPENAI_API_KEY or DALL_E_API_KEY is not set. DALL-E provider will not be available.')
    }
  }

  isAvailable(): boolean {
    return this.client !== null
  }

  async generateImage(request: ImageGenerationRequest): Promise<string[]> {
    if (!this.client) {
      throw new Error('OpenAI API key is not configured')
    }

    try {
      const response = await this.client.images.generate({
        model: 'dall-e-3',
        prompt: request.prompt,
        n: 1, // DALL-E 3 only supports n=1
        size: request.size || '1024x1024',
        quality: 'standard',
        style: request.style === 'vivid' ? 'vivid' : 'natural',
      })

      const urls = response.data.map((img) => img.url || '').filter(Boolean)
      if (urls.length === 0) {
        throw new Error('DALL-E returned no image URLs')
      }
      return urls
    } catch (error: any) {
      console.error('DALL-E 3 error:', {
        message: error.message,
        code: error.code,
        status: error.status,
        type: error.type,
        response: error.response
      })

      // Fallback to DALL-E 2 if DALL-E 3 fails
      if (
        error.message?.includes('dall-e-3') || 
        error.code === 'model_not_found' ||
        error.status === 404 ||
        error.type === 'invalid_request_error'
      ) {
        console.log('Trying fallback model: dall-e-2')
        try {
          const count = Math.min(request.count || 1, 10) // DALL-E 2 supports up to 10
          const response = await this.client.images.generate({
            model: 'dall-e-2',
            prompt: request.prompt,
            n: count,
            size: request.size || '1024x1024',
          })

          const urls = response.data.map((img) => img.url || '').filter(Boolean)
          if (urls.length === 0) {
            throw new Error('DALL-E 2 returned no image URLs')
          }
          return urls
        } catch (fallbackError: any) {
          console.error('DALL-E 2 fallback error:', {
            message: fallbackError?.message,
            code: fallbackError?.code,
            status: fallbackError?.status
          })
          throw new Error(
            `Failed to generate images with DALL-E (both models failed). ` +
            `DALL-E 3 error: ${error.message || 'Unknown'}. ` +
            `DALL-E 2 error: ${fallbackError?.message || 'Unknown'}`
          )
        }
      }

      // Provide more detailed error information
      const errorDetails = error.response?.data || error.error || {}
      throw new Error(
        `Failed to generate images with DALL-E. ` +
        `Error: ${error.message || 'Unknown error'}. ` +
        `Code: ${error.code || 'N/A'}. ` +
        `Status: ${error.status || 'N/A'}. ` +
        `Details: ${JSON.stringify(errorDetails)}`
      )
    }
  }
}








