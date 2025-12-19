'use client'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Crown, BookOpen, Sparkles, Check } from 'lucide-react'
import Link from 'next/link'

interface FamilyPlanUpsellProps {
  title?: string
  description?: string
  features?: string[]
  ctaText?: string
  compact?: boolean
}

export function FamilyPlanUpsell({
  title = "Upgrade to FAMILY PLAN",
  description = "Create beautiful illustrated story books with your family!",
  features = [
    "Up to 3 Child Profiles",
    "2 AI-illustrated stories/day",
    "High-res picture books",
    "Child appearance customization",
    "PDF export for printing",
    "Advanced art styles"
  ],
  ctaText = "Upgrade to FAMILY PLAN",
  compact = false
}: FamilyPlanUpsellProps) {

  if (compact) {
    return (
      <div className="relative p-6 rounded-2xl border-4 border-yellow-300 bg-gradient-to-br from-yellow-50 to-orange-50 overflow-hidden shadow-lg">
        <div className="absolute top-2 right-2">
          <Crown className="h-6 w-6 text-yellow-500 animate-bounce" />
        </div>
        <div className="flex items-start gap-4">
          <div className="text-4xl">👨‍👩‍👧‍👦</div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-bold text-lg text-gray-800">{title}</h3>
              <Badge className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white font-bold border-2 border-yellow-500 rounded-full px-3">
                FAMILY PLAN 👑
              </Badge>
            </div>
            <p className="text-sm text-gray-700 mb-3 font-semibold">
              {description}
            </p>
            <Link href="/pricing">
              <Button
                type="button"
                variant="outline"
                className="rounded-full border-2 border-yellow-400 bg-white/80 font-bold hover:bg-yellow-50 hover:text-yellow-700 transition-colors"
              >
                <Crown className="h-4 w-4 mr-2" />
                {ctaText} 🚀
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative p-8 rounded-3xl border-4 border-yellow-300 bg-gradient-to-br from-yellow-50 via-orange-50 to-pink-50 overflow-hidden shadow-2xl">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 right-10 text-6xl opacity-10 animate-float">✨</div>
        <div className="absolute bottom-10 left-10 text-6xl opacity-10 animate-float" style={{ animationDelay: '1s' }}>📖</div>
        <div className="absolute top-1/2 left-1/4 text-5xl opacity-10 animate-float" style={{ animationDelay: '0.5s' }}>🎨</div>
      </div>

      {/* Crown badge */}
      <div className="absolute top-4 right-4">
        <div className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white rounded-full p-3 shadow-lg border-2 border-yellow-500 animate-pulse">
          <Crown className="h-6 w-6" />
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="text-5xl">👨‍👩‍👧‍👦</div>
          <div>
            <h2 className="text-3xl font-bold text-gray-800 mb-1">
              {title}
            </h2>
            <Badge className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white font-bold border-2 border-yellow-500 rounded-full px-4 py-1 text-sm">
              FAMILY PLAN EXCLUSIVE 👑
            </Badge>
          </div>
        </div>

        <p className="text-lg text-gray-700 mb-6 font-semibold">
          {description}
        </p>

        {/* Features list */}
        <div className="grid md:grid-cols-2 gap-3 mb-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className="flex items-center gap-2 bg-white/70 backdrop-blur-sm rounded-xl p-3 border-2 border-yellow-200 shadow-sm"
            >
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-r from-green-400 to-emerald-400 flex items-center justify-center">
                <Check className="h-4 w-4 text-white" />
              </div>
              <span className="text-sm font-semibold text-gray-700">{feature}</span>
            </div>
          ))}
        </div>

        {/* CTA Button */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Link href="/pricing" className="flex-1">
            <Button
              size="lg"
              className="w-full rounded-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-bold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
            >
              <Crown className="h-5 w-5 mr-2" />
              {ctaText} 🚀
            </Button>
          </Link>
          <Link href="/pricing">
            <Button
              size="lg"
              variant="outline"
              className="rounded-full border-2 border-yellow-400 hover:bg-yellow-50 font-bold"
            >
              <Sparkles className="h-5 w-5 mr-2" />
              Compare Plans
            </Button>
          </Link>
        </div>

        {/* Social proof */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-600 italic">
            ✨ Join thousands of families creating magical memories together!
          </p>
        </div>
      </div>
    </div>
  )
}
