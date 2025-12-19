# Navigation Update for Discovery Feature

## Changes needed in `components/nav/main-nav.tsx`:

### 1. Add Compass import
In the lucide-react import section (around line 10-20), add `Compass` to the imports:

```typescript
import {
  BookOpen,
  Plus,
  User,
  LogOut,
  Menu,
  X,
  Library,
  Trophy,
  BarChart3,
  Sparkles,
  Bell,
  Compass, // ADD THIS
} from 'lucide-react'
```

### 2. Update mainNavLinks array
Around line 60-63, update the mainNavLinks array to include Discover:

```typescript
const mainNavLinks = [
  { href: '/library', label: 'Library', icon: Library },
  { href: '/discover', label: 'Discover', icon: Compass }, // ADD THIS
  { href: '/create', label: 'Create', icon: Plus },
]
```

That's it! The Discovery page will now appear in the main navigation.
