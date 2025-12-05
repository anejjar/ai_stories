// Zustand auth store

import { create } from 'zustand'
import type { User } from '@/types'

interface AuthState {
  user: User | null
  setUser: (user: User | null) => void
  clearUser: () => void
  updateUser: (updates: Partial<User>) => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  clearUser: () => set({ user: null }),
  updateUser: (updates) =>
    set((state) => ({
      user: state.user ? { ...state.user, ...updates } : null,
    })),
}))

