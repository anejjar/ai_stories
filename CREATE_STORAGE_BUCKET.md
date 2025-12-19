# Create Storage Bucket for Illustrated Books

## Quick Fix

Your illustrated books are failing because the **"stories" storage bucket doesn't exist yet** in Supabase.

## Solution: Create the Bucket Manually (2 minutes)

### Step 1: Go to Supabase Dashboard
1. Open https://supabase.com/dashboard
2. Select your project: `qpdoemudsvfhnxaigrsd`

### Step 2: Navigate to Storage
1. Click **Storage** in the left sidebar
2. Click **"New bucket"** button

### Step 3: Configure the Bucket
Fill in these settings:
- **Name:** `stories`
- **Public bucket:** ✅ Yes (checked)
- **File size limit:** `10` MB
- **Allowed MIME types:** `image/png, image/jpeg, image/jpg, image/webp`

### Step 4: Create
Click **"Create bucket"**

---

## That's It!

Once the bucket is created, illustrated books will work immediately. Try generating one again!

---

## Verification

After creating the bucket, you should see:
```bash
📤 Uploading illustrated book images to storage...
✅ Successfully uploaded 7 images to storage
Using storage URLs: true
POST /api/stories 200 in [time]
```

---

## Alternative: API Method (if you prefer)

If you want to create it programmatically:

```bash
# In Supabase SQL Editor, run:
-- This creates the bucket via SQL
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'stories',
  'stories',
  true,
  10485760,
  ARRAY['image/png', 'image/jpeg', 'image/jpg', 'image/webp']
);
```

---

## Why This is Needed

Illustrated books generate images with DALL-E, which produces very long URLs (~2000 characters each). With 7 pages, that's ~14KB just for URLs, causing database timeouts.

The solution uploads images to Supabase Storage first, then stores short storage URLs (~100 chars) in the database instead.

**Before:** DALL-E URL → Database (timeout ❌)
**After:** DALL-E URL → Storage → Short URL → Database (success ✅)

---

## Next Steps

1. ✅ Create the "stories" bucket in Supabase Dashboard
2. ✅ Try generating an illustrated book
3. ✅ It should work end-to-end!

The upload step adds ~15-20 seconds (normal for 7 images), but prevents timeouts and stores images permanently.
