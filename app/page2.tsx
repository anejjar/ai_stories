'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import {
  BookOpen,
  Sparkles,
  Star,
  Heart,
  Crown,
  Zap,
  Shield,
  Infinity,
  Check,
  ArrowRight,
  Image as ImageIcon,
  FileText,
  Volume2,
  Palette,
  Moon,
  Wand2,
  BookMarked,
} from 'lucide-react'

export default function Home() {
  const router = useRouter()
  const { user, loading } = useAuth()
  const [hoveredFeature, setHoveredFeature] = useState<number | null>(null)

  useEffect(() => {
    if (!loading && user) {
      router.push('/library')
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-amber-50 via-rose-50 to-purple-50">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-rose-400 border-t-transparent"></div>
          <BookOpen className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-6 w-6 text-purple-400" />
        </div>
      </main>
    )
  }

  const handleGetStarted = () => {
    router.push('/signup')
  }

  const handleUpgrade = (tier: 'pro' | 'pro_max') => {
    router.push(`/signup?tier=${tier}`)
  }

  if (user) {
    return null
  }

  return (
    <main className="flex min-h-screen flex-col bg-[#fef7ed] relative overflow-hidden">
      {/* Hand-drawn style background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full opacity-[0.03]">
          <svg className="w-full h-full" viewBox="0 0 1200 800" preserveAspectRatio="none">
            <path d="M0,200 Q300,150 600,200 T1200,200 L1200,0 L0,0 Z" fill="#8b5cf6" />
            <path d="M0,400 Q400,350 800,400 T1200,400 L1200,200 L0,200 Z" fill="#ec4899" />
            <path d="M0,600 Q200,550 400,600 T1200,600 L1200,400 L0,400 Z" fill="#f59e0b" />
          </svg>
        </div>
      </div>

      {/* Floating story elements */}
      <div className="absolute top-20 left-5 text-5xl opacity-20 animate-bounce" style={{ animationDelay: '0s' }}>📖</div>
      <div className="absolute top-40 right-8 text-4xl opacity-15 animate-bounce" style={{ animationDelay: '1.2s' }}>✨</div>
      <div className="absolute bottom-32 left-12 text-6xl opacity-20 animate-bounce" style={{ animationDelay: '2.4s' }}>🌙</div>
      <div className="absolute bottom-48 right-16 text-5xl opacity-15 animate-bounce" style={{ animationDelay: '1.8s' }}>⭐</div>

      {/* Hero Section - Storybook Style */}
      <section className="relative z-10 pt-12 pb-8 px-4 md:px-8">
        <div className="max-w-5xl mx-auto">
          {/* Logo/Brand */}
          <div className="text-center mb-8">
            <div className="inline-block relative">
              <div className="absolute -inset-4 bg-gradient-to-r from-purple-200 via-pink-200 to-amber-200 rounded-full blur-xl opacity-50"></div>
              <h1 className="relative text-6xl md:text-7xl font-bold text-[#2d1b69] font-serif tracking-tight">
                Tiny<span className="text-[#ec4899]">Tales</span>
              </h1>
            </div>
            <p className="mt-3 text-lg text-[#6b5b7d] font-medium italic">
              Where your little one becomes the hero of their own story
            </p>
          </div>

          {/* Main CTA - Hand-drawn style */}
          <div className="text-center mb-12 space-y-6">
            <div className="inline-block relative">
              <div className="absolute -inset-2 bg-gradient-to-r from-purple-100 to-pink-100 rounded-2xl transform rotate-[-2deg]"></div>
              <Button
                onClick={handleGetStarted}
                size="lg"
                className="relative text-xl px-10 py-6 rounded-2xl bg-gradient-to-r from-[#8b5cf6] to-[#ec4899] hover:from-[#7c3aed] hover:to-[#db2777] text-white font-bold shadow-lg transform hover:scale-105 transition-all border-2 border-white"
              >
                <Sparkles className="h-5 w-5 mr-2" />
                Start Your First Story
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </div>
            <p className="text-sm text-[#6b5b7d] font-medium">
              ✨ One free story, no credit card needed
            </p>
          </div>

          {/* Story Preview Card - Asymmetric Design */}
          <div className="relative mb-16">
            <div className="absolute -inset-1 bg-gradient-to-r from-purple-300 to-pink-300 rounded-3xl blur opacity-30"></div>
            <Card className="relative bg-white/90 backdrop-blur-sm border-4 border-purple-200 rounded-3xl shadow-xl transform rotate-[-1deg] hover:rotate-0 transition-transform">
              <CardContent className="p-8 md:p-12">
                <div className="flex items-start gap-6">
                  <div className="flex-shrink-0">
                    <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center border-4 border-purple-200 transform rotate-6">
                      <BookOpen className="h-12 w-12 text-purple-600" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-[#2d1b69] mb-3 font-serif">
                      "Emma's Magical Forest Adventure"
                    </h3>
                    <p className="text-[#6b5b7d] leading-relaxed mb-4 italic">
                      Once upon a time, in a magical forest filled with talking animals and sparkling streams, 
                      there lived a brave little girl named Emma. She loved exploring and helping others...
                    </p>
                    <div className="flex items-center gap-4 text-sm text-[#8b5cf7] font-semibold">
                      <span className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        5 min read
                      </span>
                      <span className="flex items-center gap-1">
                        <Heart className="h-4 w-4 text-pink-400" />
                        Bedtime story
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features - Storybook Pages Style */}
      <section className="relative z-10 py-12 px-4 md:px-8 bg-white/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-[#2d1b69] font-serif mb-3">
              What Makes TinyTales Special
            </h2>
            <p className="text-lg text-[#6b5b7d] max-w-2xl mx-auto">
              Every story is crafted with love, featuring your child as the main character
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {[
              {
                icon: Wand2,
                title: 'AI Magic',
                description: 'Stories written by AI, personalized just for your child',
                color: 'from-purple-400 to-pink-400',
                emoji: '✨',
              },
              {
                icon: Heart,
                title: '100% Kid-Safe',
                description: 'Every story is carefully crafted to be wholesome and educational',
                color: 'from-pink-400 to-rose-400',
                emoji: '🛡️',
              },
              {
                icon: Moon,
                title: 'Perfect for Bedtime',
                description: 'Calming stories designed to help little ones drift off peacefully',
                color: 'from-blue-400 to-purple-400',
                emoji: '🌙',
              },
            ].map((feature, idx) => (
              <div
                key={idx}
                onMouseEnter={() => setHoveredFeature(idx)}
                onMouseLeave={() => setHoveredFeature(null)}
                className="relative group"
              >
                <div className={`absolute -inset-1 bg-gradient-to-r ${feature.color} rounded-2xl blur opacity-0 group-hover:opacity-30 transition-opacity`}></div>
                <Card className={`relative bg-white border-2 border-purple-100 rounded-2xl p-6 transform transition-all ${
                  hoveredFeature === idx ? 'scale-105 rotate-1' : 'rotate-[-1deg]'
                }`}>
                  <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 transform rotate-6`}>
                    <feature.icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-[#2d1b69] mb-2 font-serif">
                    {feature.emoji} {feature.title}
                  </h3>
                  <p className="text-[#6b5b7d] leading-relaxed">
                    {feature.description}
                  </p>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing - Hand-written Style */}
      <section className="relative z-10 py-16 px-4 md:px-8 bg-gradient-to-b from-white/50 to-[#fef7ed]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-[#2d1b69] font-serif mb-3">
              Choose Your Adventure
            </h2>
            <p className="text-lg text-[#6b5b7d]">
              Start free, upgrade when you're ready for more magic
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {/* PRO Card */}
            <div className="relative">
              <div className="absolute -inset-2 bg-gradient-to-r from-purple-200 to-pink-200 rounded-3xl blur-lg opacity-50"></div>
              <Card className="relative bg-white border-4 border-purple-200 rounded-3xl shadow-xl transform rotate-[-0.5deg] hover:rotate-0 transition-transform">
                <CardContent className="p-8">
                  <div className="text-center mb-6">
                    <div className="inline-block w-20 h-20 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center mb-4 transform rotate-6">
                      <Sparkles className="h-10 w-10 text-white" />
                    </div>
                    <h3 className="text-3xl font-bold text-[#2d1b69] font-serif mb-2">PRO</h3>
                    <div className="text-4xl font-bold text-[#8b5cf6] mb-1">$9.99</div>
                    <div className="text-sm text-[#6b5b7d]">per month</div>
                  </div>
                  <ul className="space-y-3 mb-6">
                    {[
                      'Unlimited story generation',
                      'Multiple story drafts',
                      'Rewrite & enhance tools',
                      '25+ themes & 10 templates',
                      'Text-to-speech audio',
                      'Ad-free experience',
                    ].map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-[#6b5b7d]">
                        <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    onClick={() => handleUpgrade('pro')}
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-6 rounded-xl"
                  >
                    Get PRO
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* PRO MAX Card - Featured */}
            <div className="relative">
              <div className="absolute -top-4 right-4 z-10">
                <Badge className="bg-gradient-to-r from-amber-400 to-orange-500 text-white font-bold px-4 py-2 rounded-full border-2 border-white shadow-lg">
                  <Crown className="h-4 w-4 mr-1 inline" />
                  Most Popular
                </Badge>
              </div>
              <div className="absolute -inset-2 bg-gradient-to-r from-amber-200 to-orange-200 rounded-3xl blur-lg opacity-60"></div>
              <Card className="relative bg-white border-4 border-amber-300 rounded-3xl shadow-2xl transform rotate-[0.5deg] hover:rotate-0 transition-transform">
                <CardContent className="p-8">
                  <div className="text-center mb-6">
                    <div className="inline-block w-20 h-20 rounded-full bg-gradient-to-br from-amber-400 via-orange-400 to-pink-400 flex items-center justify-center mb-4 transform rotate-[-6deg]">
                      <Crown className="h-10 w-10 text-white" />
                    </div>
                    <h3 className="text-3xl font-bold text-[#2d1b69] font-serif mb-2">PRO MAX</h3>
                    <div className="flex items-baseline justify-center gap-2 mb-1">
                      <div className="text-4xl font-bold text-[#f59e0b]">$19.99</div>
                      <Badge className="bg-green-500 text-white text-xs">Save 33%</Badge>
                    </div>
                    <div className="text-sm text-[#6b5b7d]">per month</div>
                  </div>
                  <ul className="space-y-3 mb-6">
                    {[
                      'Everything in PRO',
                      'AI-illustrated stories',
                      'Your child in the pictures',
                      'High-resolution images',
                      'PDF export for printing',
                      'Appearance customization',
                    ].map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-[#6b5b7d]">
                        <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className={idx === 0 ? 'font-bold text-[#2d1b69]' : ''}>{item}</span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    onClick={() => handleUpgrade('pro_max')}
                    className="w-full bg-gradient-to-r from-amber-500 via-orange-500 to-pink-500 hover:from-amber-600 hover:via-orange-600 hover:to-pink-600 text-white font-bold py-6 rounded-xl"
                  >
                    <Crown className="h-5 w-5 mr-2" />
                    Get PRO MAX
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Free Trial Highlight */}
          <div className="text-center">
            <div className="inline-block relative">
              <div className="absolute -inset-2 bg-gradient-to-r from-blue-100 to-purple-100 rounded-2xl blur opacity-50"></div>
              <Card className="relative bg-white/80 border-2 border-blue-200 rounded-2xl p-6 transform rotate-[-1deg]">
                <CardContent>
                  <div className="flex items-center justify-center gap-3 mb-3">
                    <Star className="h-6 w-6 text-yellow-400 fill-yellow-400" />
                    <h4 className="text-xl font-bold text-[#2d1b69] font-serif">Start with 1 Free Story</h4>
                    <Star className="h-6 w-6 text-yellow-400 fill-yellow-400" />
                  </div>
                  <p className="text-[#6b5b7d] mb-4">
                    No credit card required. Create your first personalized story right now!
                  </p>
                  <Button
                    onClick={handleGetStarted}
                    variant="outline"
                    className="border-2 border-purple-400 text-purple-600 hover:bg-purple-50 font-bold rounded-xl"
                  >
                    Try It Free
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials - Hand-written Style */}
      <section className="relative z-10 py-16 px-4 md:px-8 bg-white/30">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold text-[#2d1b69] font-serif text-center mb-12">
            What Parents Are Saying
          </h2>
          <div className="space-y-6">
            {[
              {
                name: 'Sarah M.',
                text: 'My daughter Emma absolutely loves seeing herself as the hero! Bedtime has become our favorite time together. The stories are so creative and she asks for a new one every night.',
                rating: 5,
              },
              {
                name: 'Michael T.',
                text: 'The PRO MAX illustrations are incredible. My son\'s face when he sees himself as a superhero in the storybook - priceless! Worth every penny.',
                rating: 5,
              },
              {
                name: 'Jessica L.',
                text: 'I love being able to generate multiple drafts and pick the perfect story. The "make it calmer" feature is a lifesaver for bedtime!',
                rating: 5,
              },
            ].map((testimonial, idx) => (
              <div key={idx} className="relative">
                <div className={`absolute -inset-1 bg-gradient-to-r ${
                  idx === 0 ? 'from-purple-200 to-pink-200' :
                  idx === 1 ? 'from-amber-200 to-orange-200' :
                  'from-blue-200 to-purple-200'
                } rounded-2xl blur opacity-30`}></div>
                <Card className={`relative bg-white border-2 ${
                  idx === 0 ? 'border-purple-200' :
                  idx === 1 ? 'border-amber-200' :
                  'border-blue-200'
                } rounded-2xl p-6 transform ${idx % 2 === 0 ? 'rotate-[-0.5deg]' : 'rotate-[0.5deg]'} hover:rotate-0 transition-transform`}>
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-300 to-pink-300 flex items-center justify-center text-white font-bold text-lg">
                        {testimonial.name[0]}
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="font-bold text-[#2d1b69]">{testimonial.name}</div>
                        <div className="flex gap-1">
                          {[...Array(testimonial.rating)].map((_, i) => (
                            <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          ))}
                        </div>
                      </div>
                      <p className="text-[#6b5b7d] leading-relaxed italic">"{testimonial.text}"</p>
                    </div>
                  </div>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative z-10 py-20 px-4 md:px-8 bg-gradient-to-b from-[#fef7ed] to-purple-50">
        <div className="max-w-3xl mx-auto text-center">
          <div className="relative inline-block mb-8">
            <div className="absolute -inset-4 bg-gradient-to-r from-purple-300 to-pink-300 rounded-full blur-2xl opacity-40"></div>
            <BookOpen className="relative h-24 w-24 text-purple-600 mx-auto" />
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-[#2d1b69] font-serif mb-4">
            Ready to Create Magic?
          </h2>
          <p className="text-xl text-[#6b5b7d] mb-8 max-w-2xl mx-auto">
            Join thousands of families creating unforgettable bedtime memories
          </p>
          <Button
            onClick={handleGetStarted}
            size="lg"
            className="text-xl px-12 py-7 rounded-2xl bg-gradient-to-r from-[#8b5cf6] to-[#ec4899] hover:from-[#7c3aed] hover:to-[#db2777] text-white font-bold shadow-xl transform hover:scale-105 transition-all border-2 border-white"
          >
            <Sparkles className="h-6 w-6 mr-2" />
            Start Your First Story
            <ArrowRight className="h-6 w-6 ml-2" />
          </Button>
          <div className="flex items-center justify-center gap-6 mt-8 text-sm text-[#6b5b7d] font-medium">
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-500" />
              <span>No credit card</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-500" />
              <span>Cancel anytime</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-500" />
              <span>100% kid-safe</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 py-8 px-4 bg-[#2d1b69] text-white">
        <div className="max-w-5xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <BookOpen className="h-6 w-6" />
            <span className="text-2xl font-bold font-serif">TinyTales</span>
          </div>
          <p className="text-purple-200 text-sm mb-4">
            Creating magical bedtime memories, one story at a time
          </p>
          <div className="flex items-center justify-center gap-6 text-sm text-purple-200">
            <Link href="/signup" className="hover:text-white transition-colors">Sign Up</Link>
            <Link href="/login" className="hover:text-white transition-colors">Sign In</Link>
          </div>
          <div className="mt-6 pt-6 border-t border-purple-800 text-xs text-purple-300">
            © 2024 TinyTales. Made with 💜 for families everywhere.
          </div>
        </div>
      </footer>
    </main>
  )
}
