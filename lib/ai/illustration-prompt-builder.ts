/**
 * Illustration Prompt Builder
 * Creates consistent, high-quality illustration prompts with art style and color palette control
 */

import type { ChildAppearance } from '@/types'

export interface IllustrationRequest {
  sceneDescription: string
  childName: string
  childDescription?: string
  theme: string
  mood?: 'calm' | 'exciting' | 'magical' | 'adventurous' | 'cozy'
  artStyle?: 'classic-picture-book' | 'watercolor' | 'modern-flat' | 'whimsical'
  includeCharacter?: boolean // If false, generate environment-only illustrations
  profileImageUrl?: string // Optional reference image URL for better consistency
  sceneNumber?: number // Current scene number (e.g., 3)
  totalScenes?: number // Total number of scenes in story (e.g., 7)
}

interface ArtStyleGuide {
  description: string
  techniques: string
  characteristics: string[]
  referenceArtists: string[]
}

interface ColorPalette {
  primary: string
  secondary: string
  accent: string
  background: string
  lighting: string
  mood: string
}

const ART_STYLES: Record<string, ArtStyleGuide> = {
  'classic-picture-book': {
    description: 'Warm, timeless children\'s book illustration style',
    techniques: 'Watercolor and ink, hand-drawn quality, slightly imperfect lines add charm',
    characteristics: [
      'Simple, bold shapes',
      'Clear outlines with varied line weight',
      'Soft color blending',
      'Textured paper feel',
      'Friendly, approachable characters',
      'Balance of detail and simplicity',
    ],
    referenceArtists: ['Eric Carle', 'Oliver Jeffers', 'Maurice Sendak'],
  },
  'watercolor': {
    description: 'Soft, dreamy watercolor illustration',
    techniques: 'Wet-on-wet watercolor, color bleeding, transparent layers',
    characteristics: [
      'Soft edges and gentle transitions',
      'Light, airy feeling',
      'Visible brush strokes',
      'White space integration',
      'Delicate color washes',
      'Atmospheric depth',
    ],
    referenceArtists: ['Beatrix Potter', 'Shirley Hughes'],
  },
  'modern-flat': {
    description: 'Contemporary flat design with bold colors',
    techniques: 'Digital illustration, geometric shapes, flat colors',
    characteristics: [
      'Minimal shading',
      'Bold, vibrant colors',
      'Geometric simplified forms',
      'Clear composition',
      'Strong contrasts',
      'Playful proportions',
    ],
    referenceArtists: ['Herve Tullet', 'Ellsworth Kelly'],
  },
  'whimsical': {
    description: 'Playful, imaginative illustration with personality',
    techniques: 'Mixed media feel, expressive lines, creative details',
    characteristics: [
      'Exaggerated features',
      'Playful proportions',
      'Creative textures',
      'Unexpected details',
      'Energetic linework',
      'Personality in every element',
    ],
    referenceArtists: ['Quentin Blake', 'Lane Smith', 'Mo Willems'],
  },
}

