/**
 * Story Data Validation
 * Validates story data before database operations
 */
import { validateAIResponse } from '../moderation/ai-response-validator'

export interface ValidationResult {
  isValid: boolean
  errors: string[]
}

const MAX_CONTENT_LENGTH = 50000 // 50KB max story content
const MAX_TITLE_LENGTH = 200
const MAX_IMAGE_URLS = 20
const MAX_BOOK_PAGES = 10

/**
 * Validate story content length
 */
function validateContentLength(content: string): string | null {
  if (!content || typeof content !== 'string') {
    return 'Story content is required'
  }
  
  if (content.length > MAX_CONTENT_LENGTH) {
    return `Story content exceeds maximum length of ${MAX_CONTENT_LENGTH} characters (current: ${content.length})`
  }
  
  if (content.trim().length < 50) {
    return 'Story content must be at least 50 characters'
  // Check for AI refusal patterns
  const aiValidation = validateAIResponse(content)
  if (!aiValidation.isValid) {
    return `Story content appears to be invalid: ${aiValidation.reason}`
  }

  }
  
  return null
}

/**
 * Validate story title
 */
function validateTitle(title: string): string | null {
  if (!title || typeof title !== 'string') {
    return 'Story title is required'
  }
  
  if (title.length > MAX_TITLE_LENGTH) {
    return `Story title exceeds maximum length of ${MAX_TITLE_LENGTH} characters (current: ${title.length})`
  }
  
  if (title.trim().length < 3) {
    return 'Story title must be at least 3 characters'
  }
  
  return null
}

/**
 * Validate image URLs
 */
function validateImageUrls(imageUrls: string[] | null | undefined): string | null {
  if (!imageUrls || imageUrls.length === 0) {
    return null // Empty is valid
  }
  
  if (imageUrls.length > MAX_IMAGE_URLS) {
    return `Too many image URLs: ${imageUrls.length} (maximum: ${MAX_IMAGE_URLS})`
  }
  
  for (let i = 0; i < imageUrls.length; i++) {
    const url = imageUrls[i]
    if (typeof url !== 'string') {
      return `Image URL at index ${i} must be a string`
    }
    
    // Basic URL validation
    if (!url.startsWith('http://') && !url.startsWith('https://') && !url.startsWith('data:image/')) {
      return `Image URL at index ${i} has invalid format`
    }
    
    // Allow data:image URLs (base64) since they will be uploaded to storage and replaced with proper URLs
    // Only validate length for non-data URLs
    if (!url.startsWith('data:image/') && url.length > 2000) {
      return `Image URL at index ${i} is too long (${url.length} characters, maximum: 2000)`
    }
  }
  
  return null
}

/**
 * Validate book pages structure
 */
function validateBookPages(bookPages: any[] | null | undefined): string | null {
  if (!bookPages || bookPages.length === 0) {
    return null // Empty is valid
  }
  
  if (bookPages.length > MAX_BOOK_PAGES) {
    return `Too many book pages: ${bookPages.length} (maximum: ${MAX_BOOK_PAGES})`
  }
  
  for (let i = 0; i < bookPages.length; i++) {
    const page = bookPages[i]
    
    if (!page || typeof page !== 'object') {
      return `Book page at index ${i} must be an object`
    }
    
    if (typeof page.pageNumber !== 'number' || page.pageNumber < 1) {
      return `Book page at index ${i} must have a valid pageNumber (>= 1)`
    }
    
    if (typeof page.text !== 'string' || page.text.trim().length === 0) {
      return `Book page at index ${i} must have non-empty text`
    }
    
    if (page.illustration_url && typeof page.illustration_url !== 'string') {
      return `Book page at index ${i} illustration_url must be a string`
    }
    
    // Allow data:image URLs (base64) since they will be uploaded to storage and replaced with proper URLs
    // Only validate length for non-data URLs
    if (page.illustration_url && 
        !page.illustration_url.startsWith('data:image/') && 
        page.illustration_url.length > 2000) {
      return `Book page at index ${i} illustration_url is too long (${page.illustration_url.length} characters, maximum: 2000)`
    }
  }
  
  return null
}

/**
 * Validate required fields
 */
function validateRequiredFields(data: {
  userId?: string
  title?: string
  content?: string
  theme?: string
}): string | null {
  if (!data.userId || typeof data.userId !== 'string') {
    return 'User ID is required'
  }
  
  if (!data.theme || typeof data.theme !== 'string') {
    return 'Theme is required'
  }
  
  return null
}

/**
 * Validate complete story data before saving
 */
export function validateStoryData(data: {
  userId?: string
  title?: string
  content?: string
  theme?: string
  imageUrls?: string[] | null
  bookPages?: any[] | null
}): ValidationResult {
  const errors: string[] = []
  
  // Validate required fields
  const requiredError = validateRequiredFields(data)
  if (requiredError) {
    errors.push(requiredError)
  }
  
  // Validate title
  if (data.title) {
    const titleError = validateTitle(data.title)
    if (titleError) {
      errors.push(titleError)
    }
  }
  
  // Validate content
  if (data.content) {
    const contentError = validateContentLength(data.content)
    if (contentError) {
      errors.push(contentError)
    }
  }
  
  // Validate image URLs
  const imageUrlsError = validateImageUrls(data.imageUrls)
  if (imageUrlsError) {
    errors.push(imageUrlsError)
  }
  
  // Validate book pages
  const bookPagesError = validateBookPages(data.bookPages)
  if (bookPagesError) {
    errors.push(bookPagesError)
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

/**
 * Sanitize story content (basic sanitization)
 */
export function sanitizeStoryContent(content: string): string {
  // Remove null bytes and other control characters (except newlines and tabs)
  return content
    .replace(/\0/g, '')
    .replace(/[\x01-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
    .trim()
}
