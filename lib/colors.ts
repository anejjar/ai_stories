/**
 * Central Color Palette Configuration
 *
 * This file contains all color palettes for the app.
 * To switch palettes, simply change the exported ACTIVE_PALETTE constant.
 *
 * Inspired by popular kids' apps with bright, playful colors
 */

export interface ColorPalette {
  name: string
  description: string
  colors: {
    // Primary brand colors
    primary: string
    primaryLight: string
    primaryDark: string

    // Secondary colors
    secondary: string
    secondaryLight: string
    secondaryDark: string

    // Accent colors
    accent: string
    accentLight: string
    accentDark: string

    // Success/positive
    success: string
    successLight: string

    // Warning
    warning: string
    warningLight: string

    // Error/destructive
    error: string
    errorLight: string

    // Backgrounds
    background: string
    backgroundSecondary: string
    backgroundTertiary: string

    // Text colors
    textPrimary: string
    textSecondary: string
    textMuted: string

    // Border colors
    border: string
    borderLight: string

    // Card/surface colors
    card: string
    cardHover: string
  }
  // CSS variables in HSL format for Tailwind
  cssVariables: {
    light: Record<string, string>
    dark: Record<string, string>
  }
}

/**
 * Rainbow Kids Palette - Bright, playful, and energetic
 * Inspired by popular children's educational apps
 */
export const RAINBOW_KIDS_PALETTE: ColorPalette = {
  name: 'Rainbow Kids',
  description: 'Bright, playful colors perfect for children',
  colors: {
    primary: '#FF6B9D',        // Bright Pink
    primaryLight: '#FFB3D1',   // Light Pink
    primaryDark: '#E8568A',    // Dark Pink

    secondary: '#4ECDC4',      // Turquoise
    secondaryLight: '#7EDCD5', // Light Turquoise
    secondaryDark: '#3AAFA9',  // Dark Turquoise

    accent: '#FFD93D',         // Sunny Yellow
    accentLight: '#FFE66D',    // Light Yellow
    accentDark: '#F5C518',     // Gold

    success: '#6BCB77',        // Fresh Green
    successLight: '#A3E4A9',   // Light Green

    warning: '#FFA45C',        // Bright Orange
    warningLight: '#FFBC85',   // Light Orange

    error: '#FF6B6B',          // Coral Red
    errorLight: '#FF9999',     // Light Coral

    background: '#FFF9F0',     // Warm Cream
    backgroundSecondary: '#FFF4E0', // Light Peach
    backgroundTertiary: '#FFE9CC',  // Lighter Orange

    textPrimary: '#2C3E50',    // Dark Blue-Gray
    textSecondary: '#34495E',  // Medium Blue-Gray
    textMuted: '#7F8C8D',      // Light Gray

    border: '#FFE9CC',         // Light Orange Border
    borderLight: '#FFF4E0',    // Very Light Border

    card: '#FFFFFF',           // White
    cardHover: '#FFF9F0',      // Warm Cream on hover
  },
  cssVariables: {
    light: {
      background: '35 100% 97%',           // #FFF9F0
      foreground: '210 22% 22%',           // #2C3E50
      card: '0 0% 100%',                    // White
      'card-foreground': '210 22% 22%',    // #2C3E50
      popover: '0 0% 100%',                 // White
      'popover-foreground': '210 22% 22%', // #2C3E50
      primary: '338 100% 71%',             // #FF6B9D
      'primary-foreground': '0 0% 100%',   // White
      secondary: '175 52% 56%',            // #4ECDC4
      'secondary-foreground': '0 0% 100%', // White
      muted: '35 100% 90%',                // #FFF4E0
      'muted-foreground': '184 9% 52%',    // #7F8C8D
      accent: '46 100% 61%',               // #FFD93D
      'accent-foreground': '210 22% 22%',  // #2C3E50
      destructive: '0 100% 71%',           // #FF6B6B
      'destructive-foreground': '0 0% 100%', // White
      border: '35 100% 90%',               // #FFE9CC
      input: '35 100% 90%',                // #FFE9CC
      ring: '338 100% 71%',                // #FF6B9D
    },
    dark: {
      background: '210 22% 22%',           // #2C3E50
      foreground: '0 0% 98%',              // Light
      card: '210 29% 24%',                 // Slightly lighter
      'card-foreground': '0 0% 98%',       // Light
      popover: '210 29% 24%',              // Slightly lighter
      'popover-foreground': '0 0% 98%',    // Light
      primary: '338 100% 71%',             // #FF6B9D
      'primary-foreground': '0 0% 100%',   // White
      secondary: '175 52% 56%',            // #4ECDC4
      'secondary-foreground': '0 0% 100%', // White
      muted: '210 29% 29%',                // Muted dark
      'muted-foreground': '184 9% 70%',    // Light muted
      accent: '46 100% 61%',               // #FFD93D
      'accent-foreground': '210 22% 22%',  // Dark text
      destructive: '0 100% 71%',           // #FF6B6B
      'destructive-foreground': '0 0% 100%', // White
      border: '210 29% 29%',               // Dark border
      input: '210 29% 29%',                // Dark input
      ring: '338 100% 71%',                // #FF6B9D
    }
  }
}

