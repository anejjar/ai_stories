# 🎨 Color Palette Configuration Guide

This guide explains how to change the color palette for your AI Stories app.

## 📍 Current Active Palette

**Rainbow Kids Palette** - Bright, playful, and energetic colors perfect for children's applications.

### Current Colors:
- 🎀 **Primary**: #FF6B9D (Bright Pink)
- 🌊 **Secondary**: #4ECDC4 (Turquoise)
- ☀️ **Accent**: #FFD93D (Sunny Yellow)
- 🌱 **Success**: #6BCB77 (Fresh Green)
- 🔔 **Warning**: #FFA45C (Bright Orange)
- 🛑 **Error**: #FF6B6B (Coral Red)
- 📄 **Background**: #FFF9F0 (Warm Cream)

---

## 🔄 How to Change Color Palette

### Method 1: Use a Pre-Built Palette (Easiest)

**Step 1: Update lib/colors.ts**

1. Open `lib/colors.ts`
2. Find line ~336 that says:
   ```typescript
   export const ACTIVE_PALETTE = PASTEL_DREAMS_PALETTE
   ```
3. Change it to one of the available palettes:
   - `RAINBOW_KIDS_PALETTE` - Bright and playful
   - `PASTEL_DREAMS_PALETTE` - Soft and calming (current)
   - `OCEAN_ADVENTURE_PALETTE` - Fresh ocean blues

   Example:
   ```typescript
   export const ACTIVE_PALETTE = RAINBOW_KIDS_PALETTE
   ```

**Step 2: Update app/globals.css**

1. Open `app/globals.css`
2. Go to the `:root` section (around line 18)
3. Find your chosen palette in `lib/colors.ts` and copy all values from `cssVariables.light`
4. Replace lines 19-43 in `globals.css` with these values
5. Copy the `cssVariables.dark` values from your palette
6. Replace lines 47-70 in `globals.css` with the dark mode values
7. **Important:** Update the comment at the top (lines 6-16) to match your new palette name

**Step 3: Save and Refresh**

1. Save both files
2. Hard refresh your browser (Ctrl+F5 or Cmd+Shift+R)
3. Your entire app will now use the new color palette!

---

### Method 2: Create Your Own Custom Palette

**Step 1: Create Your Palette**

1. Open `lib/colors.ts`

2. Add a new palette object before the `ACTIVE_PALETTE` export (around line 330):

```typescript
export const MY_CUSTOM_PALETTE: ColorPalette = {
  name: 'My Custom Palette',
  description: 'Description of your palette',
  colors: {
    primary: '#YOUR_HEX_COLOR',
    primaryLight: '#YOUR_HEX_COLOR',
    primaryDark: '#YOUR_HEX_COLOR',

    secondary: '#YOUR_HEX_COLOR',
    secondaryLight: '#YOUR_HEX_COLOR',
    secondaryDark: '#YOUR_HEX_COLOR',

    accent: '#YOUR_HEX_COLOR',
    accentLight: '#YOUR_HEX_COLOR',
    accentDark: '#YOUR_HEX_COLOR',

    success: '#YOUR_HEX_COLOR',
    successLight: '#YOUR_HEX_COLOR',

    warning: '#YOUR_HEX_COLOR',
    warningLight: '#YOUR_HEX_COLOR',

    error: '#YOUR_HEX_COLOR',
    errorLight: '#YOUR_HEX_COLOR',

    background: '#YOUR_HEX_COLOR',
    backgroundSecondary: '#YOUR_HEX_COLOR',
    backgroundTertiary: '#YOUR_HEX_COLOR',

    textPrimary: '#YOUR_HEX_COLOR',
    textSecondary: '#YOUR_HEX_COLOR',
    textMuted: '#YOUR_HEX_COLOR',

    border: '#YOUR_HEX_COLOR',
    borderLight: '#YOUR_HEX_COLOR',

    card: '#YOUR_HEX_COLOR',
    cardHover: '#YOUR_HEX_COLOR',
  },
  cssVariables: {
    light: {
      background: 'H S% L%',     // HSL values for your background color
      foreground: 'H S% L%',     // HSL values for your text color
      card: 'H S% L%',
      'card-foreground': 'H S% L%',
      popover: 'H S% L%',
      'popover-foreground': 'H S% L%',
      primary: 'H S% L%',
      'primary-foreground': 'H S% L%',
      secondary: 'H S% L%',
      'secondary-foreground': 'H S% L%',
      muted: 'H S% L%',
      'muted-foreground': 'H S% L%',
      accent: 'H S% L%',
      'accent-foreground': 'H S% L%',
      destructive: 'H S% L%',
      'destructive-foreground': 'H S% L%',
      border: 'H S% L%',
      input: 'H S% L%',
      ring: 'H S% L%',
    },
    dark: {
      // Same structure as light, but with dark mode colors
    }
  }
}
```

