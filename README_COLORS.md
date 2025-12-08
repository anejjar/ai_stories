# 🎨 Color System Overview

## Current Color Palette: **Pastel Dreams**

Your app now uses a centralized, easy-to-change color system!

### 🌈 Active Colors

```
Primary (Powder Blue):  #A8DADC  ████████
Secondary (Soft Pink):  #F1C0E8  ████████
Accent (Lavender):      #CFBAF0  ████████
Success (Mint Green):   #A2D5AB  ████████
Warning (Peach):        #FFD8B8  ████████
Error (Soft Red):       #F4A4A4  ████████
Background (Off White): #FFF9F9  ████████
```

### 📁 Key Files

1. **`lib/colors.ts`** - Main color configuration (3 pre-built palettes)
2. **`app/globals.css`** - CSS variables (lines 6-62)
3. **`COLOR_PALETTE_GUIDE.md`** - Complete guide for changing palettes
4. **`TAILWIND_COLOR_REFERENCE.md`** - Tailwind class reference

### 🔄 How to Change Palette (Quick Start)

1. Open `lib/colors.ts`
2. Change line ~336:
   ```typescript
   export const ACTIVE_PALETTE = PASTEL_DREAMS_PALETTE
   ```
   To one of:
   - `RAINBOW_KIDS_PALETTE` - Bright & playful
   - `PASTEL_DREAMS_PALETTE` - Soft & calming (current)
   - `OCEAN_ADVENTURE_PALETTE` - Fresh ocean blues

3. Open `app/globals.css` and go to line 18 (`:root` section)
4. Copy the CSS variables from your chosen palette's `cssVariables.light`
5. Replace lines 19-43 in `globals.css`
6. Copy `cssVariables.dark` and replace lines 47-70
7. Update the comment (lines 6-16) with your palette name
8. Save and hard refresh (Ctrl+F5)!

### ✅ What's Automatically Themed

All UI components automatically use the new colors:
- Buttons (all variants)
- Cards and borders
- Inputs and forms
- Badges and chips
- Text colors
- Backgrounds
- Dialogs and modals

### 📚 Documentation

- **Complete Guide**: `COLOR_PALETTE_GUIDE.md`
- **Tailwind Reference**: `TAILWIND_COLOR_REFERENCE.md`
- **Available Palettes**: See `lib/colors.ts`

### 🎯 Benefits

✅ Change entire app colors in 2 files
✅ 3 pre-built kids-friendly palettes
✅ Easy to create custom palettes
✅ All components automatically update
✅ Dark mode support built-in
✅ Fully documented

---

**Need help?** Check `COLOR_PALETTE_GUIDE.md` for detailed instructions!
