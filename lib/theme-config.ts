export interface ThemeStyle {
    id: string
    background: string
    primaryColor: string
    secondaryColor: string
    navBorder: string
    titleGradient: string
    cardBorder: string
    badge: string
    button: string
    emoji: string
    floaters: string[]
    cursor?: string
    cardTexture?: string
    interaction?: string
}

const DEFAULT_THEME: ThemeStyle = {
    id: 'default',
    background: 'bg-gradient-to-br from-pink-50 via-yellow-50 to-blue-50',
    primaryColor: 'text-gray-900',
    secondaryColor: 'text-purple-600',
    navBorder: 'border-pink-300',
    titleGradient: 'bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600',
    cardBorder: 'border-pink-300',
    badge: 'bg-gradient-to-r from-pink-400 to-purple-400 border-pink-500',
    button: 'bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600',
    emoji: '✨',
    floaters: ['✨', '⭐', '🌟'],
    interaction: 'hover-pop'
}

export const THEME_STYLES: Record<string, ThemeStyle> = {
    'Space': {
        id: 'space',
        background: 'bg-gradient-to-br from-indigo-900 via-purple-900 to-black text-white',
        primaryColor: 'text-white',
        secondaryColor: 'text-cyan-400',
        navBorder: 'border-indigo-500',
        titleGradient: 'bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400',
        cardBorder: 'border-indigo-400',
        badge: 'bg-gradient-to-r from-indigo-600 to-purple-600 border-indigo-400 text-white',
        button: 'bg-gradient-to-r from-indigo-500 to-cyan-500 hover:from-indigo-600 hover:to-cyan-600',
        emoji: '🚀',
        floaters: ['⭐', '🌟', '🪐', '☄️', '🌌', '🌠'],
        cursor: 'cursor-space',
        cardTexture: 'bg-grid-pattern',
        interaction: 'hover-spin'
    },
    'Ocean': {
        id: 'ocean',
        background: 'bg-gradient-to-br from-cyan-50 via-blue-50 to-teal-50',
        primaryColor: 'text-cyan-900',
        secondaryColor: 'text-blue-600',
        navBorder: 'border-cyan-300',
        titleGradient: 'bg-gradient-to-r from-cyan-600 via-blue-600 to-teal-600',
        cardBorder: 'border-cyan-300',
        badge: 'bg-gradient-to-r from-cyan-400 to-blue-400 border-cyan-500',
        button: 'bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600',
        emoji: '🌊',
        floaters: ['🐟', '🐠', '🐡', '🫧', '🐚', '🦀'],
        cursor: 'cursor-ocean',
        interaction: 'hover-pop'
    },
    'Fantasy': {
        id: 'fantasy',
        background: 'bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50',
        primaryColor: 'text-purple-900',
        secondaryColor: 'text-pink-600',
        navBorder: 'border-purple-300',
        titleGradient: 'bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600',
        cardBorder: 'border-purple-300',
        badge: 'bg-gradient-to-r from-purple-400 to-pink-400 border-purple-500',
        button: 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600',
        emoji: '🦄',
        floaters: ['✨', '🧚', '🏰', '🔮', '🦄', '🌈'],
        cursor: 'cursor-magic',
        interaction: 'hover-spin'
    },
    'Nature': {
        id: 'nature',
        background: 'bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50',
        primaryColor: 'text-green-900',
        secondaryColor: 'text-emerald-600',
        navBorder: 'border-green-300',
        titleGradient: 'bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600',
        cardBorder: 'border-green-300',
        badge: 'bg-gradient-to-r from-green-400 to-emerald-400 border-green-500',
        button: 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600',
        emoji: '🌳',
        floaters: ['🍃', '🦋', '🌸', '🍄', '🐞', '🌿'],
        cursor: 'cursor-nature',
        interaction: 'hover-flee'
    },
    'Dinosaurs': {
        id: 'dinosaurs',
        background: 'bg-gradient-to-br from-orange-50 via-amber-50 to-green-50',
        primaryColor: 'text-orange-900',
        secondaryColor: 'text-amber-700',
        navBorder: 'border-orange-300',
        titleGradient: 'bg-gradient-to-r from-orange-600 via-amber-600 to-green-600',
        cardBorder: 'border-orange-300',
        badge: 'bg-gradient-to-r from-orange-400 to-amber-400 border-orange-500',
        button: 'bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600',
        emoji: '🦖',
        floaters: ['🦕', '🌋', '🌴', '🦴', '🥚', '🦖'],
        cardTexture: 'bg-paper-pattern',
        interaction: 'hover-pop'
    },
    'Superhero': {
        id: 'superhero',
        background: 'bg-gradient-to-br from-red-50 via-blue-50 to-yellow-50',
        primaryColor: 'text-slate-900',
        secondaryColor: 'text-red-600',
        navBorder: 'border-red-300',
        titleGradient: 'bg-gradient-to-r from-red-600 via-blue-600 to-yellow-500',
        cardBorder: 'border-red-300',
        badge: 'bg-gradient-to-r from-red-500 to-blue-500 border-red-600 text-white',
        button: 'bg-gradient-to-r from-red-500 to-blue-500 hover:from-red-600 hover:to-blue-600',
        emoji: '🦸',
        floaters: ['💥', '⚡', '🛡️', '💫', '🦁', '⭐'],
        cardTexture: 'bg-dots-pattern',
        interaction: 'hover-pop'
    },
    'Princess': {
        id: 'princess',
        background: 'bg-gradient-to-br from-pink-50 via-rose-50 to-purple-50',
        primaryColor: 'text-pink-900',
        secondaryColor: 'text-purple-600',
        navBorder: 'border-pink-300',
        titleGradient: 'bg-gradient-to-r from-pink-500 via-rose-500 to-purple-500',
        cardBorder: 'border-pink-300',
        badge: 'bg-gradient-to-r from-pink-400 to-rose-400 border-pink-500',
        button: 'bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600',
        emoji: '👑',
        floaters: ['🏰', '👑', '💎', '🎀', '🦄', '✨']
    },
    'Robots': {
        id: 'robots',
        background: 'bg-gradient-to-br from-slate-100 via-zinc-100 to-gray-200',
        primaryColor: 'text-slate-900',
        secondaryColor: 'text-blue-600',
        navBorder: 'border-slate-300',
        titleGradient: 'bg-gradient-to-r from-slate-600 via-blue-600 to-zinc-600',
        cardBorder: 'border-slate-300',
        badge: 'bg-gradient-to-r from-slate-500 to-blue-500 border-slate-600 text-white',
        button: 'bg-gradient-to-r from-slate-600 to-blue-600 hover:from-slate-700 hover:to-blue-700',
        emoji: '🤖',
        floaters: ['⚙️', '🔧', '🔩', '⚡', '🔋', '🤖'],
        cardTexture: 'bg-grid-pattern',
        interaction: 'hover-spin'
    },
    'Adventure': {
        id: 'adventure',
        background: 'bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50',
        primaryColor: 'text-orange-900',
        secondaryColor: 'text-red-600',
        navBorder: 'border-orange-300',
        titleGradient: 'bg-gradient-to-r from-orange-600 via-red-600 to-yellow-600',
        cardBorder: 'border-orange-300',
        badge: 'bg-gradient-to-r from-orange-400 to-red-400 border-orange-500',
        button: 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600',
        emoji: '🗺️',
        floaters: ['🧭', '🏔️', '⛺', '🎒', '🔦', '🗺️'],
        cardTexture: 'bg-paper-pattern',
        interaction: 'hover-flee'
    },
    'Magic': {
        id: 'magic',
        background: 'bg-gradient-to-br from-violet-100 via-fuchsia-100 to-purple-200',
        primaryColor: 'text-violet-900',
        secondaryColor: 'text-fuchsia-600',
        navBorder: 'border-violet-300',
        titleGradient: 'bg-gradient-to-r from-violet-600 via-fuchsia-600 to-purple-600',
        cardBorder: 'border-violet-300',
        badge: 'bg-gradient-to-r from-violet-500 to-fuchsia-500 border-violet-600 text-white',
        button: 'bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700',
        emoji: '✨',
        floaters: ['🪄', '🐇', '🎩', '✨', '🔮', '🌙'],
        cursor: 'cursor-magic',
        interaction: 'hover-spin'
    },
    'Friendship': {
        id: 'friendship',
        background: 'bg-gradient-to-br from-yellow-50 via-pink-50 to-orange-50',
        primaryColor: 'text-pink-900',
        secondaryColor: 'text-orange-600',
        navBorder: 'border-yellow-300',
        titleGradient: 'bg-gradient-to-r from-pink-500 via-yellow-500 to-orange-500',
        cardBorder: 'border-pink-300',
        badge: 'bg-gradient-to-r from-pink-400 to-yellow-400 border-pink-500',
        button: 'bg-gradient-to-r from-pink-500 to-orange-500 hover:from-pink-600 hover:to-orange-600',
        emoji: '👫',
        floaters: ['❤️', '🎈', '🎁', '🤝', '😊', '🌟']
    },
    'Learning': {
        id: 'learning',
        background: 'bg-gradient-to-br from-blue-50 via-indigo-50 to-violet-50',
        primaryColor: 'text-blue-900',
        secondaryColor: 'text-indigo-600',
        navBorder: 'border-blue-300',
        titleGradient: 'bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600',
        cardBorder: 'border-blue-300',
        badge: 'bg-gradient-to-r from-blue-400 to-indigo-400 border-blue-500',
        button: 'bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600',
        emoji: '📚',
        floaters: ['✏️', '🧠', '🔬', '💡', '🎓', '📝'],
        cardTexture: 'bg-grid-pattern',
        interaction: 'hover-pop'
    },
    'Pirates': {
        id: 'pirates',
        background: 'bg-gradient-to-br from-blue-100 via-cyan-100 to-blue-200',
        primaryColor: 'text-blue-900',
        secondaryColor: 'text-red-700',
        navBorder: 'border-blue-300',
        titleGradient: 'bg-gradient-to-r from-blue-700 via-red-600 to-cyan-600',
        cardBorder: 'border-blue-400',
        badge: 'bg-gradient-to-r from-blue-600 to-red-500 border-blue-700 text-white',
        button: 'bg-gradient-to-r from-blue-700 to-red-600 hover:from-blue-800 hover:to-red-700',
        emoji: '🏴‍☠️',
        floaters: ['🦜', '⚓', '💎', '🗺️', '🗡️', '🪙'],
        cardTexture: 'bg-paper-pattern',
        interaction: 'hover-flee'
    }
}

