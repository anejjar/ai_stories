/**
 * Illustrated Book Generation Helper
 * Handles the creation of illustrated story books with consistent character representation
 */

import { getProviderManager } from './provider-manager'
import type { ImageGenerationRequest } from './types'
import type { ChildAppearance } from '@/types'
import {
  buildEnhancedIllustrationPrompt,
  buildAppearanceDescription,
  determineCharacterTier,
  determineMoodFromScene,
  selectArtStyle,
  type IllustrationRequest
} from './illustration-prompt-builder'

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
 * Supports 3-tier character rendering: photo description > appearance settings > environment only
 */
export async function generateIllustratedBook(params: {
  childName: string
  adjectives: string[]
  theme: string
  moral?: string
  templateId?: string
  aiDescription?: string // AI description from profile picture (Tier 1)
  appearance?: ChildAppearance // Manual appearance settings (Tier 2)
  profileImageUrl?: string // Profile image URL for reference
  childAge?: number // Optional age for better appearance descriptions
}): Promise<IllustratedBookResult> {
  const providerManager = getProviderManager()

  // Step 1: Generate story content structured into 5-7 scenes
  const storyPrompt = buildIllustratedStoryPrompt({
    childName: params.childName,
    adjectives: params.adjectives,
    theme: params.theme,
    moral: params.moral,
    childAge: params.childAge
  })
  const storyContent = await providerManager.generateText({
    childName: params.childName,
    adjectives: params.adjectives,
    theme: params.theme,
    moral: params.moral,
    templateId: params.templateId,
    customPrompt: storyPrompt,
  })

  // Determine character rendering tier
  const characterTier = determineCharacterTier(params.aiDescription, params.appearance)

  // Build character description based on tier
  let characterDescription: string | undefined
  let includeCharacter = true

  if (characterTier === 'photo' && params.aiDescription) {
    characterDescription = params.aiDescription
  } else if (characterTier === 'appearance' && params.appearance) {
    characterDescription = buildAppearanceDescription(
      params.appearance,
      params.childName,
      params.childAge
    )
  } else {
    // Tier 3: No character data - environment only
    includeCharacter = false
    characterDescription = undefined
  }

  console.log(`Using character rendering tier: ${characterTier}`)
  if (characterDescription) {
    console.log(`Character description: ${characterDescription}`)
  }

  // Step 2: Split story into scenes (5-7 scenes)
  const scenes = extractScenesFromStory(
    storyContent,
    params.childName,
    params.theme,
    characterDescription,
    includeCharacter,
    params.profileImageUrl
  )

  // Step 3: Generate illustrations for each scene
  const bookPages: BookPage[] = []

  for (let i = 0; i < scenes.length; i++) {
    const scene = scenes[i]

    try {
      console.log(`Generating illustration ${i + 1}/${scenes.length} for illustrated book...`)
      console.log(`Scene ${i + 1} prompt length: ${scene.illustrationPrompt.length} chars`)

      const imageRequest: ImageGenerationRequest = {
        prompt: scene.illustrationPrompt,
        count: 1,
        size: '1024x1792', // Portrait mode for better book layout
        style: 'vivid', // Use vivid style for more engaging illustrations
      }

      const urls = await providerManager.generateImages(imageRequest)

      if (!urls || urls.length === 0 || !urls[0]) {
        throw new Error('No image URL returned from provider')
      }

      console.log(`Image URL length: ${urls[0].length} chars`)

      bookPages.push({
        pageNumber: i + 1,
        text: scene.text,
        illustration_url: urls[0],
      })

      console.log(`✅ Successfully generated illustration ${i + 1}/${scenes.length}`)
    } catch (error) {
      console.error(`❌ Error generating illustration for scene ${i + 1}:`, error)
      console.error('Error details:', {
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      })
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
  childAge?: number
}): string {
  const adjectivesStr = params.adjectives.join(', ')
  const moralSection = params.moral ? `\nMoral/Lesson: ${params.moral}` : ''

  return `Create a magical children's story about ${params.childName}, a ${adjectivesStr} child.
Theme: ${params.theme}${moralSection}

IMPORTANT STRUCTURE:
1. Divide the story into exactly 5-7 distinct scenes, separated by double line breaks.
2. Each scene must have a clear visual focus for illustration.
3. Include **BOLD ALL CAPS** for sound effects (e.g., **WHOOSH**, **CRACKLE**) to help parents read aloud.
4. Include 2-3 interaction cues in [brackets] (e.g., [Action: Point to the dragon], [Sound: Make a soft wind sound]).
5. Include 2-3 "Sparkle Words" (advanced vocabulary) explained naturally in context.
6. The final scene must include a "Bedtime Bridge" with rhythmic, calming language to help the child settle for sleep.

The story should:
- Be engaging and age-appropriate (for a ${params.childAge || 5} year old)
- Have clear visual moments perfect for illustration
- Show ${params.childName} as an active protagonist
- Be 400-600 words total
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
  characterDescription: string | undefined,
  includeCharacter: boolean,
  profileImageUrl?: string
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
      // Determine art style ONCE for the entire story (use neutral mood for consistency)
      const storyArtStyle = selectArtStyle(theme, 'exciting')
      const totalScenes = altSections.length

      return altSections.map((section, index) =>
        createBookScene(section, index + 1, totalScenes, childName, theme, characterDescription, includeCharacter, storyArtStyle, profileImageUrl)
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

    // Determine art style ONCE for the entire story
    const storyArtStyle = selectArtStyle(theme, 'exciting')
    const totalScenes = generatedSections.length

    return generatedSections.map((section, index) =>
      createBookScene(section, index + 1, totalScenes, childName, theme, characterDescription, includeCharacter, storyArtStyle, profileImageUrl)
    )
  }

  // Determine art style ONCE for the entire story
  const storyArtStyle = selectArtStyle(theme, 'exciting')
  const totalScenes = sections.length

  return sections.map((section, index) =>
    createBookScene(section, index + 1, totalScenes, childName, theme, characterDescription, includeCharacter, storyArtStyle, profileImageUrl)
  )
}

/**
 * Extract the key visual moment from scene text
 */
function extractKeyVisualMoment(text: string, childName: string): string {
  // Find action verbs and key moments in the text
  const lowerText = text.toLowerCase()

  // Common action patterns to identify key moments
  const actionPatterns = [
    /(?:was |were |is |are |started |began )([\w\s]+ing)/i,  // Progressive verbs
    new RegExp(`${childName.toLowerCase()}[^.!?]*?(discovered|found|saw|met|touched|held|climbed|jumped|ran|flew|opened|closed|picked|grabbed|hugged|smiled|laughed|cried|looked|gazed|pointed|waved|danced|sang|played|built|created|drew|painted)`, 'i'),
  ]

  // Try to find a clear action
  for (const pattern of actionPatterns) {
    const match = text.match(pattern)
    if (match) {
      // Extract sentence containing the action
      const sentences = text.split(/[.!?]/)
      for (const sentence of sentences) {
        if (sentence.toLowerCase().includes(match[0].toLowerCase())) {
          return sentence.trim()
        }
      }
    }
  }

  // Fallback: use first meaningful sentence
  const sentences = text.split(/[.!?]/).filter(s => s.trim().length > 20)
  return sentences[0]?.trim() || text.substring(0, 200).trim()
}

/**
 * Create a book scene with illustration prompt
 */
function createBookScene(
  text: string,
  sceneNumber: number,
  totalScenes: number,
  childName: string,
  theme: string,
  characterDescription: string | undefined,
  includeCharacter: boolean,
  storyArtStyle: 'classic-picture-book' | 'watercolor' | 'modern-flat' | 'whimsical',
  profileImageUrl?: string
): BookScene {
  // Extract the ONE key visual moment from the scene
  const keyMoment = extractKeyVisualMoment(text, childName)

  // Create simple, focused description
  const simplifiedMoment = keyMoment
    .replace(/[^\w\s.,!?-]/g, '')
    .replace(/\s+/g, ' ')
    .trim()

  // Determine mood from scene (still use for emotional tone, but not for art style)
  const mood = determineMoodFromScene(text)

  // Build enhanced illustration prompt with 3-tier character system
  const illustrationRequest: IllustrationRequest = {
    sceneDescription: simplifiedMoment,
    childName,
    childDescription: characterDescription,
    theme,
    mood,
    artStyle: storyArtStyle, // Use story-level art style for consistency
    includeCharacter,
    profileImageUrl,
    sceneNumber, // Pass scene context for consistency instructions
    totalScenes,
  }

  const illustrationPrompt = buildEnhancedIllustrationPrompt(illustrationRequest)

  // Log prompt details for debugging
  console.log(`Scene ${sceneNumber}/${totalScenes} - Character: ${includeCharacter}, Style: ${storyArtStyle}, Prompt: ${illustrationPrompt.length} chars`)

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
    // Extract key visual moment
    const keyMoment = extractKeyVisualMoment(section, children[0]?.name || '')

    const simplifiedMoment = keyMoment
      .replace(/[^\w\s.,!?-]/g, '')
      .replace(/\s+/g, ' ')
      .trim()

    // Build character descriptions (use first child's description, mention others in scene)
    const mainChildName = children[0]?.name || ''
    const mainChildDesc = children[0]?.aiDescription || 'friendly child'
    const otherChildren = children.slice(1).map(c => c.name).join(', ')
    const childDescription = otherChildren
      ? `${mainChildDesc}. With friends: ${otherChildren}`
      : mainChildDesc

    // Determine mood and art style
    const mood = determineMoodFromScene(section)
    const artStyle = selectArtStyle(theme, mood)

    // Build enhanced illustration prompt
    const illustrationRequest: IllustrationRequest = {
      sceneDescription: simplifiedMoment,
      childName: mainChildName,
      childDescription: childDescription,
      theme,
      mood,
      artStyle,
    }

    return buildEnhancedIllustrationPrompt(illustrationRequest)
  })
}
