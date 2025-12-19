import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import type { ApiResponse } from '@/types'
import type { StoryComment } from '@/types/discovery'

interface CommentsParams {
  params: Promise<{
    id: string
  }>
}

/**
 * GET /api/stories/[id]/comments
 *
 * Fetch all comments for a story (with nested replies)
 */
export async function GET(
  request: NextRequest,
  { params }: CommentsParams
) {
  try {
    const supabase = await createServerSupabaseClient()

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { id: storyId } = await params

    // Verify story exists and is accessible
    const { data: story, error: storyError } = await supabase
      .from('stories')
      .select('id, visibility, user_id')
      .eq('id', storyId)
      .single()

    if (storyError || !story) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Story not found' },
        { status: 404 }
      )
    }

    // Check if user can view comments (public story or owns the story)
    if (story.visibility !== 'public' && story.user_id !== user.id) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'You do not have permission to view these comments' },
        { status: 403 }
      )
    }

    // Fetch all comments for the story (top-level and replies)
    const { data: commentsData, error: commentsError } = await supabase
      .from('story_comments')
      .select('*')
      .eq('story_id', storyId)
      .order('created_at', { ascending: true })

    if (commentsError) {
      console.error('Error fetching comments:', commentsError)
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Failed to fetch comments' },
        { status: 500 }
      )
    }

    // Fetch user info for all commenters
    const userIds = [...new Set(commentsData.map(c => c.user_id))]
    const { data: users } = await supabaseAdmin
      .from('users')
      .select('id, email, display_name, avatar_url')
      .in('id', userIds)

    const usersMap = new Map(
      users?.map(u => [
        u.id,
        {
          name: u.display_name || u.email?.split('@')[0] || 'Anonymous',
          avatar: u.avatar_url
        }
      ]) || []
    )

    // Build comments tree structure
    const commentsMap = new Map<string, StoryComment>()
    const topLevelComments: StoryComment[] = []

    // First pass: Create all comment objects
    commentsData.forEach(comment => {
      const userInfo = usersMap.get(comment.user_id)
      const commentObj: StoryComment = {
        id: comment.id,
        storyId: comment.story_id,
        userId: comment.user_id,
        content: comment.content,
        parentCommentId: comment.parent_comment_id || undefined,
        createdAt: new Date(comment.created_at),
        updatedAt: new Date(comment.updated_at),
        authorName: userInfo?.name || 'Anonymous',
        authorAvatar: userInfo?.avatar,
        replies: []
      }
      commentsMap.set(comment.id, commentObj)

      // Add to top level if no parent
      if (!comment.parent_comment_id) {
        topLevelComments.push(commentObj)
      }
    })

    // Second pass: Nest replies
    commentsData.forEach(comment => {
      if (comment.parent_comment_id) {
        const parent = commentsMap.get(comment.parent_comment_id)
        const child = commentsMap.get(comment.id)
        if (parent && child) {
          parent.replies!.push(child)
        }
      }
    })

    return NextResponse.json<ApiResponse<StoryComment[]>>(
      {
        success: true,
        data: topLevelComments
      },
      { status: 200 }
    )

  } catch (error) {
    console.error('Get comments API error:', error)
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/stories/[id]/comments
 *
 * Add a new comment to a public story
 */
export async function POST(
  request: NextRequest,
  { params }: CommentsParams
) {
  try {
    const supabase = await createServerSupabaseClient()

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { id: storyId } = await params

    // Parse request body
    const body = await request.json()
    const { content, parentCommentId } = body as {
      content: string
      parentCommentId?: string
    }

    // Validate content
    if (!content || content.trim().length === 0) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Comment content is required' },
        { status: 400 }
      )
    }

    if (content.length > 1000) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Comment is too long (max 1000 characters)' },
        { status: 400 }
      )
    }

    // Verify story exists and is public
    const { data: story, error: storyError } = await supabase
      .from('stories')
      .select('id, visibility')
      .eq('id', storyId)
      .single()

    if (storyError || !story) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Story not found' },
        { status: 404 }
      )
    }

    if (story.visibility !== 'public') {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Can only comment on public stories' },
        { status: 400 }
      )
    }

    // If replying, verify parent comment exists
    if (parentCommentId) {
      const { data: parentComment } = await supabase
        .from('story_comments')
        .select('id, story_id')
        .eq('id', parentCommentId)
        .single()

      if (!parentComment || parentComment.story_id !== storyId) {
        return NextResponse.json<ApiResponse>(
          { success: false, error: 'Parent comment not found' },
          { status: 404 }
        )
      }
    }

    // Insert comment
    const { data: newComment, error: insertError } = await supabase
      .from('story_comments')
      .insert({
        story_id: storyId,
        user_id: user.id,
        content: content.trim(),
        parent_comment_id: parentCommentId || null
      })
      .select()
      .single()

    if (insertError) {
      console.error('Error creating comment:', insertError)
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Failed to create comment' },
        { status: 500 }
      )
    }

    // Fetch user info for the comment author
    const { data: userData } = await supabaseAdmin
      .from('users')
      .select('email, display_name, avatar_url')
      .eq('id', user.id)
      .single()

    const comment: StoryComment = {
      id: newComment.id,
      storyId: newComment.story_id,
      userId: newComment.user_id,
      content: newComment.content,
      parentCommentId: newComment.parent_comment_id || undefined,
      createdAt: new Date(newComment.created_at),
      updatedAt: new Date(newComment.updated_at),
      authorName: userData?.display_name || userData?.email?.split('@')[0] || 'Anonymous',
      authorAvatar: userData?.avatar_url,
      replies: []
    }

    console.log(`💬 New comment added to story ${storyId} by user ${user.id}`)

    return NextResponse.json<ApiResponse<StoryComment>>(
      {
        success: true,
        data: comment,
        message: 'Comment added successfully'
      },
      { status: 201 }
    )

  } catch (error) {
    console.error('Create comment API error:', error)
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
