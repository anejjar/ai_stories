'use client'

import { useState, useRef } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { 
  Upload, 
  Image as ImageIcon, 
  Shield, 
  Loader2, 
  CheckCircle2, 
  AlertCircle, 
  Wand2,
  RefreshCw
} from 'lucide-react'

interface ChildImageUploadModalProps {
  isOpen: boolean
  onClose: () => void
  profileId: string
  childName: string
  onUploadSuccess: () => void
}

type UploadState = 'idle' | 'analyzing' | 'generating' | 'selecting' | 'saving' | 'success' | 'error'

interface GeneratedImage {
  url: string
  theme: string
  description: string // prompt used
}

export function ChildImageUploadModal({
  isOpen,
  onClose,
  profileId,
  childName,
  onUploadSuccess
}: ChildImageUploadModalProps) {
  const { getAccessToken } = useAuth()
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [state, setState] = useState<UploadState>('idle')
  const [error, setError] = useState('')
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([])
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [aiAnalysis, setAiAnalysis] = useState<string>('')

  const resetState = () => {
    setState('idle')
    setError('')
    setGeneratedImages([])
    setSelectedImageIndex(null)
    setUploadProgress(0)
    setAiAnalysis('')
  }

  const handleClose = () => {
    if (state === 'analyzing' || state === 'generating' || state === 'saving') {
      return // Prevent closing while processing
    }
    onClose()
    // Reset state after transition
    setTimeout(resetState, 300)
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image file is too large. Maximum size is 5MB.')
      return
    }

    await processImage(file)
  }

  const processImage = async (file: File) => {
    setState('analyzing')
    setError('')
    setUploadProgress(10)

    try {
      const token = await getAccessToken()
      if (!token) throw new Error('Authentication required')

      const formData = new FormData()
      formData.append('image', file)

      // Step 1: Analyze & Generate
      // This endpoint will now handle both analysis and generation of 3 variants
      const response = await fetch(`/api/child-profiles/${profileId}/image`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      })

      setUploadProgress(50)

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || 'Failed to process image')
      }

      setState('selecting')
      setGeneratedImages(data.data.images || [])
      setAiAnalysis(data.data.analysis || '') // Store AI description for later use
      setUploadProgress(100)
    } catch (err) {
      console.error('Error processing image:', err)
      setError(err instanceof Error ? err.message : 'Failed to process image')
      setState('error')
    }
  }

  const handleSaveSelection = async () => {
    if (selectedImageIndex === null) return
    
    const selectedImage = generatedImages[selectedImageIndex]
    setState('saving')
    setError('')
    
    try {
      const token = await getAccessToken()
      if (!token) throw new Error('Authentication required')

      console.log('Saving image selection:', { 
        profileId, 
        imageUrl: selectedImage.url.substring(0, 50) + '...',
        theme: selectedImage.theme 
      })

      // Add timeout to fetch request (30 seconds)
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 30000)

      const response = await fetch(`/api/child-profiles/${profileId}/image/select`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageUrl: selectedImage.url,
          theme: selectedImage.theme,
          aiDescription: aiAnalysis // Send AI description for consistent illustration generation
        }),
        signal: controller.signal,
      }).finally(() => {
        clearTimeout(timeoutId)
      })

      // Check if response is ok before parsing
      if (!response.ok) {
        const errorText = await response.text()
        let errorData
        try {
          errorData = JSON.parse(errorText)
        } catch {
          errorData = { error: errorText || `HTTP ${response.status}` }
        }
        throw new Error(errorData.error || `Failed to save: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || 'Failed to save selection')
      }

      console.log('Image saved successfully:', data.data)
      setState('success')
      setTimeout(() => {
        onUploadSuccess()
        handleClose()
      }, 2000)
    } catch (err) {
      console.error('Error saving selection:', err)
      const errorMessage = err instanceof Error 
        ? err.message 
        : err instanceof DOMException && err.name === 'AbortError'
        ? 'Request timeout - please try again'
        : 'Failed to save selection'
      setError(errorMessage)
      setState('error')
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-3xl bg-gradient-to-br from-purple-50 to-white border-2 border-purple-200">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2 text-purple-800">
            {state === 'success' ? (
              <>
                <CheckCircle2 className="h-6 w-6 text-green-500" />
                Profile Photo Updated!
              </>
            ) : (
              <>
                <Wand2 className="h-6 w-6 text-purple-500" />
                Create Magic Profile Photo
              </>
            )}
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            {state === 'idle' && "Upload a photo of your child to generate magical story illustrations."}
            {state === 'analyzing' && "Analyzing your photo to create safe, magical versions..."}
            {state === 'selecting' && "Choose your favorite magical transformation!"}
            {state === 'saving' && "Saving your magical profile photo..."}
            {state === 'success' && "Your child's profile photo is ready for stories!"}
            {state === 'error' && "Something went wrong. Please try again."}
          </DialogDescription>
        </DialogHeader>

        {/* Content Area */}
        <div className="py-6">
          {state === 'idle' && (
            <div className="space-y-6">
              {/* Trust Notice */}
              <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 flex gap-3">
                <Shield className="h-10 w-10 text-blue-500 flex-shrink-0" />
                <div>
                  <h4 className="font-bold text-blue-800 text-sm">Privacy & Safety First</h4>
                  <p className="text-xs text-blue-700 mt-1">
                    We value your privacy. Your child's photo is <strong>never stored</strong>. 
                    It is only analyzed by AI once to generate these stylized illustrations, 
                    then immediately discarded.
                  </p>
                </div>
              </div>

              {/* Upload Area */}
              <div 
                className="border-4 border-dashed border-purple-200 rounded-2xl p-10 text-center hover:bg-purple-50 transition-colors cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                  <Upload className="h-10 w-10 text-purple-500" />
                </div>
                <h3 className="text-lg font-bold text-gray-800 mb-2">Click to Upload Photo</h3>
                <p className="text-sm text-gray-500 mb-4">Supported formats: JPG, PNG (Max 5MB)</p>
                <Button className="rounded-full bg-purple-600 hover:bg-purple-700">
                  Select Photo
                </Button>
                <input 
                  type="file" 
                  ref={fileInputRef}
                  className="hidden" 
                  accept="image/*"
                  onChange={handleFileSelect}
                />
              </div>
            </div>
          )}

          {(state === 'analyzing' || state === 'generating') && (
            <div className="text-center py-10">
              <div className="relative w-24 h-24 mx-auto mb-6">
                <div className="absolute inset-0 border-4 border-purple-100 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-purple-500 rounded-full border-t-transparent animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Wand2 className="h-10 w-10 text-purple-500 animate-pulse" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-purple-800 mb-2">Creating Magic...</h3>
              <p className="text-gray-500">
                {state === 'analyzing' ? "Analyzing features safely..." : "Painting magical portraits..."}
              </p>
            </div>
          )}

          {state === 'selecting' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {generatedImages.map((img, index) => (
                <Card 
                  key={index}
                  className={`overflow-hidden cursor-pointer transition-all duration-300 relative ${
                    selectedImageIndex === index 
                      ? 'ring-4 ring-purple-500 scale-105 shadow-xl' 
                      : 'hover:shadow-lg hover:scale-102 border-2 border-transparent hover:border-purple-200'
                  }`}
                  onClick={() => setSelectedImageIndex(index)}
                >
                  <div className="aspect-square relative bg-gray-100">
                    <img 
                      src={img.url} 
                      alt={img.theme} 
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/70 to-transparent p-3">
                      <span className="text-white font-bold text-sm capitalize">{img.theme} Style</span>
                    </div>
                    {selectedImageIndex === index && (
                      <div className="absolute top-2 right-2 bg-purple-500 text-white rounded-full p-1 shadow-lg">
                        <CheckCircle2 className="h-5 w-5" />
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}

          {state === 'saving' && (
            <div className="text-center py-10">
              <Loader2 className="h-12 w-12 text-purple-600 animate-spin mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-800">Saving Profile Picture...</h3>
            </div>
          )}

          {state === 'error' && (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="h-8 w-8 text-red-500" />
              </div>
              <h3 className="text-lg font-bold text-red-800 mb-2">Oops! Something went wrong</h3>
              <p className="text-red-600 mb-6">{error}</p>
              <Button onClick={resetState} variant="outline" className="rounded-full">
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
            </div>
          )}
        </div>

        <DialogFooter className="sm:justify-between items-center border-t border-gray-100 pt-4">
          {state === 'selecting' ? (
            <>
              <p className="text-sm text-gray-500 italic hidden sm:block">
                Select the version you like best
              </p>
              <div className="flex gap-2 w-full sm:w-auto">
                <Button variant="ghost" onClick={resetState}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleSaveSelection} 
                  disabled={selectedImageIndex === null || (state as UploadState) === 'saving'}
                  className="flex-1 sm:flex-none bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {(state as UploadState) === 'saving' ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save Profile Photo'
                  )}
                </Button>
              </div>
            </>
          ) : state === 'idle' || state === 'error' ? (
            <Button variant="ghost" onClick={handleClose} className="ml-auto">
              Close
            </Button>
          ) : null}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

