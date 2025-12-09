/**
 * Illustrated Book Generation Helper
 * Handles the creation of illustrated story books with consistent character representation
 */

import { getProviderManager } from './provider-manager'
import type { ImageGenerationRequest } from './types'

export interface BookScene {
  sceneNumber: number
  text: string
  illustrationPrompt: string
}

export interface BookPage {
  pageNumber: number
  text: string
  illustration_url: string
}

export interface IllustratedBookResult {
  content: string // Full story text
  bookPages: BookPage[]
  scenes: BookScene[]
}

/**
 * Generate an illustrated book with consistent character representation
 */
export async function generateIllustratedBook(params: {
  childName: string
  adjectives: string[]
  theme: string
  moral?: string
  templateId?: string
  aiDescription: string // AI description of child from profile
  profileImageUrl: string // Child's profile image URL
}): Promise<IllustratedBookResult> {
  const providerManager = getProviderManager()

  // Step 1: Generate story content structured into 5-7 scenes
  const storyPrompt = buildIllustratedStoryPrompt(params)
  const storyContent = await providerManager.generateText({
    childName: params.childName,
    adjectives: params.adjectives,
    theme: params.theme,
    moral: params.moral,
    templateId: params.templateId,
    customPrompt: storyPrompt,
  })

  // Step 2: Split story into scenes (5-7 scenes)
  const scenes = extractScenesFromStory(storyContent, params.childName, params.theme, params.aiDescription)

  // Step 3: Generate illustrations for each scene
  const bookPages: BookPage[] = []

  for (let i = 0; i < scenes.length; i++) {
    const scene = scenes[i]

    try {
      console.log(`Generating illustration ${i + 1}/${scenes.length} for illustrated book...`)

      const imageRequest: ImageGenerationRequest = {
        prompt: scene.illustrationPrompt,
        count: 1,
        size: '1024x1024',
        style: 'vivid', // Use vivid style for more engaging illustrations
      }

      const urls = await providerManager.generateImages(imageRequest)

      bookPages.push({
        pageNumber: i + 1,
        text: scene.text,
        illustration_url: urls[0],
      })

      console.log(`Successfully generated illustration ${i + 1}/${scenes.length}`)
    } catch (error) {
      console.error(`Error generating illustration for scene ${i + 1}:`, error)
      // Create placeholder page with error message
      bookPages.push({
        pageNumber: i + 1,
        text: scene.text,
        illustration_url: '', // Empty URL indicates illustration failed
      })
    }
  }

  // Filter out pages without illustrations (if any failed)
  const successfulPages = bookPages.filter(page => page.illustration_url !== '')

  if (successfulPages.length === 0) {
    throw new Error('Failed to generate any illustrations for the story book')
  }

  return {
    content: storyContent,
    bookPages: successfulPages,
    scenes,
  }
}

/**
 * Build a story prompt optimized for illustrated book format
 */
function buildIllustratedStoryPrompt(params: {
  childName: string
  adjectives: string[]
  theme: string
  moral?: string
}): string {
  const adjectivesStr = params.adjectives.join(', ')
  const moralSection = params.moral ? `\nMoral/Lesson: ${params.moral}` : ''

  return `Create a children's story about ${params.childName}, a ${adjectivesStr} child.
Theme: ${params.theme}${moralSection}

IMPORTANT: Structure the story into exactly 5-7 distinct scenes/sections, separated by double line breaks.
Each scene should be 2-3 paragraphs and represent a key moment in the story that can be illustrated.
Make ${params.childName} the main hero who takes action and drives the story forward.

The story should:
- Be engaging and age-appropriate (4-8 years old)
- Have clear visual moments perfect for illustration
- Show ${params.childName} as an active protagonist
- Be 300-500 words total
- Have a clear beginning, middle, and end
- Be wholesome and educational

Remember: Each scene will have its own illustration, so make each scene visually distinct and exciting!`
}

