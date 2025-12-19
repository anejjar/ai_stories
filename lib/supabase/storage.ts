// Supabase Storage utilities for image uploads

import { supabaseAdmin } from './admin'
import sharp from 'sharp'

const STORAGE_BUCKET = 'stories'

/**
 * Upload an image to Supabase Storage
 * @param imageUrl - URL or base64 data URL of the image to upload
 * @param storyId - Story ID for organizing files
 * @param imageIndex - Index of the image in the story
 * @returns Public URL of the uploaded image
 */
export async function uploadImageToStorage(
  imageUrl: string,
  storyId: string,
  imageIndex: number
): Promise<string> {
  try {
    let imageBuffer: ArrayBuffer

    // Handle base64 data URLs (from DALL-E) directly - no need to download
    if (imageUrl.startsWith('data:image/')) {
      console.log(`Processing base64 image data for ${storyId}/${imageIndex}...`)
      try {
        // Extract base64 data from data URL
        const base64Data = imageUrl.split(',')[1]
        if (!base64Data) {
          throw new Error('Invalid data URL format')
        }
        const rawBuffer = Buffer.from(base64Data, 'base64')
        const originalSize = rawBuffer.byteLength
        console.log(`Base64 image processed (${originalSize} bytes)`)

        // Compress image using Sharp for 70-75% size reduction
        console.log(`Compressing image...`)
        const compressedBuffer = await sharp(rawBuffer)
          .png({
            quality: 85,           // High quality, minimal visual loss
            compressionLevel: 9,   // Maximum PNG compression
            effort: 10             // Maximum optimization effort
          })
          .toBuffer()

        const compressedSize = compressedBuffer.byteLength
        const savingsPercent = Math.round((1 - compressedSize / originalSize) * 100)
        console.log(`✅ Compressed: ${originalSize} → ${compressedSize} bytes (${savingsPercent}% smaller)`)

        imageBuffer = compressedBuffer.buffer
      } catch (error) {
        throw new Error('Failed to process base64 image data')
      }
    } else {
      // Download image from external URL (fallback for URL-based images)
      console.log(`Downloading image from URL for ${storyId}/${imageIndex}...`)
      const imageResponse = await fetch(imageUrl)
      if (!imageResponse.ok) {
        throw new Error(`Failed to download image: ${imageResponse.statusText}`)
      }
      const imageBlob = await imageResponse.blob()
      const rawBuffer = await imageBlob.arrayBuffer()
      const originalSize = rawBuffer.byteLength
      console.log(`Image downloaded (${originalSize} bytes)`)

      // Compress downloaded image as well
      console.log(`Compressing image...`)
      const compressedBuffer = await sharp(Buffer.from(rawBuffer))
        .png({
          quality: 85,
          compressionLevel: 9,
          effort: 10
        })
        .toBuffer()

      const compressedSize = compressedBuffer.byteLength
      const savingsPercent = Math.round((1 - compressedSize / originalSize) * 100)
      console.log(`✅ Compressed: ${originalSize} → ${compressedSize} bytes (${savingsPercent}% smaller)`)

      imageBuffer = compressedBuffer.buffer
    }

    // Generate a unique filename
    const fileName = `${storyId}/${imageIndex}.png`

    console.log(`Uploading to storage: ${fileName}...`)

    // Upload to Supabase Storage
    const { data, error } = await supabaseAdmin.storage
      .from(STORAGE_BUCKET)
      .upload(fileName, imageBuffer, {
        contentType: 'image/png',
        upsert: true, // Overwrite if exists
        cacheControl: '3600', // Cache for 1 hour
      })

    if (error) {
      console.error('Storage upload error:', error)
      throw error
    }

    // Get public URL - use the same destructuring pattern as profile picture upload
    const { data: { publicUrl } } = supabaseAdmin.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(fileName)

    if (!publicUrl) {
      throw new Error('Failed to get public URL for uploaded image')
    }

    console.log(`✅ Uploaded successfully: ${publicUrl}`)
    return publicUrl
  } catch (error) {
    console.error('Error uploading image to storage:', error)
    throw error
  }
}

/**
 * Upload multiple images to Supabase Storage
 * @param imageUrls - Array of image URLs to upload
 * @param storyId - Story ID for organizing files
 * @returns Array of public URLs for uploaded images
 */
export async function uploadImagesToStorage(
  imageUrls: string[],
  storyId: string
): Promise<string[]> {
  const uploadPromises = imageUrls.map((url, index) =>
    uploadImageToStorage(url, storyId, index)
  )

  return Promise.all(uploadPromises)
}

/**
 * Delete images from Supabase Storage
 * @param storyId - Story ID to delete images for
 */
export async function deleteStoryImages(storyId: string): Promise<void> {
  try {
    // List all files in the story folder
    const { data: files, error: listError } = await supabaseAdmin.storage
      .from(STORAGE_BUCKET)
      .list(storyId)

    if (listError) {
      console.error('Error listing files:', listError)
      return
    }

    if (!files || files.length === 0) {
      return
    }

    // Delete all files
    const filePaths = files.map((file) => `${storyId}/${file.name}`)
    const { error: deleteError } = await supabaseAdmin.storage
      .from(STORAGE_BUCKET)
      .remove(filePaths)

    if (deleteError) {
      console.error('Error deleting files:', deleteError)
    }
  } catch (error) {
    console.error('Error deleting story images:', error)
  }
}

