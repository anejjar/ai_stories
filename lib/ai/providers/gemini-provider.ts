// Google Gemini AI Provider

import { GoogleGenerativeAI } from '@google/generative-ai'
import type { AIProvider, TextGenerationRequest } from '../types'

export class GeminiProvider implements AIProvider {
  name: 'gemini' = 'gemini'
  private genAI: GoogleGenerativeAI | null = null

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY
    if (apiKey) {
      this.genAI = new GoogleGenerativeAI(apiKey)
    } else {
      console.warn('GEMINI_API_KEY is not set. Gemini provider will not be available.')
    }
  }

  isAvailable(): boolean {
    return this.genAI !== null
  }

  async generateText(request: TextGenerationRequest): Promise<string> {
    if (!this.genAI) {
      throw new Error('Gemini API key is not configured')
    }

    const prompt = await this.createStoryPrompt(request)

    // Try gemini-2.5-flash first (faster, cheaper), fallback to gemini-2.5-pro
    try {
      const model = this.genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })
      const result = await model.generateContent(prompt)
      const response = await result.response
      return response.text()
    } catch (error: any) {
      console.error('Error generating story with gemini-2.5-flash:', error)

      // If gemini-2.5-flash fails, try gemini-2.5-pro as fallback
      if (error.message?.includes('404') || error.message?.includes('not found')) {
        console.log('Trying fallback model: gemini-2.5-pro')
        try {
          const fallbackModel = this.genAI.getGenerativeModel({ model: 'gemini-2.5-pro' })
          const result = await fallbackModel.generateContent(prompt)
          const response = await result.response
          return response.text()
        } catch (fallbackError: any) {
          console.error('Fallback model also failed:', fallbackError)
          throw new Error(
            `Failed to generate story with Gemini. ` +
            `Error: ${fallbackError?.message || error.message}. ` +
            `Please verify your GEMINI_API_KEY is valid and has access to Gemini models.`
          )
        }
      }

      throw error
    }
  }

  /**
   * Analyze an image using Gemini's vision capabilities
   */
  async analyzeImage(base64Image: string, prompt?: string): Promise<string> {
    if (!this.genAI) {
      throw new Error('Gemini API key is not configured')
    }

    try {
      // Use gemini-2.0-flash-exp which supports vision
      const model = this.genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' })

      // Convert base64 to the format Gemini expects
      const imagePart = {
        inlineData: {
          data: base64Image.replace(/^data:image\/\w+;base64,/, ''),
          mimeType: 'image/jpeg',
        },
      }

      const defaultPrompt = 'Describe this image in detail.'
      const result = await model.generateContent([prompt || defaultPrompt, imagePart])
      const response = await result.response
      return response.text()
    } catch (error: any) {
      console.error('Error analyzing image with Gemini:', error)
      throw new Error(
        `Failed to analyze image with Gemini. ` +
        `Error: ${error?.message}. ` +
        `Please verify your GEMINI_API_KEY is valid and has access to vision models.`
      )
    }
  }

  /**
   * Create a story prompt from the request
   */
  private async createStoryPrompt(request: TextGenerationRequest): Promise<string> {
    // If custom prompt is provided, use it directly (for enhancements/rewrites)
    if (request.customPrompt) {
      return request.customPrompt
    }

    const { childName, adjectives, theme, moral, children } = request as any
    const templateId = (request as any).templateId // Type assertion for templateId

    const isMultiChild = children && Array.isArray(children) && children.length > 0
    const moralText = moral ? ` The story should teach the moral: ${moral}.` : ''

    // Load template if provided
    let templateEnhancement = ''
    if (templateId) {
      try {
        const { getTemplateById } = await import('@/lib/stories/templates')
        const template = getTemplateById(templateId)
        if (template) {
          templateEnhancement = `\n\nStory Template: ${template.name}\n${template.promptEnhancement}\n\nStory Structure: ${template.structure}`
        }
      } catch (error) {
        console.warn('Failed to load template:', error)
      }
    }

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

Theme: ${theme}${moralText}${templateEnhancement}

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

Theme: ${theme}${moralText}${templateEnhancement}

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



