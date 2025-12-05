import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { getUserIdFromRequest } from '@/lib/auth/helpers'
import type { ApiResponse, User } from '@/types'
import { databaseUserToUser } from '@/types/database'

export async function POST(request: NextRequest) {
  try {
    // Get user ID from auth token or request body (for cases without session)
    let userId = await getUserIdFromRequest(request.headers)
    
    // Get user data from request body
    const body = await request.json()
    const { userId: bodyUserId, email, displayName, photoURL, subscriptionTier = 'trial' } = body
    
    // Use userId from body if no session (e.g., email confirmation required)
    if (!userId && bodyUserId) {
      userId = bodyUserId
    }
    
    if (!userId) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'Unauthorized - user ID required',
        },
        { status: 401 }
      )
    }

    // Check if user already exists
    const { data: existingUser } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()

    if (existingUser) {
      // User already exists, return it
      return NextResponse.json<ApiResponse<User>>({
        success: true,
        data: databaseUserToUser(existingUser),
      })
    }

    // Create user profile using admin client (bypasses RLS)
    const { data: newUser, error: insertError } = await supabaseAdmin
      .from('users')
      .insert({
        id: userId,
        email: email || '',
        display_name: displayName,
        photo_url: photoURL,
        subscription_tier: subscriptionTier,
      })
      .select()
      .single()

    if (insertError) {
      console.error('Error creating user profile:', insertError)
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: `Failed to create user profile: ${insertError.message}`,
        },
        { status: 500 }
      )
    }

    // Initialize trial usage
    const { error: usageError } = await supabaseAdmin
      .from('usage')
      .insert({
        user_id: userId,
        stories_generated: 0,
        trial_completed: false,
      })

    if (usageError && usageError.code !== '23505') {
      // Ignore duplicate key errors
      console.error('Error initializing trial usage:', usageError)
    }

    return NextResponse.json<ApiResponse<User>>({
      success: true,
      data: databaseUserToUser(newUser),
    })
  } catch (error: any) {
    console.error('Error in create-profile route:', error)
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: error.message || 'Failed to create user profile',
      },
      { status: 500 }
    )
  }
}

