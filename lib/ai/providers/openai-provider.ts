// OpenAI Provider

import OpenAI from 'openai'
import type { AIProvider, TextGenerationRequest, ImageGenerationRequest } from '../types'
import { buildEnhancedStoryPrompt, determineAgeGroup, type EnhancedStoryRequest } from '../story-prompt-builder'

export class OpenAIProvider implements AIProvider {
  name: 'openai' = 'openai'
  private client: OpenAI | null = null

  constructor() {
    const apiKey = process.env.OPENAI_API_KEY
    if (apiKey) {
      this.client = new OpenAI({ apiKey })
    } else {
      console.warn('OPENAI_API_KEY is not set. OpenAI provider will not be available.')
    }
  }

  isAvailable(): boolean {
    return this.client !== null
  }

  async generateText(request: TextGenerationRequest): Promise<string> {
    if (!this.client) {
      throw new Error('OpenAI API key is not configured')
    }

    const prompt = this.createStoryPrompt(request)

    try {
      const completion = await this.client.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are an expert children\'s story writer with years of experience crafting engaging, well-structured bedtime stories. You understand narrative structure, character development, pacing, and how to create emotionally resonant stories for young readers. Follow all instructions precisely to create high-quality, age-appropriate stories.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7, // Slightly lower for more consistent structure
        max_tokens: 2500, // Increased for longer, more detailed stories
      })

      const content = completion.choices[0]?.message?.content
      if (!content) {
        throw new Error('OpenAI returned empty response')
      }

      return content
    } catch (error: any) {
      // Try fallback to gpt-3.5-turbo if gpt-4 fails
      if (error.message?.includes('gpt-4') || error.code === 'model_not_found') {
        console.log('Trying fallback model: gpt-3.5-turbo')
        try {
          const completion = await this.client.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: [
              {
                role: 'system',
                content: 'You are an expert children\'s story writer with years of experience crafting engaging, well-structured bedtime stories. You understand narrative structure, character development, pacing, and how to create emotionally resonant stories for young readers. Follow all instructions precisely to create high-quality, age-appropriate stories.',
              },
              {
                role: 'user',
                content: prompt,
              },
            ],
            temperature: 0.7,
            max_tokens: 2500,
          })

          const content = completion.choices[0]?.message?.content
          if (!content) {
            throw new Error('OpenAI returned empty response')
          }

          return content
        } catch (fallbackError: any) {
          throw new Error(
            `Failed to generate story with OpenAI. ` +
            `Error: ${fallbackError?.message || error.message}`
          )
        }
      }

      throw new Error(
        `Failed to generate story with OpenAI. ` +
        `Error: ${error.message || 'Unknown error'}`
      )
    }
  }

  async generateImage(request: ImageGenerationRequest): Promise<string[]> {
    if (!this.client) {
      throw new Error('OpenAI API key is not configured')
    }

    try {
      const response = await this.client.images.generate({
        model: 'dall-e-3',
        prompt: request.prompt,
        n: request.count || 1,
        size: request.size || '1024x1024',
        quality: 'standard',
        style: request.style === 'vivid' ? 'vivid' : 'natural',
        response_format: 'b64_json', // Request base64 instead of URLs to avoid expiration issues
      })

      return response.data.map((img) => {
        if (img.b64_json) {
          // Return as data URL for immediate use
          return `data:image/png;base64,${img.b64_json}`
        }
        return img.url || ''
      }).filter(Boolean)
    } catch (error: any) {
      // Fallback to DALL-E 2 if DALL-E 3 fails
      if (error.message?.includes('dall-e-3') || error.code === 'model_not_found') {
        console.log('Trying fallback model: dall-e-2')
        try {
          const response = await this.client.images.generate({
            model: 'dall-e-2',
            prompt: request.prompt,
            n: request.count || 1,
            size: request.size || '1024x1024',
            response_format: 'b64_json', // Request base64 for DALL-E 2 as well
          })

          return response.data.map((img) => {
            if (img.b64_json) {
              return `data:image/png;base64,${img.b64_json}`
            }
            return img.url || ''
          }).filter(Boolean)
        } catch (fallbackError: any) {
          throw new Error(
            `Failed to generate images with OpenAI. ` +
            `Error: ${fallbackError?.message || error.message}`
          )
        }
      }

      throw new Error(
        `Failed to generate images with OpenAI. ` +
        `Error: ${error.message || 'Unknown error'}`
      )
    }
  }

  async analyzeImage(base64Image: string, prompt?: string): Promise<string> {
    if (!this.client) {
      throw new Error('OpenAI API key is not configured')
    }

    try {
      const completion = await this.client.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'You are an expert at analyzing images of people and describing them in detail for the purpose of creating consistent character illustrations.',
          },
          {
            role: 'user',
            content: [
              { 
                type: 'text', 
                text: prompt || 'Describe the child in this image. Focus on physical appearance: hair color, hair style, eye color, skin tone, and any distinctive features. Also mention the clothing and expression. Keep it concise but descriptive enough to recreate a similar character.' 
              },
              {
                type: 'image_url',
                image_url: {
                  url: base64Image.startsWith('data:') ? base64Image : `data:image/jpeg;base64,${base64Image}`,
                },
              },
            ],
          },
        ],
        max_tokens: 500,
      })

      const content = completion.choices[0]?.message?.content
      if (!content) {
        throw new Error('OpenAI returned empty response for image analysis')
      }

      return content
    } catch (error: any) {
      console.error('Error analyzing image:', error)
      throw new Error(
        `Failed to analyze image with OpenAI. ` +
        `Error: ${error.message || 'Unknown error'}`
      )
    }
  }

  /**
   * Create a story prompt from the request
   */
  private createStoryPrompt(request: TextGenerationRequest): string {
    const { childName, adjectives, theme, moral, children, customPrompt } = request as any

    // If custom prompt provided (for illustrated books), use it
    if (customPrompt) {
      return customPrompt
    }

    // Use enhanced prompt builder
    const enhancedRequest: EnhancedStoryRequest = {
      childName: childName || '',
      adjectives: adjectives || [],
      theme,
      moral,
      ageGroup: determineAgeGroup(), // Default to preschool if no age provided
      children,
    }

    return buildEnhancedStoryPrompt(enhancedRequest)
  }
}




