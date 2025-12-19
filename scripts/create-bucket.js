/**
 * Script to create the 'stories' storage bucket in Supabase
 * Run with: node scripts/create-bucket.js
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables')
  console.error('   Please ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function createStorageBucket() {
  console.log('🪣 Creating storage bucket...')

  try {
    // Check if bucket exists
    const { data: buckets, error: listError } = await supabase.storage.listBuckets()

    if (listError) {
      console.error('❌ Error listing buckets:', listError.message)
      process.exit(1)
    }

    const bucketExists = buckets?.some((bucket) => bucket.name === 'stories')

    if (bucketExists) {
      console.log('✅ Storage bucket "stories" already exists!')
      process.exit(0)
    }

    // Create bucket
    const { data, error } = await supabase.storage.createBucket('stories', {
      public: true,
      fileSizeLimit: 10485760, // 10MB
      allowedMimeTypes: ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'],
    })

    if (error) {
      console.error('❌ Error creating bucket:', error.message)
      process.exit(1)
    }

    console.log('✅ Successfully created storage bucket "stories"!')
    console.log('   - Public: true')
    console.log('   - File size limit: 10MB')
    console.log('   - Allowed types: image/png, image/jpeg, image/jpg, image/webp')
  } catch (error) {
    console.error('❌ Unexpected error:', error.message)
    process.exit(1)
  }
}

createStorageBucket()