/**
 * Extract scenes from generated story content
 */
function extractScenesFromStory(
  content: string,
  childName: string,
  theme: string,
  aiDescription: string
): BookScene[] {
  // Split by double line breaks to get scenes/sections
  const sections = content
    .split('\n\n')
    .filter(section => section.trim().length > 50)
    .slice(0, 7) // Max 7 scenes

  // Ensure we have 5-7 scenes
  if (sections.length < 5) {
    // If we have fewer than 5 sections, try splitting by single line breaks
    const altSections = content
      .split('\n')
      .filter(section => section.trim().length > 50)
      .slice(0, 7)

    if (altSections.length >= 5) {
      return altSections.map((section, index) =>
        createBookScene(section, index + 1, childName, theme, aiDescription)
      )
    }

    // If still not enough, split the content into equal parts
    const wordsPerScene = Math.ceil(content.split(' ').length / 5)
    const words = content.split(' ')
    const generatedSections: string[] = []

    for (let i = 0; i < 5; i++) {
      const start = i * wordsPerScene
      const end = Math.min((i + 1) * wordsPerScene, words.length)
      generatedSections.push(words.slice(start, end).join(' '))
    }

    return generatedSections.map((section, index) =>
      createBookScene(section, index + 1, childName, theme, aiDescription)
    )
  }

  return sections.map((section, index) =>
    createBookScene(section, index + 1, childName, theme, aiDescription)
  )
}

/**
 * Create a book scene with illustration prompt
 */
function createBookScene(
  text: string,
  sceneNumber: number,
  childName: string,
  theme: string,
  aiDescription: string
): BookScene {
  // Extract key visual elements from the text
  const scenePreview = text
    .substring(0, 300)
    .replace(/[^\w\s.,!?-]/g, '')
    .trim()

  // Build illustration prompt with AI description for character consistency
  const illustrationPrompt = `A beautiful, vibrant children's storybook illustration.
Scene: ${scenePreview}

Main character: ${childName} - ${aiDescription}

Style: High-quality children's book illustration, colorful, whimsical, warm and friendly atmosphere, ${theme.toLowerCase()} theme.
The illustration should clearly feature ${childName} as the hero of the scene.
Art style: Similar to modern children's picture books (Pixar/Disney style), with soft lighting, rich colors, and expressive characters.
Safe for children, no scary elements, positive and uplifting mood.

Technical: Professional quality, detailed but not overwhelming, perfect for a printed children's book, 8k resolution.`

  return {
    sceneNumber,
    text: text.trim(),
    illustrationPrompt,
  }
}

/**
 * Generate illustration prompts for multi-child stories
 */
export function generateMultiChildIllustrationPrompts(
  content: string,
  children: Array<{
    name: string
    aiDescription?: string
  }>,
  theme: string
): string[] {
  const sections = content
    .split('\n\n')
    .filter(section => section.trim().length > 50)
    .slice(0, 7)

  return sections.map((section, index) => {
    const scenePreview = section
      .substring(0, 300)
      .replace(/[^\w\s.,!?-]/g, '')
      .trim()

    // Build character descriptions
    const characterDescriptions = children
      .map(child => {
        const desc = child.aiDescription || ''
        return `${child.name}${desc ? ` - ${desc}` : ''}`
      })
      .join(', ')

    return `A beautiful, vibrant children's storybook illustration.
Scene: ${scenePreview}

Main characters: ${characterDescriptions}

Style: High-quality children's book illustration, colorful, whimsical, warm and friendly atmosphere, ${theme.toLowerCase()} theme.
All children should be featured as heroes of the scene, working together.
Art style: Similar to modern children's picture books (Pixar/Disney style), with soft lighting, rich colors, and expressive characters.
Safe for children, no scary elements, positive and uplifting mood.

Technical: Professional quality, detailed but not overwhelming, perfect for a printed children's book, 8k resolution.`
  })
}
