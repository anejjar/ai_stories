// Google Gemini Image Provider

import { GoogleGenerativeAI } from '@google/generative-ai'
import type { ImageProvider, ImageGenerationRequest } from '../../types'

export class GeminiImageProvider implements ImageProvider {
    name: 'gemini-image' = 'gemini-image'
    private genAI: GoogleGenerativeAI | null = null

    constructor() {
        const apiKey = process.env.GEMINI_API_KEY
        if (apiKey) {
            this.genAI = new GoogleGenerativeAI(apiKey)
        } else {
            console.warn('GEMINI_API_KEY is not set. Gemini image provider will not be available.')
        }
    }

    isAvailable(): boolean {
        return this.genAI !== null
    }

    async generateImage(request: ImageGenerationRequest): Promise<string[]> {
        if (!this.genAI) {
            throw new Error('Gemini API key is not configured')
        }

        try {
            const apiKey = process.env.GEMINI_API_KEY
            if (!apiKey) {
                throw new Error('GEMINI_API_KEY is required for image generation')
            }

            // Use Gemini 2.5 Flash Image (Nano Banana) model
            const model = this.genAI.getGenerativeModel({ 
                model: 'gemini-2.5-flash-image'
            })

            // Determine aspect ratio from size
            let aspectRatio = '1:1'
            if (request.size === '1024x1792') {
                aspectRatio = '9:16'
            } else if (request.size === '1792x1024') {
                aspectRatio = '16:9'
            }

            // Generate content with image output
            // @ts-ignore - responseModalities and imageConfig may not be in types yet
            const result = await model.generateContent({
                contents: [{ role: 'user', parts: [{ text: request.prompt }] }],
                generationConfig: {
                    responseModalities: ['IMAGE'],
                    imageConfig: {
                        aspectRatio: aspectRatio
                    }
                }
            })

            const response = result.response
            const images: string[] = []

            // Extract images from response parts
            for (const part of response.candidates?.[0]?.content?.parts || []) {
                if (part.inlineData) {
                    // Convert inline data to base64 data URL
                    const mimeType = part.inlineData.mimeType || 'image/png'
                    const base64Data = part.inlineData.data
                    images.push(`data:${mimeType};base64,${base64Data}`)
                }
            }

            if (images.length === 0) {
                throw new Error('No images generated in response')
            }

            // Handle multiple image requests
            const count = request.count || 1
            if (count > 1 && images.length === 1) {
                // Make additional requests if more images needed
                const additionalPromises = []
                for (let i = 1; i < count; i++) {
                    // @ts-ignore - responseModalities and imageConfig may not be in types yet
                    additionalPromises.push(
                        model.generateContent({
                            contents: [{ role: 'user', parts: [{ text: request.prompt }] }],
                            generationConfig: {
                                responseModalities: ['IMAGE'],
                                imageConfig: { aspectRatio: aspectRatio }
                            }
                        })
                    )
                }
                
                const additionalResults = await Promise.all(additionalPromises)
                for (const result of additionalResults) {
                    const parts = result.response.candidates?.[0]?.content?.parts || []
                    for (const part of parts) {
                        if (part.inlineData) {
                            const mimeType = part.inlineData.mimeType || 'image/png'
                            images.push(`data:${mimeType};base64,${part.inlineData.data}`)
                        }
                    }
                }
            }

            return images.slice(0, count)

        } catch (error: any) {
            console.error('Error generating image with Gemini 2.5 Flash Image:', {
                message: error.message,
                status: error.status,
                code: error.code
            })

            // Provide helpful error messages
            let errorMessage = error.message || 'Unknown error'
            
            if (errorMessage.includes('PERMISSION_DENIED') || errorMessage.includes('403')) {
                errorMessage = 'Image generation requires a paid Gemini API plan. Please enable billing at https://aistudio.google.com/apikey'
            } else if (errorMessage.includes('MODEL_NOT_FOUND') || errorMessage.includes('404')) {
                errorMessage = 'gemini-2.5-flash-image model not available. Ensure you have access to the latest Gemini models.'
            }

            throw new Error(
                `Failed to generate image with Gemini 2.5 Flash Image. ` +
                `Error: ${errorMessage}`
            )
        }
    }
}