export function getThemeStyles(themeName: string): ThemeStyle {
    // Normalize theme name
    const normalizedTheme = themeName.trim()

    // Try to find exact match
    if (THEME_STYLES[normalizedTheme]) {
        return THEME_STYLES[normalizedTheme]
    }

    // Try to find match by ID or partial name
    const themeKey = Object.keys(THEME_STYLES).find(key =>
        key.toLowerCase() === normalizedTheme.toLowerCase() ||
        THEME_STYLES[key].id === normalizedTheme.toLowerCase()
    )

    if (themeKey) {
        return THEME_STYLES[themeKey]
    }

    // Fallback map for common themes to existing styles
    const fallbackMap: Record<string, string> = {
        'animals': 'Nature',
        'gardening': 'Nature',
        'fairies': 'Fantasy',
        'sports': 'Superhero', // Dynamic/Action
        'music': 'Magic', // Creative
        'art': 'Magic', // Creative
        'cooking': 'Friendship', // Warm/Homey
        'time travel': 'Space', // Sci-fi
        'mystery': 'Space', // Dark/Mysterious
        'courage': 'Superhero',
        'discovery': 'Adventure',
        'kindness': 'Friendship'
    }

    const mappedTheme = Object.entries(fallbackMap).find(([key]) =>
        normalizedTheme.toLowerCase().includes(key)
    )

    if (mappedTheme) {
        return THEME_STYLES[mappedTheme[1]]
    }

    return DEFAULT_THEME
}
