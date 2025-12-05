/**
 * Text-to-Speech Service
 * Uses browser's Web Speech API (SpeechSynthesis)
 */

export interface TTSOptions {
  rate?: number // 0.1 to 10, default 1
  pitch?: number // 0 to 2, default 1
  volume?: number // 0 to 1, default 1
  voice?: SpeechSynthesisVoice | null
  bedtimeMode?: boolean // Slower, calmer narration
}

export class TTSService {
  private synth: SpeechSynthesis
  private utterance: SpeechSynthesisUtterance | null = null
  private isPlaying = false
  private currentText = ''
  private onEndCallback?: () => void
  private onErrorCallback?: (error: Error) => void

  constructor() {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      throw new Error('Speech Synthesis is not supported in this browser')
    }
    this.synth = window.speechSynthesis
  }

  /**
   * Get available voices
   */
  getVoices(): SpeechSynthesisVoice[] {
    return this.synth.getVoices()
  }

  /**
   * Get child-friendly voices (prefer female, warm voices)
   */
  getChildFriendlyVoices(): SpeechSynthesisVoice[] {
    const voices = this.getVoices()
    // Prefer female voices with warm, friendly names
    const preferred = voices.filter((voice) => {
      const name = voice.name.toLowerCase()
      return (
        name.includes('female') ||
        name.includes('woman') ||
        name.includes('samantha') ||
        name.includes('karen') ||
        name.includes('susan') ||
        name.includes('zira') ||
        name.includes('hazel')
      )
    })

    return preferred.length > 0 ? preferred : voices
  }

  /**
   * Get the best voice for bedtime stories
   */
  getBedtimeVoice(): SpeechSynthesisVoice | null {
    const friendlyVoices = this.getChildFriendlyVoices()
    if (friendlyVoices.length === 0) {
      const allVoices = this.getVoices()
      return allVoices.find((v) => v.lang.startsWith('en')) || allVoices[0] || null
    }
    return friendlyVoices[0]
  }

  /**
   * Speak text
   */
  speak(
    text: string,
    options: TTSOptions = {},
    onEnd?: () => void,
    onError?: (error: Error) => void
  ): void {
    // Stop any current speech
    this.stop()

    this.currentText = text
    this.onEndCallback = onEnd
    this.onErrorCallback = onError

    // Create utterance
    this.utterance = new SpeechSynthesisUtterance(text)

    // Set options
    if (options.bedtimeMode) {
      // Bedtime mode: slower, calmer
      this.utterance.rate = 0.75 // Slower
      this.utterance.pitch = 0.9 // Slightly lower pitch (calmer)
      this.utterance.volume = 0.9 // Slightly quieter
      this.utterance.voice = this.getBedtimeVoice()
    } else {
      this.utterance.rate = options.rate ?? 1.0
      this.utterance.pitch = options.pitch ?? 1.0
      this.utterance.volume = options.volume ?? 1.0
      this.utterance.voice = options.voice || this.getBedtimeVoice()
    }

    // Set language
    this.utterance.lang = 'en-US'

    // Event handlers
    this.utterance.onend = () => {
      this.isPlaying = false
      if (this.onEndCallback) {
        this.onEndCallback()
      }
    }

    this.utterance.onerror = (event) => {
      this.isPlaying = false
      const error = new Error(`Speech synthesis error: ${event.error}`)
      if (this.onErrorCallback) {
        this.onErrorCallback(error)
      }
    }

    // Start speaking
    this.isPlaying = true
    this.synth.speak(this.utterance)
  }

  /**
   * Stop speaking
   */
  stop(): void {
    if (this.synth.speaking) {
      this.synth.cancel()
    }
    this.isPlaying = false
    this.utterance = null
  }

  /**
   * Pause speaking
   */
  pause(): void {
    if (this.synth.speaking && !this.synth.paused) {
      this.synth.pause()
    }
  }

  /**
   * Resume speaking
   */
  resume(): void {
    if (this.synth.paused) {
      this.synth.resume()
    }
  }

  /**
   * Check if currently speaking
   */
  isCurrentlyPlaying(): boolean {
    return this.isPlaying && this.synth.speaking
  }

  /**
   * Check if paused
   */
  isPaused(): boolean {
    return this.synth.paused
  }

  /**
   * Check if TTS is supported
   */
  static isSupported(): boolean {
    if (typeof window === 'undefined') return false
    return 'speechSynthesis' in window
  }
}

