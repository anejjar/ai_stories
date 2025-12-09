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
  const {
    user: storeUser,
    setUser: setStoreUser,
    clearUser,
    shouldRefresh,
    sessionChecked,
    setSessionChecked,
  } = useAuthStore()

  useEffect(() => {
    let mounted = true

    async function initializeAuth() {
      try {
        // If we have cached user and cache is fresh, use it immediately
        if (storeUser && !shouldRefresh() && sessionChecked) {
          console.log('✅ Using cached auth - no API call needed')
          setLoading(false)
          return
        }

        // Failsafe: Always set loading to false after 8 seconds
        const failsafeTimeout = setTimeout(() => {
          if (mounted) {
            console.warn('⚠️ Auth loading timeout - forcing loading to false')
            setLoading(false)
          }
        }, 8000)

        // Get session (lightweight check - uses cached session from Supabase)
        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (!mounted) {
          clearTimeout(failsafeTimeout)
          return
        }

        setSupabaseUser(session?.user ?? null)
        setSessionChecked(true)

        if (session?.user) {
          // Only fetch profile if cache is stale or doesn't exist
          if (shouldRefresh() || !storeUser) {
            console.log('🔄 Cache stale or missing - fetching fresh profile')
            await fetchUserProfile(session.user.id)
          } else {
            console.log('✅ Using cached profile - still fresh')
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

    initializeAuth()

    // Listen for auth state changes (login/logout)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return

      console.log('🔐 Auth state changed:', event)
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
  }, [storeUser, shouldRefresh, sessionChecked, setStoreUser, clearUser, setSessionChecked])

  async function fetchUserProfile(userId: string) {
    try {
      console.log('📥 Fetching user profile from database...')

      // Add timeout to prevent hanging
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Profile fetch timeout')), 5000) // 5 second timeout
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
  }
}