const THEME_COLOR_PALETTES: Record<string, ColorPalette> = {
  Space: {
    primary: 'Deep indigo and cosmic purple',
    secondary: 'Bright star white and silver',
    accent: 'Electric blue, cyan, and pink nebula colors',
    background: 'Dark space with distant galaxies, gradients from black to deep blue',
    lighting: 'Soft glow from stars and planets, rim lighting on character',
    mood: 'Sense of wonder and infinite possibility',
  },
  Ocean: {
    primary: 'Turquoise and sea blue',
    secondary: 'Sandy yellows and coral pinks',
    accent: 'Bright tropical fish colors, purple sea anemones',
    background: 'Underwater gradient from light turquoise to deep blue, dappled sunlight',
    lighting: 'Filtered underwater sunbeams, caustic light patterns',
    mood: 'Peaceful exploration with pockets of excitement',
  },
  Fantasy: {
    primary: 'Royal purple and soft pink',
    secondary: 'Sparkle silver and gold accents',
    accent: 'Rainbow gradients, magical glows',
    background: 'Enchanted forest or castle with atmospheric mist',
    lighting: 'Magical sparkles, soft ethereal glow, warm ambient light',
    mood: 'Magical and full of wonder',
  },
  Nature: {
    primary: 'Forest green and earth brown',
    secondary: 'Sky blue and cloud white',
    accent: 'Wildflower colors, autumn leaves, bright berries',
    background: 'Natural outdoor setting, trees, grass, sky',
    lighting: 'Warm natural sunlight filtering through leaves, golden hour',
    mood: 'Peaceful, grounded, alive',
  },
  Dinosaurs: {
    primary: 'Prehistoric greens and earth tones',
    secondary: 'Volcanic oranges and rocky grays',
    accent: 'Bright dinosaur patterns, exotic plants',
    background: 'Prehistoric landscape with volcanoes, ferns, palm trees',
    lighting: 'Strong prehistoric sun, dramatic shadows',
    mood: 'Adventurous and slightly wild',
  },
  Superhero: {
    primary: 'Bold primary colors - red, blue, yellow',
    secondary: 'City grays and steel',
    accent: 'Energy effects in bright cyan and yellow, action lines',
    background: 'Stylized cityscape with geometric buildings',
    lighting: 'Dynamic lighting, strong highlights, heroic backlighting',
    mood: 'Powerful, energetic, triumphant',
  },
  Princess: {
    primary: 'Soft pinks and royal purples',
    secondary: 'Pearl white and cream',
    accent: 'Gold, sparkles, jewel tones',
    background: 'Castle interior or garden with flowers',
    lighting: 'Soft, flattering light with sparkly highlights',
    mood: 'Elegant, magical, regal',
  },
  Robots: {
    primary: 'Metallic silvers and blues',
    secondary: 'Circuit board greens and tech oranges',
    accent: 'Glowing screens, LED lights, energy cores',
    background: 'Futuristic lab or tech city with geometric patterns',
    lighting: 'Cool LED lighting, screen glows, technical precision',
    mood: 'Innovative, precise, friendly technology',
  },
  Adventure: {
    primary: 'Earth tones - browns, greens, sand',
    secondary: 'Sky blue and cloud white',
    accent: 'Sunrise gold, campfire orange, map colors',
    background: 'Outdoor adventure setting - mountains, forests, trails',
    lighting: 'Dynamic outdoor lighting, sun breaking through clouds',
    mood: 'Exciting, brave, exploratory',
  },
  Magic: {
    primary: 'Deep mystical purple and violet',
    secondary: 'Starlight silver and moon white',
    accent: 'Spell effects - sparkles, swirls, magical colors',
    background: 'Mysterious magical setting with atmospheric effects',
    lighting: 'Magical glows, mysterious shadows, enchanted ambiance',
    mood: 'Mysterious, wonderful, transformative',
  },
  Friendship: {
    primary: 'Warm yellows and friendly oranges',
    secondary: 'Gentle pinks and happy greens',
    accent: 'Rainbow variety showing diversity',
    background: 'Cozy, relatable settings - playgrounds, homes, parks',
    lighting: 'Warm, inviting light that brings people together',
    mood: 'Warm, joyful, connected',
  },
  Learning: {
    primary: 'Smart blues and knowledge greens',
    secondary: 'Paper whites and book browns',
    accent: 'Lightbulb yellow for ideas, colorful learning tools',
    background: 'Classroom, library, or creative learning space',
    lighting: 'Clear, bright lighting that enhances focus',
    mood: 'Curious, inspired, accomplished',
  },
  Pirates: {
    primary: 'Ocean blues and ship wood browns',
    secondary: 'Sail white and rope tan',
    accent: 'Gold treasure, pirate flag black, tropical colors',
    background: 'Ship deck, tropical island, ocean waves',
    lighting: 'Bright nautical sun, sparkling water reflections',
    mood: 'Adventurous, playful, treasure-hunting excitement',
  },
}

const COMPOSITION_RULES = {
  characterPlacement: 'Character in lower third for grounding, or center for focus. Use rule of thirds.',
  focusPoint: 'Main action or character should be the clear focal point. Guide eye with lines and contrasts.',
  backgroundSimplicity: 'Simple background with 2-4 main elements maximum. Don\'t compete with main character.',
  balanceAndFlow: 'Visual balance across the image. Create flow that leads eye to important elements.',
  scaleAndProportion: 'Character should be prominent (20-40% of image). Show environment without overwhelming.',
  depthAndLayers: 'Create depth with foreground, middle ground, background. Use size and detail to show distance.',
}

/**
 * Build detailed character description from appearance settings
 * Used when profile picture is not available but manual appearance is provided
 */
export function buildAppearanceDescription(
  appearance: ChildAppearance,
  childName: string,
  age?: number
): string {
  const parts: string[] = []

  // Age descriptor
  const ageDescriptor = age
    ? age < 5 ? 'young' : age < 8 ? 'school-age' : 'older'
    : 'young'

  parts.push(`${ageDescriptor} child`)

  // Skin tone
  if (appearance.skinTone && appearance.skinTone !== 'none') {
    const skinToneMap: Record<string, string> = {
      'light': 'fair skin tone',
      'medium-light': 'light-medium skin tone',
      'medium': 'medium skin tone',
      'medium-dark': 'medium-dark skin tone',
      'dark': 'rich dark skin tone'
    }
    const skinDesc = skinToneMap[appearance.skinTone]
    if (skinDesc) parts.push(`with ${skinDesc}`)
  }

  // Hair
  const hairParts: string[] = []
  if (appearance.hairStyle && appearance.hairStyle !== 'none') {
    hairParts.push(appearance.hairStyle)
  }
  if (appearance.hairColor && appearance.hairColor !== 'none') {
    hairParts.push(appearance.hairColor)
  }
  if (hairParts.length > 0) {
    parts.push(`${hairParts.join(' ')} hair`)
  }

  // Add personality traits for more life
  parts.push('with a friendly, expressive face and bright, curious eyes')

  return parts.join(', ')
}

