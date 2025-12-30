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
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="space-y-6">
        {/* Name Input */}
        <div className="space-y-3">
          <Label htmlFor="child-name" className="text-sm font-black uppercase tracking-widest text-gray-400">
            Child's Name *
          </Label>
          <Input
            id="child-name"
            type="text"
            placeholder="e.g., Emma, Noah, Sophia..."
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={submitting || isLoading}
            className="h-14 rounded-2xl border-2 border-gray-100 focus:border-playwize-purple focus:ring-0 text-lg font-bold px-6"
            maxLength={50}
          />
          <p className="text-xs font-bold text-gray-400 italic">
            This will be used throughout the stories
          </p>
        </div>

        {/* Age Range Selection (Optional) */}
        <div className="space-y-3">
          <Label htmlFor="age-range" className="text-sm font-black uppercase tracking-widest text-gray-400">
            Age Range (Optional)
          </Label>
          <div className="grid grid-cols-3 gap-3">
            {['3-5', '6-8', '9-12'].map((range) => (
              <button
                key={range}
                type="button"
                onClick={() => setAgeRange(range)}
                disabled={submitting || isLoading}
                className={`
                  h-14 rounded-2xl border-2 font-black transition-all transform active:scale-95
                  ${
                    ageRange === range
                      ? 'border-playwize-purple bg-purple-50 text-playwize-purple shadow-sm'
                      : 'border-gray-100 bg-white text-gray-500 hover:border-gray-200'
                  }
                  disabled:opacity-50
                `}
              >
                {range}
              </button>
            ))}
          </div>
          <p className="text-xs font-bold text-gray-400 italic">
            Helps us tailor story complexity
          </p>
        </div>
      </div>

      <div className="bg-blue-50 border-2 border-white rounded-[2rem] p-6 shadow-sm">
        <p className="text-sm text-blue-600 font-bold text-center leading-relaxed">
          <span className="text-xl mr-1">💡</span>
          You can add more details (photos, appearance, etc.) later in your profile!
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col gap-3 pt-2">
        <Button
          type="submit"
          disabled={submitting || isLoading || !name.trim()}
          className="h-16 rounded-full bg-playwize-orange hover:bg-orange-600 text-white font-black text-xl shadow-xl shadow-orange-100 transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          {submitting ? (
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white" />
          ) : (
            <>
              <Sparkles className="w-6 h-6 mr-3" />
              CREATE PROFILE
            </>
          )}
        </Button>
        <button
          type="button"
          onClick={onSkip}
          disabled={submitting || isLoading}
          className="w-full text-gray-400 font-bold text-sm hover:text-gray-600 transition-colors py-2"
        >
          I'll add this later
        </button>
      </div>
    </form>
  )
}
