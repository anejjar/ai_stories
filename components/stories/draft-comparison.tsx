'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Check, Sparkles, Loader2, Star } from 'lucide-react'
import type { Story } from '@/types'
import { useAuth } from '@/hooks/use-auth'
import { toast } from '@/components/ui/toaster'

interface DraftComparisonProps {
  drafts: Story[]
  parentStoryId?: string
  onDraftSelected?: (story: Story) => void
}

export function DraftComparison({ drafts, parentStoryId, onDraftSelected }: DraftComparisonProps) {
  const router = useRouter()
  const { getAccessToken } = useAuth()
  const [selectedDraftId, setSelectedDraftId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSelectDraft = async (draft: Story) => {
    if (loading) return

    setLoading(true)
    setSelectedDraftId(draft.id)

    try {
      const token = await getAccessToken()
      if (!token) {
        throw new Error('Failed to get access token')
      }

      // Mark this draft as selected
      const response = await fetch(`/api/stories/${draft.id}/select-draft`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to select draft')
      }

      toast.success('Draft selected! 🎉', 'Your favorite story version has been saved.')
      
      // Callback or navigate
      if (onDraftSelected) {
        onDraftSelected(result.data)
      } else {
        // Navigate to the selected story
        router.push(`/story/${draft.id}`)
      }
    } catch (error) {
      console.error('Error selecting draft:', error)
      toast.error(
        'Oops! Something went wrong',
        error instanceof Error ? error.message : 'Failed to select draft. Please try again.'
      )
      setSelectedDraftId(null)
    } finally {
      setLoading(false)
    }
  }

  if (drafts.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 text-lg font-semibold">No drafts available</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent mb-2">
          Choose Your Favorite Story! ✨
        </h2>
        <p className="text-gray-600 font-semibold">
          We've created {drafts.length} different versions. Pick the one you love most! 💖
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {drafts.map((draft, index) => {
          const isSelected = selectedDraftId === draft.id
          const preview = draft.content.substring(0, 200) + (draft.content.length > 200 ? '...' : '')

          return (
            <Card
              key={draft.id}
              className={`relative border-4 transition-all transform hover:scale-105 ${
                isSelected
                  ? 'border-yellow-400 bg-gradient-to-br from-yellow-50 to-orange-50 shadow-2xl'
                  : 'border-pink-300 hover:border-pink-400 shadow-lg'
              }`}
            >
              {isSelected && (
                <div className="absolute top-2 right-2 z-10">
                  <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-bold px-3 py-1 rounded-full border-2 border-white shadow-xl">
                    <Star className="h-3 w-3 mr-1 inline" />
                    SELECTED
                  </Badge>
                </div>
              )}

              <CardHeader className="bg-gradient-to-r from-pink-100 via-purple-100 to-blue-100 rounded-t-lg border-b-2 border-pink-200">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                    Draft {draft.draftNumber || index + 1}
                  </CardTitle>
                  <Badge className="bg-gradient-to-r from-blue-400 to-purple-500 text-white font-bold px-2 py-1 rounded-full">
                    Version {draft.draftNumber || index + 1}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600 font-semibold mt-1">{draft.title}</p>
              </CardHeader>

              <CardContent className="pt-4">
                <div className="space-y-4">
                  <div className="bg-white/80 backdrop-blur-sm p-4 rounded-xl border-2 border-pink-200 min-h-[200px]">
                    <p className="text-sm text-gray-700 leading-relaxed font-medium">
                      {preview}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Sparkles className="h-3 w-3" />
                    <span className="font-semibold">
                      {draft.content.split(' ').length} words
                    </span>
                    <span>•</span>
                    <span className="font-semibold">Theme: {draft.theme}</span>
                  </div>

                  <Button
                    onClick={() => handleSelectDraft(draft)}
                    disabled={loading || isSelected}
                    className={`w-full rounded-full font-bold text-lg py-3 transition-all ${
                      isSelected
                        ? 'bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600'
                        : 'bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600'
                    }`}
                  >
                    {loading && selectedDraftId === draft.id ? (
                      <>
                        <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                        Selecting...
                      </>
                    ) : isSelected ? (
                      <>
                        <Check className="h-5 w-5 mr-2" />
                        Selected! ✨
                      </>
                    ) : (
                      <>
                        <Star className="h-5 w-5 mr-2" />
                        Choose This One! ⭐
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="text-center pt-4">
        <p className="text-sm text-gray-500 font-semibold">
          💡 Tip: You can always generate more drafts or enhance your selected story later!
        </p>
      </div>
    </div>
  )
}

