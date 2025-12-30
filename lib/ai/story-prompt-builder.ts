/**
 * Story Prompt Builder
 * Creates enhanced, structured prompts for better story generation
 */

export interface EnhancedStoryRequest {
  childName: string
  adjectives: string[]
  theme: string
  moral?: string
  ageGroup?: 'toddler' | 'preschool' | 'early-elementary' | 'elementary' // 2-3, 4-5, 6-7, 8-9
  children?: Array<{
    name: string
    adjectives: string[]
  }>
}

interface AgeGuidelines {
  targetWords: number
  complexity: string
  sentenceStructure: string
  vocabulary: string
  emotionalDepth: string
}

const AGE_GUIDELINES: Record<string, AgeGuidelines> = {
  toddler: {
    targetWords: 300,
    complexity: 'Very simple cause-and-effect. Heavy use of repetition for memory and rhythm.',
    sentenceStructure: 'Short, simple sentences (5-8 words). Lots of repetition.',
    vocabulary: 'Basic, concrete words. Bold sounds and onomatopoeia (e.g., **SPLASH**, **ZOOM**, **BEEP**).',
    emotionalDepth: 'Simple emotions: happy, sad, excited. Clear and obvious.',
  },
  preschool: {
    targetWords: 450,
    complexity: 'Simple problem-solving. Clear sequence of events. Introduce friends/helpers.',
    sentenceStructure: 'Mix of short (5-8 words) and medium (10-12 words) sentences.',
    vocabulary: 'Familiar words with action words. Use bold onomatopoeia (e.g., **WHOOSH**, **CRUNCH**). Include 1-2 interaction cues in brackets like [Action: Tickle the child] or [Sound: Roar like a lion].',
    emotionalDepth: 'Basic emotions plus curiosity, surprise. Show feelings through actions.',
  },
  'early-elementary': {
    targetWords: 600,
    complexity: 'Problem-solving with choices. Multiple challenges. Character shows growth.',
    sentenceStructure: 'Varied sentence length. Some compound sentences. Natural dialogue.',
    vocabulary: 'Rich descriptive language. Include 2 "Sparkle Words" (advanced vocabulary explained in context). Include 2-3 interaction cues in brackets like [Parent: Ask the child what happens next].',
    emotionalDepth: 'Complex emotions: determination, pride, worry, relief. Internal thoughts.',
  },
  elementary: {
    targetWords: 750,
    complexity: 'Multi-step problem solving. Moral choices. Clear character transformation.',
    sentenceStructure: 'Sophisticated variety. Compound and complex sentences. Rich dialogue.',
    vocabulary: 'Advanced vocabulary. Metaphors and similes. Include 3 "Sparkle Words" (advanced vocabulary explained in context). Include 3 interaction cues in brackets for deep engagement.',
    emotionalDepth: 'Nuanced emotions: conflicted feelings, empathy, courage. Character introspection.',
  },
}

const EMOTIONAL_ARCS = {
  adventure: 'Curiosity → Excitement → Challenge → Determination → Achievement → Pride',
  friendship: 'Loneliness → Meeting → Connection → Conflict → Understanding → Deep Bond',
  discovery: 'Wonder → Exploration → Mystery → Revelation → Understanding → Awe',
  courage: 'Fear → Doubt → Decision → Action → Success → Confidence',
  kindness: 'Noticing Need → Empathy → Desire to Help → Action → Impact → Joy',
  learning: 'Confusion → Curiosity → Effort → Struggle → Breakthrough → Mastery',
  teamwork: 'Individual Effort → Frustration → Collaboration → Synergy → Success → Celebration',
}

const THEME_SENSORY_DETAILS: Record<string, string> = {
  Space: 'Twinkling stars, weightless floating, metallic spacecraft smell, smooth cold controls, hum of engines, colorful swirling nebulas',
  Ocean: 'Cool water on skin, salty taste, sound of waves, colorful coral, smooth fish scales, bubbles rising',
  Fantasy: 'Magical sparkles, sweet potion smells, soft fairy wings, mysterious fog, tinkling chimes, glowing crystals',
  Nature: 'Rustling leaves, earth smell, bird songs, rough tree bark, soft moss, sunlight through branches',
  Dinosaurs: 'Heavy footsteps, roaring sounds, prehistoric plants, rough dinosaur skin, warm sunshine, dusty ground',
  Superhero: 'Whooshing cape, powerful stance, city sounds, bright costume, energy crackling, wind rushing past',
  Princess: 'Silk dresses, castle echoes, sweet perfumes, sparkling jewels, soft cushions, royal trumpets',
  Robots: 'Metallic clanks, whirring gears, electronic beeps, smooth chrome surfaces, flashing lights, mechanical precision',
  Adventure: 'Mountain air, crunching footsteps, distant calls, rough rock surfaces, cool breeze, discovery excitement',
  Magic: 'Magical tingles, ancient book smell, wand warmth, spell sparkles, mysterious whispers, transformed reality',
  Friendship: 'Warm hugs, laughter sounds, shared secrets, holding hands, happy tears, comfort feelings',
  Learning: 'Pencil scratching, page turning, lightbulb moments, focused quiet, proud smiles, understanding clicks',
  Pirates: 'Salty sea spray, wooden deck creaking, cannon booms, treasure clinking, parrot squawks, flag snapping',
}

