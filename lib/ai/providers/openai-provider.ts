// OpenAI Provider

import OpenAI from 'openai'
import type { AIProvider, TextGenerationRequest, ImageGenerationRequest } from '../types'

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
            content: 'You are a creative children\'s story writer. Write engaging, age-appropriate bedtime stories that are wholesome, educational, and kid-safe.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.8,
        max_tokens: 2000,
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
                content: 'You are a creative children\'s story writer. Write engaging, age-appropriate bedtime stories that are wholesome, educational, and kid-safe.',
              },
              {
                role: 'user',
                content: prompt,
              },
            ],
            temperature: 0.8,
            max_tokens: 2000,
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
      })

      return response.data.map((img) => img.url || '').filter(Boolean)
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
          })

          return response.data.map((img) => img.url || '').filter(Boolean)
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
    const { childName, adjectives, theme, moral, children } = request as any
    
    const isMultiChild = children && Array.isArray(children) && children.length > 0
    const moralText = moral ? ` The story should teach the moral: ${moral}.` : ''

    if (isMultiChild) {
      // Multi-child story prompt
      const childrenList = children.map((child: any, index: number) => {
        const adjList = child.adjectives.join(', ')
        return `${index + 1}. ${child.name} - described as: ${adjList}`
      }).join('\n')
      
      const childrenNames = children.map((child: any) => child.name).join(', ')
      const childrenNamesList = children.map((child: any) => child.name).join(' and ')

      return `Create a beautiful, age-appropriate bedtime story featuring multiple children as the main characters.

The children are:
${childrenList}

Theme: ${theme}${moralText}

Requirements:
- The story should be wholesome, educational, and kid-safe
- It should be engaging and suitable for bedtime reading
- Include all children's names (${childrenNames}) naturally throughout the story
- Make them work together as a team or friends
- Each child should have moments that showcase their unique traits
- Make it approximately 600-1000 words (longer to accommodate multiple characters)
- Use simple, clear language appropriate for children
- Include a positive, uplifting ending that celebrates friendship and teamwork
- The story should be about ${childrenNamesList} going on an adventure together

Story:`
    } else {
      // Single-child story prompt (backward compatible)
      const adjectivesList = adjectives.join(', ')

      return `Create a beautiful, age-appropriate bedtime story for a child named ${childName}. 

The child should be described as: ${adjectivesList}.

Theme: ${theme}${moralText}

Requirements:
- The story should be wholesome, educational, and kid-safe
- It should be engaging and suitable for bedtime reading
- Include the child's name naturally throughout the story
- Make it approximately 500-800 words
- Use simple, clear language appropriate for children
- Include a positive, uplifting ending

Story:`
    }
  }
}




