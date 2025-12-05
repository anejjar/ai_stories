// Supabase Storage utilities for image uploads

import { supabaseAdmin } from './admin'

const STORAGE_BUCKET = 'stories'

/**
 * Upload an image to Supabase Storage
 * @param imageUrl - URL of the image to download and upload
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
    // Download the image from the external URL
    const imageResponse = await fetch(imageUrl)
    if (!imageResponse.ok) {
      throw new Error(`Failed to download image: ${imageResponse.statusText}`)
    }

    const imageBlob = await imageResponse.blob()
    const imageBuffer = await imageBlob.arrayBuffer()

    // Generate a unique filename
    const fileExtension = imageUrl.split('.').pop()?.split('?')[0] || 'png'
    const fileName = `${storyId}/${imageIndex}.${fileExtension}`

    // Upload to Supabase Storage
    const { data, error } = await supabaseAdmin.storage
      .from(STORAGE_BUCKET)
      .upload(fileName, imageBuffer, {
        contentType: imageBlob.type || 'image/png',
        upsert: true, // Overwrite if exists
      })

    if (error) {
      throw error
    }

    // Get public URL
    const { data: urlData } = supabaseAdmin.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(fileName)

    if (!urlData?.publicUrl) {
      throw new Error('Failed to get public URL for uploaded image')
    }

    return urlData.publicUrl
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

