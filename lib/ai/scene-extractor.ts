/**
 * Scene Extraction Utility
 * Shared logic for extracting scenes from story content for consistent image generation
 */

import {
  buildEnhancedIllustrationPrompt,
  buildAppearanceDescription,
  determineCharacterTier,
  determineMoodFromScene,
  selectArtStyle,
  type IllustrationRequest
} from './illustration-prompt-builder'
import type { ChildAppearance } from '@/types'

export interface ExtractedScene {
  sceneNumber: number
  text: string
  illustrationPrompt: string
}

/**
 * Extract scenes from generated story content
 * Ensures 5-7 scenes with consistent art style across all scenes
 */
export function extractScenesFromStory(
  content: string,
  childName: string,
  theme: string,
  characterDescription: string | undefined,
  includeCharacter: boolean,
  profileImageUrl?: string
): ExtractedScene[] {
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
        createScene(section, index + 1, totalScenes, childName, theme, characterDescription, includeCharacter, storyArtStyle, profileImageUrl)
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
      createScene(section, index + 1, totalScenes, childName, theme, characterDescription, includeCharacter, storyArtStyle, profileImageUrl)
    )
  }

  // Determine art style ONCE for the entire story
  const storyArtStyle = selectArtStyle(theme, 'exciting')
  const totalScenes = sections.length

  return sections.map((section, index) =>
    createScene(section, index + 1, totalScenes, childName, theme, characterDescription, includeCharacter, storyArtStyle, profileImageUrl)
  )
}

/**
 * Extract the key visual moment from scene text
 */
export function extractKeyVisualMoment(text: string, childName: string): string {
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
 * Create a scene with illustration prompt
 */
function createScene(
  text: string,
  sceneNumber: number,
  totalScenes: number,
  childName: string,
  theme: string,
  characterDescription: string | undefined,
  includeCharacter: boolean,
  storyArtStyle: 'classic-picture-book' | 'watercolor' | 'modern-flat' | 'whimsical',
  profileImageUrl?: string
): ExtractedScene {
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
