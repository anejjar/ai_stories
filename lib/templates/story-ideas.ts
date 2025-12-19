import { StoryTemplate } from '@/types/discovery'

/**
 * Curated Story Templates
 *
 * These templates provide inspiration for parents creating stories.
 * Each template pre-fills the story form with a creative story idea.
 */

export const STORY_TEMPLATES: StoryTemplate[] = [
  {
    id: 'pirate-treasure',
    title: 'Pirate Treasure Hunt',
    description: 'An exciting adventure on the high seas searching for hidden treasure',
    theme: 'Adventure',
    moral: 'Teamwork and perseverance help us achieve our goals',
    suggestedAdjectives: ['brave', 'clever', 'adventurous'],
    suggestedChildName: undefined,
    icon: '🏴‍☠️',
    category: 'adventure',
    previewText: 'Join a crew of friendly pirates on an exciting quest to find legendary treasure hidden on a mysterious island!'
  },
  {
    id: 'space-explorer',
    title: 'Space Explorer',
    description: 'Journey through the galaxy discovering new planets and alien friends',
    theme: 'Adventure',
    moral: 'Curiosity and kindness open doors to new friendships',
    suggestedAdjectives: ['curious', 'fearless', 'smart'],
    suggestedChildName: undefined,
    icon: '🚀',
    category: 'adventure',
    previewText: 'Blast off into space and explore colorful planets while making friends with friendly aliens!'
  },
  {
    id: 'magical-garden',
    title: 'The Magical Garden',
    description: 'Discover a secret garden where flowers can talk and grant wishes',
    theme: 'Fantasy',
    moral: 'Taking care of nature brings beauty and magic into our lives',
    suggestedAdjectives: ['kind', 'gentle', 'caring'],
    suggestedChildName: undefined,
    icon: '🌺',
    category: 'fantasy',
    previewText: 'Step into an enchanted garden where talking flowers share their wisdom and magical secrets!'
  },
  {
    id: 'dragon-friend',
    title: 'My Dragon Friend',
    description: 'Befriend a shy dragon and help them find their confidence',
    theme: 'Fantasy',
    moral: 'True friendship means accepting others for who they are',
    suggestedAdjectives: ['friendly', 'patient', 'understanding'],
    suggestedChildName: undefined,
    icon: '🐉',
    category: 'fantasy',
    previewText: 'Meet a timid little dragon who needs a friend. Together, you\'ll discover that being different is wonderful!'
  },
  {
    id: 'counting-adventure',
    title: 'The Great Counting Adventure',
    description: 'Help woodland creatures count and organize for their big party',
    theme: 'Learning',
    moral: 'Math is fun when we use it to help our friends',
    suggestedAdjectives: ['helpful', 'smart', 'organized'],
    suggestedChildName: undefined,
    icon: '🔢',
    category: 'learning',
    previewText: 'Join forest friends as they prepare for a party, counting acorns, berries, and guests along the way!'
  },
  {
    id: 'alphabet-journey',
    title: 'Alphabet Treasure Hunt',
    description: 'Find objects for every letter of the alphabet in a magical land',
    theme: 'Learning',
    moral: 'Learning is an exciting adventure',
    suggestedAdjectives: ['clever', 'observant', 'enthusiastic'],
    suggestedChildName: undefined,
    icon: '🔤',
    category: 'learning',
    previewText: 'Travel through a whimsical world searching for treasures from A to Z, learning letters along the way!'
  },
  {
    id: 'sleepy-cloud',
    title: 'The Sleepy Cloud',
    description: 'Help a tired cloud find the perfect place to rest for the night',
    theme: 'Bedtime',
    moral: 'Rest is important for everyone',
    suggestedAdjectives: ['gentle', 'calm', 'caring'],
    suggestedChildName: undefined,
    icon: '☁️',
    category: 'bedtime',
    previewText: 'Float through the peaceful evening sky helping a fluffy cloud find the coziest spot to sleep!'
  },
  {
    id: 'nighttime-forest',
    title: 'Nighttime in the Forest',
    description: 'Explore the peaceful forest at night with gentle animal friends',
    theme: 'Bedtime',
    moral: 'Nighttime is peaceful and safe',
    suggestedAdjectives: ['peaceful', 'brave', 'curious'],
    suggestedChildName: undefined,
    icon: '🌙',
    category: 'bedtime',
    previewText: 'Wander through a serene moonlit forest, meeting friendly owls, fireflies, and other gentle night creatures!'
  }
]

/**
 * Get a story template by ID
 */
export function getTemplateById(id: string): StoryTemplate | undefined {
  return STORY_TEMPLATES.find(template => template.id === id)
}

/**
 * Get templates by category
 */
export function getTemplatesByCategory(category: StoryTemplate['category']): StoryTemplate[] {
  return STORY_TEMPLATES.filter(template => template.category === category)
}

/**
 * Get all template categories
 */
export function getTemplateCategories(): StoryTemplate['category'][] {
  return ['adventure', 'fantasy', 'learning', 'bedtime']
}
