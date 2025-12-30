'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { SubscriptionManager } from '@/components/admin/users/subscription-manager'
import { StatusBadge } from '@/components/admin/shared/status-badge'
import { ArrowLeft, User, Trash2 } from 'lucide-react'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import type { AdminUserDetail } from '@/types/admin'

export default function UserDetailPage() {
  const params = useParams()
  const router = useRouter()
  const userId = params.id as string

  const [user, setUser] = useState<AdminUserDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [adminNotes, setAdminNotes] = useState('')
  const [savingNotes, setSavingNotes] = useState(false)

  useEffect(() => {
    fetchUser()
  }, [userId])

  async function fetchUser() {
    try {
      const res = await fetch(`/api/admin/users/${userId}`)
      const data = await res.json()

      if (data.success) {
        setUser(data.data)
        setAdminNotes(data.data.adminNotes || '')
      } else {
        toast.error('Failed to load user details')
      }
    } catch (error) {
      console.error('Error fetching user:', error)
      toast.error('Failed to load user details')
    } finally {
      setLoading(false)
    }
  }

  async function saveAdminNotes() {
    try {
      setSavingNotes(true)
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminNotes }),
      })

      const data = await res.json()

      if (data.success) {
        toast.success('Admin notes saved')
      } else {
        toast.error(data.error || 'Failed to save notes')
      }
    } catch (error) {
      console.error('Error saving notes:', error)
      toast.error('Failed to save notes')
    } finally {
      setSavingNotes(false)
    }
  }

  async function deleteUser() {
    if (!confirm(`Are you sure you want to delete this user? This action cannot be undone.`)) {
      return
    }

    if (!confirm(`Really delete ${user?.email}? All their stories and data will be deleted.`)) {
      return
    }

    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
      })

      const data = await res.json()

      if (data.success) {
        toast.success('User deleted')
        router.push('/admin/users')
      } else {
        toast.error(data.error || 'Failed to delete user')
      }
    } catch (error) {
      console.error('Error deleting user:', error)
      toast.error('Failed to delete user')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-400"></div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">User not found</p>
        <Button onClick={() => router.push('/admin/users')} className="mt-4">
          Back to Users
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => router.push('/admin/users')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Users
        </Button>
        <Button variant="outline" onClick={deleteUser} className="border-red-300 text-red-700 hover:bg-red-50">
          <Trash2 className="h-4 w-4 mr-2" />
          Delete User
        </Button>
      </div>

      {/* User Profile Header */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <div className="flex items-center gap-4">
          {user.photoURL ? (
            <img
              src={user.photoURL}
              alt={user.displayName || user.email}
              className="h-20 w-20 rounded-full object-cover"
            />
          ) : (
            <div className="h-20 w-20 rounded-full bg-gray-200 flex items-center justify-center">
              <User className="h-10 w-10 text-gray-500" />
            </div>
          )}
          <div>
            <h1 className="text-2xl font-bold">{user.displayName || 'No name'}</h1>
            <p className="text-gray-600">{user.email}</p>
            <div className="flex items-center gap-2 mt-2">
              <StatusBadge status={user.subscriptionTier} type="subscription" />
              {user.role === 'superadmin' && (
                <span className="px-2 py-1 bg-red-100 text-red-800 border border-red-300 text-xs font-semibold rounded">
                  SUPERADMIN
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Subscription Manager */}
        <SubscriptionManager
          userId={userId}
          currentTier={user.subscriptionTier}
          onUpdate={fetchUser}
        />

        {/* User Statistics */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h2 className="text-lg font-semibold mb-4">Statistics</h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Total Stories:</span>
              <span className="font-semibold">{user.totalStories}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Current Streak:</span>
              <span className="font-semibold">{user.readingStreak.current} days</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Longest Streak:</span>
              <span className="font-semibold">{user.readingStreak.longest} days</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Total Points:</span>
              <span className="font-semibold">{user.totalPoints}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Reader Level:</span>
              <span className="font-semibold capitalize">{user.readerLevel}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Child Profiles:</span>
              <span className="font-semibold">{user.childProfilesCount}</span>
            </div>
          </div>
        </div>

        {/* Account Info */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h2 className="text-lg font-semibold mb-4">Account Information</h2>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-600">User ID:</p>
              <p className="text-sm font-mono">{user.id}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Created:</p>
              <p className="text-sm">{new Date(user.createdAt).toLocaleString()}</p>
            </div>
            {user.stripeCustomerId && (
              <div>
                <p className="text-sm text-gray-600">Stripe Customer ID:</p>
                <p className="text-sm font-mono">{user.stripeCustomerId}</p>
              </div>
            )}
          </div>
        </div>

        {/* Admin Notes */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h2 className="text-lg font-semibold mb-4">Admin Notes</h2>
          <Textarea
            value={adminNotes}
            onChange={(e) => setAdminNotes(e.target.value)}
            placeholder="Add private notes about this user..."
            rows={5}
            className="mb-3"
          />
          <Button onClick={saveAdminNotes} disabled={savingNotes} size="sm">
            {savingNotes ? 'Saving...' : 'Save Notes'}
          </Button>
        </div>
      </div>

      {/* Recent Stories */}
      {user.recentStories.length > 0 && (
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h2 className="text-lg font-semibold mb-4">Recent Stories</h2>
          <div className="space-y-3">
            {user.recentStories.map((story) => (
              <div key={story.id} className="flex items-center justify-between border-b pb-3">
                <div>
                  <p className="font-medium">{story.title}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(story.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={story.visibility} type="visibility" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