export function buildEnhancedStoryPrompt(request: EnhancedStoryRequest): string {
  const isMultiChild = request.children && request.children.length > 0
  const ageGroup = request.ageGroup || 'preschool'
  const guidelines = AGE_GUIDELINES[ageGroup]

  // Determine emotional arc based on theme and adjectives
  const emotionalArc = determineEmotionalArc(request.theme, request.adjectives)

  // Get sensory details for theme
  const sensoryDetails = THEME_SENSORY_DETAILS[request.theme] || 'vivid sights, sounds, textures, and feelings'

  if (isMultiChild) {
    return buildMultiChildPrompt(request, guidelines, emotionalArc, sensoryDetails)
  }

  return buildSingleChildPrompt(request, guidelines, emotionalArc, sensoryDetails)
}

function buildSingleChildPrompt(
  request: EnhancedStoryRequest,
  guidelines: AgeGuidelines,
  emotionalArc: string,
  sensoryDetails: string
): string {
  const { childName, adjectives, theme, moral } = request
  const adjectivesList = adjectives.join(', ')
  const moralSection = moral ? `\n\nMORAL/LESSON: Naturally weave in this lesson: "${moral}". Don't preach - show it through the story.` : ''

  return `You are an expert children's story writer specializing in engaging, well-structured bedtime stories. Create a captivating story for ${childName}.

CHARACTER:
- Name: ${childName}
- Personality: ${adjectivesList}
- Age Group: ${request.ageGroup || 'preschool'} (${guidelines.targetWords} words target)

THEME: ${theme}${moralSection}

STORY STRUCTURE (Follow this 3-act structure strictly):

ACT 1 - SETUP (${Math.round(guidelines.targetWords * 0.25)} words):
• Introduce ${childName} in their normal world
• Show their personality through ACTION (not telling)
• Establish the setting with sensory details
• Hook the reader with something interesting

ACT 2 - CONFLICT & RISING ACTION (${Math.round(guidelines.targetWords * 0.5)} words):
• INCITING INCIDENT: Something happens that changes everything
• ${childName} faces a challenge or problem related to ${theme}
• Show ${childName} trying to solve it (use their ${adjectivesList} traits!)
• Include obstacles that make it harder
• Build tension and excitement
• Show emotions and thoughts

ACT 3 - CLIMAX & RESOLUTION (${Math.round(guidelines.targetWords * 0.25)} words):
• CLIMAX: The biggest challenge! ${childName} must make a choice or take brave action.
• SUCCESS: ${childName} succeeds SPECIFICALLY by using their ${adjectivesList} traits. This is the key to the solution!
• RESOLUTION: Show the positive outcome
• BEDTIME BRIDGE: End with 2-3 sentences of rhythmic, calming language that transitions the child to sleep (e.g., "And as the stars twinkled, ${childName} snuggled deep into their cozy bed...").
• Show how ${childName} has grown

CHARACTER ARC:
${childName} should grow during this story:
- WANTS: What does ${childName} want at the beginning?
- OBSTACLE: What stands in their way?
- GROWTH: What does ${childName} learn or how do they change?
- ACHIEVEMENT: How is ${childName} different/better at the end?

EMOTIONAL JOURNEY:
Guide readers through: ${emotionalArc}
Show emotions through actions, dialogue, and physical sensations.

SENSORY IMMERSION:
Bring the ${theme} theme to life with vivid details:
${sensoryDetails}

Include at least 3 sensory details per scene (what ${childName} sees, hears, feels, smells, or tastes).

MAGICAL READING FEATURES:
• BOLD SOUNDS: Use **BOLD ALL CAPS** for onomatopoeia (e.g., **CRASH**, **GIGGLE**, **WHOOSH**) to help parents emphasize sounds.
• SPARKLE WORDS: Include 2-3 slightly advanced words (e.g., "luminous," "courageous") and explain them naturally through context.
• INTERACTION CUES: Include 2-3 cues in [brackets] for parents (e.g., [Action: Point to the blue star], [Sound: Make a soft snoring sound]).

WRITING STYLE & REQUIREMENTS:
${guidelines.complexity}

Sentences: ${guidelines.sentenceStructure}

Vocabulary: ${guidelines.vocabulary}

Emotional Depth: ${guidelines.emotionalDepth}

Additional Requirements:
✓ Exactly ${guidelines.targetWords} words (±30 words acceptable)
✓ Use ${childName}'s name 10-12 times throughout
✓ Include dialogue (at least 4 speaking moments)
✓ Active voice, show don't tell
✓ Varied pacing: slower for emotions, faster for action
✓ Use paragraph breaks to show scene changes
✓ Create vivid mental images
✓ Build to emotional high point before calming ending
✓ Wholesome, kid-safe, positive role model behavior
✓ NO scary elements, NO violence, NO sad endings
✓ Perfect for bedtime - calming and comforting conclusion

NARRATIVE TECHNIQUES:
• Start with action or interesting moment (no "Once upon a time")
• Use specific details instead of generic descriptions
• Include small moments of wonder
• Show cause and effect clearly
• Use repetition for rhythm (especially for younger ages)
• Build anticipation before reveals
• Include relatable emotions
• End with a sense of peace and accomplishment

Now write the story. Focus on quality, engagement, and making ${childName} the hero of an unforgettable ${theme} adventure!`
}

