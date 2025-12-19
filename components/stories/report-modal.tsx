'use client'

import { useState } from 'react'
import { AlertTriangle, Flag } from 'lucide-react'
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

  const handleSubmit = async () => {
    if (isSubmitting) return

    setIsSubmitting(true)
    try {
      const response = await fetch(`/api/stories/${storyId}/report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reason,
          description: description.trim() || undefined
        })
      })

      const result = await response.json()

      if (result.success) {
        toast.success('Report submitted. Thank you for helping keep our community safe!')
        setIsOpen(false)
        // Reset form
        setReason('inappropriate')
        setDescription('')
      } else {
        toast.error(result.error || 'Failed to submit report')
      }
    } catch (error) {
      console.error('Error submitting report:', error)
      toast.error('Failed to submit report')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm" className="text-red-600 border-red-200 hover:bg-red-50">
            <Flag className="h-4 w-4 mr-2" />
            Report
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
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
            onClick={() => setIsOpen(false)}
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
      </DialogContent>
    </Dialog>
  )
}
