'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { DialogTitle } from '@/components/ui/dialog'
import { Share2, Copy, Check, Mail, Facebook, Twitter, Link as LinkIcon } from 'lucide-react'
import { toast } from '@/components/ui/toaster'

interface ShareDialogProps {
  storyId: string
  storyTitle: string
  onClose?: () => void
}

export function ShareDialog({ storyId, storyTitle, onClose }: ShareDialogProps) {
  const [copied, setCopied] = useState(false)
  const storyUrl = typeof window !== 'undefined' ? `${window.location.origin}/story/${storyId}` : ''

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(storyUrl)
      setCopied(true)
      toast.success('Link copied! 📋', 'Share your story with friends!')
      setTimeout(() => {
        setCopied(false)
        onClose?.()
      }, 1500)
    } catch (error) {
      console.error('Failed to copy link:', error)
      toast.error('Failed to copy', 'Please try again')
    }
  }

  const handleEmailShare = () => {
    const subject = encodeURIComponent(`Check out this story: ${storyTitle}`)
    const body = encodeURIComponent(`I wanted to share this personalized story with you!\n\n${storyUrl}`)
    window.location.href = `mailto:?subject=${subject}&body=${body}`
    onClose?.()
  }

  const handleFacebookShare = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(storyUrl)}`
    window.open(url, '_blank', 'width=600,height=400')
    onClose?.()
  }

  const handleTwitterShare = () => {
    const text = encodeURIComponent(`Check out this personalized story: ${storyTitle}`)
    const url = `https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(storyUrl)}`
    window.open(url, '_blank', 'width=600,height=400')
    onClose?.()
  }

  return (
    <div className="p-6 rounded-3xl border-4 border-purple-300 bg-gradient-to-br from-purple-50 to-pink-50 shadow-xl">
      <div className="space-y-4">
        <div className="text-center">
          <DialogTitle className="text-2xl font-bold font-comic bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
            Share Story 📤
          </DialogTitle>
          <p className="text-sm text-gray-600 font-semibold">
            Share this magical story with friends and family! ✨
          </p>
        </div>

        <div className="space-y-3">
          {/* Copy Link Button */}
          <Button
            onClick={handleCopyLink}
            className="w-full rounded-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all font-bold text-lg py-6"
          >
            {copied ? (
              <>
                <Check className="h-5 w-5 mr-2" />
                Copied! ✅
              </>
            ) : (
              <>
                <Copy className="h-5 w-5 mr-2" />
                Copy Link 📋
              </>
            )}
          </Button>

          {/* Social Share Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <Button
              onClick={handleEmailShare}
              variant="outline"
              className="rounded-full border-2 border-blue-400 hover:bg-blue-100 text-blue-700 font-bold py-4"
            >
              <Mail className="h-4 w-4 mr-2" />
              Email 📧
            </Button>

            <Button
              onClick={handleFacebookShare}
              variant="outline"
              className="rounded-full border-2 border-blue-500 hover:bg-blue-100 text-blue-700 font-bold py-4"
            >
              <Facebook className="h-4 w-4 mr-2" />
              Facebook
            </Button>

            <Button
              onClick={handleTwitterShare}
              variant="outline"
              className="rounded-full border-2 border-sky-400 hover:bg-sky-100 text-sky-700 font-bold py-4"
            >
              <Twitter className="h-4 w-4 mr-2" />
              Twitter
            </Button>

            <Button
              onClick={handleCopyLink}
              variant="outline"
              className="rounded-full border-2 border-purple-400 hover:bg-purple-100 text-purple-700 font-bold py-4"
            >
              <LinkIcon className="h-4 w-4 mr-2" />
              Link 🔗
            </Button>
          </div>
        </div>

        {/* Story URL Display */}
        <div className="p-3 bg-white/80 rounded-xl border-2 border-purple-200">
          <p className="text-xs text-gray-500 font-semibold mb-1">Story URL:</p>
          <p className="text-sm text-gray-700 font-mono break-all">{storyUrl}</p>
        </div>
      </div>
    </div>
  )
}

