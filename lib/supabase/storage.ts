// Supabase Storage utilities for image uploads

import { supabaseAdmin } from './admin'
import sharp from 'sharp'
import { retryDatabaseOperation } from '@/lib/database/retry'

const STORAGE_BUCKET = 'stories'
const MAX_IMAGE_SIZE = 5 * 1024 * 1024 // 5MB
const MAX_IMAGE_DIMENSION = 2048 // Max width or height

/**
 * Optimize image for storage
 * Converts to WebP when appropriate, resizes if needed, enforces size limits
 */
async function optimizeImageForStorage(imageBuffer: Buffer): Promise<{ buffer: Buffer; format: string; fileName: string }> {
  const originalSize = imageBuffer.byteLength
  
  // Check if image is too large
  if (originalSize > MAX_IMAGE_SIZE) {
    console.log(`Image is large (${originalSize} bytes), optimizing...`)
  }

  // Get image metadata
  const metadata = await sharp(imageBuffer).metadata()
  const width = metadata.width || 0
  const height = metadata.height || 0
  const hasAlpha = metadata.hasAlpha || false
  const format = metadata.format || 'png'

  // Resize if too large
  let processedImage = sharp(imageBuffer)
  if (width > MAX_IMAGE_DIMENSION || height > MAX_IMAGE_DIMENSION) {
    console.log(`Resizing image from ${width}x${height} to max ${MAX_IMAGE_DIMENSION}x${MAX_IMAGE_DIMENSION}`)
    processedImage = processedImage.resize(MAX_IMAGE_DIMENSION, MAX_IMAGE_DIMENSION, {
      fit: 'inside',
      withoutEnlargement: true
    })
  }

  // Determine best format: WebP for photos/illustrations without transparency, PNG for transparency
  let optimizedBuffer: Buffer
  let outputFormat: string
  let extension: string

  if (hasAlpha) {
    // Has transparency - use PNG
    outputFormat = 'png'
    extension = 'png'
    optimizedBuffer = await processedImage
      .png({
        quality: 85,
        compressionLevel: 9,
        effort: 10
      })
      .toBuffer()
  } else {
    // No transparency - use WebP for better compression
    outputFormat = 'webp'
    extension = 'webp'
    optimizedBuffer = await processedImage
      .webp({
        quality: 85,
        effort: 6
      })
      .toBuffer()
  }

  const optimizedSize = optimizedBuffer.byteLength
  const savingsPercent = Math.round((1 - optimizedSize / originalSize) * 100)
  console.log(`✅ Optimized: ${originalSize} → ${optimizedSize} bytes (${savingsPercent}% smaller, format: ${outputFormat})`)

  // Enforce max file size
  if (optimizedSize > MAX_IMAGE_SIZE) {
    throw new Error(`Image too large after optimization: ${optimizedSize} bytes (maximum: ${MAX_IMAGE_SIZE} bytes)`)
  }

  return {
    buffer: optimizedBuffer,
    format: outputFormat,
    fileName: `image.${extension}`
  }
}

/**
 * Upload an image to Supabase Storage with retry logic and optimization
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
  return retryDatabaseOperation(async () => {
    let imageBuffer: Buffer

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

        imageBuffer = rawBuffer
      } catch (error) {
        throw new Error(`Failed to process base64 image data: ${error instanceof Error ? error.message : String(error)}`)
      }
    } else {
      // Download image from external URL (fallback for URL-based images)
      console.log(`Downloading image from URL for ${storyId}/${imageIndex}...`)
      const imageResponse = await fetch(imageUrl, {
        signal: AbortSignal.timeout(30000) // 30 second timeout
      })
      
      if (!imageResponse.ok) {
        throw new Error(`Failed to download image: ${imageResponse.statusText} (${imageResponse.status})`)
      }
      
      const imageBlob = await imageResponse.blob()
      const rawBuffer = Buffer.from(await imageBlob.arrayBuffer())
      const originalSize = rawBuffer.byteLength
      console.log(`Image downloaded (${originalSize} bytes)`)

      imageBuffer = rawBuffer
    }

    // Optimize image (resize, convert format, compress)
    const { buffer: optimizedBuffer, format, fileName } = await optimizeImageForStorage(imageBuffer)

    // Generate a unique filename with correct extension
    const filePath = `${storyId}/${imageIndex}.${format === 'webp' ? 'webp' : 'png'}`

    console.log(`Uploading to storage: ${filePath}...`)

    // Upload to Supabase Storage with retry
    const uploadResult = await retryDatabaseOperation(async () => {
      const { data, error } = await supabaseAdmin.storage
        .from(STORAGE_BUCKET)
        .upload(filePath, optimizedBuffer, {
          contentType: format === 'webp' ? 'image/webp' : 'image/png',
          upsert: true, // Overwrite if exists
          cacheControl: '3600', // Cache for 1 hour
        })

      if (error) {
        throw new Error(`Storage upload failed: ${error.message}`)
      }

      return data
    }, {
      maxRetries: 2, // Fewer retries for uploads
      initialDelay: 500
    })

    // Get public URL
    const { data: { publicUrl } } = supabaseAdmin.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(filePath)

    if (!publicUrl) {
      throw new Error('Failed to get public URL for uploaded image')
    }

    console.log(`✅ Uploaded successfully: ${publicUrl}`)
    return publicUrl
  }, {
    maxRetries: 3,
    initialDelay: 1000
  })
}

/**
 * Upload result for individual image
 */
export interface ImageUploadResult {
  success: boolean
  index: number
  url?: string
  error?: Error
}

/**
 * Upload multiple images to Supabase Storage with detailed results
 * @param imageUrls - Array of image URLs to upload
 * @param storyId - Story ID for organizing files
 * @returns Array of upload results with success/failure status
 */
export async function uploadImagesToStorage(
  imageUrls: string[],
  storyId: string
): Promise<ImageUploadResult[]> {
  // Upload sequentially to avoid overwhelming storage
  const results: ImageUploadResult[] = []
  
  for (let index = 0; index < imageUrls.length; index++) {
    try {
      const url = await uploadImageToStorage(imageUrls[index], storyId, index)
      results.push({
        success: true,
        index,
        url
      })
    } catch (error) {
      results.push({
        success: false,
        index,
        error: error instanceof Error ? error : new Error(String(error))
      })
    }
  }
  
  return results
}

/**
 * Get successful upload URLs from results
 */
export function getSuccessfulUploadUrls(results: ImageUploadResult[]): string[] {
  return results
    .filter(r => r.success && r.url)
    .map(r => r.url!)
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

