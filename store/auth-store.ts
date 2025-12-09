// Zustand auth store with caching

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User } from '@/types'

interface AuthState {
  user: User | null
  lastFetched: number | null // Timestamp of last profile fetch
  sessionChecked: boolean // Whether we've checked session this app load
  setUser: (user: User | null) => void
  clearUser: () => void
  updateUser: (updates: Partial<User>) => void
  setLastFetched: (timestamp: number) => void
  setSessionChecked: (checked: boolean) => void
  shouldRefresh: () => boolean
}

const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes in milliseconds

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      lastFetched: null,
      sessionChecked: false,

      setUser: (user) => set({ user, lastFetched: Date.now() }),

      clearUser: () => set({ user: null, lastFetched: null, sessionChecked: false }),

      updateUser: (updates) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...updates } : null,
          lastFetched: Date.now(),
        })),

      setLastFetched: (timestamp) => set({ lastFetched: timestamp }),

      setSessionChecked: (checked) => set({ sessionChecked: checked }),

      // Check if cache is stale and needs refresh
      shouldRefresh: () => {
        const state = get()
        if (!state.lastFetched) return true
        const now = Date.now()
        const timeSinceLastFetch = now - state.lastFetched
        return timeSinceLastFetch > CACHE_DURATION
      },
    }),
    {
      name: 'auth-storage', // localStorage key
      partialize: (state) => ({
        user: state.user,
        lastFetched: state.lastFetched,
        // Don't persist sessionChecked - reset on page load
      }),
    }
  )
)

