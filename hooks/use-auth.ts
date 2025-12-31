'use client'

// Client-side authentication hook with caching

import { useEffect, useState } from 'react'
import { User as SupabaseUser } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase/client'
import { useAuthStore } from '@/store/auth-store'
import type { User } from '@/types'
import { databaseUserToUser } from '@/types/database'

export function useAuth() {
  const [supabaseUser, setSupabaseUser] = useState<SupabaseUser | null>(null)
  const [loading, setLoading] = useState(true)
  const storeUser = useAuthStore((state) => state.user)
  const setStoreUser = useAuthStore((state) => state.setUser)
  const clearUser = useAuthStore((state) => state.clearUser)

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
            await fetchUserProfile(session.user.id)
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
        // Force fetch on sign in
        await fetchUserProfile(session.user.id)
      } else if (event === 'SIGNED_OUT') {
        clearUser()
        setLoading(false)
      }
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
    // Empty dependency array - run only once on mount
  }, [])

  async function fetchUserProfile(userId: string) {
    try {
      console.log('📥 Fetching user profile from database...')

      // Add timeout to prevent hanging
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Profile fetch timeout')), 15000) // 15 second timeout
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

      if (error || !data) {
        console.warn('⚠️ Error fetching user profile:', error)
        clearUser()
        setLoading(false)
        return
      }

      const userData = databaseUserToUser(data)
      setStoreUser(userData) // This automatically sets lastFetched timestamp
      console.log('✅ Profile fetched and cached')
    } catch (error) {
      console.error('❌ Error fetching user profile:', error)
      clearUser()
    } finally {
      setLoading(false)
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
      await fetchUserProfile(supabaseUser.id)
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