/**
 * Determine character rendering tier based on available data
 */
export function determineCharacterTier(
  aiDescription?: string,
  appearance?: ChildAppearance
): 'photo' | 'appearance' | 'none' {
  // Tier 1: Has AI description from profile picture
  if (aiDescription && aiDescription.trim().length > 0) {
    return 'photo'
  }

  // Tier 2: Has manual appearance settings
  if (appearance) {
    const hasAnyAppearance =
      (appearance.skinTone && appearance.skinTone !== 'none') ||
      (appearance.hairColor && appearance.hairColor !== 'none') ||
      (appearance.hairStyle && appearance.hairStyle !== 'none')

    if (hasAnyAppearance) {
      return 'appearance'
    }
  }

  // Tier 3: No character data
  return 'none'
}

export function buildEnhancedIllustrationPrompt(request: IllustrationRequest): string {
  const artStyle = request.artStyle || 'classic-picture-book'
  const styleGuide = ART_STYLES[artStyle]
  const colorPalette = THEME_COLOR_PALETTES[request.theme] || THEME_COLOR_PALETTES['Fantasy']
  const mood = request.mood || 'exciting'

  // Clean and simplify scene description
  const cleanScene = request.sceneDescription
    .replace(/[^\w\s.,!?-]/g, '')
    .replace(/\s+/g, ' ')
    .trim()

  // Check if we should include character or just environment
  const includeCharacter = request.includeCharacter !== false

  // Build prompt based on whether character is included
  let prompt: string

  if (includeCharacter && request.childDescription) {
    // Character-focused illustration with detailed description
    const consistencyNote = request.profileImageUrl
      ? 'IMPORTANT: Maintain exact same character appearance as reference throughout all illustrations.'
      : 'IMPORTANT: Keep character appearance consistent with this description.'

    const sceneContext = request.sceneNumber && request.totalScenes
      ? `\n\nStory Continuity: This is scene ${request.sceneNumber} of ${request.totalScenes}. Use EXACTLY the same art style, line weight, color palette, and rendering technique as all other scenes in this story. The visual style must be indistinguishable between illustrations - same brushwork, same level of detail, same artistic choices throughout.`
      : ''

    prompt = `Children's book illustration: ${cleanScene}

Character: ${request.childName}, ${request.childDescription}. Make ${request.childName} the clear focal point with expressive ${mood} emotion. ${consistencyNote}

${request.profileImageUrl ? `Reference: Character appearance based on provided profile image for visual consistency.` : ''}

Style: ${styleGuide.description}. ${styleGuide.techniques}. ${styleGuide.characteristics.slice(0, 3).join(', ')}. Inspired by ${styleGuide.referenceArtists[0]} style.

Colors (${request.theme}): ${colorPalette.primary}, ${colorPalette.secondary}. ${colorPalette.lighting}. ${colorPalette.mood}.

Composition: ${request.childName} in lower third or center (rule of thirds). Simple background with 2-4 elements. Character prominent (30% of image). Clear depth with foreground/background layers.

Mood: ${mood.charAt(0).toUpperCase() + mood.slice(1)}, warm, safe, perfect for bedtime.${sceneContext}

Professional quality, single focused moment, ages 3-8, never scary.

NO: text, words, letters, speech bubbles, multiple scenes, cluttered backgrounds, photorealism, dark elements.`
  } else if (includeCharacter) {
    // Generic friendly child (fallback)
    prompt = `Children's book illustration: ${cleanScene}

Character: ${request.childName}, friendly child. Make ${request.childName} the clear focal point with expressive ${mood} emotion.

Style: ${styleGuide.description}. ${styleGuide.techniques}. ${styleGuide.characteristics.slice(0, 3).join(', ')}. Inspired by ${styleGuide.referenceArtists[0]} style.

Colors (${request.theme}): ${colorPalette.primary}, ${colorPalette.secondary}. ${colorPalette.lighting}. ${colorPalette.mood}.

Composition: ${request.childName} in lower third or center (rule of thirds). Simple background with 2-4 elements. Character prominent (30% of image). Clear depth with foreground/background layers.

Mood: ${mood.charAt(0).toUpperCase() + mood.slice(1)}, warm, safe, perfect for bedtime.

Professional quality, single focused moment, ages 3-8, never scary.

NO: text, words, letters, speech bubbles, multiple scenes, cluttered backgrounds, photorealism, dark elements.`
  } else {
    // Environment-only illustration (no character)
    // Remove character name from scene description
    const environmentScene = cleanScene
      .replace(new RegExp(request.childName, 'gi'), 'the scene')
      .replace(/\b(he|she|they|him|her|them)\b/gi, 'it')
      .replace(/character|person|child/gi, 'element')

    const sceneContext = request.sceneNumber && request.totalScenes
      ? `\n\nStory Continuity: This is scene ${request.sceneNumber} of ${request.totalScenes}. Maintain EXACTLY the same art style, color treatment, lighting approach, and atmospheric rendering as all other scenes. The environment/landscape style must be visually cohesive with the entire story - same artistic technique, same brushwork quality, same level of detail throughout.`
      : ''

    prompt = `Children's book illustration: ${environmentScene}

Focus: Beautiful ${request.theme.toLowerCase()} environment and setting. NO characters or people. Focus entirely on the landscape, scenery, and atmosphere.

Style: ${styleGuide.description}. ${styleGuide.techniques}. ${styleGuide.characteristics.slice(0, 3).join(', ')}. Inspired by ${styleGuide.referenceArtists[0]} style.

Colors (${request.theme}): ${colorPalette.primary}, ${colorPalette.secondary}. ${colorPalette.lighting}. ${colorPalette.mood}.

Composition: Establish a clear focal point in the environment. Simple, uncluttered scene with 2-4 main elements. Create depth with foreground, middle ground, and background layers. Use leading lines and natural framing.

Mood: ${mood.charAt(0).toUpperCase() + mood.slice(1)}, atmospheric, immersive, inviting. Create a sense of wonder through the environment alone.${sceneContext}

Professional quality, single focused scene, ages 3-8, never scary.

NO: people, characters, animals with human features, text, words, letters, multiple scenes, cluttered backgrounds, photorealism, dark elements.`
  }

  // Safety check: if prompt is too long, truncate the scene description
  // Prevent infinite recursion by checking if we're already at minimum scene length
  const MIN_SCENE_LENGTH = 50
  const MAX_PROMPT_LENGTH = 1500

  if (prompt.length > MAX_PROMPT_LENGTH && cleanScene.length > MIN_SCENE_LENGTH) {
    console.warn(`⚠️ Illustration prompt too long (${prompt.length} chars), truncating scene...`)

    // Calculate how much we need to reduce the scene description
    const excessLength = prompt.length - MAX_PROMPT_LENGTH
    const targetSceneLength = Math.max(MIN_SCENE_LENGTH, cleanScene.length - excessLength - 100) // Extra buffer

    // Only recurse if we can actually make it shorter
    if (targetSceneLength < cleanScene.length) {
      const truncatedScene = cleanScene.substring(0, targetSceneLength)
      return buildEnhancedIllustrationPrompt({
        ...request,
        sceneDescription: truncatedScene
      })
    }
  }

  // If we can't truncate further, just return what we have
  // OpenAI will handle prompts slightly over 1500 chars
  return prompt
}

