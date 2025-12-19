/**
 * ElevenLabs API Client
 * Handles voice cloning and text-to-speech generation
 */

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY || ''
const ELEVENLABS_API_URL = 'https://api.elevenlabs.io/v1'

export interface VoiceProfile {
  voice_id: string
  name: string
  category: string
  description?: string
  preview_url?: string
  created_at: string
}

export interface CloneVoiceParams {
  name: string
  description?: string
  audioFiles: File[] // Audio samples for cloning
}

export interface GenerateSpeechParams {
  text: string
  voice_id: string
  model_id?: string
  voice_settings?: {
    stability: number
    similarity_boost: number
    style?: number
    use_speaker_boost?: boolean
  }
}

/**
 * Get all available voices (including cloned ones)
 */
export async function getVoices(): Promise<VoiceProfile[]> {
  try {
    const response = await fetch(`${ELEVENLABS_API_URL}/voices`, {
      headers: {
        'xi-api-key': ELEVENLABS_API_KEY,
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch voices: ${response.statusText}`)
    }

    const data = await response.json()
    return data.voices || []
  } catch (error) {
    console.error('Error fetching voices:', error)
    return []
  }
}

/**
 * Clone a voice from audio samples
 */
export async function cloneVoice(params: CloneVoiceParams): Promise<VoiceProfile | null> {
  try {
    const formData = new FormData()
    formData.append('name', params.name)
    if (params.description) {
      formData.append('description', params.description)
    }

    // Add audio files
    params.audioFiles.forEach((file, index) => {
      formData.append('files', file, `sample_${index}.${file.name.split('.').pop()}`)
    })

    const response = await fetch(`${ELEVENLABS_API_URL}/voices/add`, {
      method: 'POST',
      headers: {
        'xi-api-key': ELEVENLABS_API_KEY,
      },
      body: formData,
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.detail?.message || 'Failed to clone voice')
    }

    const data = await response.json()
    return {
      voice_id: data.voice_id,
      name: params.name,
      category: 'cloned',
      description: params.description,
      created_at: new Date().toISOString(),
    }
  } catch (error) {
    console.error('Error cloning voice:', error)
    throw error
  }
}

/**
 * Generate speech from text using a specific voice
 */
export async function generateSpeech(params: GenerateSpeechParams): Promise<ArrayBuffer> {
  try {
    const response = await fetch(`${ELEVENLABS_API_URL}/text-to-speech/${params.voice_id}`, {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': ELEVENLABS_API_KEY,
      },
      body: JSON.stringify({
        text: params.text,
        model_id: params.model_id || 'eleven_monolingual_v1',
        voice_settings: params.voice_settings || {
          stability: 0.5,
          similarity_boost: 0.75,
          use_speaker_boost: true,
        },
      }),
    })

    if (!response.ok) {
      throw new Error(`Failed to generate speech: ${response.statusText}`)
    }

    return await response.arrayBuffer()
  } catch (error) {
    console.error('Error generating speech:', error)
    throw error
  }
}

/**
 * Delete a cloned voice
 */
export async function deleteVoice(voiceId: string): Promise<boolean> {
  try {
    const response = await fetch(`${ELEVENLABS_API_URL}/voices/${voiceId}`, {
      method: 'DELETE',
      headers: {
        'xi-api-key': ELEVENLABS_API_KEY,
      },
    })

    return response.ok
  } catch (error) {
    console.error('Error deleting voice:', error)
    return false
  }
}

/**
 * Get voice details
 */
export async function getVoiceDetails(voiceId: string): Promise<VoiceProfile | null> {
  try {
    const response = await fetch(`${ELEVENLABS_API_URL}/voices/${voiceId}`, {
      headers: {
        'xi-api-key': ELEVENLABS_API_KEY,
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch voice details: ${response.statusText}`)
    }

    const data = await response.json()
    return {
      voice_id: data.voice_id,
      name: data.name,
      category: data.category,
      description: data.description,
      preview_url: data.preview_url,
      created_at: data.created_at,
    }
  } catch (error) {
    console.error('Error fetching voice details:', error)
    return null
  }
}

/**
 * Check if ElevenLabs is configured
 */
export function isElevenLabsConfigured(): boolean {
  return !!ELEVENLABS_API_KEY
}

/**
 * Get usage/quota information
 */
export async function getUsage(): Promise<{ character_count: number; character_limit: number }> {
  try {
    const response = await fetch(`${ELEVENLABS_API_URL}/user`, {
      headers: {
        'xi-api-key': ELEVENLABS_API_KEY,
      },
    })

    if (!response.ok) {
      throw new Error('Failed to fetch usage')
    }

    const data = await response.json()
    return {
      character_count: data.subscription?.character_count || 0,
      character_limit: data.subscription?.character_limit || 0,
    }
  } catch (error) {
    console.error('Error fetching usage:', error)
    return { character_count: 0, character_limit: 0 }
  }
}

/**
 * Validate audio file for voice cloning
 * Requirements:
 * - At least 1 minute of audio
 * - MP3, WAV, or M4A format
 * - Clear speech, minimal background noise
 */
export function validateAudioFile(file: File): { valid: boolean; error?: string } {
  const validFormats = ['audio/mpeg', 'audio/wav', 'audio/mp4', 'audio/x-m4a']
  const maxSize = 10 * 1024 * 1024 // 10MB

  if (!validFormats.includes(file.type)) {
    return { valid: false, error: 'Invalid file format. Please use MP3, WAV, or M4A.' }
  }

  if (file.size > maxSize) {
    return { valid: false, error: 'File too large. Maximum size is 10MB.' }
  }

  if (file.size < 100 * 1024) {
    return { valid: false, error: 'File too small. Please provide at least 1 minute of clear audio.' }
  }

  return { valid: true }
}