/**
 * Pastel Dreams Palette - Soft, calming colors
 * Perfect for a more gentle, soothing experience
 */
export const PASTEL_DREAMS_PALETTE: ColorPalette = {
  name: 'Pastel Dreams',
  description: 'Soft, calming pastel colors',
  colors: {
    primary: '#A8DADC',        // Powder Blue
    primaryLight: '#CAE9EA',   // Light Powder Blue
    primaryDark: '#8BC6C9',    // Dark Powder Blue

    secondary: '#F1C0E8',      // Soft Pink
    secondaryLight: '#F7D9F0', // Light Soft Pink
    secondaryDark: '#E5A4DB',  // Dark Soft Pink

    accent: '#CFBAF0',         // Lavender
    accentLight: '#E3D5F7',    // Light Lavender
    accentDark: '#B89FE3',     // Dark Lavender

    success: '#A2D5AB',        // Mint Green
    successLight: '#C5E5CA',   // Light Mint

    warning: '#FFD8B8',        // Peach
    warningLight: '#FFE8D4',   // Light Peach

    error: '#F4A4A4',          // Soft Red
    errorLight: '#F9C9C9',     // Light Soft Red

    background: '#FFF9F9',     // Off White
    backgroundSecondary: '#F9F3F9', // Light Lavender White
    backgroundTertiary: '#F3F9F9',  // Light Blue White

    textPrimary: '#1D3557',    // Navy
    textSecondary: '#457B9D',  // Medium Blue
    textMuted: '#A8A8A8',      // Gray

    border: '#E8E8F0',         // Light Gray
    borderLight: '#F5F5F9',    // Very Light Gray

    card: '#FFFFFF',           // White
    cardHover: '#FFF9F9',      // Off White on hover
  },
  cssVariables: {
    light: {
      background: '330 100% 98%',          // #FFF9F9
      foreground: '211 47% 22%',           // #1D3557
      card: '0 0% 100%',                    // White
      'card-foreground': '211 47% 22%',    // #1D3557
      popover: '0 0% 100%',                 // White
      'popover-foreground': '211 47% 22%', // #1D3557
      primary: '183 35% 76%',              // #A8DADC
      'primary-foreground': '211 47% 22%', // #1D3557
      secondary: '306 66% 85%',            // #F1C0E8
      'secondary-foreground': '211 47% 22%', // #1D3557
      muted: '270 56% 90%',                // Light muted
      'muted-foreground': '0 0% 45%',      // #A8A8A8
      accent: '263 60% 85%',               // #CFBAF0
      'accent-foreground': '211 47% 22%',  // #1D3557
      destructive: '0 74% 80%',            // #F4A4A4
      'destructive-foreground': '0 0% 100%', // White
      border: '240 33% 94%',               // #E8E8F0
      input: '240 33% 94%',                // #E8E8F0
      ring: '183 35% 76%',                 // #A8DADC
    },
    dark: {
      background: '211 47% 22%',           // #1D3557
      foreground: '0 0% 98%',              // Light
      card: '211 39% 27%',                 // Slightly lighter
      'card-foreground': '0 0% 98%',       // Light
      popover: '211 39% 27%',              // Slightly lighter
      'popover-foreground': '0 0% 98%',    // Light
      primary: '183 35% 76%',              // #A8DADC
      'primary-foreground': '211 47% 22%', // #1D3557
      secondary: '306 66% 85%',            // #F1C0E8
      'secondary-foreground': '211 47% 22%', // #1D3557
      muted: '211 39% 32%',                // Muted dark
      'muted-foreground': '0 0% 70%',      // Light muted
      accent: '263 60% 85%',               // #CFBAF0
      'accent-foreground': '211 47% 22%',  // Dark text
      destructive: '0 74% 80%',            // #F4A4A4
      'destructive-foreground': '0 0% 100%', // White
      border: '211 39% 32%',               // Dark border
      input: '211 39% 32%',                // Dark input
      ring: '183 35% 76%',                 // #A8DADC
    }
  }
}

/**
 * Ocean Adventure Palette - Blue and teal focused
 * Great for aquatic or adventure themes
 */
