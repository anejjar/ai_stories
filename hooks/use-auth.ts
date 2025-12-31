'use client'

// Client-side authentication hook with caching

import { useEffect, useState, useRef } from 'react'
import { User as SupabaseUser } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase/client'
import { useAuthStore } from '@/store/auth-store'
import { createUserProfile } from '@/lib/auth/user-service'
import type { User } from '@/types'
import { databaseUserToUser } from '@/types/database'

export function useAuth() {
  const [supabaseUser, setSupabaseUser] = useState<SupabaseUser | null>(null)
  const [loading, setLoading] = useState(true)
  const storeUser = useAuthStore((state) => state.user)
  const setStoreUser = useAuthStore((state) => state.setUser)
  const clearUser = useAuthStore((state) => state.clearUser)
  
  // Track in-flight requests to prevent duplicate fetches
  const fetchingRef = useRef<Set<string>>(new Set())
  // Debounce timer for auth events
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    let mounted = true
    let isInitialized = false

    async function initializeAuth() {
      // Prevent multiple initializations
      if (isInitialized) return
      isInitialized = true

      try {
        // Failsafe: Always set loading to false after 3 seconds
        const failsafeTimeout = setTimeout(() => {
          if (mounted) {
            console.warn('⚠️ Auth loading timeout - forcing loading to false')
            setLoading(false)
          }
        }, 3000)

        // Get session (lightweight check - uses cached session from Supabase)
        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (!mounted) {
          clearTimeout(failsafeTimeout)
          return
        }

        setSupabaseUser(session?.user ?? null)

        if (session?.user) {
          // Check if we have cached profile that's still fresh
          const cachedUser = useAuthStore.getState().user
          const cachedTime = useAuthStore.getState().lastFetched
          const needsRefresh = !cachedUser || !cachedTime || (Date.now() - cachedTime > 5 * 60 * 1000)

          if (needsRefresh) {
            console.log('🔄 Fetching fresh user profile')
            await fetchUserProfile(session.user.id, false)
          } else {
            console.log('✅ Using cached profile')
            setLoading(false)
          }
        } else {
          clearUser()
          setLoading(false)
        }

        clearTimeout(failsafeTimeout)
      } catch (error) {
        console.error('Error initializing auth:', error)
        if (mounted) {
          setLoading(false)
        }
      }
    }

    // Initialize auth on mount
    initializeAuth()

    // Listen for auth state changes (login/logout) - ONLY ONCE
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return

      // Only handle specific events, ignore INITIAL_SESSION
      if (event === 'INITIAL_SESSION') return

      console.log('🔐 Auth event:', event)
      setSupabaseUser(session?.user ?? null)

      if (event === 'SIGNED_IN' && session?.user) {
        // Debounce multiple SIGNED_IN events (can fire multiple times during redirects)
        if (debounceTimerRef.current) {
          clearTimeout(debounceTimerRef.current)
        }
        
        // Capture userId to avoid closure issues
        const userId = session.user.id
        debounceTimerRef.current = setTimeout(() => {
          if (mounted) {
            fetchUserProfile(userId, true)
          }
        }, 300) // 300ms debounce
      } else if (event === 'SIGNED_OUT') {
        clearUser()
        setLoading(false)
        // Clear any pending fetches
        fetchingRef.current.clear()
        if (debounceTimerRef.current) {
          clearTimeout(debounceTimerRef.current)
        }
      }
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
      fetchingRef.current.clear()
    }
    // Empty dependency array - run only once on mount
  }, [])

  async function fetchUserProfile(userId: string, isSignIn: boolean = false) {
    // Prevent duplicate simultaneous fetches for the same user
    if (fetchingRef.current.has(userId)) {
      console.log('⏸️ Profile fetch already in progress, skipping...')
      return
    }

    fetchingRef.current.add(userId)

    try {
      console.log('📥 Fetching user profile from database...')

      // Add timeout to prevent hanging (reduced to 10 seconds)
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Profile fetch timeout')), 10000) // 10 second timeout
      })

      const fetchPromise = supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()

      const { data, error } = await Promise.race([
        fetchPromise,
        timeoutPromise,
      ]) as any

      // If profile doesn't exist, try to create it
      if (error && (error.code === 'PGRST116' || error.message?.includes('No rows'))) {
        console.log('👤 User profile not found, creating profile...')
        
        try {
          const currentUser = supabaseUser || (await supabase.auth.getUser()).data.user
          if (currentUser) {
            const newProfile = await createUserProfile(currentUser, 'trial')
            setStoreUser(newProfile)
            console.log('✅ Profile created and cached')
            setLoading(false)
            return
          }
        } catch (createError) {
          console.error('❌ Error creating user profile:', createError)
          // Fall through to error handling
        }
      }

      if (error || !data) {
        console.warn('⚠️ Error fetching user profile:', error)
        // Don't clear user on error - might be temporary network issue
        // Only clear if it's a persistent error
        if (error?.code && !['PGRST116', 'PGRST301'].includes(error.code)) {
          clearUser()
        }
        setLoading(false)
        return
      }

      const userData = databaseUserToUser(data)
      setStoreUser(userData) // This automatically sets lastFetched timestamp
      console.log('✅ Profile fetched and cached')
    } catch (error: any) {
      console.error('❌ Error fetching user profile:', error)
      
      // If it's a timeout and we just signed in, try creating profile
      if (error.message === 'Profile fetch timeout' && isSignIn) {
        console.log('⏱️ Fetch timed out, attempting to create profile...')
        try {
          const { data: { user: currentUser } } = await supabase.auth.getUser()
          if (currentUser) {
            const newProfile = await createUserProfile(currentUser, 'trial')
            setStoreUser(newProfile)
            console.log('✅ Profile created after timeout')
            setLoading(false)
            return
          }
        } catch (createError) {
          console.error('❌ Error creating profile after timeout:', createError)
        }
      }
      
      // Don't clear user on timeout - might be temporary
      if (error.message !== 'Profile fetch timeout') {
        clearUser()
      }
    } finally {
      setLoading(false)
      fetchingRef.current.delete(userId)
    }
  }

  // Helper function to get access token
  const getAccessToken = async (): Promise<string | null> => {
    const { data: { session } } = await supabase.auth.getSession()
    return session?.access_token || null
  }

  // Refresh user profile (useful after subscription changes)
  const refreshProfile = async () => {
    if (supabaseUser) {
      await fetchUserProfile(supabaseUser.id, false)
    }
  }

  return {
    user: supabaseUser,
    loading,
    userProfile: storeUser,
    getAccessToken,
    refreshProfile,
    isEmailVerified: supabaseUser?.email_confirmed_at ? true : false,
  }
}

