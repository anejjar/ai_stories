# Next.js 15 Params Fix - Complete

## Issue
Next.js 15 made `params` asynchronous in API routes. The error was:
```
Error: Route "/api/stories/[id]/publish" used `params.id`.
`params` is a Promise and must be unwrapped with `await` or `React.use()`
before accessing its properties.
```

## Files Fixed (7 API Routes)

All routes in `app/api/stories/[id]/` have been updated:

1. ✅ `publish/route.ts` - Toggle story public/private
2. ✅ `like/route.ts` - Like/unlike stories
3. ✅ `comments/route.ts` - GET and POST comments
4. ✅ `rating/route.ts` - Rate stories
5. ✅ `report/route.ts` - Report inappropriate content
6. ✅ `related/route.ts` - Get related stories
7. ✅ `social-stats/route.ts` - Get social statistics

## Changes Applied

### Before (Old Code):
```typescript
interface PublishParams {
  params: {
    id: string
  }
}

export async function POST(
  request: NextRequest,
  { params }: PublishParams
) {
  const storyId = params.id  // ❌ ERROR: params is a Promise
  // ...
}
```

### After (Fixed Code):
```typescript
interface PublishParams {
  params: Promise<{    // ✅ Now a Promise
    id: string
  }>
}

export async function POST(
  request: NextRequest,
  { params }: PublishParams
) {
  const { id: storyId } = await params  // ✅ Awaited properly
  // ...
}
```

## Testing

Your `/api/stories/[id]/publish` endpoint should now work correctly!

Try it:
1. Create a text story
2. Click the "Private" button in Library
3. It should toggle to "Public" without errors
4. Story should appear in `/discover`

All other social feature endpoints (likes, comments, ratings, etc.) should also work now! 🎉
