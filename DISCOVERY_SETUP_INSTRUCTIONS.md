# Discovery Feature Setup Instructions

## Issue
When making a story public, it reverts to "Private" after page refresh, and the Discovery page is empty.

## Root Cause
The database migration has not been run yet. The `visibility` column and social feature tables don't exist in your database.

## Solution: Run the Database Migration

### Method 1: Supabase Dashboard (Recommended)

1. Go to https://supabase.com/dashboard
2. Select your project
3. Click **SQL Editor** in the left sidebar
4. Click **New Query**
5. Open the file `supabase/migrations/012_discovery_system.sql`
6. Copy the **entire contents** of that file
7. Paste it into the SQL Editor
8. Click **Run** (or press Ctrl+Enter)

### Method 2: Using Supabase CLI (If you have it installed)

```bash
npx supabase db push
```

## What the Migration Does

### 1. Adds Discovery Fields to Stories Table
- `visibility` - 'public' or 'private' (default: 'private')
- `view_count` - Number of views
- `likes_count` - Number of likes
- `comments_count` - Number of comments
- `average_rating` - Average star rating (1-5)
- `ratings_count` - Number of ratings
- `published_at` - Timestamp when first published

### 2. Creates Social Feature Tables
- `story_likes` - User likes on stories
- `story_comments` - Comments with nested replies support
- `story_ratings` - 1-5 star ratings
- `story_reports` - Content moderation reports

### 3. Sets Up Auto-Update Triggers
- Automatically updates like/comment/rating counts when users interact
- Calculates average ratings automatically

### 4. Configures Row Level Security (RLS)
- Public stories visible to all authenticated users
- Private stories only visible to owners
- Users can only like/rate/comment on public stories
- Users can only manage their own interactions

## After Running the Migration

### Test the Feature

1. **Refresh your Library page** at `/library`
2. Find a **text story** (illustrated books cannot be published)
3. Click the **"Private" button**
4. You should see a **confirmation dialog** explaining:
   - What happens when making public
   - Privacy & safety information
   - Community features (likes, ratings, comments)
5. Click **"Make Public"**
6. **Refresh the page** - the button should now show **"Public"** and stay that way
7. Go to **`/discover`** - your public story should appear there!

### Features Available After Migration

#### For Story Owners (Library Page)
- Toggle stories public/private with the PublishToggle button
- See confirmation dialog before publishing
- Only text stories can be published (illustrated books remain private for safety)

#### For All Users (Discovery Page)
- Browse public stories with filters:
  - Search by title/content
  - Filter by theme (Adventure, Fantasy, etc.)
  - Sort by: Recent, Popular, Top Rated, Trending
- Like stories with animated heart button
- Rate stories (1-5 stars)
- Add comments and reply to others
- Report inappropriate content
- Share stories to social media
- View related stories by theme

## Verification Checklist

After running the migration, verify these work:

- [ ] Stories can be toggled public/private
- [ ] Visibility persists after page refresh
- [ ] Public stories appear in Discovery page
- [ ] Likes work and persist
- [ ] Ratings work and show average
- [ ] Comments can be posted
- [ ] Search and filters work in Discovery
- [ ] Only text stories can be published (illustrated books blocked)

## Troubleshooting

### If visibility still doesn't persist:
1. Check browser console for API errors
2. Verify migration ran successfully in Supabase
3. Check that the `visibility` column exists in stories table
4. Look at Network tab to see API response from `/api/stories/[id]/publish`

### If Discovery page is empty:
1. Make sure you published at least one **text story**
2. Check that the story has `visibility = 'public'` in the database
3. Check browser console for errors
4. Verify RLS policies were created correctly

### If you see RLS policy errors:
- The migration sets up all necessary RLS policies
- Make sure you're logged in when testing
- Check that your user session is valid

## Database Schema Reference

### Stories Table (Updated)
```sql
ALTER TABLE stories
  ADD COLUMN visibility TEXT DEFAULT 'private',
  ADD COLUMN view_count INTEGER DEFAULT 0,
  ADD COLUMN likes_count INTEGER DEFAULT 0,
  ADD COLUMN comments_count INTEGER DEFAULT 0,
  ADD COLUMN average_rating DECIMAL(3,2) DEFAULT 0,
  ADD COLUMN ratings_count INTEGER DEFAULT 0,
  ADD COLUMN published_at TIMESTAMPTZ;
```

### New Tables Created
- `story_likes` - Tracks user likes
- `story_comments` - Comments with threading (2 levels deep)
- `story_ratings` - 1-5 star ratings
- `story_reports` - Content moderation

## Next Steps After Migration

1. ✅ Run the migration
2. ✅ Test publishing a story
3. ✅ Visit Discovery page
4. ✅ Test social features (like, rate, comment)
5. 🎉 Feature is ready to use!

## Support

If you encounter any issues:
1. Check the browser console for errors
2. Check the Supabase logs in the dashboard
3. Verify the migration SQL ran without errors
4. Check that all tables and columns were created
