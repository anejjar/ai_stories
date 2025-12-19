'use client'

import { useState } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { MessageCircle, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import type { StoryComment } from '@/types/discovery'

interface CommentItemProps {
  comment: StoryComment
  storyId: string
  onReply?: (parentCommentId: string, content: string) => Promise<void>
  depth?: number
}

export function CommentItem({ comment, storyId, onReply, depth = 0 }: CommentItemProps) {
  const [isReplying, setIsReplying] = useState(false)
  const [replyContent, setReplyContent] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleReplySubmit = async () => {
    if (!replyContent.trim() || isSubmitting) return

    setIsSubmitting(true)
    try {
      await onReply?.(comment.id, replyContent.trim())
      setReplyContent('')
      setIsReplying(false)
    } catch (error) {
      console.error('Error submitting reply:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const timeAgo = formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })

  return (
    <div className={`${depth > 0 ? 'ml-8 mt-4' : 'mt-4'}`}>
      <div className="flex gap-3">
        {/* Avatar */}
        <div className="flex-shrink-0">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white font-bold">
            {comment.authorAvatar ? (
              <img
                src={comment.authorAvatar}
                alt={comment.authorName || 'User'}
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <User className="h-5 w-5" />
            )}
          </div>
        </div>

        {/* Comment Content */}
        <div className="flex-1 min-w-0">
          <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-gray-900 text-sm">
                {comment.authorName || 'Anonymous'}
              </span>
              <span className="text-xs text-gray-500">{timeAgo}</span>
            </div>
            <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">
              {comment.content}
            </p>
          </div>

          {/* Reply Button */}
          {depth < 2 && onReply && (
            <button
              onClick={() => setIsReplying(!isReplying)}
              className="mt-2 text-xs font-medium text-purple-600 hover:text-purple-700 flex items-center gap-1"
            >
              <MessageCircle className="h-3 w-3" />
              Reply
            </button>
          )}

          {/* Reply Form */}
          {isReplying && (
            <div className="mt-3 space-y-2">
              <Textarea
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder="Write a reply..."
                className="min-h-[80px] text-sm"
                maxLength={1000}
              />
              <div className="flex gap-2">
                <Button
                  onClick={handleReplySubmit}
                  disabled={!replyContent.trim() || isSubmitting}
                  size="sm"
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  {isSubmitting ? 'Posting...' : 'Post Reply'}
                </Button>
                <Button
                  onClick={() => {
                    setIsReplying(false)
                    setReplyContent('')
                  }}
                  variant="outline"
                  size="sm"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {/* Nested Replies */}
          {comment.replies && comment.replies.length > 0 && (
            <div className="mt-2">
              {comment.replies.map((reply) => (
                <CommentItem
                  key={reply.id}
                  comment={reply}
                  storyId={storyId}
                  onReply={onReply}
                  depth={depth + 1}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