/**
 * Determine appropriate mood from scene description
 */
export function determineMoodFromScene(sceneText: string): 'calm' | 'exciting' | 'magical' | 'adventurous' | 'cozy' {
  const lower = sceneText.toLowerCase()

  if (lower.match(/(sleep|rest|calm|peaceful|gentle|quiet|soft)/)) {
    return 'calm'
  }
  if (lower.match(/(magic|spell|fairy|enchant|glow|sparkle|transform)/)) {
    return 'magical'
  }
  if (lower.match(/(climb|jump|run|fly|race|chase|adventure|explore)/)) {
    return 'exciting'
  }
  if (lower.match(/(discover|journey|quest|brave|mountain|ocean|forest)/)) {
    return 'adventurous'
  }
  if (lower.match(/(home|hug|friend|warm|comfort|safe|together)/)) {
    return 'cozy'
  }

  return 'exciting' // default
}

/**
 * Select appropriate art style for theme and mood
 */
export function selectArtStyle(theme: string, mood: string): 'classic-picture-book' | 'watercolor' | 'modern-flat' | 'whimsical' {
  // Calm/gentle themes work well with watercolor
  if (mood === 'calm' || mood === 'cozy') {
    return 'watercolor'
  }

  // Magical/fantasy themes often benefit from whimsical style
  if (theme === 'Fantasy' || theme === 'Magic' || mood === 'magical') {
    return 'whimsical'
  }

  // Modern themes like Robots work well with flat design
  if (theme === 'Robots' || theme === 'Superhero') {
    return 'modern-flat'
  }

  // Default to classic picture book style - versatile and timeless
  return 'classic-picture-book'
}
