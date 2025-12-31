'use client'

import { useState } from 'react'
import { updatePassword } from '@/lib/auth/client-helpers'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from '@/components/ui/toaster'
import { Lock } from 'lucide-react'

export function ChangePassword() {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const validatePassword = (pwd: string): string | null => {
    if (pwd.length < 6) {
      return 'Password must be at least 6 characters'
    }
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    // Basic validation
    if (!newPassword || !confirmPassword) {
      toast.error('Validation error', 'Please fill in all fields')
      setLoading(false)
      return
    }

    const passwordError = validatePassword(newPassword)
    if (passwordError) {
      toast.error('Validation error', passwordError)
      setLoading(false)
      return
    }

    if (newPassword !== confirmPassword) {
      toast.error('Validation error', 'Passwords do not match')
      setLoading(false)
      return
    }

    const { error } = await updatePassword(newPassword)

    if (error) {
      toast.error('Failed to update password', error)
      setLoading(false)
      return
    }

    toast.success('Password updated!', 'Your password has been successfully changed.')

    // Clear form
    setCurrentPassword('')
    setNewPassword('')
    setConfirmPassword('')
    setLoading(false)
  }

  return (
    <div className="bg-white p-10 rounded-[3.5rem] border-4 border-gray-100 shadow-sm space-y-8">
      <div className="flex items-center gap-4">
        <div className="h-12 w-12 rounded-2xl bg-blue-50 flex items-center justify-center">
          <Lock className="h-6 w-6 text-blue-500" />
        </div>
        <h3 className="text-2xl font-black text-gray-900">Change Password</h3>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-3">
          <label htmlFor="newPassword" className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
            <span>🔒 New Password</span>
          </label>
          <Input
            id="newPassword"
            type="password"
            placeholder="At least 6 characters"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            disabled={loading}
            required
            className="rounded-2xl text-lg h-14 border-2 border-gray-100 focus:border-blue-500 bg-gray-50/50 font-bold transition-all"
          />
        </div>

        <div className="space-y-3">
          <label htmlFor="confirmPassword" className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
            <span>✅ Confirm Password</span>
          </label>
          <Input
            id="confirmPassword"
            type="password"
            placeholder="Repeat your password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            disabled={loading}
            required
            className="rounded-2xl text-lg h-14 border-2 border-gray-100 focus:border-blue-500 bg-gray-50/50 font-bold transition-all"
          />
        </div>

        <Button
          type="submit"
          className="w-full h-14 rounded-full bg-blue-500 hover:bg-blue-600 text-white font-black text-lg shadow-xl shadow-blue-100 transition-all hover:scale-[1.02] active:scale-95"
          disabled={loading}
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <span className="animate-spin text-2xl">⏳</span>
              UPDATING...
            </span>
          ) : (
            "UPDATE PASSWORD 🔐"
          )}
        </Button>
      </form>
    </div>
  )
}
