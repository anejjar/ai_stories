'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Sparkles } from 'lucide-react'
import { toast } from '@/components/ui/toaster'
import { useAuth } from '@/hooks/use-auth'

interface QuickProfileFormProps {
  onSuccess: () => void
  onSkip: () => void
  isLoading?: boolean
}

export function QuickProfileForm({ onSuccess, onSkip, isLoading }: QuickProfileFormProps) {
  const { getAccessToken } = useAuth()
  const [name, setName] = useState('')
  const [ageRange, setAgeRange] = useState<string>('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim()) {
      toast.error('Please enter your child\'s name')
      return
    }

    setSubmitting(true)
    try {
      const token = await getAccessToken()
      if (!token) {
        throw new Error('Authentication required')
      }

      // Calculate approximate birth date from age range
      let birthDate: string | undefined
      if (ageRange) {
        const currentYear = new Date().getFullYear()
        const age = parseInt(ageRange)
        if (!isNaN(age)) {
          birthDate = `${currentYear - age}-06-15` // Use mid-year as approximate
        }
      }

      const response = await fetch('/api/child-profiles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: name.trim(),
          birth_date: birthDate,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to create profile')
      }

      toast.success(`Profile created for ${name}!`)
      onSuccess()
    } catch (error) {
      console.error('Error creating profile:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to create profile')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        {/* Name Input */}
        <div className="space-y-2">
          <Label htmlFor="child-name" className="text-base font-semibold">
            Child's Name *
          </Label>
          <Input
            id="child-name"
            type="text"
            placeholder="e.g., Emma, Noah, Sophia..."
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={submitting || isLoading}
            className="text-lg"
            maxLength={50}
          />
          <p className="text-xs text-gray-500">
            This will be used throughout the stories
          </p>
        </div>

        {/* Age Range Selection (Optional) */}
        <div className="space-y-2">
          <Label htmlFor="age-range" className="text-base font-semibold">
            Age Range (Optional)
          </Label>
          <div className="grid grid-cols-3 gap-2">
            {['3-5', '6-8', '9-12'].map((range) => (
              <button
                key={range}
                type="button"
                onClick={() => setAgeRange(range)}
                disabled={submitting || isLoading}
                className={`
                  px-4 py-3 rounded-lg border-2 font-medium transition-all
                  ${
                    ageRange === range
                      ? 'border-purple-500 bg-purple-50 text-purple-700'
                      : 'border-gray-200 bg-white text-gray-700 hover:border-purple-300'
                  }
                  disabled:opacity-50
                `}
              >
                {range}
              </button>
            ))}
          </div>
          <p className="text-xs text-gray-500">
            Helps us tailor story complexity
          </p>
        </div>
      </div>

      <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-3">
        <p className="text-sm text-blue-700 text-center">
          <strong>Don't worry!</strong> You can add more details (photos, appearance, etc.) later in your profile settings
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col gap-2">
        <Button
          type="submit"
          disabled={submitting || isLoading || !name.trim()}
          className="w-full gradient-secondary text-white text-lg py-6"
        >
          {submitting ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
              Creating Profile...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5 mr-2" />
              Create Profile & Continue
            </>
          )}
        </Button>
        <Button
          type="button"
          onClick={onSkip}
          variant="ghost"
          disabled={submitting || isLoading}
          className="w-full text-gray-500"
        >
          I'll add this later
        </Button>
      </div>
    </form>
  )
}
