# How to Make a Story Public

There are **two ways** to make a story public in your AI Stories app:

---

## Method 1: Add Publish Toggle to Library (Recommended)

This adds a Public/Private toggle button to each story card in the Library.

### Step 1: Update StoryCard Component

**File:** `components/stories/story-card.tsx`

Add the import at the top:
```typescript
import { PublishToggle } from './publish-toggle'
import { useState } from 'react'
```

Then, in the `StoryCard` function, add state for visibility:
```typescript
export function StoryCard({ story }: StoryCardProps) {
  const [visibility, setVisibility] = useState<'public' | 'private'>(
    story.visibility || 'private'
  )

  // ... rest of existing code
```

Finally, add the PublishToggle in the CardFooter section (before the "Read Story" button):
```typescript
<CardFooter className="p-5 pt-4 border-t border-gray-100 bg-gray-50/50 mt-auto">
  {/* Add PublishToggle here - only for text stories */}
  {!story.isIllustratedBook && (
    <div className="w-full mb-3">
      <PublishToggle
        storyId={story.id}
        initialVisibility={visibility}
        isIllustratedBook={story.isIllustratedBook || false}
        onVisibilityChange={setVisibility}
        size="sm"
      />
    </div>
  )}

  <Link href={`/story/${story.id}`} className="w-full">
    <Button className="w-full rounded-xl ...">
      <Eye className="h-4 w-4 mr-2" />
      Read Story
    </Button>
  </Link>
</CardFooter>
```

### What This Does:
- Adds a **Public/Private toggle button** above the "Read Story" button
- Shows a green "Public" button when story is public
- Shows a gray "Private" button when story is private
- Only shows for **text stories** (illustrated books cannot be made public)
- Clicking toggles the story between public and private

---

## Method 2: Add to Story Detail Page

You can also add the publish toggle to the individual story page.

**File:** `app/(dashboard)/story/[id]/page.tsx`

Import the component:
```typescript
import { PublishToggle } from '@/components/stories/publish-toggle'
```

Add it somewhere in the story page layout (e.g., near the title or actions):
```typescript
<div className="flex items-center gap-3">
  <PublishToggle
    storyId={story.id}
    initialVisibility={story.visibility || 'private'}
    isIllustratedBook={story.isIllustratedBook || false}
    onVisibilityChange={(newVisibility) => {
      // Optionally refetch or update local state
      console.log('Visibility changed to:', newVisibility)
    }}
  />
  {/* Other buttons like Share, PDF, etc. */}
</div>
```

---

## How Users Will Make Stories Public

### User Flow:

1. **Create a text story** (not an illustrated book)
2. **Go to Library** page
3. **See the story card** with a "Private" button
4. **Click the "Private" button** → It toggles to "Public"
5. **Story now appears in Discovery** page for all users!

### Visual Indicators:

**Private Button:**
- Gray color with lock icon 🔒
- Text: "Private"

**Public Button:**
- Green color with globe icon 🌍
- Text: "Public"

---

## Important Notes

### ⚠️ Restrictions:
- **Only TEXT stories can be made public**
- **Illustrated books CANNOT be made public** (for child safety/privacy)
- If user tries to publish an illustrated book, they'll see:
  > "Illustrated books cannot be published to Discovery. Only text stories can be shared publicly."

### 🔐 Privacy:
- Private stories = Only the creator can see them
- Public stories = Visible to all users in `/discover` page
- Child photos/info in illustrated books stay private always

---

## Testing the Feature

1. **First, run the database migration:**
   ```bash
   npx supabase db push
   ```

2. **Create a test story:**
   - Go to `/create`
   - Create a regular text story (not illustrated)
   - Submit

3. **Make it public:**
   - Go to `/library`
   - Find your story
   - Click the "Private" button → becomes "Public"

4. **Verify in Discovery:**
   - Go to `/discover`
   - Your story should appear in the list!
   - Try liking, rating, and commenting on it

---

## Quick Implementation (Copy-Paste)

If you want the quickest way, here's the exact code to add to `components/stories/story-card.tsx`:

### At the top (with other imports):
```typescript
import { PublishToggle } from './publish-toggle'
import { useState } from 'react'
```

### Inside the StoryCard function (after line 15):
```typescript
const [visibility, setVisibility] = useState<'public' | 'private'>(
  story.visibility || 'private'
)
```

### In the CardFooter section (replace lines 112-119):
```typescript
<CardFooter className="p-5 pt-4 border-t border-gray-100 bg-gray-50/50 mt-auto">
  {/* Publish Toggle - Only for text stories */}
  {!story.isIllustratedBook && (
    <div className="w-full mb-3">
      <PublishToggle
        storyId={story.id}
        initialVisibility={visibility}
        isIllustratedBook={story.isIllustratedBook || false}
        onVisibilityChange={setVisibility}
        size="sm"
      />
    </div>
  )}

  {/* Read Story Button */}
  <Link href={`/story/${story.id}`} className="w-full">
    <Button className="w-full rounded-xl bg-white border-2 border-purple-100 text-purple-700 hover:bg-purple-50 hover:border-purple-300 hover:text-purple-800 shadow-sm hover:shadow transition-all font-bold group-hover:bg-purple-600 group-hover:border-purple-600 group-hover:text-white">
      <Eye className="h-4 w-4 mr-2" />
      Read Story
    </Button>
  </Link>
</CardFooter>
```

That's it! Users can now toggle stories between public and private directly from the Library page! 🎉
