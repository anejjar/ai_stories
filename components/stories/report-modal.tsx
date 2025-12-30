'use client'

import { useState } from 'react'
import { AlertTriangle, Flag, X, CheckCircle2, Sparkles } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import type { ReportReason } from '@/types/discovery'

interface ReportModalProps {
  storyId: string
  trigger?: React.ReactNode
}

const REPORT_REASONS: { value: ReportReason; label: string; description: string }[] = [
  {
    value: 'unwanted_words',
    label: 'Unwanted Words',
    description: 'Story contains words or language that are not appropriate for children'
  },
  {
    value: 'unwanted_images',
    label: 'Unwanted Images',
    description: 'Images contain content that is not suitable or appropriate'
  },
  {
    value: 'image_issues',
    label: 'Image Issues',
    description: 'Images are broken, distorted, or have quality problems'
  },
  {
    value: 'inappropriate',
    label: 'Inappropriate Content',
    description: 'Contains content not suitable for children'
  },
  {
    value: 'spam',
    label: 'Spam or Misleading',
    description: 'Story appears to be spam or misleading'
  },
  {
    value: 'copyright',
    label: 'Copyright Violation',
    description: 'Story violates copyright or intellectual property'
  },
  {
    value: 'other',
    label: 'Other',
    description: 'Another reason not listed above'
  }
]

export function ReportModal({ storyId, trigger }: ReportModalProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [reason, setReason] = useState<ReportReason>('inappropriate')
  const [description, setDescription] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSuccess, setIsSuccess] = useState(false)

  const resetForm = () => {
    setReason('inappropriate')
    setDescription('')
    setError(null)
    setIsSuccess(false)
  }

  const handleClose = () => {
    setIsOpen(false)
    // Reset form after a short delay to allow dialog close animation
    setTimeout(() => {
      resetForm()
    }, 200)
  }

  const handleSubmit = async () => {
    if (isSubmitting) return

    // Clear previous errors
    setError(null)
    setIsSubmitting(true)

    try {
      // Validate reason is selected
      if (!reason) {
        setError('Please select a reason for reporting')
        setIsSubmitting(false)
        return
      }

      // Validate description length if provided
      if (description.trim().length > 500) {
        setError('Description is too long. Please keep it under 500 characters.')
        setIsSubmitting(false)
        return
      }

      const response = await fetch(`/api/stories/${storyId}/report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reason,
          description: description.trim() || undefined
        })
      })

      // Handle network errors
      if (!response.ok) {
        let errorMessage = 'Failed to submit report'
        
        try {
          const errorData = await response.json()
          errorMessage = errorData.error || errorData.message || `Server error (${response.status})`
        } catch {
          // If response is not JSON, use status text
          errorMessage = response.statusText || `Server error (${response.status})`
        }

        // Handle specific HTTP status codes
        if (response.status === 401) {
          errorMessage = 'Please log in to submit a report'
        } else if (response.status === 404) {
          errorMessage = 'Story not found'
        } else if (response.status === 400) {
          // Keep the error message from the API response
        } else if (response.status === 429) {
          errorMessage = 'Too many requests. Please try again later.'
        } else if (response.status >= 500) {
          errorMessage = 'Server error. Please try again in a moment.'
        }

        setError(errorMessage)
        toast.error(errorMessage)
        setIsSubmitting(false)
        return
      }

      // Parse response
      let result
      try {
        result = await response.json()
      } catch (parseError) {
        console.error('Error parsing response:', parseError)
        setError('Invalid response from server. Please try again.')
        toast.error('Invalid response from server')
        setIsSubmitting(false)
        return
      }

      // Handle success
      if (result.success) {
        setIsSuccess(true)
        // Auto-close after showing success message for 3 seconds
        setTimeout(() => {
          handleClose()
        }, 3000)
      } else {
        // Handle API-level errors
        const errorMessage = result.error || result.message || 'Failed to submit report'
        setError(errorMessage)
        toast.error(errorMessage)
      }
    } catch (error) {
      // Handle network errors, timeouts, etc.
      console.error('Error submitting report:', error)
      
      let errorMessage = 'Failed to submit report'
      
      if (error instanceof TypeError && error.message.includes('fetch')) {
        errorMessage = 'Network error. Please check your connection and try again.'
      } else if (error instanceof Error) {
        errorMessage = error.message || 'An unexpected error occurred'
      }

      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) {
        handleClose()
      } else {
        setIsOpen(true)
      }
    }}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm" className="text-red-600 border-red-200 hover:bg-red-50">
            <Flag className="h-4 w-4 mr-2" />
            Report
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <AnimatePresence mode="wait">
          {isSuccess ? (
            // Success State
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.3 }}
              className="py-8"
            >
              <div className="flex flex-col items-center justify-center text-center space-y-6">
                {/* Animated Success Icon */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ 
                    type: "spring",
                    stiffness: 200,
                    damping: 15,
                    delay: 0.1
                  }}
                  className="relative"
                >
                  <div className="absolute inset-0 bg-green-100 rounded-full animate-ping opacity-75" />
                  <div className="relative bg-green-500 rounded-full p-6">
                    <CheckCircle2 className="h-12 w-12 text-white" />
                  </div>
                </motion.div>

                {/* Sparkles Animation */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="flex items-center gap-2"
                >
                  <Sparkles className="h-6 w-6 text-amber-500 animate-pulse" />
                  <h3 className="text-2xl font-black text-gray-900">
                    Thank You!
                  </h3>
                  <Sparkles className="h-6 w-6 text-amber-500 animate-pulse" />
                </motion.div>

                {/* Success Message */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="space-y-3"
                >
                  <p className="text-lg font-bold text-gray-700">
                    Thank you for making this app healthy and safe for all children!
                  </p>
                  <p className="text-sm text-gray-500">
                    Our team will review your report promptly.
                  </p>
                </motion.div>

                {/* Closing indicator */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="text-xs text-gray-400"
                >
                  This window will close automatically...
                </motion.div>
              </div>
            </motion.div>
          ) : (
            // Form State
            <motion.div
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-red-600">
                  <AlertTriangle className="h-5 w-5" />
                  Report Story
                </DialogTitle>
                <DialogDescription>
                  Help us maintain a safe community by reporting inappropriate content.
                  Our team will review your report promptly.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6 py-4">
          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4 flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-red-900">Error</p>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
              <button
                onClick={() => setError(null)}
                className="text-red-600 hover:text-red-800 shrink-0"
                aria-label="Dismiss error"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* Reason Selection */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold">Reason for reporting</Label>
            <RadioGroup value={reason} onValueChange={(value) => setReason(value as ReportReason)}>
              {REPORT_REASONS.map((option) => (
                <div key={option.value} className="flex items-start space-x-3 space-y-0">
                  <RadioGroupItem value={option.value} id={option.value} className="mt-1" />
                  <Label
                    htmlFor={option.value}
                    className="font-normal cursor-pointer flex-1"
                  >
                    <div className="font-semibold text-sm">{option.label}</div>
                    <div className="text-xs text-gray-500">{option.description}</div>
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          {/* Additional Details */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-semibold">
              Additional details <span className="text-gray-400 font-normal">(optional)</span>
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Please provide any additional context..."
              className="min-h-[100px] resize-none"
              maxLength={500}
            />
            <div className="text-xs text-gray-500 text-right">
              {description.length}/500 characters
            </div>
          </div>
        </div>

        {/* Actions */}
              <div className="flex gap-3 justify-end">
                <Button
                  variant="outline"
                  onClick={handleClose}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="bg-red-600 hover:bg-red-700"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Report'}
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  )
}
