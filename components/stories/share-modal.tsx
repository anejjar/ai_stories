'use client'

import { useState } from 'react'
import { Share2, Copy, Check, Facebook, Twitter, Mail, Link as LinkIcon } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'

interface ShareModalProps {
  storyId: string
  storyTitle: string
  trigger?: React.ReactNode
}

export function ShareModal({ storyId, storyTitle, trigger }: ShareModalProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  // Generate share URL (using current domain)
  const shareUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/story/${storyId}`
    : ''

  const encodedUrl = encodeURIComponent(shareUrl)
  const encodedTitle = encodeURIComponent(storyTitle)

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      toast.success('Link copied to clipboard!')
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Error copying to clipboard:', error)
      toast.error('Failed to copy link')
    }
  }

  const shareOptions = [
    {
      name: 'Facebook',
      icon: Facebook,
      color: 'bg-blue-600 hover:bg-blue-700',
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`
    },
    {
      name: 'Twitter',
      icon: Twitter,
      color: 'bg-sky-500 hover:bg-sky-600',
      url: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`
    },
    {
      name: 'Email',
      icon: Mail,
      color: 'bg-gray-600 hover:bg-gray-700',
      url: `mailto:?subject=${encodedTitle}&body=Check out this story: ${encodedUrl}`
    }
  ]

  const handleShare = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer,width=600,height=600')
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5 text-purple-600" />
            Share Story
          </DialogTitle>
          <DialogDescription>
            Share this wonderful story with friends and family!
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Copy Link */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">
              Copy Link
            </label>
            <div className="flex gap-2">
              <Input
                value={shareUrl}
                readOnly
                className="flex-1 font-mono text-sm"
              />
              <Button
                onClick={handleCopyLink}
                variant="outline"
                className="flex-shrink-0"
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4 mr-2 text-green-600" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 mr-2" />
                    Copy
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Social Share Buttons */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">
              Share via Social Media
            </label>
            <div className="grid grid-cols-3 gap-3">
              {shareOptions.map((option) => {
                const Icon = option.icon
                return (
                  <button
                    key={option.name}
                    onClick={() => handleShare(option.url)}
                    className={`
                      ${option.color}
                      text-white rounded-lg p-4 flex flex-col items-center gap-2
                      transition-all duration-200 transform hover:scale-105
                    `}
                  >
                    <Icon className="h-6 w-6" />
                    <span className="text-xs font-semibold">{option.name}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Note */}
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
            <div className="flex gap-2">
              <LinkIcon className="h-4 w-4 text-purple-600 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-purple-900">
                Only public stories can be shared. Recipients can view the story without logging in.
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
