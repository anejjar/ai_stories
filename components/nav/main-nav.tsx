'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/use-auth'
import { signOutUser } from '@/lib/auth/client-helpers'
import { Button } from '@/components/ui/button'
import {
  BookOpen,
  Plus,
  User,
  LogOut,
  Menu,
  X,
  Library,
} from 'lucide-react'

export function MainNav() {
  const router = useRouter()
  const { user, userProfile } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  const handleLogout = async () => {
    await signOutUser()
    router.push('/login')
  }

  const navLinks = [
    { href: '/library', label: 'Library', icon: Library },
    { href: '/create', label: 'Create', icon: Plus },
    { href: '/profile', label: 'Profile', icon: User },
  ]

  return (
    <nav className="border-b-4 border-pink-300 bg-gradient-to-r from-pink-50 via-yellow-50 to-blue-50 sticky top-0 z-50 shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/library" className="flex items-center gap-2 group">
            <div className="relative">
              <div className="h-12 w-12 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <BookOpen className="h-6 w-6 text-white" />
              </div>
              <span className="absolute -top-1 -right-1 text-lg animate-sparkle">✨</span>
            </div>
            <span className="font-bold text-2xl font-comic bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
              AI Stories
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-3">
            {navLinks.map((link) => {
              const Icon = link.icon
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold hover:bg-pink-200 hover:shadow-md transition-all transform hover:scale-105 border-2 border-transparent hover:border-pink-300"
                >
                  <Icon className="h-5 w-5 text-purple-600" />
                  <span className="text-gray-700">{link.label}</span>
                </Link>
              )
            })}

            {/* User Menu */}
            {user && (
              <div className="relative">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2"
                >
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt={user.displayName || 'User'}
                      className="h-6 w-6 rounded-full"
                    />
                  ) : (
                    <User className="h-4 w-4" />
                  )}
                  <span className="hidden lg:inline">
                    {user.displayName || user.email?.split('@')[0]}
                  </span>
                </Button>

                {userMenuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setUserMenuOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border-2 border-pink-200 z-20 overflow-hidden">
                      <div className="py-2">
                        <Link
                          href="/profile"
                          className="block px-4 py-3 text-sm font-semibold hover:bg-pink-100 transition-colors text-gray-700"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          👤 Profile
                        </Link>
                        <button
                          onClick={() => {
                            handleLogout()
                            setUserMenuOpen(false)
                          }}
                          className="w-full text-left px-4 py-3 text-sm font-semibold hover:bg-pink-100 flex items-center gap-2 transition-colors text-gray-700"
                        >
                          <LogOut className="h-4 w-4" />
                          Logout
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t-2 border-pink-200 py-4 space-y-2 bg-white/95 backdrop-blur-sm">
            {navLinks.map((link) => {
              const Icon = link.icon
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex items-center gap-3 px-4 py-3 rounded-full hover:bg-pink-100 font-semibold transition-colors text-gray-700"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Icon className="h-5 w-5 text-purple-600" />
                  {link.label}
                </Link>
              )
            })}
            {user && (
              <button
                onClick={() => {
                  handleLogout()
                  setMobileMenuOpen(false)
                }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-full hover:bg-pink-100 text-left font-semibold transition-colors text-gray-700"
              >
                <LogOut className="h-5 w-5 text-purple-600" />
                Logout
              </button>
            )}
          </div>
        )}
      </div>
    </nav>
  )
}

