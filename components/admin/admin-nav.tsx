'use client'

import Link from 'next/link'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Shield, LogOut } from 'lucide-react'
import { signOutUser } from '@/lib/auth/client-helpers'

export function AdminNav() {
  const { user } = useAuth()

  const handleLogout = async () => {
    await signOutUser()
    window.location.href = '/'
  }

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-4">
            <Shield className="h-6 w-6 text-gray-900" />
            <span className="font-bold text-lg text-gray-900">Admin Panel</span>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">{user?.email}</span>
            <Link href="/dashboard">
              <Button variant="outline" size="sm" className="border-gray-300 hover:bg-gray-50">
                Back to Dashboard
              </Button>
            </Link>
            <Button variant="ghost" size="sm" onClick={handleLogout} className="hover:bg-gray-50">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </nav>
  )
}
