'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
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
  Trophy,
  BarChart3,
  Sparkles,
  Bell,
  Compass,
} from 'lucide-react'
import { StreakCounter } from '@/components/achievements/streak-counter'

export function MainNav() {
  const router = useRouter()
  const pathname = usePathname()
  const { user, userProfile } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false)
  }, [pathname])

  // Close user menu when clicking outside
  useEffect(() => {
    if (!userMenuOpen) return

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (!target.closest('[data-user-menu]')) {
        setUserMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [userMenuOpen])

  const handleLogout = async () => {
    const { error } = await signOutUser()
    if (!error) {
      // Force full page reload to clear all state and redirect to home
      window.location.href = '/'
    }
  }

  // Only show essential links in header
  const mainNavLinks = [
    { href: '/library', label: 'Library', icon: Library },
    { href: '/discover', label: 'Discover', icon: Compass },
    { href: '/create', label: 'Create', icon: Plus },
  ]

  // Secondary links go in user menu
  const secondaryNavLinks = [
    { href: '/achievements', label: 'Achievements', icon: Trophy },
    { href: '/dashboard', label: 'Dashboard', icon: BarChart3 },
    { href: '/profile', label: 'Profile', icon: User },
    // Voice Settings disabled until core features are production ready
    // { href: '/settings/voice', label: 'Voice Settings', icon: Mic },
    { href: '/settings/notifications', label: 'Notifications', icon: Bell },
  ]

  const isActive = (href: string) => {
    if (href === '/library') {
      return pathname === '/library' || pathname === '/'
    }
    return pathname?.startsWith(href)
  }

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200/50 shadow-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link href="/library" className="flex items-center gap-2 group">
            <div className="relative">
              <div className="h-9 w-9 lg:h-10 lg:w-10 rounded-xl bg-gradient-to-br from-pink-500 via-purple-500 to-indigo-500 flex items-center justify-center shadow-lg group-hover:shadow-xl group-hover:scale-105 transition-all duration-300">
                <BookOpen className="h-5 w-5 text-white" />
              </div>
              <div className="absolute -top-1 -right-1">
                <Sparkles className="h-3 w-3 text-yellow-400 animate-pulse" />
              </div>
            </div>
            <span className="font-bold text-xl lg:text-2xl bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
              AI Stories
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-2">
            {mainNavLinks.map((link) => {
              const Icon = link.icon
              const active = isActive(link.href)
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    active
                      ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-md'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-purple-600'
                  }`}
                >
                  <Icon className={`h-4 w-4 ${active ? 'text-white' : 'text-gray-600'}`} />
                  <span>{link.label}</span>
                </Link>
              )
            })}

            {/* User Menu */}
            {user && (
              <div className="relative ml-2" data-user-menu>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 h-9 px-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt={user.displayName || 'User'}
                      className="h-8 w-8 rounded-full ring-2 ring-purple-200"
                    />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center">
                      <User className="h-4 w-4 text-white" />
                    </div>
                  )}
                </Button>

                {userMenuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setUserMenuOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-200 z-20 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                      <div className="p-2">
                        <div className="px-3 py-2 mb-2 border-b border-gray-100">
                          <p className="text-sm font-semibold text-gray-900">
                            {user.displayName || 'User'}
                          </p>
                          <p className="text-xs text-gray-500 truncate">{user.email}</p>
                        </div>
                        
                        {/* Streak Counter in Menu */}
                        <div className="px-3 py-2 mb-2">
                          <StreakCounter compact />
                        </div>
                        
                        <div className="my-2 border-t border-gray-100" />
                        
                        {secondaryNavLinks.map((link) => {
                          const Icon = link.icon
                          const active = isActive(link.href)
                          return (
                            <Link
                              key={link.href}
                              href={link.href}
                              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                                active
                                  ? 'bg-purple-50 text-purple-700'
                                  : 'text-gray-700 hover:bg-gray-100'
                              }`}
                              onClick={() => setUserMenuOpen(false)}
                            >
                              <Icon className="h-4 w-4" />
                              {link.label}
                            </Link>
                          )
                        })}
                        
                        <div className="my-2 border-t border-gray-100" />
                        <button
                          onClick={() => {
                            handleLogout()
                            setUserMenuOpen(false)
                          }}
                          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
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
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6 text-gray-700" />
            ) : (
              <Menu className="h-6 w-6 text-gray-700" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 bg-white animate-in slide-in-from-top duration-200">
            <div className="px-4 py-3 space-y-1">
              {mainNavLinks.map((link) => {
                const Icon = link.icon
                const active = isActive(link.href)
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${
                      active
                        ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Icon className={`h-5 w-5 ${active ? 'text-white' : 'text-gray-600'}`} />
                    {link.label}
                  </Link>
                )
              })}
              
              {user && (
                <>
                  <div className="my-2 border-t border-gray-200" />
                  
                  {/* Streak Counter */}
                  <div className="px-4 py-2">
                    <StreakCounter compact />
                  </div>
                  
                  <div className="my-2 border-t border-gray-200" />
                  
                  {/* User Info */}
                  <div className="px-4 py-2">
                    <div className="flex items-center gap-3 px-2 py-2">
                      {user.photoURL ? (
                        <img
                          src={user.photoURL}
                          alt={user.displayName || 'User'}
                          className="h-8 w-8 rounded-full"
                        />
                      ) : (
                        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center">
                          <User className="h-4 w-4 text-white" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">
                          {user.displayName || 'User'}
                        </p>
                        <p className="text-xs text-gray-500 truncate">{user.email}</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Secondary Links */}
                  {secondaryNavLinks.map((link) => {
                    const Icon = link.icon
                    const active = isActive(link.href)
                    return (
                      <Link
                        key={link.href}
                        href={link.href}
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${
                          active
                            ? 'bg-purple-50 text-purple-700'
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <Icon className="h-5 w-5" />
                        {link.label}
                      </Link>
                    )
                  })}
                  
                  <div className="my-2 border-t border-gray-200" />
                  <button
                    onClick={() => {
                      handleLogout()
                      setMobileMenuOpen(false)
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left font-medium text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="h-5 w-5" />
                    Logout
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

