# Verify Child Profiles Migration

This guide shows you how to verify if the `006_add_child_profiles.sql` migration has been successfully applied to your Supabase database.

## Method 1: Using Supabase SQL Editor (Recommended)

### Steps:

1. **Open Supabase Dashboard**
   - Go to [https://app.supabase.com](https://app.supabase.com)
   - Select your project

2. **Navigate to SQL Editor**
   - Click on "SQL Editor" in the left sidebar

3. **Run the Verification Query**
   - Open the file: `supabase/migrations/check_child_profiles.sql`
   - Copy the entire contents
   - Paste into the SQL Editor
   - Click "Run" or press `Ctrl+Enter` (Windows) / `Cmd+Enter` (Mac)

4. **Check Results**
   
   **✅ Migration Successful if:**
   - `table_exists = true`
   - All 10 columns are listed (id, user_id, name, nickname, birth_date, appearance, ai_generated_image_url, original_image_uploaded_at, created_at, updated_at)
   - Indexes are present (idx_child_profiles_user_id, idx_child_profiles_name)
   - Trigger exists (update_child_profiles_updated_at)

   **❌ Migration NOT Applied if:**
   - `table_exists = false`
   - Error message: "relation 'child_profiles' does not exist"
   - **Action Required:** Run the migration file `006_add_child_profiles.sql`

## Method 2: Using API Endpoint

### Steps:

1. **Start your development server** (if not already running)
   ```bash
   npm run dev
   ```

2. **Call the verification endpoint**
   ```bash
   curl http://localhost:3000/api/child-profiles/verify-migration
   ```
   
   Or open in your browser:
   ```
   http://localhost:3000/api/child-profiles/verify-migration
   ```

3. **Check Response**

   **✅ Migration Successful:**
   ```json
   {
     "success": true,
     "message": "Migration verified successfully!",
     "data": {
       "migrationStatus": "applied",
       "tableExists": true,
       "structureValid": true
     }
   }
   ```

   **❌ Migration NOT Applied:**
   ```json
   {
     "success": false,
     "error": "Migration not applied: child_profiles table does not exist",
     "data": {
       "migrationStatus": "not_applied"
     }
   }
   ```

## Method 3: Quick SQL Check

Run this simple query in Supabase SQL Editor:

```sql
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'child_profiles'
) AS table_exists;
```

- Returns `true` = Migration applied ✅
- Returns `false` = Migration NOT applied ❌

## If Migration Hasn't Been Applied

1. **Go to Supabase Dashboard > SQL Editor**
2. **Open the migration file:** `supabase/migrations/006_add_child_profiles.sql`
3. **Copy the entire contents**
4. **Paste into SQL Editor**
5. **Click "Run"**
6. **Verify again** using one of the methods above

## Troubleshooting

### Error: "relation already exists"
- The migration has already been applied
- This is safe to ignore (the `IF NOT EXISTS` clause prevents errors)

### Error: "permission denied"
- Make sure you're using the SQL Editor with proper permissions
- Check that you're logged into the correct Supabase project

### Error: "column already exists"
- Some parts of the migration may have been run before
- Check which columns exist and manually complete the migration if needed

## Migration Order

Make sure these migrations have been run in order:
1. `001_initial_schema.sql`
2. `002_add_story_drafts.sql`
3. `002_rls_policies.sql`
4. `003_add_multi_child_support.sql`
5. `003_user_profile_trigger.sql`
6. `004_add_appearance_column.sql`
7. `005_create_storage_bucket.sql`
8. `006_add_child_profiles.sql` ← **This one!**

