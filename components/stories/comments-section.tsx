'use client'

import { useState, useEffect } from 'react'
import { MessageCircle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { CommentItem } from './comment-item'
import type { StoryComment } from '@/types/discovery'

interface CommentsSectionProps {
  storyId: string
  initialCommentsCount?: number
}

export function CommentsSection({ storyId, initialCommentsCount = 0 }: CommentsSectionProps) {
  const [comments, setComments] = useState<StoryComment[]>([])
  const [newComment, setNewComment] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [commentsCount, setCommentsCount] = useState(initialCommentsCount)

  // Fetch comments
  useEffect(() => {
    fetchComments()
  }, [storyId])

  const fetchComments = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/stories/${storyId}/comments`)
      const result = await response.json()

      if (result.success) {
        setComments(result.data)
        setCommentsCount(countAllComments(result.data))
      } else {
        toast.error('Failed to load comments')
      }
    } catch (error) {
      console.error('Error fetching comments:', error)
      toast.error('Failed to load comments')
    } finally {
      setIsLoading(false)
    }
  }

  // Count all comments including nested replies
  const countAllComments = (commentsList: StoryComment[]): number => {
    let count = 0
    const countRecursive = (items: StoryComment[]) => {
      items.forEach(item => {
        count++
        if (item.replies && item.replies.length > 0) {
          countRecursive(item.replies)
        }
      })
    }
    countRecursive(commentsList)
    return count
  }

  const handleSubmitComment = async () => {
    if (!newComment.trim() || isSubmitting) return

    setIsSubmitting(true)
    try {
      const response = await fetch(`/api/stories/${storyId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newComment.trim() })
      })

      const result = await response.json()

      if (result.success) {
        // Add new comment to the list
        setComments([...comments, result.data])
        setCommentsCount(commentsCount + 1)
        setNewComment('')
        toast.success('Comment posted!')
      } else {
        toast.error(result.error || 'Failed to post comment')
      }
    } catch (error) {
      console.error('Error posting comment:', error)
      toast.error('Failed to post comment')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleReply = async (parentCommentId: string, content: string) => {
    try {
      const response = await fetch(`/api/stories/${storyId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, parentCommentId })
      })

      const result = await response.json()

      if (result.success) {
        // Refresh comments to show the new reply
        await fetchComments()
        toast.success('Reply posted!')
      } else {
        toast.error(result.error || 'Failed to post reply')
      }
    } catch (error) {
      console.error('Error posting reply:', error)
      toast.error('Failed to post reply')
      throw error
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2">
        <MessageCircle className="h-5 w-5 text-purple-600" />
        <h3 className="text-lg font-bold text-gray-900">
          Comments {commentsCount > 0 && `(${commentsCount})`}
        </h3>
      </div>

      {/* New Comment Form */}
      <div className="space-y-3">
        <Textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Share your thoughts about this story..."
          className="min-h-[100px] resize-none"
          maxLength={1000}
        />
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500">
            {newComment.length}/1000 characters
          </span>
          <Button
            onClick={handleSubmitComment}
            disabled={!newComment.trim() || isSubmitting}
            className="bg-purple-600 hover:bg-purple-700"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Posting...
              </>
            ) : (
              'Post Comment'
            )}
          </Button>
        </div>
      </div>

      {/* Comments List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <MessageCircle className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p className="text-sm">No comments yet. Be the first to share your thoughts!</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {comments.map((comment) => (
              <CommentItem
                key={comment.id}
                comment={comment}
                storyId={storyId}
                onReply={handleReply}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
