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
  HelpCircle,
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
      window.location.href = '/'
    }
  }

  const mainNavLinks = [
    { href: '/library', label: 'Library', icon: Library },
    { href: '/discover', label: 'Discover', icon: Compass },
    { href: '/create', label: 'Create', icon: Plus },
  ]

  const secondaryNavLinks = [
    { href: '/achievements', label: 'Achievements', icon: Trophy },
    { href: '/dashboard', label: 'Dashboard', icon: BarChart3 },
    { href: '/profile', label: 'Profile', icon: User },
    { href: '/settings/notifications', label: 'Notifications', icon: Bell },
    { href: '/tickets', label: 'Help & Support', icon: HelpCircle },
  ]

  const isActive = (href: string) => {
    if (href === '/library') {
      return pathname === '/library' || pathname === '/'
    }
    return pathname?.startsWith(href)
  }

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100 selection:bg-blue-100">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="h-12 w-12 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-100 transition-transform group-hover:scale-110">
              <BookOpen className="h-6 w-6 text-white" />
            </div>
            <span className="font-extrabold text-2xl text-gray-900 tracking-tight">
              AI Stories
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-4">
            {mainNavLinks.map((link) => {
              const Icon = link.icon
              const active = isActive(link.href)
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-2 px-6 py-2.5 rounded-2xl text-sm font-bold transition-all ${
                    active
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-100'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-blue-600'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{link.label}</span>
                </Link>
              )
            })}

            {/* User Menu */}
            {user && (
              <div className="relative ml-4" data-user-menu>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 p-1.5 rounded-2xl hover:bg-gray-50 transition-colors border border-gray-100"
                >
                  {(user as any).photoURL ? (
                    <img
                      src={(user as any).photoURL}
                      alt={(user as any).displayName || 'User'}
                      className="h-9 w-9 rounded-xl object-cover"
                    />
                  ) : (
                    <div className="h-9 w-9 rounded-xl bg-blue-100 flex items-center justify-center">
                      <User className="h-5 w-5 text-blue-600" />
                    </div>
                  )}
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-3 w-64 bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                    <div className="p-3">
                      <div className="px-4 py-3 mb-2 bg-gray-50 rounded-2xl">
                        <p className="text-sm font-bold text-gray-900 truncate">
                          {(user as any).displayName || 'User'}
                        </p>
                        <p className="text-xs text-gray-500 truncate font-medium">{user.email}</p>
                      </div>
                      
                      <div className="px-3 py-2">
                        <StreakCounter compact />
                      </div>
                      
                      <div className="my-2 border-t border-gray-50" />
                      
                      {secondaryNavLinks.map((link) => (
                        <Link
                          key={link.href}
                          href={link.href}
                          className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-bold text-gray-600 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          <link.icon className="h-4 w-4" />
                          {link.label}
                        </Link>
                      ))}
                      
                      <div className="my-2 border-t border-gray-50" />
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-bold text-red-500 hover:bg-red-50 transition-colors"
                      >
                        <LogOut className="h-4 w-4" />
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-3 rounded-2xl hover:bg-gray-50 transition-colors text-gray-600"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-50 bg-white p-4 space-y-2 animate-in slide-in-from-top duration-300">
          {mainNavLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 px-6 py-4 rounded-2xl font-bold transition-all ${
                isActive(link.href)
                  ? 'bg-blue-600 text-white shadow-xl shadow-blue-100'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
              onClick={() => setMobileMenuOpen(false)}
            >
              <link.icon className="h-5 w-5" />
              {link.label}
            </Link>
          ))}
          {user && (
            <div className="pt-4 space-y-2 border-t border-gray-50 mt-4">
              <div className="px-6 py-2">
                <StreakCounter compact />
              </div>
              {secondaryNavLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex items-center gap-3 px-6 py-4 rounded-2xl font-bold text-gray-600 hover:bg-gray-50"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <link.icon className="h-5 w-5" />
                  {link.label}
                </Link>
              ))}
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-6 py-4 rounded-2xl font-bold text-red-500 hover:bg-red-50"
              >
                <LogOut className="h-5 w-5" />
                Logout
              </button>
            </div>
          )}
        </div>
      )}
    </nav>
  )
}
