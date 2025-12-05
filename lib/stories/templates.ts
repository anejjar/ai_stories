/**
 * Story Templates
 * Predefined story structures and prompts for different story types
 */

export interface StoryTemplate {
  id: string
  name: string
  emoji: string
  description: string
  category: 'adventure' | 'bedtime' | 'educational' | 'fantasy' | 'friendship' | 'growth'
  structure: string // Story structure description
  promptEnhancement: string // Additional prompt text to guide AI
  suggestedThemes: string[] // Themes that work well with this template
  ageRange: string
}

export const STORY_TEMPLATES: StoryTemplate[] = [
  {
    id: 'classic-adventure',
    name: 'Classic Adventure',
    emoji: '🗺️',
    description: 'A hero\'s journey with challenges and triumphs',
    category: 'adventure',
    structure: 'Introduction → Challenge → Journey → Resolution → Lesson',
    promptEnhancement: 'Create an adventure story where the child embarks on a journey, faces challenges, and learns valuable lessons along the way. Include exciting moments and a satisfying conclusion.',
    suggestedThemes: ['Adventure', 'Courage', 'Discovery', 'Superhero'],
    ageRange: '4-10',
  },
  {
    id: 'bedtime-story',
    name: 'Bedtime Story',
    emoji: '🌙',
    description: 'Calm and soothing story perfect for bedtime',
    category: 'bedtime',
    structure: 'Peaceful beginning → Gentle adventure → Cozy resolution',
    promptEnhancement: 'Create a calming bedtime story with a peaceful, dreamy atmosphere. Use gentle language, soft imagery, and a soothing conclusion that helps the child feel safe and ready for sleep.',
    suggestedThemes: ['Nature', 'Magic', 'Animals', 'Fantasy'],
    ageRange: '2-8',
  },
  {
    id: 'friendship-tale',
    name: 'Friendship Tale',
    emoji: '👫',
    description: 'Story about making friends and working together',
    category: 'friendship',
    structure: 'Meeting → Bonding → Challenge together → Success together',
    promptEnhancement: 'Create a heartwarming story about friendship, cooperation, and helping others. Show how working together makes everything better and how friends support each other.',
    suggestedThemes: ['Friendship', 'Kindness', 'Animals', 'Learning'],
    ageRange: '3-9',
  },
  {
    id: 'magical-discovery',
    name: 'Magical Discovery',
    emoji: '✨',
    description: 'Discovering magic in everyday life',
    category: 'fantasy',
    structure: 'Ordinary day → Magical discovery → Wonder → Appreciation',
    promptEnhancement: 'Create a magical story where the child discovers wonder and magic in everyday moments. Show how imagination and curiosity can reveal extraordinary things in ordinary places.',
    suggestedThemes: ['Magic', 'Fantasy', 'Discovery', 'Nature'],
    ageRange: '4-10',
  },
  {
    id: 'learning-adventure',
    name: 'Learning Adventure',
    emoji: '📚',
    description: 'Educational story that teaches while entertaining',
    category: 'educational',
    structure: 'Question → Exploration → Discovery → Understanding',
    promptEnhancement: 'Create an educational story that teaches important concepts or values in an engaging, fun way. Make learning feel like an adventure and discovery.',
    suggestedThemes: ['Learning', 'Discovery', 'Nature', 'Science'],
    ageRange: '5-12',
  },
  {
    id: 'hero-journey',
    name: 'Hero\'s Journey',
    emoji: '🦸',
    description: 'Child becomes the hero and saves the day',
    category: 'adventure',
    structure: 'Call to adventure → Tests → Transformation → Victory',
    promptEnhancement: 'Create an empowering story where the child is the hero who faces challenges, grows stronger, and saves the day through courage, kindness, and determination.',
    suggestedThemes: ['Superhero', 'Courage', 'Adventure', 'Fantasy'],
    ageRange: '5-12',
  },
  {
    id: 'animal-companion',
    name: 'Animal Companion',
    emoji: '🐾',
    description: 'Story featuring a special animal friend',
    category: 'friendship',
    structure: 'Meeting animal → Bonding → Adventure together → Friendship',
    promptEnhancement: 'Create a delightful story featuring a special animal companion. Show the bond between the child and their animal friend, their adventures together, and the joy of friendship.',
    suggestedThemes: ['Animals', 'Friendship', 'Nature', 'Adventure'],
    ageRange: '3-9',
  },
  {
    id: 'growth-story',
    name: 'Growth Story',
    emoji: '🌱',
    description: 'Story about personal growth and overcoming fears',
    category: 'growth',
    structure: 'Fear/challenge → Attempt → Growth → Confidence',
    promptEnhancement: 'Create an inspiring story about personal growth, overcoming fears, and building confidence. Show how the child faces something difficult and grows stronger through the experience.',
    suggestedThemes: ['Courage', 'Learning', 'Discovery', 'Kindness'],
    ageRange: '4-10',
  },
  {
    id: 'princess-prince',
    name: 'Royal Tale',
    emoji: '👑',
    description: 'Magical royal adventure with princesses and princes',
    category: 'fantasy',
    structure: 'Royal setting → Quest → Challenges → Triumph',
    promptEnhancement: 'Create a magical royal story with castles, kingdoms, and noble adventures. Include themes of kindness, leadership, and doing what\'s right.',
    suggestedThemes: ['Princess', 'Fantasy', 'Magic', 'Courage'],
    ageRange: '4-10',
  },
  {
    id: 'space-adventure',
    name: 'Space Adventure',
    emoji: '🚀',
    description: 'Journey through space and discover new worlds',
    category: 'adventure',
    structure: 'Launch → Space journey → Discovery → Return',
    promptEnhancement: 'Create an exciting space adventure story with planets, stars, and cosmic discoveries. Include wonder, exploration, and the beauty of the universe.',
    suggestedThemes: ['Space', 'Adventure', 'Discovery', 'Science'],
    ageRange: '5-12',
  },
]

/**
 * Get template by ID
 */
export function getTemplateById(id: string): StoryTemplate | undefined {
  return STORY_TEMPLATES.find((t) => t.id === id)
}

/**
 * Get templates by category
 */
export function getTemplatesByCategory(category: StoryTemplate['category']): StoryTemplate[] {
  return STORY_TEMPLATES.filter((t) => t.category === category)
}

/**
 * Get templates that work well with a theme
 */
export function getTemplatesForTheme(theme: string): StoryTemplate[] {
  return STORY_TEMPLATES.filter((t) => 
    t.suggestedThemes.some((suggested) => 
      suggested.toLowerCase() === theme.toLowerCase()
    )
  )
}

/**
 * Get all template categories
 */
export function getTemplateCategories(): StoryTemplate['category'][] {
  return Array.from(new Set(STORY_TEMPLATES.map((t) => t.category)))
}

