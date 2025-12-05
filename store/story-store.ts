// Zustand story store

import { create } from 'zustand'
import type { Story } from '@/types'

interface StoryState {
  stories: Story[]
  currentStory: Story | null
  setStories: (stories: Story[]) => void
  addStory: (story: Story) => void
  setCurrentStory: (story: Story | null) => void
  updateStory: (id: string, updates: Partial<Story>) => void
}

export const useStoryStore = create<StoryState>((set) => ({
  stories: [],
  currentStory: null,
  setStories: (stories) => set({ stories }),
  addStory: (story) => set((state) => ({ stories: [...state.stories, story] })),
  setCurrentStory: (story) => set({ currentStory: story }),
  updateStory: (id, updates) =>
    set((state) => ({
      stories: state.stories.map((s) => (s.id === id ? { ...s, ...updates } : s)),
      currentStory:
        state.currentStory?.id === id
          ? { ...state.currentStory, ...updates }
          : state.currentStory,
    })),
}))

