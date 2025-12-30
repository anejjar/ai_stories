'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/use-auth'
import { toast } from '@/components/ui/toaster'
import { Sparkles, Loader2 } from 'lucide-react'

export function SeedButton() {
  const { getAccessToken } = useAuth()
  const [loading, setLoading] = useState(false)

  const handleSeed = async () => {
    setLoading(true)
    try {
      const token = await getAccessToken()
      if (!token) {
        toast.error('Authentication required', 'Please log in to seed test data')
        return
      }

      const response = await fetch('/api/seed', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const result = await response.json()

      if (result.success) {
        toast.success(
          'Test data created! 🎉',
          `Successfully created ${result.data?.count || 0} sample stories!`
        )
        // Refresh the page to show new stories
        setTimeout(() => {
          window.location.reload()
        }, 1500)
      } else {
        throw new Error(result.error || 'Failed to seed data')
      }
    } catch (error) {
      console.error('Error seeding data:', error)
      toast.error(
        'Failed to create test data',
        error instanceof Error ? error.message : 'Please try again'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      onClick={handleSeed}
      disabled={loading}
      variant="outline"
      className="rounded-full border-2 border-gray-300 hover:bg-gray-50 font-bold"
    >
      {loading ? (
        <>
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          Creating...
        </>
      ) : (
        <>
          <Sparkles className="h-4 w-4 mr-2" />
          Add Test Stories 🧪
        </>
      )}
    </Button>
  )
}

