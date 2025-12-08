# 🎨 Tailwind Color Class Reference

This document shows which Tailwind classes map to which CSS variables in your color palette.

## 📚 CSS Variable to Tailwind Class Mapping

When you update the CSS variables in `app/globals.css`, these Tailwind classes automatically use the new colors:

### Background Colors

| Tailwind Class | CSS Variable | Current Color | Usage |
|----------------|--------------|---------------|-------|
| `bg-background` | `--background` | #FFF9F0 (Warm Cream) | Page backgrounds |
| `bg-card` | `--card` | #FFFFFF (White) | Card backgrounds |
| `bg-popover` | `--popover` | #FFFFFF (White) | Dropdown/popover backgrounds |
| `bg-primary` | `--primary` | #FF6B9D (Bright Pink) | Primary buttons, highlights |
| `bg-secondary` | `--secondary` | #4ECDC4 (Turquoise) | Secondary buttons |
| `bg-muted` | `--muted` | #FFF4E0 (Light Peach) | Muted backgrounds |
| `bg-accent` | `--accent` | #FFD93D (Sunny Yellow) | Accent backgrounds |
| `bg-destructive` | `--destructive` | #FF6B6B (Coral Red) | Delete/danger buttons |

### Text Colors

| Tailwind Class | CSS Variable | Current Color | Usage |
|----------------|--------------|---------------|-------|
| `text-foreground` | `--foreground` | #2C3E50 (Dark Blue-Gray) | Primary text |
| `text-card-foreground` | `--card-foreground` | #2C3E50 (Dark Blue-Gray) | Text on cards |
| `text-popover-foreground` | `--popover-foreground` | #2C3E50 (Dark Blue-Gray) | Text in popovers |
| `text-primary-foreground` | `--primary-foreground` | #FFFFFF (White) | Text on primary bg |
| `text-secondary-foreground` | `--secondary-foreground` | #FFFFFF (White) | Text on secondary bg |
| `text-muted-foreground` | `--muted-foreground` | #7F8C8D (Gray) | Muted/secondary text |
| `text-accent-foreground` | `--accent-foreground` | #2C3E50 (Dark Blue-Gray) | Text on accent bg |
| `text-destructive-foreground` | `--destructive-foreground` | #FFFFFF (White) | Text on destructive bg |

### Border Colors

| Tailwind Class | CSS Variable | Current Color | Usage |
|----------------|--------------|---------------|-------|
| `border-border` | `--border` | #FFE9CC (Light Orange) | Default borders |
| `border-input` | `--input` | #FFE9CC (Light Orange) | Input borders |

### Ring/Focus Colors

| Tailwind Class | CSS Variable | Current Color | Usage |
|----------------|--------------|---------------|-------|
| `ring-ring` | `--ring` | #FF6B9D (Bright Pink) | Focus rings |

---

## 🎯 Component Class Examples

### Button Component
```tsx
// Default button - uses CSS variables
<Button>Click Me</Button>
// → Uses: bg-primary, text-primary-foreground

// Secondary button
<Button variant="secondary">Click Me</Button>
// → Uses: bg-secondary, text-secondary-foreground

// Destructive button
<Button variant="destructive">Delete</Button>
// → Uses: bg-destructive, text-destructive-foreground
```

### Card Component
```tsx
// Card - uses CSS variables
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
    <CardDescription>Description</CardDescription>
  </CardHeader>
  <CardContent>Content</CardContent>
</Card>
// → Uses: bg-card, text-card-foreground, border-border
```

### Input Component
```tsx
// Input - uses CSS variables
<Input placeholder="Enter text" />
// → Uses: border-input, bg-background, text-foreground
```

---

## 🔄 How Color Updates Work

1. **You change CSS variables** in `app/globals.css`:
   ```css
   :root {
     --primary: 338 100% 71%;  /* Your new color in HSL */
   }
   ```

2. **Tailwind automatically maps** the variable:
   ```
   bg-primary → hsl(var(--primary))
   ```

3. **All components using that class** update automatically:
   ```tsx
   <Button>Click Me</Button>  ← Automatically uses new --primary color
   ```

---

## 📋 Quick Migration Guide

### If you see hardcoded colors, replace them with CSS variables:

#### ❌ Before (Hardcoded):
```tsx
<div className="bg-pink-500 text-white">Content</div>
<button className="bg-pink-600 hover:bg-pink-700">Button</button>
```

#### ✅ After (CSS Variables):
```tsx
<div className="bg-primary text-primary-foreground">Content</div>
<Button>Button</Button>
```

### Common Replacements:

| Hardcoded | Replace With |
|-----------|-------------|
| `bg-pink-500` | `bg-primary` |
| `bg-blue-500` | `bg-secondary` |
| `bg-yellow-500` | `bg-accent` |
| `bg-red-500` | `bg-destructive` |
| `bg-white` | `bg-card` |
| `bg-gray-50` | `bg-background` |
| `text-gray-900` | `text-foreground` |
| `text-gray-500` | `text-muted-foreground` |
| `border-gray-200` | `border-border` |

---

## 🎨 Using Colors in Custom Components

### Option 1: Use Tailwind Classes (Recommended)
```tsx
<div className="bg-primary text-primary-foreground p-4 rounded-lg border border-border">
  Custom Component
</div>
```

### Option 2: Use CSS Variables Directly
```tsx
<div style={{
  backgroundColor: 'hsl(var(--primary))',
  color: 'hsl(var(--primary-foreground))'
}}>
  Custom Component
</div>
```

### Option 3: Import from colors.ts
```tsx
import { getColor, ACTIVE_PALETTE } from '@/lib/colors'

const MyComponent = () => {
  const primaryColor = getColor('primary')  // Returns: #FF6B9D

  return (
    <div style={{ backgroundColor: primaryColor }}>
      Content
    </div>
  )
}
```

---

## 🌙 Dark Mode Support

All CSS variables have dark mode variants:

```css
/* Light mode */
:root {
  --background: 35 100% 97%;  /* Warm Cream */
}

/* Dark mode */
.dark {
  --background: 210 22% 22%;  /* Dark Blue-Gray */
}
```

When the `.dark` class is applied to the root element, all components automatically switch to dark colors!

---

## 💡 Pro Tips

1. **Consistency**: Always use CSS variables instead of hardcoded colors
2. **Semantic naming**: Use `bg-primary` not `bg-pink-500` for easier theme changes
3. **Test both modes**: Always check light and dark mode when changing colors
4. **Contrast**: Ensure sufficient contrast between text and background colors
5. **Gradients**: For gradients in landing pages, you may need to update manually

---

## 🔗 Related Files

- **`lib/colors.ts`** - Color palette definitions
- **`app/globals.css`** - CSS variable definitions
- **`components/ui/*.tsx`** - UI components using CSS variables
- **`COLOR_PALETTE_GUIDE.md`** - Guide for changing color palettes

---

**Last Updated**: December 2025
