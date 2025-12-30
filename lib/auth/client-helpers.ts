// Client-side authentication helper functions

import { supabase } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'

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
    console.log('🚀 Attempting sign up for:', email)
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })
    
    if (error) {
      console.error('❌ Supabase sign up error:', error)
      return { user: null, error: getAuthErrorMessage(error) }
    }
    
    console.log('✅ Supabase sign up successful:', data.user?.id)
    // Note: data.user might be null if email confirmation is required
    // In that case, data.session will also be null
    return { user: data.user, error: null }
  } catch (error: any) {
    console.error('💥 Unexpected sign up error:', error)
    return { user: null, error: getAuthErrorMessage(error) }
  }
}

/**
 * Sign in with Google
 */
export async function signInWithGoogle() {
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
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