**Step 2: Convert Colors to HSL**

3. Convert your HEX colors to HSL format:
   - Use a tool like https://www.rapidtables.com/convert/color/hex-to-hsl.html
   - Format as `H S% L%` (e.g., `340 82% 52%` for #FF6B9D)
   - Remove the `%` signs, just use numbers and spaces

**Step 3: Activate Your Palette**

4. Set your palette as active (around line 336):
   ```typescript
   export const ACTIVE_PALETTE = MY_CUSTOM_PALETTE
   ```

5. Add it to available palettes (around line 339):
   ```typescript
   export const AVAILABLE_PALETTES = {
     RAINBOW_KIDS_PALETTE,
     PASTEL_DREAMS_PALETTE,
     OCEAN_ADVENTURE_PALETTE,
     MY_CUSTOM_PALETTE,  // Add your palette here
   }
   ```

**Step 4: Update globals.css**

6. Follow Method 1, Step 2 to update `app/globals.css` with your new CSS variables

---

## 🎯 What Gets Updated Automatically

When you change the palette, these components will automatically use the new colors:

- ✅ **Buttons** - All button variants (primary, secondary, destructive)
- ✅ **Cards** - Card backgrounds, borders, and hover states
- ✅ **Inputs** - Form inputs, text areas, selects
- ✅ **Badges** - All badge components
- ✅ **Borders** - Component borders throughout the app
- ✅ **Text** - Primary, secondary, and muted text colors
- ✅ **Backgrounds** - Page backgrounds and surfaces
- ✅ **Popovers** - Dropdown menus and tooltips
- ✅ **Dialogs** - Modal backgrounds and content

---

## 📂 Files to Modify

### Core Color Configuration
- **`lib/colors.ts`** - Main color palette definitions and configuration
- **`app/globals.css`** - CSS variables for Tailwind (lines 6-62)

### Optional: Story Theme Colors
- **`lib/theme-config.ts`** - Individual story theme colors (Space, Ocean, Fantasy, etc.)
  - These are theme-specific and can remain different from the main palette
  - Or update them to match your new palette if desired

---

## 🛠️ Testing Your New Palette

After changing colors:

1. Check the **landing page** (`/`) for hero section, buttons, and cards
2. Check the **signup/login pages** for form inputs and buttons
3. Check the **dashboard** (`/library`) for card layouts
4. Check the **story creation page** (`/create`) for forms and previews
5. Check **modals and dialogs** for popup colors

---

## 💡 Tips for Choosing Colors

### For Kids' Apps:
1. **Use high contrast** - Ensure text is readable (use a contrast checker)
2. **Keep it bright but not overwhelming** - Avoid pure saturated colors
3. **Use warm backgrounds** - Cream, light yellow, or soft pastels work well
4. **Consistent color meanings**:
   - Primary = Main brand/action color
   - Secondary = Supporting/alternative actions
   - Accent = Highlights and special elements
   - Success = Green for positive actions
   - Warning = Orange/yellow for caution
   - Error = Red for errors or destructive actions

### Recommended Resources:
- **Color Hunt** - https://colorhunt.co/palettes/kids
- **Coolors** - https://coolors.co/palettes/popular/kids
- **Adobe Color** - https://color.adobe.com/explore
- **Contrast Checker** - https://webaim.org/resources/contrastchecker/

---

## 🐛 Troubleshooting

### Colors not updating?
1. Make sure you saved both `lib/colors.ts` and `app/globals.css`
2. Hard refresh your browser (Ctrl+F5 or Cmd+Shift+R)
3. Clear your browser cache
4. Restart your development server

### Some elements still show old colors?
- Check if those elements use hardcoded Tailwind classes (like `bg-pink-500`)
- These need to be manually updated in the component files
- Search for color classes in your components and update them

### Dark mode looks wrong?
- Make sure you updated both `light` and `dark` sections in `globals.css`
- Dark mode colors should have good contrast too

---

## 📞 Need Help?

If you need assistance with colors:
1. Check the `lib/colors.ts` file for examples
2. Review existing palettes for reference
3. Use browser dev tools to inspect element colors
4. Test on different screen sizes and lighting conditions

---

**Last Updated**: December 2025
**Current Palette**: Rainbow Kids (Bright & Playful)
