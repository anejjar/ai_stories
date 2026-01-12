// Anthropic Claude Provider

import type { AIProvider, TextGenerationRequest } from '../types'

// Lazy load Anthropic SDK to avoid build errors if package is not installed
let Anthropic: any = null
let anthropicLoaded = false

function loadAnthropic() {
  if (anthropicLoaded) {
    return Anthropic
  }
  
  try {
    // Use require for server-side, which Next.js handles
    Anthropic = require('@anthropic-ai/sdk')
    if (Anthropic.default) {
      Anthropic = Anthropic.default
    }
    anthropicLoaded = true
    return Anthropic
  } catch (error) {
    console.warn('@anthropic-ai/sdk is not installed. Anthropic provider will not be available.')
    anthropicLoaded = true
    return null
  }
}

export class AnthropicProvider implements AIProvider {
  name: 'anthropic' = 'anthropic'
  private client: Anthropic | null = null

  constructor() {
    const AnthropicSDK = loadAnthropic()
    
    if (!AnthropicSDK) {
      return
    }
    
    const apiKey = process.env.ANTHROPIC_API_KEY
    if (apiKey) {
      this.client = new AnthropicSDK({ 
        apiKey,
        timeout: 60000, // 60 seconds timeout
        maxRetries: 2,
      })
    } else {
      console.warn('ANTHROPIC_API_KEY is not set. Anthropic provider will not be available.')
    }
  }

  isAvailable(): boolean {
    const AnthropicSDK = loadAnthropic()
    return AnthropicSDK !== null && this.client !== null
  }

  async generateText(request: TextGenerationRequest): Promise<string> {
    const AnthropicSDK = loadAnthropic()
    
    if (!AnthropicSDK) {
      throw new Error('@anthropic-ai/sdk is not installed')
    }
    
    if (!this.client) {
      throw new Error('Anthropic API key is not configured')
    }

    const prompt = this.createStoryPrompt(request)

    try {
      const message = await this.client.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 2000,
        temperature: 0.8,
        system: 'You are a creative children\'s story writer. Write engaging, age-appropriate bedtime stories that are wholesome, educational, and kid-safe.',
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      })

      const content = message.content.find((block) => block.type === 'text')
      if (!content || content.type !== 'text') {
        throw new Error('Anthropic returned empty response')
      }

      return content.text
    } catch (error: any) {
      // Try fallback to claude-3-opus or claude-3-sonnet if claude-3-5-sonnet fails
      if (error.message?.includes('claude-3-5-sonnet') || error.status === 404) {
        const fallbackModels = ['claude-3-opus-20240229', 'claude-3-sonnet-20240229']
        
        for (const model of fallbackModels) {
          console.log(`Trying fallback model: ${model}`)
          try {
            const message = await this.client.messages.create({
              model: model as any,
              max_tokens: 2000,
              temperature: 0.8,
              system: 'You are a creative children\'s story writer. Write engaging, age-appropriate bedtime stories that are wholesome, educational, and kid-safe.',
              messages: [
                {
                  role: 'user',
                  content: prompt,
                },
              ],
            })

            const content = message.content.find((block) => block.type === 'text')
            if (content && content.type === 'text') {
              return content.text
            }
          } catch (fallbackError: any) {
            console.error(`Fallback model ${model} failed:`, fallbackError)
            continue
          }
        }

        throw new Error(
          `Failed to generate story with Anthropic. ` +
          `Error: ${error.message || 'All models failed'}`
        )
      }

      throw new Error(
        `Failed to generate story with Anthropic. ` +
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

