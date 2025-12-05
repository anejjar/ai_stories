'use client'

// Hook to get user profile from store (synced by useAuth)

import { useAuthStore } from '@/store/auth-store'

export function useUser() {
  const { user } = useAuthStore()
  return { user, loading: false }
}