export const OCEAN_ADVENTURE_PALETTE: ColorPalette = {
  name: 'Ocean Adventure',
  description: 'Fresh ocean blues and teals',
  colors: {
    primary: '#3AAFA9',        // Teal
    primaryLight: '#72CAC5',   // Light Teal
    primaryDark: '#2B7A76',    // Dark Teal

    secondary: '#17BEBB',      // Bright Teal
    secondaryLight: '#5DD3D0', // Light Bright Teal
    secondaryDark: '#138B89',  // Dark Bright Teal

    accent: '#FEF684',         // Light Yellow
    accentLight: '#FFF9A8',    // Very Light Yellow
    accentDark: '#F5E14C',     // Gold Yellow

    success: '#48BB78',        // Ocean Green
    successLight: '#9AE6B4',   // Light Green

    warning: '#ED8936',        // Coral Orange
    warningLight: '#F6AD55',   // Light Orange

    error: '#F56565',          // Salmon Red
    errorLight: '#FC8181',     // Light Salmon

    background: '#F7FDFC',     // Very Light Teal
    backgroundSecondary: '#E6F9F8', // Light Cyan
    backgroundTertiary: '#D1F2F0',  // Cyan

    textPrimary: '#234E52',    // Deep Teal
    textSecondary: '#2C7A7B',  // Teal
    textMuted: '#718096',      // Gray

    border: '#BEE3E0',         // Light Teal Border
    borderLight: '#D1F2F0',    // Very Light Border

    card: '#FFFFFF',           // White
    cardHover: '#F7FDFC',      // Very Light Teal on hover
  },
  cssVariables: {
    light: {
      background: '170 75% 98%',           // #F7FDFC
      foreground: '177 37% 23%',           // #234E52
      card: '0 0% 100%',                    // White
      'card-foreground': '177 37% 23%',    // #234E52
      popover: '0 0% 100%',                 // White
      'popover-foreground': '177 37% 23%', // #234E52
      primary: '177 48% 45%',              // #3AAFA9
      'primary-foreground': '0 0% 100%',   // White
      secondary: '179 75% 41%',            // #17BEBB
      'secondary-foreground': '0 0% 100%', // White
      muted: '172 64% 94%',                // Light muted
      'muted-foreground': '215 16% 47%',   // #718096
      accent: '55 98% 76%',                // #FEF684
      'accent-foreground': '177 37% 23%',  // #234E52
      destructive: '0 85% 67%',            // #F56565
      'destructive-foreground': '0 0% 100%', // White
      border: '170 47% 82%',               // #BEE3E0
      input: '170 47% 82%',                // #BEE3E0
      ring: '177 48% 45%',                 // #3AAFA9
    },
    dark: {
      background: '177 37% 23%',           // #234E52
      foreground: '0 0% 98%',              // Light
      card: '180 26% 28%',                 // Slightly lighter
      'card-foreground': '0 0% 98%',       // Light
      popover: '180 26% 28%',              // Slightly lighter
      'popover-foreground': '0 0% 98%',    // Light
      primary: '177 48% 45%',              // #3AAFA9
      'primary-foreground': '0 0% 100%',   // White
      secondary: '179 75% 41%',            // #17BEBB
      'secondary-foreground': '0 0% 100%', // White
      muted: '180 26% 33%',                // Muted dark
      'muted-foreground': '215 16% 70%',   // Light muted
      accent: '55 98% 76%',                // #FEF684
      'accent-foreground': '177 37% 23%',  // Dark text
      destructive: '0 85% 67%',            // #F56565
      'destructive-foreground': '0 0% 100%', // White
      border: '180 26% 33%',               // Dark border
      input: '180 26% 33%',                // Dark input
      ring: '177 48% 45%',                 // #3AAFA9
    }
  }
}

// ============================================
// ACTIVE PALETTE - Change this to switch themes!
// ============================================
export const ACTIVE_PALETTE = OCEAN_ADVENTURE_PALETTE

// Export available palettes
export const AVAILABLE_PALETTES = {
  RAINBOW_KIDS_PALETTE,
  PASTEL_DREAMS_PALETTE,
  OCEAN_ADVENTURE_PALETTE,
}

/**
 * Helper function to get CSS variables as a string for injection
 */
export function getCSSVariables(mode: 'light' | 'dark' = 'light'): string {
  const vars = ACTIVE_PALETTE.cssVariables[mode]
  return Object.entries(vars)
    .map(([key, value]) => `--${key}: ${value};`)
    .join('\n    ')
}

/**
 * Helper function to get a color by key
 */
export function getColor(key: keyof typeof ACTIVE_PALETTE.colors): string {
  return ACTIVE_PALETTE.colors[key]
}
