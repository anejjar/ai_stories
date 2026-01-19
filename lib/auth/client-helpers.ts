// Client-side authentication helper functions

import { supabase } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'
import { FEATURES } from '@/lib/config/features'

/**
 * Get the correct redirect URL for auth callbacks
 * Uses NEXT_PUBLIC_APP_URL if available, fallback to window.location.origin
 */
function getRedirectUrl(path: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || window.location.origin
  const url = `${baseUrl}${path}`
  console.log(`Auth redirect URL: ${url}`)
  return url
}

/**
 * Sign in with email and password
 */
export async function signInWithEmail(email: string, password: string) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) {
      return { user: null, error: getAuthErrorMessage(error) }
    }
    return { user: data.user, error: null }
  } catch (error: any) {
    return { user: null, error: getAuthErrorMessage(error) }
  }
}

/**
 * Sign up with email and password
 */
export async function signUpWithEmail(email: string, password: string) {
  try {
    console.log('Attempting sign up for:', email)

    const redirectUrl = getRedirectUrl('/auth/callback')

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
      },
    })

    if (error) {
      console.error('Supabase sign up error:', error)
      return { user: null, error: getAuthErrorMessage(error) }
    }

    console.log('Supabase sign up successful:', data.user?.id)
    console.log('Confirmation email should be sent to:', email)

    // Note: data.user might be null if email confirmation is required
    // In that case, data.session will also be null
    return { user: data.user, error: null }
  } catch (error: any) {
    console.error('Unexpected sign up error:', error)
    return { user: null, error: getAuthErrorMessage(error) }
  }
}

/**
 * Sign in with Google
 */
export async function signInWithGoogle() {
  try {
    const redirectUrl = getRedirectUrl('/auth/callback')

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUrl,
      },
    })
    if (error) {
      return { user: null, error: getAuthErrorMessage(error) }
    }
    // OAuth redirects, so we return null user here
    // The actual user will be available after redirect
    return { user: null, error: null }
  } catch (error: any) {
    return { user: null, error: getAuthErrorMessage(error) }
  }
}

/**
 * Sign out current user
 */
export async function signOutUser() {
  try {
    const { error } = await supabase.auth.signOut()
    if (error) {
      return { error: getAuthErrorMessage(error) }
    }
    return { error: null }
  } catch (error: any) {
    return { error: getAuthErrorMessage(error) }
  }
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(email: string) {
  try {
    const redirectUrl = getRedirectUrl('/auth/reset-password')

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectUrl,
    })
    if (error) {
      return { error: getAuthErrorMessage(error) }
    }
    return { error: null }
  } catch (error: any) {
    return { error: getAuthErrorMessage(error) }
  }
}

/**
 * Update user password
 */
export async function updatePassword(newPassword: string) {
  try {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    })
    if (error) {
      return { error: getAuthErrorMessage(error) }
    }
    return { error: null }
  } catch (error: any) {
    return { error: getAuthErrorMessage(error) }
  }
}

/**
 * Get user-friendly error message from Supabase Auth error
 */
function getAuthErrorMessage(error: any): string {
  if (!error) return 'An error occurred during authentication'

  const message = error.message || ''
  const status = error.status || ''

  // Handle Supabase-specific error codes
  if (message.includes('Invalid login credentials') || message.includes('Email not confirmed')) {
    return 'Invalid email or password'
  }
  if (message.includes('User already registered')) {
    return 'An account with this email already exists'
  }
  if (message.includes('Password should be at least')) {
    return 'Password is too weak. Please use at least 6 characters'
  }
  if (message.includes('Email rate limit exceeded')) {
    return 'Too many requests. Please try again later'
  }
  if (message.includes('Network request failed') || message.includes('NetworkError') || status === '0') {
    return 'Network error. Please check your internet connection and ensure your Supabase project URL is correct and reachable.'
  }
  if (message.includes('popup_closed_by_user')) {
    return 'Sign-in popup was closed'
  }

  return message || 'An error occurred during authentication'
}
