/**
 * Script to create the 'stories' storage bucket in Supabase
 * Run with: npx tsx scripts/create-storage-bucket.ts
 */

import * as dotenv from 'dotenv'
import { resolve } from 'path'

// Load environment variables from .env.local
dotenv.config({ path: resolve(process.cwd(), '.env.local') })

import { supabaseAdmin } from '../lib/supabase/admin'

async function createStorageBucket() {
  console.log('🪣 Creating storage bucket...')

  try {
    // Check if bucket exists
    const { data: buckets, error: listError } = await supabaseAdmin.storage.listBuckets()

    if (listError) {
      console.error('❌ Error listing buckets:', listError)
      return
    }

    const bucketExists = buckets?.some((bucket) => bucket.name === 'stories')

    if (bucketExists) {
      console.log('✅ Storage bucket "stories" already exists!')
      return
    }

    // Create bucket
    const { data, error } = await supabaseAdmin.storage.createBucket('stories', {
      public: true,
      fileSizeLimit: 10485760, // 10MB
      allowedMimeTypes: ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'],
    })

    if (error) {
      console.error('❌ Error creating bucket:', error)
      return
    }

    console.log('✅ Successfully created storage bucket "stories"!')
    console.log('   - Public: true')
    console.log('   - File size limit: 10MB')
    console.log('   - Allowed types: image/png, image/jpeg, image/jpg, image/webp')
  } catch (error) {
    console.error('❌ Unexpected error:', error)
  }
}

createStorageBucket()