function buildMultiChildPrompt(
  request: EnhancedStoryRequest,
  guidelines: AgeGuidelines,
  emotionalArc: string,
  sensoryDetails: string
): string {
  const { children, theme, moral } = request
  const childrenList = children!.map((child, i) =>
    `${i + 1}. ${child.name} - ${child.adjectives.join(', ')}`
  ).join('\n')
  const childrenNames = children!.map(c => c.name).join(', ')
  const childrenNamesNatural = children!.map(c => c.name).join(' and ')
  const moralSection = moral ? `\n\nMORAL/LESSON: Naturally weave in this lesson: "${moral}". Show it through teamwork and friendship.` : ''

  return `You are an expert children's story writer. Create a captivating story featuring multiple children as the main characters.

CHARACTERS:
${childrenList}

They are friends/siblings going on an adventure together!

THEME: ${theme}${moralSection}

STORY STRUCTURE (3-act structure for multiple characters):

ACT 1 - SETUP (${Math.round(guidelines.targetWords * 0.25)} words):
• Introduce all children: ${childrenNames}
• Show each character's unique personality through ACTION
• Establish their friendship/relationship
• Set up the ${theme} setting with sensory details

ACT 2 - CONFLICT & RISING ACTION (${Math.round(guidelines.targetWords * 0.5)} words):
• INCITING INCIDENT: Something happens that starts their adventure
• The group faces challenges related to ${theme}
• Each child contributes using their unique traits
• Show teamwork AND individual moments for each child
• Include obstacles that test their friendship
• Build tension and excitement

ACT 3 - CLIMAX & RESOLUTION (${Math.round(guidelines.targetWords * 0.25)} words):
• CLIMAX: The biggest challenge requires ALL children working together
• Each child plays a crucial role, using their unique ${childrenNames} strengths
• RESOLUTION: Celebrate their teamwork and friendship
• BEDTIME BRIDGE: End with 2-3 sentences of rhythmic, calming language that transitions the children to sleep.

CHARACTER DYNAMICS:
• Give each child (${childrenNames}) distinct moments to shine
• Show them helping each other
• Include both cooperation and minor conflicts (resolved positively)
• Demonstrate that everyone's strengths matter

EMOTIONAL JOURNEY: ${emotionalArc}

SENSORY IMMERSION (${theme}):
${sensoryDetails}

WRITING STYLE:
${guidelines.complexity}
Sentences: ${guidelines.sentenceStructure}
Vocabulary: ${guidelines.vocabulary}
Emotional Depth: ${guidelines.emotionalDepth}

REQUIREMENTS:
✓ ${Math.round(guidelines.targetWords * 1.2)} words (longer to accommodate multiple characters)
✓ Each child's name appears 5-7 times
✓ Dialogue between children (at least 6 exchanges)
✓ Each child has a hero moment
✓ Show friendship and teamwork
✓ Active voice, varied pacing
✓ Vivid sensory details
✓ Wholesome, positive, perfect for bedtime
✓ Celebrate diversity of personalities

Focus on making this a story about friendship, teamwork, and how working together makes adventures more fun!`
}

function determineEmotionalArc(theme: string, adjectives: string[]): string {
  const lowerTheme = theme.toLowerCase()
  const lowerAdj = adjectives.join(' ').toLowerCase()

  if (lowerTheme.includes('friend') || lowerAdj.includes('kind')) {
    return EMOTIONAL_ARCS.friendship
  }
  if (lowerAdj.includes('brave') || lowerAdj.includes('courageous')) {
    return EMOTIONAL_ARCS.courage
  }
  if (lowerTheme.includes('learn') || lowerTheme.includes('school')) {
    return EMOTIONAL_ARCS.learning
  }
  if (lowerAdj.includes('curious') || lowerTheme.includes('discover')) {
    return EMOTIONAL_ARCS.discovery
  }
  if (lowerAdj.includes('kind') || lowerAdj.includes('helpful')) {
    return EMOTIONAL_ARCS.kindness
  }
  if (lowerTheme.includes('team') || lowerTheme.includes('together')) {
    return EMOTIONAL_ARCS.teamwork
  }

  // Default to adventure arc
  return EMOTIONAL_ARCS.adventure
}

/**
 * Determine age group from child age or default to preschool
 */
export function determineAgeGroup(age?: number): 'toddler' | 'preschool' | 'early-elementary' | 'elementary' {
  if (!age) return 'preschool'

  if (age <= 3) return 'toddler'
  if (age <= 5) return 'preschool'
  if (age <= 7) return 'early-elementary'
  return 'elementary'
}
