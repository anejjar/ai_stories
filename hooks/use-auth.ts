'use client'

// Client-side authentication hook

import { useEffect, useState } from 'react'
import { User as SupabaseUser } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase/client'
import { useAuthStore } from '@/store/auth-store'
import type { User } from '@/types'
import { databaseUserToUser } from '@/types/database'

export function useAuth() {
  const [supabaseUser, setSupabaseUser] = useState<SupabaseUser | null>(null)
  const [loading, setLoading] = useState(true)
  const { user: storeUser, setUser: setStoreUser } = useAuthStore()

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSupabaseUser(session?.user ?? null)
      if (session?.user) {
        fetchUserProfile(session.user.id)
      } else {
        setStoreUser(null)
        setLoading(false)
      }
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSupabaseUser(session?.user ?? null)
      
      if (session?.user) {
        await fetchUserProfile(session.user.id)
      } else {
        setStoreUser(null)
        setLoading(false)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [setStoreUser])

  async function fetchUserProfile(userId: string) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()

      if (error || !data) {
        setStoreUser(null)
        setLoading(false)
        return
      }

      const userData = databaseUserToUser(data)
      setStoreUser(userData)
    } catch (error) {
      console.error('Error fetching user profile:', error)
      setStoreUser(null)
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

